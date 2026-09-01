import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { registerPrivateSource, loadSafeRegistry, privateDir } from './tya-hr-source-private-registry.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const port = Number(process.env.CXORBIA_HR_SOURCE_PORT || 8787);
const endpoint = `http://127.0.0.1:${port}/api/hr-source`;
const previewDir = process.env.CXORBIA_TYA_STAGING_PREVIEW_DIR || path.join(repoRoot, 'tmp', 'tya-staging-preview');
const outDir = process.env.CXORBIA_HR_PRIVATE_FLOW_OUT || path.join(repoRoot, 'tmp', 'hr-source-private-flow-check');
const serverScript = path.join(repoRoot, 'tools', 'hr-source', 'tya-hr-source-dev-server.mjs');

function arg(name){
  const prefix = `--${name}=`;
  const found = process.argv.find(a => a.startsWith(prefix));
  return found ? found.slice(prefix.length) : '';
}

function assert(condition, message){
  if(!condition) throw new Error(message);
}

function sleep(ms){ return new Promise(resolve => setTimeout(resolve, ms)); }

function latestSourceRef(){
  const safe = loadSafeRegistry();
  const sources = Array.isArray(safe.sources) ? safe.sources : [];
  return sources.length ? sources[sources.length - 1].sourceRef : '';
}

async function waitForEndpoint(timeoutMs = 10000){
  const started = Date.now();
  while(Date.now() - started < timeoutMs){
    try{
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test', sourceType: 'google_sheets', sourceRef: 'wait-check', env: 'private-flow-check' })
      });
      if(res.status === 200) return true;
    }catch{
      // keep waiting
    }
    await sleep(300);
  }
  return false;
}

async function post(action, sourceRef){
  const payload = {
    action,
    tenantId: 'tya',
    projectId: 'cinepolis',
    sourceType: 'google_sheets',
    sourceRef,
    maskedUrl: '***private-flow***',
    requestedAt: new Date().toISOString(),
    env: 'private-flow-check'
  };
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return { action, http: res.status, json: await res.json() };
}

fs.mkdirSync(outDir, { recursive: true });

const report = {
  generatedAt: new Date().toISOString(),
  mode: 'private-flow-check-no-firestore-writes',
  endpoint,
  previewDir,
  privateDir,
  firestoreWrites: 0,
  importsExecuted: 0,
  canImportExpected: false,
  sourceRef: '',
  registeredNow: false,
  serverStarted: false,
  serverStopped: false,
  results: [],
  errors: []
};

let server = null;
let serverLog = '';

try{
  assert(fs.existsSync(previewDir), `Missing staging preview dir: ${previewDir}`);
  const rawUrl = arg('url') || process.env.CXORBIA_HR_SOURCE_URL || '';
  let sourceRef = arg('sourceRef') || process.env.CXORBIA_HR_SOURCE_REF || '';

  if(rawUrl){
    const registered = registerPrivateSource({
      rawUrl,
      label: arg('label') || 'TyA HR live source',
      tenantId: arg('tenantId') || 'tya',
      projectId: arg('projectId') || 'cinepolis'
    });
    sourceRef = registered.safe.sourceRef;
    report.registeredNow = true;
    report.maskedUrl = registered.safe.maskedUrl;
  }

  if(!sourceRef) sourceRef = latestSourceRef();
  assert(sourceRef, 'No private sourceRef found. Register a source first or provide CXORBIA_HR_SOURCE_URL.');
  report.sourceRef = sourceRef;

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
    const result = await post(action, sourceRef);
    assert(result.http === 200, `${action}: HTTP ${result.http}`);
    assert(result.json && typeof result.json.status === 'string', `${action}: missing status`);
    assert(Array.isArray(result.json.issues), `${action}: issues must be array`);
    assert(result.json.canImport === false, `${action}: canImport must be false`);
    if(action === 'sync-request') assert(result.json.status === 'blocked', 'sync-request must stay blocked');
    report.results.push({
      action,
      http: result.http,
      status: result.json.status,
      canImport: result.json.canImport,
      liveSourceMatched: !!(result.json.counts && result.json.counts.liveSourceMatched),
      periodsDetected: Array.isArray(result.json.periodsDetected) ? result.json.periodsDetected.length : 0,
      issues: result.json.issues.length,
      counts: result.json.counts || {}
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
  fs.writeFileSync(path.join(outDir, 'hrSourcePrivateFlowCheck.json'), JSON.stringify(report, null, 2), 'utf8');

  const md = [
    '# CXOrbia HR Source private flow check',
    '',
    `Generated at: ${report.generatedAt}`,
    `Endpoint: ${report.endpoint}`,
    `Preview dir: ${report.previewDir}`,
    `Private dir: ${report.privateDir}`,
    `Source ref: ${report.sourceRef || 'missing'}`,
    `Registered now: ${report.registeredNow}`,
    '',
    '## Safety',
    '- Firestore writes: 0',
    '- Imports executed: 0',
    '- canImport expected: false',
    '- Raw URL remains local only under tmp/hr-source-private',
    '',
    '## Results',
    ...(report.results.length ? report.results.map(r => `- ${r.action}: HTTP ${r.http}, status=${r.status}, canImport=${r.canImport}, liveSourceMatched=${r.liveSourceMatched}, periods=${r.periodsDetected}, issues=${r.issues}`) : ['- none']),
    '',
    '## Errors',
    ...(report.errors.length ? report.errors.map(e => `- ${e}`) : ['- none'])
  ].join('\n');

  fs.writeFileSync(path.join(outDir, 'hrSourcePrivateFlowCheck.md'), md, 'utf8');
  console.log(md);
  console.log('');
  console.log(`Report dir: ${outDir}`);
}
