import fs from 'node:fs';
import admin from 'firebase-admin';

const expectedProject = process.env.CXORBIA_EXPECTED_PROJECT || 'cxorbia-backend-dev';
const credentialPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const out = process.env.CXORBIA_RULES_IAM_REPORT || 'app/docs/evidence/CORTE6-RULES-IAM-DIAGNOSTIC-LATEST.json';

if (!credentialPath || !fs.existsSync(credentialPath)) throw new Error('credential_missing');
const sa = JSON.parse(fs.readFileSync(credentialPath, 'utf8'));
if (sa.project_id !== expectedProject) throw new Error(`wrong_project:${sa.project_id || 'missing'}!=${expectedProject}`);

const credential = admin.credential.cert(sa);
const token = await credential.getAccessToken();
if (!token?.access_token) throw new Error('oauth_token_unavailable');

const requestedPermissions = [
  'firebaserules.rulesets.create',
  'firebaserules.rulesets.get',
  'firebaserules.rulesets.list',
  'firebaserules.releases.get',
  'firebaserules.releases.update',
  'serviceusage.services.use',
  'resourcemanager.projects.get',
  'firebase.projects.get'
];

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
  return {ok:r.ok, status:r.status, payload};
}

const iam = await request(
  'POST',
  `https://cloudresourcemanager.googleapis.com/v1/projects/${encodeURIComponent(expectedProject)}:testIamPermissions`,
  {permissions: requestedPermissions}
);
const granted = new Set(Array.isArray(iam.payload?.permissions) ? iam.payload.permissions : []);
const permissionMap = Object.fromEntries(requestedPermissions.map(p => [p, granted.has(p)]));

const release = await request(
  'GET',
  `https://firebaserules.googleapis.com/v1/projects/${encodeURIComponent(expectedProject)}/releases/cloud.firestore`
);
const rulesets = await request(
  'GET',
  `https://firebaserules.googleapis.com/v1/projects/${encodeURIComponent(expectedProject)}/rulesets?pageSize=1`
);

const requiredForDeploy = [
  'firebaserules.rulesets.create',
  'firebaserules.releases.get',
  'firebaserules.releases.update',
  'serviceusage.services.use',
  'resourcemanager.projects.get'
];
const missingRequired = requiredForDeploy.filter(p => !granted.has(p));
const report = {
  schemaVersion:'cxorbia.corte6-rules-iam-diagnostic.v1',
  generatedAt:new Date().toISOString(),
  projectId:expectedProject,
  readOnly:true,
  providerWrites:0,
  iamTest:{ok:iam.ok,status:iam.status,permissions:permissionMap},
  firebaserulesRead:{releaseOk:release.ok,releaseStatus:release.status,rulesetsOk:rulesets.ok,rulesetsStatus:rulesets.status},
  requiredForDeploy,
  missingRequired,
  iamDeployReady:iam.ok && missingRequired.length === 0,
  safety:{authWrites:0,firestoreWrites:0,rulesWrites:0,hostingDeploys:0,production:false,merge:false,piiExported:false,secretsExported:false}
};

fs.mkdirSync(new URL('../../app/docs/evidence/', import.meta.url), {recursive:true});
fs.writeFileSync(out, JSON.stringify(report,null,2)+'\n','utf8');
console.log(JSON.stringify({projectId:expectedProject,iamStatus:iam.status,releaseStatus:release.status,rulesetsStatus:rulesets.status,missingRequired,iamDeployReady:report.iamDeployReady,providerWrites:0}));
