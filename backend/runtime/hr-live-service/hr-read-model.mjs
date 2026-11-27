import crypto from 'node:crypto';
import {gzipSync, gunzipSync} from 'node:zlib';

// A recoverable server read model, never an HR writer or command authority.
// All paths are beneath an ungranted Firestore subcollection (Admin SDK only).
export const HR_READ_MODEL_SCHEMA='cxorbia.hr-read-model.v1';
const MAX_RAW_BYTES=32*1024*1024,MAX_PACKED_BYTES=16*1024*1024;
export const HR_READ_MODEL_CHUNK_BYTES=240*1024;
const MAX_CHUNKS=Math.ceil(MAX_PACKED_BYTES/HR_READ_MODEL_CHUNK_BYTES);
const HASH=/^[a-f0-9]{64}$/;
const ID=/^[A-Za-z0-9_-]{1,200}$/;
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const fail=code=>{throw Error('PERSISTENCE_FAILURE:HR_READ_MODEL_'+code);};
const sameScope=(a,b)=>a?.tenantId===b?.tenantId&&a?.projectId===b?.projectId;
const integer=x=>Number.isSafeInteger(x)&&x>=0;

function identity(key){
  if(!ID.test(key?.tenantId||'')||!ID.test(key?.projectId||'')||
      !HASH.test(key?.bindingFingerprint||'')||!HASH.test(key?.readerFingerprint||''))fail('KEY');
  return {tenantId:key.tenantId,projectId:key.projectId,
    bindingFingerprint:key.bindingFingerprint,readerFingerprint:key.readerFingerprint};
}
function pathFor(key){
  const k=identity(key),id=sha(JSON.stringify(k));
  return `tenants/${k.tenantId}/projects/${k.projectId}/hrReadModels/${id}`;
}
function checkPointer(p,key){
  if(p?.schemaVersion!==HR_READ_MODEL_SCHEMA||!sameScope(p,key)||
      p.bindingFingerprint!==key.bindingFingerprint||p.readerFingerprint!==key.readerFingerprint||
      !HASH.test(p.revision||'')||!HASH.test(p.generation||'')||
      !integer(p.sourceReadAt)||!integer(p.sourceReadStartedAt)||p.sourceReadStartedAt>p.sourceReadAt)
    fail('POINTER');
  return p;
}
function newer(p,observed){
  if(!p)return false;
  if(p.sourceReadStartedAt>observed.sourceReadStartedAt)return true;
  if(p.sourceReadStartedAt===observed.sourceReadStartedAt&&(p.revision!==observed.revision||
      (p.sourceBindingFingerprint||p.bindingFingerprint)!==observed.sourceBindingFingerprint))
    fail('CONCURRENT_REVISION');
  return p.sourceReadStartedAt===observed.sourceReadStartedAt&&p.sourceReadAt>observed.sourceReadAt;
}
function entries(value,label){
  if(!Array.isArray(value)||value.some(x=>!Array.isArray(x)||x.length!==2||typeof x[0]!=='string')||
      new Set(value.map(x=>x[0])).size!==value.length)fail(label);
  return value;
}
function checkBody(body,key,revision){
  if(body?.schemaVersion!==HR_READ_MODEL_SCHEMA||!sameScope(body,key)||
      body.bindingFingerprint!==key.bindingFingerprint||body.readerFingerprint!==key.readerFingerprint||
      body.revision!==revision||!sameScope(body.snapshot,key)||
      body.snapshot?.sourceSafe!==true||body.snapshot?.imported===true||body.snapshot?.production===true||
      !Array.isArray(body.snapshot?.visits)||
      !Array.isArray(body.snapshot?.periods)||(!body.snapshot.periods.length&&!body.snapshot.readScope?.countryPeriods?.length)||
      !HASH.test(body.bindingProof?.bindingFingerprint||'')||
      (body.bindingProof.localBindingFingerprint||body.bindingProof.bindingFingerprint)!==key.bindingFingerprint)fail('BODY_SCOPE');
  entries(body.identityEntries,'IDENTITY');entries(body.privateReviewEntries,'PRIVATE_REVIEW');
  return body;
}

export function hrReadModelKey({scope,proof},readerFingerprint){
  return identity({...scope,bindingFingerprint:proof?.localBindingFingerprint||proof?.bindingFingerprint,readerFingerprint});
}

export function createDurableHrReadModel({db,now=Date.now,maxAgeMs=24*60*60*1000}={}){
  if(!db?.doc||!db?.batch||!db?.runTransaction)fail('DATABASE');
  if(!integer(maxAgeMs)||maxAgeMs<5000||maxAgeMs>7*24*60*60*1000)fail('MAX_AGE');

  async function publish(key,current){
    key=identity(key);
    const revision=current?.revision,sourceReadAt=current?.loadedAt,
      sourceReadStartedAt=current?.sourceReadStartedAt;
    if(!HASH.test(revision||'')||!integer(sourceReadAt)||!integer(sourceReadStartedAt)||
        sourceReadStartedAt>sourceReadAt||sourceReadAt>now()+60000||
        current?.origin!=='runtime_excel_online_original'||current?.externalReadCurrent===false)
      fail('EXTERNAL_OBSERVATION_REQUIRED');
    const body=checkBody({schemaVersion:HR_READ_MODEL_SCHEMA,...key,revision,
      snapshot:current.snapshot,bindingProof:current.bindingProof,discoveryContexts:current.discoveryContexts||{},
      identityEntries:[...(current.identity||new Map()).entries()],
      privateReviewEntries:[...(current.privateReviewNotes||new Map()).entries()]},key,revision);
    const sourceBindingFingerprint=current.bindingProof.bindingFingerprint;
    const observation={revision,sourceReadAt,sourceReadStartedAt,sourceBindingFingerprint};
    const sameContent=p=>p?.revision===revision&&(p.sourceBindingFingerprint||p.bindingFingerprint)===sourceBindingFingerprint;
    const pointerRef=db.doc(pathFor(key));
    const priorSnap=await pointerRef.get(),prior=priorSnap.exists?checkPointer(priorSnap.data(),key):null;
    if(newer(prior,observation))return {published:false,reason:'newer_observation_preserved',revision:prior.revision};

    // The stable revision owns immutable content. A new successful read of
    // unchanged content updates only observation metadata, avoiding rewrites.
    if(sameContent(prior)){
      if(prior.sourceReadStartedAt===sourceReadStartedAt&&prior.sourceReadAt===sourceReadAt)
        return {published:false,reused:true,readModelPresent:true,reason:'already_persisted',revision,generation:prior.generation,sourceReadAt};
      const reused=await db.runTransaction(async tx=>{
        const snap=await tx.get(pointerRef),p=snap.exists?checkPointer(snap.data(),key):null;
        if(newer(p,observation))return {published:false,reason:'newer_observation_preserved',revision:p.revision};
        if(!sameContent(p))return null;
        tx.update(pointerRef,{sourceReadAt,sourceReadStartedAt,updatedAt:now()});
        return {published:true,reused:true,revision,generation:p.generation,sourceReadAt};
      });
      if(reused)return reused;
    }

    const raw=Buffer.from(JSON.stringify(body));
    if(raw.length>MAX_RAW_BYTES)fail('PAYLOAD_TOO_LARGE');
    const packed=gzipSync(raw,{level:6});
    if(packed.length>MAX_PACKED_BYTES)fail('COMPRESSED_PAYLOAD_TOO_LARGE');
    const generation=sha(revision+'|'+sourceReadAt+'|'+crypto.randomUUID());
    const versionRef=pointerRef.collection('versions').doc(generation);
    const chunks=[];
    for(let offset=0;offset<packed.length;offset+=HR_READ_MODEL_CHUNK_BYTES)
      chunks.push(packed.subarray(offset,offset+HR_READ_MODEL_CHUNK_BYTES));
    const manifest={schemaVersion:HR_READ_MODEL_SCHEMA,...key,revision,generation,
      compression:'gzip',rawBytes:raw.length,compressedBytes:packed.length,
      rawSha256:sha(raw),compressedSha256:sha(packed),chunkCount:chunks.length,
      chunkSha256:chunks.map(sha),createdAt:now()};
    // Each write is below 250 KiB; each batch below 2 MiB. No document grows
    // with the number of visits. Incomplete generations are never pointed to.
    for(let first=0;first<chunks.length;first+=8){
      const batch=db.batch();
      for(let i=first;i<Math.min(first+8,chunks.length);i++)
        batch.create(versionRef.collection('chunks').doc(String(i).padStart(4,'0')),
          {schemaVersion:HR_READ_MODEL_SCHEMA,index:i,sha256:manifest.chunkSha256[i],bytes:chunks[i]});
      await batch.commit();
    }
    return db.runTransaction(async tx=>{
      const snap=await tx.get(pointerRef),p=snap.exists?checkPointer(snap.data(),key):null;
      if(newer(p,observation))return {published:false,reason:'newer_observation_preserved',revision:p.revision};
      if(sameContent(p)){
        tx.update(pointerRef,{sourceReadAt,sourceReadStartedAt,updatedAt:now()});
        return {published:true,reused:true,revision,generation:p.generation,sourceReadAt};
      }
      tx.create(versionRef,manifest);
      tx.set(pointerRef,{schemaVersion:HR_READ_MODEL_SCHEMA,...key,...observation,generation,updatedAt:now()});
      return {published:true,reused:false,revision,generation,sourceReadAt,chunkCount:chunks.length};
    });
  }

  async function read(key){
    key=identity(key);
    const pointerRef=db.doc(pathFor(key)),pointerSnap=await pointerRef.get();
    if(!pointerSnap.exists)return null;
    const pointer=checkPointer(pointerSnap.data(),key),age=now()-pointer.sourceReadAt;
    if(age<0||age>maxAgeMs)return null;
    const versionRef=pointerRef.collection('versions').doc(pointer.generation);
    const manifestSnap=await versionRef.get(),m=manifestSnap.data();
    if(!manifestSnap.exists||m?.schemaVersion!==HR_READ_MODEL_SCHEMA||!sameScope(m,key)||
       m.bindingFingerprint!==key.bindingFingerprint||m.readerFingerprint!==key.readerFingerprint||
       m.revision!==pointer.revision||m.generation!==pointer.generation||m.compression!=='gzip'||
       !integer(m.chunkCount)||m.chunkCount<1||m.chunkCount>MAX_CHUNKS||
       !integer(m.rawBytes)||m.rawBytes<1||m.rawBytes>MAX_RAW_BYTES||
       !integer(m.compressedBytes)||m.compressedBytes<1||m.compressedBytes>MAX_PACKED_BYTES||
       !HASH.test(m.rawSha256||'')||!HASH.test(m.compressedSha256||'')||
       !Array.isArray(m.chunkSha256)||m.chunkSha256.length!==m.chunkCount||m.chunkSha256.some(x=>!HASH.test(x)))
      fail('MANIFEST');
    const chunks=[];
    for(let first=0;first<m.chunkCount;first+=8){
      const rows=await Promise.all(Array.from({length:Math.min(8,m.chunkCount-first)},(_,j)=>
        versionRef.collection('chunks').doc(String(first+j).padStart(4,'0')).get()));
      for(let j=0;j<rows.length;j++){
        const i=first+j,c=rows[j].data(),bytes=c?.bytes;
        if(!rows[j].exists||c?.schemaVersion!==HR_READ_MODEL_SCHEMA||c?.index!==i||
           !(Buffer.isBuffer(bytes)||bytes instanceof Uint8Array)||!bytes.length||
           bytes.length>HR_READ_MODEL_CHUNK_BYTES||c.sha256!==m.chunkSha256[i]||sha(bytes)!==m.chunkSha256[i])
          fail('CHUNK');
        chunks.push(Buffer.from(bytes));
      }
    }
    const packed=Buffer.concat(chunks);
    if(packed.length!==m.compressedBytes||sha(packed)!==m.compressedSha256)fail('COMPRESSED_DIGEST');
    let raw,body;
    try{raw=gunzipSync(packed,{maxOutputLength:MAX_RAW_BYTES});body=JSON.parse(raw.toString('utf8'));}
    catch{fail('DECODE');}
    if(raw.length!==m.rawBytes||sha(raw)!==m.rawSha256)fail('BODY_DIGEST');
    checkBody(body,key,pointer.revision);
    if(body.bindingProof.bindingFingerprint!==(pointer.sourceBindingFingerprint||pointer.bindingFingerprint))fail('SOURCE_BINDING');
    // Observation time comes from a successful external read, not recovery.
    return {snapshot:body.snapshot,revision:body.revision,bindingProof:body.bindingProof,discoveryContexts:body.discoveryContexts||{},
      identity:new Map(body.identityEntries),privateReviewNotes:new Map(body.privateReviewEntries),
      loadedAt:pointer.sourceReadAt,sourceReadStartedAt:pointer.sourceReadStartedAt,
      origin:'durable_internal_snapshot',externalReadCurrent:false,
      durableReadModel:{schemaVersion:HR_READ_MODEL_SCHEMA,generation:pointer.generation,
        readerFingerprint:key.readerFingerprint,bindingFingerprint:key.bindingFingerprint,recoveredAt:now()}};
  }
  return {publish,read};
}

// Confirmed presentation history is deliberately separate from the fresh
// command snapshot. It has no freshness TTL and never grants write authority.
export const HR_HISTORY_SCHEMA='cxorbia.hr-confirmed-history.v1';
function historyScope(scope){
 if(!ID.test(scope?.tenantId||'')||!ID.test(scope?.projectId||''))fail('HISTORY_SCOPE');
 return {tenantId:scope.tenantId,projectId:scope.projectId};
}
const countryOf=v=>String(v.country||v.countryCode||v.pais||'').toUpperCase();
const periodOf=v=>String(v.periodId||v.measurementPeriodId||'');
const visitId=v=>String(v.visitId||v.id||'');
// This document coordinates the existing Excel synchronizer across Cloud Run
// instances. It stores timing and ownership only. Snapshot authenticity, exact
// mapping, age and private projection are checked by the durable reader.
function syncRef(db,scope){
  const {tenantId,projectId}=historyScope(scope);
  return db.doc(`tenants/${tenantId}/projects/${projectId}/hrReadModels/automatic_sync_v1`);
}

export async function invalidateSharedHrSync(db,scope,now=Date.now){
  const ref=syncRef(db,scope);
  await db.runTransaction(async tx=>{
    const snap=await tx.get(ref),state=snap.exists?snap.data():{};
    tx.set(ref,{...state,epoch:(state.epoch||0)+1,invalidatedAt:now(),retryAfter:0});
  });
}

export async function readSharedHrProjection({db,scope,bindingKey,read,refresh,poll=false,internalOnly=false,
  now=Date.now,delay=ms=>new Promise(resolve=>setTimeout(resolve,ms))}){
  if(!HASH.test(bindingKey||''))fail('SHARED_BINDING');
  const ref=syncRef(db,scope),owner=crypto.randomUUID(),interval=300000,leaseMs=120000;
  const deadline=now()+60000;
  let saved=await read();

  async function admission(){
    return db.runTransaction(async tx=>{
      const snap=await tx.get(ref),state=snap.exists?snap.data():{},at=now(),epoch=state.epoch||0;
      const sameReader=state.bindingKey===bindingKey;
      // The saved read may precede a different instance's commit. Re-read the
      // pointer before returning anything that its coordinator already superseded.
      if(sameReader&&!readAgain&&state.confirmedAt>Number(saved?.loadedAt||0))return 'read_again';
      const afterWrite=!state.invalidatedAt||
        (sameReader&&state.confirmedEpoch===epoch&&saved?.revision===state.revision&&saved?.loadedAt===state.confirmedAt);
      const age=at-Number(saved?.loadedAt);
      if(sameReader&&saved&&state.confirmedAt>saved.loadedAt)fail('SHARED_POINTER_ROLLBACK');
      if(internalOnly){
        if(saved&&afterWrite)return 'saved';
        if(state.owner&&state.leaseUntil>at)return 'wait';
        fail('INTERNAL_PROJECTION_UNAVAILABLE');
      }
      if(saved&&afterWrite&&(!poll||(age>=0&&age<interval)))return 'saved';
      if(state.owner&&state.leaseUntil>at)return 'wait';
      // I3: deterministic source/auth failures do not become retryable merely
      // because the 30-second transport backoff expired. The quarantine belongs
      // to the exact reader/binding, not the tab, worker or ordinary HR epoch.
      if(state.quarantine?.bindingKey===bindingKey){
        const code=state.quarantine.code;
        if(typeof code!=='string'||!/^(AUTH_FAILURE|MAPPING_FAILURE):[A-Z0-9_]+$/.test(code))
          fail('SHARED_QUARANTINE_INVALID');
        throw Error(code);
      }
      if(sameReader&&state.retryAfter>at){
        if(state.failureClass&&state.failureClass!=='PROVIDER_FAILURE')fail('SHARED_REFRESH_VALIDATION_FAILED');
        return 'backoff';
      }
      tx.set(ref,{...state,owner,bindingKey,epoch,leaseUntil:at+leaseMs,leaseEpoch:epoch,
        confirmedAt:sameReader?(state.confirmedAt||0):0,confirmedEpoch:sameReader?(state.confirmedEpoch??-1):-1});
      return 'acquired';
    });
  }

  async function finish(current,failureClass=null,deterministicCode=null){
    return db.runTransaction(async tx=>{
      const s=await tx.get(ref),state=s.data();
      if(state?.owner!==owner||state.epoch!==state.leaseEpoch){
        if(state?.owner===owner)tx.update(ref,{owner:null,leaseUntil:0});
        return false;
      }
      const complete={owner:null,leaseUntil:0,retryAfter:current?0:now()+30000,failureClass};
      if(deterministicCode)complete.quarantine={bindingKey,code:deterministicCode,recordedAt:now()};
      // A successful read with a different exact binding can supersede the old
      // quarantine. A transport failure, epoch invalidation or cold start cannot.
      if(current)Object.assign(complete,{revision:current.revision,confirmedAt:current.loadedAt,confirmedEpoch:state.epoch,quarantine:null});
      tx.update(ref,complete);return true;
    });
  }
  let readAgain=false;
  for(;;){
    const outcome=await admission();
    if(outcome==='saved')return saved;
    if(outcome==='read_again'){
      saved=await read();readAgain=true;continue;
    }
    if(outcome==='backoff'||(outcome==='wait'&&now()>=deadline)){
      if(saved){
        const latest=await read();
        if(latest)return {...latest,externalReadCurrent:false,sharedRefreshFailed:outcome==='backoff',sharedRefreshPending:outcome==='wait'};
      }
      fail(outcome==='wait'?'SHARED_REFRESH_PENDING':'SHARED_REFRESH_BACKOFF');
    }
    if(outcome==='acquired')break;
    // Read only the small lease while another process is updating. It will
    // publish the complete checked projection before releasing its lease.
    do{
      await delay(400);
      const s=await ref.get(),state=s.data();
      if(!state?.owner||state.leaseUntil<=now()||now()>=deadline)break;
    }while(true);
    saved=await read();readAgain=false;
  }
  // Provider reads may outlast a single lease. A dead worker eventually loses
  // it, and its completion can never release the lease of a later worker.
  const renewal=setInterval(()=>db.runTransaction(async tx=>{
    const snap=await tx.get(ref),state=snap.data();
    if(state?.owner===owner)tx.update(ref,{leaseUntil:now()+leaseMs});
  }).catch(()=>{}),leaseMs/3);
  renewal.unref?.();
  try{
    const current=await refresh();
    if(!await finish(current))fail('SHARED_INVALIDATED_DURING_REFRESH');
    return current;
  }catch(error){
    const detail=String(error?.message||error);
    const failureClass=detail.match(/^(AUTH_FAILURE|MAPPING_FAILURE|PERSISTENCE_FAILURE):/)?.[1]||'PROVIDER_FAILURE';
    // Store only a typed, bounded code: never tokens, provider bodies or raw HR.
    const deterministicCode=/^(AUTH_FAILURE|MAPPING_FAILURE):[A-Z0-9_]+$/.test(detail)&&detail.length<=180?detail:null;
    const stillOwner=await finish(null,failureClass,deterministicCode);
    // Only a valid previously confirmed view may survive an upstream outage.
    // Never turn auth/binding/fencing failures into a permitted projection.
    if(stillOwner&&saved&&failureClass==='PROVIDER_FAILURE'){
      const latest=await read();
      if(latest)return {...latest,externalReadCurrent:false,sharedRefreshFailed:true};
    }
    throw error;
  }finally{clearInterval(renewal);}
}

function bankRoot(db,scope){return db.doc(`tenants/${scope.tenantId}/projects/${scope.projectId}/hrReadModels/confirmed_history_v1`);}

export function createConfirmedHrHistory({db,now=Date.now}={}){
 if(!db?.doc||!db?.batch||!db?.runTransaction)fail('HISTORY_DATABASE');
 async function observe(snapshot,{sourceReadAt,sourceReadStartedAt=sourceReadAt,revision,evidence,seed=false}={}){
  const scope=historyScope(snapshot);
  if(snapshot.sourceSafe!==true||snapshot.production===true||snapshot.imported===true||!Array.isArray(snapshot.visits)||
    !HASH.test(revision||'')||!integer(sourceReadAt)||!integer(sourceReadStartedAt)||sourceReadStartedAt>sourceReadAt||sourceReadAt>now()+60000||!evidence?.receiptPath)fail('HISTORY_OBSERVATION');
  if(seed&&(!HASH.test(evidence.snapshotSha256||'')||!/^sha256:[a-f0-9]{64}$/.test(evidence.artifactDigest||'')||!Number.isSafeInteger(evidence.artifactId)))fail('HISTORY_SEED_PROVENANCE');
  const ids=snapshot.visits.map(visitId);if(ids.some(x=>!x)||new Set(ids).size!==ids.length)fail('HISTORY_DUPLICATE_VISIT');
  const scopes=snapshot.readScope?.countryPeriods;
  if(!Array.isArray(scopes)||!scopes.length)fail('HISTORY_READ_COVERAGE_REQUIRED');
  const covered=new Set(scopes.map(s=>s.countryCode+'|'+s.periodId));
  if(covered.size!==scopes.length||scopes.some(s=>!/^[A-Z]{2}$/.test(s.countryCode)||!String(s.periodId).startsWith(scope.projectId+'-')||!/^20\d{2}-(0[1-9]|1[0-2])$/.test(String(s.periodId).slice(scope.projectId.length+1)))||snapshot.visits.some(v=>v.tenantId!==scope.tenantId||v.projectId!==scope.projectId||!covered.has(countryOf(v)+'|'+periodOf(v))))fail('HISTORY_READ_COVERAGE_MISMATCH');
  const isNewer=p=>p&&(Number(p.sourceReadStartedAt??p.sourceReadAt)>sourceReadStartedAt||Number(p.sourceReadStartedAt??p.sourceReadAt)===sourceReadStartedAt&&p.sourceReadAt>sourceReadAt);
  const root=bankRoot(db,scope),receipts=[];
  for(const selected of scopes){
   const {countryCode,periodId}=selected;
   if(!/^[A-Z]{2}$/.test(countryCode)||!periodId.startsWith(scope.projectId+'-')||!/^20\d{2}-(0[1-9]|1[0-2])$/.test(periodId.slice(scope.projectId.length+1)))fail('HISTORY_PERIOD_SCOPE');
   const visits=snapshot.visits.filter(v=>countryOf(v)===countryCode&&periodOf(v)===periodId);
   if(visits.some(v=>v.tenantId&&v.tenantId!==scope.tenantId||v.projectId&&v.projectId!==scope.projectId))fail('HISTORY_VISIT_SCOPE');
   const shoppers=new Set(visits.map(v=>String(v.canonicalShopperId||v.shopperId||'')));
   const period=(snapshot.periods||snapshot.periodCatalog||[]).find(p=>String(p.periodId||p.id)===periodId)||{id:periodId,periodId,key:periodId.slice(-7),periodKey:periodId.slice(-7)};
   const body={schemaVersion:HR_HISTORY_SCHEMA,...scope,countryCode,periodId,period,visits,shoppers:(snapshot.shoppers||[]).filter(s=>shoppers.has(String(s.shopperId||s.id||'')))};
   const raw=Buffer.from(JSON.stringify(body));if(raw.length>MAX_RAW_BYTES)fail('HISTORY_PAYLOAD_TOO_LARGE');
   const packed=gzipSync(raw,{level:6});if(packed.length>MAX_PACKED_BYTES)fail('HISTORY_PAYLOAD_TOO_LARGE');
   const digest=sha(raw),ref=root.collection('periods').doc(sha(countryCode+'|'+periodId));
   const prior=await ref.get(),old=prior.exists?prior.data():null;
   if(seed&&old){receipts.push({countryCode,periodId,published:false,reason:'seed_preserves_existing_observation'});continue;}
   if(old?.sourceReadStartedAt===sourceReadStartedAt&&old.rawSha256!==digest)fail('HISTORY_CONCURRENT_OBSERVATION');
   if(isNewer(old)){receipts.push({countryCode,periodId,published:false,reason:'newer_observation_preserved'});continue;}
   if(old?.rawSha256===digest&&old.sourceReadAt===sourceReadAt){receipts.push({countryCode,periodId,published:false,reason:'already_preserved'});continue;}
   const reused=old?.rawSha256===digest,generation=reused?old.generation:sha(digest),version=ref.collection('versions').doc(generation),chunks=[];
   for(let offset=0;offset<packed.length;offset+=HR_READ_MODEL_CHUNK_BYTES)chunks.push(packed.subarray(offset,offset+HR_READ_MODEL_CHUNK_BYTES));
   for(let first=0;!reused&&first<chunks.length;first+=8){const batch=db.batch();for(let i=first;i<Math.min(first+8,chunks.length);i++)batch.set(version.collection('chunks').doc(String(i).padStart(4,'0')),{index:i,sha256:sha(chunks[i]),bytes:chunks[i]});await batch.commit();}
   const pointer={schemaVersion:HR_HISTORY_SCHEMA,...scope,countryCode,periodId,generation,sourceReadAt,sourceReadStartedAt,observedSnapshotRevision:revision,
    revisionSemantics:'WHOLE_OBSERVED_SNAPSHOT_NOT_AN_INVENTED_PERIOD_PROVIDER_REVISION',externalReadCurrent:false,
    rawSha256:digest,compressedSha256:sha(packed),rawBytes:raw.length,compressedBytes:packed.length,chunkCount:chunks.length,
    chunkSha256:chunks.map(sha),visitCount:visits.length,evidence,updatedAt:now()};
   const accepted=await db.runTransaction(async tx=>{const current=await tx.get(ref),p=current.exists?current.data():null;
    if(seed&&p||isNewer(p))return false;
    if(p?.sourceReadStartedAt===sourceReadStartedAt&&p.rawSha256!==digest)fail('HISTORY_CONCURRENT_OBSERVATION');
    if(p?.sourceReadAt===sourceReadAt&&p.rawSha256!==digest)fail('HISTORY_CONCURRENT_OBSERVATION');
    tx.set(ref,pointer);return true;});
   receipts.push({countryCode,periodId,published:accepted,visits:visits.length,rawSha256:digest});
  }
  return {schemaVersion:HR_HISTORY_SCHEMA,...scope,periods:receipts,published:receipts.some(r=>r.published),hrWrites:0,operationalWrites:0,externalReadCurrent:false,production:false};
 }
 async function read(scope){
  scope=historyScope(scope);const root=bankRoot(db,scope),rows=await root.collection('periods').get();
  const visits=[],shoppers=new Map(),periods=new Map(),observations=[];
  for(let first=0;first<rows.docs.length;first+=8){
   const decoded=await Promise.all(rows.docs.slice(first,first+8).map(async document=>{
    const p=document.data();
    if(p.schemaVersion!==HR_HISTORY_SCHEMA||!sameScope(p,scope)||!HASH.test(p.rawSha256||'')||!HASH.test(p.generation||'')||
     !HASH.test(p.compressedSha256||'')||!Array.isArray(p.chunkSha256)||p.chunkSha256.length!==p.chunkCount||p.chunkSha256.some(x=>!HASH.test(x))||
     !integer(p.sourceReadAt)||!integer(p.chunkCount)||p.chunkCount<1||p.chunkCount>MAX_CHUNKS||!integer(p.rawBytes)||p.rawBytes>MAX_RAW_BYTES||!integer(p.compressedBytes)||p.compressedBytes>MAX_PACKED_BYTES)fail('HISTORY_POINTER');
    const chunks=await Promise.all(Array.from({length:p.chunkCount},(_,i)=>document.ref.collection('versions').doc(p.generation).collection('chunks').doc(String(i).padStart(4,'0')).get()));
    const packed=Buffer.concat(chunks.map((s,i)=>{const c=s.data();if(!s.exists||c.index!==i||!Buffer.isBuffer(c.bytes)&&!(c.bytes instanceof Uint8Array)||sha(c.bytes)!==p.chunkSha256[i])fail('HISTORY_CHUNK');return Buffer.from(c.bytes);}));
    if(packed.length!==p.compressedBytes||sha(packed)!==p.compressedSha256)fail('HISTORY_COMPRESSED_DIGEST');
    const raw=gunzipSync(packed,{maxOutputLength:MAX_RAW_BYTES});if(raw.length!==p.rawBytes||sha(raw)!==p.rawSha256)fail('HISTORY_BODY_DIGEST');
    const b=JSON.parse(raw.toString('utf8'));if(b.schemaVersion!==HR_HISTORY_SCHEMA||!sameScope(b,scope)||b.countryCode!==p.countryCode||b.periodId!==p.periodId||!Array.isArray(b.visits)||b.visits.length!==p.visitCount||b.visits.some(v=>countryOf(v)!==p.countryCode||periodOf(v)!==p.periodId||v.tenantId!==scope.tenantId||v.projectId!==scope.projectId))fail('HISTORY_BODY_SCOPE');
    return {p,b};
   }));
   for(const {p,b}of decoded){visits.push(...b.visits);for(const shopper of b.shoppers||[])shoppers.set(String(shopper.shopperId||shopper.id),shopper);periods.set(p.periodId,b.period);observations.push({countryCode:p.countryCode,periodId:p.periodId,sourceReadAt:new Date(p.sourceReadAt).toISOString(),observedSnapshotRevision:p.observedSnapshotRevision,externalReadCurrent:false});}
  }
  if(new Set(visits.map(visitId)).size!==visits.length)fail('HISTORY_DUPLICATE_VISIT');
  return {schemaVersion:HR_HISTORY_SCHEMA,...scope,available:rows.docs.length>0,externalReadCurrent:false,visits,shoppers:[...shoppers.values()],periods:[...periods.values()],observations,source:'CONFIRMED_READ_MODEL_HISTORY_NOT_COMMAND_AUTHORITY',production:false};
 }
 return {observe,read};
}
