import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {resolveExcelOriginalProjectPlan,readExcelOriginalProjectSnapshot} from '../../cxorbia-excel-operational-snapshot-v1.mjs';
const columnMap=JSON.parse(fs.readFileSync(new URL('../../../contracts/tya-hr-column-map-r20-v1.json',import.meta.url),'utf8'));
const cinemaRegistry=JSON.parse(fs.readFileSync(new URL('../../../contracts/tya-cinepolis-cinema-identity-r20-v1.json',import.meta.url),'utf8'));
const source={mode:'external',authority:'external_source',providerType:'excel_online',
 readPolicy:'external_live',writePolicy:'external_read_only',periodDiscovery:'provider_auto',countryBindings:[
 {countryCode:'GT',providerBindingId:'gt',mappingRef:columnMap.contractId},
 {countryCode:'HN',providerBindingId:'hn',mappingRef:columnMap.contractId}]};
const project={tenantId:'tya',projectId:'cinepolis',name:'Cinépolis',countries:['GT','HN'],version:12,operationalSource:source};
const fakeSetting=code=>({tenantId:'tya',projectId:'cinepolis',countryCode:code,enabled:true,
 providerType:'excel_online',readPolicy:'external_live',writePolicy:'external_read_only',hrWritesEnabled:false,
 mappingRef:columnMap.contractId,providerBindingId:code.toLowerCase(),
 driveId:'drive-'+code,itemId:'item-'+code+'!original',
 periodSheets:[{periodId:'cinepolis-2026-11',worksheetId:'{00000000-0000-0000-0000-000000000001}',worksheetName:'NOVIEMBRE 26'}]});
const record=(data,i)=>({exists:true,data:()=>structuredClone(data),updateTime:{seconds:1795100000,nanoseconds:i}});
function fixture({projectOverride=project,durableVisits=[]}={}){
 const docs=new Map([
 ['tenants/tya/projects/cinepolis',record(projectOverride,1)],
 ['tenants/tya/integrationSettings/gt',record(fakeSetting('GT'),2)],
 ['tenants/tya/integrationSettings/hn',record(fakeSetting('HN'),3)]
 ]);
 const db={doc:path=>({get:async()=>docs.get(path)||{exists:false},}) ,
 collection:name=>{
  assert.equal(name,'tenants');return{doc:tenant=>{assert.equal(tenant,'tya');return {
   collection:section=>section==='shopperIdentityCrosswalk'?{get:async()=>({docs:[]})}:
    {doc:id=>{assert.equal(id,'cinepolis');return{collection:name=>{assert.equal(name,'visits');return{get:async()=>({docs:durableVisits.map(v=>({id:v.id,data:()=>v}))})}}}}}
  }}};
 }};
 return db;
}
const header=Object.entries(columnMap.columns).map(([,field])=>field.aliases[0]);
const col=name=>Object.keys(columnMap.columns).indexOf(name);
const values=code=>{
 const row=new Array(header.length).fill('');
 for(const [k,v] of Object.entries({pais:code==='GT'?'Guatemala':'Honduras',
 idCinema:code==='GT'?'2022002':'2052001',ciudad:code==='GT'?'Ciudad QA':'Tegucigalpa',
 shopping:code==='GT'?'C. Miraflores':'C. Las Cascadas Honduras',
 quincena:'1Q',franja:'WKND',formato:'2D',tipoCompra:'Boletería',
 shopper:'p x asignar',controlDia:'P x asignar'}))row[col(k)]=v;
 return [header,row];
};
const readBinding=async binding=>({privateProviderRows:binding.privateProvider.worksheets.map(s=>({
 worksheetId:s.worksheetId,scenarioKey:s.scenarioKey,values:values(binding.scope.countryCode)})),
 proof:{bindingFingerprint:binding.proof.bindingFingerprint,sourceRevision:'a'.repeat(64),
 externalRevisionIndependentlyVerified:true,hrWrites:0}});
test('configured original Excel project resolves two independent source-bound country/periods',async()=>{
 const db=fixture(),plan=await resolveExcelOriginalProjectPlan({db,scope:{tenantId:'tya',projectId:'cinepolis'}});
 assert.equal(plan.proof.providerType,'excel_online');
 assert.equal(plan.proof.jobCount,2);
 assert.notEqual(plan.bindings[0].proof.bindingFingerprint,plan.bindings[1].proof.bindingFingerprint);
 assert.equal(plan.proof.hrWrites,false);
});
test('original Excel values become the sourceSafe operational snapshot without provider writes',async()=>{
 const db=fixture(),plan=await resolveExcelOriginalProjectPlan({db,scope:{tenantId:'tya',projectId:'cinepolis'}});
 const x=await readExcelOriginalProjectSnapshot({db,plan,columnMap,cinemaRegistry,readBinding});
 assert.equal(x.snapshot.source.type,'excel_online_original');
 assert.equal(x.snapshot.periods.length,1);
 assert.equal(x.snapshot.visits.length,2);
 assert.deepEqual(x.snapshot.counts.byCountry,{GT:1,HN:1});
 assert.equal(x.snapshot.counts.unassigned,2);
 assert.equal(x.snapshot.counts.assigned,0);
 assert.equal(x.snapshot.visits[0].canonicalFacets.available,true);
 assert.equal(x.proof.hrWrites,0);
 assert.equal(x.proof.firestoreWrites,0);
});
test('legacy Google selection cannot silently pass as operational Excel',async()=>{
 const db=fixture({projectOverride:{...project,operationalSource:{...source,providerType:'google_sheets'}}});
 await assert.rejects(resolveExcelOriginalProjectPlan({db,scope:{tenantId:'tya',projectId:'cinepolis'}}),/SOURCE_POLICY/);
});
test('existing nonarchived durable visits cannot disappear during source switch',async()=>{
 const db=fixture({durableVisits:[{id:'durable_existing',tenantId:'tya',projectId:'cinepolis',
   periodId:'cinepolis-2026-11',country:'GT',cinemaId:'wrong',sucursal:'Another',
   quincena:'2Q',escenario:'APP',tipoCombo:'B'}]});
 const plan=await resolveExcelOriginalProjectPlan({db,scope:{tenantId:'tya',projectId:'cinepolis'}});
 await assert.rejects(readExcelOriginalProjectSnapshot({db,plan,columnMap,cinemaRegistry,readBinding}),/UNMATCHED_ACTIVE_DURABLE_VISITS/);
});
test('provider revision without independent proof cannot publish a snapshot',async()=>{
 const db=fixture(),plan=await resolveExcelOriginalProjectPlan({db,scope:{tenantId:'tya',projectId:'cinepolis'}});
 await assert.rejects(readExcelOriginalProjectSnapshot({db,plan,columnMap,cinemaRegistry,
  readBinding:async binding=>({...await readBinding(binding),proof:{bindingFingerprint:binding.proof.bindingFingerprint,externalRevisionIndependentlyVerified:false}})}),/PROVIDER_READ_INVALID/);
});
