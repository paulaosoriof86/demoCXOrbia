#!/usr/bin/env node
/*
  CXOrbia V57 · Bulletins dry-run
  No conecta Firebase. No escribe datos. Solo genera un plan de documentos
  para revisar el tablón/novedades antes de cargar en DEV.
*/

const tenantId = 'tya';
const now = new Date().toISOString();

const bulletins = [
  {
    id: 'blt-tya-bienvenida-v57',
    tenantId,
    status: 'active',
    type: 'news',
    priority: 'normal',
    icon: '📢',
    title: 'Bienvenido al tablón de novedades',
    body: 'Aquí aparecerán novedades, tareas pendientes y solicitudes del equipo.',
    targetAll: true,
    targetRoles: ['admin', 'ops', 'coordinador', 'shopper', 'cliente'],
    actionRoute: 'tablon',
    createdAt: now,
  },
  {
    id: 'blt-tya-admin-validar-backend',
    tenantId,
    status: 'active',
    type: 'task',
    priority: 'high',
    icon: '📝',
    title: 'Validar preview backend DEV',
    body: 'Revisar que el preview indique Firestore, tenant TyA y Auth OK antes de producción.',
    targetRoles: ['admin', 'ops'],
    actionRoute: 'dashboard',
    createdAt: now,
  },
  {
    id: 'blt-tya-shopper-certificacion',
    tenantId,
    status: 'active',
    type: 'certification',
    priority: 'normal',
    icon: '🏆',
    title: 'Completa tu certificación',
    body: 'Antes de ejecutar visitas, revisa Academia y completa la certificación asignada.',
    targetRoles: ['shopper'],
    actionRoute: 'cert',
    createdAt: now,
  },
];

const writePlan = bulletins.map((doc) => ({
  path: `tenants/${tenantId}/bulletins/${doc.id}`,
  data: doc,
}));

const summary = {
  mode: 'dry-run',
  tenantId,
  generatedAt: now,
  count: writePlan.length,
  paths: writePlan.map((x) => x.path),
};

console.log(JSON.stringify({ summary, writePlan }, null, 2));
