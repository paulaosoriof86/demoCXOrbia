import test from 'node:test';
import assert from 'node:assert/strict';
import {classifyA08MembershipEvidence as classify} from './cxorbia-i3-a08-membership-classifier.mjs';

const active={authLookup:'PRESENT',activeMembership:true,role:'shopper',authNamespace:'shopper',
  projectMember:true,authDisabled:false,claimShopperMatches:true,claimRoleMatches:true,claimTenantMatches:true};
const retired={...active,activeMembership:false,authDisabled:true};
const run=(records,extra={})=>classify({profileExists:true,membershipCount:records.length,authRecords:records,...extra});

test('one active and one disabled historical principal is not an active collision',()=>{
  for(const records of [[active,retired],[retired,active]]){
    const r=run(records);
    assert.equal(r.classification,'AUTH_RECORD_CONSISTENT_DISABLED_HISTORY_PASSWORD_LOGIN_UNPROVEN');
    assert.equal(r.canonicalAuthEligibleCount,1);
    assert.equal(r.historicalDisabledMembershipCount,1);
    assert.equal(r.ordinaryPasswordLoginProven,false);
  }
});
test('two active matching principals remain a hard collision',()=>{
  assert.equal(run([active,active]).classification,'AUTH_FAILURE:EXCEPTION_ACTIVE_MEMBERSHIP_COLLISION');
});
test('an active membership with disabled Auth is ambiguous, never silently accepted',()=>{
  assert.equal(run([active,{...retired,activeMembership:true}]).classification,'AUTH_FAILURE:EXCEPTION_AMBIGUOUS_MEMBERSHIP');
});
test('an inactive but Auth-enabled principal cannot be counted as retired',()=>{
  assert.equal(run([active,{...retired,authDisabled:false}]).classification,'AUTH_FAILURE:EXCEPTION_AMBIGUOUS_MEMBERSHIP');
});
test('one fully valid active principal remains password-unproven',()=>{
  assert.equal(run([active]).classification,'AUTH_RECORD_CONSISTENT_PASSWORD_LOGIN_UNPROVEN');
});
test('no profile and no membership is an orphan, not an authenticated shopper',()=>{
  assert.equal(run([],{profileExists:false}).classification,'AUTH_FAILURE:EXCEPTION_ORPHAN_NONCANONICAL');
});
test('bounded query, missing records, absent claims and conflicting project fail closed',()=>{
  assert.equal(run([active],{membershipCount:2}).classification,'MAPPING_FAILURE:EXCEPTION_AUTH_EVIDENCE_INCOMPLETE');
  assert.equal(run(Array(9).fill(retired)).classification,'AUTH_FAILURE:EXCEPTION_MEMBERSHIP_BOUND_EXCEEDED');
  assert.equal(run([{...active,claimTenantMatches:false}]).classification,'AUTH_FAILURE:EXCEPTION_AUTH_MAPPING_INCOMPLETE');
  assert.equal(run([{...active,projectMember:false}]).classification,'AUTH_FAILURE:EXCEPTION_AUTH_MAPPING_INCOMPLETE');
});
