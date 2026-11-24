import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createApi,downloadArtifact} from './cxorbia-i3-automatic-result-consumer.mjs';

const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const must=(ok,code)=>{if(!ok)throw Error('PERSISTENCE_FAILURE:HR_HISTORY_SEED_'+code);};
const same=(a,b)=>JSON.stringify(Object.fromEntries(Object.entries(a||{}).sort()))===JSON.stringify(Object.fromEntries(Object.entries(b||{}).sort()));
const scopePath='docs/checkpoints/CXORBIA_I3_VRM375_HR_PERIOD_WINDOW_SCOPE_20261124.json';
export function validateHistorySeed({bytes,result,expected}){
 must(sha(bytes)===expected.snapshotSha256,'SNAPSHOT_BYTES');
 const snapshot=JSON.parse(bytes),runtime=snapshot._runtime||{};
 must(snapshot.tenantId==='tya'&&snapshot.projectId==='cinepolis'&&snapshot.sourceSafe===true&&snapshot.production===false&&snapshot.imported===false,'SCOPE');
 must(result.sourceSha==='9b952d348e7cdf06a7fa0ec1444d6856d270cbe7'&&result.runtimeRevision==='cxorbia-live-hr-dev-00390-bpc'&&
   result.hostingVersion==='sites/cxorbia-backend-dev/versions/0245a82f44260d53'&&result.hrRevision===runtime.revision&&result.production===false,'ACCEPTED_MATERIALIZATION');
 must(snapshot.visits?.length===expected.visits&&snapshot.periods?.length===expected.periods&&runtime.sourceReadAt===expected.observedAt,'OBSERVATION');
 const covered=[...new Map((snapshot.tabsRead||[]).map(t=>[t.country+'|'+t.periodKey,{countryCode:t.country,periodId:snapshot.projectId+'-'+t.periodKey}])).values()];
 must(covered.length===38&&new Set(covered.map(s=>s.periodId)).size===19,'COMPLETE_RECORDED_COVERAGE');
 const sourceReadAt=Date.parse(runtime.sourceReadAt),started=Date.parse(runtime.refreshStartedAt);
 must(Number.isSafeInteger(sourceReadAt)&&Number.isSafeInteger(started)&&started<=sourceReadAt,'OBSERVATION_TIME');
 delete snapshot._runtime;
 snapshot.readScope={schemaVersion:'cxorbia.hr-read-scope.v1',mode:'accepted_historical_seed',countryPeriods:covered};
 return {snapshot,sourceReadAt,sourceReadStartedAt:started,revision:runtime.revision};
}

async function main(){
 const e=process.env;
 must(e.PROJECT==='cxorbia-backend-dev'&&e.TENANT_ID==='tya'&&e.PROJECT_ID==='cinepolis'&&e.GITHUB_REPOSITORY==='paulaosoriof86/demoCXOrbia'&&e.SOURCE_DIR&&e.FOCAL_OUT,'ENVIRONMENT');
 const descriptor=JSON.parse(fs.readFileSync('CXORBIA_I3_CANONICAL_CANDIDATE_DESCRIPTOR_2026-09-24.json','utf8'));
 if(descriptor.pendingDevSuccessor?.hrPeriodWindowRequired!==true){console.log('NOOP_HR_WINDOW_SEED_NOT_REQUESTED');return;}
 must(descriptor.productSourceSha===e.FOCAL_SOURCE&&descriptor.pendingDevSuccessor.sourceSha===e.FOCAL_SOURCE,'SOURCE_IDENTITY');
 const contract=JSON.parse(fs.readFileSync(scopePath,'utf8')),expected=contract.historicalSeed;
 const token=e.GH_TOKEN,api=createApi({token}),artifact=await api(`/repos/${e.GITHUB_REPOSITORY}/actions/artifacts/${expected.artifactId}`);
 must(artifact.digest===expected.artifactDigest&&artifact.workflow_run?.id===expected.runId&&artifact.expired===false,'ARTIFACT_METADATA');
 const archive=await downloadArtifact(api,artifact,token);
 try{
  const verified=validateHistorySeed({bytes:fs.readFileSync(path.join(archive.folder,'hr-live.json')),result:JSON.parse(fs.readFileSync(path.join(archive.folder,'result.json'),'utf8')),expected});
  const [{applicationDefault,getApps,initializeApp},{getFirestore},{createConfirmedHrHistory}]=await Promise.all([
   import('firebase-admin/app'),import('firebase-admin/firestore'),import(pathToFileURL(path.join(e.SOURCE_DIR,'backend/runtime/hr-live-service/hr-read-model.mjs')).href)]);
  if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:e.PROJECT});
  const db=getFirestore(),store=createConfirmedHrHistory({db});
  const saved=await store.observe(verified.snapshot,{...verified,seed:true,evidence:{receiptPath:scopePath,artifactId:expected.artifactId,
   artifactDigest:archive.digest,snapshotSha256:expected.snapshotSha256,sourceRunId:expected.runId,sourceSha:contract.predecessorProductSourceSha}});
  const history=await store.read(verified.snapshot);
  must(history.available===true&&history.observations.length>=38&&history.externalReadCurrent===false,'READBACK');
  const ref=db.doc('tenants/tya/projects/cinepolis'),window={mode:'adjacent_months',timeZone:'America/Guatemala',historicalPolicy:'explicit_only'};
  const config=await db.runTransaction(async tx=>{const doc=await tx.get(ref),row=doc.exists?doc.data():null;
   must(row?.tenantId==='tya'&&(!row.projectId||row.projectId==='cinepolis')&&row.operationalSource?.providerType==='excel_online','PROJECT_POLICY');
   if(row.hrReadWindow){must(same(row.hrReadWindow,window),'CONFIG_CONFLICT');return {changed:false,version:row.version??null};}
   const version=Number.isSafeInteger(row.version)?row.version+1:1;tx.update(ref,{hrReadWindow:window,version});return {changed:true,version};});
  const observed=(await ref.get()).data();must(same(observed.hrReadWindow,window)&&observed.version===config.version,'CONFIG_READBACK');
  const receipt={schemaVersion:'cxorbia.i3.hr-period-history-seed.v1',decision:'PASS_ACCEPTED_HISTORY_AND_WINDOW_CONFIG',findingId:'VRM-375',
   seedArtifactId:expected.artifactId,seedArtifactDigest:archive.digest,seedSnapshotSha256:expected.snapshotSha256,originalObservation:expected.observedAt,
   preservedVisits:history.visits.length,preservedCountryPeriods:history.observations.length,seed:saved,projectWindow:window,projectConfig:config,
   sourceSha:e.FOCAL_SOURCE,runId:e.GITHUB_RUN_ID,makeCalls:0,hrReads:0,hrWrites:0,operationalImports:0,visitWrites:0,shopperWrites:0,production:false};
  fs.mkdirSync(e.FOCAL_OUT,{recursive:true});fs.writeFileSync(path.join(e.FOCAL_OUT,'hr-history-seed.json'),JSON.stringify(receipt,null,2)+'\n');
  console.log(JSON.stringify({decision:receipt.decision,preservedVisits:receipt.preservedVisits,preservedCountryPeriods:receipt.preservedCountryPeriods,makeCalls:0,production:false}));
 }finally{archive.cleanup();}
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(error=>{console.error(error.message);process.exitCode=1;});
