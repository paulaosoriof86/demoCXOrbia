import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateProjectPayload} from '../../cxorbia-project-command-provider-v1.mjs';
import {resolveCountryHrPeriodBinding,discoverExcelMonthlyWorksheets} from '../../cxorbia-country-hr-binding-v1.mjs';

const source={mode:'external',authority:'external_source',providerType:'excel_online',readPolicy:'external_live',
  writePolicy:'external_read_only',periodDiscovery:'provider_auto',countryBindings:[
    {countryCode:'GT',providerBindingId:'hr-gt',mappingRef:'mapping-gt'},
    {countryCode:'HN',providerBindingId:'hr-hn',mappingRef:'mapping-hn'}
  ]};
const project={tenantId:'tya',projectId:'cinepolis',name:'Cinépolis',countries:['GT','HN'],version:12,operationalSource:source};
const stamp=n=>({seconds:1795100000,nanoseconds:n});
const config=country=>({tenantId:'tya',projectId:'cinepolis',countryCode:country,enabled:true,providerType:'excel_online',
  readPolicy:'external_live',writePolicy:'external_read_only',hrWritesEnabled:false,
  mappingRef:`mapping-${country.toLowerCase()}`,providerBindingId:`hr-${country.toLowerCase()}`,
  driveId:`drive-${country}`,itemId:`item-${country}!original`,periodSheets:[
    {periodId:'2026-11',worksheetId:`sheet-${country}-11`,worksheetName:'NOVIEMBRE 26'}]});
function fixture(){
  const records=new Map([
    ['tenants/tya/projects/cinepolis',{value:structuredClone(project),timestamp:stamp(0)}],
    ['tenants/tya/integrationSettings/hr-gt',{value:config('GT'),timestamp:stamp(1)}],
    ['tenants/tya/integrationSettings/hr-hn',{value:config('HN'),timestamp:stamp(2)}]
  ]),reads=[];
  const db={doc:path=>({get:async()=>{reads.push(path);const row=records.get(path);return{
    exists:!!row,data:()=>row?structuredClone(row.value):undefined,updateTime:row?.timestamp
  };}})};
  return {db,records,reads};
}
const args=(db,countryCode='GT',periodId='2026-11')=>({db,tenantId:'tya',projectId:'cinepolis',countryCode,periodId});

test('B14 project config requires independent Excel Online binding and mapping for each country',()=>{
  assert.equal(validateProjectPayload(project).ok,true);
  assert.ok(validateProjectPayload({...project,operationalSource:{...source,providerBindingId:'global'}}).errors.includes('PROJECT_COUNTRY_HR_GLOBAL_FALLBACK_FORBIDDEN'));
  assert.ok(validateProjectPayload({...project,operationalSource:{...source,countryBindings:source.countryBindings.slice(0,1)}}).errors.includes('PROJECT_COUNTRY_HR_MISSING_COUNTRY'));
  assert.ok(validateProjectPayload({...project,operationalSource:{...source,countryBindings:[source.countryBindings[0],source.countryBindings[0]]}}).errors.includes('PROJECT_COUNTRY_HR_DUPLICATE_COUNTRY'));
  assert.ok(validateProjectPayload({...project,operationalSource:{...source,countryBindings:[source.countryBindings[0],{...source.countryBindings[1],providerBindingId:'hr-gt'}]}}).errors.includes('PROJECT_COUNTRY_HR_SHARED_BINDING_FORBIDDEN'));
  assert.ok(validateProjectPayload({...project,operationalSource:{...source,countryBindings:[source.countryBindings[0],{...source.countryBindings[1],providerBindingId:'https://onedrive.live.com/a'}]}}).errors.includes('PROJECT_COUNTRY_HR_BINDING_INVALID'));
  assert.ok(validateProjectPayload({...project,operationalSource:{...source,periodDiscovery:'configured'}}).errors.includes('PROJECT_COUNTRY_HR_PERIOD_DISCOVERY_REQUIRED'));
});

test('B14 resolves exact original workbook and stable monthly tab separately for GT and HN, with no writes',async()=>{
  const f=fixture(),gt=await resolveCountryHrPeriodBinding(args(f.db)),hn=await resolveCountryHrPeriodBinding(args(f.db,'HN'));
  assert.equal(gt.privateProvider.itemId,'item-GT!original');assert.equal(hn.privateProvider.itemId,'item-HN!original');
  assert.equal(gt.privateProvider.worksheets[0].worksheetId,'sheet-GT-11');assert.equal(hn.privateProvider.worksheets[0].worksheetId,'sheet-HN-11');
  assert.notEqual(gt.proof.workbookSha256,hn.proof.workbookSha256);
  assert.notEqual(gt.proof.bindingFingerprint,hn.proof.bindingFingerprint);
  for(const resolved of [gt,hn]){
    assert.equal(resolved.proof.providerAck,false);assert.equal(resolved.proof.hrWrites,false);
    assert.equal(resolved.proof.remoteRevisionVerified,false);
    assert.doesNotMatch(JSON.stringify(resolved.proof),/item-(?:GT|HN)|drive-(?:GT|HN)|sheet-(?:GT|HN)|hr-(?:gt|hn)\b/);
  }
  assert.deepEqual(f.reads,['tenants/tya/projects/cinepolis','tenants/tya/integrationSettings/hr-gt',
    'tenants/tya/projects/cinepolis','tenants/tya/integrationSettings/hr-hn']);
});

test('B14 discovers a new monthly worksheet after provider registry refresh, without changing project config',async()=>{
  const f=fixture();
  await assert.rejects(resolveCountryHrPeriodBinding(args(f.db,'GT','2026-12')),/PERIOD_UNREGISTERED/);
  const binding=f.records.get('tenants/tya/integrationSettings/hr-gt');
  binding.value.periodSheets.push({periodId:'2026-12',worksheetId:'new-month-stable-id',worksheetName:'DICIEMBRE 26'});
  binding.timestamp=stamp(3);
  const result=await resolveCountryHrPeriodBinding(args(f.db,'GT','2026-12'));
  assert.equal(result.privateProvider.worksheets[0].worksheetId,'new-month-stable-id');
  assert.equal(f.records.get('tenants/tya/projects/cinepolis').value.version,12);
});

test('B14 aggregates multiple scenario tabs for one country and month without choosing a first sheet',async()=>{
  const f=fixture(),setting=f.records.get('tenants/tya/integrationSettings/hr-gt');
  setting.value.periodSheets=[
    {periodId:'2026-11',worksheetId:'scenario-b',worksheetName:'NOV 26 - Verificación',scenarioKey:'verificacion'},
    {periodId:'2026-11',worksheetId:'scenario-a',worksheetName:'NOV 26 - Compra',scenarioKey:'compra'}
  ];
  const r=await resolveCountryHrPeriodBinding(args(f.db));
  assert.deepEqual(r.privateProvider.worksheets.map(x=>x.scenarioKey),['compra','verificacion']);
  assert.equal(r.proof.worksheetCount,2);
  setting.value.periodSheets[1].scenarioKey='verificacion';
  await assert.rejects(resolveCountryHrPeriodBinding(args(f.db)),/PERIOD_SCENARIO_AMBIGUOUS/);
});

test('B14 detects new monthly tabs by provider IDs and month semantics without identical names',()=>{
  const catalog=[{periodKey:'2026-11',periodId:'cinepolis-2026-11'},
    {periodKey:'2026-12',periodId:'cinepolis-2026-12'}];
  const inventory=[{id:'{guid-nov-a}',name:'NOVIEMBRE 26 - Compra'},
    {id:'{guid-nov-b}',name:'NOV 26 - Verificación'},
    {id:'{guid-dec}',name:'DICIEMBRE 26'},
    {id:'guide',name:'Instructivo de inducción'}];
  const discovered=discoverExcelMonthlyWorksheets({worksheets:inventory,periodCatalog:catalog});
  assert.equal(discovered.ok,true);assert.equal(discovered.entries.length,3);
  assert.deepEqual(discovered.entries.filter(x=>x.periodKey==='2026-11').map(x=>x.scenarioKey),['compra','verificacion']);
  assert.equal(discovered.entries.find(x=>x.worksheetId==='{guid-dec}').periodId,'cinepolis-2026-12');
  assert.equal(discovered.providerWrites,0);assert.equal(discovered.hrWrites,0);
  const renamed=discoverExcelMonthlyWorksheets({worksheets:[{id:'{guid-nov-a}',name:'NOVIEMBRE 26 - Compras actualizadas'}],
    periodCatalog:catalog,existing:discovered.entries});
  assert.equal(renamed.entries[0].scenarioKey,'compra','stable worksheet id preserves the prior scenario key');
});

test('B14 newly discovered month without a period shell stays unbound, never silently assigned',()=>{
  const result=discoverExcelMonthlyWorksheets({worksheets:[{id:'new-year-tab',name:'ENERO 27 - Compra'}],periodCatalog:[]});
  assert.equal(result.ok,false);assert.equal(result.unbound[0].periodKey,'2027-01');
  assert.equal(result.entries.length,0);
  const duplicated=discoverExcelMonthlyWorksheets({worksheets:[{id:'a',name:'NOV 26 - Compra'},{id:'b',name:'NOVIEMBRE 26 - Compra'}],
    periodCatalog:[{periodKey:'2026-11',periodId:'p-11'}]});
  assert.equal(duplicated.ok,false);assert.ok(duplicated.issues.includes('PERIOD_SCENARIO_AMBIGUOUS'));
});

for(const [name,change,code] of [
  ['wrong country',f=>f.records.get('tenants/tya/projects/cinepolis').value.countries=['HN'],'COUNTRY_NOT_ASSIGNED'],
  ['missing private binding',f=>f.records.delete('tenants/tya/integrationSettings/hr-gt'),'INTEGRATION_MISSING'],
  ['foreign workbook scope',f=>f.records.get('tenants/tya/integrationSettings/hr-gt').value.projectId='rola','INTEGRATION_SCOPE'],
  ['disabled integration',f=>f.records.get('tenants/tya/integrationSettings/hr-gt').value.enabled=false,'INTEGRATION_POLICY'],
  ['unapproved HR writes',f=>f.records.get('tenants/tya/integrationSettings/hr-gt').value.hrWritesEnabled=true,'WRITES_NOT_DISABLED'],
  ['wrong mapping',f=>f.records.get('tenants/tya/integrationSettings/hr-gt').value.mappingRef='other','INTEGRATION_POLICY'],
  ['missing workbook',f=>f.records.get('tenants/tya/integrationSettings/hr-gt').value.itemId='','WORKBOOK_REFERENCE_INVALID'],
  ['duplicated worksheet',f=>f.records.get('tenants/tya/integrationSettings/hr-gt').value.periodSheets.push({...config('GT').periodSheets[0]}),'WORKSHEET_DUPLICATE'],
  ['missing version',f=>f.records.get('tenants/tya/integrationSettings/hr-gt').timestamp=null,'VERSION_UNVERIFIABLE']
])test('B14 fails closed for '+name,async()=>{
  const f=fixture();change(f);await assert.rejects(resolveCountryHrPeriodBinding(args(f.db)),new RegExp(code));
});

test('B14 frontend and source contract expose country-scoped Excel without raw workbook URLs',()=>{
  const wizard=fs.readFileSync(new URL('../../../../app/modules/proyecto-wizard.js',import.meta.url),'utf8');
  const projects=fs.readFileSync(new URL('../../../../app/modules/proyectos.js',import.meta.url),'utf8');
  const hr=fs.readFileSync(new URL('../../../../app/modules/hr-source.js',import.meta.url),'utf8');
  const contract=JSON.parse(fs.readFileSync(new URL('../../../contracts/cxorbia-project-source-contract-v1.json',import.meta.url)));
  assert.match(wizard,/Excel Online \/ OneDrive \(por país\)/);assert.match(wizard,/wHrCountryBinding/);
  assert.match(wizard,/source\.countryBindings=st\.countries\.map/);
  assert.match(projects,/currentSource\.providerType==='excel_online'/);
  assert.match(hr,/HR originales de Excel Online · por país/);
  assert.equal(contract.projectSource.excelOnlineCountryBindings.globalBindingFallbackForbidden,true);
  assert.equal(contract.projectSource.excelOnlineCountryBindings.newMonthlyWorksheetsDiscoveredByProvider,true);
});
