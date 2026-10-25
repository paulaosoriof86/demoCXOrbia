#!/usr/bin/env node
/* CXOrbia V57 · Automations dry-run. No conecta Firebase. No escribe datos. */

const tenantId = 'tya';
const now = new Date().toISOString();

const automations = [
  {id:'a_postulacion', tenantId, event:'postulacion', enabled:true, channel:'whatsapp', to:'admin', title:'Nueva postulacion', template:'{shopper} se postulo a {sucursal}', status:'active', createdAt:now},
  {id:'a_agenda', tenantId, event:'agenda', enabled:true, channel:'push', to:'admin', title:'Visita agendada', template:'{shopper} agendo {sucursal} para {fecha}', status:'active', createdAt:now},
  {id:'a_realizada', tenantId, event:'realizada', enabled:true, channel:'push', to:'admin', title:'Visita realizada', template:'{shopper} realizo {sucursal}', status:'active', createdAt:now},
  {id:'a_cuestionario', tenantId, event:'cuestionario', enabled:true, channel:'push', to:'admin', title:'Cuestionario enviado', template:'{shopper} envio cuestionario de {sucursal}', status:'active', createdAt:now},
  {id:'a_pago', tenantId, event:'pago', enabled:true, channel:'whatsapp', to:'shopper', title:'Pago realizado', template:'Tu liquidacion de {sucursal} paso a pagada', status:'active', createdAt:now}
];

const integrations = [
  {id:'make-tya-preview', tenantId, provider:'make', status:'draft', channel:'whatsapp', protected:true, notes:'Configuracion no sensible. El endpoint real debe mantenerse fuera del repo.', createdAt:now}
];

const writePlan = [
  ...automations.map(data => ({path:`tenants/${tenantId}/automations/${data.id}`, data})),
  ...integrations.map(data => ({path:`tenants/${tenantId}/integrationSettings/${data.id}`, data}))
];

console.log(JSON.stringify({summary:{mode:'dry-run', tenantId, automations:automations.length, integrations:integrations.length, generatedAt:now}, writePlan}, null, 2));
