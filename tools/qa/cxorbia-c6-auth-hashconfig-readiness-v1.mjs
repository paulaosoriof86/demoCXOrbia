#!/usr/bin/env node
import fs from 'node:fs';
import crypto from 'node:crypto';
import admin from 'firebase-admin';

const projectId = process.env.CXORBIA_FIREBASE_PROJECT || 'cxorbia-backend-dev';
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const requiredPermission = 'firebaseauth.configs.getHashConfig';

const ensure = (v, code) => { if (!v) throw new Error(code); };
const sha256 = v => crypto.createHash('sha256').update(String(v)).digest('hex');
const fp = v => sha256(v).slice(0, 20);
const safeError = error => {
  const raw = String(error?.message || error || 'UNKNOWN');
  return { code: (raw.split(':')[0] || 'UNKNOWN').replace(/[^A-Za-z0-9_.-]+/g, '_').slice(0, 120), fingerprint: sha256(raw).slice(0, 24) };
};

async function main() {
  const report = {
    schemaVersion: 'cxorbia.c6.auth-hashconfig-readiness.v1',
    generatedAt: new Date().toISOString(),
    projectId,
    requiredPermission,
    principalFp: null,
    iamTest: { pass: false, permissionGranted: false },
    configRead: { pass: false, signInPresent: false, hashConfigPresent: false, algorithmClass: null, fieldCount: 0 },
    safety: {
      iamWrites: 0,
      authWrites: 0,
      firestoreWrites: 0,
      hrWrites: 0,
      rulesWrites: 0,
      storageWrites: 0,
      cloudBuild: 0,
      cloudRun: 0,
      hosting: 0,
      merge: false,
      production: false,
      rawPrincipalExported: false,
      rawHashConfigExported: false
    },
    decision: 'STOP_RETRY_C6_AUTH_HASHCONFIG_READINESS'
  };

  try {
    ensure(serviceAccountPath && fs.existsSync(serviceAccountPath), 'SERVICE_ACCOUNT_MISSING');
    const sa = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    ensure(sa?.type === 'service_account' && sa?.project_id === projectId && sa?.client_email && sa?.private_key, 'SERVICE_ACCOUNT_INVALID');
    report.principalFp = fp(sa.client_email);

    const credential = admin.credential.cert(sa);
    const token = await credential.getAccessToken();
    const accessToken = token?.access_token || token?.accessToken;
    ensure(accessToken, 'ACCESS_TOKEN_MISSING');

    const iamResponse = await fetch(`https://cloudresourcemanager.googleapis.com/v1/projects/${encodeURIComponent(projectId)}:testIamPermissions`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${accessToken}`,
        'content-type': 'application/json',
        'cache-control': 'no-cache'
      },
      body: JSON.stringify({ permissions: [requiredPermission] })
    });
    ensure(iamResponse.ok, `TEST_IAM_PERMISSIONS_HTTP_${iamResponse.status}`);
    const iamBody = await iamResponse.json();
    const granted = Array.isArray(iamBody?.permissions) && iamBody.permissions.includes(requiredPermission);
    report.iamTest = { pass: granted, permissionGranted: granted };
    ensure(granted, 'HASH_CONFIG_PERMISSION_NOT_GRANTED');

    const configResponse = await fetch(`https://identitytoolkit.googleapis.com/admin/v2/projects/${encodeURIComponent(projectId)}/config`, {
      headers: {
        authorization: `Bearer ${accessToken}`,
        'cache-control': 'no-cache'
      }
    });
    ensure(configResponse.ok, `HASH_CONFIG_GET_HTTP_${configResponse.status}`);
    const body = await configResponse.json();
    const hashConfig = body?.signIn?.hashConfig;
    ensure(body?.signIn && typeof body.signIn === 'object', 'SIGNIN_CONFIG_MISSING');
    ensure(hashConfig && typeof hashConfig === 'object' && Object.keys(hashConfig).length > 0, 'HASH_CONFIG_MATERIAL_NOT_RETURNED');
    const algorithmClass = String(hashConfig.algorithm || hashConfig.hashAlgorithm || hashConfig.hash_algorithm || 'UNKNOWN').toUpperCase();
    report.configRead = {
      pass: true,
      signInPresent: true,
      hashConfigPresent: true,
      algorithmClass,
      fieldCount: Object.keys(hashConfig).length
    };

    report.decision = 'PASS_C6_AUTH_HASHCONFIG_PERMISSION_AND_MATERIAL_READINESS';
    process.stdout.write(JSON.stringify(report) + '\n');
  } catch (error) {
    report.error = safeError(error);
    process.stdout.write(JSON.stringify(report) + '\n');
    process.exitCode = 2;
  }
}

await main();
