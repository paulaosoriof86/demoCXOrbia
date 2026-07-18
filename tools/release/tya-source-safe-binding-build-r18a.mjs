#!/usr/bin/env node
/*
  CXOrbia TyA Phase A — R18A compatibility entrypoint.

  R18A previously generated a hybrid context where currentProjectId carried the
  active period. That contradicted the canonical Phase A contract and caused the
  V159 Hosting DEV gate to fail before deploy. The maintained implementation is
  now R15G, which preserves:
  - projectId: cinepolis
  - periodId: cinepolis-YYYY-MM
  - CX.data compatibility

  This shim keeps the historical R18A adapter filename expected by existing
  workflows while delegating all generation and validation to R15G.
*/
import process from 'node:process';

const args = process.argv.slice(2);
if (!args.includes('--adapter-src')) {
  process.argv.push('--adapter-src', 'adapters/tya-phase-a-source-safe-dev-adapter-r18a.js');
}

await import('./tya-source-safe-binding-build-r15g.mjs');
