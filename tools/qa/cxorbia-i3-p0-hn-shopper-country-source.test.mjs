import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const bridge = fs.readFileSync('app/adapters/tya-protected-auth-hr-authority-bridge-v2.js', 'utf8');
const helperStart = bridge.indexOf('function countryCode(');
const helperEnd = bridge.indexOf('function projectRecord(', helperStart);
const readinessStart = bridge.indexOf('function shopperReadiness(');
const readinessEnd = bridge.indexOf('function buildCompositionCandidate(', readinessStart);
assert.ok(helperStart >= 0 && helperEnd > helperStart && readinessStart >= 0 && readinessEnd > readinessStart);
const readiness = new Function('arr', 'str',
  `${bridge.slice(helperStart, helperEnd)}\n${bridge.slice(readinessStart, readinessEnd)}\nreturn shopperReadiness;`
)(v => Array.isArray(v) ? v : [], v => String(v ?? '').trim());
const profileInfo = (pais, id = 'HN_EXACT_CLAIM_ID') => ({ok: true, canonicalShopperId: id, profile: {id, shopperId: id, pais}});
const data = {visitsForShopper: id => [{shopperId: id, periodId: 'period-oct'}], recordPeriodId: v => v.periodId};

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
});
