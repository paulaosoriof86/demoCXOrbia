import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const port = Number(process.env.CXORBIA_HR_SOURCE_PORT || 8787);
const endpoint = `http://127.0.0.1:${port}/api/hr-source`;
const previewDir = process.env.CXORBIA_TYA_STAGING_PREVIEW_DIR || path.join(repoRoot, 'tmp', 'tya-staging-preview');
const outDir = process.env.CXORBIA_HR_SOURCE_CHECK_OUT || path.join(repoRoot, 'tmp', 'hr-source-dev-full-check');
const serverScript = path.join(repoRoot, 'tools', 'hr-source', 'tya-hr-source-dev-server.mjs');
const previewUrl = `app/index-backend-dev.html?cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV&cxProjectId=cinepolis&cxHrSourceLocal=1`;

fs.mkdirSync(outDir, { recursive: true });

function assert(condition, message){
  if(!condition) throw new Error(message);
}

function sleep(ms){
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForEndpoint(timeoutMs = 10000){
  const started = Date.now();
  while(Date.now() - started < timeoutMs){
    try{
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test', sourceType: 'google_sheets', sourceRef: 'wait-check', env: 'dev-full-check' })
      });
      if(res.status === 200) return true;
    }catch{
      // keep waiting
    }
    await sleep(300);
  }
  return false;
}

async function post(action){
  const payload = {
    action,
    tenantId: 'tya',
    projectId: 'cinepolis',
    sourceType: 'google_sheets',
    sourceRef: 'full-check-ref',
    maskedUrl: '***full-check***',
    requestedAt: new Date().toISOString(),
    env: 'dev-full-check'
  };
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const json = await res.json();
  return { action, statusCode: res.status, json };
}

const report = {
  generatedAt: new Date().toISOString(),
  mode: 'local-full-check-no-firestore-writes',
  endpoint,
  previewDir,
  previewUrl,
  firestoreWrites: 0,
  importsExecuted: 0,
  serverStarted: false,
  serverStopped: false,
  results: [],
  errors: []
};

let server = null;
let serverLog = '';

try{
  assert(fs.existsSync(serverScript), `Missing server script: ${serverScript}`);
  assert(fs.existsSync(previewDir), `Missing staging preview dir: ${previewDir}`);

  server = spawn(process.execPath, [serverScript], {
    cwd: repoRoot,
    env: {
      ...process.env,
      CXORBIA_HR_SOURCE_PORT: String(port),
      CXORBIA_TYA_STAGING_PREVIEW_DIR: previewDir
    },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  report.serverStarted = true;
  server.stdout.on('data', chunk => { serverLog += chunk.toString(); });
  server.stderr.on('data', chunk => { serverLog += chunk.toString(); });

  const ready = await waitForEndpoint();
  assert(ready, `Endpoint did not become ready: ${endpoint}`);

  for(const action of ['test', 'preview', 'sync-request']){
    const result = await post(action);
    assert(result.statusCode === 200, `${action}: HTTP ${result.statusCode}`);
    assert(result.json && typeof result.json.status === 'string', `${action}: missing status`);
    assert(Array.isArray(result.json.issues), `${action}: issues must be array`);
    assert(result.json.canImport === false, `${action}: canImport must be false`);
    if(action === 'sync-request') assert(result.json.status === 'blocked', 'sync-request must stay blocked');
    report.results.push({
      action,
      http: result.statusCode,
      status: result.json.status,
      canImport: result.json.canImport,
      counts: result.json.counts || {},
      periodsDetected: Array.isArray(result.json.periodsDetected) ? result.json.periodsDetected.length : 0,
      issues: result.json.issues.length
    });
  }
}catch(err){
  report.errors.push(String(err && err.stack ? err.stack : err));
  process.exitCode = 1;
}finally{
  if(server){
    server.kill('SIGTERM');
    report.serverStopped = true;
  }
  report.serverLog = serverLog.trim();
  fs.writeFileSync(path.join(outDir, 'hrSourceDevFullCheck.json'), JSON.stringify(report, null, 2), 'utf8');

  const md = [
    '# CXOrbia HR Source DEV full check',
    '',
    `Generated at: ${report.generatedAt}`,
    `Endpoint: ${endpoint}`,
    `Preview dir: ${previewDir}`,
    `Preview URL: ${previewUrl}`,
    '',
    '## Safety',
    '- Firestore writes: 0',
    '- Imports executed: 0',
    '- canImport expected: false',
    '',
    '## Results',
    ...report.results.map(r => `- ${r.action}: HTTP ${r.http}, status=${r.status}, canImport=${r.canImport}, periods=${r.periodsDetected}, issues=${r.issues}`),
    '',
    '## Errors',
    ...(report.errors.length ? report.errors.map(e => `- ${e}`) : ['- none'])
  ].join('\n');

  fs.writeFileSync(path.join(outDir, 'hrSourceDevFullCheck.md'), md, 'utf8');
  console.log(md);
  console.log('');
  console.log(`Report dir: ${outDir}`);
}
