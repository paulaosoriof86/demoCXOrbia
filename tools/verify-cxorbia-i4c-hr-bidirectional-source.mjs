#!/usr/bin/env node
import assert from 'node:assert/strict';
import { planAssignmentSync, buildPlatformToHrOutbox, stableAssignmentKey } from '../backend/adapters/hr-bidirectional-sync-adapter.preview.mjs';

const base={tenantId:'tya',projectId:'cinepolis',visitId:'hr_2026-08_gt_2_demo',hrRowId:'AGOSTO 26!2'};
const tests=[];
const run=(name,fn)=>{fn();tests.push({name,pass:true});};

run('platform_to_hr',()=>{
  const p=planAssignmentSync({platformVisit:{...base,shopperId:'shopper_a',assignmentSource:'platform',assignmentSyncStatus:'pending',version:2},hrVisit:{...base,shopperId:null}});
  assert.equal(p.decision,'platform_to_hr_pending');
  assert.equal(p.actions[0].hrWriteRequired,true);
  const out=buildPlatformToHrOutbox({tenantId:'tya',projectId:'cinepolis',actorId:'tester'},p,{auditRef:'test'});
  assert.equal(out.channel,'hrSync');
  assert.equal(out.payload.shopperId,'shopper_a');
  assert.equal('shopper' in out.payload,false);
});
run('same_reflection_dedupes',()=>{
  const p=planAssignmentSync({platformVisit:{...base,shopperId:'shopper_a',assignmentSource:'platform',assignmentSyncStatus:'pending',version:2},hrVisit:{...base,shopperId:'shopper_a'},now:'2026-08-19T22:00:00Z'});
  assert.equal(p.decision,'hr_reflection_confirmed');
  assert.equal(p.actions[0].assignmentSyncStatus,'synced');
});
run('hr_to_platform',()=>{
  const p=planAssignmentSync({platformVisit:{...base,shopperId:null,version:4},hrVisit:{...base,shopperId:'shopper_b'},knownPlatformShopperIds:new Set(['shopper_b'])});
  assert.equal(p.decision,'hr_to_platform_pending');
  assert.equal(p.actions[0].commandType,'visit.assign');
  assert.equal(p.actions[0].assignmentSource,'hr');
  assert.equal(p.actions[0].removeFromAvailable,true);
});
run('unknown_hr_shopper_blocks',()=>{
  const p=planAssignmentSync({platformVisit:{...base,shopperId:null,version:4},hrVisit:{...base,shopperId:'shopper_x'},knownPlatformShopperIds:new Set(['shopper_b'])});
  assert.equal(p.decision,'review_conflict');
  assert.equal(p.conflictCode,'shopper_missing_in_platform');
});
run('shopper_conflict_name_never_wins',()=>{
  const p=planAssignmentSync({platformVisit:{...base,shopperId:'shopper_a',shopper:'Same Name'},hrVisit:{...base,shopperId:'shopper_b',shopper:'Same Name'}});
  assert.equal(p.decision,'review_conflict');
  assert.equal(p.conflictCode,'shopper_mismatch');
  assert.equal(p.actions.length,0);
});
run('identity_conflict',()=>{
  const p=planAssignmentSync({platformVisit:{...base,shopperId:'shopper_a'},hrVisit:{...base,hrRowId:'AGOSTO 26!3',shopperId:'shopper_a'}});
  assert.equal(p.conflictCode,'stable_identity_mismatch');
});
run('hr_origin_missing_reflection_conflict',()=>{
  const p=planAssignmentSync({platformVisit:{...base,shopperId:'shopper_a',assignmentSource:'hr'},hrVisit:{...base,shopperId:null}});
  assert.equal(p.conflictCode,'hr_reflection_missing');
});
run('stable_key_ignores_names',()=>{
  const a=stableAssignmentKey({...base,shopperId:'a',shopper:'Name 1',assignmentSource:'platform'});
  const b=stableAssignmentKey({...base,shopperId:'b',shopper:'Name 2',assignmentSource:'platform'});
  assert.equal(a,b);
});

console.log(JSON.stringify({schemaVersion:'cxorbia.i4c.hr-bidirectional-source-verifier.v1',decision:'PASS_I4C_HR_BIDIRECTIONAL_SYNC_SOURCE',tests,providerCalls:0,hrWrites:0,makeCalls:0,platformWrites:0},null,2));
