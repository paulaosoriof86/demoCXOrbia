import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const bridge = fs.readFileSync('app/adapters/tya-protected-auth-hr-authority-bridge-v2.js', 'utf8');
const helperStart = bridge.indexOf('function countryCode(');
const helperEnd = bridge.indexOf('function projectRecord(', helperStart);
const readinessStart = bridge.indexOf('function shopperReadiness(');
const readinessEnd = bridge.indexOf('function buildCompositionCandidate(', readinessStart);
assert.ok(helperStart >= 0 && helperEnd > helperStart && readinessStart >= 0 && readinessEnd > readinessStart);
const readiness = new Function('arr', 'str',
  `${bridge.slice(helperStart, helperEnd)}\n${bridge.slice(readinessStart, readinessEnd)}\nreturn shopperReadiness;`
)(v => Array.isArray(v) ? v : [], v => String(v ?? '').trim());
const profileStart = bridge.indexOf('function sessionProfile(');
const profileEnd = bridge.indexOf('function validateShopperPrincipal(', profileStart);
assert.ok(profileStart >= 0 && profileEnd > profileStart);
const sessionProfile = new Function('arr', 'str', 'clone',
  `${bridge.slice(helperStart, helperEnd)}\n${bridge.slice(profileStart, profileEnd)}\nreturn sessionProfile;`
)(v => Array.isArray(v) ? v : [], v => String(v ?? '').trim(), v => JSON.parse(JSON.stringify(v)));
const profileInfo = (pais, id = 'HN_EXACT_CLAIM_ID') => ({ok: true, canonicalShopperId: id, profile: {id, shopperId: id, pais}});
const data = {visitsForShopper: id => [{shopperId: id, periodId: 'period-oct'}], recordPeriodId: v => v.periodId};
const backend = fs.readFileSync('app/core/backend-firebase.js', 'utf8');
const normalizeStart = backend.indexOf('function normalizeShopper(');
const normalizeEnd = backend.indexOf('function normalizeVisit(', normalizeStart);
assert.ok(normalizeStart >= 0 && normalizeEnd > normalizeStart);
const normalizeShopper = new Function('firstArrayValue',
  `${backend.slice(normalizeStart, normalizeEnd)}\nreturn normalizeShopper;`
)((value, fallback) => Array.isArray(value) && value.length ? value[0] : fallback);

test('I3 P0 authorized backend preserves HN when Firestore stores country without pais', () => {
  const own = normalizeShopper({id: 'signed-hn-legacy', country: 'HN', ciudad: 'Tegucigalpa'});
  assert.equal(own.pais, 'HN');
  assert.equal(own.country, 'HN');
});

test('I3 P0 authenticated HN profile normalizes to HN and retains exact visit history', () => {
  const actual = readiness(profileInfo('Honduras'), {visits: []}, data, {country: ''});
  assert.equal(actual.ok, true);
  assert.equal(actual.country, 'HN');
  assert.equal(actual.ownVisits, 1);
  assert.equal(actual.authorizedPeriods, 1);
});

test('I3 P0 GT source profile remains GT', () => {
  const actual = readiness(profileInfo('GUATEMALA', 'GT_EXACT_CLAIM_ID'), {}, data, {country: 'GT'});
  assert.equal(actual.ok, true);
  assert.equal(actual.country, 'GT');
});

test('I3 P0 contradictory country claim fails closed', () => {
  const actual = readiness(profileInfo('HN'), {}, data, {country: 'GT'});
  assert.equal(actual.ok, false);
  assert.equal(actual.reason, 'shopper_country_authority_conflict');
});

test('I3 P0 unrecognized country fails closed, never falls back to another country', () => {
  const actual = readiness(profileInfo('Nicaragua'), {}, data, {country: 'HN'});
  assert.equal(actual.ok, false);
  assert.equal(actual.country, '');
});

test('I3 P0 canonical country is atomically published into authenticated shopper session only', () => {
  const b = bridge.slice(bridge.indexOf('function buildCompositionCandidate('), bridge.indexOf('function publishComposition('));
  assert.match(b, /c\?\.role==='shopper'&&shopperReady\.ok===true/);
  assert.match(b, /sessionUserPatch=\{scopePaises:\[shopperReady\.country\]\}/);
  assert.match(bridge, /if\(candidate\.sessionUserPatch&&CX\.session\?\.user\)Object\.assign\(CX\.session\.user,candidate\.sessionUserPatch\)/);
  assert.match(bridge, /assertSessionGeneration\(candidate\.sessionStamp\)/);
  assert.match(b, /shopperReadiness\(profileInfo,result,liveReadModel,claims\)/);
  assert.match(b, /__liveHrShopperIds:arr\(hr\.shoppers\)/);
});

test('I3 P0 exact signed-in legacy protected country defeats unrelated GT composed row', () => {
  const c = {role: 'shopper', shopperId: 'signed-hn-legacy', tenantId: 'tya'};
  // Real DEV legacy shape: Firestore document ID is not the shopperId field
  // verified in the authenticated membership. The exact shopperId must win.
  const state = {shoppers: [{id: 'firestore-document-opaque', shopperId: 'signed-hn-legacy', pais: 'Honduras'}]};
  const result = {identityMap: {}, shoppers: [{id: 'signed-hn-legacy', shopperId: 'signed-hn-legacy', pais: 'GT'}]};
  const p = sessionProfile(state, c, result, [{id: 'another-exact-hr-source', pais: 'HN'}]);
  assert.equal(p.ok, true);
  assert.equal(p.profile.pais, 'HN');
});

test('I3 P0 exact HR source retains authority over conflicting protected country', () => {
  const c = {role: 'shopper', shopperId: 'signed-hn-legacy', tenantId: 'tya'};
  const state = {shoppers: [{id: 'signed-hn-legacy', shopperId: 'signed-hn-legacy', pais: 'HN'}]};
  const result = {identityMap: {}, shoppers: [{id: 'signed-hn-legacy', shopperId: 'signed-hn-legacy', pais: 'GT'}]};
  const p = sessionProfile(state, c, result, [{id: 'signed-hn-legacy', pais: 'GT'}]);
  assert.equal(p.ok, true);
  assert.equal(p.profile.pais, 'GT');
});

test('I3 P0 getShopper uses signed-in protected HN profile only for a non-HR technical ID', () => {
  const code = fs.readFileSync('app/core/shoppers-store.js', 'utf8');
  const D = {shoppers: [
    {id: 'signed-hn-legacy', nombre: 'Test HN', pais: 'GT'},
    {id: 'exact-current-hr', nombre: 'Test HR', pais: 'GT'}
  ], __liveHrShopperIds: ['exact-current-hr'], __sessionShopperProfile: {
    id: 'signed-hn-legacy', shopperId: 'signed-hn-legacy', nombre: 'Test HN', pais: 'HN'
  }};
  const auth = {applied: true, exactSessionShopperReady: true, shopperPrincipalClaimsVerified: true,
    actorUid: 'verified-uid', canonicalShopperId: 'signed-hn-legacy', shopperCountry: 'HN'};
  const CX = {data: D, session: {role: 'shopper', user: {shopperId: 'signed-hn-legacy'}}};
  const sandbox = {window: {CX, CX_PROTECTED_AUTH_HR_AUTHORITY: auth,
    firebase: {auth: () => ({currentUser: {uid: 'verified-uid'}})}}, CX};
  vm.runInNewContext(code, sandbox);
  assert.equal(D.getShopper('signed-hn-legacy').pais, 'HN');
  assert.equal(D.getShopper('signed-hn-legacy').__exactAuthenticatedSessionProfile, true);
  assert.equal(D.getShopper('exact-current-hr').pais, 'GT');
});
