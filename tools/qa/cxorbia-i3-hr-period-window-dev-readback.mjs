import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';

const must=(ok,code)=>{if(!ok)throw Error('MAPPING_FAILURE:HR_WINDOW_'+code);};
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const sorted=values=>[...new Set(values)].sort();
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));

export function verifyWindowObservation({response,expected,tenantId,projectId}){
 const snapshot=response.snapshot||response.data||response,meta=response._runtime||{},scope=snapshot.readScope;
 must(snapshot.tenantId===tenantId&&snapshot.projectId===projectId&&snapshot.sourceSafe===true&&snapshot.imported===false&&snapshot.production===false&&snapshot.source?.providerType==='excel_online','SOURCE');
 must(meta.externalReadCurrent===true&&/^[a-f0-9]{64}$/.test(meta.revision||''),'FRESH_REVISION');
 must(meta.refreshError===null&&['writes','hrWrites','imports','production'].every(k=>meta[k]===false),'READONLY_FLAGS');
 must(scope?.mode===expected.mode&&scope.timeZone===expected.timeZone&&same(scope.periodIds,expected.periodIds),'PERIOD_SELECTION');
 must(scope.referenceMonth===expected.referenceMonth&&scope.currentPeriodId===expected.currentPeriodId&&scope.nextPeriodAvailable===expected.nextPeriodAvailable,'CALENDAR');
 must(same(scope,meta.readScope)&&same(scope.freshPeriodIds,scope.periodIds),'META_SCOPE');
 must(scope.mode==='explicit_period'?scope.periodIds.length===1:scope.periodIds.length>0&&scope.periodIds.length<=3,'BOUNDED_WINDOW');
 const countries=sorted(snapshot.projectConfig?.countries||[]),coverage=scope.countryPeriods;
 must(countries.length>0&&Array.isArray(coverage)&&coverage.length>0&&coverage.length<=scope.periodIds.length*countries.length,'COVERAGE');
 const keys=coverage.map(x=>x.countryCode+'|'+x.periodId);
 must(new Set(keys).size===keys.length&&coverage.every(x=>countries.includes(x.countryCode)&&scope.periodIds.includes(x.periodId)),'COUNTRY_PERIOD');
 const required=(meta.projectReadBinding?.settings||[]).flatMap(x=>(x.periods||[]).filter(p=>scope.periodIds.includes(p)).map(p=>x.countryCode+'|'+p));
 const tabs=(snapshot.tabsRead||[]).map(x=>x.country+'|'+projectId+'-'+x.periodKey);
 must(required.length>0&&required.every(k=>keys.includes(k))&&same(sorted(tabs),sorted(keys))&&same(sorted(coverage.map(x=>x.periodId)),sorted(scope.periodIds)),'COMPLETE_COVERAGE');
 const visits=snapshot.visits||[],ids=visits.map(v=>v.visitId||v.id);
 must(ids.every(x=>typeof x==='string'&&x.length>0)&&new Set(ids).size===ids.length&&visits.every(v=>(!v.tenantId||v.tenantId===tenantId)&&(!v.projectId||v.projectId===projectId)&&keys.includes((v.countryCode||v.country||v.pais)+'|'+v.periodId)),'HISTORICAL_ROW_IN_FRESH_SOURCE');
 must(meta.providerReadStats?.excelOnlineOriginal?.periodReads===coverage.length&&meta.projectReadBinding?.readerCount===coverage.length&&meta.projectReadBinding?.jobCount===coverage.length,'ACTUAL_PROVIDER_READ_COUNT');
 return {mode:scope.mode,periodIds:scope.periodIds,referenceMonth:scope.referenceMonth,timeZone:scope.timeZone,nextPeriodAvailable:scope.nextPeriodAvailable,
  countryPeriods:coverage,periodBindings:coverage.length,visits:visits.length,revision:meta.revision,sourceReadAt:meta.sourceReadAt,externalReadCurrent:true};
}

export function verifyConfirmedHistory({history,seed,expected}){
 must(seed.decision==='PASS_ACCEPTED_HISTORY_AND_WINDOW_CONFIG'&&seed.seedArtifactId===expected.artifactId&&seed.seedArtifactDigest===expected.artifactDigest&&seed.seedSnapshotSha256===expected.snapshotSha256&&seed.originalObservation===expected.observedAt,'SEED_IDENTITY');
 must(seed.preservedCountryPeriods>=38&&seed.makeCalls===0&&seed.hrWrites===0&&seed.operationalImports===0&&Array.isArray(seed.seed?.periods)&&seed.seed.periods.reduce((n,x)=>n+x.visits,0)===expected.visits,'SEED_SCOPE');
 must(history.available===true&&history.externalReadCurrent===false&&history.production===false&&history.tenantId==='tya'&&history.projectId==='cinepolis','HISTORY_SCOPE');
 const periods=sorted(history.observations.map(x=>x.periodId));
 must(periods.length>=expected.periods&&history.observations.length>=38&&history.observations.every(x=>x.externalReadCurrent===false&&Number.isFinite(Date.parse(x.sourceReadAt))),'HISTORY_COVERAGE');
 const key=x=>x.countryCode+'|'+x.periodId,coverage=history.observations.map(key);
 must(expected.countryPeriods?.length===38&&expected.countryPeriods.every(x=>coverage.includes(key(x)))&&new Set(coverage).size===coverage.length,'HISTORY_EXPECTED_COVERAGE');
 must(history.visits.every(v=>v.tenantId===history.tenantId&&v.projectId===history.projectId&&coverage.includes((v.countryCode||v.country||v.pais)+'|'+v.periodId)),'HISTORY_VISIT_SCOPE');
 for(const observation of history.observations){const original=seed.seed.periods.find(x=>key(x)===key(observation));
  if(original&&Date.parse(observation.sourceReadAt)===Date.parse(expected.observedAt))must(history.visits.filter(v=>(v.countryCode||v.country||v.pais)+'|'+v.periodId===key(observation)).length===original.visits,'HISTORY_ORIGINAL_COUNT');}
 must(new Set(history.visits.map(v=>v.visitId||v.id)).size===history.visits.length,'HISTORY_DUPLICATES');
 return {available:true,externalReadCurrent:false,visits:history.visits.length,periods:periods.length,countryPeriods:history.observations.length,
  originalSeedVisits:expected.visits,seedBankVisits:seed.preservedVisits,originalObservation:seed.originalObservation,seedArtifactId:seed.seedArtifactId,seedSnapshotSha256:seed.seedSnapshotSha256};
}

async function main(){
 const e=process.env;
 must(e.PROJECT==='cxorbia-backend-dev'&&e.HOSTING_URL==='https://cxorbia-backend-dev.web.app'&&e.TENANT_ID==='tya'&&e.PROJECT_ID==='cinepolis'&&e.SOURCE_DIR&&e.FOCAL_OUT,'DEV_ENVIRONMENT');
 const result=read(path.join(e.FOCAL_OUT,'result.json')),seed=read(path.join(e.FOCAL_OUT,'hr-history-seed.json'));
 const initial=read(path.join(e.FOCAL_OUT,'hr-live.json')),contract=read('docs/checkpoints/CXORBIA_I3_VRM375_HR_PERIOD_WINDOW_SCOPE_20261124.json');
 const {selectHrPeriodWindow}=await import(pathToFileURL(path.join(e.SOURCE_DIR,'backend/runtime/cxorbia-excel-operational-snapshot-v1.mjs')).href);
 const expect=(response,requestedPeriodId)=>{const snapshot=response.snapshot||response.data||response;return selectHrPeriodWindow({projectId:e.PROJECT_ID,
  periodIds:snapshot.periodCatalog.map(p=>p.id||p.periodId),timeZone:'America/Guatemala',now:new Date(response._runtime.sourceReadAt),requestedPeriodId});};
 const verify=(response,requestedPeriodId)=>verifyWindowObservation({response,expected:expect(response,requestedPeriodId),tenantId:e.TENANT_ID,projectId:e.PROJECT_ID});
 const rolling=verify(initial);must(rolling.revision===result.hrRevision,'PAIRED_REVISION');
 const [{applicationDefault,getApps,initializeApp},{getFirestore},{createConfirmedHrHistory}]=await Promise.all([
  import('firebase-admin/app'),import('firebase-admin/firestore'),import(pathToFileURL(path.join(e.SOURCE_DIR,'backend/runtime/hr-live-service/hr-read-model.mjs')).href)]);
 if(!getApps().length)initializeApp({credential:applicationDefault(),projectId:e.PROJECT});
 const bank=await createConfirmedHrHistory({db:getFirestore()}).read({tenantId:e.TENANT_ID,projectId:e.PROJECT_ID});
 const history=verifyConfirmedHistory({history:bank,seed,expected:contract.historicalSeed});
 const registered=new Set(initial.periodCatalog.map(p=>p.id||p.periodId));
 const explicitPeriodId=sorted(bank.observations.map(x=>x.periodId)).filter(p=>registered.has(p)&&p<rolling.periodIds[0]).at(-1);
 must(Boolean(explicitPeriodId),'EXPLICIT_HISTORY_FIXTURE');
 const get=async params=>{const url=new URL(`/api/${e.TENANT_ID}/${e.PROJECT_ID}/hr-live`,e.HOSTING_URL);url.search=new URLSearchParams({format:'json',hrWindowRun:e.GITHUB_RUN_ID,...params});
  const response=await fetch(url,{headers:{'cache-control':'no-cache, no-store'},signal:AbortSignal.timeout(90000)});must(response.ok,'HTTP_'+response.status);return response.json();};
 // Two HTTP reads only. No command, HR write, authentication write or full-history scan.
 const explicit=verify(await get({hrPeriodId:explicitPeriodId,fresh:'1'}),explicitPeriodId);
 const returnedResponse=await get({fresh:'1'}),returned=verify(returnedResponse);must(same(returned.periodIds,rolling.periodIds),'WINDOW_RETURN_DRIFT');
 const proof={schemaVersion:'cxorbia.i3.hr-period-window-dev.v1',decision:'PASS_HR_PERIOD_WINDOW_HISTORY_AND_EXPLICIT_READ',findingId:'VRM-375',
  ...Object.fromEntries(['sourceSha','sourceTree','runtimeRevision','runtimeDigest','hostingVersion'].map(k=>[k,result[k]])),runId:e.GITHUB_RUN_ID,runAttempt:Number(e.GITHUB_RUN_ATTEMPT||1),
  revision:returned.revision,rolling,history,explicit,returned,additionalHttpReads:2,inventoryPolicy:{automaticMaxAgeMs:86400000,manualDiscoverySourceTested:true,liveManualDiscoveryCertified:false},
  firestoreWrites:0,authWrites:0,hrWrites:0,commandPosts:0,operationalImports:0,production:false,fullDomain:false,authenticatedUiCertified:false};
 fs.writeFileSync(path.join(e.FOCAL_OUT,'hr-window-readback.json'),JSON.stringify(proof,null,2)+'\n');
 fs.writeFileSync(path.join(e.FOCAL_OUT,'hr-live-before-window-probe.json'),JSON.stringify(initial,null,2)+'\n');
 fs.writeFileSync(path.join(e.FOCAL_OUT,'hr-live.json'),JSON.stringify(returnedResponse,null,2)+'\n');
 const finalSnapshot=returnedResponse.snapshot||returnedResponse.data||returnedResponse;
 fs.writeFileSync(path.join(e.FOCAL_OUT,'hr-meta.json'),JSON.stringify({ok:true,...returnedResponse._runtime,periods:finalSnapshot.periods.length,visits:finalSnapshot.visits.length,
  latestPeriodKey:finalSnapshot.periods.map(p=>p.key||p.periodKey).sort().at(-1)},null,2)+'\n');
 result.hrRevision=returned.revision;result.hrPeriodWindowRequired=true;
 fs.writeFileSync(path.join(e.FOCAL_OUT,'result.json'),JSON.stringify(result,null,2)+'\n');
 if(e.GITHUB_ENV)fs.appendFileSync(e.GITHUB_ENV,'HR_REVISION='+returned.revision+'\n');
 console.log(JSON.stringify({decision:proof.decision,rollingPeriodIds:rolling.periodIds,periodBindings:rolling.periodBindings,historyPeriods:history.periods,explicitPeriodId,hrWrites:0,fullDomain:false}));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(error=>{console.error(error.message);process.exitCode=1;});
