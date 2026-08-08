/* ============================================================
   CXOrbia · Backend adapter compatibility map V78 DISABLED
   ------------------------------------------------------------
   No importado por index.html.
   No reemplaza CX.data.
   No conecta backend.
   Define entradas/salidas esperadas para el adapter futuro.
   ============================================================ */
window.CX = window.CX || {};

CX.backendAdapterCompatV78Disabled = Object.freeze({
  status: {
    kind: 'sync',
    input: [],
    output: { enabled:'boolean', source:'string', tenantId:'string', projectId:'string', batchId:'string|null' },
    fallback: 'disabled status object'
  },
  routes: {
    kind: 'sync',
    input: [],
    output: { batch:'string|null', visits:'string|null', shoppers:'string|null', communicationsHistory:'string|null', operativeCandidates:'string|null' },
    fallback: 'null routes when no batchId'
  },
  currentProjectId: {
    kind: 'value',
    input: [],
    output: 'string|null',
    fallback: 'local current project id or null'
  },
  project: {
    kind: 'read',
    input: ['projectId optional'],
    output: 'project object or null',
    fallback: 'local CX.data.project result'
  },
  projects: {
    kind: 'read',
    input: [],
    output: 'array of project objects',
    fallback: 'local CX.data.projects result'
  },
  projectsFor: {
    kind: 'read',
    input: ['role or user context'],
    output: 'array of project objects',
    fallback: 'local CX.data.projectsFor result'
  },
  setProject: {
    kind: 'state-change',
    input: ['projectId'],
    output: 'selected project id or project object according to existing CX.data behavior',
    fallback: 'local CX.data.setProject result'
  },
  visitas: {
    kind: 'read',
    input: ['optional filters'],
    output: 'array of visit objects',
    fallback: 'local CX.data.visitas result'
  },
  _visitas: {
    kind: 'legacy-array',
    input: [],
    output: 'array reference compatible with existing modules',
    fallback: 'local legacy array'
  },
  posts: {
    kind: 'read',
    input: ['optional filters'],
    output: 'array of postulation objects',
    fallback: 'local CX.data.posts result'
  },
  _posts: {
    kind: 'legacy-array',
    input: [],
    output: 'array reference compatible with existing modules',
    fallback: 'local legacy array'
  },
  postularVisita: {
    kind: 'preview-write-blocked-until-authorized',
    input: ['visitId', 'shopperId or payload'],
    output: 'existing CX.data compatible result object',
    fallback: 'local CX.data.postularVisita result only when backend is disabled'
  },
  assignVisit: {
    kind: 'preview-write-blocked-until-authorized',
    input: ['visitId', 'shopperId or payload'],
    output: 'existing CX.data compatible result object',
    fallback: 'local CX.data.assignVisit result only when backend is disabled'
  },
  shoppers: {
    kind: 'read',
    input: ['optional filters'],
    output: 'array of shopper objects',
    fallback: 'local CX.data.shoppers result'
  },
  shoppersFor: {
    kind: 'read',
    input: ['projectId or role context'],
    output: 'array of shopper objects',
    fallback: 'local CX.data.shoppersFor result'
  },
  getShopper: {
    kind: 'read',
    input: ['shopperId'],
    output: 'shopper object or null',
    fallback: 'local CX.data.getShopper result'
  },
  addShopper: {
    kind: 'preview-write-blocked-until-authorized',
    input: ['shopper payload'],
    output: 'existing CX.data compatible result object',
    fallback: 'local CX.data.addShopper result only when backend is disabled'
  },
  updateShopper: {
    kind: 'preview-write-blocked-until-authorized',
    input: ['shopperId', 'patch payload'],
    output: 'existing CX.data compatible result object',
    fallback: 'local CX.data.updateShopper result only when backend is disabled'
  }
});
