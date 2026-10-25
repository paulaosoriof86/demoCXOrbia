#!/usr/bin/env node
/*
  CXOrbia · TyA migration package validator
  No conecta Firebase. No escribe datos.
  Valida un manifiesto JSON de paquete de migración.
*/

import fs from 'node:fs';
import path from 'node:path';

const manifestPath = process.argv[2];
if (!manifestPath) {
  console.error('Uso: node validate-migration-tya-package.mjs <manifest.json>');
  process.exit(2);
}

const root = path.dirname(path.resolve(manifestPath));
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const errors = [];
const warnings = [];

const required = ['shoppers', 'projects', 'visits', 'benefits'];
const optional = ['postulations', 'questionnaires', 'certifications', 'resources'];
const allowed = new Set([...required, ...optional]);

if (manifest.tenantId !== 'tya') errors.push('tenantId debe ser tya');
if (!manifest.files || typeof manifest.files !== 'object') errors.push('falta files');

const files = manifest.files || {};
for (const key of required) {
  if (!files[key]) errors.push(`falta archivo requerido: ${key}`);
}
for (const key of Object.keys(files)) {
  if (!allowed.has(key)) errors.push(`archivo no reconocido: ${key}`);
  const spec = files[key] || {};
  if (!spec.path) errors.push(`${key}: falta path`);
  if (!['csv', 'xlsx'].includes(spec.format)) errors.push(`${key}: format debe ser csv o xlsx`);
  const filePath = spec.path ? path.resolve(root, spec.path) : '';
  if (filePath && !fs.existsSync(filePath)) warnings.push(`${key}: archivo no existe localmente: ${spec.path}`);
}

const result = {
  ok: errors.length === 0,
  tenantId: manifest.tenantId || null,
  required,
  present: Object.keys(files),
  errors,
  warnings,
};

console.log(JSON.stringify(result, null, 2));
process.exit(result.ok ? 0 : 1);
