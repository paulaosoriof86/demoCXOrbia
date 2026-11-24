import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {resolveExcelOriginalProjectPlan,readExcelOriginalProjectSnapshot} from '../../cxorbia-excel-operational-snapshot-v1.mjs';
import {readExcelPeriodThroughMake} from '../../cxorbia-make-graph-provider-v1.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../../..');
const columnMap=JSON.parse(fs.readFileSync(path.join(root,'backend/contracts/tya-hr-column-map-r20-v1.json'),'utf8'));
const cinemaRegistry=JSON.parse(fs.readFileSync(path.join(root,'backend/contracts/tya-cinepolis-cinema-identity-r20-v1.json'),'utf8'));
const tenantId='tya',projectId='f3-qa-20261124',scope={tenantId,projectId};
const stamp=(data,n=1)=>({exists:true,data:()=>structuredClone(data),updateTime:{seconds:1795510000,nanoseconds:n}});
function fixture(writePolicy='bidirectional_gated'){
 const source={mode:'external',providerType:'excel_online',readPolicy:'external_live',writePolicy,periodDiscovery:'provider_auto',
  countryBindings:['GT','HN'].map(countryCode=>({countryCode,providerBindingId:'qa-'+countryCode,mappingRef:columnMap.contractId}))};
 const project={tenantId,projectId,name:'F3 QA isolated project',countries:['GT','HN'],version:1,operationalSource:source};
 const docs=new Map([['tenants/tya/projects/'+projectId,stamp(project)]]);
 for(const countryCode of ['GT','HN'])docs.set('tenants/tya/integrationSettings/qa-'+countryCode,stamp({tenantId,projectId,countryCode,
  providerBindingId:'qa-'+countryCode,providerType:'excel_online',readPolicy:'external_live',writePolicy,hrWritesEnabled:writePolicy==='bidirectional_gated',enabled:true,
  mappingRef:columnMap.contractId,driveId:'qa-drive',itemId:'qa-item-'+countryCode,
  periodSheets:['2025-06','2026-11'].map(key=>({periodId:projectId+'-'+key,worksheetId:'qa-'+countryCode+'-'+key,worksheetName:countryCode+' '+key}))},countryCode==='GT'?2:3));
 let writes=0;
 const query=key=>({doc:id=>query(key+'/'+id),collection:name=>query(key+'/'+name),get:async()=>docs.get(key)||{exists:false,docs:[]},
  set:()=>{writes++;throw Error('reader must not write');},update:()=>{writes++;throw Error('reader must not write');}});
 const db={doc:query,collection:query};
 const header=Object.values(columnMap.columns).map(x=>x.aliases[0]),keys=Object.keys(columnMap.columns);
 const rows=binding=>{const country=binding.scope.countryCode,key=binding.scope.periodId.slice(-7),row=header.map(()=>'');
  const values={pais:country==='GT'?'Guatemala':'Honduras',idCinema:country==='GT'?'2022002':'2052001',ciudad:'QA City',shopping:country==='GT'?'C. Miraflores':'C. Las Cascadas Honduras',
   quincena:'1Q',franja:'WKND',formato:'2D',tipoCombo:'QA Combo',tipoCompra:'QA Escenario',shopper:'',disponibleDesde:key+'-01',controlDia:'P x asignar'};
  for(const [k,v]of Object.entries(values))row[keys.indexOf(k)]=v;return [header,row];};
 const calls=[];
 const readBinding=binding=>readExcelPeriodThroughMake({binding,columnMap,runScenario:async request=>{
  calls.push(request);const values=rows(binding),hash=crypto.createHash('sha256').update(JSON.stringify(values)).digest('hex');
  return {...request,status1:200,status2:200,values1:values,values2:structuredClone(values),rowCount1:2,rowCount2:2,hash1:hash,hash2:hash};
 }});
 return {db,docs,project,readBinding,calls,writes:()=>writes};
}
for(const policy of ['external_read_only','bidirectional_gated'])test('F3 exact QA project reads both countries and periods under '+policy+' without writes',async()=>{
 const h=fixture(policy),plan=await resolveExcelOriginalProjectPlan({db:h.db,scope});
 assert.equal(plan.proof.writePolicy,policy);assert.equal(plan.bindings.length,4);assert.equal(plan.proof.hrWrites,false);
 const result=await readExcelOriginalProjectSnapshot({db:h.db,plan,columnMap,cinemaRegistry,readBinding:h.readBinding});
 assert.equal(result.snapshot.visits.length,4);assert.equal(result.snapshot.periods.length,2);
 assert.ok(result.snapshot.visits.every(v=>v.tenantId===tenantId&&v.projectId===projectId&&v.program===projectId&&v.periodId.startsWith(projectId+'-')));
 assert.ok(result.snapshot.periods.every(p=>p.projectId===projectId&&p.id===projectId+'-'+p.key));
 assert.ok(result.snapshot.periodOperationalSummary.every(p=>p.projectId===projectId&&p.periodId===projectId+'-'+p.periodKey));
 assert.ok(h.calls.every(c=>c.projectId===projectId&&['GT','HN'].includes(c.countryCode)));
 assert.equal(h.calls.length,4);assert.equal(h.writes(),0);assert.equal(result.proof.firestoreWrites,0);assert.equal(result.proof.hrWrites,0);
});
test('F3 read policy cannot imply write permission when country setting disagrees',async()=>{
 const h=fixture(),key='tenants/tya/integrationSettings/qa-GT',data=h.docs.get(key).data();data.hrWritesEnabled=false;h.docs.set(key,stamp(data,4));
 await assert.rejects(resolveExcelOriginalProjectPlan({db:h.db,scope}),/COUNTRY_SETTING/);assert.equal(h.calls.length,0);assert.equal(h.writes(),0);
});
test('F3 server resolves configured Excel QA scope while preserving the legacy Google adapter guard',async()=>{
 const h=fixture(),source=fs.readFileSync(path.join(root,'backend/runtime/hr-live-service/server.mjs'),'utf8');
 const first=source.indexOf('function loadExcelMappingLibrary('),last=source.indexOf('function canonicalProtectedAuthNamespace(',first);
 const context={fs,path,crypto,ROOT:root,ensureAdmin:()=>({db:h.db}),resolveExcelOriginalProjectPlan};vm.createContext(context);vm.runInContext(source.slice(first,last),context);
 const plan=await context.resolveProjectHrReadBinding(scope,{db:h.db,root});assert.equal(plan.scope.projectId,projectId);assert.equal(plan.mappingRef,columnMap.contractId);
 const changed={...h.project,operationalSource:{mode:'external',providerType:'google_sheets',readPolicy:'external_live',writePolicy:'external_read_only',providerBindingId:'qa-gt',mappingRef:columnMap.contractId}};
 h.docs.set('tenants/tya/projects/'+projectId,stamp(changed,10));
 await assert.rejects(context.resolveProjectHrReadBinding(scope,{db:h.db,root}),/ADAPTER_SCOPE_UNSUPPORTED/);assert.equal(h.writes(),0);
});
test('F3 private mapping remains exact: unknown library cannot borrow the approved country columns',async()=>{
 const h=fixture(),source=fs.readFileSync(path.join(root,'backend/runtime/hr-live-service/server.mjs'),'utf8');
 const first=source.indexOf('function loadExcelMappingLibrary('),last=source.indexOf('function canonicalProtectedAuthNamespace(',first);
 const context={fs,path,crypto,ROOT:root,ensureAdmin:()=>({db:h.db}),resolveExcelOriginalProjectPlan};vm.createContext(context);vm.runInContext(source.slice(first,last),context);
 h.project.operationalSource.countryBindings.forEach(c=>c.mappingRef='unknown-column-map');h.docs.set('tenants/tya/projects/'+projectId,stamp(h.project,10));
 await assert.rejects(context.resolveProjectHrReadBinding(scope,{db:h.db,root}),/MAPPING_UNSUPPORTED/);assert.equal(h.writes(),0);
});

test('F3 read range belongs to the private country binding and cannot be overridden by a caller',async()=>{
 const h=fixture();for(const country of ['GT','HN']){const path='tenants/tya/integrationSettings/qa-'+country,row=h.docs.get(path).data();h.docs.set(path,stamp({...row,readRangeAddress:'A1:Z2'},9));}
 const plan=await resolveExcelOriginalProjectPlan({db:h.db,scope});assert.ok(plan.bindings.every(x=>x.privateProvider.readRangeAddress==='A1:Z2'));
 await h.readBinding(plan.bindings[0]);assert.equal(h.calls[0].rangeAddress,'A1:Z2');
 await assert.rejects(readExcelPeriodThroughMake({binding:plan.bindings[0],columnMap,rangeAddress:'A1:AI140',runScenario:()=>{throw Error('must not call provider');}}),/RANGE_BINDING_CONFLICT/);assert.equal(h.calls.length,1);assert.equal(h.writes(),0);
 const p='tenants/tya/integrationSettings/qa-GT';h.docs.set(p,stamp({...h.docs.get(p).data(),readRangeAddress:'A1:ZZ999'},10));
 await assert.rejects(resolveExcelOriginalProjectPlan({db:h.db,scope}),/READ_RANGE_INVALID/);assert.equal(h.calls.length,1);
});
