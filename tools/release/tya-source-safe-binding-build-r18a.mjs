#!/usr/bin/env node
/*
  CXOrbia TyA Phase A — R18A compatibility entrypoint.

  Delegates generation to R15G, preserves the historical R18A adapter filename,
  repairs one legacy warning fragment left by the old R15F template and validates
  the generated JavaScript before any browser gate can run.
*/
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';

const args = process.argv.slice(2);
if (!args.includes('--adapter-src')) {
  process.argv.push('--adapter-src', 'adapters/tya-phase-a-source-safe-dev-adapter-r18a.js');
}

await import('./tya-source-safe-binding-build-r15g.mjs');

const appDirIndex = process.argv.indexOf('--app-dir');
const appDir = path.resolve(appDirIndex >= 0 && process.argv[appDirIndex + 1] ? process.argv[appDirIndex + 1] : 'app');
const adapterIndex = process.argv.indexOf('--adapter-src');
const adapterSrc = adapterIndex >= 0 && process.argv[adapterIndex + 1]
  ? process.argv[adapterIndex + 1]
  : 'adapters/tya-phase-a-source-safe-dev-adapter-r18a.js';
const adapterFile = path.join(appDir, adapterSrc);
if (!fs.existsSync(adapterFile)) throw new Error(`R18A generated adapter missing: ${adapterFile}`);

let code = fs.readFileSync(adapterFile, 'utf8');
const danglingLegacyWarning = " 3 referencias continúan en revisión.'] : [];";
if (code.includes(danglingLegacyWarning)) {
  code = code.replace(danglingLegacyWarning, '');
  fs.writeFileSync(adapterFile, code, 'utf8');
}

const check = spawnSync(process.execPath, ['--check', adapterFile], { encoding:'utf8' });
if (check.status !== 0) {
  const outIndex = process.argv.indexOf('--out');
  const outDir = path.resolve(outIndex >= 0 && process.argv[outIndex + 1] ? process.argv[outIndex + 1] : '.tmp/source-safe-binding-r18a');
  fs.mkdirSync(outDir, { recursive:true });
  fs.writeFileSync(path.join(outDir, 'generated-adapter-syntax-error.txt'), String(check.stderr || check.stdout || 'unknown syntax error'), 'utf8');
  fs.copyFileSync(adapterFile, path.join(outDir, 'generated-adapter-failed.source-safe.js'));
  throw new Error(`R18A generated adapter syntax HOLD: ${String(check.stderr || check.stdout).trim()}`);
}

console.log(JSON.stringify({
  decision:'PASS_R18A_R20_GENERATED_ADAPTER_SYNTAX',
  adapterFile:path.relative(process.cwd(),adapterFile).replaceAll('\\','/'),
  legacyWarningFragmentRemoved:!code.includes(danglingLegacyWarning),
  safeState:{writes:false,imports:false,deploy:false,production:false,providers:false,payments:false}
}, null, 2));
