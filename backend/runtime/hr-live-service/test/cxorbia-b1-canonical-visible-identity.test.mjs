import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const read=p=>fs.readFileSync(p,'utf8');

test('B1 shopper rail resolves the exact canonical shopper before rendering identity',()=>{
  const s=read('app/core/router.js');
  assert.match(s,/resolveExactSessionShopper/);
  assert.match(s,/railDisplayName/);
  assert.match(s,/identity\.canonical/);
  assert.match(s,/role==='shopper'\?railDisplayName/);
});

test('B1 Mi Dia uses the same exact canonical identity owner for name and private shopper id',()=>{
  const s=read('app/modules/midia.js');
  assert.match(s,/const exactSessionIdentity=/);
  assert.match(s,/resolveExactSessionShopper/);
  assert.match(s,/const sessionShopperId=/);
  assert.match(s,/const sessionShopperDisplayName=/);
  assert.doesNotMatch(s,/Hola, '\+CX\.session\.user\.name/);
  assert.match(s,/Hola, '\+\(_shopperDisplayName\.split/);
  assert.match(s,/Buen día, '\+\(CX\.session\.user\.name\.split/);
});

test('B1 Mi Dia reuses the accepted Mis Visitas visual language instead of a new frontend',()=>{
  const s=read('app/modules/midia.js');
  assert.match(s,/cx-shopper-visit-card/);
  assert.match(s,/cx-visit-card-head/);
  assert.match(s,/cx-visit-kicker/);
  assert.match(s,/cx-visit-title/);
  assert.match(s,/cx-visit-payline/);
  assert.match(s,/cx-visit-actions/);
  assert.match(s,/cx-day-progress-card/);
});

test('B1 preserves active-period and exact-assignment filters',()=>{
  const s=read('app/modules/midia.js');
  assert.match(s,/recordPeriodId===String\(data\.currentPeriodId/);
  assert.match(s,/f\.assigned===true&&f\.realized!==true&&f\.cancelled!==true/);
});

test('I3 P0 HN shopper readiness requires exact profile and country, not an existing assignment',()=>{
  const gate=read('app/adapters/tya-c6-unified-human-runtime-v1.js');
  const bridge=read('app/adapters/tya-protected-auth-hr-authority-bridge-v2.js');
  assert.match(gate,/exactSessionShopperReady===true/);
  assert.match(gate,/shopperPrincipalClaimsVerified===true/);
  assert.doesNotMatch(gate,/Number\(authority\.authorizedPeriods\|\|0\)>0/);
  assert.doesNotMatch(gate,/arr\(authority\.authorizedPeriodIds\)\.length>0/);
  assert.match(bridge,/shopper_ready_without_assigned_visits/);
  assert.match(bridge,/SHOPPER_EXACT_HR_PROFILE_COUNTRY_PERIOD_REQUIRED/);
  assert.match(bridge,/shopperReadiness\(profileInfo,result,claims\)/);
  assert.match(gate,/authority\?\.atomicPublication===true/);
  assert.match(bridge,/shopperCountry:shopperReady\.country/);
  assert.match(bridge,/authorizedPeriodIds:clone\(shopperReady\.authorizedPeriodIds\|\|\[\]\)/);
  assert.doesNotMatch(bridge,/applied:true,version:'v2-dynamic-live-source-session-profile-preserved',reason/);
});

test('I3 P0 HN protected authority is bound to current UID claims membership tenant project and shopper',()=>{
  const bridge=read('app/adapters/tya-protected-auth-hr-authority-bridge-v2.js');
  const gate=read('app/adapters/tya-c6-unified-human-runtime-v1.js');
  assert.match(bridge,/function principalUid\(\)/);
  assert.match(bridge,/getIdTokenResult\(false\)/);
  assert.match(bridge,/SHOPPER_PRINCIPAL_CLAIMS_MEMBERSHIP_MISMATCH/);
  assert.match(bridge,/str\(claims\?\.uid\)===uid/);
  assert.match(bridge,/str\(state\?\.actorUid\)===uid/);
  assert.doesNotMatch(bridge,/CX\.data\.__sessionShopperProfile=null/);
  assert.match(bridge,/__sessionShopperProfile:profile/);
  assert.match(bridge,/SESSION_GENERATION_CHANGED_DURING_COMPOSITION/);
  assert.match(bridge,/HR_LIVE_REVISION_CHANGED_DURING_COMPOSITION/);
  assert.match(bridge,/str\(s\.actorUid\)===principalUid\(\)/);
  assert.match(bridge,/str\(s\.projectId\)===scope\.projectId/);
  assert.match(gate,/str\(authority\.actorUid\)===uid/);
  assert.match(gate,/str\(authority\.rawShopperId\)===str\(ctx\.shopperId\)/);
});

test('I3 P0 HN exact identity ambiguity is blocked without fuzzy merge or global GT HN scope',()=>{
  const bridge=read('app/adapters/tya-protected-auth-hr-authority-bridge-v2.js');
  assert.match(bridge,/ambiguous_exact_identity/);
  assert.match(bridge,/no_exact_identity/);
  const code=bridge.slice(bridge.indexOf('function sessionProfile('),bridge.indexOf('function validateShopperPrincipal('));
  const resolve=vm.runInNewContext(code+'\n sessionProfile;',{
    str:v=>String(v??'').trim(),arr:v=>Array.isArray(v)?v:[],clone:v=>JSON.parse(JSON.stringify(v))
  });
  const context={role:'shopper',shopperId:'alias',tenantId:'tenant-a'};
  const canonical={identityMap:{alias:'person'},shoppers:[{id:'person',nombre:'Persona',pais:'HN',tenantId:'tenant-a'}]};
  assert.equal(resolve({shoppers:[{id:'alias',pais:'HN'}]},context,canonical).ok,true);
  assert.equal(resolve({shoppers:[{id:'alias',shopperId:'different-person',pais:'HN'}]},context,canonical).reason,'ambiguous_exact_identity');
  assert.equal(resolve({shoppers:[{id:'alias',tenantId:'tenant-b',pais:'HN'}]},context,canonical).ok,false);

  assert.doesNotMatch(bridge,/scopePaises:\s*\['GT','HN'\]|scopePaises:\s*\["GT","HN"\]/);
  assert.doesNotMatch(bridge,/fuzzy|similarity|levenshtein/i);
});
