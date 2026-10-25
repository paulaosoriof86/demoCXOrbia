import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const outDir = path.join(root, 'firebase', 'private-output');
fs.mkdirSync(outDir, {recursive:true});

const args = Object.fromEntries(process.argv.slice(2).map((arg) => {
  const [k, ...rest] = arg.replace(/^--/, '').split('=');
  return [k, rest.join('=') || true];
}));

const hrFile = String(args.file || path.join(outDir, 'hr-tya-historico-good-firestore-transform-v4.json'));

function run(id, label, script, extraArgs = [], accepted = [0]) {
  const res = spawnSync('node', [script, ...extraArgs], {cwd:root, encoding:'utf8'});
  const code = typeof res.status === 'number' ? res.status : 1;
  const ok = accepted.includes(code);
  return {id, label, script, status: ok ? (code === 0 ? 'OK' : 'REVIEW') : 'FAIL', exitCode: code, stdout: res.stdout || '', stderr: res.stderr || ''};
}

const steps = [];
steps.push(run('runtime', 'Validar archivos runtime backend', 'firebase/client-write-tools/validate-backend-runtime-files.mjs', [], [0,1]));

if (fs.existsSync(hrFile)) {
  steps.push(run('finance', 'Validar pipeline beneficios HR V4', 'firebase/client-write-tools/run-finance-benefits-full-pipeline-dry-run.mjs', [`--file=${hrFile}`], [0,1]));
} else {
  steps.push({id:'finance', label:'Validar pipeline beneficios HR V4', status:'SKIPPED', exitCode:null, note:'No se encontró HR V4'});
}

const status = steps.some(s=>s.status==='FAIL') ? 'FAIL' : steps.some(s=>s.status==='REVIEW' || s.status==='SKIPPED') ? 'REVIEW' : 'OK';

const result = {
  generatedAt: new Date().toISOString(),
  mode: 'backend-dev-readiness-dry-run',
  status,
  hrFile,
  steps: steps.map(({id,label,status,exitCode,note})=>({id,label,status,exitCode,note:note||null})),
  gate: 'No cargar ni conectar preview DEV si estado es FAIL. Si es REVIEW, revisar salidas antes de avanzar.'
};

const outJson = path.join(outDir, 'backend-dev-readiness-dry-run.json');
const outMd = path.join(outDir, 'backend-dev-readiness-dry-run-summary.md');
fs.writeFileSync(outJson, JSON.stringify({...result, details:steps}, null, 2), 'utf8');

const md = [];
md.push('# Backend DEV readiness dry-run');
md.push('');
md.push(`Estado: ${status}`);
md.push(`HR V4: ${hrFile}`);
md.push('');
md.push('| Paso | Estado | Exit code | Nota |');
md.push('|---|---|---:|---|');
for (const s of result.steps) md.push(`| ${s.label} | ${s.status} | ${s.exitCode ?? ''} | ${s.note || ''} |`);
md.push('');
md.push('## Gate');
md.push(result.gate);
md.push('');
md.push('## Salidas');
md.push(`- ${outJson}`);
md.push(`- ${outMd}`);
fs.writeFileSync(outMd, md.join('\n'), 'utf8');
console.log(md.join('\n'));
process.exit(status === 'FAIL' ? 2 : status === 'REVIEW' ? 1 : 0);
