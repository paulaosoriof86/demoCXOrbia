import test from 'node:test';
import assert from 'node:assert/strict';
import {excelVisitBusinessKey,reconcileOriginalExcelPeriod} from '../../cxorbia-excel-operational-lineage-v1.mjs';
const REV='a'.repeat(64), FP='b'.repeat(64);
const scope={tenantId:'tya',projectId:'cinepolis',periodId:'cinepolis-2026-11',countryCode:'GT'};
const binding={scope,proof:{providerType:'excel_online',readPolicy:'external_live',writePolicy:'external_read_only',hrWrites:false,bindingFingerprint:FP}};
const read={proof:{...scope,bindingFingerprint:FP,sourceRevision:REV,externalRevisionIndependentlyVerified:true,hrWrites:0}};
const raw={tenantId:'tya',projectId:'cinepolis',periodId:'cinepolis-2026-11',country:'GT',pais:'GT',cinemaId:'2022002',sucursal:'C. Miraflores',quincena:'1Q',franja:'WKND',escenario:'Boletería',formato:'2D',tipoCombo:'A',shopperId:'shopper_gt_alias01',hasShopper:true,canonicalFacets:{assigned:true},agendada:'2026-11-05',sourceRow:4,sourceTab:'NOVIEMBRE 26'};
const old={...raw,id:'hr_2026-11_gt_4_existing',visitId:'hr_2026-11_gt_4_existing',hrRowId:'NOVIEMBRE 26!4',shopperId:'shopper_gt_canonical'};
const alias=new Map([['shopper_gt_alias01','shopper_gt_canonical']]);
const canonicalizeVisit=v=>({...v,canonicalFacets:{...v.canonicalFacets,assigned:!!v.shopperId,available:!v.shopperId}});
const args={binding,read,parsedVisits:[raw],existingVisits:[old],exactShopperCrosswalk:alias,existingIndexComplete:true,canonicalizeVisit};

test('preserves previously durable visit and exact canonical shopper identity',()=>{
  const x=reconcileOriginalExcelPeriod(args);
  assert.equal(x.visits[0].visitId,old.hrRowId);
  assert.equal(x.visits[0].hrRowId,old.hrRowId);
  assert.equal(x.visits[0].shopperId,'shopper_gt_canonical');
  assert.equal(x.visits[0].canonicalFacets.available,false);
  assert.equal(x.proof.existingPreserved,1);
  assert.equal(x.proof.hrWrites,0);
});
test('source shopper/date changes do not change visit business key',()=>{
  const edited={...raw,shopperId:'shopper_gt_new',agendada:'2026-11-22',sourceRow:77};
  assert.equal(excelVisitBusinessKey(edited,scope),excelVisitBusinessKey(raw,scope));
});
test('a new exact source visit gets deterministic ID with complete durable index',()=>{
  const x=reconcileOriginalExcelPeriod({...args,existingVisits:[]});
  const y=reconcileOriginalExcelPeriod({...args,existingVisits:[]});
  assert.match(x.visits[0].visitId,/^hr_excel_[a-f0-9]{24}$/);
  assert.equal(x.visits[0].visitId,y.visits[0].visitId);
  assert.equal(x.visits[0].visitId,x.visits[0].hrRowId);
  assert.equal(x.proof.newVisits,1);
});
test('fail closed on absent or ambiguous durable identities and source duplicates',()=>{
  const fail=(o,pattern)=>assert.throws(()=>reconcileOriginalExcelPeriod({...args,...o}),pattern);
  fail({existingIndexComplete:false},/DURABLE_VISIT_INDEX_INCOMPLETE/);
  fail({existingVisits:[old,{...old,id:'duplicate2',visitId:'duplicate2'}]},/DURABLE_VISIT_INDEX_AMBIGUOUS/);
  fail({parsedVisits:[raw,raw]},/ORIGINAL_SOURCE_DUPLICATE_BUSINESS_KEY/);
  fail({exactShopperCrosswalk:new Map()},/ASSIGNED_SHOPPER_CROSSWALK_MISSING/);
  fail({read:{proof:{...read.proof,sourceRevision:'not-a-revision'}}},/PROVIDER_REVISION_UNVERIFIED/);
  fail({read:{proof:{...read.proof,periodId:'other'}}},/PROVIDER_READ_SCOPE_DRIFT/);
});
test('refuses unaccounted active historical visit rather than duplicate it',()=>{
  const another={...old,id:'old_other',visitId:'old_other',hrRowId:'NOVIEMBRE 26!6',sucursal:'C. Oakland Mall',cinemaId:'2022003'};
  assert.throws(()=>reconcileOriginalExcelPeriod({...args,existingVisits:[old,another]}),/EXISTING_ACTIVE_VISITS_UNMATCHED/);
});
test('tenant/project/period/country boundaries are mandatory',()=>{
  assert.throws(()=>reconcileOriginalExcelPeriod({...args,parsedVisits:[{...raw,projectId:'rola'}]}),/EXISTING_PROJECT_SCOPE_CONFLICT/);
  assert.throws(()=>reconcileOriginalExcelPeriod({...args,parsedVisits:[{...raw,country:'HN'}]}),/EXISTING_COUNTRY_SCOPE_CONFLICT/);
});
