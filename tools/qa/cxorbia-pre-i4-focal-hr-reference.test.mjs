import test from 'node:test';
import assert from 'node:assert/strict';
import {buildFocalHrReference,assertFocalConfigAuthority,knownAmount} from './cxorbia-pre-i4-focal-hr-reference.mjs';
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
