import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {resolveExcelOriginalProjectPlan,readExcelOriginalProjectSnapshot} from '../../cxorbia-excel-operational-snapshot-v1.mjs';
import {parseTab} from '../../../../tools/hr-source/tya-build-live-hr-source-safe-r20.mjs';
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
 quincena:'1Q',franja:'WKND',formato:'2D',tipoCombo:'Combo QA',tipoCompra:'Boletería',
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
test('Excel snapshot preserves arbitrary project scenario dimensions without substitution',async()=>{
 const catalogs=[
  [{key:'formaAtencion',label:'Forma de atención',icon:'📋',sourceField:'escenario',aliases:['canalAtencion']}],
  [{key:'formaAtencion',label:'Forma de atención',sourceField:'escenario'},
   {key:'modalidad',label:'Modalidad configurada',sourceField:'formato'}]
 ];
 for(const scenarioDimensions of catalogs){
  const db=fixture({projectOverride:{...project,scenarioDimensions}});
  const plan=await resolveExcelOriginalProjectPlan({db,scope:{tenantId:'tya',projectId:'cinepolis'}});
  const result=await readExcelOriginalProjectSnapshot({db,plan,columnMap,cinemaRegistry,readBinding});
  assert.deepEqual(result.snapshot.projectConfig.scenarioDimensions,scenarioDimensions);
  assert.equal(result.proof.firestoreWrites,0);assert.equal(result.proof.hrWrites,0);
 }
});
test('Excel snapshot preserves an explicit empty catalog despite populated visit values',async()=>{
 const db=fixture({projectOverride:{...project,scenarioDimensions:[]}});
 const plan=await resolveExcelOriginalProjectPlan({db,scope:{tenantId:'tya',projectId:'cinepolis'}});
 const result=await readExcelOriginalProjectSnapshot({db,plan,columnMap,cinemaRegistry,readBinding});
 assert.deepEqual(result.snapshot.projectConfig.scenarioDimensions,[]);
 assert.ok(result.snapshot.visits.some(v=>v.escenario&&v.tipoCombo));
 assert.equal(result.proof.firestoreWrites,0);assert.equal(result.proof.hrWrites,0);
});
test('Excel snapshot does not manufacture a catalog omitted by project metadata',async()=>{
 const db=fixture(),plan=await resolveExcelOriginalProjectPlan({db,scope:{tenantId:'tya',projectId:'cinepolis'}});
 const result=await readExcelOriginalProjectSnapshot({db,plan,columnMap,cinemaRegistry,readBinding});
 assert.equal(Object.hasOwn(result.snapshot.projectConfig,'scenarioDimensions'),false);
 assert.ok(result.snapshot.visits.some(v=>v.escenario&&v.tipoCombo));
 assert.equal(result.proof.firestoreWrites,0);assert.equal(result.proof.hrWrites,0);
});
test('legacy Google selection cannot silently pass as operational Excel',async()=>{
 const db=fixture({projectOverride:{...project,operationalSource:{...source,providerType:'google_sheets'}}});
 await assert.rejects(resolveExcelOriginalProjectPlan({db,scope:{tenantId:'tya',projectId:'cinepolis'}}),/SOURCE_POLICY/);
});
test('old durable row absent from current Excel remains untouched but does not block live reading',async()=>{
 const db=fixture({durableVisits:[{id:'durable_existing',tenantId:'tya',projectId:'cinepolis',
   periodId:'cinepolis-2026-11',country:'GT',cinemaId:'wrong',sucursal:'Another',
   quincena:'2Q',escenario:'APP',tipoCombo:'B'}]});
 const plan=await resolveExcelOriginalProjectPlan({db,scope:{tenantId:'tya',projectId:'cinepolis'}});
 const r=await readExcelOriginalProjectSnapshot({db,plan,columnMap,cinemaRegistry,readBinding});
 assert.equal(r.snapshot.visits.length,2);
 assert.equal(r.proof.unmatchedActive,1);
 assert.equal(r.snapshot.issues[0].severity,'review');
 assert.equal(r.snapshot.safeState.unmatchedDurableHistoricalReviewRequired,true);
 assert.equal(r.proof.firestoreWrites,0);
});
test('provider revision without independent proof cannot publish a snapshot',async()=>{
 const db=fixture(),plan=await resolveExcelOriginalProjectPlan({db,scope:{tenantId:'tya',projectId:'cinepolis'}});
 await assert.rejects(readExcelOriginalProjectSnapshot({db,plan,columnMap,cinemaRegistry,
  readBinding:async binding=>({...await readBinding(binding),proof:{bindingFingerprint:binding.proof.bindingFingerprint,externalRevisionIndependentlyVerified:false}})}),/PROVIDER_READ_INVALID/);
});

test('three historical documents for one original HR row retain the exact live owner and all aliases',async()=>{
 const parsed=parseTab({country:'GT',key:'2026-11',year:2026,month:11,
   tabTitle:'NOVIEMBRE 26',label:'Nov 2026',fullLabel:'Noviembre 2026'},
   values('GT'),columnMap,cinemaRegistry);
 assert.equal(parsed.visits.length,1);
 const gt=parsed.visits[0];
 const canonical={...gt,id:gt.id,visitId:gt.id,periodId:'cinepolis-2026-11',version:62};
 const shadow={...gt,id:'shadow_other_01',visitId:'shadow_other_01',
   periodId:'cinepolis-2026-11',version:2440};
 const historical={...gt,id:'historical_short_01',periodId:undefined,visitId:'historical_short_01',
   cinemaId:undefined,sucursal:undefined,escenario:undefined,periodKey:'2026-11'};
 const db=fixture({durableVisits:[historical,canonical,shadow]});
 const plan=await resolveExcelOriginalProjectPlan({db,scope:{tenantId:'tya',projectId:'cinepolis'}});
 const output=await readExcelOriginalProjectSnapshot({db,plan,columnMap,cinemaRegistry,readBinding});
 const live=output.snapshot.visits.find(x=>x.country==='GT');
 assert.equal(output.snapshot.visits.length,2);
 assert.equal(live.visitId,canonical.id);
 assert.equal(live.hrRowId,gt.hrRowId);
 assert.notEqual(live.visitId,live.hrRowId);
 assert.equal(output.proof.matchedSourceVisits,1);
 assert.equal(output.proof.matchedDurable,3);
 assert.equal(output.proof.historicalAliasesPreserved,2);
 assert.equal(output.proof.newSourceVisits,1);
 assert.equal(output.proof.firestoreWrites,0);
});
test('a source-row clone with a conflicting cinema AND branch is blocked rather than silently joined',async()=>{
 const parsed=parseTab({country:'GT',key:'2026-11',year:2026,month:11,
   tabTitle:'NOVIEMBRE 26',label:'Nov 2026',fullLabel:'Noviembre 2026'},
   values('GT'),columnMap,cinemaRegistry);
 const actual=parsed.visits[0],bad={...actual,id:'bad_owner',
   periodId:'cinepolis-2026-11',cinemaId:'9999',sucursal:'Different branch'};
 const db=fixture({durableVisits:[bad]}),
   plan=await resolveExcelOriginalProjectPlan({db,scope:{tenantId:'tya',projectId:'cinepolis'}});
 await assert.rejects(readExcelOriginalProjectSnapshot({db,plan,columnMap,cinemaRegistry,readBinding}),
   /EXACT_HR_ROW_CONTRADICTORY_BUSINESS_IDENTITY/);
});
test('two equally authoritative HR owner documents for the same original row fail closed',async()=>{
 const parsed=parseTab({country:'GT',key:'2026-11',year:2026,month:11,
   tabTitle:'NOVIEMBRE 26',label:'Nov 2026',fullLabel:'Noviembre 2026'},
   values('GT'),columnMap,cinemaRegistry);
 const source=parsed.visits[0],prefix='hr_2026-11_gt_';
 const a={...source,id:prefix+'candidate_a',periodId:'cinepolis-2026-11'};
 const b={...source,id:prefix+'candidate_b',periodId:'cinepolis-2026-11'};
 const db=fixture({durableVisits:[a,b]});
 const plan=await resolveExcelOriginalProjectPlan({db,scope:{tenantId:'tya',projectId:'cinepolis'}});
 await assert.rejects(readExcelOriginalProjectSnapshot({db,plan,columnMap,cinemaRegistry,readBinding}),
   /CANONICAL_DURABLE_OWNER_NOT_PROVEN/);
});

test('a moved original Excel row uses three exact business keys, never a foreign coordinate',async()=>{
 const parsed=parseTab({country:'GT',key:'2026-11',year:2026,month:11,
   tabTitle:'NOVIEMBRE 26',label:'Nov 2026',fullLabel:'Noviembre 2026'},
   values('GT'),columnMap,cinemaRegistry);
 const original=parsed.visits[0];
 const foreign={...original,id:'obsolete_same_row',periodId:'cinepolis-2026-11',
   cinemaId:'9999',sucursal:'Other cinema',_archived:true};
 const correct={...original,id:'durable_correct_business',visitId:'durable_correct_business',
   hrRowId:'NOVIEMBRE 26!77',sourceRow:77,periodId:'cinepolis-2026-11'};
 const db=fixture({durableVisits:[foreign,correct]});
 const plan=await resolveExcelOriginalProjectPlan({db,scope:{tenantId:'tya',projectId:'cinepolis'}});
 const output=await readExcelOriginalProjectSnapshot({db,plan,columnMap,cinemaRegistry,readBinding});
 const selected=output.snapshot.visits.find(x=>x.country==='GT');
 assert.equal(selected.id,'durable_correct_business');
 assert.equal(selected.hrRowId,original.hrRowId);
 assert.equal(output.proof.matchedDurable,1);
 assert.equal(output.proof.firestoreWrites,0);
});
test('a contradictory active legacy row is not silently dropped even with a strong replacement',async()=>{
 const parsed=parseTab({country:'GT',key:'2026-11',year:2026,month:11,
   tabTitle:'NOVIEMBRE 26',label:'Nov 2026',fullLabel:'Noviembre 2026'},
   values('GT'),columnMap,cinemaRegistry);
 const original=parsed.visits[0];
 const foreign={...original,id:'active_conflicting_row',periodId:'cinepolis-2026-11',
   cinemaId:'9999',sucursal:'Other cinema'};
 const correct={...original,id:'durable_correct_business',visitId:'durable_correct_business',
   hrRowId:'NOVIEMBRE 26!77',sourceRow:77,periodId:'cinepolis-2026-11'};
 const db=fixture({durableVisits:[foreign,correct]});
 const plan=await resolveExcelOriginalProjectPlan({db,scope:{tenantId:'tya',projectId:'cinepolis'}});
 const output=await readExcelOriginalProjectSnapshot({db,plan,columnMap,cinemaRegistry,readBinding});
 assert.equal(output.snapshot.visits.length,2);
 assert.equal(output.snapshot.visits.find(v=>v.country==='GT').id,correct.id);
 assert.equal(output.proof.unmatchedActive,1);
 assert.equal(output.snapshot.issues[0].code,'DURABLE_NOT_IN_CURRENT_EXTERNAL_SOURCE');
 assert.equal(output.snapshot.issues[0].writesAllowed,false);
 assert.equal(output.proof.firestoreWrites,0);
});

test('historical two-document cohort with obsolete foreign row preserves one canonical owner and both aliases',async()=>{
 const parsed=parseTab({country:'GT',key:'2026-11',year:2026,month:11,
  tabTitle:'NOVIEMBRE 26',label:'Nov 2026',fullLabel:'Noviembre 2026'},
  values('GT'),columnMap,cinemaRegistry);
 const original=parsed.visits[0];
 const foreign={...original,id:'obsolete_row',periodId:'cinepolis-2026-11',
   cinemaId:'9999',sucursal:'Different branch',_archived:true};
 const canonical={...original,id:'hr_2026-11_gt_canonical',visitId:'hr_2026-11_gt_canonical',
   hrRowId:'NOVIEMBRE 26!77',sourceRow:77,periodId:'cinepolis-2026-11'};
 const shadow={...canonical,id:'shadow_legacy',visitId:'shadow_legacy'};
 const db=fixture({durableVisits:[foreign,canonical,shadow]});
 const plan=await resolveExcelOriginalProjectPlan({db,scope:{tenantId:'tya',projectId:'cinepolis'}});
 const out=await readExcelOriginalProjectSnapshot({db,plan,columnMap,cinemaRegistry,readBinding});
 const picked=out.snapshot.visits.find(x=>x.country==='GT');
 assert.equal(picked.id,canonical.id);
 assert.equal(out.proof.matchedDurable,2);
 assert.equal(out.proof.historicalAliasesPreserved,1);
 assert.equal(out.proof.firestoreWrites,0);
});

test('moved historical row with two equivalent durable aliases selects one approved canonical owner',async()=>{
 const original=parseTab({country:'GT',key:'2026-11',year:2026,month:11,
   tabTitle:'NOVIEMBRE 26',label:'Nov 2026',fullLabel:'Noviembre 2026'},
   values('GT'),columnMap,cinemaRegistry).visits[0];
 const canonical={...original,id:'hr_2026-11_gt_canonical',visitId:'hr_2026-11_gt_canonical',
   hrRowId:'NOVIEMBRE 26!77',sourceTab:'NOVIEMBRE 26',sourceRow:77,
   periodId:'cinepolis-2026-11'};
 const alias={...canonical,id:'shadow_moved_legacy',visitId:'shadow_moved_legacy'};
 const db=fixture({durableVisits:[canonical,alias]});
 const plan=await resolveExcelOriginalProjectPlan({db,scope:{tenantId:'tya',projectId:'cinepolis'}});
 const x=await readExcelOriginalProjectSnapshot({db,plan,columnMap,cinemaRegistry,readBinding});
 const visit=x.snapshot.visits.find(x=>x.country==='GT');
 assert.equal(visit.id,canonical.id);
 assert.equal(x.proof.matchedDurable,2);
 assert.equal(x.proof.historicalAliasesPreserved,1);
 assert.equal(x.proof.firestoreWrites,0);
});
test('moved historical row with two competing canonical durable owners still fails closed',async()=>{
 const original=parseTab({country:'GT',key:'2026-11',year:2026,month:11,
   tabTitle:'NOVIEMBRE 26',label:'Nov 2026',fullLabel:'Noviembre 2026'},
   values('GT'),columnMap,cinemaRegistry).visits[0];
 const one={...original,id:'hr_2026-11_gt_owner_a',periodId:'cinepolis-2026-11',
   hrRowId:'NOVIEMBRE 26!77',sourceTab:'NOVIEMBRE 26',sourceRow:77};
 const two={...one,id:'hr_2026-11_gt_owner_b'};
 const db=fixture({durableVisits:[one,two]});
 const plan=await resolveExcelOriginalProjectPlan({db,scope:{tenantId:'tya',projectId:'cinepolis'}});
 await assert.rejects(readExcelOriginalProjectSnapshot({db,plan,columnMap,cinemaRegistry,readBinding}),
   /CANONICAL_DURABLE_OWNER_NOT_PROVEN/);
});

test('same cinema and cut preserve owner when the scenario and combo are edited',async()=>{
 const original=parseTab({country:'GT',key:'2026-11',year:2026,month:11,
   tabTitle:'NOVIEMBRE 26',label:'Noviembre',fullLabel:'Noviembre 2026'},
   values('GT'),columnMap,cinemaRegistry).visits[0];
 const canonical={...original,id:'hr_2026-11_gt_stable_site',
   periodId:'cinepolis-2026-11',escenario:'OLD_SCENARIO',tipoCombo:'OLD_COMBO'};
 const alias={...canonical,id:'linked_legacy_visita',visitId:'linked_legacy_visita'};
 const db=fixture({durableVisits:[canonical,alias]});
 const plan=await resolveExcelOriginalProjectPlan({db,scope:{tenantId:'tya',projectId:'cinepolis'}});
 const result=await readExcelOriginalProjectSnapshot({db,plan,columnMap,cinemaRegistry,readBinding});
 const current=result.snapshot.visits.find(v=>v.country==='GT');
 assert.equal(current.visitId,canonical.id);
 assert.deepEqual(current.durableAliasIds,[alias.id]);
 assert.equal(current.escenario,original.escenario);
 assert.equal(result.proof.matchedDurable,2);
});
test('unprefixed legacy HR document is preserved without inventing an extra active visit',async()=>{
 const original=parseTab({country:'GT',key:'2026-11',year:2026,month:11,
  tabTitle:'NOVIEMBRE 26',label:'Noviembre',fullLabel:'Noviembre 2026'},
  values('GT'),columnMap,cinemaRegistry).visits[0];
 const legacy={...original,id:'hr_2026-11_gt_legacy_evidence',periodId:'2026-11'};
 const db=fixture({durableVisits:[legacy]});
 const plan=await resolveExcelOriginalProjectPlan({db,scope:{tenantId:'tya',projectId:'cinepolis'}});
 const out=await readExcelOriginalProjectSnapshot({db,plan,columnMap,cinemaRegistry,readBinding});
 assert.equal(out.snapshot.visits.length,2);
 assert.equal(out.proof.historicalUnprefixedDocsPreserved,1);
 assert.equal(out.proof.firestoreWrites,0);
});

test('different month scenario, cinema and film do not require historical reconciliation',async()=>{
 const prior={id:'durable_prior_october',periodId:'cinepolis-2026-10',country:'GT',
   cinemaId:'completely_different_previous_cinema',sucursal:'Other former city',
   quincena:'1Q',escenario:'OLD_MOVIE',tipoCombo:'OLD_COMBO'};
 const db=fixture({durableVisits:[prior]});
 const plan=await resolveExcelOriginalProjectPlan({db,scope:{tenantId:'tya',projectId:'cinepolis'}});
 const output=await readExcelOriginalProjectSnapshot({db,plan,columnMap,cinemaRegistry,readBinding});
 assert.equal(output.snapshot.visits.length,2);
 assert.equal(output.proof.unmatchedActive,0);
 assert.equal(output.proof.otherPeriodsNotReconciled,true);
 assert.equal(output.proof.periodScopesVerified,2);
 assert.equal(output.proof.firestoreWrites,0);
});
test('same cinema and cut can have two distinct source rows in one month',async()=>{
 const db=fixture();
 const plan=await resolveExcelOriginalProjectPlan({db,scope:{tenantId:'tya',projectId:'cinepolis'}});
 const doubleRead=async binding=>{
  const r=await readBinding(binding);
  if(binding.scope.countryCode==='GT'){
    const tab=r.privateProviderRows[0],second=[...tab.values[1]];
    second[col('tipoCombo')]='OTHER_COMBO';
    tab.values.push(second);
  }
  return r;
 };
 const output=await readExcelOriginalProjectSnapshot({db,plan,columnMap,cinemaRegistry,readBinding:doubleRead});
 const gt=output.snapshot.visits.filter(v=>v.country==='GT');
 assert.equal(gt.length,2);
 assert.notEqual(gt[0].visitId,gt[1].visitId);
 assert.equal(output.proof.firestoreWrites,0);
});

test('two visits in the same country/month/cinema/cut never reuse a single durable visit ID',async()=>{
 const original=parseTab({country:'GT',key:'2026-11',year:2026,month:11,
   tabTitle:'NOVIEMBRE 26',label:'Noviembre',fullLabel:'Noviembre 2026'},
   values('GT'),columnMap,cinemaRegistry).visits[0];
 const previous={...original,periodId:'cinepolis-2026-11',id:original.id};
 const db=fixture({durableVisits:[previous]});
 const plan=await resolveExcelOriginalProjectPlan({db,scope:{tenantId:'tya',projectId:'cinepolis'}});
 const twoRows=async binding=>{
   const response=await readBinding(binding);
   if(binding.scope.countryCode==='GT'){
     const originalRow=response.privateProviderRows[0].values[1];
     const next=[...originalRow]; next[col('tipoCompra')]='Scenario B';
     next[col('tipoCombo')]='Different combo';
     response.privateProviderRows[0].values.push(next);
   }
   return response;
 };
 const result=await readExcelOriginalProjectSnapshot({db,plan,columnMap,cinemaRegistry,readBinding:twoRows});
 const rows=result.snapshot.visits.filter(x=>x.country==='GT');
 assert.equal(rows.length,2);
 assert.equal(new Set(rows.map(x=>x.visitId)).size,2);
 assert.equal(rows[0].visitId,previous.id);
 assert.notEqual(rows[1].visitId,previous.id);
 assert.equal(rows[1].escenario,'Scenario B');
 assert.equal(result.proof.firestoreWrites,0);
});
