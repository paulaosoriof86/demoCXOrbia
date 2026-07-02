#!/usr/bin/env node
/*
  CXOrbia · Create preview local auth helper
  Writes app/core/backend-dev-auth.local.js.
  This output file is ignored by git and must not be committed.
*/

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const outPath = path.join(root, 'app', 'core', 'backend-dev-auth.local.js');
const email = process.env.CXORBIA_DEV_EMAIL || 'admin.tya.dev@cxorbia-dev.example.com';
const secret = process.env.CXORBIA_DEV_SECRET || process.env.CXORBIA_DEV_PASSWORD || '';

if (!secret) {
  console.error('Falta CXORBIA_DEV_SECRET o CXORBIA_DEV_PASSWORD en variable de entorno local.');
  process.exit(2);
}

const body = `/* Local-only preview auth helper. Do not commit. */\n(function(){\n  try {\n    sessionStorage.setItem('CXORBIA_DEV_PASSWORD', ${JSON.stringify(secret)});\n    sessionStorage.setItem('CXORBIA_DEV_EMAIL', ${JSON.stringify(email)});\n    console.info('[CX.preview-auth.local] Credencial DEV local cargada para preview.');\n  } catch (e) {\n    console.warn('[CX.preview-auth.local] No se pudo preparar Auth DEV local', e);\n  }\n})();\n`;

fs.writeFileSync(outPath, body, { encoding: 'utf8' });
console.log(JSON.stringify({ ok: true, output: outPath, email }, null, 2));
