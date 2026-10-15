#!/usr/bin/env node
import test from 'node:test';
import assert from 'node:assert/strict';
import {diagnoseCrosswalkCandidate} from './cxorbia-i3-vrm185-global-identity-consolidation-plan.mjs';

const base={
 current:'hr-101',legacy:'canonical-202',crosswalkExists:true,tenantId:'tya',projectId:'cinepolis',
 link:{tenantId:'tya',projectScope:'cinepolis',canonicalShopperId:'canonical-202',authorityType:'tenant_adjudication',authorityRef:'admin-evidence-01',humanConfirmed:true,sourceSafe:true,fuzzyMatching:false},
 crosswalk:{tenantId:'tya',shopperId:'canonical-202',canonicalShopperId:'canonical-202',sourceType:'hr_external',sourceStableKey:'hr-101',identityMode:'provider_exact_identity_link',migrationAuthorityType:'tenant_adjudication',migrationAuthorityRef:'admin-evidence-01',projectIds:['cinepolis'],fuzzyMatching:false}
};
const check=(patch={})=>diagnoseCrosswalkCandidate({...base,...patch,link:{...base.link,...patch.link},crosswalk:{...base.crosswalk,...patch.crosswalk}});
test('direct HR crosswalk remains accepted',()=>{
 const r=check({crosswalk:{shopperId:'hr-101',identityMode:'stable_hr_shopper_id'}});
 assert.equal(r.direct,true);assert.equal(r.eligible,true);
});
test('exact provider alias is eligible only with exact signed administrative linkage',()=>{
 const r=check();assert.equal(r.trustedAlias,true);assert.equal(r.eligible,true);assert.equal(r.flags.shopperIdMismatch,true);
});
test('missing crosswalk is counted distinctly and never eligible',()=>{
 const r=check({crosswalkExists:false});assert.equal(r.flags.missingCrosswalk,true);assert.equal(r.eligible,false);
});
test('canonical pointer mismatch without alias proof stays blocked',()=>{
 const r=check({crosswalk:{identityMode:'untrusted',shopperId:'other-222'}});
 assert.equal(r.flags.shopperIdMismatch,true);assert.equal(r.eligible,false);
});
test('sourceType not HR external is separately identified',()=>{
 const r=check({crosswalk:{sourceType:'platform_created'}});
 assert.equal(r.flags.sourceTypeMismatch,true);assert.equal(r.eligible,false);
});
test('sourceStableKey mismatch is never accepted as exact HR alias',()=>{
 const r=check({crosswalk:{sourceStableKey:'other-hr-id'}});
 assert.equal(r.flags.aliasSourceStableKeyMatch,false);assert.equal(r.eligible,false);
});
test('identity authority, tenant and project mismatches fail closed',()=>{
 for(const patch of [
  {crosswalk:{migrationAuthorityRef:'other'}},
  {crosswalk:{tenantId:'other'}},
  {link:{projectScope:'other'}},
  {crosswalk:{projectIds:['another-project']}},
  {link:{humanConfirmed:false}},
  {crosswalk:{fuzzyMatching:true}}
 ]) assert.equal(check(patch).eligible,false,JSON.stringify(patch));
});
test('matching names without independent crosswalk proof cannot authorize a merge',()=>{
 const r=check({crosswalkExists:false,link:{displayName:'José Sarat'}});
 assert.equal(r.eligible,false);
});
