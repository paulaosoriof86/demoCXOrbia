#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const sourcePath=path.resolve(process.env.CXORBIA_CURRENT_SOURCE_SAFE||'.tmp/hr-current/tya-hr-source-safe.js');
const registryPath=path.resolve(process.env.CXORBIA_HR_TAB_REGISTRY||'backend/config/tya-live-hr-tab-registry.source-safe.json');
const outJson=path.resolve(process.env.CXORBIA_LIVE_HR_AUTHORITY_JSON||'app/docs/evidence/LIVE-HR-AUTHORITY-CONTRACT-LATEST.json');
const outMd=path.resolve(process.env.CXORBIA_LIVE_HR_AUTHORITY_MD||'app/docs/evidence/LIVE-HR-AUTHORITY-CONTRACT-LATEST.md');
const countryJson=path.resolve(process.env.CXORBIA_COUNTRY_GATE_JSON||'app/docs/evidence/LIVE-HR-COUNTRY-TAB-CONSISTENCY-LATEST.json');
const countryMd=path.resolve(process.env.CXORBIA_COUNTRY_GATE_MD||'app/docs/evidence/LIVE-HR-COUNTRY-TAB-CONSISTENCY-LATEST.md');
const VOLATILE_KEYS=new Set(['generatedAt','lastSnapshotAt','sourceSnapshotAt']);

function assert(condition,code){if(!condition)throw new Error(code);}
function loadSnapshot(){
  const code=fs.readFileSync(sourcePath,'utf8');
  const sandbox={window:{}};
  vm.createContext(sandbox);
  vm.runInContext(code,sandbox);
  const value=sandbox.window.CX_TYA_HR_SOURCE_SAFE;
  assert(value&&value.sourceSafe===true,'source_safe_snapshot_missing');
  return JSON.parse(JSON.stringify(value));
}
function stableValue(value){
  if(Array.isArray(value))return value.map(stableValue);
  if(value&&typeof value==='object'){
    const out={};
    for(const key of Object.keys(value).sort()){
      if(VOLATILE_KEYS.has(key))continue;
      out[key]=stableValue(value[key]);
    }
    return out;
  }
  return value;
}
function revision(value){return crypto.createHash('sha256').update(JSON.stringify(stableValue(value))).digest('hex');}
function currentPeriodKey(){
  const explicit=String(process.env.CXORBIA_EXPECTED_CURRENT_PERIOD||'').trim();
  if(/^20\d{2}-(0[1-9]|1[0-2])$/.test(explicit))return explicit;
  const now=new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth()+1).padStart(2,'0')}`;
}
function expectedCountryFromTab(title){return /\sHN$/i.test(String(title||'').trim())?'HN':'GT';}
function sortedPeriods(snapshot){return (snapshot.periods||[]).map(p=>String(p.key||'')).filter(Boolean).sort();}
function safeCountBy(rows,key){const out={};for(const row of rows){const value=String(row?.[key]||'blank');out[value]=(out[value]||0)+1;}return out;}

const snapshot=loadSnapshot();
const registry=JSON.parse(fs.readFileSync(registryPath,'utf8'));
assert(registry?.schemaVersion==='cxorbia.tya-live-hr-tab-registry.v1'&&registry?.sourceSafe===true,'registry_invalid');
const periodKey=currentPeriodKey();
const periods=sortedPeriods(snapshot);
const currentPeriod=(snapshot.periods||[]).find(p=>String(p.key||'')===periodKey)||null;
const currentTabs=(snapshot.tabsRead||[]).filter(t=>String(t.periodKey||'')===periodKey);
const currentVisits=(snapshot.visits||[]).filter(v=>String(v.periodKey||'')===periodKey);
const registryTabs=new Set(registry.monthlyTabs||[]);
const expectedTabs=currentTabs.map(t=>String(t.title||t.tabTitle||'')).filter(Boolean).sort();
const countryResults=[];
for(const tab of currentTabs){
  const title=String(tab.title||tab.tabTitle||'');
  const expected=String(tab.country||expectedCountryFromTab(title));
  const rows=currentVisits.filter(v=>String(v.sourceTab||'')===title);
  const mismatches=rows.filter(v=>String(v.country||v.pais||'')!==expected);
  countryResults.push({title,periodKey,expectedCountry:expected,tabExists:registryTabs.has(title),visitRows:rows.length,countryCounts:safeCountBy(rows,'country'),mismatchCount:mismatches.length,mismatchRows:mismatches.map(v=>Number(v.sourceRow||0)).filter(Boolean).sort((a,b)=>a-b)});
}
const currentByCountry={GT:currentVisits.filter(v=>String(v.country||v.pais||'')==='GT').length,HN:currentVisits.filter(v=>String(v.country||v.pais||'')==='HN').length};
const currentCountryCoverage=['GT','HN'].every(country=>currentByCountry[country]>0&&currentTabs.some(t=>String(t.country||expectedCountryFromTab(t.title||t.tabTitle))===country));
const countryDecision=currentTabs.length>=2&&currentCountryCoverage&&countryResults.every(r=>r.tabExists&&r.mismatchCount===0)?'PASS_COUNTRY_TAB_CONSISTENCY':'HOLD_COUNTRY_TAB_CONSISTENCY';

const baseRevision=revision(snapshot);
const volatileClone=JSON.parse(JSON.stringify(snapshot));
volatileClone.generatedAt='2099-01-01T00:00:00.000Z';
const volatileRevision=revision(volatileClone);
const historicalClone=JSON.parse(JSON.stringify(snapshot));
const historicalVisits=(historicalClone.visits||[]).slice().sort((a,b)=>String(a.periodKey||'').localeCompare(String(b.periodKey||''))||Number(a.sourceRow||0)-Number(b.sourceRow||0));
assert(historicalVisits.length>0,'historical_visit_missing');
const historicalTarget=historicalVisits[0];
historicalTarget.reviewRequired=!Boolean(historicalTarget.reviewRequired);
const historicalMutationRevision=revision(historicalClone);

const serverCode=fs.readFileSync(path.resolve('backend/runtime/hr-live-service/server.mjs'),'utf8');
const applyCode=fs.readFileSync(path.resolve('app/adapters/tya-live-source-inplace-apply.js'),'utf8');
const parityChecks={
  serverStableRevision:serverCode.includes('stableRevisionValue')&&serverCode.includes('X-CXOrbia-Source-Revision'),
  runtimeMetaRevision:serverCode.includes('revision:current.revision'),
  previewMetaRevision:applyCode.includes('sourceRevision:meta.revision||null'),
  visibleContractRevision:applyCode.includes('sourceRevision:meta.revision||null,sourceReadAt'),
  updateEventRevision:applyCode.includes('detail:{revision:meta.revision||null')
};

const blockers=[];
if(snapshot.source?.accessMode!=='sheets_api_service_account')blockers.push(`provider_access_not_sheets_api:${snapshot.source?.accessMode||'missing'}`);
if(snapshot.source?.tabRegistryAutoDiscovery!==true)blockers.push('snapshot_autodiscovery_false');
if(registry.autoDiscovery!==true||registry.registryMode!=='live_provider_metadata_auto_refresh')blockers.push('registry_not_live_provider_metadata');
if(!currentPeriod)blockers.push(`current_period_missing:${periodKey}`);
if(!currentTabs.length)blockers.push(`current_tabs_missing:${periodKey}`);
if(!currentCountryCoverage)blockers.push(`current_country_coverage_incomplete:GT=${currentByCountry.GT},HN=${currentByCountry.HN}`);
if(countryDecision!=='PASS_COUNTRY_TAB_CONSISTENCY')blockers.push('country_tab_consistency_hold');
if(baseRevision!==volatileRevision)blockers.push('volatile_timestamp_changed_revision');
if(baseRevision===historicalMutationRevision)blockers.push('historical_mutation_did_not_change_revision');
for(const [key,value] of Object.entries(parityChecks))if(!value)blockers.push(`source_revision_parity_static_missing:${key}`);

const decision=blockers.length?'HOLD_LIVE_HR_AUTHORITY_CONTRACT':'PASS_LIVE_HR_AUTHORITY_CURRENT_PERIOD_AND_HISTORY_REVISION';
const report={schemaVersion:'cxorbia.live-hr-authority-contract.v1',generatedAt:new Date().toISOString(),decision,source:{generatedAt:snapshot.generatedAt||null,accessMode:snapshot.source?.accessMode||null,title:snapshot.source?.title||null,periods:periods.length,tabs:(snapshot.tabsRead||[]).length,visits:(snapshot.visits||[]).length,shoppers:(snapshot.shoppers||[]).length},providerRegistry:{observedAt:registry.observedAt||null,autoDiscovery:registry.autoDiscovery===true,registryMode:registry.registryMode||null,monthlyTabs:registryTabs.size,currentCalendarPeriodKey:registry.currentCalendarPeriodKey||periodKey,requiredCurrentPeriodTabs:registry.requiredCurrentPeriodTabs||expectedTabs,requiredCurrentPeriodTabsPresent:registry.requiredCurrentPeriodTabsPresent===true},currentPeriod:{periodKey,present:Boolean(currentPeriod),activeCalendarPeriodKey:periodKey,latestObservedPeriodKey:periods.at(-1)||null,tabs:expectedTabs,byCountry:currentByCountry,totalVisits:currentVisits.length,countryCoverageComplete:currentCountryCoverage},countryGate:{decision:countryDecision,results:countryResults},revision:{algorithm:'sha256_stable_snapshot_excluding_volatile_timestamps',sourceRevision:baseRevision,volatileTimestampMutationPreservesRevision:baseRevision===volatileRevision,historicalMutationChangesRevision:baseRevision!==historicalMutationRevision,historicalProbe:{periodKey:String(historicalTarget.periodKey||''),sourceTab:String(historicalTarget.sourceTab||''),sourceRow:Number(historicalTarget.sourceRow||0)}},transversalParity:{checks:parityChecks,allPass:Object.values(parityChecks).every(Boolean)},blockers,safety:{providerReads:true,providerWrites:0,hrWrites:0,firestoreWrites:0,authWrites:0,rulesWrites:0,storageWrites:0,hostingDeploys:0,cloudRunDeploys:0,production:false,merge:false,pii:false,secrets:false}};
const countryReport={schemaVersion:'tya.hr-country-tab-consistency.v3',generatedAt:report.generatedAt,sourceSafe:true,pii:false,providerWrites:0,sourceRevision:baseRevision,periodKey,providerTabRegistryObservedAt:registry.observedAt||null,results:countryResults,decision:countryDecision,safety:{hrWrites:0,firestoreWrites:0,authWrites:0,hostingDeploys:0,production:false,merge:false}};
fs.mkdirSync(path.dirname(outJson),{recursive:true});
fs.writeFileSync(outJson,JSON.stringify(report,null,2)+'\n','utf8');
fs.writeFileSync(countryJson,JSON.stringify(countryReport,null,2)+'\n','utf8');
const md=['# CXOrbia TyA — autoridad HR viva y revisión histórica','',`- Decisión: \`${decision}\`.`,`- Periodo calendario activo: \`${periodKey}\`.`,`- Periodos vivos detectados: ${periods.length}.`,`- Tabs mensuales vivas: ${(snapshot.tabsRead||[]).length}.`,`- Visitas vivas: ${(snapshot.visits||[]).length}.`,`- Periodo activo: GT ${currentByCountry.GT} / HN ${currentByCountry.HN}.`,`- Auto-discovery provider: ${registry.autoDiscovery===true?'PASS':'HOLD'}.`,`- Source revision: \`${baseRevision}\`.`,`- Cambio histórico altera revision: ${baseRevision!==historicalMutationRevision?'PASS':'HOLD'}.`,`- Cambio solo de timestamp conserva revision: ${baseRevision===volatileRevision?'PASS':'HOLD'}.`,`- Paridad transversal de revision: ${Object.values(parityChecks).every(Boolean)?'PASS':'HOLD'}.`,'','## Bloqueos','',...(blockers.length?blockers.map(x=>`- ${x}`):['- Ninguno.']),'','## Seguridad','','- Solo lectura del proveedor.','- Sin writes HR, Firestore, Auth, Rules o Storage.','- Sin deploy, merge o producción.',''];
fs.writeFileSync(outMd,md.join('\n'),'utf8');
const countryLines=['# TyA HR — consistencia país/pestaña desde la misma revisión viva','',`- Periodo: ${periodKey}.`,`- Decisión: \`${countryDecision}\`.`,`- Source revision: \`${baseRevision}\`.`,...countryResults.map(r=>`- ${r.title}: país ${r.expectedCountry}; filas ${r.visitRows}; mismatch ${r.mismatchCount}.`),'','- Sin PII; writes=0.',''];
fs.writeFileSync(countryMd,countryLines.join('\n'),'utf8');
console.log(JSON.stringify({decision,currentPeriod:report.currentPeriod,revision:report.revision,transversalParity:report.transversalParity,blockers,safety:report.safety}));
if(blockers.length)process.exitCode=2;
