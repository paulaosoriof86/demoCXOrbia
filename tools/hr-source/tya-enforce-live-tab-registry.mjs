import fs from 'node:fs';
import vm from 'node:vm';

const sourcePath=process.env.CXORBIA_HR_SOURCE_SAFE_OUT||'.tmp/hr-current/tya-hr-source-safe.js';
const registryPath=process.env.CXORBIA_HR_TAB_REGISTRY||'backend/config/tya-live-hr-tab-registry.source-safe.json';
function loadSource(){const code=fs.readFileSync(sourcePath,'utf8');const sandbox={window:{}};vm.createContext(sandbox);vm.runInContext(code,sandbox);return JSON.parse(JSON.stringify(sandbox.window.CX_TYA_HR_SOURCE_SAFE));}
function countBy(rows,key){const out={};for(const row of rows){const v=String(row[key]||'');if(v)out[v]=(out[v]||0)+1;}return out;}

const registry=JSON.parse(fs.readFileSync(registryPath,'utf8'));
if(registry.schemaVersion!=='cxorbia.tya-live-hr-tab-registry.v1'||registry.sourceSafe!==true)throw new Error('tab_registry_invalid');
const allowed=new Set(registry.monthlyTabs||[]);
const source=loadSource();
if(!source||source.sourceSafe!==true)throw new Error('source_safe_missing');

const before={tabs:(source.tabsRead||[]).length,periods:(source.periods||[]).length,visits:(source.visits||[]).length,shoppers:(source.shoppers||[]).length};
const removedTabs=(source.tabsRead||[]).filter(t=>!allowed.has(String(t.title||t.tabTitle||''))).map(t=>String(t.title||t.tabTitle||''));
source.tabsRead=(source.tabsRead||[]).filter(t=>allowed.has(String(t.title||t.tabTitle||'')));
source.visits=(source.visits||[]).filter(v=>allowed.has(String(v.sourceTab||'')));
const periods=new Map();
for(const v of source.visits){const key=String(v.periodKey||'');if(!key)continue;const p=periods.get(key)||{key,label:v.periodLabel||key,fullLabel:v.periodLabel||key,projectId:'cinepolis',projectName:'Cinépolis',countries:{GT:0,HN:0},tabs:{},total:0};const c=String(v.country||v.pais||'');if(c==='GT'||c==='HN')p.countries[c]=(p.countries[c]||0)+1;if(c&&v.sourceTab)p.tabs[c]=v.sourceTab;p.total++;periods.set(key,p);}
const oldPeriods=new Map((source.periods||[]).map(p=>[String(p.key||''),p]));
source.periods=[...periods.values()].sort((a,b)=>a.key.localeCompare(b.key)).map(p=>{const old=oldPeriods.get(p.key)||{};return {...old,...p,countries:p.countries,tabs:p.tabs,total:p.total};});
const refs=new Set(source.visits.map(v=>String(v.shopperId||'')).filter(Boolean));
source.shoppers=(source.shoppers||[]).filter(s=>refs.has(String(s.id||s.shopperId||'')));
source.counts={...(source.counts||{}),tabs:source.tabsRead.length,periods:source.periods.length,visits:source.visits.length,shoppers:source.shoppers.length};
source.source={...(source.source||{}),tabRegistryEnforced:true,tabRegistryObservedAt:registry.observedAt,phantomTabsRejected:[...new Set(removedTabs)].sort()};
source.safeState={...(source.safeState||{}),writes:false,tabRegistryEnforced:true};
const after={tabs:source.tabsRead.length,periods:source.periods.length,visits:source.visits.length,shoppers:source.shoppers.length};
const payload=`/* CXOrbia TyA live HR source-safe DEV payload. Provider-observed tab registry enforced; no PII/raw workbook. */window.CX_TYA_HR_SOURCE_SAFE = ${JSON.stringify(source,null,2)};\nwindow.CX_TYA_HR_VIVA_SOURCE_SAFE = true;\n`;
fs.writeFileSync(sourcePath,payload,'utf8');
console.log(JSON.stringify({decision:'PASS_PROVIDER_TAB_REGISTRY_ENFORCED',before,after,phantomTabsRejected:[...new Set(removedTabs)].sort(),periodCountryCounts:Object.fromEntries(source.periods.map(p=>[p.key,p.countries])),safety:{writes:0,pii:false}}));
