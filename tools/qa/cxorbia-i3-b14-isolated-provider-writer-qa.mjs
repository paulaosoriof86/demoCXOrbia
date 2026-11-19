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

if(process.argv[1]&&pathToFileURL(process.argv[1]).href===import.meta.url){
  if(process.argv.includes('--self-test'))selfTest();
  else runProviderProbe().catch(err=>{console.error('B14_QA_PROVIDER_PROBE_HOLD',String(err?.message||'UNKNOWN').replace(/[^A-Za-z0-9_:-]/g,'').slice(0,160));process.exitCode=1;});
}
