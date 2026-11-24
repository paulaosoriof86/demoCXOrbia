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
  if(p.sourceReadStartedAt===observed.sourceReadStartedAt&&p.revision!==observed.revision)
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
      !Array.isArray(body.snapshot?.visits)||!body.snapshot.visits.length||
      !Array.isArray(body.snapshot?.periods)||!body.snapshot.periods.length||
      body.bindingProof?.bindingFingerprint!==key.bindingFingerprint)fail('BODY_SCOPE');
  entries(body.identityEntries,'IDENTITY');entries(body.privateReviewEntries,'PRIVATE_REVIEW');
  return body;
}

export function hrReadModelKey({scope,proof},readerFingerprint){
  return identity({...scope,bindingFingerprint:proof?.bindingFingerprint,readerFingerprint});
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
      snapshot:current.snapshot,bindingProof:current.bindingProof,
      identityEntries:[...(current.identity||new Map()).entries()],
      privateReviewEntries:[...(current.privateReviewNotes||new Map()).entries()]},key,revision);
    const observation={revision,sourceReadAt,sourceReadStartedAt};
    const pointerRef=db.doc(pathFor(key));
    const priorSnap=await pointerRef.get(),prior=priorSnap.exists?checkPointer(priorSnap.data(),key):null;
    if(newer(prior,observation))return {published:false,reason:'newer_observation_preserved',revision:prior.revision};

    // The stable revision owns immutable content. A new successful read of
    // unchanged content updates only observation metadata, avoiding rewrites.
    if(prior?.revision===revision){
      if(prior.sourceReadStartedAt===sourceReadStartedAt&&prior.sourceReadAt===sourceReadAt)
        return {published:false,reused:true,readModelPresent:true,reason:'already_persisted',revision,generation:prior.generation,sourceReadAt};
      const reused=await db.runTransaction(async tx=>{
        const snap=await tx.get(pointerRef),p=snap.exists?checkPointer(snap.data(),key):null;
        if(newer(p,observation))return {published:false,reason:'newer_observation_preserved',revision:p.revision};
        if(p?.revision!==revision)return null;
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
      if(p?.revision===revision){
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
    // Observation time comes from a successful external read, not recovery.
    return {snapshot:body.snapshot,revision:body.revision,bindingProof:body.bindingProof,
      identity:new Map(body.identityEntries),privateReviewNotes:new Map(body.privateReviewEntries),
      loadedAt:pointer.sourceReadAt,sourceReadStartedAt:pointer.sourceReadStartedAt,
      origin:'durable_internal_snapshot',externalReadCurrent:false,
      durableReadModel:{schemaVersion:HR_READ_MODEL_SCHEMA,generation:pointer.generation,
        readerFingerprint:key.readerFingerprint,bindingFingerprint:key.bindingFingerprint,recoveredAt:now()}};
  }
  return {publish,read};
}
