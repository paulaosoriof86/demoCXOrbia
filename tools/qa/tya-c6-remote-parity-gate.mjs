import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = String(process.argv[2] || process.env.CXORBIA_DEV_ROOT_URL || '').replace(/\/$/, '');
const liveEndpoint = String(process.env.CXORBIA_LIVE_ENDPOINT || '/api/tya/cinepolis/hr-live');
const output = String(process.env.CXORBIA_REMOTE_PARITY_OUTPUT || '.tmp/c6-hosting-dev-deploy/remote-parity.json');
const maxAttempts = Number(process.env.CXORBIA_REMOTE_PARITY_ATTEMPTS || 30);
const waitMs = Number(process.env.CXORBIA_REMOTE_PARITY_WAIT_MS || 5000);

if (!root.startsWith('https://')) {
  throw new Error('remote_root_invalid');
}

const files = [
  'index-backend-dev.html',
  'core/backend-browser-auth.js',
  'core/tya-phase-a-source-safe-preview.js',
  'adapters/tya-c6-unified-human-runtime-v1.js',
  'adapters/tya-c6-shopper-auth-click-guard-v1.js',
  'adapters/tya-protected-auth-hr-authority-bridge-v2.js',
  'adapters/tya-cumulative-read-model-v2.js',
  'adapters/tya-c6-domain-consistency-bridge.js',
  'adapters/tya-canonical-shopper-portal-v2.js',
  'adapters/tya-canonical-finance-read-model-v2.js',
  'adapters/tya-project-financial-model-contract-v1.js',
  'adapters/tya-delegated-coordination-finance-guard-v1.js',
  'adapters/tya-canonical-reservations-guard-v2.js',
  'modules/cliente.js',
  'modules/finanzas.js',
  'app.js'
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');

async function fetchBuffer(url) {
  const response = await fetch(url, {
    headers: {
      'cache-control': 'no-cache',
      pragma: 'no-cache'
    }
  });
  return { response, body: Buffer.from(await response.arrayBuffer()) };
}

fs.mkdirSync(path.dirname(output), { recursive: true });

let result = null;

for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
  const rows = [];
  let allCriticalAssetsMatch = true;

  for (const file of files) {
    const local = fs.readFileSync(`app/${file}`);
    const localSha256 = sha256(local);
    try {
      const { response, body } = await fetchBuffer(`${root}/${file}?c6=${Date.now()}`);
      const remoteSha256 = sha256(body);
      const match = response.ok && localSha256 === remoteSha256;
      allCriticalAssetsMatch = allCriticalAssetsMatch && match;
      rows.push({
        path: file,
        status: response.status,
        localSha256,
        remoteSha256,
        match,
        error: null
      });
    } catch (error) {
      allCriticalAssetsMatch = false;
      rows.push({
        path: file,
        status: 0,
        localSha256,
        remoteSha256: null,
        match: false,
        error: String(error?.message || error)
      });
    }
  }

  let liveEndpointResult;
  try {
    const liveUrl = `${root}${liveEndpoint}?format=meta&fresh=1&ts=${Date.now()}`;
    const response = await fetch(liveUrl, {
      headers: {
        'cache-control': 'no-cache',
        pragma: 'no-cache'
      }
    });
    const text = await response.text();
    let json = null;
    try {
      json = JSON.parse(text);
    } catch {
      json = null;
    }
    const ok = response.ok && Boolean(json) && (
      json.ok === true ||
      json.sourceSafe === true ||
      json.runtimeRead === true ||
      Boolean(json.revision) ||
      Boolean(json.meta?.revision)
    );
    liveEndpointResult = {
      status: response.status,
      ok,
      revision: json?.revision || json?.meta?.revision || null,
      runtimeRead: json?.runtimeRead ?? json?.meta?.runtimeRead ?? null,
      sourceSafe: json?.sourceSafe ?? json?.meta?.sourceSafe ?? null,
      contentType: response.headers.get('content-type') || null,
      responseBytes: Buffer.byteLength(text),
      parseableJson: Boolean(json),
      error: null
    };
  } catch (error) {
    liveEndpointResult = {
      status: 0,
      ok: false,
      revision: null,
      runtimeRead: null,
      sourceSafe: null,
      contentType: null,
      responseBytes: 0,
      parseableJson: false,
      error: String(error?.message || error)
    };
  }

  result = {
    schemaVersion: 'cxorbia.c6.hosting-dev-remote-parity.v4',
    generatedAt: new Date().toISOString(),
    decision: allCriticalAssetsMatch && liveEndpointResult.ok
      ? 'PASS_C6_HOSTING_DEV_REMOTE_PARITY_AND_LIVE_HR'
      : 'RETRY_C6_HOSTING_DEV_REMOTE_PARITY_AND_LIVE_HR',
    root,
    attempt,
    maxAttempts,
    allCriticalAssetsMatch,
    files: rows,
    liveEndpoint: liveEndpointResult,
    safety: {
      hostingDeploys: 0,
      cloudRunDeploys: 0,
      firestoreWrites: 0,
      authWrites: 0,
      rulesDeploys: 0,
      storageWrites: 0,
      hrWrites: 0,
      merge: false,
      production: false
    }
  };

  fs.writeFileSync(output, `${JSON.stringify(result, null, 2)}\n`);

  if (allCriticalAssetsMatch && liveEndpointResult.ok) {
    break;
  }

  if (attempt < maxAttempts) {
    await sleep(waitMs);
  }
}

if (!result?.allCriticalAssetsMatch || !result?.liveEndpoint?.ok) {
  result.decision = 'FAIL_C6_HOSTING_DEV_REMOTE_PARITY_OR_LIVE_HR';
  fs.writeFileSync(output, `${JSON.stringify(result, null, 2)}\n`);
  console.error(`DECISION ${result.decision}`);
  process.exit(2);
}

console.log(`DECISION ${result.decision}`);
