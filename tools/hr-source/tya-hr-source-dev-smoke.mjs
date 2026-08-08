const endpoint = process.env.CXORBIA_HR_SOURCE_ENDPOINT || 'http://127.0.0.1:8787/api/hr-source';

const actions = ['test', 'preview', 'sync-request'];

function assert(condition, message){
  if(!condition) throw new Error(message);
}

async function post(action){
  const payload = {
    action,
    tenantId: 'tya',
    projectId: 'cinepolis',
    sourceType: 'google_sheets',
    sourceRef: 'local-smoke-ref',
    maskedUrl: '***smoke***',
    requestedAt: new Date().toISOString(),
    env: 'dev-smoke'
  };
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const json = await res.json();
  return { statusCode: res.status, json };
}

const report = {
  endpoint,
  generatedAt: new Date().toISOString(),
  firestoreWrites: 0,
  importsExecuted: 0,
  results: []
};

for(const action of actions){
  const result = await post(action);
  assert(result.statusCode === 200, `${action}: HTTP ${result.statusCode}`);
  assert(result.json && typeof result.json.status === 'string', `${action}: missing status`);
  assert(result.json.canImport === false, `${action}: canImport must remain false`);
  assert(Array.isArray(result.json.issues), `${action}: issues must be an array`);
  if(action === 'sync-request'){
    assert(result.json.status === 'blocked', 'sync-request must remain blocked');
  }
  report.results.push({
    action,
    http: result.statusCode,
    status: result.json.status,
    canImport: result.json.canImport,
    periodsDetected: Array.isArray(result.json.periodsDetected) ? result.json.periodsDetected.length : 0,
    issues: result.json.issues.length,
    counts: result.json.counts || {}
  });
}

console.log('CXOrbia HR Source DEV smoke OK');
console.log(JSON.stringify(report, null, 2));
