import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const sourcePath=process.env.CXORBIA_HR_SOURCE_SAFE_OUT||'.tmp/hr-current/tya-hr-source-safe.js';
const registryPath=process.env.CXORBIA_HR_TAB_REGISTRY||'backend/config/tya-live-hr-tab-registry.source-safe.json';
const evidencePath=process.env.CXORBIA_HR_TAB_REGISTRY_EVIDENCE||'app/docs/evidence/LIVE-HR-TAB-REGISTRY-ENFORCEMENT-LATEST.json';
function loadSource(){const code=fs.readFileSync(sourcePath,'utf8');const sandbox={window:{}};vm.createContext(sandbox);vm.runInContext(code,sandbox);return JSON.parse(JSON.stringify(sandbox.window.CX_TYA_HR_SOURCE_SAFE));}
function uniq(values){return [...new Set(values.filter(Boolean))].sort();}
function by(rows,fn){const out={};for(const row of rows){const k=String(fn(row)||'').trim()||'blank';out[k]=(out[k]||0)+1;}return out;}
function isAssigned(v){return v.hasShopper===true||Boolean(v.shopperId)||v.canonicalFacets?.assigned===true;}
function isScheduled(v){return Boolean(v.agendada||v.scheduledDate)||v.canonicalFacets?.scheduled===true;}
function isRealized(v){return Boolean(v.realizada||v.completedDate)||v.canonicalFacets?.realized===true;}
function hasQuestionnaire(v){return Boolean(v.cuestFecha||v.questionnaireDate)||v.canonicalFacets?.questionnaire===true;}
function isSubmitted(v){return v.submit===true||v.submitted===true||Boolean(v.submittedAt)||v.canonicalFacets?.submitted===true;}
function recalcCounts(source){const visits=source.visits||[],shoppers=source.shoppers||[];return {...(source.counts||{}),periods:(source.periods||[]).length,tabs:(source.tabsRead||[]).length,visits:visits.length,shoppers:shoppers.length,byStatus:by(visits,v=>v.estado||v.status),byCountry:by(visits,v=>v.country||v.pais),assigned:visits.filter(isAssigned).length,unassigned:visits.filter(v=>!isAssigned(v)).length,scheduled:visits.filter(isScheduled).length,realized:visits.filter(isRealized).length,questionnaireCompleted:visits.filter(hasQuestionnaire).length,submitted:visits.filter(isSubmitted).length,liquidationCandidatesPendingFinancialMatch:visits.filter(v=>v.liquidationState==='candidate_pending_financial_match').length,liquidationConfirmed:visits.filter(v=>v.liquidationState==='confirmed').length,paymentConfirmed:visits.filter(v=>v.paymentState==='confirmed').length,reviewRequired:visits.filter(v=>v.reviewRequired===true).length};}

const source=loadSource();
if(!source||source.sourceSafe!==true)throw new Error('source_safe_missing');
const accessMode=String(source.source?.accessMode||'');
const sourceCarriesProviderMetadata=accessMode==='sheets_api_service_account';
let registry=fs.existsSync(registryPath)?JSON.parse(fs.readFileSync(registryPath,'utf8')):null;
if(registry&&(registry.schemaVersion!=='cxorbia.tya-live-hr-tab-registry.v1'||registry.sourceSafe!==true))throw new Error('tab_registry_invalid');

/* Auto-month provider metadata can arrive in either of two safe ways:
   1) the source builder itself used Sheets API; or
   2) the runtime refreshed the registry immediately beforehand through the
      provider metadata probe using Cloud Run ADC. In both cases the registry
      is provider-authoritative; GViz may still be used only for row values. */
const externalProviderRegistry=Boolean(registry&&registry.autoDiscovery===true&&registry.providerMetadataReadOnly===true&&registry.registryMode==='live_provider_metadata_auto_refresh');
let providerMetadataLive=sourceCarriesProviderMetadata||externalProviderRegistry;
let registryMode=providerMetadataLive?'live_provider_metadata_auto_refresh':'last_provider_metadata_fail_closed';

if(sourceCarriesProviderMetadata){
  const monthlyTabs=uniq((source.tabsRead||[]).map(t=>String(t.title||t.tabTitle||'')));
  if(!monthlyTabs.length)throw new Error('live_provider_metadata_has_no_monthly_tabs');
  registry={
    schemaVersion:'cxorbia.tya-live-hr-tab-registry.v1',
    observedAt:source.generatedAt||new Date().toISOString(),
    sourceTitle:source.source?.title||'HR Guatemala - Sincronizacion Google Sheets',
    sourceSafe:true,
    providerMetadataReadOnly:true,
    autoDiscovery:true,
    registryMode:'live_provider_metadata_auto_refresh',
    monthlyTabs,
    nonMonthlyTabs:[],
    requiredAugustTabs:['AGOSTO 26','AGOSTO 26 HN'],
    requiredAugustTabsPresent:monthlyTabs.includes('AGOSTO 26')&&monthlyTabs.includes('AGOSTO 26 HN'),
    safety:{pii:false,hrWrites:0,firestoreWrites:0,production:false,merge:false}
  };
  fs.mkdirSync(path.dirname(registryPath),{recursive:true});
  fs.writeFileSync(registryPath,JSON.stringify(registry,null,2)+'\n','utf8');
  providerMetadataLive=true;
  registryMode='live_provider_metadata_auto_refresh';
}
if(!registry)throw new Error('tab_registry_missing_and_live_metadata_unavailable');

const allowed=new Set(registry.monthlyTabs||[]);
if(!allowed.size)throw new Error('tab_registry_has_no_monthly_tabs');
const before={tabs:(source.tabsRead||[]).length,periods:(source.periods||[]).length,visits:(source.visits||[]).length,shoppers:(source.shoppers||[]).length};
const removedTabs=(source.tabsRead||[]).filter(t=>!allowed.has(String(t.title||t.tabTitle||''))).map(t=>String(t.title||t.tabTitle||''));
source.tabsRead=(source.tabsRead||[]).filter(t=>allowed.has(String(t.title||t.tabTitle||'')));
source.visits=(source.visits||[]).filter(v=>allowed.has(String(v.sourceTab||'')));

const periods=new Map();
for(const v of source.visits){
  const key=String(v.periodKey||'');if(!key)continue;
  const p=periods.get(key)||{key,label:v.periodLabel||key,fullLabel:v.periodLabel||key,projectId:'cinepolis',projectName:'Cinépolis',countries:{GT:0,HN:0},tabs:{},total:0};
  const c=String(v.country||v.pais||'');if(c==='GT'||c==='HN')p.countries[c]=(p.countries[c]||0)+1;if(c&&v.sourceTab)p.tabs[c]=v.sourceTab;p.total++;periods.set(key,p);
}
const oldPeriods=new Map((source.periods||[]).map(p=>[String(p.key||''),p]));
source.periods=[...periods.values()].sort((a,b)=>a.key.localeCompare(b.key)).map(p=>{const old=oldPeriods.get(p.key)||{};return {...old,...p,countries:p.countries,tabs:p.tabs,total:p.total};});
const refs=new Set(source.visits.map(v=>String(v.shopperId||'')).filter(Boolean));
source.shoppers=(source.shoppers||[]).filter(s=>refs.has(String(s.id||s.shopperId||'')));
source.counts=recalcCounts(source);
source.source={...(source.source||{}),tabRegistryEnforced:true,tabRegistryMode:registryMode,tabRegistryAutoDiscovery:providerMetadataLive,tabRegistryObservedAt:registry.observedAt,tabRegistryProviderAuthority:providerMetadataLive?'google_sheets_metadata':'last_valid_provider_registry',phantomTabsRejected:uniq(removedTabs)};
source.safeState={...(source.safeState||{}),writes:false,tabRegistryEnforced:true};
const after={tabs:source.tabsRead.length,periods:source.periods.length,visits:source.visits.length,shoppers:source.shoppers.length};
const payload=`/* CXOrbia TyA live HR source-safe DEV payload. Provider tab registry enforced; no sensitive PII/raw workbook. */window.CX_TYA_HR_SOURCE_SAFE = ${JSON.stringify(source,null,2)};\nwindow.CX_TYA_HR_VIVA_SOURCE_SAFE = true;\n`;
fs.writeFileSync(sourcePath,payload,'utf8');

const evidence={schemaVersion:'cxorbia.tya-live-tab-registry-enforcement.v3',generatedAt:new Date().toISOString(),decision:'PASS_PROVIDER_TAB_REGISTRY_ENFORCED',accessMode,registryMode,autoDiscovery:providerMetadataLive,providerMetadataSource:sourceCarriesProviderMetadata?'source_builder_sheets_api':externalProviderRegistry?'adc_registry_probe':'last_valid_registry',providerMetadataFallbackReason:providerMetadataLive?null:(source.source?.fallbackReason||null),registryObservedAt:registry.observedAt,monthlyTabs:(registry.monthlyTabs||[]).length,requiredAugustTabsPresent:registry.requiredAugustTabsPresent===true,before,after,phantomTabsRejected:uniq(removedTabs),counts:source.counts,safety:{providerReads:true,hrWrites:0,firestoreWrites:0,authWrites:0,hostingDeploys:0,production:false,merge:false,pii:false,secrets:false}};
fs.mkdirSync(path.dirname(evidencePath),{recursive:true});
fs.writeFileSync(evidencePath,JSON.stringify(evidence,null,2)+'\n','utf8');
console.log(JSON.stringify(evidence));
