#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createCxDataPortableAdapter } from '../../backend/runtime/cx-data-portable-adapter-v1.mjs';

const calls = { reads: 0, mutations: 0 };
const fixture = {
  tenantId: 'tenant-a',
  sourceSnapshotAt: '2026-07-14T00:00:00.000Z',
  sourceReadMode: 'source_safe_snapshot',
  runtimeSyncActive: false,
  sourceRef: 'fixture:tenant-a',
  projects: [
    { id: 'project-a', tenantId: 'tenant-a', name: 'Project A' },
    { id: 'project-b', tenantId: 'tenant-a', name: 'Project B' },
    { id: 'project-x', tenantId: 'tenant-x', name: 'Cross tenant project' }
  ],
  periods: [
    { id: 'period-a1', tenantId: 'tenant-a', projectId: 'project-a', name: 'A1' },
    { id: 'period-a2', tenantId: 'tenant-a', projectId: 'project-a', name: 'A2' },
    { id: 'period-b1', tenantId: 'tenant-a', projectId: 'project-b', name: 'B1' },
    { id: 'period-x1', tenantId: 'tenant-x', projectId: 'project-x', name: 'X1' }
  ],
  visits: [
    { id: 'visit-a1-1', tenantId: 'tenant-a', rootProjectId: 'project-a', periodId: 'period-a1', country: 'PA', shopperId: 'shopper-a' },
    { id: 'visit-a1-2', tenantId: 'tenant-a', rootProjectId: 'project-a', periodId: 'period-a1', country: 'PB', shopperId: 'shopper-b' },
    { id: 'visit-a2-1', tenantId: 'tenant-a', rootProjectId: 'project-a', periodId: 'period-a2', country: 'PA', shopperId: 'shopper-a' },
    { id: 'visit-b1-1', tenantId: 'tenant-a', rootProjectId: 'project-b', periodId: 'period-b1', country: 'PA', shopperId: 'shopper-c' },
    { id: 'visit-x1-1', tenantId: 'tenant-x', rootProjectId: 'project-x', periodId: 'period-x1', country: 'PA', shopperId: 'shopper-x' }
  ],
  posts: [
    { id: 'post-a1', tenantId: 'tenant-a', rootProjectId: 'project-a', periodId: 'period-a1', country: 'PA' },
    { id: 'post-x1', tenantId: 'tenant-x', rootProjectId: 'project-x', periodId: 'period-x1', country: 'PA' }
  ],
  shoppers: [
    { id: 'shopper-a', tenantId: 'tenant-a', country: 'PA', dataLevel: 'protected_reference', rating: null },
    { id: 'shopper-b', tenantId: 'tenant-a', country: 'PB', dataLevel: 'operational_profile', rating: null },
    { id: 'shopper-c', tenantId: 'tenant-a', country: 'PA', dataLevel: 'full_authorized_profile', rating: 4.5 },
    { id: 'shopper-x', tenantId: 'tenant-x', country: 'PA', dataLevel: 'full_authorized_profile', rating: 5 }
  ]
};

const provider = {
  async loadSnapshot(context) {
    calls.reads += 1;
    assert.equal(context.tenantId, 'tenant-a');
    return fixture;
  },
  async mutate(command) {
    calls.mutations += 1;
    return { ok: true, commandId: `cmd-${calls.mutations}`, command };
  }
};

const adapter = createCxDataPortableAdapter({
  provider,
  context: { tenantId: 'tenant-a', projectId: 'project-a', periodId: 'period-a1', countryScope: ['PA'] },
  writeGateActive: false,
  clock: () => '2026-07-14T01:00:00.000Z'
});

assert.equal(adapter.status().status, 'blocked_not_hydrated');
assert.equal(adapter.visitas().length, 0);
const hydrated = await adapter.hydrate();
assert.equal(hydrated.ok, true);
assert.equal(calls.reads, 1);
assert.equal(adapter.status().status, 'ready_snapshot');
assert.equal(adapter.status().runtimeSyncActive, false);
assert.equal(adapter.status().demoFallback, false);
assert.equal(adapter.project().id, 'project-a');
assert.equal(adapter.period().id, 'period-a1');
assert.deepEqual(adapter.projects().map(item => item.id), ['project-a', 'project-b']);
assert.deepEqual(adapter.periodsForProject('project-a').map(item => item.id), ['period-a1', 'period-a2']);
assert.deepEqual(adapter.visitas().map(item => item.id), ['visit-a1-1']);
assert.deepEqual(adapter.posts().map(item => item.id), ['post-a1']);
assert.deepEqual(adapter.shoppers().map(item => item.id), ['shopper-a', 'shopper-c']);
assert.deepEqual(adapter.shoppersFor().map(item => item.id), ['shopper-a']);
assert.equal(adapter.getShopper('shopper-x'), null);
assert.equal(adapter._visitas.length, 1);
assert.equal(adapter._posts.length, 1);

const periodChange = adapter.setCurrentPeriod('period-a2');
assert.equal(periodChange.ok, true);
assert.equal(adapter.currentProjectId, 'project-a');
assert.equal(adapter.currentPeriodId, 'period-a2');
assert.deepEqual(adapter.visitas().map(item => item.id), ['visit-a2-1']);
assert.equal(adapter.setCurrentPeriod('period-b1').code, 'PERIOD_OUT_OF_PROJECT_SCOPE');

const projectChange = adapter.setCurrentProject('project-b');
assert.equal(projectChange.ok, true);
assert.equal(adapter.currentProjectId, 'project-b');
assert.equal(adapter.currentPeriodId, 'period-b1');
assert.deepEqual(adapter.visitas().map(item => item.id), ['visit-b1-1']);
assert.equal(adapter.setCurrentProject('project-x').code, 'PROJECT_OUT_OF_SCOPE');

const held = await adapter.assignVisit({ visitId: 'visit-b1-1', shopperId: 'shopper-c' });
assert.equal(held.ok, false);
assert.equal(held.code, 'WRITE_GATE_HOLD');
assert.equal(calls.mutations, 0);

adapter.setWriteGate(true);
const mutated = await adapter.assignVisit({ visitId: 'visit-b1-1', shopperId: 'shopper-c' });
assert.equal(mutated.ok, true);
assert.equal(mutated.providerCalled, true);
assert.equal(calls.mutations, 1);
assert.equal(mutated.command.tenantId, 'tenant-a');
assert.equal(mutated.command.projectId, 'project-b');
assert.equal(mutated.command.periodId, 'period-b1');

const failing = createCxDataPortableAdapter({
  provider: { async loadSnapshot(){ throw new Error('provider unavailable'); } },
  context: { tenantId: 'tenant-a', projectId: 'project-a', periodId: 'period-a1' }
});
const failedHydration = await failing.hydrate();
assert.equal(failedHydration.ok, false);
assert.equal(failing.status().status, 'blocked_provider_error');
assert.equal(failing.visitas().length, 0);
assert.equal(failing.projects().length, 0);
assert.equal(failing.status().demoFallback, false);

const wrongTenant = createCxDataPortableAdapter({
  provider: { async loadSnapshot(){ return { ...fixture, tenantId: 'tenant-x' }; } },
  context: { tenantId: 'tenant-a', projectId: 'project-a', periodId: 'period-a1' }
});
const wrongTenantResult = await wrongTenant.hydrate();
assert.equal(wrongTenantResult.ok, false);
assert.match(wrongTenantResult.error, /Tenant mismatch/);
assert.equal(wrongTenant.visitas().length, 0);

console.log(JSON.stringify({
  decision: 'PASS_CX_DATA_PORTABLE_ADAPTER_V1',
  checks: 38,
  providerReads: calls.reads,
  providerMutationsBeforeGate: 0,
  providerMutationsAfterGate: calls.mutations,
  tenantIsolation: true,
  projectPeriodSeparation: true,
  demoFallback: false,
  writeGateDefault: 'hold'
}, null, 2));
