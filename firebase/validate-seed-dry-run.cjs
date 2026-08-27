'use strict';

const fs = require('fs');
const path = require('path');

const APPROVAL_ENV = 'CXORBIA_SEED_DRY_RUN_APPROVED';
const APPROVAL_TOKEN = 'YES_PAULA_20260628_SEED_DRY_RUN';

if (process.env[APPROVAL_ENV] !== APPROVAL_TOKEN) {
  console.error('ERROR: falta autorizacion local para dry-run seed.');
  console.error(`Define ${APPROVAL_ENV}=${APPROVAL_TOKEN}`);
  process.exit(1);
}

const seedPath = path.join(__dirname, 'seed-tya-piloto.json');
const raw = fs.readFileSync(seedPath, 'utf8');
const seed = JSON.parse(raw);

const errors = [];
const warnings = [];
const writes = [];

function req(cond, msg) {
  if (!cond) errors.push(msg);
}

function warn(cond, msg) {
  if (!cond) warnings.push(msg);
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function ids(list) {
  return new Set((Array.isArray(list) ? list : []).map((item) => item && item.id).filter(Boolean));
}

req(seed && typeof seed === 'object', 'El seed debe ser un objeto JSON.');
req(seed.tenant && isNonEmptyString(seed.tenant.id), 'Debe existir tenant.id.');
req(Array.isArray(seed.clients), 'Debe existir clients como arreglo.');
req(Array.isArray(seed.projects), 'Debe existir projects como arreglo.');
req(Array.isArray(seed.shoppers), 'Debe existir shoppers como arreglo.');
req(Array.isArray(seed.visits), 'Debe existir visits como arreglo.');
req(Array.isArray(seed.postulations), 'Debe existir postulations como arreglo.');
req(Array.isArray(seed.questionnaires), 'Debe existir questionnaires como arreglo.');

const tenantId = seed.tenant && seed.tenant.id;
const clientIds = ids(seed.clients);
const projectIds = ids(seed.projects);
const shopperIds = ids(seed.shoppers);
const visitIds = ids(seed.visits);

if (tenantId) {
  writes.push(`/tenants/${tenantId}`);
}

for (const client of seed.clients || []) {
  req(isNonEmptyString(client.id), 'Cada cuenta/client debe tener id.');
  req(client.tenantId === tenantId, `Cuenta ${client.id || '(sin id)'} debe pertenecer al tenant ${tenantId}.`);
  writes.push(`/tenants/${tenantId}/clients/${client.id}`);
}

for (const project of seed.projects || []) {
  req(isNonEmptyString(project.id), 'Cada proyecto debe tener id.');
  req(project.tenantId === tenantId, `Proyecto ${project.id || '(sin id)'} debe pertenecer al tenant ${tenantId}.`);
  req(isNonEmptyString(project.accountId) || isNonEmptyString(project.clientId), `Proyecto ${project.id || '(sin id)'} debe tener accountId o clientId.`);
  const accountId = project.accountId || project.clientId;
  req(clientIds.has(accountId), `Proyecto ${project.id || '(sin id)'} referencia cuenta inexistente: ${accountId}.`);
  req(Array.isArray(project.countries) && project.countries.length > 0, `Proyecto ${project.id || '(sin id)'} debe tener countries.`);
  writes.push(`/tenants/${tenantId}/projects/${project.id}`);
}

for (const shopper of seed.shoppers || []) {
  req(isNonEmptyString(shopper.id), 'Cada shopper debe tener id.');
  req(isNonEmptyString(shopper.nombre), `Shopper ${shopper.id || '(sin id)'} debe tener nombre ficticio.`);
  warn(!shopper.email || /@(demo\.cxorbia|cxorbia-dev\.example\.com)$/i.test(shopper.email), `Shopper ${shopper.id || '(sin id)'} tiene email fuera de dominio demo.`);
  writes.push(`/tenants/${tenantId}/shoppers/${shopper.id}`);
}

for (const visit of seed.visits || []) {
  req(isNonEmptyString(visit.id), 'Cada visita debe tener id.');
  req(visit.tenantId === tenantId, `Visita ${visit.id || '(sin id)'} debe tener tenantId ${tenantId}.`);
  req(projectIds.has(visit.projectId), `Visita ${visit.id || '(sin id)'} referencia projectId inexistente: ${visit.projectId}.`);
  const accountId = visit.accountId || visit.clientId;
  req(clientIds.has(accountId), `Visita ${visit.id || '(sin id)'} referencia cuenta inexistente: ${accountId}.`);
  if (visit.shopperId) req(shopperIds.has(visit.shopperId), `Visita ${visit.id} referencia shopper inexistente: ${visit.shopperId}.`);
  req(isNonEmptyString(visit.estado), `Visita ${visit.id || '(sin id)'} debe tener estado.`);
  writes.push(`/tenants/${tenantId}/projects/${visit.projectId}/visits/${visit.id}`);
}

for (const post of seed.postulations || []) {
  req(isNonEmptyString(post.id), 'Cada postulación debe tener id.');
  req(post.tenantId === tenantId, `Postulación ${post.id || '(sin id)'} debe tener tenantId ${tenantId}.`);
  req(projectIds.has(post.projectId), `Postulación ${post.id || '(sin id)'} referencia projectId inexistente: ${post.projectId}.`);
  req(visitIds.has(post.visitaId), `Postulación ${post.id || '(sin id)'} referencia visita inexistente: ${post.visitaId}.`);
  req(shopperIds.has(post.shopperId), `Postulación ${post.id || '(sin id)'} referencia shopper inexistente: ${post.shopperId}.`);
  const accountId = post.accountId || post.clientId;
  req(clientIds.has(accountId), `Postulación ${post.id || '(sin id)'} referencia cuenta inexistente: ${accountId}.`);
  writes.push(`/tenants/${tenantId}/projects/${post.projectId}/postulations/${post.id}`);
}

for (const questionnaire of seed.questionnaires || []) {
  req(isNonEmptyString(questionnaire.id), 'Cada cuestionario debe tener id.');
  req(questionnaire.tenantId === tenantId, `Cuestionario ${questionnaire.id || '(sin id)'} debe tener tenantId ${tenantId}.`);
  req(projectIds.has(questionnaire.projectId), `Cuestionario ${questionnaire.id || '(sin id)'} referencia projectId inexistente: ${questionnaire.projectId}.`);
  const accountId = questionnaire.accountId || questionnaire.clientId;
  req(clientIds.has(accountId), `Cuestionario ${questionnaire.id || '(sin id)'} referencia cuenta inexistente: ${accountId}.`);
  req(Array.isArray(questionnaire.preguntas) && questionnaire.preguntas.length > 0, `Cuestionario ${questionnaire.id || '(sin id)'} debe tener preguntas.`);
  writes.push(`/tenants/${tenantId}/projects/${questionnaire.projectId}/questionnaires/${questionnaire.id}`);
}

const uniqueWrites = Array.from(new Set(writes));

console.log('== Dry-run seed TYA actualizado ==');
console.log(`Archivo: ${seedPath}`);
console.log(`Tenant: ${tenantId}`);
console.log(`Cuentas: ${(seed.clients || []).length}`);
console.log(`Proyectos: ${(seed.projects || []).length}`);
console.log(`Shoppers: ${(seed.shoppers || []).length}`);
console.log(`Visitas: ${(seed.visits || []).length}`);
console.log(`Postulaciones: ${(seed.postulations || []).length}`);
console.log(`Cuestionarios: ${(seed.questionnaires || []).length}`);
console.log(`Escrituras simuladas: ${uniqueWrites.length}`);
console.log('');
console.log('Rutas simuladas principales:');
for (const item of uniqueWrites) {
  console.log(`DRY-RUN ${item}`);
}
console.log('');

if (warnings.length) {
  console.log('Advertencias:');
  for (const item of warnings) console.log(`WARN ${item}`);
  console.log('');
}

if (errors.length) {
  console.error('Errores:');
  for (const item of errors) console.error(`ERROR ${item}`);
  console.error('== Dry-run seed TYA actualizado FALLIDO ==');
  process.exit(1);
}

console.log('Validaciones: OK');
console.log('No se escribio en Firestore. No se activo adapter. No se hizo deploy de Hosting. No se toco produccion.');
console.log('== Dry-run seed TYA actualizado finalizado ==');
