import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../../app/modules/hr-source.js', import.meta.url), 'utf8');
const REV = 'a'.repeat(64);

function renderReadback({
  projectId = 'project-A',
  sourceMode = 'external',
  readPolicy = 'external_live',
  providerBindingId = 'provider-opaque',
  mappingRef = 'mapping-v3',
  metaProjectId = 'project-A',
  authorityProjectId = 'project-A',
  metaRevision = REV,
  authorityRevision = REV,
  canonical = true,
  applied = true
} = {}) {
  const project = {
    id: projectId,
    operationalSource: {mode: sourceMode, readPolicy, providerBindingId, mappingRef},
    hrSourceAdmin: {
      estado: 'pendiente_backend',
      incidencias: [{codigo: 'backend_endpoint_missing'}]
    }
  };
  const data = {
    currentProjectId: projectId,
    __backendAllProjectRecords: [project],
    previewMeta: {
      hrAuthority: true, tenantId: 'tenant-A', projectId: metaProjectId,
      sourceRevision: metaRevision
    }
  };
  const CX = {
    data,
    cxDataCommandBoundary: {canonicalMode: () => canonical},
    module: () => {}
  };
  const sandbox = {
    CX,
    window: {
      CX,
      CX_PROTECTED_AUTH_HR_AUTHORITY: {
        applied, tenantId: 'tenant-A', projectId: authorityProjectId,
        sourceRevision: authorityRevision
      }
    }
  };
  vm.runInNewContext(source, sandbox, {filename: 'hr-source.js'});
  return {config: CX.hrSource.get(projectId), readback: CX.hrSource.operationalReadback(projectId)};
}

test('verified protected HR source overrides stale display without writing configuration', () => {
  const {config, readback} = renderReadback();
  assert.equal(config.estado, 'pendiente_backend');
  assert.equal(config.incidencias[0].codigo, 'backend_endpoint_missing');
  assert.equal(readback.verified, true);
  assert.equal(readback.revision, REV);
});

test('a different project cannot inherit another project HR verification', () => {
  assert.equal(renderReadback({authorityProjectId: 'project-B'}).readback.verified, false);
  assert.equal(renderReadback({metaProjectId: 'project-B'}).readback.verified, false);
});

test('revision drift or missing verified revision fails closed', () => {
  assert.equal(renderReadback({authorityRevision: 'b'.repeat(64)}).readback.verified, false);
  assert.equal(renderReadback({metaRevision: ''}).readback.verified, false);
  assert.equal(renderReadback({applied: false}).readback.verified, false);
});

test('internal, unbound, or noncanonical sources never claim external live connection', () => {
  assert.equal(renderReadback({sourceMode: 'internal'}).readback.verified, false);
  assert.equal(renderReadback({readPolicy: 'external_snapshot_import'}).readback.verified, false);
  assert.equal(renderReadback({providerBindingId: ''}).readback.verified, false);
  assert.equal(renderReadback({mappingRef: ''}).readback.verified, false);
  assert.equal(renderReadback({canonical: false}).readback.verified, false);
});

test('UI distinguishes the protected live read from the registration endpoint', () => {
  assert.match(source, /Estado de lectura operacional/);
  assert.match(source, /HR operacional verificada/);
  assert.match(source, /La gestión de registro\/vista previa es un canal independiente/);
  assert.match(source, /Incidencias del canal de configuración/);
  assert.match(source, /La importación está/);
});
