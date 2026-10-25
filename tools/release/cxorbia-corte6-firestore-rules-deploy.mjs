import fs from 'node:fs';
import crypto from 'node:crypto';
import admin from 'firebase-admin';

const expectedProject = process.env.CXORBIA_EXPECTED_PROJECT || 'cxorbia-backend-dev';
const credentialPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const rulesPath = process.env.CXORBIA_RULES_SOURCE || 'firestore.rules';
const out = process.env.CXORBIA_RULES_DEPLOY_REPORT || 'app/docs/evidence/CORTE6-FIRESTORE-RULES-DEPLOY-LATEST.json';
const execute = process.env.CXORBIA_EXECUTE_FIRESTORE_RULES === 'true';
const releaseName = `projects/${expectedProject}/releases/cloud.firestore`;

if (!credentialPath || !fs.existsSync(credentialPath)) throw new Error('credential_missing');
if (!fs.existsSync(rulesPath)) throw new Error('rules_source_missing');
const sa = JSON.parse(fs.readFileSync(credentialPath, 'utf8'));
if (sa.project_id !== expectedProject) throw new Error(`wrong_project:${sa.project_id || 'missing'}!=${expectedProject}`);

const credential = admin.credential.cert(sa);
const token = await credential.getAccessToken();
if (!token?.access_token) throw new Error('oauth_token_unavailable');
const source = fs.readFileSync(rulesPath, 'utf8');
const sha = value => crypto.createHash('sha256').update(String(value || ''), 'utf8').digest('hex');
const sourceSha256 = sha(source);

async function request(method, url, body){
  const r = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token.access_token}`,
      Accept: 'application/json',
      ...(body === undefined ? {} : {'Content-Type':'application/json'})
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  const text = await r.text();
  let payload = {};
  try { payload = text ? JSON.parse(text) : {}; } catch {}
  return {ok:r.ok,status:r.status,payload};
}
function fail(label, response){
  const code = response?.payload?.error?.status || response?.status || 'unknown';
  const message = String(response?.payload?.error?.message || label).replace(/[\r\n]+/g,' ').slice(0,220);
  throw new Error(`${label}:${code}:${message}`);
}

const iamPermissions = [
  'firebaserules.rulesets.create',
  'firebaserules.rulesets.get',
  'firebaserules.rulesets.list',
  'firebaserules.rulesets.test',
  'firebaserules.releases.get',
  'firebaserules.releases.update',
  'serviceusage.services.use',
  'resourcemanager.projects.get'
];
const iam = await request(
  'POST',
  `https://cloudresourcemanager.googleapis.com/v1/projects/${encodeURIComponent(expectedProject)}:testIamPermissions`,
  {permissions:iamPermissions}
);
if (!iam.ok) fail('iam_test_failed', iam);
const granted = new Set(Array.isArray(iam.payload?.permissions) ? iam.payload.permissions : []);
const directRequired = [
  'firebaserules.rulesets.create',
  'firebaserules.rulesets.get',
  'firebaserules.releases.get',
  'firebaserules.releases.update',
  'serviceusage.services.use',
  'resourcemanager.projects.get'
];
const missingDirect = directRequired.filter(p => !granted.has(p));
if (missingDirect.length) throw new Error(`direct_rules_api_permissions_missing:${missingDirect.join(',')}`);

const beforeRelease = await request('GET', `https://firebaserules.googleapis.com/v1/${releaseName}`);
if (!beforeRelease.ok || !beforeRelease.payload?.rulesetName) fail('current_release_unavailable', beforeRelease);
const beforeRulesetName = String(beforeRelease.payload.rulesetName);
const beforeRuleset = await request('GET', `https://firebaserules.googleapis.com/v1/${beforeRulesetName}`);
if (!beforeRuleset.ok) fail('current_ruleset_unavailable', beforeRuleset);
const beforeFile = (beforeRuleset.payload?.source?.files || []).find(f => f?.name === 'firestore.rules') || (beforeRuleset.payload?.source?.files || [])[0] || {};
const beforeSourceSha256 = sha(beforeFile.content || '');
const alreadyCurrent = beforeSourceSha256 === sourceSha256;

const report = {
  schemaVersion:'cxorbia.corte6-firestore-rules-deploy.v1',
  generatedAt:new Date().toISOString(),
  projectId:expectedProject,
  releaseName,
  execute,
  authorizedScope:'firestore_rules_only',
  sourceSha256,
  before:{rulesetName:beforeRulesetName,sourceSha256:beforeSourceSha256},
  iam:{directApiReady:true,rulesetsTestPermission:granted.has('firebaserules.rulesets.test')},
  diagnosis:{firebaseCliPretestBlocked:granted.has('firebaserules.rulesets.test')===false},
  alreadyCurrent,
  createdRuleset:false,
  releaseUpdated:false,
  verified:false,
  providerWrites:0,
  after:null,
  safety:{authWrites:0,firestoreDataWrites:0,storageWrites:0,hostingDeploys:0,production:false,merge:false,secretsExported:false}
};

if (!execute) {
  report.decision = alreadyCurrent ? 'DRY_RUN_ALREADY_CURRENT' : 'DRY_RUN_READY_DIRECT_RULES_API';
} else if (alreadyCurrent) {
  report.decision = 'PASS_ALREADY_CURRENT_NO_RULES_WRITE';
  report.verified = true;
  report.after = {rulesetName:beforeRulesetName,sourceSha256:beforeSourceSha256};
} else {
  const created = await request(
    'POST',
    `https://firebaserules.googleapis.com/v1/projects/${encodeURIComponent(expectedProject)}/rulesets`,
    {source:{files:[{name:'firestore.rules',content:source}]}}
  );
  if (!created.ok || !created.payload?.name) fail('ruleset_create_failed', created);
  const newRulesetName = String(created.payload.name);
  report.createdRuleset = true;
  report.providerWrites += 1;

  const patched = await request(
    'PATCH',
    `https://firebaserules.googleapis.com/v1/${releaseName}`,
    {release:{name:releaseName,rulesetName:newRulesetName},updateMask:'rulesetName'}
  );
  if (!patched.ok || patched.payload?.rulesetName !== newRulesetName) fail('release_patch_failed', patched);
  report.releaseUpdated = true;
  report.providerWrites += 1;

  const afterRelease = await request('GET', `https://firebaserules.googleapis.com/v1/${releaseName}`);
  if (!afterRelease.ok || afterRelease.payload?.rulesetName !== newRulesetName) fail('release_readback_mismatch', afterRelease);
  const afterRuleset = await request('GET', `https://firebaserules.googleapis.com/v1/${newRulesetName}`);
  if (!afterRuleset.ok) fail('new_ruleset_readback_failed', afterRuleset);
  const afterFile = (afterRuleset.payload?.source?.files || []).find(f => f?.name === 'firestore.rules') || (afterRuleset.payload?.source?.files || [])[0] || {};
  const afterSourceSha256 = sha(afterFile.content || '');
  if (afterSourceSha256 !== sourceSha256) throw new Error(`rules_source_hash_mismatch:${afterSourceSha256}`);
  report.verified = true;
  report.after = {rulesetName:newRulesetName,sourceSha256:afterSourceSha256};
  report.decision = 'PASS_DIRECT_FIRESTORE_RULES_DEPLOY_VERIFIED';
}

fs.mkdirSync(new URL('../../app/docs/evidence/', import.meta.url), {recursive:true});
fs.writeFileSync(out, JSON.stringify(report,null,2)+'\n','utf8');
console.log(JSON.stringify({projectId:expectedProject,decision:report.decision,execute,alreadyCurrent,createdRuleset:report.createdRuleset,releaseUpdated:report.releaseUpdated,verified:report.verified,providerWrites:report.providerWrites,rulesetsTestPermission:report.iam.rulesetsTestPermission,sourceSha256}));
