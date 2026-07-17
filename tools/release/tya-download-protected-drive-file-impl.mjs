#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import process from 'node:process';
import {setTimeout as sleep} from 'node:timers/promises';

const fileId = process.env.V156_DRIVE_FILE_ID || '';
const output = process.env.V156_DRIVE_OUTPUT || '.candidate/v156-runtime-delta.zip';
const expectedSha256 = process.env.V156_EXPECT_SHA256 || '';
const diagnosticFile = process.env.V156_DRIVE_DIAGNOSTIC || '.tmp/v156-atomic/drive-diagnostic.json';
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON || '{}');
const projectNumber = '87461567267';
const diagnostics = {schemaVersion:'1.1.0', fileId, output, projectNumber, serviceEnable:null, attempts:[], success:false};

const writeDiagnostic = () => {
  fs.mkdirSync(path.dirname(diagnosticFile), {recursive:true});
  fs.writeFileSync(diagnosticFile, JSON.stringify(diagnostics, null, 2) + '\n', 'utf8');
};
const fail = message => {
  diagnostics.error = message;
  writeDiagnostic();
  throw new Error(message);
};
const b64url = value => Buffer.from(typeof value === 'string' ? value : JSON.stringify(value)).toString('base64url');
const sha256 = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const safeSnippet = bytes => bytes.toString('utf8', 0, Math.min(bytes.length, 700)).replace(/[\r\n\t]+/g, ' ').replace(/\s{2,}/g, ' ').slice(0,700);

if (!fileId) fail('Missing V156_DRIVE_FILE_ID.');
if (serviceAccount.type !== 'service_account' || serviceAccount.project_id !== 'cxorbia-backend-dev' || !serviceAccount.private_key || !serviceAccount.client_email) {
  fail('Firebase DEV service account secret unavailable or mismatched.');
}

const now = Math.floor(Date.now() / 1000);
const unsigned = b64url({alg:'RS256',typ:'JWT'}) + '.' + b64url({
  iss: serviceAccount.client_email,
  scope: 'https://www.googleapis.com/auth/cloud-platform https://www.googleapis.com/auth/drive.readonly',
  aud: 'https://oauth2.googleapis.com/token',
  iat: now,
  exp: now + 900
});
const signature = crypto.sign('RSA-SHA256', Buffer.from(unsigned), serviceAccount.private_key).toString('base64url');
const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
  method: 'POST',
  headers: {'content-type':'application/x-www-form-urlencoded'},
  body: new URLSearchParams({grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion:unsigned + '.' + signature})
});
if (!tokenResponse.ok) fail(`OAuth token request failed: ${tokenResponse.status} ${(await tokenResponse.text()).slice(0,300)}`);
const {access_token: accessToken} = await tokenResponse.json();
if (!accessToken) fail('OAuth response did not contain an access token.');

const enableUrl = `https://serviceusage.googleapis.com/v1/projects/${projectNumber}/services/drive.googleapis.com:enable`;
const enableResponse = await fetch(enableUrl, {method:'POST', headers:{authorization:`Bearer ${accessToken}`,'content-type':'application/json'}, body:'{}'});
const enableBytes = Buffer.from(await enableResponse.arrayBuffer());
diagnostics.serviceEnable = {status:enableResponse.status, responseSnippet:safeSnippet(enableBytes)};
if (enableResponse.ok) {
  let operation = {};
  try { operation = JSON.parse(enableBytes.toString('utf8')); } catch {}
  diagnostics.serviceEnable.operation = operation.name || null;
  if (operation.name) {
    for (let attempt = 0; attempt < 30; attempt += 1) {
      const opResponse = await fetch(`https://serviceusage.googleapis.com/v1/${operation.name}`, {headers:{authorization:`Bearer ${accessToken}`}});
      const op = await opResponse.json().catch(() => ({}));
      if (op.done) { diagnostics.serviceEnable.operationDone = true; diagnostics.serviceEnable.operationError = op.error || null; break; }
      await sleep(2000);
    }
  }
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const stateResponse = await fetch(`https://serviceusage.googleapis.com/v1/projects/${projectNumber}/services/drive.googleapis.com`, {headers:{authorization:`Bearer ${accessToken}`}});
    const state = await stateResponse.json().catch(() => ({}));
    diagnostics.serviceEnable.state = state.state || null;
    if (state.state === 'ENABLED') break;
    await sleep(2000);
  }
} else {
  diagnostics.serviceEnable.warning = 'Drive API enable was not permitted; download attempts continue fail-closed.';
}
writeDiagnostic();

const endpoints = [
  `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?alt=media&supportsAllDrives=true`,
  `https://www.googleapis.com/download/drive/v3/files/${encodeURIComponent(fileId)}?alt=media`,
  `https://drive.usercontent.google.com/download?id=${encodeURIComponent(fileId)}&export=download&confirm=t`,
  `https://drive.google.com/uc?export=download&id=${encodeURIComponent(fileId)}&confirm=t`
];

for (const url of endpoints) {
  try {
    const response = await fetch(url, {headers:{authorization:`Bearer ${accessToken}`}, redirect:'follow'});
    const bytes = Buffer.from(await response.arrayBuffer());
    const digest = sha256(bytes);
    const contentType = response.headers.get('content-type') || '';
    const attempt = {endpoint:new URL(url).hostname, status:response.status, contentType, bytes:bytes.length, sha256:digest};
    if (!response.ok || contentType.includes('json') || contentType.includes('text/html')) attempt.responseSnippet = safeSnippet(bytes);
    diagnostics.attempts.push(attempt);
    if (response.ok && (!expectedSha256 || digest === expectedSha256)) {
      fs.mkdirSync(path.dirname(output), {recursive:true});
      fs.writeFileSync(output, bytes);
      diagnostics.success = true;
      diagnostics.bytes = bytes.length;
      diagnostics.sha256 = digest;
      writeDiagnostic();
      console.log(`Protected V156 transport retrieved; bytes=${bytes.length}; sha256=${digest}`);
      process.exit(0);
    }
  } catch (error) {
    diagnostics.attempts.push({endpoint:new URL(url).hostname, error:String(error?.message || error)});
  }
}

fail(`Protected Drive handoff did not return the expected V156 SHA-256 ${expectedSha256}.`);
