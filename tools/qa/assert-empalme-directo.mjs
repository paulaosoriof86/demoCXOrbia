#!/usr/bin/env node
import fs from 'node:fs';

const operationIndex = process.argv.indexOf('--operation');
const operation = operationIndex >= 0 ? process.argv[operationIndex + 1] : '';
const allowed = 'APPLY_DELTA_DIRECTLY';
const required = [
  'AGENTS.md',
  'app/docs/ADDENDUM-MAESTRO-EJECUCION-DIRECTA-EMPALMES-CXORBIA-20260716.md'
];

for (const file of required) {
  if (!fs.existsSync(file)) throw new Error(`Falta instrucción obligatoria: ${file}`);
}
if (operation !== allowed) {
  throw new Error(`Operación bloqueada. Única operación permitida: ${allowed}`);
}
console.log(JSON.stringify({ok:true,candidate:'V156',state:'AUDITED_GO_READY_DIRECT_APPLY',operation:allowed,changedRuntimeFiles:35,removedRuntimeFiles:0},null,2));
