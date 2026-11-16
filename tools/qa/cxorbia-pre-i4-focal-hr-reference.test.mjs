import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildFocalHrReference,assertFocalConfigAuthority,knownAmount,buildFocalDashboardStageReference,assertFocalDashboardStageReadback} from './cxorbia-pre-i4-focal-hr-reference.mjs';
const row=(pais,boleto,comboAmt,extra={})=>({pais,periodKey:'2026-11',honorario:null,boleto,comboAmt,canonicalFacets:{realized:true,liquidationCandidate:boleto!==null},...extra});
const fixture=()=>({snapshot:{visits:[row('GT',null,null),row('GT',39,118),row('GT',45,128),row('GT',45,112),row('GT',39,128),row('HN',null,null),row('HN',89,291)]},
  periodKey:'2026-11',countryCodes:['GT','HN'],projectConfig:{honorario:{GT:60,HN:200}},configAuthority:'firestore_project_config'});
test('same HR realizes GT300/654/partial and HN400/380/partial, independently of payable candidates',()=>{
  const input=fixture(),r=buildFocalHrReference(input);
  assert.deepEqual(r.finance.GT,{realizedCount:5,honorarioDevengado:300,knownReimbursements:654,reimbursementPartial:true});
  assert.deepEqual(r.finance.HN,{realizedCount:2,honorarioDevengado:400,knownReimbursements:380,reimbursementPartial:true});
  assert.equal(r.liquidations.total,7);assert.equal(r.liquidations.GT,5);assert.equal(r.liquidations.HN,2);
  assert.equal(input.snapshot.visits.filter(v=>v.canonicalFacets.liquidationCandidate).length,5);
  assert.equal(r.liquidations.paymentsConfirmed,0);assert.equal(r.liquidations.liquidationsConfirmed,0);
});
test('absence is never a known zero; a literal numeric zero remains valid',()=>{
  for(const v of [null,undefined,'',' ',false,[],{},'bad',Infinity])assert.equal(knownAmount(v),false);
  for(const v of [0,'0',12,'12.5'])assert.equal(knownAmount(v),true);
  const input=fixture();input.snapshot.visits=[row('GT',0,0,{honorario:0})];
  assert.deepEqual(buildFocalHrReference(input).finance.GT,{realizedCount:1,honorarioDevengado:0,knownReimbursements:0,reimbursementPartial:false});
});
test('explicit HR takes precedence, then authorized period, then project; missing authority yields null',()=>{
  const input=fixture();input.snapshot.visits=[row('GT',1,2,{honorario:25}),row('GT',3,null)];input.periodConfig={honorario:{GT:70}};
  assert.equal(buildFocalHrReference(input).finance.GT.honorarioDevengado,95);
  input.periodConfig.honorario.GT=null;assert.equal(buildFocalHrReference(input).finance.GT.honorarioDevengado,85);
  input.configAuthority='unverified';assert.equal(buildFocalHrReference(input).finance.GT.honorarioDevengado,null);
  input.configAuthority='firestore_project_config';input.projectConfig={};assert.equal(buildFocalHrReference(input).finance.GT.honorarioDevengado,null);
});
test('period scope, cancellations and independent confirmation facets remain enforced',()=>{
  const input=fixture();input.snapshot.visits=[row('GT',1,2,{canonicalFacets:{realized:true,paymentConfirmed:true}}),row('GT',3,4,{periodKey:'2026-10'}),row('HN',5,6,{canonicalFacets:{realized:true,cancelled:true}}),row('HN',7,8,{canonicalFacets:{realized:true,liquidationConfirmed:true}})];
  const r=buildFocalHrReference(input);assert.deepEqual(r.liquidations,{total:2,GT:1,HN:1,paymentsConfirmed:1,liquidationsConfirmed:1});
});
test('an empty country has no fabricated accrued amount',()=>{
  const input=fixture();input.snapshot.visits=[];
  assert.deepEqual(buildFocalHrReference(input).finance.GT,{realizedCount:0,honorarioDevengado:null,knownReimbursements:0,reimbursementPartial:false});
});
test('config must belong to the exact independently read project version and values',()=>{
  const input={snapshot:{projectId:'p',projectConfigAuthority:'firestore_project_config',projectConfigVersion:5,projectConfig:{honorario:{GT:60},currency:{GT:'Q'}}},projectId:'p',projectExists:true,projectConfig:{version:5,honorario:{GT:60},currency:{GT:'Q'}}};
  assert.equal(assertFocalConfigAuthority(input),true);
  for(const mutate of [v=>v.projectExists=false,v=>v.snapshot.projectId='other',v=>v.snapshot.projectConfigAuthority='local',v=>v.projectConfig.version=6,v=>v.projectConfig.honorario.GT=61,v=>v.projectConfig.currency.GT='L']){
    const v=structuredClone(input);mutate(v);assert.throws(()=>assertFocalConfigAuthority(v));
  }
});

const stageFixture=()=>{
  const raw=JSON.parse(fs.readFileSync(new URL('./fixtures/cxorbia-i3-b11-run2537-stage-keysets.json',import.meta.url)));
  const tenantId='tya',projectId='cinepolis',periodId='cinepolis-'+raw.periodKey,sourceRevision=raw.sourceRevision;
  return {tenantId,projectId,periodId,periodKey:raw.periodKey,sourceRevision,countryCodes:['GT','HN'],
    snapshot:{tenantId,projectId,sourceSafe:true,imported:false,production:false,_runtime:{revision:sourceRevision,revisionStable:true,hrWrites:false,imports:false},
      periods:[{id:periodId,key:raw.periodKey,projectId}],visits:raw.rows.map(v=>({...v,tenantId,projectId}))}};
};
test('independent saved HR retains exact cumulative country sets, including equal-count HN wrong-ID regression',()=>{
  const f=stageFixture(),r=buildFocalDashboardStageReference(f);
  assert.equal(r.countries.GT.total.length,34);assert.equal(r.countries.HN.total.length,10);
  assert.equal(r.countries.GT.agend.length,15);assert.equal(r.countries.HN.agend.length,5);
  assert.equal(r.countries.GT.cuest.length,5);assert.equal(r.countries.GT.submit.length,4);
  assert.deepEqual(r.countries.HN.cuest,['hr_2026-11_hn_6_49fa8eca21']);
  const input={expectedIds:r.countries.HN.cuest,visibleCount:1,modalIds:['hr_2026-11_hn_4_9402c9c858'],revision:f.sourceRevision,expectedRevision:f.sourceRevision};
  assert.throws(()=>assertFocalDashboardStageReadback(input),/KEYSET_MISMATCH/);
  input.modalIds=[...input.expectedIds];assert.equal(assertFocalDashboardStageReadback(input).pass,true);
});
test('current-period stage reference excludes other periods and archives but retains cancelled total only',()=>{
  const f=stageFixture(),base=f.snapshot.visits[0];
  f.snapshot.visits=[{...structuredClone(base),id:'active',hrRowId:'LIVE!1'},{...structuredClone(base),id:'past',hrRowId:'PAST!1',periodKey:'2026-10'},
    {...structuredClone(base),id:'archived',hrRowId:'LIVE!2',_archived:true},{...structuredClone(base),id:'cancelled',hrRowId:'LIVE!3',canonicalFacets:{...base.canonicalFacets,cancelled:true}}];
  const r=buildFocalDashboardStageReference(f);assert.deepEqual(r.countries.GT.total,['active','cancelled']);assert.deepEqual(r.countries.GT.agend,['active']);
});
test('stage authority rejects foreign scope, duplicate identity, incomplete facets and changed revision',()=>{
  const mutations=[f=>f.snapshot.sourceSafe=false,f=>f.snapshot.imported=true,f=>f.snapshot.production=true,f=>f.snapshot.tenantId='other',f=>f.snapshot._runtime.revision='a'.repeat(64),
    f=>f.snapshot._runtime.hrWrites=true,f=>f.snapshot.periods.push({...f.snapshot.periods[0]}),f=>f.snapshot.visits[0].projectId='other',f=>f.snapshot.visits[0].pais='XX',
    f=>f.snapshot.visits[0].hrRowId='',f=>f.snapshot.visits[0].id=f.snapshot.visits[1].id,f=>f.snapshot.visits[0].hrRowId=f.snapshot.visits[1].hrRowId,f=>delete f.snapshot.visits[0].canonicalFacets.assigned];
  for(const mutate of mutations){const f=stageFixture();mutate(f);assert.throws(()=>buildFocalDashboardStageReference(f),/SOURCE_FAILURE:B11_STAGE_/);}
});
test('an actual envelope runtime may supply authority but conflicting copies fail',()=>{
  const f=stageFixture();f.runtime=f.snapshot._runtime;delete f.snapshot._runtime;assert.equal(buildFocalDashboardStageReference(f).sourceRevision,f.sourceRevision);
  f.snapshot._runtime={...f.runtime,revision:'a'.repeat(64)};assert.throws(()=>buildFocalDashboardStageReference(f),/AUTHORITY/);
});
test('readback rejects duplicates, omissions, truncation, bad reference and observed revision drift',()=>{
  const revision='b'.repeat(64),base={expectedIds:['a','b'],visibleCount:2,modalIds:['b','a'],revision,expectedRevision:revision};
  assert.equal(assertFocalDashboardStageReadback(base).pass,true);
  for(const patch of [{modalIds:['a','a']},{modalIds:['a']},{modalIds:['a','']},{visibleCount:1},{revision:'c'.repeat(64)},{expectedIds:['a','a']},{expectedRevision:undefined,revision:undefined}])assert.throws(()=>assertFocalDashboardStageReadback({...base,...patch}));
  const ids=Array.from({length:41},(_,n)=>'v'+n);assert.throws(()=>assertFocalDashboardStageReadback({...base,expectedIds:ids,visibleCount:41,modalIds:ids.slice(0,40)}),/KEYSET_MISMATCH/);
});
