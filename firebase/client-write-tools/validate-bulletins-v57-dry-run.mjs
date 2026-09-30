#!/usr/bin/env node
/*
  CXOrbia V57 · Validador dry-run Bulletins
  No conecta Firebase. No escribe datos. Valida un write plan JSON
  generado por build-bulletins-v57-dry-run.mjs.
*/

import fs from 'node:fs';

const inputPath = process.argv[2];
if (!inputPath) {
  console.error('Uso: node validate-bulletins-v57-dry-run.mjs <write-plan.json>');
  process.exit(2);
}

const raw = fs.readFileSync(inputPath, 'utf8');
const parsed = JSON.parse(raw);
const plan = parsed.writePlan || [];
const errors = [];
const warnings = [];
const ids = new Set();

const allowedTypes = new Set(['news', 'task', 'alert', 'request', 'training', 'finance', 'certification']);
const allowedPriorities = new Set(['low', 'normal', 'high', 'urgent']);
const allowedStatus = new Set(['active', 'draft', 'archived', 'disabled']);

for (const [index, item] of plan.entries()) {
  if (!item || typeof item !== 'object') {
    errors.push(`Item ${index}: no es objeto`);
    continue;
  }
  if (!item.path || typeof item.path !== 'string') errors.push(`Item ${index}: falta path`);
  if (!item.data || typeof item.data !== 'object') errors.push(`Item ${index}: falta data`);
  const d = item.data || {};

  if (!/^tenants\/[^/]+\/bulletins\/[^/]+$/.test(item.path || '')) {
    errors.push(`Item ${index}: path inválido ${item.path}`);
  }
  if (!d.id) errors.push(`Item ${index}: falta id`);
  if (d.id && ids.has(d.id)) errors.push(`Item ${index}: id duplicado ${d.id}`);
  if (d.id) ids.add(d.id);
  if (!d.tenantId) errors.push(`Item ${index}: falta tenantId`);
  if (!d.title) errors.push(`Item ${index}: falta title`);
  if (!d.body) errors.push(`Item ${index}: falta body`);
  if (!allowedStatus.has(d.status)) errors.push(`Item ${index}: status inválido ${d.status}`);
  if (d.type && !allowedTypes.has(d.type)) errors.push(`Item ${index}: type inválido ${d.type}`);
  if (d.priority && !allowedPriorities.has(d.priority)) errors.push(`Item ${index}: priority inválido ${d.priority}`);
  if (!d.targetAll && !Array.isArray(d.targetTenants) && !Array.isArray(d.targetRoles) && !Array.isArray(d.targetUserIds) && !Array.isArray(d.targetShopperIds) && !Array.isArray(d.targetProjectIds) && !Array.isArray(d.targetCountries)) {
    warnings.push(`Item ${index}: no tiene target claro`);
  }
  if (d.targetTenants && !Array.isArray(d.targetTenants)) errors.push(`Item ${index}: targetTenants debe ser array`);
  if (d.targetRoles && !Array.isArray(d.targetRoles)) errors.push(`Item ${index}: targetRoles debe ser array`);
  if (d.targetUserIds && !Array.isArray(d.targetUserIds)) errors.push(`Item ${index}: targetUserIds debe ser array`);
  if (d.targetShopperIds && !Array.isArray(d.targetShopperIds)) errors.push(`Item ${index}: targetShopperIds debe ser array`);
  if (d.targetProjectIds && !Array.isArray(d.targetProjectIds)) errors.push(`Item ${index}: targetProjectIds debe ser array`);
  if (d.targetCountries && !Array.isArray(d.targetCountries)) errors.push(`Item ${index}: targetCountries debe ser array`);
}

const result = {
  ok: errors.length === 0,
  count: plan.length,
  errors,
  warnings,
};

console.log(JSON.stringify(result, null, 2));
process.exit(result.ok ? 0 : 1);
