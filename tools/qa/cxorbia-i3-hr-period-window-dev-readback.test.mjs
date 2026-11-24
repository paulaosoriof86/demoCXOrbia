import test from 'node:test';
import assert from 'node:assert/strict';
import {verifyWindowObservation,verifyConfirmedHistory} from './cxorbia-i3-hr-period-window-dev-readback.mjs';
import {selectHrPeriodWindow} from '../../backend/runtime/cxorbia-excel-operational-snapshot-v1.mjs';

function fixture(){
 const tenantId='qa',projectId='qa-project',periodIds=['qa-project-2026-10','qa-project-2026-11'];
 const expected=selectHrPeriodWindow({projectId,periodIds,timeZone:'America/Guatemala',now:new Date('2026-11-24T16:00:00Z')});
 const countryPeriods=periodIds.flatMap(periodId=>['GT','HN'].map(countryCode=>({countryCode,periodId})));
 const readScope={...expected,freshPeriodIds:periodIds,countryPeriods};
 const response={tenantId,projectId,sourceSafe:true,imported:false,production:false,source:{providerType:'excel_online'},projectConfig:{countries:['GT','HN']},readScope,
  tabsRead:countryPeriods.map(x=>({country:x.countryCode,periodKey:x.periodId.slice(-7)})),
  visits:countryPeriods.map((x,i)=>({id:'visit-'+i,visitId:'visit-'+i,tenantId,projectId,...x})),
  _runtime:{externalReadCurrent:true,revision:'a'.repeat(64),refreshError:null,writes:false,hrWrites:false,imports:false,production:false,sourceReadAt:'2026-11-24T16:00:00Z',readScope,
   projectReadBinding:{readerCount:4,jobCount:4,settings:['GT','HN'].map(countryCode=>({countryCode,periods:periodIds}))},providerReadStats:{excelOnlineOriginal:{periodReads:4}}}};
 return {response,expected,tenantId,projectId};
}
test('DEV readback proves bounded actual provider reads and complete registered country coverage',()=>{
 assert.equal(verifyWindowObservation(fixture()).periodBindings,4);
});
for(const [name,mutate]of [
 ['full historical scan',f=>{f.response._runtime.providerReadStats.excelOnlineOriginal.periodReads=38;}],
 ['missing country',f=>{f.response.readScope.countryPeriods.pop();}],
 ['unrecorded tab',f=>{f.response.tabsRead.pop();}],
 ['HR write',f=>{f.response._runtime.hrWrites=true;}],
 ['provider error',f=>{f.response._runtime.refreshError='PROVIDER_FAILURE';}],
 ['foreign visit',f=>{f.response.visits[0].projectId='other';}],
 ['historical row',f=>{f.response.visits[0].periodId='qa-project-2026-05';}],
 ['stale view',f=>{f.response._runtime.externalReadCurrent=false;}],
])test('DEV proof rejects '+name,()=>{const f=fixture();mutate(f);assert.throws(()=>verifyWindowObservation(f),/HR_WINDOW_/);});

function historicalFixture(){
 const countryPeriods=Array.from({length:19},(_,i)=>new Date(Date.UTC(2025,4+i,1)).toISOString().slice(0,7)).flatMap(k=>['GT','HN'].map(countryCode=>({countryCode,periodId:'cinepolis-'+k})));
 const observedAt='2026-11-24T15:28:33.482Z',expected={artifactId:14934489092,artifactDigest:'sha256:'+'a'.repeat(64),snapshotSha256:'b'.repeat(64),observedAt,visits:836,periods:19,countryPeriods};
 const visits=countryPeriods.flatMap((s,i)=>Array.from({length:22},(_,n)=>({id:'v-'+i+'-'+n,visitId:'v-'+i+'-'+n,tenantId:'tya',projectId:'cinepolis',...s})));
 const history={available:true,externalReadCurrent:false,production:false,tenantId:'tya',projectId:'cinepolis',visits,observations:countryPeriods.map(x=>({...x,externalReadCurrent:false,sourceReadAt:observedAt}))};
 const seed={decision:'PASS_ACCEPTED_HISTORY_AND_WINDOW_CONFIG',seedArtifactId:expected.artifactId,seedArtifactDigest:expected.artifactDigest,seedSnapshotSha256:expected.snapshotSha256,originalObservation:observedAt,
 preservedVisits:836,preservedCountryPeriods:38,makeCalls:0,hrWrites:0,operationalImports:0,seed:{periods:countryPeriods.map(x=>({...x,visits:22}))}};
 return {history,seed,expected};
}
test('accepted seed retains original evidence while a newer observed deletion can reduce history',()=>{
 const f=historicalFixture();assert.equal(verifyConfirmedHistory(f).visits,836);
 const first=f.history.observations[0];first.sourceReadAt='2026-11-24T18:00:00Z';f.history.visits=f.history.visits.filter(v=>v.countryCode!==first.countryCode||v.periodId!==first.periodId);
 const proof=verifyConfirmedHistory(f);assert.equal(proof.visits,814);assert.equal(proof.originalSeedVisits,836);
});
for(const [name,mutate]of [
 ['wrong accepted artifact digest',f=>{f.seed.seedArtifactDigest='sha256:'+'c'.repeat(64);}],
 ['foreign historical period',f=>{f.history.observations[0].periodId='other-2025-05';}],
 ['empty history at unchanged observation',f=>{f.history.visits=[];}],
 ['invented seed observation time',f=>{f.seed.originalObservation='2026-11-25T00:00:00Z';}],
])test('history readback rejects '+name,()=>{const f=historicalFixture();mutate(f);assert.throws(()=>verifyConfirmedHistory(f),/HR_WINDOW_/);});
