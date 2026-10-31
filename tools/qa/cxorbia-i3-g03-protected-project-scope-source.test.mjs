import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const bridge = fs.readFileSync(new URL('../../app/adapters/tya-protected-auth-hr-authority-bridge-v2.js', import.meta.url), 'utf8');
const start = bridge.indexOf('function resolveScope(c){');
const end = bridge.indexOf('function operationalSource(scope)', start);
assert.ok(start >= 0 && end > start, 'protected scope owner must remain present');

function scope({current, projectIds = [], backendProjects = [], explicit = '', role = 'admin', backendRole = role, backendUid = 'uid-current'}) {
  const CX = {data: {currentProjectId: current, __backendAllProjectRecords: backendProjects}, BACKEND: {tenantId: 'tya'}};
  const window = {firebase: {auth: () => ({currentUser: {uid: 'uid-current'}})}, CX_BACKEND_AUTHORIZED_STATE: {tenantId:'tya',principal:{actorUid:backendUid,role:backendRole},projects: backendProjects}};
  const p = {get: key => key === 'cxProjectId' ? explicit : key === 'cxTenantId' ? 'tya' : null};
  const arr = value => Array.isArray(value) ? value : [];
  const str = value => String(value == null ? '' : value).trim();
  const projectRecord = id => backendProjects.find(x => x.projectId === id || x.id === id) || null;
  const principalUid = () => window.firebase.auth().currentUser?.uid || '';
  const resolve = new Function('CX', 'window', 'p', 'arr', 'str', 'projectRecord', 'principalUid', bridge.slice(start, end) + '\nreturn resolveScope;')(CX, window, p, arr, str, projectRecord, principalUid);
  return resolve({tenantId: 'tya', projectIds, role});
}

test('G03 project scope ignores a provisional demo project when the authorized tenant has a single real project', () => {
  const result = scope({current: 'proyecto retail', projectIds: ['cinepolis'], backendProjects: [{projectId: 'cinepolis', name: 'Cinépolis'}]});
  assert.equal(result.projectId, 'cinepolis');
  assert.equal(result.project?.name, 'Cinépolis');
});

test('G03 project scope chooses its sole authorized project before the backend project list hydrates', () => {
  assert.equal(scope({current: 'proyecto retail', projectIds: ['cinepolis']}).projectId, 'cinepolis');
});

test('G03 project scope retains an authorized selection in a multiproject session', () => {
  assert.equal(scope({current: 'novex', projectIds: ['cinepolis', 'novex'], backendProjects: [{projectId: 'cinepolis'}, {projectId: 'novex'}]}).projectId, 'novex');
});

test('G03 project scope fails closed when no trusted project can disambiguate stale current state', () => {
  assert.equal(scope({current: 'proyecto retail', projectIds: ['cinepolis', 'novex']}).projectId, '');
});

test('G03 admin does not escalate from authenticated membership to a broader backend project list', () => {
  assert.equal(scope({current: 'novex', projectIds: ['cinepolis'], backendProjects: [{projectId: 'cinepolis'}, {projectId: 'novex'}]}).projectId, 'cinepolis');
});

test('G03 project scope accepts explicit configuration for another legitimate project', () => {
  assert.equal(scope({current: 'cinepolis', projectIds: ['cinepolis', 'novex'], explicit: 'novex'}).projectId, 'novex');
});

test('G03 project scope rejects an explicit project outside authorized membership', () => {
  assert.equal(scope({current: 'cinepolis', projectIds: ['cinepolis'], explicit: 'proyecto retail'}).projectId, 'cinepolis');
});

test('G03 super operator uses authenticated backend projects if membership scope is empty', () => {
  assert.equal(scope({current: 'proyecto retail', role: 'super', backendProjects: [{projectId: 'cinepolis'}]}).projectId, 'cinepolis');
});

test('G03 super operator does not invent a default when multiple authenticated projects exist', () => {
  assert.equal(scope({current: 'proyecto retail', role: 'super', backendProjects: [{projectId: 'cinepolis'}, {projectId: 'novex'}]}).projectId, '');
});

test('G03 super operator does not trust a backend project list belonging to an old session', () => {
  assert.equal(scope({current: 'cinepolis', role: 'super', backendUid: 'uid-previous', backendProjects: [{projectId: 'cinepolis'}]}).projectId, '');
});
