#!/usr/bin/env node
/*
  CXOrbia TyA Phase A — lock a freshly read source-safe HR snapshot to the
  verified Corte 0B tab inventory.

  The live workbook may already contain later periods. Corte 0B must remain
  reproducible against its approved inventory (June 2025 through July 2026)
  until that cut is visually approved and frozen. This filter is read-only,
  source-safe and fail-closed: it never invents rows, identities or states.
*/
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import vm from 'node:vm';

const args=process.argv.slice(2);
const valueOf=(flag,fallback)=>{const i=args.indexOf(flag);return i>=0&&args[i+1]?args[i+1]:fallback;};
const input=path.resolve(valueOf('--input','app/data/tya-hr-source-safe-periods.js'));
const output=path.resolve(valueOf('--out',valueOf('--input','app/data/tya-hr-source-safe-periods.js')));
const inventoryFile=path.resolve(valueOf('--inventory','backend/contracts/tya-hr-tab-inventory-r20-v1.json'));
const reportDir=path.resolve(valueOf('--report-dir','.tmp/r20-inventory-cutoff'));
const globalName=valueOf('--global','CX_TYA_HR_SOURCE_SAFE');

function fail(message){throw new Error(`R20_INVENTORY_FILTER_HOLD: ${message}`);}
function readPayload(file){
  if(!fs.existsSync(file))fail(`missing input ${file}`);
  const sandbox={window:{}};
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(file,'utf8'),sandbox,{filename:file,timeout:5000});
  const payload=sandbox.window[globalName];
  if(!payload||typeof payload!=='object')fail(`missing window.${globalName}`);
  return JSON.parse(JSON.stringify(payload));
}
function writePayload(file,payload){
  fs.mkdirSync(path.dirname(file),{recursive:true});
  fs.writeFileSync(file,[
    '/* CXOrbia TyA source-safe snapshot filtered to the verified Corte 0B inventory. */',
    `window.${globalName} = `,
    JSON.stringify(payload,null,2),
    ';'
  ].join(''),'utf8');
}
function countBy(items,field){
  const out={};
  for(const item of items){const key=item?.[field]??'missing';out[key]=(out[key]||0)+1;}
  return out;
}

const inventory=JSON.parse(fs.readFileSync(inventoryFile,'utf8'));
if(inventory.contractId!=='tya-hr-tab-inventory-r20-v1')fail('inventory contract identity mismatch');
if(inventory.tenantId!=='tya'||inventory.projectId!=='cinepolis')fail('inventory tenant/project mismatch');
if(!Array.isArray(inventory.tabs)||!inventory.tabs.length)fail('inventory has no tabs');

const payload=readPayload(input);
if(payload.sourceSafe!==true||payload.imported===true||payload.production===true)fail('input is not source-safe non-production');

const allowedPeriods=new Set(inventory.tabs.map(tab=>String(tab.periodKey)));
const allowedTabs=new Set(inventory.tabs.map(tab=>String(tab.title)));
const periods=(payload.periods||[]).filter(period=>allowedPeriods.has(String(period.key)));
const visits=(payload.visits||[]).filter(visit=>allowedPeriods.has(String(visit.periodKey))&&allowedTabs.has(String(visit.sourceTab)));
const tabsRead=Array.isArray(payload.tabsRead)
  ? payload.tabsRead.filter(tab=>allowedTabs.has(String(tab.title||tab.tabTitle)))
  : payload.tabsRead;
const usedShopperIds=new Set(visits.map(visit=>visit.shopperId).filter(Boolean).map(String));
const shoppers=(payload.shoppers||[]).filter(shopper=>usedShopperIds.has(String(shopper.id||shopper.shopperId||'')));
const periodOperationalSummary=Array.isArray(payload.periodOperationalSummary)
  ? payload.periodOperationalSummary.filter(row=>allowedPeriods.has(String(row.periodKey)))
  : [];

const expected=inventory.historyScope||{};
if(periods.length!==Number(expected.periodCount))fail(`period count ${periods.length}/${expected.periodCount}`);
if(visits.length!==Number(expected.visitsExpectedFromCurrentStructure))fail(`visit count ${visits.length}/${expected.visitsExpectedFromCurrentStructure}`);
if(allowedTabs.size!==Number(expected.countryTabs))fail(`tab contract count ${allowedTabs.size}/${expected.countryTabs}`);
const observedTabs=new Set(visits.map(visit=>String(visit.sourceTab)));
const missingTabs=[...allowedTabs].filter(tab=>!observedTabs.has(tab));
if(missingTabs.length)fail(`verified tabs without visit rows: ${missingTabs.join(', ')}`);

const counts={
  ...(payload.counts||{}),
  periods:periods.length,
  tabs:allowedTabs.size,
  visits:visits.length,
  shoppers:shoppers.length,
  byStatus:countBy(visits,'estado'),
  byCountry:countBy(visits,'country')
};

const filtered={
  ...payload,
  periods,
  visits,
  shoppers,
  counts,
  periodOperationalSummary,
  tabsRead,
  source:{
    ...(payload.source||{}),
    inventoryContract:inventory.contractId,
    inventoryVerifiedAt:inventory.verifiedAt,
    inventoryFirstPeriod:expected.firstPeriod,
    inventoryLastPeriod:expected.lastPeriod,
    inventoryCountryTabs:Number(expected.countryTabs),
    inventoryFilterApplied:true,
    laterWorkbookPeriodsExcludedFromCurrentCut:true
  },
  normalization:{
    ...(payload.normalization||{}),
    historyScope:'all_verified_hr_periods',
    periodCount:periods.length,
    periodKeys:periods.map(period=>period.key),
    inventoryContract:inventory.contractId,
    rules:[...(payload.normalization?.rules||[]),'verified_inventory_cutoff_before_visual_freeze']
  }
};

writePayload(output,filtered);
fs.mkdirSync(reportDir,{recursive:true});
const excludedPeriods=(payload.periods||[]).map(period=>String(period.key)).filter(key=>!allowedPeriods.has(key));
const report={
  schemaVersion:'1.0.0',
  decision:'PASS_R20_VERIFIED_INVENTORY_FILTER',
  inventoryContract:inventory.contractId,
  input:path.relative(process.cwd(),input).replaceAll('\\','/'),
  output:path.relative(process.cwd(),output).replaceAll('\\','/'),
  observedBefore:{periods:(payload.periods||[]).length,tabs:Number(payload.counts?.tabs||0),visits:(payload.visits||[]).length,shoppers:(payload.shoppers||[]).length},
  observedAfter:{periods:periods.length,tabs:allowedTabs.size,visits:visits.length,shoppers:shoppers.length,firstPeriod:periods[0]?.key||null,lastPeriod:periods.at(-1)?.key||null},
  excludedPeriods,
  missingTabs,
  safeState:{writes:false,imports:false,deploy:false,production:false,providers:false,payments:false,piiIncluded:false,rawWorkbookIncluded:false}
};
fs.writeFileSync(path.join(reportDir,'report.json'),JSON.stringify(report,null,2)+'\n','utf8');
fs.writeFileSync(path.join(reportDir,'report.md'),[
  '# R20 verified inventory filter','',
  `Decision: **${report.decision}**`,
  `Periods before/after: ${report.observedBefore.periods}/${report.observedAfter.periods}`,
  `Visits before/after: ${report.observedBefore.visits}/${report.observedAfter.visits}`,
  `Verified tabs: ${report.observedAfter.tabs}`,
  `Excluded later periods: ${excludedPeriods.length?excludedPeriods.join(', '):'none'}`,'',
  'Read-only source-safe cutoff. No writes, imports, deploy or production.'
].join('\n')+'\n','utf8');
console.log(JSON.stringify(report,null,2));
