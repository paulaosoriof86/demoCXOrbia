import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const runtime = {};
const context = vm.createContext({window: runtime, globalThis: runtime, module: {exports: {}}});
for (const file of [
  'app/adapters/cxorbia-exact-identity-contract-v1.js',
  'app/adapters/tya-cumulative-read-model-v2.js'
]) vm.runInContext(fs.readFileSync(file, 'utf8'), context, {filename: file});

const compose = runtime.CX_TYA_CUMULATIVE_READ_MODEL.compose;
const keeperId = 'shopper_gt_a1', aliasId = 'shopper_gt_b2';
const keeper = overrides => ({
  id: keeperId, shopperId: keeperId, nombre: 'Persona de prueba',
  pais: 'GT', tenantId: 'tenant-test', projectIds: ['program-test'],
  identityAuthority: 'tenant_adjudication', identityAuthorityRef: 'verified-decision',
  legacyLiveShopperIds: [keeperId, aliasId], exactAliases: [keeperId, aliasId],
  ...overrides
});
const alias = overrides => ({
  id: aliasId, shopperId: aliasId, nombre: 'Persona de prueba',
  pais: 'GT', tenantId: 'tenant-test', projectIds: ['program-test'],
  identityState: 'superseded_exact_alias', supersededByShopperId: keeperId,
  ...overrides
});

function scenario(profiles, options = {}) {
  const projectId = options.projectId || 'program-test';
  const hr = {
    currentProjectId: projectId, currentPeriodId: 'period-2026-10', sourceRevision: 'fixture-source-revision',
    projects: [{id: 'period-2026-10', periodKey: '2026-10', projectId}],
    shoppers: [{id: keeperId, shopperId: keeperId, pais: 'GT'},
      ...(options.omitAliasSummary ? [] : [{id: aliasId, shopperId: aliasId, pais: 'GT',
        ...(options.serverCanonical ? {canonicalShopperId: keeperId} : {})}])],
    visits: Array.from({length: 10}, (_, n) => ({
      id: 'visit-' + n, hrRowId: 'OCT 26!' + (n + 1), sourceTab: 'OCT 26',
      sourceRow: n + 1, periodKey: '2026-10', shopperId: aliasId,
      estado: 'realizada', pais: 'GT',
      ...(options.serverCanonical ? {canonicalShopperId: keeperId} : {})
    }))
  };
  const result = compose({hr, protectedPayload: {shoppers: profiles, visits: []}});
  assert.equal(result.visits.length, 10, 'HR visit count must not change');
  assert.equal(result.diagnostics.duplicateVisitKeys, 0, 'no duplicate HR visit keys');
  return result.visits.filter(v => v.shopperId === keeperId).length;
}

const cases = [
  ['approved supersession with both profiles retained', [keeper(), alias()], {}, 10],
  ['provider-auto-compatible supersession preserves all ten HR visits',
    [keeper({identityAuthority:'provider_auto_compatible',identityAuthorityRef:'provider-auto-ack'}),alias()],{},10],
  ['server canonical annotation preserved', [keeper(), alias()], {serverCanonical: true}, 10],
  ['alias appears only on visits', [keeper(), alias()], {omitAliasSummary: true}, 10],
  ['missing tenant adjudication rejected', [keeper({identityAuthority: 'pending'}), alias()], {}, 0],
  ['missing adjudication reference rejected', [keeper({identityAuthorityRef: ''}), alias()], {}, 0],
  ['active alias never merged', [keeper(), alias({identityState: 'active'})], {}, 0],
  ['mismatched target rejected', [keeper(), alias({supersededByShopperId: 'other'})], {}, 0],
  ['cross-country rejected', [keeper(), alias({pais: 'HN'})], {}, 0],
  ['cross-tenant rejected', [keeper(), alias({tenantId: 'other-tenant'})], {}, 0],
  ['cross-project rejected', [keeper(), alias({projectIds: ['different-program']})], {}, 0],
  ['keeper without exact alias rejected', [keeper({legacyLiveShopperIds: [keeperId], exactAliases: [keeperId]}), alias()], {}, 0],
  ['superseded alias without keeper rejected', [alias()], {}, 0]
];

for (const [title, profiles, options, expected] of cases) {
  test('VRM-304: ' + title, () => assert.equal(scenario(profiles, options), expected));
}
