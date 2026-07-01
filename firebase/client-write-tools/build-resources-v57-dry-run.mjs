#!/usr/bin/env node
/* CXOrbia V57 · Resources dry-run. No conecta Firebase. No escribe datos. */

const tenantId = 'tya';
const now = new Date().toISOString();

const resources = [
  {
    id: 'res-tya-brand-logo-demo',
    tenantId,
    kind: 'brand',
    title: 'Logo TyA demo',
    fileName: 'logo-tya-demo.png',
    mimeType: 'image/png',
    storagePath: 'tenants/tya/brand/logo-tya-demo.png',
    visibleRoles: ['admin', 'ops', 'coordinador'],
    status: 'active',
    createdAt: now,
  },
  {
    id: 'res-tya-academia-bienvenida-demo',
    tenantId,
    kind: 'academy',
    title: 'Recurso academia demo',
    fileName: 'academia-bienvenida-demo.pdf',
    mimeType: 'application/pdf',
    storagePath: 'tenants/tya/academy/academia-bienvenida-demo.pdf',
    visibleRoles: ['admin', 'ops', 'coordinador', 'shopper'],
    status: 'active',
    createdAt: now,
  },
  {
    id: 'res-tya-cinepolis-manual-demo',
    tenantId,
    projectId: 'tya-cinepolis',
    kind: 'manual',
    title: 'Manual operativo demo Cinépolis',
    fileName: 'manual-cinepolis-demo.pdf',
    mimeType: 'application/pdf',
    storagePath: 'tenants/tya/projects/tya-cinepolis/manuals/manual-cinepolis-demo.pdf',
    visibleRoles: ['admin', 'ops', 'coordinador', 'shopper'],
    status: 'active',
    createdAt: now,
  },
];

const writePlan = resources.map((doc) => ({
  path: `tenants/${tenantId}/resources/${doc.id}`,
  data: doc,
}));

console.log(JSON.stringify({
  summary: {mode: 'dry-run', tenantId, count: writePlan.length, generatedAt: now},
  writePlan,
}, null, 2));
