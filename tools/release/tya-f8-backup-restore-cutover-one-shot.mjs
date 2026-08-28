#!/usr/bin/env node
import fs from 'node:fs';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';

const PROJECT='cxorbia-backend-dev';
const REGION='us-central1';
const SERVICE='cxorbia-live-hr-dev';
const ROOT='https://cxorbia-backend-dev.web.app';
const EXPECTED_RELEASE='CXORBIA-PHASE-A-RELEASE-100-FROZEN-20260827-01';
const EXPECTED_REVISION='cxorbia-live-hr-dev-00013-rns';
const AUTH_ID='PAULA-F8-BACKUP-RESTORE-CUTOVER-20260827-01';
const AUTH_PATH='app/docs/evidence/RC15-F8-BACKUP-RESTORE-CUTOVER-AUTHORIZATION-LATEST.json';
const MANIFEST_PATH='backend/config/cxorbia-phase-a-release-manifest-v1.json';
const OUT='app/docs/evidence/RC15-F8-BACKUP-RESTORE-CUTOVER-EXECUTION-LATEST.json';
const RUN_ID=String(process.env.GITHUB_RUN_ID||'local');
const RUN_ATTEMPT=String(process.env.GITHUB_RUN_ATTEMPT||'1');
const AUTH=String(process.env.CXORBIA_F8_BACKUP_RESTORE_CUTOVER_AUTHORIZED||'');
const sha256=v=>crypto.createHash('sha256').update(String(v),'utf8').digest('hex');
const nowIso=()=>new Date().toISOString();
const safeText=v=>String(v||'').replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,'<redacted-email>').replace(/ya29\.[A-Za-z0-9._-]+/g,'<redacted-token>').replace(/-----BEGIN[\s\S]*?-----END[^\n]+-----/g,'<redacted-key>').slice(0,1200);
const ensure=(ok,code)=>{if(!ok)throw new Error(code);};
const readJson=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const writeJson=(p,x)=>{fs.mkdirSync(p.split('/').slice(0,-1).join('/')||'.',{recursive:true});fs.writeFileSync(p,JSON.stringify(x,null,2)+'\n','utf8');};

function cmd(args,{timeout=120000,allowFailure=false}={}){
  const r=spawnSync(args[0],args.slice(1),{encoding:'utf8',timeout,maxBuffer:8*1024*1024,env:{...process.env,CLOUDSDK_CORE_DISABLE_PROMPTS:'1'}});
  const out={status:r.status??1,stdout:r.stdout||'',stderr:r.stderr||'',error:r.error?String(r.error.message||r.error):''};
  if(!allowFailure && out.status!==0)throw new Error(`CMD_FAILED_${args.slice(0,3).join('_')}: ${safeText(out.stderr||out.error||out.stdout)}`);
  return out;
}
function parseJson(text,code){try{return JSON.parse(String(text||'').trim()||'{}');}catch{throw new Error(code);}}
async function api(token,url,{method='GET',body=null}={}){
  const res=await fetch(url,{method,headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:body===null?undefined:JSON.stringify(body),signal:AbortSignal.timeout(30000)});
  const text=await res.text(); let json={}; try{json=text?JSON.parse(text):{};}catch{json={unparsed:true};}
  return {ok:res.ok,status:res.status,json,error:res.ok?null:safeText(json?.error?.message||text||`HTTP_${res.status}`)};
}
async function publicHash(url){const res=await fetch(url,{cache:'no-store',signal:AbortSignal.timeout(20000)});ensure(res.ok,`PUBLIC_READ_HTTP_${res.status}`);const b=Buffer.from(await res.arrayBuffer());return sha256(b);}
async function listCollectionIds(token,database){
  const url=`https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/${encodeURIComponent(database)}/documents:listCollectionIds`;
  let pageToken='';const ids=[];
  do{
    const r=await api(token,url,{method:'POST',body:{pageSize:1000,...(pageToken?{pageToken}:{})}});
    ensure(r.ok,`LIST_COLLECTION_IDS_${database}_${r.status}`);
    for(const id of (r.json?.collectionIds||[]))ids.push(String(id));
    pageToken=String(r.json?.nextPageToken||'');
  }while(pageToken);
  return [...new Set(ids)].sort();
}
function getAccessToken(){const r=cmd(['gcloud','auth','print-access-token'],{timeout:30000});const t=String(r.stdout||'').trim();ensure(t.length>20,'GCLOUD_ACCESS_TOKEN_MISSING');return t;}
async function testProjectPermissions(token,permissions){
  const r=await api(token,`https://cloudresourcemanager.googleapis.com/v1/projects/${PROJECT}:testIamPermissions`,{method:'POST',body:{permissions}});
  ensure(r.ok,`PROJECT_TEST_IAM_HTTP_${r.status}`);
  return new Set((r.json?.permissions||[]).map(String));
}
function getRevisionName(serviceJson){return String(serviceJson?.status?.latestReadyRevisionName||serviceJson?.status?.latestCreatedRevisionName||serviceJson?.latestReadyRevision||'').split('/').pop();}

const state={
  schemaVersion:'cxorbia.rc15.f8.backup-restore-cutover.execution.v1',
  generatedAt:null,
  authorizationId:AUTH_ID,
  authorizationConsumed:false,
  automaticRetryAllowed:false,
  runId:RUN_ID,
  runAttempt:RUN_ATTEMPT,
  projectId:PROJECT,
  releaseId:EXPECTED_RELEASE,
  decision:'HOLD_NOT_STARTED',
  stage:'INIT',
  productP0Proven:false,
  backup:{started:false,completed:false,retained:false,locatorStoredInProviderOnly:true,uriSha256:null,bucketFingerprint:null},
  restoreVerification:{temporaryDatabaseCreated:false,importStarted:false,importCompleted:false,topLevelCollectionsMatch:false,temporaryDatabaseDeleted:false,tempDatabaseFingerprint:null},
  cutover:{redeployRequired:false,deploys:0,rebuilds:0,releaseReimports:0,reconciledExactFrozenRelease:false},
  preflight:{head:null,releaseManifestExact:false,cloudRunRevisionExact:false,hostingAdapterExact:false,databaseLocation:null,databaseType:null,requiredPermissions:[],grantedPermissions:[],bucketDiscovered:false},
  safety:{providerWrites:0,productionBusinessDataWrites:0,productionFirestoreDocumentWrites:0,authWrites:0,hrWrites:0,rulesWrites:0,paymentWrites:0,makeCalls:0,geminiCalls:0,iamWrites:0,newCredentials:0,newBranches:0,newPullRequests:0,secretPayloadReads:0,credentialsExposed:false,legacyDatabaseAccess:false},
  cleanup:{required:false,completed:true,error:null},
  error:null,
  next:null
};
let tempDb=null;
let exportUri=null;
let mutationStarted=false;

async function main(){
  ensure(AUTH===AUTH_ID,'F8_EXPLICIT_AUTHORIZATION_ID_REQUIRED');
  ensure(RUN_ATTEMPT==='1','F8_SINGLE_USE_WORKFLOW_RERUN_FORBIDDEN');
  const auth=readJson(AUTH_PATH);
  ensure(auth.authorizationId===AUTH_ID&&auth.authorized===true&&auth.singleUse===true&&auth.status==='AUTHORIZED_NOT_YET_CONSUMED','F8_AUTHORIZATION_EVIDENCE_INVALID_OR_CONSUMED');
  ensure(auth.scope?.minimumBackupExport===true&&auth.scope?.controlledRestoreVerification===true&&auth.scope?.strictlyNecessaryProviderMutationsForCutover===true,'F8_AUTHORIZATION_SCOPE_INCOMPLETE');
  const manifest=readJson(MANIFEST_PATH);
  ensure(manifest.releaseId===EXPECTED_RELEASE&&manifest.status==='FROZEN_IMMUTABLE','F8_FROZEN_RELEASE_MANIFEST_MISMATCH');
  ensure(manifest.source?.rebuildAfterFreezeAllowed===false,'F8_RELEASE_REBUILD_MUST_REMAIN_FORBIDDEN');
  state.authorizationConsumed=true;
  state.stage='PRE_MUTATION_DYNAMIC_RECHECK';
  const head=cmd(['git','rev-parse','HEAD'],{timeout:10000}).stdout.trim();
  ensure(!process.env.GITHUB_SHA||head===String(process.env.GITHUB_SHA),'F8_HEAD_EVENT_SHA_DRIFT');
  state.preflight.head=head;
  state.preflight.releaseManifestExact=true;

  cmd(['gcloud','config','set','project',PROJECT],{timeout:30000});
  const serviceJson=parseJson(cmd(['gcloud','run','services','describe',SERVICE,'--region',REGION,'--project',PROJECT,'--format=json'],{timeout:60000}).stdout,'F8_CLOUD_RUN_JSON_PARSE_FAILED');
  const revision=getRevisionName(serviceJson);
  ensure(revision===EXPECTED_REVISION,`F8_CLOUD_RUN_REVISION_DRIFT_${revision||'missing'}`);
  state.preflight.cloudRunRevisionExact=true;
  const adapterHash=await publicHash(`${ROOT}/adapters/tya-live-source-refresh-watch-v2.js?f8=${Date.now()}`);
  ensure(adapterHash===String(manifest.provider?.hosting?.certifiedAdapterSha256||''),'F8_HOSTING_CERTIFIED_ADAPTER_DRIFT');
  state.preflight.hostingAdapterExact=true;

  const db=parseJson(cmd(['gcloud','firestore','databases','describe','--database=(default)','--project',PROJECT,'--format=json'],{timeout:60000}).stdout,'F8_DATABASE_DESCRIBE_PARSE_FAILED');
  const location=String(db.locationId||db.location||'');
  const dbType=String(db.type||'FIRESTORE_NATIVE');
  ensure(location,'F8_DATABASE_LOCATION_MISSING');
  ensure(/FIRESTORE_NATIVE/i.test(dbType),'F8_DATABASE_TYPE_NOT_NATIVE');
  state.preflight.databaseLocation=location;
  state.preflight.databaseType='FIRESTORE_NATIVE';

  const token=getAccessToken();
  const required=['datastore.databases.export','datastore.databases.import','datastore.databases.create','datastore.databases.delete','datastore.databases.getMetadata','datastore.operations.get'];
  state.preflight.requiredPermissions=required;
  const granted=await testProjectPermissions(token,required);
  state.preflight.grantedPermissions=required.filter(p=>granted.has(p));
  const missing=required.filter(p=>!granted.has(p));
  ensure(missing.length===0,`F8_PROVIDER_CAPABILITY_MISSING_${missing.join(',')}`);

  const bucketCandidates=[`${PROJECT}.firebasestorage.app`,`${PROJECT}.appspot.com`];
  let bucket=null;
  for(const b of bucketCandidates){
    const r=cmd(['gcloud','storage','buckets','describe',`gs://${b}`,'--project',PROJECT,'--format=json'],{timeout:45000,allowFailure:true});
    if(r.status===0){bucket={name:b,meta:parseJson(r.stdout,'F8_BUCKET_DESCRIBE_PARSE_FAILED')};break;}
  }
  if(!bucket){
    const r=cmd(['gcloud','storage','buckets','list','--project',PROJECT,'--format=json'],{timeout:45000,allowFailure:true});
    if(r.status===0){const arr=parseJson(r.stdout,'F8_BUCKET_LIST_PARSE_FAILED');const xs=Array.isArray(arr)?arr:[];const first=xs.find(x=>String(x?.name||'').includes(PROJECT))||xs[0];if(first?.name)bucket={name:String(first.name),meta:first};}
  }
  ensure(bucket?.name,'F8_EXISTING_BACKUP_BUCKET_NOT_DISCOVERABLE_NO_BUCKET_CREATE_AUTHORIZED');
  state.preflight.bucketDiscovered=true;
  state.backup.bucketFingerprint=sha256(bucket.name).slice(0,20);

  const sourceCollections=await listCollectionIds(token,'(default)');
  const schemaHash=sha256(sourceCollections.join('\n'));
  const stamp=new Date().toISOString().replace(/[-:.TZ]/g,'').slice(0,14);
  exportUri=`gs://${bucket.name}/cxorbia-f8-backup/${stamp}-${RUN_ID}`;
  tempDb=`f8-restore-${stamp.slice(0,12)}`.toLowerCase();
  state.restoreVerification.tempDatabaseFingerprint=sha256(tempDb).slice(0,20);

  state.stage='BACKUP_EXPORT';mutationStarted=true;state.backup.started=true;state.safety.providerWrites++;
  const exp=cmd(['gcloud','firestore','export',exportUri,'--database=(default)','--project',PROJECT,'--format=json','--quiet'],{timeout:1800000});
  state.backup.completed=true;state.backup.retained=true;state.backup.uriSha256=sha256(exportUri);

  state.stage='ISOLATED_RESTORE_DATABASE_CREATE';state.safety.providerWrites++;
  cmd(['gcloud','firestore','databases','create',`--database=${tempDb}`,`--location=${location}`,'--type=firestore-native','--edition=standard','--project',PROJECT,'--format=json','--quiet'],{timeout:600000});
  state.restoreVerification.temporaryDatabaseCreated=true;

  state.stage='ISOLATED_RESTORE_IMPORT';state.restoreVerification.importStarted=true;state.safety.providerWrites++;
  cmd(['gcloud','firestore','import',exportUri,`--database=${tempDb}`,'--project',PROJECT,'--format=json','--quiet'],{timeout:1800000});
  state.restoreVerification.importCompleted=true;

  state.stage='RESTORE_METADATA_VERIFICATION';
  const restoredCollections=await listCollectionIds(token,tempDb);
  ensure(sourceCollections.length>0,'F8_SOURCE_TOP_LEVEL_COLLECTIONS_EMPTY_UNEXPECTED');
  ensure(restoredCollections.length===sourceCollections.length,'F8_RESTORE_COLLECTION_COUNT_MISMATCH');
  ensure(sha256(restoredCollections.join('\n'))===schemaHash,'F8_RESTORE_COLLECTION_SCHEMA_MISMATCH');
  state.restoreVerification.topLevelCollectionsMatch=true;
  state.restoreVerification.sourceTopLevelCollectionCount=sourceCollections.length;
  state.restoreVerification.restoredTopLevelCollectionCount=restoredCollections.length;
  state.restoreVerification.collectionSchemaSha256=schemaHash;

  state.stage='TEMP_RESTORE_DATABASE_CLEANUP';state.safety.providerWrites++;
  cmd(['gcloud','firestore','databases','delete',`--database=${tempDb}`,'--project',PROJECT,'--quiet'],{timeout:600000});
  state.restoreVerification.temporaryDatabaseDeleted=true;
  tempDb=null;

  state.stage='POST_ACTION_RELEASE_RECONCILIATION';
  const postService=parseJson(cmd(['gcloud','run','services','describe',SERVICE,'--region',REGION,'--project',PROJECT,'--format=json'],{timeout:60000}).stdout,'F8_POST_CLOUD_RUN_JSON_PARSE_FAILED');
  ensure(getRevisionName(postService)===EXPECTED_REVISION,'F8_POST_CLOUD_RUN_REVISION_DRIFT');
  const postAdapterHash=await publicHash(`${ROOT}/adapters/tya-live-source-refresh-watch-v2.js?f8post=${Date.now()}`);
  ensure(postAdapterHash===String(manifest.provider?.hosting?.certifiedAdapterSha256||''),'F8_POST_HOSTING_ADAPTER_DRIFT');
  state.cutover.reconciledExactFrozenRelease=true;
  state.decision='PASS_F8_BACKUP_RESTORE_CUTOVER_RECONCILED_NO_REDEPLOY';
  state.stage='TERMINAL_PASS';
  state.next='F9_POSTPRODUCTION_ACCEPTANCE_WINDOW';
  void exp;
}

try{await main();}
catch(error){
  state.error=safeText(error?.message||error);
  state.decision=mutationStarted?'HOLD_F8_AFTER_BOUNDED_PROVIDER_MUTATION':'HOLD_F8_PRE_MUTATION_CAPABILITY_OR_DRIFT';
  state.next='F8_CLASSIFY_SINGLE_CAUSE_NO_AUTOMATIC_RETRY';
}
finally{
  if(tempDb){
    state.cleanup.required=true;state.cleanup.completed=false;
    const del=cmd(['gcloud','firestore','databases','delete',`--database=${tempDb}`,'--project',PROJECT,'--quiet'],{timeout:600000,allowFailure:true});
    if(del.status===0){state.safety.providerWrites++;state.restoreVerification.temporaryDatabaseDeleted=true;state.cleanup.completed=true;state.cleanup.error=null;tempDb=null;}
    else state.cleanup.error=safeText(del.stderr||del.error||del.stdout);
  }
  state.generatedAt=nowIso();
  const auth=readJson(AUTH_PATH);
  auth.status='CONSUMED';auth.consumedAt=state.generatedAt;auth.workflowRunId=RUN_ID;auth.workflowRunAttempt=RUN_ATTEMPT;auth.result=state.decision;auth.automaticRetryAllowed=false;
  writeJson(AUTH_PATH,auth);
  writeJson(OUT,state);
  console.log(JSON.stringify({decision:state.decision,stage:state.stage,authorizationConsumed:state.authorizationConsumed,providerWrites:state.safety.providerWrites,backupRetained:state.backup.retained,restoreVerified:state.restoreVerification.topLevelCollectionsMatch,tempDatabaseDeleted:state.restoreVerification.temporaryDatabaseDeleted,reconciledExactFrozenRelease:state.cutover.reconciledExactFrozenRelease,error:state.error,next:state.next},null,2));
  if(state.decision!=='PASS_F8_BACKUP_RESTORE_CUTOVER_RECONCILED_NO_REDEPLOY')process.exitCode=1;
}
