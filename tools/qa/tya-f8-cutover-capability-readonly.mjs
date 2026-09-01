#!/usr/bin/env node
import fs from 'node:fs';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';

const PROJECT=String(process.env.CXORBIA_EXPECTED_PROJECT||'cxorbia-backend-dev');
const AUTH=String(process.env.CXORBIA_F8_CUTOVER_CAPABILITY_READONLY_AUTHORIZED||'');
const OUT=String(process.env.CXORBIA_F8_CUTOVER_CAPABILITY_OUT||'.tmp/f8-cutover-capability-readonly/report.json');
const RAW=String(process.env.FIREBASE_SERVICE_ACCOUNT_JSON||'');
const REQUIRED=[
  'datastore.databases.export',
  'datastore.databases.import',
  'datastore.databases.create',
  'datastore.databases.delete',
  'datastore.databases.getMetadata',
  'datastore.operations.get'
];
const SUPPLEMENTAL=['storage.buckets.list','storage.buckets.get','storage.objects.create','storage.objects.get','storage.objects.list','storage.objects.delete'];
const sha=v=>crypto.createHash('sha256').update(String(v),'utf8').digest('hex');
const write=x=>{fs.mkdirSync(OUT.split('/').slice(0,-1).join('/')||'.',{recursive:true});fs.writeFileSync(OUT,JSON.stringify(x,null,2)+'\n','utf8');};
const ensure=(ok,code)=>{if(!ok)throw new Error(code);};
async function api(token,url,{method='GET',body=null}={}){
  const res=await fetch(url,{method,headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:body===null?undefined:JSON.stringify(body),signal:AbortSignal.timeout(30000)});
  const text=await res.text();let json={};try{json=text?JSON.parse(text):{};}catch{json={unparsed:true};}
  return {ok:res.ok,status:res.status,json,error:res.ok?null:String(json?.error?.message||text||`HTTP_${res.status}`).slice(0,240)};
}
function runExistingIamBridgeProbe(){
  const bridgeOut='.tmp/f8-existing-iam-bridge-readonly/report.json';
  const run=spawnSync(process.execPath,['tools/qa/tya-f8-existing-iam-bridge-readonly.mjs'],{
    encoding:'utf8',timeout:60000,
    env:{...process.env,CXORBIA_F8_EXISTING_IAM_BRIDGE_READONLY_AUTHORIZED:'YES_PAULA_F8_EXISTING_IAM_BRIDGE_READONLY',CXORBIA_F8_EXISTING_IAM_BRIDGE_OUT:bridgeOut}
  });
  let report=null;try{report=JSON.parse(fs.readFileSync(bridgeOut,'utf8'));}catch{}
  return {exitCode:run.status,report};
}
async function main(){
  ensure(AUTH==='YES_PAULA_F8_CUTOVER_CAPABILITY_READONLY','F8_CAPABILITY_READONLY_GATE_REQUIRED');
  let sa=null;try{sa=JSON.parse(RAW);}catch{}
  ensure(sa&&sa.type==='service_account'&&sa.project_id===PROJECT&&sa.client_email&&sa.private_key,'F8_CAPABILITY_EXISTING_DEV_CREDENTIAL_INVALID');
  const {default:admin}=await import('firebase-admin');
  const tokenResult=await admin.credential.cert(sa).getAccessToken();
  const token=String(tokenResult?.access_token||'');ensure(token.length>20,'F8_CAPABILITY_ACCESS_TOKEN_MISSING');

  const db=await api(token,`https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)`);
  const dbList=await api(token,`https://firestore.googleapis.com/v1/projects/${PROJECT}/databases`);
  const perm=await api(token,`https://cloudresourcemanager.googleapis.com/v1/projects/${PROJECT}:testIamPermissions`,{method:'POST',body:{permissions:REQUIRED}});
  const granted=perm.ok?new Set((perm.json?.permissions||[]).map(String)):new Set();
  const missing=REQUIRED.filter(p=>!granted.has(p));

  const adminCfg=await api(token,`https://firebase.googleapis.com/v1beta1/projects/${PROJECT}/adminSdkConfig`);
  const configuredBucket=adminCfg.ok&&adminCfg.json?.storageBucket?String(adminCfg.json.storageBucket):null;
  const linked=await api(token,`https://firebasestorage.googleapis.com/v1beta/projects/${PROJECT}/buckets`);
  const linkedBuckets=linked.ok?(Array.isArray(linked.json?.buckets)?linked.json.buckets:[]):[];
  const linkedNames=[...new Set(linkedBuckets.map(x=>String(x?.name||'').split('/').pop()).filter(Boolean))];
  const gcsList=await api(token,`https://storage.googleapis.com/storage/v1/b?project=${encodeURIComponent(PROJECT)}&fields=items(name,location,storageClass,iamConfiguration)`);
  const gcsBuckets=gcsList.ok?(Array.isArray(gcsList.json?.items)?gcsList.json.items:[]):[];
  const gcsNames=[...new Set(gcsBuckets.map(x=>String(x?.name||'')).filter(Boolean))];

  const candidates=[configuredBucket,...linkedNames,...gcsNames].filter(Boolean);
  const uniqueCandidates=[...new Set(candidates)];
  let bucket=null,bucketSource=null,bucketMeta=null,bucketPermissionTest=null;
  for(const name of uniqueCandidates){
    const meta=await api(token,`https://storage.googleapis.com/storage/v1/b/${encodeURIComponent(name)}?fields=name,location,storageClass,iamConfiguration`);
    if(meta.ok){bucket=name;bucketMeta=meta;bucketSource=name===configuredBucket?'firebase_admin_sdk_config_verified':linkedNames.includes(name)?'firebase_storage_link_verified':'gcs_project_list_verified';break;}
  }
  if(!bucket&&gcsBuckets.length){bucket=String(gcsBuckets[0]?.name||'')||null;bucketSource=bucket?'gcs_project_list_verified':null;bucketMeta=bucket?{ok:true,status:200,json:gcsBuckets[0]}:null;}
  if(bucket){
    const qs=['storage.objects.create','storage.objects.get','storage.objects.list','storage.objects.delete'].map(p=>`permissions=${encodeURIComponent(p)}`).join('&');
    bucketPermissionTest=await api(token,`https://storage.googleapis.com/storage/v1/b/${encodeURIComponent(bucket)}/iam/testPermissions?${qs}`);
  }

  const supplementalPerm=await api(token,`https://cloudresourcemanager.googleapis.com/v1/projects/${PROJECT}:testIamPermissions`,{method:'POST',body:{permissions:SUPPLEMENTAL}});
  const supplementalGranted=supplementalPerm.ok?new Set((supplementalPerm.json?.permissions||[]).map(String)):new Set();
  const dbs=dbList.ok?(Array.isArray(dbList.json?.databases)?dbList.json.databases:[]):[];
  const activeDbCount=dbs.filter(x=>!String(x?.deleteTime||'')).length;
  const bridgeProbe=runExistingIamBridgeProbe();
  const bridge=bridgeProbe.report;
  const issues=[];
  if(!db.ok)issues.push(`default_database_read_${db.status}`);
  if(db.ok&&String(db.json?.type||'')!=='FIRESTORE_NATIVE')issues.push('default_database_not_firestore_native');
  if(!perm.ok)issues.push(`project_permission_test_${perm.status}`);
  if(missing.length)issues.push('required_firestore_permissions_missing');
  if(!bucket)issues.push('no_verified_existing_backup_bucket');
  if(activeDbCount>=100)issues.push('firestore_database_count_at_or_above_limit');

  const report={
    schemaVersion:'cxorbia.f8.cutover-capability-readonly.v1.2',generatedAt:new Date().toISOString(),projectId:PROJECT,
    decision:issues.length?'HOLD_F8_CUTOVER_CAPABILITY_READONLY':'PASS_F8_CUTOVER_CAPABILITY_READONLY',
    credential:{route:'existing_dev',projectMatches:true,serviceAccountFingerprint:sha(sa.client_email).slice(0,20),tokenReady:true,secretPersisted:false,tokenPersisted:false},
    firestore:{defaultDatabaseRead:db.ok,defaultDatabaseType:db.ok?String(db.json?.type||''):null,locationId:db.ok?String(db.json?.locationId||''):null,databaseListRead:dbList.ok,activeDatabaseCount:dbList.ok?activeDbCount:null,databaseLimitHeadroomKnown:dbList.ok,databaseLimitHeadroom:dbList.ok?Math.max(0,100-activeDbCount):null},
    permissions:{testSucceeded:perm.ok,required:REQUIRED,granted:REQUIRED.filter(p=>granted.has(p)),missing,supplementalTestSucceeded:supplementalPerm.ok,supplementalGranted:SUPPLEMENTAL.filter(p=>supplementalGranted.has(p))},
    backupBucket:{
      configuredDefaultPresent:Boolean(configuredBucket),configuredDefaultFingerprint:configuredBucket?sha(configuredBucket).slice(0,20):null,
      firebaseLinkedBucketListRead:linked.ok,firebaseLinkedBucketCount:linked.ok?linkedNames.length:null,firebaseLinkedBucketFingerprints:linkedNames.map(x=>sha(x).slice(0,20)),
      gcsProjectBucketListRead:gcsList.ok,gcsProjectBucketCount:gcsList.ok?gcsNames.length:null,gcsProjectBucketFingerprints:gcsNames.map(x=>sha(x).slice(0,20)),
      verifiedExistingBucket:Boolean(bucket),verifiedSource:bucketSource,fingerprint:bucket?sha(bucket).slice(0,20):null,metadataRead:Boolean(bucketMeta?.ok),location:bucketMeta?.ok?String(bucketMeta.json?.location||''):null,storageClass:bucketMeta?.ok?String(bucketMeta.json?.storageClass||''):null,
      callerObjectPermissionTestSucceeded:Boolean(bucketPermissionTest?.ok),callerObjectPermissions:bucketPermissionTest?.ok?(bucketPermissionTest.json?.permissions||[]):[],
      configuredDefaultWasVerified:Boolean(configuredBucket&&bucket===configuredBucket),configuredDefaultDirectMetadataStatus:configuredBucket?((await api(token,`https://storage.googleapis.com/storage/v1/b/${encodeURIComponent(configuredBucket)}?fields=name`)).status):null,
      note:'All bucket discovery and permission checks are read-only. A verified existing GCS bucket is required because current F8 authorization does not include bucket creation.'
    },
    existingIamBridge:bridge?{
      decision:bridge.decision,
      directSetIamPolicy:Boolean(bridge?.existingDev?.directSetIamPolicy),
      projectPolicyRead:Boolean(bridge?.providerReads?.projectPolicyRead),
      serviceAccountListRead:Boolean(bridge?.providerReads?.serviceAccountListRead),
      impersonableServiceAccountCount:Number(bridge?.impersonation?.impersonableServiceAccountCount||0),
      ownerOrProjectIamAdminImpersonable:Boolean(bridge?.impersonation?.ownerOrProjectIamAdminImpersonable),
      rawSecretsPersisted:false,
      tokensPersisted:false
    }:{decision:'HOLD_F8_EXISTING_IAM_BRIDGE_REPORT_MISSING',probeExitCode:bridgeProbe.exitCode},
    issues,
    safety:{providerReads:true,providerWrites:0,firestoreWrites:0,storageWrites:0,iamWrites:0,newCredentials:0,secretValuesRead:false,secretValuesPersisted:false,tokensPersisted:false,deploys:0,rebuilds:0,reimports:0,legacyDatabaseAccess:false,authorizationConsumed:false},
    next:issues.length?(bridge?.decision==='PASS_F8_EXISTING_IAM_BRIDGE_AVAILABLE'?'F8_APPLY_AUTHORIZED_TEMP_DATASTORE_OWNER_VIA_EXISTING_BRIDGE':'F8_HUMAN_OWNER_SECURE_BRIDGE_REQUIRED'):'F8_METADATA_ERRATUM_THEN_SUCCESSOR_SINGLE_USE_EXECUTION'
  };
  write(report);console.log(JSON.stringify({decision:report.decision,missingPermissions:missing,verifiedExistingBucket:Boolean(bucket),existingIamBridge:report.existingIamBridge,issues},null,2));
  if(issues.length)process.exitCode=2;
}
main().catch(error=>{const report={schemaVersion:'cxorbia.f8.cutover-capability-readonly.v1.2',generatedAt:new Date().toISOString(),projectId:PROJECT,decision:'HOLD_F8_CUTOVER_CAPABILITY_READONLY',error:String(error?.message||error).slice(0,400),safety:{providerWrites:0,authorizationConsumed:false}};write(report);console.error(JSON.stringify(report,null,2));process.exitCode=2;});
