import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';

// P0 B14 provider precondition only. NEVER a project HR binding, a deployment,
// a production write, a canonical module PASS, or a substitute for application ACK.
const QA_BOOK_SHA256='4e6671f8cfb9f6ee7760e22edf9d94312831cb096a5fdfcb980f78ca0cdaa028';
const OPERATIONAL_BOOK_SHA256='796d2ae2b7d3f948efce7d799ddb7c81684b94e274116c24322d5f742136b90e';
const QA_PRINCIPAL='firebase-adminsdk-fbsvc@cxorbia-backend-dev.iam.gserviceaccount.com';
const QA_BRANCH='refs/heads/recovery/cxorbia-phase-a-20260831';
const QA_TAB='B14_QA';
const QA_ROW_ID='B14-QA-20261118-001';
const QA_HEADERS=['fixtureId','tenantId','projectId','periodId','visitId','shopperId','fieldKey','fieldValue','revision','idempotencyKey','writerOrigin','ackStatus','lastWriteAt'];
const WRITE_SCOPES=['https://www.googleapis.com/auth/spreadsheets','https://www.googleapis.com/auth/drive.metadata.readonly'];
const sha=value=>createHash('sha256').update(String(value)).digest('hex');
const row13=row=>Array.from({length:13},(_,i)=>row?.[i]??'');

export function assertIsolatedB14Scope(env){
  const book=String(env.CXORBIA_B14_QA_BOOK_ID||'');
  if(env.CXORBIA_B14_QA_WRITE_GATE!=='PAULA_AUTHORIZED_B14_PROVIDER_FIXTURE_20261118')throw Error('AUTH_FAILURE:QA_WRITE_GATE_MISSING');
  if(env.GITHUB_REF!==QA_BRANCH||env.GITHUB_REPOSITORY!=='paulaosoriof86/demoCXOrbia')throw Error('ENVIRONMENT_FAILURE:QA_REPO_BRANCH_DRIFT');
  if(!/^\d{8,}$/.test(String(env.GITHUB_RUN_ID||'')))throw Error('ENVIRONMENT_FAILURE:QA_RUN_ID_MISSING');
  if(!book||sha(book)!==QA_BOOK_SHA256||sha(book)===OPERATIONAL_BOOK_SHA256)throw Error('MAPPING_FAILURE:QA_BOOK_NOT_EXACT_ISOLATED_FIXTURE');
  return {book,runId:String(env.GITHUB_RUN_ID),runAttempt:String(env.GITHUB_RUN_ATTEMPT||'1')};
}

export function assertFixtureRows(values){
  const [headers,raw,...others]=values||[];
  if(JSON.stringify(headers)!==JSON.stringify(QA_HEADERS))throw Error('MAPPING_FAILURE:QA_HEADERS_DRIFT');
  const row=row13(raw);
  if(row[0]!==QA_ROW_ID||row[1]!=='tenant_qa'||row[2]!=='project_qa'||row[3]!=='periodo_qa'||row[4]!=='visita_qa_001'||row[5]!=='shopper_qa_001'||row[6]!=='status'||String(row[8])!=='0'||row[10]!=='QA_ONLY')throw Error('MAPPING_FAILURE:QA_FIXTURE_SCOPE_DRIFT');
  if(others.some(r=>(r||[]).some(v=>String(v||'').trim())))throw Error('MAPPING_FAILURE:QA_UNEXPECTED_ADDITIONAL_ROWS');
  return row;
}

export function replayDecision(row,idempotencyKey,newValue){
  const saved=row13(row);
  if(saved[9]!==idempotencyKey)return 'NEW_KEY';
  return saved[7]===newValue?'REPLAY_NOOP':'CONFLICT_NOOP';
}

function selfTest(){
  const env={CXORBIA_B14_QA_WRITE_GATE:'PAULA_AUTHORIZED_B14_PROVIDER_FIXTURE_20261118',GITHUB_REF:QA_BRANCH,GITHUB_REPOSITORY:'paulaosoriof86/demoCXOrbia',GITHUB_RUN_ID:'44030019174',CXORBIA_B14_QA_BOOK_ID:'1W7oc7sV1D1oHXMhLnsHkslks0bD9pIsY5M720-tOGjg'};
  assertIsolatedB14Scope(env);
  for(const value of ['', 'some-unrelated-book']){
    let rejected=false;try{assertIsolatedB14Scope({...env,CXORBIA_B14_QA_BOOK_ID:value});}catch{rejected=true;}
    if(!rejected)throw Error('SOURCE_FAILURE:QA_SCOPE_FAIL_OPEN');
  }
  for(const patch of [{GITHUB_REF:'refs/heads/main'},{CXORBIA_B14_QA_WRITE_GATE:'UNAUTHORIZED'},{GITHUB_REPOSITORY:'some-other/repo'}]){
    let rejected=false;try{assertIsolatedB14Scope({...env,...patch});}catch{rejected=true;}
    if(!rejected)throw Error('SOURCE_FAILURE:QA_AUTH_OR_BRANCH_FAIL_OPEN');
  }
  const values=[QA_HEADERS,[QA_ROW_ID,'tenant_qa','project_qa','periodo_qa','visita_qa_001','shopper_qa_001','status','QA_PENDING',0,'','QA_ONLY','NOT_TESTED']];
  const baseline=assertFixtureRows(values);
  if(baseline[7]!=='QA_PENDING'||replayDecision(baseline,'key','QA_WRITTEN')!=='NEW_KEY')throw Error('SOURCE_FAILURE:QA_BASELINE');
  const written=[...baseline];written[7]='QA_WRITTEN';written[9]='key';written[11]='PROVIDER_ACK';
  if(replayDecision(written,'key','QA_WRITTEN')!=='REPLAY_NOOP'||replayDecision(written,'key','OTHER')!=='CONFLICT_NOOP')throw Error('SOURCE_FAILURE:QA_REPLAY_GUARDS');
  console.log('PASS_B14_QA_SCOPE_AND_REPLAY_PURE_TESTS');
}

async function runProviderProbe(){
  const env=process.env,{book,runId,runAttempt}=assertIsolatedB14Scope(env);
  const outPath=path.resolve(env.CXORBIA_B14_QA_RECEIPT||'.tmp/b14-provider-probe.json');
  fs.mkdirSync(path.dirname(outPath),{recursive:true});
  const receipt={schemaVersion:'cxorbia.i3.b14.qa-provider-write.v1',state:'HOLD',decision:'PENDING',runId,runAttempt,
    sourceSha:'836a498063987f0fc471599723b4c4772d1aba09',
    operationalSource:'PROJECT_PRIVATE_HR_BINDING_UNMODIFIED',fixtureHash:QA_BOOK_SHA256,
    fixtureTab:QA_TAB,fixtureRowId:QA_ROW_ID,scope:'EXTERNAL_PROVIDER_WRITER_PRECONDITION_ONLY',
    productWrites:0,firestoreWrites:0,authWrites:0,productionWrites:0,operationalHrWrites:0,
    providerWriteRequests:0,replayProviderWrites:0,conflictProviderWrites:0,backendCommandExecuted:false,
    applicationAckProven:false,b14Closed:false,newModuleMatches:0};
  const save=()=>fs.writeFileSync(outPath,JSON.stringify(receipt,null,2)+'\n');save();
  const requireHere=createRequire(import.meta.url);
  const requireAdmin=createRequire(requireHere.resolve('firebase-admin/app'));
  const {GoogleAuth}=requireAdmin('google-auth-library');
  const auth=()=>new GoogleAuth({scopes:WRITE_SCOPES}).getClient();
  let client,baseline,wrote=false,restored=false;
  const base='https://sheets.googleapis.com/v4/spreadsheets/'+encodeURIComponent(book);
  const get=async(c,url,params={})=>(await c.request({method:'GET',url,params,timeout:20000,retry:false,maxRedirects:0})).data;
  const read=async c=>get(c,base+'/values/'+encodeURIComponent(QA_TAB+'!A1:M3'),{valueRenderOption:'UNFORMATTED_VALUE'});
  const put=async(c,cells)=>{
    const data=cells.map(([column,value])=>({range:QA_TAB+'!'+column+'2',majorDimension:'ROWS',values:[[value]]}));
    const resp=await c.request({method:'POST',url:base+'/values:batchUpdate',data:{valueInputOption:'RAW',data,includeValuesInResponse:true,responseValueRenderOption:'UNFORMATTED_VALUE'},timeout:20000,retry:false,maxRedirects:0});
    if(resp.status!==200||resp.data?.totalUpdatedCells!==3||resp.data?.responses?.length!==3)throw Error('PROVIDER_FAILURE:QA_ACK_SHAPE');
    receipt.providerWriteRequests++;
    return {status:resp.status,totalUpdatedCells:resp.data.totalUpdatedCells,responseRanges:resp.data.responses.map(x=>x.updatedRange)};
  };
  try{
    client=await auth();
    const principal=String(typeof client.getServiceAccountEmail==='function'?await client.getServiceAccountEmail():client.email||'');
    if(principal!==QA_PRINCIPAL)throw Error('AUTH_FAILURE:QA_SERVICE_ACCOUNT_MISMATCH');
    const [file,meta]=await Promise.all([
      get(client,'https://www.googleapis.com/drive/v3/files/'+encodeURIComponent(book),{fields:'id,mimeType,trashed,capabilities(canEdit,canModifyContent)'}),
      get(client,base,{fields:'spreadsheetId,sheets(properties(sheetId,title))'})]);
    if(file?.id!==book||file.mimeType!=='application/vnd.google-apps.spreadsheet'||file.trashed||file.capabilities?.canEdit!==true||meta?.spreadsheetId!==book||!meta.sheets?.some(x=>x.properties?.title===QA_TAB))throw Error('PROVIDER_FAILURE:QA_PROVIDER_ACCESS_UNVERIFIED');
    receipt.principalSha256=sha(principal);receipt.access='SERVICE_ACCOUNT_QA_WRITER_CONFIRMED';
    const before=await read(client);baseline=assertFixtureRows(before.values);
    if(baseline[7]!=='QA_PENDING'||baseline[9]!==''||baseline[11]!=='NOT_TESTED')throw Error('MAPPING_FAILURE:QA_BASELINE_NOT_CLEAN');
    const key='b14-qa-'+runId+'-'+runAttempt,value='QA_WRITTEN_'+runId+'_'+runAttempt;
    // A timeout can follow a provider-side commit; treat every attempted write
    // as possibly applied and always restore the known baseline in finally.
    wrote=true;receipt.writeAck=await put(client,[['H',value],['J',key],['L','PROVIDER_ACK']]);
    const independent=await auth(),after=assertFixtureRows((await read(independent)).values);
    if(after[7]!==value||after[9]!==key||after[11]!=='PROVIDER_ACK')throw Error('PROVIDER_FAILURE:QA_INDEPENDENT_READBACK_MISMATCH');
    receipt.independentReadback=true;
    if(replayDecision(after,key,value)!=='REPLAY_NOOP'||replayDecision(after,key,value+'-conflict')!=='CONFLICT_NOOP')throw Error('PERSISTENCE_FAILURE:QA_REPLAY_CONFLICT_GUARD');
    receipt.replayNoopVerified=true;receipt.conflictNoopVerified=true;
    // The guard intentionally does NOT issue a second provider write.
    const all=(await get(independent,base+'/values/'+encodeURIComponent(QA_TAB+'!A2:A20'))).values||[];
    if(all.filter(x=>x?.[0]===QA_ROW_ID).length!==1||all.some(x=>x?.[0]&&x[0]!==QA_ROW_ID))throw Error('PERSISTENCE_FAILURE:QA_DUPLICATE_OR_FOREIGN_ROW');
    receipt.rowCountStable=true;
    receipt.decision='PASS_B14_ISOLATED_PROVIDER_ACK_AND_READBACK_ONLY';
  }catch(err){receipt.decision='HOLD_B14_ISOLATED_PROVIDER_PROBE';receipt.failure=String(err?.message||'UNKNOWN').replace(/[^A-Za-z0-9_:-]/g,'').slice(0,160);throw err;
  }finally{
    if(wrote&&client&&baseline){
      try{
        receipt.restoreAck=await put(client,[['H',baseline[7]],['J',baseline[9]],['L',baseline[11]]]);
        const verify=assertFixtureRows((await read(await auth())).values);
        restored=verify[7]===baseline[7]&&verify[9]===baseline[9]&&verify[11]===baseline[11];
      }catch(err){receipt.restoreFailure=String(err?.message||'UNKNOWN').replace(/[^A-Za-z0-9_:-]/g,'').slice(0,160);}
    }
    receipt.fixtureRestored=restored;
    if(wrote&&!restored)receipt.decision='HOLD_B14_QA_RESTORE_UNVERIFIED';
    save();console.log('CXORBIA_B14_QA_PROVIDER_RECEIPT='+JSON.stringify({decision:receipt.decision,writeAck:receipt.writeAck||null,independentReadback:receipt.independentReadback===true,replayNoopVerified:receipt.replayNoopVerified===true,conflictNoopVerified:receipt.conflictNoopVerified===true,rowCountStable:receipt.rowCountStable===true,fixtureRestored:receipt.fixtureRestored,providerWriteRequests:receipt.providerWriteRequests,b14Closed:false,productionWrites:0,operationalHrWrites:0}));
    if(wrote&&!restored)process.exitCode=1;
  }
}

// VRM365/F3: exact isolated project through the existing deployed command route.
// This branch is opt-in. Import and --self-test never initialize providers.
export const F3_QA=Object.freeze({tenantId:'tya',projectId:'f3-qa-20261124',periodId:'f3-qa-20261124-2026-11',
  firebaseProject:'cxorbia-backend-dev',baseUrl:'https://cxorbia-backend-dev.web.app',
  service:'cxorbia-live-hr-dev',region:'us-central1',mappingRef:'tya-hr-column-map-r20-v1',
  driveId:'B2D2B478DAC4DD05',countries:['GT','HN'],fields:['escenario','tipoCombo','agendada','shopperId'],
  visits:{GT:'hr_excel_45c62e0543d229c8ca625f3cf857',HN:'hr_excel_ec25c41b6656f0000daef0af1398'},
  items:{GT:'B2D2B478DAC4DD05!s7752e15fa45d4038b05c88522834cb6e',HN:'B2D2B478DAC4DD05!s314e10a513f74ddd829bacab1503c0f7'}});
const f3Stable=v=>Array.isArray(v)?v.map(f3Stable):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,f3Stable(v[k])])):v;
const f3Digest=v=>sha(JSON.stringify(f3Stable(v)));
const f3Same=(a,b)=>f3Digest(a??null)===f3Digest(b??null);
const f3Need=(ok,code)=>{if(!ok)throw Error(code);};
const f3Code=e=>String(e?.message||'UNKNOWN').replace(/[^A-Za-z0-9_:-]/g,'').slice(0,180);
const f3Owner=(run,attempt)=>'f3-qa-'+run+'-'+attempt;
export function assertF3EndpointScope(env,manifest){
  f3Need(env.CXORBIA_F3_QA_ENDPOINT_GATE==='PAULA_AUTHORIZED_ISOLATED_F3_ENDPOINT_20261124','AUTH_FAILURE:F3_QA_GATE');
  f3Need(env.GITHUB_REF===QA_BRANCH&&env.GITHUB_REPOSITORY==='paulaosoriof86/demoCXOrbia','ENVIRONMENT_FAILURE:F3_QA_REPO_BRANCH');
  f3Need(/^\d{8,}$/.test(String(env.GITHUB_RUN_ID||''))&&/^\d+$/.test(String(env.GITHUB_RUN_ATTEMPT||'1')),'ENVIRONMENT_FAILURE:F3_QA_RUN');
  f3Need(env.CXORBIA_F3_QA_BASE_URL===F3_QA.baseUrl&&env.GOOGLE_CLOUD_PROJECT===F3_QA.firebaseProject,'ENVIRONMENT_FAILURE:F3_QA_ENDPOINT');
  f3Need(manifest?.schemaVersion==='cxorbia.f3.remote-fixture.v1'&&manifest.tenantId===F3_QA.tenantId&&manifest.projectId===F3_QA.projectId&&manifest.periodId===F3_QA.periodId,'MAPPING_FAILURE:F3_QA_MANIFEST_SCOPE');
  f3Need(/^[a-f0-9]{40}$/.test(env.CXORBIA_F3_QA_SOURCE_SHA||'')&&/^[a-f0-9]{40}$/.test(env.CXORBIA_F3_QA_SOURCE_TREE||''),'SOURCE_FAILURE:F3_QA_SOURCE_PIN');
  f3Need(/^cxorbia-live-hr-dev-\d{5}-[a-z0-9]+$/.test(env.CXORBIA_F3_QA_RUNTIME_REVISION||'')&&/^sha256:[a-f0-9]{64}$/.test(env.CXORBIA_F3_QA_RUNTIME_DIGEST||''),'SOURCE_FAILURE:F3_QA_RUNTIME_PIN');
  f3Need(/^sites\/cxorbia-backend-dev\/versions\/[a-z0-9]+$/.test(env.CXORBIA_F3_QA_HOSTING_VERSION||''),'SOURCE_FAILURE:F3_QA_HOSTING_PIN');
  f3Need(Object.keys(manifest.countries||{}).sort().join(',')==='GT,HN','MAPPING_FAILURE:F3_QA_COUNTRIES');
  for(const country of F3_QA.countries){
    const row=manifest.countries[country],identity=country==='GT'?['Guatemala','2022002','C. Miraflores']:['Honduras','2052001','C. Las Cascadas Honduras'];
    f3Need(row.driveId===F3_QA.driveId&&row.itemId===F3_QA.items[country]&&row.worksheetName==='CXR_B14_QA_'+country+'_20261119','MAPPING_FAILURE:F3_QA_PROVIDER_SCOPE');
    f3Need(/^[A-Za-z0-9{][A-Za-z0-9{}!._:-]{0,239}$/.test(row.worksheetId||'')&&row.worksheetFingerprint===sha(row.worksheetId),'MAPPING_FAILURE:F3_QA_WORKSHEET_PROOF');
    f3Need(row.providerReadStatus===200&&/^[a-f0-9]{32}$/i.test(row.providerExecutionId||'')&&Number.isFinite(Date.parse(row.observedAt)),'PROVIDER_FAILURE:F3_QA_OBSERVATION_PROOF');
    // Graph returns numeric cinema IDs as numbers; preserve the raw provider
    // evidence and compare only that identifier's supported scalar forms.
    const rawIdentity=row.rowIdentityValues;
    const exactIdentity=Array.isArray(rawIdentity)&&rawIdentity.length===3&&
      rawIdentity[0]===identity[0]&&rawIdentity[2]===identity[2]&&
      (typeof rawIdentity[1]==='string'||Number.isSafeInteger(rawIdentity[1]))&&
      String(rawIdentity[1])===identity[1];
    f3Need(Array.isArray(row.headerValues)&&row.headerValues.length===26&&f3Same(row.headerValues.slice(0,4),['fixtureId','fieldValue','eventId','eventDigest'])&&exactIdentity,'MAPPING_FAILURE:F3_QA_HEADER_IDENTITY');
    f3Need(row.headerValues[10]==='Tipo de Combo'&&row.headerValues[11]==='Tipo de Compra'&&row.headerValues[14]==='Shopper Asignado'&&row.headerValues[18]==='Fecha programada','MAPPING_FAILURE:F3_QA_FIELD_COLUMNS');
  }
  return {runId:String(env.GITHUB_RUN_ID),runAttempt:String(env.GITHUB_RUN_ATTEMPT||'1'),owner:f3Owner(env.GITHUB_RUN_ID,env.GITHUB_RUN_ATTEMPT||'1')};
}
export function f3FixtureDocuments(manifest,owner){
  const scope={tenantId:F3_QA.tenantId,projectId:F3_QA.projectId},countryBindings=F3_QA.countries.map(countryCode=>({countryCode,providerBindingId:owner+'-'+countryCode,mappingRef:F3_QA.mappingRef}));
  const project={...scope,id:F3_QA.projectId,name:'CXOrbia F3 isolated QA',countries:['GT','HN'],version:1,qaOwner:owner,synthetic:true,
    operationalSource:{mode:'external',providerType:'excel_online',readPolicy:'external_live',writePolicy:'bidirectional_gated',periodDiscovery:'provider_auto',countryBindings}};
  const records=[{path:'tenants/tya/projects/'+F3_QA.projectId,data:project}];
  for(const country of F3_QA.countries){
    const provider=manifest.countries[country],binding=countryBindings.find(x=>x.countryCode===country);
    records.push({path:'tenants/tya/integrationSettings/'+binding.providerBindingId,data:{...scope,qaOwner:owner,synthetic:true,countryCode:country,
      providerBindingId:binding.providerBindingId,providerType:'excel_online',mappingRef:F3_QA.mappingRef,readPolicy:'external_live',writePolicy:'bidirectional_gated',enabled:true,hrWritesEnabled:true,
      driveId:provider.driveId,itemId:provider.itemId,readRangeAddress:'A1:Z2',periodSheets:[{periodId:F3_QA.periodId,worksheetId:provider.worksheetId,worksheetName:provider.worksheetName}],
      fieldWriter:{schemaVersion:'cxorbia.hr-field-writer-binding.v1',enabled:true,protocolVersion:'cxorbia.hr-field-transport.v1',remoteEventReceipt:true,observedBaseGuard:true,
        allowedFields:[...F3_QA.fields],rowIdentityColumns:['pais','idCinema','shopping'],fieldMap:{escenario:{columnKey:'tipoCompra',valueKind:'text'},tipoCombo:{columnKey:'tipoCombo',valueKind:'text'},agendada:{columnKey:'fechaProgramada',valueKind:'date'},shopperId:{columnKey:'shopper',valueKind:'shopper'}}}}});
    for(const letter of ['a','b']){const shopperId='qa_f3_20261124_'+country.toLowerCase()+'_'+letter,label='CXOrbia QA '+country+' F3 '+letter.toUpperCase();
      records.push({path:'tenants/tya/shoppers/'+shopperId,data:{tenantId:'tya',id:shopperId,shopperId,projectIds:[F3_QA.projectId],pais:country,country,hrWriteLabel:label,nombre:label,synthetic:true,qaOwner:owner,active:true,version:1}});
    }
  }
  return records;
}
export function f3FieldCommand({owner,serial,visit,revision,version,fieldKey,value}){
  f3Need(F3_QA.fields.includes(fieldKey)&&visit.tenantId==='tya'&&visit.projectId===F3_QA.projectId&&visit.periodId===F3_QA.periodId&&F3_QA.visits[visit.country||visit.pais]===(visit.id||visit.visitId),'MAPPING_FAILURE:F3_QA_COMMAND_SCOPE');
  f3Need(/^[a-f0-9]{64}$/.test(revision||'')&&version!==undefined,'SOURCE_FAILURE:F3_QA_COMMAND_BASE');
  const id=visit.id||visit.visitId;
  return {version:'cxorbia-command-adapter-v1',commandType:'visit.hr.fields.update',entityType:'visit',entityId:id,tenantId:'tya',projectId:F3_QA.projectId,periodId:F3_QA.periodId,
    expectedVersion:version,idempotencyKey:owner+'-field-'+serial,authorization:{providerEnforcementRequired:true,permission:'visit.hr.fields.update'},
    payload:{visitId:id,hrRowId:visit.hrRowId,countryCode:visit.country||visit.pais,sourceRevision:revision,baseFieldValues:{[fieldKey]:visit[fieldKey]??null},patch:{[fieldKey]:value}}};
}
export function assertF3RemoteAck(result){
  f3Need(result?.ok===true&&result.status==='committed'&&result.hrProviderAck===true&&result.readbackVerified===true&&result.successUiAllowed===true&&result.hrFieldEventIds?.length===1,'PERSISTENCE_FAILURE:F3_QA_REMOTE_ACK_REQUIRED');
  f3Need(/^hfe-[a-f0-9]{64}$/.test(result.hrFieldEventIds[0]),'PERSISTENCE_FAILURE:F3_QA_EVENT_ID');
  return result.hrFieldEventIds[0];
}
export function f3OwnedCleanupPath(path,owner,commands=[]){
  const project='tenants/tya/projects/'+F3_QA.projectId;
  if(path===project||path.startsWith(project+'/'))return true;
  if(path.startsWith('tenants/tya/integrationSettings/'+owner+'-')&&F3_QA.countries.some(c=>path==='tenants/tya/integrationSettings/'+owner+'-'+c))return true;
  if(/^tenants\/tya\/shoppers\/qa_f3_20261124_(gt|hn)_[ab]$/.test(path))return true;
  if(path==='tenants/tya/users/'+owner+'-admin')return true;
  return commands.some(c=>path===c||path.startsWith(c+'/'));
}
// Persist reconciliation evidence before evaluating ACK or deleting its journal.
// These records contain only this synthetic QA scope. Redact any unexpected
// credential-bearing field so an upstream error cannot spill a secret.
export function f3SafeEvidence(value){
  if(Array.isArray(value))return value.map(f3SafeEvidence);
  if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([key,next])=>
    [key,/^(?:password|passwordHash|salt|token|idToken|refreshToken|accessToken|access_token|refresh_token|authorization|apiKey|privateKey|private_key|clientSecret|client_secret|credentials|credential)$/i.test(key)?'[REDACTED]':f3SafeEvidence(next)]));
  if(typeof value==='string')return value.replace(/\bBearer\s+[^\s]+/gi,'Bearer [REDACTED]');
  return value;
}
export function f3AssertCleanupLock({current,baseline,owner,reconcilePaths,receipts}){
  if(f3Same(current,baseline))return 'BASELINE_UNCHANGED';
  f3Need(current&&current.projectId===F3_QA.projectId&&current.status==='committed'&&reconcilePaths.includes(current.receiptPath),'PERSISTENCE_FAILURE:F3_QA_LOCK_OWNER');
  const row=receipts.find(x=>x.path===current.receiptPath)?.data;
  const allowedKeys=['initial','restored'].map(serial=>owner+'-reconcile-'+serial);
  f3Need(row&&row.tenantId==='tya'&&row.projectId===F3_QA.projectId&&row.actorUid===owner+'-admin'&&allowedKeys.includes(row.idempotencyKey)&&
    current.receiptPath==='tenants/tya/commandReceipts/hr-'+f3Digest([F3_QA.projectId,row.idempotencyKey])&&row.attemptId===current.attemptId&&
    /^[a-f0-9]{64}$/.test(row.sourceRevision||'')&&row.digest===f3Digest({actorUid:row.actorUid,scope:{tenantId:'tya',projectId:F3_QA.projectId},sourceRevision:row.sourceRevision,commandType:'hr.snapshot.reconcile'})&&
    row.status==='committed'&&row.result?.ok===true&&row.result?.providerAck===true&&row.result?.authWrites===0&&
    row.result?.unresolvedEffects===0&&row.result?.unverifiedEffects===0,'PERSISTENCE_FAILURE:F3_QA_LOCK_RECEIPT_OWNER');
  return 'OWNED_COMMITTED_RECONCILIATION';
}
export function f3RequireRemoteRestoredBeforeCleanup(receipt){
  const attempts=receipt.remoteCommandAttempts||[];
  f3Need(attempts.length===0||receipt.remoteValuesRestored===true,'PERSISTENCE_FAILURE:F3_QA_REMOTE_RESTORE_REQUIRED');
  return attempts.length?'REMOTE_VALUES_RESTORED':'NO_REMOTE_COMMAND_ATTEMPTED';
}

export function f3VerifyRestoredBaseline(baseline,live){
  f3Need(baseline?.rows?.length===2&&live?.rows?.length===2&&/^[a-f0-9]{64}$/.test(live.revision||''),'PROVIDER_FAILURE:F3_QA_RESTORED_BASELINE_SCOPE');
  for(const original of baseline.rows){
    const matches=live.rows.filter(row=>(row.id||row.visitId)===original.visitId),row=matches[0];
    f3Need(matches.length===1&&row.periodId===original.periodId&&(row.country||row.pais)===original.countryCode&&row.hrRowId===original.hrRowId&&row.excelWorksheetFingerprint===original.worksheetFingerprint,'MAPPING_FAILURE:F3_QA_RESTORED_BASELINE_IDENTITY');
    f3Need(F3_QA.fields.every(key=>f3Same(row[key]??null,original.values[key])),'PROVIDER_FAILURE:F3_QA_REMOTE_BASELINE_NOT_RESTORED');
  }
  return {decision:'PASS_F3_EXACT_REMOTE_BASELINE_READBACK',sourceRevision:live.revision,visits:2,fields:8,readAt:new Date().toISOString()};
}

async function runF3EndpointProbe(){
  const env=process.env,manifest=JSON.parse(fs.readFileSync(env.CXORBIA_F3_QA_REMOTE_MANIFEST||'','utf8'));
  const {runId,runAttempt,owner}=assertF3EndpointScope(env,manifest),outPath=path.resolve(env.CXORBIA_B14_QA_RECEIPT||'.tmp/i3-b14-provider-qa/receipt.json');
  fs.mkdirSync(path.dirname(outPath),{recursive:true});
  const receipt={schemaVersion:'cxorbia.i3.f3.qa-endpoint.v1',state:'HOLD',decision:'PENDING',runId,runAttempt,qaOwner:owner,
    sourceSha:env.CXORBIA_F3_QA_SOURCE_SHA,sourceTree:env.CXORBIA_F3_QA_SOURCE_TREE,sourceProof:'EXACT_PARENT_CERTIFIED_RUNTIME_PINS_REQUIRED',
    runtimeRevision:env.CXORBIA_F3_QA_RUNTIME_REVISION,runtimeDigest:env.CXORBIA_F3_QA_RUNTIME_DIGEST,hostingVersion:env.CXORBIA_F3_QA_HOSTING_VERSION,
    tenantId:'tya',projectId:F3_QA.projectId,periodId:F3_QA.periodId,baseUrl:F3_QA.baseUrl,remoteFixtureDigest:f3Digest(manifest),
    productionWrites:0,operationalHrWrites:0,syntheticOnly:true,notesPrivacyProven:false,ordinaryPasswordAuthenticationProven:false,
    applicationAckProven:false,b14Closed:false,newModuleMatches:0,cases:[],events:[],cleanup:{firestore:false,auth:false,remoteMake:false},
    guarantees:{atomicHumanExcelCas:false,observedBaseGuard:true,remoteReceiptAndIndependentRead:true,uncertainWriteRetry:false},
    unproven:['provider_response_loss_live_fault_injection','external_human_concurrent_edit_atomicity','historical_period_live_fixture','T&A_private_notes_live_fixture']};
  const save=()=>fs.writeFileSync(outPath,JSON.stringify(receipt,null,2)+'\n');save();
  const requireHere=createRequire(import.meta.url),requireAdmin=createRequire(requireHere.resolve('firebase-admin/app')),{GoogleAuth}=requireAdmin('google-auth-library');
  const appSdk=await import('firebase-admin/app'),{getAuth}=await import('firebase-admin/auth'),{getFirestore}=await import('firebase-admin/firestore');
  const cloud=new GoogleAuth({scopes:['https://www.googleapis.com/auth/cloud-platform']});
  const cloudClient=await cloud.getClient(),principal=String(typeof cloudClient.getServiceAccountEmail==='function'?await cloudClient.getServiceAccountEmail():cloudClient.email||'');
  f3Need(principal===QA_PRINCIPAL,'AUTH_FAILURE:F3_QA_SERVICE_ACCOUNT');
  const app=appSdk.initializeApp({credential:appSdk.applicationDefault(),projectId:F3_QA.firebaseProject},owner),auth=getAuth(app),db=getFirestore(app);
  const adminUid=owner+'-admin',claims={tenantId:'tya',role:'admin',authNamespace:'staff',projectIds:[F3_QA.projectId],qaOwner:owner};
  let token='',authCreated=false,baselineReady=false,baselineLock=null,lockPath='tenants/tya/commandReceipts/hr-scope-'+f3Digest('tya');
  const written=new Map(),commands=[],reconcilePaths=new Set(),projectPath='tenants/tya/projects/'+F3_QA.projectId;
  const profiles=f3FixtureDocuments(manifest,owner),recordCase=(name,details={})=>{receipt.cases.push({name,...details});save();};
  const httpJson=async(url,options={})=>{const r=await fetch(url,{redirect:'error',signal:AbortSignal.timeout(180000),...options});const text=await r.text();let body;try{body=JSON.parse(text);}catch{throw Error('PROVIDER_FAILURE:F3_QA_NON_JSON_'+r.status);}return {status:r.status,body};};
  const cloudGet=async url=>(await cloudClient.request({method:'GET',url,timeout:30000,retry:false,maxRedirects:0})).data;
  const runtimeRead=async()=>{
    const base='https://'+F3_QA.region+'-run.googleapis.com/apis/serving.knative.dev/v1/namespaces/'+F3_QA.firebaseProject;
    const service=await cloudGet(base+'/services/'+F3_QA.service),revision=await cloudGet(base+'/revisions/'+env.CXORBIA_F3_QA_RUNTIME_REVISION);
    const latest=service.status?.latestReadyRevisionName,traffic=service.status?.traffic||[],image=revision.status?.imageDigest||'';
    f3Need(latest===env.CXORBIA_F3_QA_RUNTIME_REVISION&&traffic.some(x=>x.revisionName===latest&&x.percent===100)&&image.endsWith(env.CXORBIA_F3_QA_RUNTIME_DIGEST),'RELEASE_COMPOSITION_FAILURE:F3_QA_RUNTIME_DRIFT');
    const channel=await cloudGet('https://firebasehosting.googleapis.com/v1beta1/sites/'+F3_QA.firebaseProject+'/channels/live');
    f3Need(channel.release?.version?.name===env.CXORBIA_F3_QA_HOSTING_VERSION,'RELEASE_COMPOSITION_FAILURE:F3_QA_HOSTING_DRIFT');
    const environment=revision.spec?.containers?.[0]?.env||[];
    f3Need(environment.find(x=>x.name==='CXORBIA_F3_HR_FIELDS_ENABLED')?.value==='true','ENVIRONMENT_FAILURE:F3_QA_RUNTIME_WRITER_DISABLED');
    f3Need(environment.some(x=>x.name==='CXORBIA_F3_MAKE_TOOLBOX_TOKEN'&&x.valueFrom?.secretKeyRef)&&environment.some(x=>x.name==='CXORBIA_F3_MAKE_TOOLBOX_URL'&&(x.value||x.valueFrom?.secretKeyRef)),'AUTH_FAILURE:F3_QA_WRITER_SECRET_UNCONFIGURED');
    return {revision:latest,digest:env.CXORBIA_F3_QA_RUNTIME_DIGEST,hostingVersion:env.CXORBIA_F3_QA_HOSTING_VERSION,readAt:new Date().toISOString()};
  };
  const readLive=async()=>{
    const {status,body}=await httpJson(F3_QA.baseUrl+'/api/tenants/tya/projects/'+F3_QA.projectId+'/hr-live?fresh=1&protectedState=1',{headers:{Authorization:'Bearer '+token}});
    f3Need(status===200&&body.snapshot?.tenantId==='tya'&&body.snapshot?.projectId===F3_QA.projectId&&body.snapshot?.sourceSafe===true&&body._runtime?.writes===false,'PROVIDER_FAILURE:F3_QA_LIVE_READ');
    const rows=body.snapshot.visits||[];f3Need(rows.length===2&&new Set(rows.map(x=>x.id||x.visitId)).size===2,'MAPPING_FAILURE:F3_QA_VISIT_COUNT');
    for(const c of F3_QA.countries){const v=rows.find(x=>(x.id||x.visitId)===F3_QA.visits[c]);f3Need(v&&v.periodId===F3_QA.periodId&&(v.country||v.pais)===c&&v.hrRowId===manifest.countries[c].worksheetName+'!2'&&v.excelWorksheetFingerprint===manifest.countries[c].worksheetFingerprint,'MAPPING_FAILURE:F3_QA_VISIT_IDENTITY');
      f3Need(v.hrFieldEditing?.enabled===true&&f3Same(v.hrFieldEditing.fields.map(x=>x.key).sort(),[...F3_QA.fields].sort()),'FUNCTIONAL_DEFECT:F3_QA_EDITOR_CAPABILITY');}
    return {rows,revision:body._runtime.revision};
  };
  const commandPaths=command=>{
    if(command.commandType==='hr.snapshot.reconcile')return ['tenants/tya/commandReceipts/hr-'+f3Digest([F3_QA.projectId,command.idempotencyKey])];
    return ['tenants/tya/commandReceipts/'+sha(command.tenantId+'\0'+command.projectId+'\0'+command.periodId+'\0'+command.idempotencyKey).slice(0,40),
      'tenants/tya/entityAuditTrail/'+sha(command.idempotencyKey+'\0'+command.commandType+'\0'+command.entityId).slice(0,40)];
  };
  const send=async command=>{
    let attempt;
    if(command.commandType==='visit.hr.fields.update'){
      receipt.remoteValuesRestored=false;
      attempt={command:structuredClone(command),receiptPaths:commandPaths(command),startedAt:new Date().toISOString(),state:'REMOTE_OUTCOME_UNCERTAIN'};
      (receipt.remoteCommandAttempts??=[]).push(attempt);save();
    }
    const response=await httpJson(F3_QA.baseUrl+'/v1/cxorbia/commands',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json','Idempotency-Key':command.idempotencyKey},body:JSON.stringify(command)});
    if(attempt){attempt.httpStatus=response.status;attempt.response=f3SafeEvidence(response.body);attempt.finishedAt=new Date().toISOString();attempt.state='RESPONSE_RECORDED_RESTORE_STILL_REQUIRED';save();}
    return response;
  };
  const remember=async command=>{for(const p of commandPaths(command)){if(!commands.includes(p)){f3Need(!(await db.doc(p).get()).exists,'PERSISTENCE_FAILURE:F3_QA_RECEIPT_BASELINE_NOT_ABSENT');commands.push(p);}}};
  const postWithBoundedRecovery=async command=>{
    await remember(command);let last;
    for(let attempt=0;attempt<3;attempt++){
      try{last=await send(command);}catch(error){last={status:0,body:{status:'transport_uncertain',code:f3Code(error)}};}
      if(last.body?.status==='committed')return last;
      if(last.body?.status==='conflict'||last.body?.status==='blocked')return last;
      if(![0,202,503,504].includes(last.status))return last;
      receipt.lastPending={commandId:command.idempotencyKey,httpStatus:last.status,code:last.body?.code||null,eventIds:last.body?.hrFieldEventIds||[]};save();
      if(attempt<2)await new Promise(resolve=>setTimeout(resolve,25000));
    }
    return last;
  };
  const reconcile=async(serial)=>{
    const live=await readLive(),key=owner+'-reconcile-'+serial,command={version:'cxorbia-command-adapter-v1',commandType:'hr.snapshot.reconcile',entityType:'hrSnapshot',entityId:live.revision,
      expectedVersion:live.revision,tenantId:'tya',projectId:F3_QA.projectId,periodId:null,requirePeriod:false,payload:{},idempotencyKey:key};
    const p=commandPaths(command)[0];reconcilePaths.add(p);await remember(command);
    const observation={serial,idempotencyKey:key,sourceRevision:live.revision,receiptPath:p,startedAt:new Date().toISOString()};
    (receipt.reconciliations??=[]).push(observation);save();
    let result,transportError;
    try{result=await send(command);observation.http={status:result.status,body:f3SafeEvidence(result.body)};}
    catch(error){transportError=error;observation.transportError=f3Code(error);}
    observation.finishedAt=new Date().toISOString();save();
    try{
      const ref=db.doc(p),[record,stages,intents,effects,scopeLock]=await Promise.all([ref.get(),ref.collection('stages').get(),ref.collection('intents').get(),ref.collection('effects').get(),db.doc(lockPath).get()]);
      const rows=snapshot=>snapshot.docs.map(doc=>({path:doc.ref.path,data:f3SafeEvidence(doc.data())}));
      observation.durable={receipt:record.exists?f3SafeEvidence(record.data()):null,stages:rows(stages),intents:rows(intents),effects:rows(effects),scopeLock:scopeLock.exists?f3SafeEvidence(scopeLock.data()):null,readAt:new Date().toISOString()};
      save();
    }catch(error){observation.durableReadbackError=f3Code(error);save();throw error;}
    if(transportError)throw transportError;
    f3Need(result.status===200&&result.body.ok===true&&result.body.readbackVerified===true&&result.body.authWrites===0,'PERSISTENCE_FAILURE:F3_QA_RECONCILE_ACK');
    recordCase('explicit_reconcile_'+serial,{sourceRevision:live.revision,receiptPath:p,authWrites:result.body.authWrites});
  };
  let serial=0;
  const executeField=async(country,fieldKey,value,caseName)=>{
    const live=await readLive(),visit=live.rows.find(x=>(x.id||x.visitId)===F3_QA.visits[country]),durable=await db.doc(projectPath+'/visits/'+F3_QA.visits[country]).get();
    f3Need(durable.exists,'PERSISTENCE_FAILURE:F3_QA_DURABLE_VISIT');
    const command=f3FieldCommand({owner,serial:++serial,visit,revision:live.revision,version:durable.data().version,fieldKey,value});
    const response=await postWithBoundedRecovery(command);f3Need(response.status===200,'PERSISTENCE_FAILURE:F3_QA_ENDPOINT_NOT_COMMITTED');const eventId=assertF3RemoteAck(response.body);
    const eventSnap=await db.doc(projectPath+'/hrFieldEvents/'+eventId).get(),deliverySnap=await db.doc(projectPath+'/hrFieldDeliveries/'+eventId).get(),event=eventSnap.data(),delivery=deliverySnap.data();
    f3Need(eventSnap.exists&&event.origin==='platform'&&event.actorUid===adminUid&&event.fieldKey===fieldKey&&event.countryCode===country&&event.periodId===F3_QA.periodId&&f3Same(event.after,value),'PERSISTENCE_FAILURE:F3_QA_EVENT_READBACK');
    f3Need(deliverySnap.exists&&delivery.status==='committed'&&delivery.providerAck===true&&delivery.readbackVerified===true&&delivery.eventDigest===event.eventDigest&&/^[a-f0-9]{32}$/i.test(delivery.providerExecutionId||''),'PROVIDER_FAILURE:F3_QA_DELIVERY_READBACK');
    const after=await readLive(),observed=after.rows.find(x=>(x.id||x.visitId)===F3_QA.visits[country]);f3Need(f3Same(observed[fieldKey],value),'PROVIDER_FAILURE:F3_QA_INDEPENDENT_READBACK');
    const attempts=(await db.doc(projectPath+'/hrFieldDeliveries/'+eventId).collection('attempts').get()).docs.map(x=>({id:x.id,...x.data()}));
    const physical=attempts.filter(x=>x.id.endsWith('-intent')&&x.recoveryOnly!==true).length;f3Need(physical===1,'PERSISTENCE_FAILURE:F3_QA_MULTIPLE_WRITE_ATTEMPTS');
    const metadata={eventId,eventDigest:event.eventDigest,countryCode:country,fieldKey,providerExecutionId:delivery.providerExecutionId,deliveryDigest:f3Digest(delivery),
      remoteEventKey:'event:'+eventId,remoteHeadKey:f3Digest(['tya',F3_QA.projectId,F3_QA.periodId,country,F3_QA.visits[country],fieldKey]),sourceRevisionBefore:live.revision,sourceRevisionAfter:after.revision};
    receipt.events.push(metadata);recordCase(caseName,{...metadata,ackVerified:true,independentSourceReadback:true,nonRecoveryAttempts:physical});
    return {command,eventId,attempts:attempts.length,after};
  };
  try{
    receipt.runtimeBefore=await runtimeRead();save();
    const projectRef=db.doc(projectPath);f3Need(!(await projectRef.get()).exists&&(await projectRef.listCollections()).length===0,'PERSISTENCE_FAILURE:F3_QA_PROJECT_NOT_ABSENT');
    try{await auth.getUser(adminUid);throw Error('AUTH_FAILURE:F3_QA_USER_EXISTS');}catch(error){if(error.code!=='auth/user-not-found')throw error;}
    const member={path:'tenants/tya/users/'+adminUid,data:{...claims,uid:adminUid,active:true,status:'active',synthetic:true,qaOwner:owner}};
    for(const rec of [...profiles,member])f3Need(!(await db.doc(rec.path).get()).exists,'PERSISTENCE_FAILURE:F3_QA_BASELINE_NOT_ABSENT');
    for(const country of F3_QA.countries)for(const letter of ['A','B']){const id='shopper_'+country.toLowerCase()+'_'+sha(('CXOrbia QA '+country+' F3 '+letter).toLowerCase()).slice(0,10);f3Need(!(await db.doc('tenants/tya/shopperIdentityCrosswalk/'+id).get()).exists,'PERSISTENCE_FAILURE:F3_QA_ALIAS_NOT_ABSENT');}
    const lock=await db.doc(lockPath).get();baselineLock=lock.exists?lock.data():null;
    receipt.scopeLockBaseline={path:lockPath,existed:lock.exists,data:f3SafeEvidence(baselineLock),digest:f3Digest(baselineLock),readAt:new Date().toISOString(),updateTime:lock.updateTime?.toDate?.().toISOString()||null};save();
    f3Need(!baselineLock||baselineLock.status==='committed','PERSISTENCE_FAILURE:F3_QA_RECONCILE_SCOPE_NOT_QUIESCENT');baselineReady=true;
    for(const rec of [...profiles,member]){written.set(rec.path,f3Digest(rec.data));await db.doc(rec.path).create(rec.data);f3Need(f3Same((await db.doc(rec.path).get()).data(),rec.data),'PERSISTENCE_FAILURE:F3_QA_SETUP_READBACK');}
    authCreated=true;await auth.createUser({uid:adminUid,displayName:'CXOrbia isolated QA operator',disabled:false});await auth.setCustomUserClaims(adminUid,claims);
    const init=await httpJson(F3_QA.baseUrl+'/__/firebase/init.json');f3Need(init.body.projectId===F3_QA.firebaseProject&&!!init.body.apiKey,'AUTH_FAILURE:F3_QA_FIREBASE_CONFIG');
    let custom=await auth.createCustomToken(adminUid,claims);const exchanged=await httpJson('https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key='+encodeURIComponent(init.body.apiKey),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token:custom,returnSecureToken:true})});custom='';
    token=exchanged.body.idToken||'';f3Need(exchanged.status===200&&token,'AUTH_FAILURE:F3_QA_TOKEN_EXCHANGE');const decoded=await auth.verifyIdToken(token,true);f3Need(decoded.uid===adminUid&&decoded.role==='admin'&&decoded.tenantId==='tya'&&f3Same(decoded.projectIds,[F3_QA.projectId]),'AUTH_FAILURE:F3_QA_CLAIMS_READBACK');
    const baseline=await readLive();for(const row of baseline.rows)f3Need(row.shopperId==null&&row.agendada==null&&row.escenario==='CXOrbia QA Escenario A'&&row.tipoCombo==='CXOrbia QA Combo A','MAPPING_FAILURE:F3_QA_SEED_NOT_BASELINE');
    receipt.initialSourceRevision=baseline.revision;
    receipt.remoteBaseline={revision:baseline.revision,rows:baseline.rows.map(row=>({visitId:row.id||row.visitId,countryCode:row.country||row.pais,periodId:row.periodId,hrRowId:row.hrRowId,worksheetFingerprint:row.excelWorksheetFingerprint,values:Object.fromEntries(F3_QA.fields.map(key=>[key,row[key]??null]))})),readAt:new Date().toISOString()};save();
    await reconcile('initial');
    let first;
    for(const country of F3_QA.countries){
      const vals={escenario:'CXOrbia QA Escenario B',tipoCombo:'CXOrbia QA Combo B',agendada:'2026-11-29',shopperId:'qa_f3_20261124_'+country.toLowerCase()+'_a'};
      for(const fieldKey of F3_QA.fields){const row=await executeField(country,fieldKey,vals[fieldKey],country+'_'+fieldKey+'_write');if(!first)first=row;}
    }
    // Retry the exact committed command. Actual transport fault injection is a
    // separate proof obligation and is not claimed by this endpoint run.
    const replay=await send(first.command);assertF3RemoteAck(replay.body);
    const attemptsAfter=(await db.doc(projectPath+'/hrFieldDeliveries/'+first.eventId).collection('attempts').get()).size;
    f3Need(attemptsAfter===first.attempts&&replay.body.idempotentReplay===true,'PERSISTENCE_FAILURE:F3_QA_REPLAY_WROTE');recordCase('exact_replay_no_write',{eventId:first.eventId});
    const tampered=structuredClone(first.command);tampered.payload.patch.escenario='CXOrbia QA Escenario C';const bad=await send(tampered);
    f3Need(bad.body.ok===false&&bad.body.code==='OPS_IDEMPOTENCY_KEY_REUSED_DIFFERENT_PAYLOAD','PERSISTENCE_FAILURE:F3_QA_IDEMPOTENCY_CONFLICT');recordCase('same_key_changed_payload_rejected');
    const newer=await executeField('GT','escenario','CXOrbia QA Escenario C','GT_escenario_ordered_successor');
    const stale=structuredClone(first.command);stale.idempotencyKey=owner+'-stale-base';stale.expectedVersion=(await db.doc(projectPath+'/visits/'+F3_QA.visits.GT).get()).data().version;
    await remember(stale);const blocked=await send(stale);f3Need(blocked.body.ok===false&&['OPS_HR_FIELD_BASE_CONFLICT','OPS_HR_FIELD_SOURCE_REVISION_CONFLICT'].includes(blocked.body.code),'PERSISTENCE_FAILURE:F3_QA_STALE_BASE_ACCEPTED');recordCase('stale_base_rejected');
    const oldReplay=await send(first.command);assertF3RemoteAck(oldReplay.body);const current=await readLive();f3Need(current.rows.find(x=>(x.id||x.visitId)===F3_QA.visits.GT).escenario==='CXOrbia QA Escenario C','PERSISTENCE_FAILURE:F3_QA_OLD_EVENT_ROLLBACK');recordCase('old_committed_receipt_replay_does_not_rollback',{historicalAck:true,currentEventId:newer.eventId});
    for(const country of F3_QA.countries){for(const [fieldKey,value]of [['shopperId',null],['agendada',null],['tipoCombo','CXOrbia QA Combo A'],['escenario','CXOrbia QA Escenario A']])await executeField(country,fieldKey,value,country+'_'+fieldKey+'_restore');}
    await reconcile('restored');receipt.remoteRestoreReadback=f3VerifyRestoredBaseline(receipt.remoteBaseline,await readLive());
    receipt.runtimeAfter=await runtimeRead();receipt.applicationAckProven=true;receipt.remoteValuesRestored=true;
    receipt.decision='PASS_F3_ISOLATED_ENDPOINT_CHAIN_REMOTE_CLEANUP_PENDING';
  }catch(error){receipt.failure=f3Code(error);receipt.decision='HOLD_F3_ISOLATED_ENDPOINT';throw error;
  }finally{
    const cleanupErrors=[],snapshots=[];
    const enumerate=async ref=>{const snap=await ref.get();if(snap.exists)snapshots.push({path:ref.path,data:snap.data()});for(const collection of await ref.listCollections())for(const doc of (await collection.get()).docs)await enumerate(doc.ref);};
    const remove=async row=>{f3Need(f3OwnedCleanupPath(row.path,owner,commands),'PERSISTENCE_FAILURE:F3_QA_CLEANUP_SCOPE');await db.runTransaction(async tx=>{const ref=db.doc(row.path),live=await tx.get(ref);if(!live.exists)return;f3Need(f3Same(live.data(),row.data),'PERSISTENCE_FAILURE:F3_QA_CLEANUP_DRIFT');tx.delete(ref);});f3Need(!(await db.doc(row.path).get()).exists,'PERSISTENCE_FAILURE:F3_QA_CLEANUP_READBACK');};
    if(baselineReady){
      try{
        const project=await db.doc(projectPath).get();if(project.exists)f3Need(project.data().qaOwner===owner,'PERSISTENCE_FAILURE:F3_QA_PROJECT_OWNER');
        // An HTTP timeout can leave an executing server lease. Do not erase its
        // journal or binding while it can still commit a remote operation.
        let heads;
        for(let attempt=0;attempt<5;attempt++){
          heads=await db.doc(projectPath).collection('hrFieldHeads').get();
          if(!heads.docs.some(x=>x.data().leaseOwner&&Number(x.data().leaseUntil)>Date.now()))break;
          if(attempt===4)throw Error('PERSISTENCE_FAILURE:F3_QA_ACTIVE_REMOTE_LEASE');
          await new Promise(resolve=>setTimeout(resolve,25000));
        }
        const events=await db.doc(projectPath).collection('hrFieldEvents').get();
        for(const doc of events.docs){
          const event=doc.data();f3Need(event.tenantId==='tya'&&event.projectId===F3_QA.projectId&&event.periodId===F3_QA.periodId&&/^hfe-[a-f0-9]{64}$/.test(doc.id),'PERSISTENCE_FAILURE:F3_QA_JOURNAL_SCOPE');
          const deliveryRef=db.doc(projectPath+'/hrFieldDeliveries/'+doc.id),delivery=await deliveryRef.get(),attempts=await deliveryRef.collection('attempts').get();
          let item=receipt.events.find(e=>e.eventId===doc.id);
          if(!item){item={eventId:doc.id,eventDigest:event.eventDigest,countryCode:event.countryCode,fieldKey:event.fieldKey,remoteEventKey:'event:'+doc.id,
            remoteHeadKey:f3Digest(['tya',F3_QA.projectId,F3_QA.periodId,event.countryCode,event.visitId,event.fieldKey])};receipt.events.push(item);}
          item.event=event;item.delivery=delivery.exists?delivery.data():null;item.attempts=attempts.docs.map(x=>({id:x.id,...x.data()}));
        }
        save();
        receipt.remoteRestoreCleanupGuard=f3RequireRemoteRestoredBeforeCleanup(receipt);save();
        // Establish lock/receipt ownership before deleting any QA document. A
        // partial or foreign lock keeps all Firestore evidence for recovery.
        const lockBeforeSnap=await db.doc(lockPath).get(),lockBefore=lockBeforeSnap.exists?lockBeforeSnap.data():null;
        const lockReceipts=await Promise.all([...reconcilePaths].map(async p=>{const snap=await db.doc(p).get();return {path:p,data:snap.exists?snap.data():null};}));
        receipt.cleanupLockPreflight={path:lockPath,current:f3SafeEvidence(lockBefore),digest:f3Digest(lockBefore),receipts:f3SafeEvidence(lockReceipts),readAt:new Date().toISOString()};save();
        receipt.cleanupLockPreflight.decision=f3AssertCleanupLock({current:lockBefore,baseline:baselineLock,owner,reconcilePaths:[...reconcilePaths],receipts:lockReceipts});save();
        await enumerate(db.doc(projectPath));for(const p of commands)await enumerate(db.doc(p));
        receipt.cleanupDocumentPlan=snapshots.map(row=>({path:row.path,digest:f3Digest(row.data)}));save();
        for(const row of snapshots.sort((a,b)=>b.path.split('/').length-a.path.split('/').length))await remove(row);
        for(const [p]of written){if(p===projectPath)continue;const snap=await db.doc(p).get();if(snap.exists){f3Need(snap.data().qaOwner===owner&&f3Digest(snap.data())===written.get(p),'PERSISTENCE_FAILURE:F3_QA_DOCUMENT_OWNER_OR_DRIFT');await remove({path:p,data:snap.data()});}}
        for(const country of F3_QA.countries)for(const letter of ['A','B']){const id='shopper_'+country.toLowerCase()+'_'+sha(('CXOrbia QA '+country+' F3 '+letter).toLowerCase()).slice(0,10),p='tenants/tya/shopperIdentityCrosswalk/'+id,snap=await db.doc(p).get();if(snap.exists){const row=snap.data();f3Need(row.projectId===F3_QA.projectId&&row.tenantId==='tya'&&receipt.events.some(e=>e.eventId===row.originEventId),'PERSISTENCE_FAILURE:F3_QA_ALIAS_OWNER');commands.push(p);await remove({path:p,data:row});}}
        await db.runTransaction(async tx=>{const ref=db.doc(lockPath),snap=await tx.get(ref),current=snap.exists?snap.data():null;f3Need(f3Same(current,lockBefore),'PERSISTENCE_FAILURE:F3_QA_LOCK_CLEANUP_DRIFT');if(f3Same(current,baselineLock))return;if(baselineLock)tx.set(ref,baselineLock);else tx.delete(ref);});
        f3Need(f3Same((await db.doc(lockPath).get()).data()??null,baselineLock),'PERSISTENCE_FAILURE:F3_QA_LOCK_RESTORE');
        f3Need(!(await db.doc(projectPath).get()).exists&&(await db.doc(projectPath).listCollections()).length===0,'PERSISTENCE_FAILURE:F3_QA_SUBTREE_CLEANUP');receipt.cleanup.firestore=true;
      }catch(error){cleanupErrors.push(f3Code(error));}
    }
    if(authCreated&&receipt.cleanup.firestore===true)try{const user=await auth.getUser(adminUid);f3Need(user.uid===adminUid&&(user.customClaims?.qaOwner===owner||Object.keys(user.customClaims||{}).length===0&&user.displayName==='CXOrbia isolated QA operator'),'AUTH_FAILURE:F3_QA_CLEANUP_USER_OWNER');await auth.deleteUser(adminUid);try{await auth.getUser(adminUid);throw Error('AUTH_FAILURE:F3_QA_AUTH_CLEANUP_READBACK');}catch(error){if(error.code!=='auth/user-not-found')throw error;}receipt.cleanup.auth=true;}catch(error){cleanupErrors.push(f3Code(error));}
    if(authCreated&&receipt.cleanup.firestore!==true)receipt.cleanup.authPreservedForRecovery=true;
    receipt.remoteCleanup={required:true,scenarioId:10199316,dataStoreId:213856,eventKeys:receipt.events.map(e=>e.remoteEventKey),headKeys:[...new Set(receipt.events.map(e=>e.remoteHeadKey))],worksheetNames:F3_QA.countries.map(c=>manifest.countries[c].worksheetName),rule:'ROOT_VERIFIES_EXACT_KEYS_AND_CURRENT_OWNER_BEFORE_DELETE_THEN_READS_ABSENCE'};
    if(cleanupErrors.length){receipt.cleanupErrors=cleanupErrors;receipt.decision='HOLD_F3_QA_CLEANUP_UNVERIFIED';process.exitCode=1;}
    receipt.recoveryRequired=(receipt.remoteCommandAttempts||[]).length>0&&receipt.remoteValuesRestored!==true;
    if(receipt.recoveryRequired)receipt.recoveryScope={qaOwner:owner,adminUid,projectPath,lockPath,commandAttempts:receipt.remoteCommandAttempts.length,rule:'PRESERVE_FIRESTORE_AUTH_MAKE_AND_QA_WORKSHEETS_UNTIL_EXACT_OWNED_RECOVERY_AND_FRESH_BASELINE_READBACK'};
    token='';receipt.state='HOLD';save();await appSdk.deleteApp(app);
    console.log('CXORBIA_F3_QA_ENDPOINT_RECEIPT='+JSON.stringify({decision:receipt.decision,applicationAckProven:receipt.applicationAckProven,cases:receipt.cases.length,events:receipt.events.length,cleanup:receipt.cleanup,productionWrites:0,operationalHrWrites:0,b14Closed:false}));
  }
}


// Read-only recovery mode for the exact failed RUN2768. No fixture setup,
// reconcile, provider execution or deletion is reachable from this entry point.
const f3RecoveryNeed=(ok,code)=>f3Need(ok,'PERSISTENCE_FAILURE:'+code);
export const F3_RUN2768_TARGET=Object.freeze({runId:'45386193183',runAttempt:'1',owner:'f3-qa-45386193183-1',firebaseProject:'cxorbia-backend-dev',tenantId:'tya',projectId:'f3-qa-20261124',
 sourceRevision:'fa89c4b7e02fab97cb5c932e832ede7712d02cf698da47bc50fbb3c1508106d0',
 receiptPath:'tenants/tya/commandReceipts/hr-53fe7531b74aedc6106a3cb2bf661999a1e50fb25d0fe14faddab974a4f3fe40',
 sourceReceiptSha256:'89bd49c65e0bab70ff9224797ca04413696ac326ecaa3679f76bf01bf63667c8',healthEvidenceSha256:'ef496b87f098af7b86043f839a598b47de16478de1fc2debd9e23a3fa1bc0430'});
const F3_RUN2768_PROJECT_PATH='tenants/tya/projects/'+F3_RUN2768_TARGET.projectId,F3_RUN2768_LOCK_PATH='tenants/tya/commandReceipts/hr-scope-'+f3Digest('tya'),F3_RUN2768_ADMIN_UID=F3_RUN2768_TARGET.owner+'-admin';
export const F3_RUN2768_TARGET_PATHS=Object.freeze([
 F3_RUN2768_PROJECT_PATH,F3_RUN2768_TARGET.receiptPath,'tenants/tya/users/'+F3_RUN2768_ADMIN_UID,
 F3_RUN2768_PROJECT_PATH+'/visits/hr_excel_45c62e0543d229c8ca625f3cf857',F3_RUN2768_PROJECT_PATH+'/visits/hr_excel_ec25c41b6656f0000daef0af1398',
 ...['GT','HN'].map(c=>'tenants/tya/integrationSettings/'+F3_RUN2768_TARGET.owner+'-'+c),
 ...['GT','HN'].flatMap(c=>['a','b'].map(letter=>'tenants/tya/shoppers/qa_f3_20261124_'+c.toLowerCase()+'_'+letter)),
 ...['GT','HN'].flatMap(c=>['A','B'].map(letter=>'tenants/tya/shopperIdentityCrosswalk/shopper_'+c.toLowerCase()+'_'+sha(('CXOrbia QA '+c+' F3 '+letter).toLowerCase()).slice(0,10)))
]);
f3RecoveryNeed(F3_RUN2768_TARGET.receiptPath==='tenants/tya/commandReceipts/hr-'+f3Digest([F3_RUN2768_TARGET.projectId,F3_RUN2768_TARGET.owner+'-reconcile-initial']),'F3_RECOVERY_STATIC_RECEIPT_ID');

export async function f3ReadRun2768State({db,auth}){
 const [scopeLock,docs,projectCollections,receiptCollections]=await Promise.all([
  db.doc(F3_RUN2768_LOCK_PATH).get(),Promise.all(F3_RUN2768_TARGET_PATHS.map(async p=>{const snap=await db.doc(p).get();return {path:p,exists:snap.exists,digest:f3Digest(snap.exists?snap.data():null),qaOwner:snap.exists?(snap.data().qaOwner||null):null};})),
  db.doc(F3_RUN2768_PROJECT_PATH).listCollections(),db.doc(F3_RUN2768_TARGET.receiptPath).listCollections()
 ]);
 let authState;
 try{const u=await auth.getUser(F3_RUN2768_ADMIN_UID);authState={uid:u.uid,exists:true,qaOwner:u.customClaims?.qaOwner||null};}
 catch(error){if(error.code!=='auth/user-not-found')throw Error('AUTH_FAILURE:F3_RECOVERY_AUTH_READ');authState={uid:F3_RUN2768_ADMIN_UID,exists:false};}
 const raw=scopeLock.exists?scopeLock.data():null,data=f3SafeEvidence(raw);
 return {schemaVersion:'cxorbia.f3.run2768.orphan-readback.v1',target:F3_RUN2768_TARGET,readAt:new Date().toISOString(),
  lock:{path:F3_RUN2768_LOCK_PATH,exists:scopeLock.exists,data,digest:f3Digest(raw),updateTime:scopeLock.updateTime?.toDate?.().toISOString()||null},
  documents:docs,projectCollections:projectCollections.map(c=>c.id).sort(),receiptCollections:receiptCollections.map(c=>c.id).sort(),auth:authState,
  writes:0,providerWrites:0,productionWrites:0,priorCommittedBaselineAvailable:false};
}

export function f3AssessRun2768Orphan(state,now=Date.now()){
 f3RecoveryNeed(state.schemaVersion==='cxorbia.f3.run2768.orphan-readback.v1'&&f3Digest(state.target)===f3Digest(F3_RUN2768_TARGET),'F3_RECOVERY_TARGET');
 f3RecoveryNeed(state.lock?.path===F3_RUN2768_LOCK_PATH&&state.lock?.digest===f3Digest(state.lock?.data??null),'F3_RECOVERY_LOCK_READBACK');
 f3RecoveryNeed(Array.isArray(state.documents)&&state.documents.length===F3_RUN2768_TARGET_PATHS.length&&f3Digest(state.documents.map(x=>x.path).sort())===f3Digest([...F3_RUN2768_TARGET_PATHS].sort())&&state.documents.every(x=>x.exists===false),'F3_RECOVERY_QA_DOCS_NOT_ABSENT');
 f3RecoveryNeed(state.projectCollections?.length===0&&state.receiptCollections?.length===0,'F3_RECOVERY_QA_SUBCOLLECTIONS_NOT_ABSENT');
 f3RecoveryNeed(state.auth?.uid===F3_RUN2768_ADMIN_UID&&state.auth.exists===false,'F3_RECOVERY_QA_AUTH_NOT_ABSENT');
 if(state.lock.exists===false&&state.lock.data===null)return {decision:'PASS_F3_RUN2768_ALREADY_ABSENT',action:'none',writes:0};
 const lock=state.lock.data;
 f3RecoveryNeed(state.lock.exists===true&&lock&&Object.keys(lock).sort().join(',')==='attemptId,expiresAt,projectId,receiptPath,status','F3_RECOVERY_LOCK_SHAPE');
 f3RecoveryNeed(lock.projectId===F3_RUN2768_TARGET.projectId&&lock.receiptPath===F3_RUN2768_TARGET.receiptPath&&lock.status==='partial','F3_RECOVERY_LOCK_OWNER');
 f3RecoveryNeed(/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(lock.attemptId),'F3_RECOVERY_ATTEMPT_ID');
 // This run's logged probe lasted 11:40:56–11:41:40Z. The runtime creates a
 // 120s lease, and the entire failed probe completed before one renewal window.
 f3RecoveryNeed(Number.isFinite(lock.expiresAt)&&lock.expiresAt>=Date.parse('2026-11-24T11:40:56Z')+120000&&lock.expiresAt<=Date.parse('2026-11-24T11:41:40Z')+120000&&lock.expiresAt<now,'F3_RECOVERY_LEASE_NOT_PROVEN_EXPIRED');
 return {decision:'REVIEWABLE_F3_RUN2768_EXPIRED_OWNED_ORPHAN',action:'delete_exact_expired_qa_coordination_lock_only',
  lockPath:F3_RUN2768_LOCK_PATH,lockDigest:state.lock.digest,attemptId:lock.attemptId,receiptPath:lock.receiptPath,
  sourceStateDigest:f3Digest(state),restoresHistoricalBaseline:false,priorCommittedBaselineAvailable:false,
  requiresRootWriter:true,operationalDocumentWrites:0,remoteMakeWrites:0,authWrites:0,productionWrites:0};
}

async function runF3Run2768Inspection(){
 const env=process.env;
 if(env.GITHUB_REPOSITORY!=='paulaosoriof86/demoCXOrbia'||env.GITHUB_REF!=='refs/heads/recovery/cxorbia-phase-a-20260831'||env.GOOGLE_CLOUD_PROJECT!==F3_RUN2768_TARGET.firebaseProject||env.CXORBIA_F3_QA_ENDPOINT_GATE!=='PAULA_AUTHORIZED_ISOLATED_F3_ENDPOINT_20261124')throw Error('AUTH_FAILURE:F3_RECOVERY_ENV_SCOPE');
 const requireHere=createRequire(import.meta.url),requireAdmin=createRequire(requireHere.resolve('firebase-admin/app')),{GoogleAuth}=requireAdmin('google-auth-library');
 const cloud=new GoogleAuth({scopes:['https://www.googleapis.com/auth/cloud-platform']}),client=await cloud.getClient();
 const principal=String(typeof client.getServiceAccountEmail==='function'?await client.getServiceAccountEmail():client.email||'');
 if(principal!=='firebase-adminsdk-fbsvc@cxorbia-backend-dev.iam.gserviceaccount.com')throw Error('AUTH_FAILURE:F3_RECOVERY_PRINCIPAL');
 const appSdk=await import('firebase-admin/app'),{getAuth}=await import('firebase-admin/auth'),{getFirestore}=await import('firebase-admin/firestore');
 const app=appSdk.initializeApp({credential:appSdk.applicationDefault(),projectId:F3_RUN2768_TARGET.firebaseProject},'f3-run2768-readonly-recovery');
 try{
  const state=await f3ReadRun2768State({db:getFirestore(app),auth:getAuth(app)});
  let plan;try{plan=f3AssessRun2768Orphan(state);}catch(error){plan={decision:'HOLD_F3_RECOVERY_OWNERSHIP_NOT_PROVEN',code:/^[A-Z_]+:[A-Z0-9_]+$/.test(error.message)?error.message:'PERSISTENCE_FAILURE:F3_RECOVERY_UNCLASSIFIED'};}
  const artifact={state,plan,stateDigest:f3Digest(state)},out=path.resolve(env.CXORBIA_F3_RECOVERY_RECEIPT||'.tmp/i3-b14-provider-qa/f3-run2768-orphan-readback.json');
  fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(artifact,null,2)+'\n');
  console.log(JSON.stringify({decision:plan.decision,readOnly:true,writes:0,lockDigest:state.lock.digest,stateDigest:artifact.stateDigest}));
 }finally{await appSdk.deleteApp(app);}
}

// Root reviewed RUN2770's read-only artifact before authorizing this one-record
// cleanup. The previous committed baseline was not recorded and is not rebuilt.
export const F3_RUN2768_CLEANUP_PIN=Object.freeze({
 inspectionRunNumber:2770,artifactId:14917228272,
 artifactSha256:'d00d646fb313d69729875d5364fff113ca13455aab99d0cadc353c56b704e11e',
 receiptPath:'docs/checkpoints/CXORBIA_I3_RUN2770_F3_ORPHAN_INSPECTION_RECEIPT_20261124.json',
 receiptSha256:'0c8f58b7d637a14ff2500ad3af0fb48a49493d15890eb31db2acf3df97a7c675',
 stateDigest:'96ec8dcdb09acf5b26dcc6f9a44a6af37eda63aa37c5d7892de00c5cebd51031',
 lockDigest:'00c688a80c8de65c07f9eafd0b64787c4b824eeba05dfc0ae4ddbbd67504beab',
 attemptId:'3ac9b317-46b4-47d1-abb3-60fe3bace5aa',expiresAt:1795520611209,
 updateTime:'2026-11-24T11:41:31.812Z',
 gate:'ROOT_REVIEWED_RUN2770_EXACT_OWNED_ORPHAN_20261124'
});
export function f3ValidateRun2770InspectionBytes(bytes){
 f3RecoveryNeed(createHash('sha256').update(bytes).digest('hex')===F3_RUN2768_CLEANUP_PIN.receiptSha256,'F3_CLEANUP_INSPECTION_FILE_SHA');
 let artifact;try{artifact=JSON.parse(String(bytes));}catch{throw Error('PERSISTENCE_FAILURE:F3_CLEANUP_INSPECTION_JSON');}
 f3RecoveryNeed(artifact.stateDigest===F3_RUN2768_CLEANUP_PIN.stateDigest&&f3Digest(artifact.state)===F3_RUN2768_CLEANUP_PIN.stateDigest,'F3_CLEANUP_INSPECTION_STATE_SHA');
 const plan=f3AssessRun2768Orphan(artifact.state),lock=artifact.state.lock;
 f3RecoveryNeed(plan.decision==='REVIEWABLE_F3_RUN2768_EXPIRED_OWNED_ORPHAN'&&lock.digest===F3_RUN2768_CLEANUP_PIN.lockDigest&&
  lock.updateTime===F3_RUN2768_CLEANUP_PIN.updateTime&&lock.data.attemptId===F3_RUN2768_CLEANUP_PIN.attemptId&&lock.data.expiresAt===F3_RUN2768_CLEANUP_PIN.expiresAt,'F3_CLEANUP_INSPECTION_EXACT_OWNER');
 return artifact;
}
export async function f3ClearRun2768OwnedOrphan({db,auth,inspectionBytes,checkpoint=()=>{}}){
 f3RecoveryNeed(db.projectId===F3_RUN2768_TARGET.firebaseProject,'F3_CLEANUP_DATABASE_PROJECT');
 const artifact=f3ValidateRun2770InspectionBytes(inspectionBytes),before=await f3ReadRun2768State({db,auth}),plan=f3AssessRun2768Orphan(before);
 await checkpoint('before',{before,pins:F3_RUN2768_CLEANUP_PIN,sourceStateDigest:artifact.stateDigest,writes:0});
 if(plan.decision==='PASS_F3_RUN2768_ALREADY_ABSENT')return {decision:'PASS_F3_RUN2768_OWNED_ORPHAN_ALREADY_ABSENT',idempotentReplay:true,before,after:before,
  writes:0,scopeLockAbsent:true,qaFixtureAbsent:true,qaAuthAbsent:true,restoresHistoricalBaseline:false,remoteMakeWrites:0,authWrites:0,operationalDocumentWrites:0,productionWrites:0};
 f3RecoveryNeed(plan.decision==='REVIEWABLE_F3_RUN2768_EXPIRED_OWNED_ORPHAN'&&before.lock.digest===F3_RUN2768_CLEANUP_PIN.lockDigest&&before.lock.updateTime===F3_RUN2768_CLEANUP_PIN.updateTime,'F3_CLEANUP_CURRENT_OWNER_DRIFT');
 // Retain the native Firestore version for the transaction CAS, including its
 // nanoseconds; the public receipt's ISO timestamp is only an additional pin.
 const versionSnap=await db.doc(F3_RUN2768_LOCK_PATH).get();
 f3RecoveryNeed(versionSnap.exists&&f3Digest(versionSnap.data())===F3_RUN2768_CLEANUP_PIN.lockDigest&&versionSnap.updateTime?.toDate?.().toISOString()===F3_RUN2768_CLEANUP_PIN.updateTime,'F3_CLEANUP_VERSION_DRIFT');
 await db.runTransaction(async tx=>{
  const ref=db.doc(F3_RUN2768_LOCK_PATH),[lock,...docs]=await Promise.all([tx.get(ref),...F3_RUN2768_TARGET_PATHS.map(p=>tx.get(db.doc(p)))]);
  const sameVersion=lock.updateTime&&versionSnap.updateTime&&typeof lock.updateTime.isEqual==='function'&&lock.updateTime.isEqual(versionSnap.updateTime);
  f3RecoveryNeed(lock.exists&&sameVersion&&f3Digest(lock.data())===F3_RUN2768_CLEANUP_PIN.lockDigest&&docs.every(snap=>snap.exists===false),'F3_CLEANUP_TRANSACTION_DRIFT');
  tx.delete(ref);
 });
 await checkpoint('deleted',{writes:1,deletedPath:F3_RUN2768_LOCK_PATH,removedLock:before.lock,sourceStateDigest:artifact.stateDigest});
 const after=await f3ReadRun2768State({db,auth});
 f3RecoveryNeed(f3AssessRun2768Orphan(after).decision==='PASS_F3_RUN2768_ALREADY_ABSENT','F3_CLEANUP_POST_DELETE_READBACK');
 return {decision:'PASS_F3_RUN2768_EXACT_OWNED_ORPHAN_REMOVED',idempotentReplay:false,before,after,removedLock:before.lock,
  writes:1,scopeLockAbsent:true,qaFixtureAbsent:true,qaAuthAbsent:true,restoresHistoricalBaseline:false,remoteMakeWrites:0,authWrites:0,operationalDocumentWrites:0,productionWrites:0};
}
async function runF3Run2768Cleanup(){
 const env=process.env;
 if(!/^\d{8,}$/.test(String(env.GITHUB_RUN_ID||''))||!/^\d+$/.test(String(env.GITHUB_RUN_ATTEMPT||'1')))throw Error('AUTH_FAILURE:F3_CLEANUP_RUN_ID');
 if(env.GITHUB_REPOSITORY!=='paulaosoriof86/demoCXOrbia'||env.GITHUB_REF!=='refs/heads/recovery/cxorbia-phase-a-20260831'||env.GOOGLE_CLOUD_PROJECT!==F3_RUN2768_TARGET.firebaseProject||env.CXORBIA_F3_QA_ENDPOINT_GATE!=='PAULA_AUTHORIZED_ISOLATED_F3_ENDPOINT_20261124'||env.CXORBIA_F3_RUN2768_CLEANUP_GATE!==F3_RUN2768_CLEANUP_PIN.gate)throw Error('AUTH_FAILURE:F3_CLEANUP_ENV_SCOPE');
 const inspectionBytes=fs.readFileSync(F3_RUN2768_CLEANUP_PIN.receiptPath);
 f3ValidateRun2770InspectionBytes(inspectionBytes);
 const out=path.resolve(env.CXORBIA_F3_CLEANUP_RECEIPT||'.tmp/i3-b14-provider-qa/f3-run2768-cleanup.json');
 const receipt={schemaVersion:'cxorbia.f3.run2768.owned-orphan-cleanup.v1',state:'HOLD',decision:'PENDING',runId:String(env.GITHUB_RUN_ID||''),runAttempt:String(env.GITHUB_RUN_ATTEMPT||'1'),target:F3_RUN2768_TARGET,pins:F3_RUN2768_CLEANUP_PIN,
  writes:0,remoteMakeWrites:0,authWrites:0,operationalDocumentWrites:0,productionWrites:0,restoresHistoricalBaseline:false};
 const save=()=>{fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(f3SafeEvidence(receipt),null,2)+'\n');};save();
 const requireHere=createRequire(import.meta.url),requireAdmin=createRequire(requireHere.resolve('firebase-admin/app')),{GoogleAuth}=requireAdmin('google-auth-library');
 const cloud=new GoogleAuth({scopes:['https://www.googleapis.com/auth/cloud-platform']}),client=await cloud.getClient();
 const principal=String(typeof client.getServiceAccountEmail==='function'?await client.getServiceAccountEmail():client.email||'');
 if(principal!=='firebase-adminsdk-fbsvc@cxorbia-backend-dev.iam.gserviceaccount.com')throw Error('AUTH_FAILURE:F3_CLEANUP_PRINCIPAL');
 const appSdk=await import('firebase-admin/app'),{getAuth}=await import('firebase-admin/auth'),{getFirestore}=await import('firebase-admin/firestore');
 const app=appSdk.initializeApp({credential:appSdk.applicationDefault(),projectId:F3_RUN2768_TARGET.firebaseProject},'f3-run2768-owned-orphan-cleanup');
 try{
  const result=await f3ClearRun2768OwnedOrphan({db:getFirestore(app),auth:getAuth(app),inspectionBytes,checkpoint:async(stage,data)=>{receipt.lastStage=stage;Object.assign(receipt,data);save();}});
  Object.assign(receipt,result,{finishedAt:new Date().toISOString()});save();
  console.log(JSON.stringify({decision:receipt.decision,writes:receipt.writes,scopeLockAbsent:receipt.scopeLockAbsent,qaFixtureAbsent:receipt.qaFixtureAbsent,remoteMakeWrites:0,authWrites:0,productionWrites:0}));
 }catch(error){receipt.decision='HOLD_F3_RUN2768_CLEANUP_UNVERIFIED';receipt.failure=/^[A-Z_]+:[A-Z0-9_]+$/.test(error.message)?error.message:'PERSISTENCE_FAILURE:F3_CLEANUP_UNCLASSIFIED';save();throw error;}
 finally{await appSdk.deleteApp(app);}
}

if(process.argv[1]&&pathToFileURL(process.argv[1]).href===import.meta.url){
  if(process.argv.includes('--self-test'))selfTest();
  else if(process.argv.includes('--f3-cleanup-run2768'))runF3Run2768Cleanup().catch(err=>{console.error('F3_QA_CLEANUP_HOLD',/^[A-Z_]+:[A-Z0-9_]+$/.test(err.message)?err.message:'PERSISTENCE_FAILURE:F3_CLEANUP_UNCLASSIFIED');process.exitCode=1;});
  else if(process.argv.includes('--f3-inspect-run2768'))runF3Run2768Inspection().catch(err=>{console.error('F3_QA_RECOVERY_HOLD',/^[A-Z_]+:[A-Z0-9_]+$/.test(err.message)?err.message:'PERSISTENCE_FAILURE:F3_RECOVERY_UNCLASSIFIED');process.exitCode=1;});
  else if(process.argv.includes('--f3-endpoint'))runF3EndpointProbe().catch(err=>{console.error('F3_QA_ENDPOINT_HOLD',f3Code(err));process.exitCode=1;});
  else runProviderProbe().catch(err=>{console.error('B14_QA_PROVIDER_PROBE_HOLD',String(err?.message||'UNKNOWN').replace(/[^A-Za-z0-9_:-]/g,'').slice(0,160));process.exitCode=1;});
}
