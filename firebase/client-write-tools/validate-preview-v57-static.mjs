#!/usr/bin/env node
/*
  CXOrbia V57 · Static preview validator
  No conecta Firebase. No escribe datos.
  Verifica que el preview backend esté separado del index normal.
*/

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const appDir = path.join(root, 'app');
const indexPath = path.join(appDir, 'index.html');
const previewPath = path.join(appDir, 'index-backend-dev.html');
const errors = [];
const warnings = [];

function read(file) {
  if (!fs.existsSync(file)) {
    errors.push(`No existe ${path.relative(root, file)}`);
    return '';
  }
  return fs.readFileSync(file, 'utf8');
}

function scripts(html) {
  return Array.from(html.matchAll(/<script[^>]+src=["']([^"']+)["']/g)).map((m) => m[1]);
}

const indexHtml = read(indexPath);
const previewHtml = read(previewPath);

if (!/<meta[^>]+charset=["']?UTF-8/i.test(indexHtml)) errors.push('app/index.html no declara UTF-8');
if (!/<meta[^>]+charset=["']?UTF-8/i.test(previewHtml)) errors.push('app/index-backend-dev.html no declara UTF-8');

const forbiddenInIndex = [
  'core/backend-config.js',
  'core/backend-config-preview-dev.js',
  'core/backend-firebase.js',
  'core/backend-bulletins.js',
  'core/backend-preview-status.js',
];
for (const token of forbiddenInIndex) {
  if (indexHtml.includes(token)) errors.push(`app/index.html carga backend global: ${token}`);
}

const requiredPreview = [
  'core/backend-config.js',
  'core/backend-config-preview-dev.js',
  'core/backend-dev-auth.local.js',
  'core/backend-firebase.js',
  'core/backend-finance-benefits.js',
  'core/backend-cxdata-finance-read.js',
  'core/backend-operational-actions.js',
  'core/backend-bulletins.js',
  'core/backend-preview-status.js',
];
for (const token of requiredPreview) {
  if (!previewHtml.includes(token)) errors.push(`preview no carga ${token}`);
}

for (const src of scripts(previewHtml)) {
  if (/^https?:\/\//.test(src)) continue;
  const file = path.join(appDir, src);
  if (!fs.existsSync(file) && src !== 'core/backend-dev-auth.local.js') {
    errors.push(`Script referenciado no existe: ${src}`);
  }
  if (src === 'core/backend-dev-auth.local.js' && !fs.existsSync(file)) {
    warnings.push('backend-dev-auth.local.js no existe; Auth quedará pendiente hasta generar helper local.');
  }
}

const backendFirebase = read(path.join(appDir, 'core', 'backend-firebase.js'));
if (backendFirebase.includes('window.prompt')) errors.push('backend-firebase.js conserva window.prompt');
if (backendFirebase.includes('allowPrompt')) errors.push('backend-firebase.js conserva allowPrompt');

const result = {
  ok: errors.length === 0,
  errors,
  warnings,
};
console.log(JSON.stringify(result, null, 2));
process.exit(result.ok ? 0 : 1);
