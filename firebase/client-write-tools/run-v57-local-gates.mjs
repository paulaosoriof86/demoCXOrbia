import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const outDir = path.join(root, 'firebase', 'client-write-tools', 'output');
fs.mkdirSync(outDir, {recursive:true});

function run(name, args, outputName){
  const res = spawnSync('node', args, {cwd: root, encoding: 'utf8'});
  const item = {
    name,
    command: ['node', ...args].join(' '),
    status: res.status,
    ok: res.status === 0,
    stdout: (res.stdout || '').trim(),
    stderr: (res.stderr || '').trim()
  };
  if(outputName && item.stdout){
    const file = path.join(outDir, outputName);
    fs.writeFileSync(file, item.stdout + '\n', 'utf8');
    item.stdoutFile = path.relative(root, file).replace(/\\/g, '/');
  }
  return item;
}

const checks = [];
checks.push(run('preview static v2', ['firebase/client-write-tools/validate-preview-v57-static-v2.mjs']));
checks.push(run('bulletins dry-run', ['firebase/client-write-tools/build-bulletins-v57-dry-run.mjs'], 'bulletins-v57-write-plan.json'));
checks.push(run('bulletins validate', ['firebase/client-write-tools/validate-bulletins-v57-dry-run.mjs', 'firebase/client-write-tools/output/bulletins-v57-write-plan.json']));
checks.push(run('resources dry-run', ['firebase/client-write-tools/build-resources-v57-dry-run.mjs'], 'resources-v57-write-plan.json'));
checks.push(run('resources validate', ['firebase/client-write-tools/validate-resources-write-plan.mjs', 'firebase/client-write-tools/output/resources-v57-write-plan.json']));
checks.push(run('resources manifest validate', ['firebase/client-write-tools/validate-resources-v57-manifest.mjs', 'firebase/client-write-tools/resources-v57-manifest.example.json']));
checks.push(run('migration manifest validate', ['firebase/client-write-tools/validate-migration-tya-package.mjs', 'firebase/client-write-tools/migration-tya-manifest.example.json']));

const result = {ok: checks.every(x=>x.ok), generatedAt: new Date().toISOString(), mode: 'local-no-firebase-no-real-data', checks};
const reportPath = path.join(outDir, 'v57-local-gates-report.json');
fs.writeFileSync(reportPath, JSON.stringify(result, null, 2) + '\n', 'utf8');
console.log(JSON.stringify({ok: result.ok, reportPath: path.relative(root, reportPath).replace(/\\/g, '/'), checks: checks.map(x=>({name:x.name, ok:x.ok, status:x.status}))}, null, 2));
process.exit(result.ok ? 0 : 1);
