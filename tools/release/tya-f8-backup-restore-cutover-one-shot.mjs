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
const ERRATA_PATH='backend/config/cxorbia-phase-a-release-manifest-errata-v1.json';
const OUT='app/docs/evidence/RC15-F8-BACKUP-RESTORE-CUTOVER-EXECUTION-LATEST.json';
const EXPECTED_AUTH_BLOB='1f6659a4cdf421a38489c94b174f28ceb5506f54';
const EXPECTED_MANIFEST_BLOB='732dbfd48912b3550c6fb20bc592bd118647263a';
const EXPECTED_ERRATA_BLOB='1122ed9f7961a5ba1c34c1b3b329441fd4516bb3';
const sha256=v=>crypto.createHash('sha256').update(String(v),'utf8').digest('hex');
const safeText=v=>String(v||'').replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,'<redacted-email>').replace(/ya29\.[A-Za-z0-9._-]+/g,'<redacted-token>').replace(/-----BEGIN[\s\S]*?-----END[^\n]+-----/g,'<redacted-key>').slice(0,800);
const ensure=(ok,code)=>{if(!ok)throw new Error(code);};
const readJson=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const writeJson=(p,x)=>{fs.mkdirSync(p.split('/').slice(0,-1).join('/')||'.',{recursive:true});fs.writeFileSync(p,JSON.stringify(x,null,2)+'\n','utf8');};
function git(args){const r=spawnSync('git',args,{encoding:'utf8',timeout:10000});if(r.status!==0)throw new Error(`GIT_${args.join('_')}_FAILED`);return String(r.stdout||'').trim();}
function gitOk(args){const r=spawnSync('git',args,{encoding:'utf8',timeout:10000});return r.status===0;}
async function api(token,url,{method='GET',body=null,timeoutMs=30000}={}){
  const res=await fetch(url,{method,headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:body===null?undefined:JSON.stringify(body),signal:AbortSignal.timeout(timeoutMs)});
  const text=await res.text();let json={};try{json=text?JSON.parse(text):{};}catch{json={unparsed:true};}
  return {ok:res.ok,status:res.status,json,error:res.ok?null:safeText(json?.error?.message||text||`HTTP_${res.status}`)};
}
async function publicHash(url){const res=await fetch(url,{cache:'no-store',signal:AbortSignal.timeout(20000)});ensure(res.ok,`PUBLIC_READ_HTTP_${res.status}`);return sha256(Buffer.from(await res.arrayBuffer()));}
function revisionName(service){return String(service?.latestReadyRevision||service?.traffic?.[0]?.revision||'').split('/').pop();}
async function waitOperation(token,name,{timeoutMs=900000,label='OP'}={}){
  ensure(name&&String(name).startsWith('projects/'),`${label}_OPERATION_NAME_MISSING`);
  const started=Date.now();
  while(Date.now()-started<timeoutMs){
    const r=await api(token,`https://firestore.googleapis.com/v1/${name}`,{timeoutMs:30000});
    ensure(r.ok,`${label}_OPERATION_READ_${r.status}`);
    if(r.json?.done===true){
      if(r.json?.error)throw new Error(`${label}_OPERATION_ERROR_${safeText(r.json.error?.message||r.json.error?.code)}`);
      return r.json;
    }
    await new Promise(resolve=>setTimeout(resolve,5000));
  }
  throw new Error(`${label}_OPERATION_TIMEOUT`);
}
async function listCollectionIds(token,database){
  const ids=[];let pageToken='';
  do{
    const r=await api(token,`https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/${encodeURIComponent(database)}/documents:listCollectionIds`,{method:'POST',body:{pageSize:1000,...(pageToken?{pageToken}:{})}});
    ensure(r.ok,`LIST_COLLECTION_IDS_${database}_${r.status}`);
    for(const id of (r.json?.collectionIds||[]))ids.push(String(id));
    pageToken=String(r.json?.nextPageToken||'');
  }while(pageToken);
  return [...new Set(ids)].sort();
}
async function testProjectPermissions(token,permissions){
  const r=await api(token,`https://cloudresourcemanager.googleapis.com/v1/projects/${PROJECT}:testIamPermissions`,{method:'POST',body:{permissions}});
  ensure(r.ok,`PROJECT_TEST_IAM_HTTP_${r.status}`);
  return new Set((r.json?.permissions||[]).map(String));
}
function bucketLocationCompatible(databaseLocation,bucketLocation){
  const db=String(databaseLocation||'').toLowerCase();
  const bucket=String(bucketLocation||'').toLowerCase();
  if(db==='nam5'||db==='nam7')return bucket==='us'||bucket.startsWith('us-');
  if(db==='eur3')return bucket==='eu'||bucket.startsWith('europe-');
  return bucket===db;
}
async function discoverVerifiedExistingBucket(token,databaseLocation){
  const list=await api(token,`https://storage.googleapis.com/storage/v1/b?project=${encodeURIComponent(PROJECT)}&maxResults=1000&fields=items(name,location,storageClass)`);
  ensure(list.ok,`F8_GCS_PROJECT_BUCKET_LIST_${list.status}`);
  const buckets=Array.isArray(list.json?.items)?list.json.items:[];
  ensure(buckets.length>0,'F8_GCS_PROJECT_BUCKET_LIST_EMPTY');
  const requiredObjectPermissions=['storage.objects.create','storage.objects.get','storage.objects.list','storage.objects.delete'];
  for(const item of buckets){
    const name=String(item?.name||'');if(!name)continue;
    const meta=await api(token,`https://storage.googleapis.com/storage/v1/b/${encodeURIComponent(name)}?fields=name,location,storageClass`);
    if(!meta.ok)continue;
    const location=String(meta.json?.location||'');
    if(!bucketLocationCompatible(databaseLocation,location))continue;
    const query=requiredObjectPermissions.map(p=>`permissions=${encodeURIComponent(p)}`).join('&');
    const perms=await api(token,`https://storage.googleapis.com/storage/v1/b/${encodeURIComponent(name)}/iam/testPermissions?${query}`);
    if(!perms.ok)continue;
    const granted=new Set((perms.json?.permissions||[]).map(String));
    if(requiredObjectPermissions.some(p=>!granted.has(p)))continue;
    return {name,location,storageClass:String(meta.json?.storageClass||''),sameProject:true,source:'gcs_project_inventory_verified',requiredObjectPermissions,grantedObjectPermissions:requiredObjectPermissions.filter(p=>granted.has(p))};
  }
  return null;
}

export async function runF8BackupRestoreCutoverOneShot({accessToken}){
  const runId=String(process.env.GITHUB_RUN_ID||'local');
  const runAttempt=String(process.env.GITHUB_RUN_ATTEMPT||'1');
  const state={
    schemaVersion:'cxorbia.rc15.f8.backup-restore-cutover.execution.v6',generatedAt:null,authorizationId:AUTH_ID,authorizationConsumed:false,automaticRetryAllowed:false,
    runId,runAttempt,projectId:PROJECT,releaseId:EXPECTED_RELEASE,decision:'HOLD_NOT_STARTED',stage:'INIT',productP0Proven:false,
    backup:{started:false,completed:false,retained:false,locatorStoredInProviderOnly:true,uriSha256:null,bucketFingerprint:null,bucketLocation:null,bucketStorageClass:null,bucketSameProject:false,bucketVerifiedSource:null},
    restoreVerification:{temporaryDatabaseCreateRequestAccepted:false,temporaryDatabaseCreated:false,importStarted:false,importCompleted:false,topLevelCollectionsMatch:false,temporaryDatabaseDeleted:false,tempDatabaseFingerprint:null},
    cutover:{redeployRequired:false,deploys:0,rebuilds:0,releaseReimports:0,reconciledExactFrozenRelease:false},
    preflight:{head:null,parentHead:null,authorizationCommit:null,authorizationAncestorOfHead:false,authorizationBlobExact:false,releaseManifestBlobExact:false,releaseManifestErrataBlobExact:false,releaseManifestExact:false,releaseManifestErrataExact:false,hostingAdapterAuthority:null,cloudRunRevisionExact:false,hostingAdapterExact:false,databaseLocation:null,databaseType:null,requiredPermissions:[],grantedPermissions:[],bucketDiscovered:false,bucketObjectPermissionsVerified:false},
    safety:{providerWrites:0,productionBusinessDataWrites:0,productionFirestoreDocumentWrites:0,authWrites:0,hrWrites:0,rulesWrites:0,paymentWrites:0,makeCalls:0,geminiCalls:0,iamWrites:0,newCredentials:0,newBranches:0,newPullRequests:0,secretPayloadReads:0,credentialsExposed:false,legacyDatabaseAccess:false},
    cleanup:{required:false,completed:true,error:null},error:null,next:null
  };
  let tempDb=null;let tempDbCleanupEligible=false;let mutationStarted=false;
  try{
    ensure(accessToken&&String(accessToken).length>20,'F8_ACCESS_TOKEN_ROUTE_MISSING');
    ensure(runAttempt==='1','F8_SINGLE_USE_WORKFLOW_RERUN_FORBIDDEN');
    const auth=readJson(AUTH_PATH);
    ensure(auth.authorizationId===AUTH_ID&&auth.authorized===true&&auth.singleUse===true&&auth.status==='AUTHORIZED_NOT_YET_CONSUMED','F8_AUTHORIZATION_EVIDENCE_INVALID_OR_CONSUMED');
    ensure(auth.scope?.minimumBackupExport===true&&auth.scope?.controlledRestoreVerification===true&&auth.scope?.strictlyNecessaryProviderMutationsForCutover===true,'F8_AUTHORIZATION_SCOPE_INCOMPLETE');
    const manifest=readJson(MANIFEST_PATH);
    ensure(manifest.releaseId===EXPECTED_RELEASE&&manifest.status==='FROZEN_IMMUTABLE','F8_FROZEN_RELEASE_MANIFEST_MISMATCH');
    ensure(manifest.source?.rebuildAfterFreezeAllowed===false,'F8_RELEASE_REBUILD_MUST_REMAIN_FORBIDDEN');
    const errata=readJson(ERRATA_PATH);
    ensure(errata.releaseId===EXPECTED_RELEASE&&errata.status==='ACTIVE_CORRECTION_OVERLAY_NO_RELEASE_REBUILD','F8_RELEASE_ERRATA_INVALID');
    ensure(errata.originalManifest?.path===MANIFEST_PATH&&errata.originalManifest?.blobSha===EXPECTED_MANIFEST_BLOB&&errata.originalManifest?.historicalImmutable===true&&errata.originalManifest?.modifiedByErrata===false,'F8_RELEASE_ERRATA_ORIGINAL_MANIFEST_BINDING_INVALID');
    const correction=errata.corrections?.hostingAdapterSha256;
    ensure(correction?.path==='app/adapters/tya-live-source-refresh-watch-v2.js','F8_RELEASE_ERRATA_ADAPTER_PATH_INVALID');
    ensure(String(correction?.before||'')===String(manifest.provider?.hosting?.certifiedAdapterSha256||''),'F8_RELEASE_ERRATA_BEFORE_HASH_MISMATCH');
    const certifiedAdapterSha=String(correction?.after||'');
    ensure(/^[a-f0-9]{64}$/.test(certifiedAdapterSha),'F8_RELEASE_ERRATA_AFTER_HASH_INVALID');
    ensure(errata.proof?.liveEqualsFrozenFunctionalSource===true&&errata.proof?.liveEqualsFrozenRuntimeSource===true&&errata.proof?.liveEqualsCurrentBranch===true,'F8_RELEASE_ERRATA_PROOF_INCOMPLETE');
    ensure(errata.releaseTuplePreserved?.functionalSourceSha===manifest.source?.functionalSourceSha&&errata.releaseTuplePreserved?.runtimeReleaseSourceSha===manifest.source?.runtimeReleaseSourceSha,'F8_RELEASE_ERRATA_SOURCE_TUPLE_DRIFT');
    ensure(errata.releaseTuplePreserved?.cloudRunRevision===manifest.provider?.cloudRun?.revision&&errata.releaseTuplePreserved?.imageDigest===manifest.provider?.cloudRun?.imageDigest&&errata.releaseTuplePreserved?.hostingRelease===manifest.provider?.hosting?.release&&errata.releaseTuplePreserved?.hostingVersion===manifest.provider?.hosting?.version,'F8_RELEASE_ERRATA_PROVIDER_TUPLE_DRIFT');

    state.stage='PRE_MUTATION_DYNAMIC_RECHECK';
    const head=git(['rev-parse','HEAD']);
    const parent=git(['rev-parse','HEAD^']);
    const authCommit=git(['log','-1','--format=%H','--',AUTH_PATH]);
    const authBlob=git(['hash-object',AUTH_PATH]);
    const manifestBlob=git(['hash-object',MANIFEST_PATH]);
    const errataBlob=git(['hash-object',ERRATA_PATH]);
    state.preflight.head=head;state.preflight.parentHead=parent;state.preflight.authorizationCommit=authCommit;
    state.preflight.authorizationBlobExact=authBlob===EXPECTED_AUTH_BLOB;
    state.preflight.releaseManifestBlobExact=manifestBlob===EXPECTED_MANIFEST_BLOB;
    state.preflight.releaseManifestErrataBlobExact=errataBlob===EXPECTED_ERRATA_BLOB;
    state.preflight.authorizationAncestorOfHead=Boolean(authCommit)&&gitOk(['merge-base','--is-ancestor',authCommit,head]);
    ensure(!process.env.GITHUB_SHA||head===String(process.env.GITHUB_SHA),'F8_HEAD_EVENT_SHA_DRIFT');
    ensure(state.preflight.authorizationBlobExact,'F8_AUTHORIZATION_BLOB_DRIFT');
    ensure(state.preflight.releaseManifestBlobExact,'F8_RELEASE_MANIFEST_BLOB_DRIFT');
    ensure(state.preflight.releaseManifestErrataBlobExact,'F8_RELEASE_MANIFEST_ERRATA_BLOB_DRIFT');
    ensure(state.preflight.authorizationAncestorOfHead,'F8_AUTHORIZATION_NOT_IN_CURRENT_HEAD_LINEAGE');
    state.preflight.releaseManifestExact=true;state.preflight.releaseManifestErrataExact=true;state.preflight.hostingAdapterAuthority='F6_IMMUTABLE_MANIFEST_ERRATA_OVERLAY';

    const run=await api(accessToken,`https://run.googleapis.com/v2/projects/${PROJECT}/locations/${REGION}/services/${SERVICE}`);
    ensure(run.ok,`F8_CLOUD_RUN_READ_${run.status}`);
    ensure(revisionName(run.json)===EXPECTED_REVISION,`F8_CLOUD_RUN_REVISION_DRIFT_${revisionName(run.json)||'missing'}`);
    state.preflight.cloudRunRevisionExact=true;
    const adapterHash=await publicHash(`${ROOT}/adapters/tya-live-source-refresh-watch-v2.js?f8=${Date.now()}`);
    ensure(adapterHash===certifiedAdapterSha,'F8_HOSTING_CERTIFIED_ADAPTER_DRIFT');
    state.preflight.hostingAdapterExact=true;

    const db=await api(accessToken,`https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)`);
    ensure(db.ok,`F8_DATABASE_DESCRIBE_${db.status}`);
    const location=String(db.json?.locationId||'');const dbType=String(db.json?.type||'');
    ensure(location,'F8_DATABASE_LOCATION_MISSING');ensure(dbType==='FIRESTORE_NATIVE','F8_DATABASE_TYPE_NOT_NATIVE');
    state.preflight.databaseLocation=location;state.preflight.databaseType=dbType;

    const required=['datastore.databases.export','datastore.databases.import','datastore.databases.create','datastore.databases.delete','datastore.databases.getMetadata','datastore.operations.get'];
    state.preflight.requiredPermissions=required;
    const granted=await testProjectPermissions(accessToken,required);
    state.preflight.grantedPermissions=required.filter(p=>granted.has(p));
    const missing=required.filter(p=>!granted.has(p));
    ensure(missing.length===0,`F8_PROVIDER_CAPABILITY_MISSING_${missing.join(',')}`);

    const bucket=await discoverVerifiedExistingBucket(accessToken,location);
    ensure(bucket?.name,'F8_EXISTING_VERIFIED_BACKUP_BUCKET_NOT_DISCOVERABLE_NO_BUCKET_CREATE_AUTHORIZED');
    state.preflight.bucketDiscovered=true;state.preflight.bucketObjectPermissionsVerified=true;
    state.backup.bucketFingerprint=sha256(bucket.name).slice(0,20);state.backup.bucketLocation=bucket.location;state.backup.bucketStorageClass=bucket.storageClass;state.backup.bucketSameProject=bucket.sameProject===true;state.backup.bucketVerifiedSource=bucket.source;
    const sourceCollections=await listCollectionIds(accessToken,'(default)');
    ensure(sourceCollections.length>0,'F8_SOURCE_TOP_LEVEL_COLLECTIONS_EMPTY_UNEXPECTED');
    const schemaHash=sha256(sourceCollections.join('\n'));
    const stamp=new Date().toISOString().replace(/[-:.TZ]/g,'').slice(0,14);
    const exportRequestUri=`gs://${bucket.name}/cxorbia-f8-backup/${stamp}-${runId}`;

    state.stage='BACKUP_EXPORT';state.authorizationConsumed=true;mutationStarted=true;state.backup.started=true;state.safety.providerWrites++;
    const exp=await api(accessToken,`https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default):exportDocuments`,{method:'POST',body:{outputUriPrefix:exportRequestUri}});
    ensure(exp.ok,`F8_EXPORT_REQUEST_${exp.status}_${exp.error||''}`);
    const expDone=await waitOperation(accessToken,String(exp.json?.name||''),{timeoutMs:600000,label:'F8_EXPORT'});
    const exportUri=String(expDone?.response?.outputUriPrefix||exportRequestUri);
    state.backup.completed=true;state.backup.retained=true;state.backup.uriSha256=sha256(exportUri);

    tempDb=`f8r-${stamp}-${crypto.randomBytes(4).toString('hex')}`.toLowerCase();
    state.restoreVerification.tempDatabaseFingerprint=sha256(tempDb).slice(0,20);
    state.stage='ISOLATED_RESTORE_DATABASE_CREATE';state.safety.providerWrites++;
    const create=await api(accessToken,`https://firestore.googleapis.com/v1/projects/${PROJECT}/databases?databaseId=${encodeURIComponent(tempDb)}`,{method:'POST',body:{type:'FIRESTORE_NATIVE',locationId:location,deleteProtectionState:'DELETE_PROTECTION_DISABLED'}});
    ensure(create.ok,`F8_TEMP_DATABASE_CREATE_${create.status}_${create.error||''}`);
    tempDbCleanupEligible=true;state.restoreVerification.temporaryDatabaseCreateRequestAccepted=true;
    await waitOperation(accessToken,String(create.json?.name||''),{timeoutMs:600000,label:'F8_DB_CREATE'});
    state.restoreVerification.temporaryDatabaseCreated=true;

    state.stage='ISOLATED_RESTORE_IMPORT';state.restoreVerification.importStarted=true;state.safety.providerWrites++;
    const imp=await api(accessToken,`https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/${encodeURIComponent(tempDb)}:importDocuments`,{method:'POST',body:{inputUriPrefix:exportUri}});
    ensure(imp.ok,`F8_IMPORT_REQUEST_${imp.status}_${imp.error||''}`);
    await waitOperation(accessToken,String(imp.json?.name||''),{timeoutMs:600000,label:'F8_IMPORT'});
    state.restoreVerification.importCompleted=true;

    state.stage='RESTORE_METADATA_VERIFICATION';
    const restoredCollections=await listCollectionIds(accessToken,tempDb);
    ensure(restoredCollections.length===sourceCollections.length,'F8_RESTORE_COLLECTION_COUNT_MISMATCH');
    ensure(sha256(restoredCollections.join('\n'))===schemaHash,'F8_RESTORE_COLLECTION_SCHEMA_MISMATCH');
    state.restoreVerification.topLevelCollectionsMatch=true;state.restoreVerification.sourceTopLevelCollectionCount=sourceCollections.length;state.restoreVerification.restoredTopLevelCollectionCount=restoredCollections.length;state.restoreVerification.collectionSchemaSha256=schemaHash;

    state.stage='TEMP_RESTORE_DATABASE_CLEANUP';state.safety.providerWrites++;tempDbCleanupEligible=false;
    const del=await api(accessToken,`https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/${encodeURIComponent(tempDb)}`,{method:'DELETE'});
    ensure(del.ok,`F8_TEMP_DATABASE_DELETE_${del.status}_${del.error||''}`);
    await waitOperation(accessToken,String(del.json?.name||''),{timeoutMs:600000,label:'F8_DB_DELETE'});
    state.restoreVerification.temporaryDatabaseDeleted=true;tempDb=null;

    state.stage='POST_ACTION_RELEASE_RECONCILIATION';
    const postRun=await api(accessToken,`https://run.googleapis.com/v2/projects/${PROJECT}/locations/${REGION}/services/${SERVICE}`);
    ensure(postRun.ok&&revisionName(postRun.json)===EXPECTED_REVISION,'F8_POST_CLOUD_RUN_REVISION_DRIFT');
    const postHash=await publicHash(`${ROOT}/adapters/tya-live-source-refresh-watch-v2.js?f8post=${Date.now()}`);
    ensure(postHash===certifiedAdapterSha,'F8_POST_HOSTING_ADAPTER_DRIFT');
    state.cutover.reconciledExactFrozenRelease=true;state.decision='PASS_F8_BACKUP_RESTORE_CUTOVER_RECONCILED_NO_REDEPLOY';state.stage='TERMINAL_PASS';state.next='F8_5_CANONICAL_MODULE_LINEAGE_CERTIFICATION';
  }catch(error){
    state.error=safeText(error?.message||error);state.decision=mutationStarted?'HOLD_F8_AFTER_BOUNDED_PROVIDER_MUTATION':'HOLD_F8_PRE_MUTATION_CAPABILITY_OR_DRIFT';state.next='F8_CLASSIFY_SINGLE_CAUSE_NO_AUTOMATIC_RETRY';
  }finally{
    if(tempDb&&tempDbCleanupEligible){
      state.cleanup.required=true;state.cleanup.completed=false;tempDbCleanupEligible=false;
      try{
        const del=await api(accessToken,`https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/${encodeURIComponent(tempDb)}`,{method:'DELETE'});
        if(del.ok){state.safety.providerWrites++;await waitOperation(accessToken,String(del.json?.name||''),{timeoutMs:600000,label:'F8_CLEANUP_DB_DELETE'});state.restoreVerification.temporaryDatabaseDeleted=true;state.cleanup.completed=true;tempDb=null;}
        else state.cleanup.error=safeText(`HTTP_${del.status}_${del.error||''}`);
      }catch(error){state.cleanup.error=safeText(error?.message||error);}
    }
    state.generatedAt=new Date().toISOString();
    writeJson(OUT,state);
  }
  return state;
}
