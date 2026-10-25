#!/usr/bin/env node
/* CXOrbia V57 · Static preview validator v2. No conecta Firebase. */

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const appDir = path.join(root, 'app');
const errors = [];
const warnings = [];

function read(rel){
  const file = path.join(root, rel);
  if(!fs.existsSync(file)){
    errors.push(`No existe ${rel}`);
    return '';
  }
  return fs.readFileSync(file, 'utf8');
}

function exists(rel){ return fs.existsSync(path.join(root, rel)); }
function has(html, token){ return html.includes(token); }
function scripts(html){ return Array.from(html.matchAll(/<script[^>]+src=["']([^"']+)["']/g)).map(m=>m[1]); }

const indexHtml = read('app/index.html');
const previewHtml = read('app/index-backend-dev.html');
const extraConfig = read('app/core/backend-v57-extra-config.js');
const backendFirebase = read('app/core/backend-firebase.js');

if(!/<meta[^>]+charset=["']?UTF-8/i.test(indexHtml)) errors.push('app/index.html no declara UTF-8');
if(!/<meta[^>]+charset=["']?UTF-8/i.test(previewHtml)) errors.push('app/index-backend-dev.html no declara UTF-8');

const forbiddenInIndex = [
  'core/backend-config.js',
  'core/backend-config-preview-dev.js',
  'core/backend-firebase.js',
  'core/backend-bulletins.js',
  'core/backend-automations.js',
  'core/backend-resources.js',
  'core/backend-preview-status.js'
];
for(const token of forbiddenInIndex){
  if(has(indexHtml, token)) errors.push(`app/index.html carga backend global: ${token}`);
}

const requiredPreview = [
  'core/backend-config.js',
  'core/backend-config-preview-dev.js',
  'core/backend-v57-extra-config.js',
  'core/backend-dev-auth.local.js',
  'core/backend-firebase.js',
  'core/backend-finance-benefits.js',
  'core/backend-cxdata-finance-read.js',
  'core/backend-operational-actions.js',
  'core/backend-bulletins.js',
  'core/backend-automations.js',
  'core/backend-preview-status.js'
];
for(const token of requiredPreview){
  if(!has(previewHtml, token)) errors.push(`preview no carga ${token}`);
}

if(!exists('app/core/backend-resources.js')) errors.push('falta app/core/backend-resources.js');
if(!extraConfig.includes('backend-resources.js')) errors.push('backend-v57-extra-config.js no carga backend-resources.js');
if(!extraConfig.includes('resources')) errors.push('backend-v57-extra-config.js no registra resources');

for(const src of scripts(previewHtml)){
  if(/^https?:\/\//.test(src)) continue;
  const rel = `app/${src}`;
  if(!exists(rel) && src !== 'core/backend-dev-auth.local.js') errors.push(`script referenciado no existe: ${src}`);
  if(src === 'core/backend-dev-auth.local.js' && !exists(rel)) warnings.push('backend-dev-auth.local.js no existe; Auth queda pendiente hasta helper local.');
}

if(backendFirebase.includes('window.prompt')) errors.push('backend-firebase.js conserva window.prompt');
if(backendFirebase.includes('allowPrompt')) errors.push('backend-firebase.js conserva allowPrompt');

const result = {ok: errors.length === 0, errors, warnings};
console.log(JSON.stringify(result, null, 2));
process.exit(result.ok ? 0 : 1);
