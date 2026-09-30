#!/usr/bin/env node
/* CXOrbia V57 · AI settings dry-run. No conecta Firebase. No escribe datos. */

const tenantId = 'tya';
const now = new Date().toISOString();

const settings = [
  {
    id: 'ai-tya-gemini-preview',
    tenantId,
    provider: 'gemini',
    model: 'gemini-2.0-flash',
    status: 'active',
    clientCallable: false,
    allowedModules: ['importador', 'academia', 'soporte', 'reportes'],
    dailyLimit: 100,
    notes: 'Configuracion no sensible. La ejecucion real debe pasar por proxy seguro.',
    createdAt: now,
  }
];

const writePlan = settings.map((doc) => ({
  path: `tenants/${tenantId}/aiSettings/${doc.id}`,
  data: doc,
}));

console.log(JSON.stringify({summary:{mode:'dry-run', tenantId, count:writePlan.length, generatedAt:now}, writePlan}, null, 2));
