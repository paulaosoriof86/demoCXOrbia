import fs from 'node:fs';
import path from 'node:path';

const fileArg = process.argv[2];
if (!fileArg) {
  throw new Error('Uso: node validate-seed.mjs <ruta-seed-json>');
}

const seedPath = path.resolve(process.cwd(), fileArg);
const raw = fs.readFileSync(seedPath, 'utf8');
const seed = JSON.parse(raw);

function requireArray(name) {
  if (!Array.isArray(seed[name])) {
    throw new Error(`La propiedad ${name} debe ser arreglo`);
  }
  return seed[name];
}

function requireObject(name) {
  if (!seed[name] || typeof seed[name] !== 'object' || Array.isArray(seed[name])) {
    throw new Error(`La propiedad ${name} debe ser objeto`);
  }
  return seed[name];
}

const tenant = requireObject('tenant');
const project = requireObject('project');
const shoppers = requireArray('shoppers');
const visits = requireArray('visits');
const postulations = requireArray('postulations');
const questionnaires = requireArray('questionnaires');

if (!tenant.id) throw new Error('tenant.id requerido');
if (!project.id) throw new Error('project.id requerido');
if (project.tenantId && project.tenantId !== tenant.id) throw new Error('project.tenantId no coincide con tenant.id');

const shopperIds = new Set();
for (const shopper of shoppers) {
  if (!shopper.id) throw new Error('shopper.id requerido');
  if (shopperIds.has(shopper.id)) throw new Error(`shopper duplicado: ${shopper.id}`);
  shopperIds.add(shopper.id);
}

const visitIds = new Set();
for (const visit of visits) {
  if (!visit.id) throw new Error('visit.id requerido');
  if (visitIds.has(visit.id)) throw new Error(`visit duplicada: ${visit.id}`);
  visitIds.add(visit.id);
  if (visit.projectId && visit.projectId !== project.id) throw new Error(`visit ${visit.id} projectId invalido`);
}

for (const postulation of postulations) {
  if (!postulation.id) throw new Error('postulation.id requerido');
  if (postulation.visitId && !visitIds.has(postulation.visitId)) throw new Error(`postulation ${postulation.id} referencia visita inexistente`);
  if (postulation.shopperId && !shopperIds.has(postulation.shopperId)) throw new Error(`postulation ${postulation.id} referencia shopper inexistente`);
}

const paths = [];
paths.push(`/tenants/${tenant.id}`);
paths.push(`/tenants/${tenant.id}/projects/${project.id}`);
for (const shopper of shoppers) paths.push(`/tenants/${tenant.id}/shoppers/${shopper.id}`);
for (const visit of visits) paths.push(`/tenants/${tenant.id}/projects/${project.id}/visits/${visit.id}`);
for (const postulation of postulations) paths.push(`/tenants/${tenant.id}/projects/${project.id}/postulations/${postulation.id}`);
for (const questionnaire of questionnaires) paths.push(`/tenants/${tenant.id}/projects/${project.id}/questionnaires/${questionnaire.id}`);

console.log('Seed valido para dry-run');
console.log(JSON.stringify({
  tenantId: tenant.id,
  projectId: project.id,
  counts: {
    shoppers: shoppers.length,
    visits: visits.length,
    postulations: postulations.length,
    questionnaires: questionnaires.length,
    firestorePaths: paths.length
  },
  paths
}, null, 2));
