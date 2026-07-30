import fs from 'node:fs';
import admin from 'firebase-admin';

const expectedProject = process.env.CXORBIA_EXPECTED_PROJECT || 'cxorbia-backend-dev';
const expectedSite = process.env.CXORBIA_EXPECTED_SITE || 'cxorbia-backend-dev';
const credentialPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const out = process.env.CXORBIA_HOSTING_IAM_REPORT || 'app/docs/evidence/CORTE6-HOSTING-IAM-DIAGNOSTIC-LATEST.json';

if (!credentialPath || !fs.existsSync(credentialPath)) throw new Error('credential_missing');
const sa = JSON.parse(fs.readFileSync(credentialPath, 'utf8'));
if (sa.project_id !== expectedProject) throw new Error(`wrong_project:${sa.project_id || 'missing'}!=${expectedProject}`);

const credential = admin.credential.cert(sa);
const token = await credential.getAccessToken();
if (!token?.access_token) throw new Error('oauth_token_unavailable');

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

const permissions = [
  'firebase.projects.get',
  'firebase.clients.get',
  'firebase.clients.list',
  'firebasehosting.sites.get',
  'firebasehosting.sites.list',
  'firebasehosting.sites.update',
  'resourcemanager.projects.get',
  'serviceusage.services.get',
  'serviceusage.services.list',
  'serviceusage.services.use',
  'apikeys.keys.get',
  'apikeys.keys.getKeyString',
  'apikeys.keys.list',
  'apikeys.keys.lookup'
];
const iam = await request(
  'POST',
  `https://cloudresourcemanager.googleapis.com/v1/projects/${encodeURIComponent(expectedProject)}:testIamPermissions`,
  {permissions}
);
const granted = new Set(Array.isArray(iam.payload?.permissions) ? iam.payload.permissions : []);
const permissionMap = Object.fromEntries(permissions.map(p => [p, granted.has(p)]));

const crm = await request('GET', `https://cloudresourcemanager.googleapis.com/v3/projects/${encodeURIComponent(expectedProject)}`);
const projectNumber = String(crm.payload?.name || '').split('/').pop() || '';
const firebaseProject = await request('GET', `https://firebase.googleapis.com/v1beta1/projects/${encodeURIComponent(expectedProject)}`);
const hostingSite = await request('GET', `https://firebasehosting.googleapis.com/v1beta1/projects/${encodeURIComponent(expectedProject)}/sites/${encodeURIComponent(expectedSite)}`);
const releases = await request('GET', `https://firebasehosting.googleapis.com/v1beta1/sites/${encodeURIComponent(expectedSite)}/releases?pageSize=1`);
const versions = await request('GET', `https://firebasehosting.googleapis.com/v1beta1/sites/${encodeURIComponent(expectedSite)}/versions?pageSize=1`);
let apiKeys = {ok:false,status:0,payload:{}};
if (projectNumber) apiKeys = await request('GET', `https://apikeys.googleapis.com/v2/projects/${encodeURIComponent(projectNumber)}/locations/global/keys?pageSize=1`);

const hostingCore = ['firebasehosting.sites.get','firebasehosting.sites.list','firebasehosting.sites.update','firebase.projects.get','resourcemanager.projects.get','serviceusage.services.use'];
const cliExtra = ['apikeys.keys.get','apikeys.keys.getKeyString','apikeys.keys.list','apikeys.keys.lookup'];
const missingHostingCore = hostingCore.filter(p => !granted.has(p));
const missingCliExtra = cliExtra.filter(p => !granted.has(p));
const report = {
  schemaVersion:'cxorbia.corte6-hosting-iam-diagnostic.v1',
  generatedAt:new Date().toISOString(),
  projectId:expectedProject,
  siteId:expectedSite,
  readOnly:true,
  providerWrites:0,
  iam:{ok:iam.ok,status:iam.status,permissions:permissionMap},
  providerReads:{
    cloudResourceManager:{ok:crm.ok,status:crm.status,projectNumberPresent:Boolean(projectNumber)},
    firebaseProject:{ok:firebaseProject.ok,status:firebaseProject.status},
    hostingSite:{ok:hostingSite.ok,status:hostingSite.status},
    releasesList:{ok:releases.ok,status:releases.status},
    versionsList:{ok:versions.ok,status:versions.status},
    apiKeysList:{ok:apiKeys.ok,status:apiKeys.status}
  },
  missingHostingCore,
  missingFirebaseCliApiKeysViewerPermissions:missingCliExtra,
  directHostingApiReadReady:hostingSite.ok && releases.ok && versions.ok && missingHostingCore.length===0,
  firebaseCliApiKeyReadReady:apiKeys.ok && missingCliExtra.length===0,
  diagnosis: missingCliExtra.length ? 'FIREBASE_CLI_API_KEYS_VIEWER_GAP' : (missingHostingCore.length ? 'HOSTING_CORE_IAM_GAP' : 'NO_IAM_GAP_DETECTED'),
  safety:{authWrites:0,firestoreDataWrites:0,rulesWrites:0,hostingWrites:0,storageWrites:0,production:false,merge:false,piiExported:false,secretsExported:false,apiKeyValuesExported:false}
};

fs.mkdirSync(new URL('../../app/docs/evidence/', import.meta.url), {recursive:true});
fs.writeFileSync(out, JSON.stringify(report,null,2)+'\n','utf8');
console.log(JSON.stringify({projectId:expectedProject,siteId:expectedSite,iamStatus:iam.status,hostingSiteStatus:hostingSite.status,releasesStatus:releases.status,versionsStatus:versions.status,apiKeysStatus:apiKeys.status,missingHostingCore,missingCliExtra,directHostingApiReadReady:report.directHostingApiReadReady,firebaseCliApiKeyReadReady:report.firebaseCliApiKeyReadReady,diagnosis:report.diagnosis,providerWrites:0}));
