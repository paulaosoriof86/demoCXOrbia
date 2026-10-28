import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const bridge=fs.readFileSync(new URL('../../app/adapters/tya-protected-auth-hr-authority-bridge-v2.js',import.meta.url),'utf8');
const human=fs.readFileSync(new URL('../../app/adapters/tya-c6-unified-human-runtime-v1.js',import.meta.url),'utf8');
const countryStart=bridge.indexOf('function countryCode(');
const countryEnd=bridge.indexOf('\n',countryStart);
const start=bridge.indexOf('function shopperReadiness(');
const end=bridge.indexOf('\nfunction buildCompositionCandidate(',start);
assert.ok(countryStart>=0&&countryEnd>countryStart,'real countryCode helper source must exist');
assert.ok(start>=0&&end>start,'shopperReadiness source boundaries must exist');
const chunk=bridge.slice(start,end);
// Evaluate the exact helper used by the production bridge; the isolated
// fixture must not turn a valid HN branch into an undefined-function failure.
const countryChunk=bridge.slice(countryStart,countryEnd);
const fn=vm.runInNewContext(countryChunk+'\n'+chunk+'\n shopperReadiness;', {str:v=>String(v??'').trim(),arr:v=>Array.isArray(v)?v:[],Set});
test('R20 authenticated exact shopper with zero assigned visits remains eligible',()=>{
 const profile={ok:true,profile:{id:'canonical-shopper',pais:'GT'},canonicalShopperId:'canonical-shopper'};
 const got=fn(profile,{visits:[]},{country:'GT'});
 assert.equal(got.ok,true);
 assert.equal(got.reason,'shopper_ready_without_assigned_visits');
 assert.equal(got.ownVisits,0);
 assert.equal(got.authorizedPeriods,0);
});
test('R20 rejects missing or ambiguous exact shopper profile',()=>{
 for(const profile of [{ok:false,reason:'no_exact_identity'},{ok:false,reason:'ambiguous_exact_identity'}])
  assert.equal(fn(profile,{visits:[]},{country:'GT'}).ok,false);
});
test('R20 refuses shopper without country authority',()=>{
 assert.equal(fn({ok:true,profile:{id:'canon'},canonicalShopperId:'canon'},{visits:[]},{}).ok,false);
});
test('R20 legacy valid shopper with visits preserves derived period provenance',()=>{
 const p={ok:true,profile:{id:'canon',country:'HN'},canonicalShopperId:'canon'};
 const r=fn(p,{visits:[{id:'v1',shopperId:'canon',periodId:'period-1'}]},{country:'HN'});
 assert.equal(r.ok,true);assert.equal(r.ownVisits,1);assert.equal(r.authorizedPeriods,1);
});
test('R20 retains claims/tenant/namespace exact checks but no artificial assignment gate',()=>{
 assert.match(bridge,/SHOPPER_PRINCIPAL_CLAIMS_MEMBERSHIP_MISMATCH/);
 assert.match(human,/authority\.shopperPrincipalClaimsVerified===true/);
 assert.match(human,/str\(authority\.rawShopperId\)===str\(ctx\.shopperId\)/);
 assert.doesNotMatch(human,/Number\(authority\.ownVisits\|\|0\)>0/);
 assert.doesNotMatch(human,/Number\(authority\.authorizedPeriods\|\|0\)>0/);
 assert.match(bridge,/shopper_ready_without_assigned_visits/);
 assert.doesNotMatch(chunk,/CX\.data/);
});
test('R20 terminal identity failure stops retry and renders safe explanatory state',()=>{
 assert.match(bridge,/errorState\.retryable===false/);
 assert.match(bridge,/cx:protected-auth-hr-authority-blocked/);
 assert.match(human,/data-cx-human-authority-gate/);
 assert.match(human,/No fue posible validar el acceso/);
});
