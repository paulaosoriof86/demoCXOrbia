#!/usr/bin/env node
/*
  CXOrbia Phase A - Firebase DEV clean-state read-only verifier.

  IMPORTANT:
  - This runner performs provider READS and must only be executed after Paula's
    explicit authorization through the manual workflow confirmation.
  - It never creates users, writes claims, writes/deletes Firestore documents,
    uploads/deletes Storage objects, deploys rules, changes Auth config,
    invokes business functions, deploys Hosting or touches production.
  - Reports contain counts/booleans only. No user, document, object, function,
    rule release or credential identifiers are written to output.
*/

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const REQUIRED_CONFIRMATION = 'VERIFY_FIREBASE_DEV_READ_ONLY';
const DEFAULT_CONFIG = 'backend/config/phase-a-firebase-dev-clean-state-read-only.source-safe.json';
const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const configIdx = args.indexOf('--config');
const outDir = outIdx >= 0 ? args[outIdx + 1] : '.tmp/firebase-dev-clean-state-read-only-report';
const configPath = configIdx >= 0 ? args[configIdx + 1] : DEFAULT_CONFIG;
const root = process.cwd();

function hardStop(message, code = 4) {
  console.error(message);
  process.exit(code);
}

if (process.env.CXORBIA_CONFIRM !== REQUIRED_CONFIRMATION) {
  hardStop(`Blocked: CXORBIA_CONFIRM must equal ${REQUIRED_CONFIRMATION}`, 2);
}

if (!fs.existsSync(path.join(root, configPath))) {
  hardStop(`Blocked: missing source-safe config ${configPath}`, 2);
}

const config = JSON.parse(fs.readFileSync(path.join(root, configPath), 'utf8'));
const expectedProjectId = config.target?.projectId;
const expectedBucket = config.target?.storageBucket;
const expectedEmailSuffix = config.target?.expectedServiceAccountEmailSuffix;
const credentialPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

if (!expectedProjectId || !expectedBucket || !expectedEmailSuffix) {
  hardStop('Blocked: source-safe target configuration is incomplete.', 2);
}
if (!credentialPath || !fs.existsSync(credentialPath)) {
  hardStop('Blocked: GOOGLE_APPLICATION_CREDENTIALS is missing or unreadable.', 2);
}

let credentialJson;
try {
  credentialJson = JSON.parse(fs.readFileSync(credentialPath, 'utf8'));
} catch {
  hardStop('Blocked: credential file is not valid JSON.', 2);
}

const credentialProjectId = String(credentialJson.project_id || '');
const credentialEmail = String(credentialJson.client_email || '');
const projectIdMatch = credentialProjectId === expectedProjectId;
const serviceAccountDomainMatch = credentialEmail.endsWith(expectedEmailSuffix);

if (!projectIdMatch || !serviceAccountDomainMatch) {
  const report = {
    gate: 'cxorbia-firebase-dev-clean-state-read-only',
    generatedAt: new Date().toISOString(),
    decision: 'TARGET_MISMATCH_HARD_STOP',
    target: {
      expectedProjectId,
      projectIdMatch,
      serviceAccountDomainMatch
    },
    safeState: {
      providerCallsExecuted: false,
      authWrites: false,
      claimsWrites: false,
      firestoreWrites: false,
      storageWrites: false,
      functionWritesOrInvocations: false,
      rulesDeploy: false,
      hostingDeploy: false,
      imports: false,
      production: false
    }
  };
  const absoluteOut = path.join(root, outDir);
  fs.mkdirSync(absoluteOut, { recursive: true });
  fs.writeFileSync(path.join(absoluteOut, 'firebase-dev-clean-state-read-only-report.json'), JSON.stringify(report, null, 2), 'utf8');
  console.log(JSON.stringify(report, null, 2));
  process.exit(4);
}

function errorCategory(error) {
  const raw = String(error?.code || error?.response?.status || error?.status || error?.name || 'UNKNOWN');
  if (/403|permission|denied/i.test(raw)) return 'PERMISSION_DENIED';
  if (/404|not[-_ ]?found/i.test(raw)) return 'NOT_FOUND_OR_API_NOT_INITIALIZED';
  if (/401|unauth/i.test(raw)) return 'UNAUTHENTICATED';
  if (/429|quota/i.test(raw)) return 'QUOTA_OR_RATE_LIMIT';
  return raw.replace(/[^A-Z0-9_.-]/gi, '_').slice(0, 80) || 'UNKNOWN';
}

async function runCheck(id, fn) {
  try {
    const data = await fn();
    return { id, available: true, ...data };
  } catch (error) {
    return { id, available: false, errorCategory: errorCategory(error) };
  }
}

async function googleGetJson(authClient, url) {
  const tokenResult = await authClient.getAccessToken();
  const token = typeof tokenResult === 'string' ? tokenResult : tokenResult?.token;
  if (!token) throw Object.assign(new Error('access token unavailable'), { code: 'UNAUTHENTICATED' });
  const response = await fetch(url, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
  });
  if (!response.ok) {
    const error = new Error(`read-only request failed with status ${response.status}`);
    error.code = String(response.status);
    throw error;
  }
  return response.json();
}

async function main() {
  const [{ initializeApp, cert, deleteApp }, { getAuth }, { getFirestore }, { getStorage }, { GoogleAuth }] = await Promise.all([
    import('firebase-admin/app'),
    import('firebase-admin/auth'),
    import('firebase-admin/firestore'),
    import('firebase-admin/storage'),
    import('google-auth-library')
  ]);

  const app = initializeApp({
    credential: cert(credentialJson),
    projectId: expectedProjectId,
    storageBucket: expectedBucket
  }, `cxorbia-readonly-${Date.now()}`);

  const googleAuth = new GoogleAuth({
    credentials: credentialJson,
    projectId: expectedProjectId,
    scopes: [
      'https://www.googleapis.com/auth/cloud-platform.read-only',
      'https://www.googleapis.com/auth/cloud-platform',
      'https://www.googleapis.com/auth/identitytoolkit'
    ]
  });
  const authClient = await googleAuth.getClient();

  const checks = {};

  checks.authUsers = await runCheck('authUsers', async () => {
    const auth = getAuth(app);
    let totalCount = 0;
    let pageToken;
    do {
      const page = await auth.listUsers(1000, pageToken);
      totalCount += page.users.length;
      pageToken = page.pageToken;
      if (totalCount > 1000000) throw Object.assign(new Error('unexpected user volume'), { code: 'COUNT_LIMIT_EXCEEDED' });
    } while (pageToken);
    return { totalCount, empty: totalCount === 0 };
  });

  checks.authConfiguration = await runCheck('authConfiguration', async () => {
    const payload = await googleGetJson(authClient, `https://identitytoolkit.googleapis.com/admin/v2/projects/${encodeURIComponent(expectedProjectId)}/config`);
    return {
      emailPasswordEnabled: Boolean(payload?.signIn?.email?.enabled),
      anonymousEnabled: Boolean(payload?.signIn?.anonymous?.enabled),
      phoneEnabled: Boolean(payload?.signIn?.phoneNumber?.enabled)
    };
  });

  checks.firestoreRootCollections = await runCheck('firestoreRootCollections', async () => {
    const db = getFirestore(app);
    const collections = await db.listCollections();
    let anyDocumentDetected = false;
    for (const collection of collections) {
      const snapshot = await collection.limit(1).select().get();
      if (!snapshot.empty) {
        anyDocumentDetected = true;
        break;
      }
    }
    return {
      rootCollectionCount: collections.length,
      anyDocumentDetected,
      empty: collections.length === 0 && !anyDocumentDetected
    };
  });

  checks.firestoreDatabases = await runCheck('firestoreDatabases', async () => {
    const payload = await googleGetJson(authClient, `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(expectedProjectId)}/databases?pageSize=100`);
    return { databaseCount: Array.isArray(payload?.databases) ? payload.databases.length : 0 };
  });

  checks.storageObjects = await runCheck('storageObjects', async () => {
    const bucket = getStorage(app).bucket(expectedBucket);
    const [files] = await bucket.getFiles({ autoPaginate: false, maxResults: 1 });
    const anyObjectDetected = files.length > 0;
    return { anyObjectDetected, empty: !anyObjectDetected };
  });

  checks.cloudFunctions = await runCheck('cloudFunctions', async () => {
    const payload = await googleGetJson(authClient, `https://cloudfunctions.googleapis.com/v2/projects/${encodeURIComponent(expectedProjectId)}/locations/-/functions?pageSize=1`);
    const anyFunctionDetected = Array.isArray(payload?.functions) && payload.functions.length > 0;
    return { anyFunctionDetected, empty: !anyFunctionDetected };
  });

  checks.rulesReleases = await runCheck('rulesReleases', async () => {
    const payload = await googleGetJson(authClient, `https://firebaserules.googleapis.com/v1/projects/${encodeURIComponent(expectedProjectId)}/releases?pageSize=100`);
    return { releaseCount: Array.isArray(payload?.releases) ? payload.releases.length : 0 };
  });

  const mandatory = ['authUsers', 'firestoreRootCollections', 'storageObjects', 'cloudFunctions'];
  const unavailableMandatory = mandatory.filter(key => !checks[key]?.available);
  const nonEmptySignals = [];
  if (checks.authUsers?.available && checks.authUsers.totalCount > 0) nonEmptySignals.push('authUsers');
  if (checks.firestoreRootCollections?.available && (!checks.firestoreRootCollections.empty || checks.firestoreRootCollections.anyDocumentDetected)) nonEmptySignals.push('firestore');
  if (checks.storageObjects?.available && checks.storageObjects.anyObjectDetected) nonEmptySignals.push('storage');
  if (checks.cloudFunctions?.available && checks.cloudFunctions.anyFunctionDetected) nonEmptySignals.push('functions');

  let decision = 'CLEAN_STATE_VERIFIED_READ_ONLY';
  let exitCode = 0;
  if (nonEmptySignals.length) {
    decision = 'NONEMPTY_REVIEW_REQUIRED';
    exitCode = 2;
  } else if (unavailableMandatory.length) {
    decision = 'INCONCLUSIVE_PERMISSION_OR_API';
    exitCode = 3;
  }

  const report = {
    gate: 'cxorbia-firebase-dev-clean-state-read-only',
    generatedAt: new Date().toISOString(),
    decision,
    target: {
      expectedProjectId,
      expectedBucketConfigured: Boolean(expectedBucket),
      projectIdMatch,
      serviceAccountDomainMatch
    },
    checks,
    summary: {
      mandatoryChecks: mandatory.length,
      unavailableMandatoryCount: unavailableMandatory.length,
      nonEmptySignalCount: nonEmptySignals.length,
      allMandatoryAvailable: unavailableMandatory.length === 0,
      cleanStateConfirmed: decision === 'CLEAN_STATE_VERIFIED_READ_ONLY'
    },
    safeState: {
      providerCallsExecuted: true,
      authWrites: false,
      claimsWrites: false,
      firestoreDocumentFieldsRead: false,
      firestoreWrites: false,
      storageObjectNamesOutput: false,
      storageWrites: false,
      functionNamesOutput: false,
      functionWritesOrInvocations: false,
      rulesDeploy: false,
      hostingDeploy: false,
      imports: false,
      production: false,
      piiOutput: false,
      credentialsOutput: false
    }
  };

  const absoluteOut = path.join(root, outDir);
  fs.mkdirSync(absoluteOut, { recursive: true });
  fs.writeFileSync(path.join(absoluteOut, 'firebase-dev-clean-state-read-only-report.json'), JSON.stringify(report, null, 2), 'utf8');
  const md = [
    '# CXOrbia Firebase DEV clean-state read-only report',
    '',
    `Generated: ${report.generatedAt}`,
    `Decision: ${report.decision}`,
    `Project ID match: ${report.target.projectIdMatch}`,
    `Service-account domain match: ${report.target.serviceAccountDomainMatch}`,
    `Mandatory checks available: ${report.summary.allMandatoryAvailable}`,
    `Unavailable mandatory checks: ${report.summary.unavailableMandatoryCount}`,
    `Non-empty signals: ${report.summary.nonEmptySignalCount}`,
    `Clean state confirmed: ${report.summary.cleanStateConfirmed}`,
    '',
    '## Sanitized checks',
    ...Object.entries(checks).map(([key, value]) => {
      const safe = { ...value };
      return `- ${key}: ${JSON.stringify(safe)}`;
    }),
    '',
    '## Safe state',
    '- Provider reads executed only after manual confirmation',
    '- No users created or changed',
    '- No claims written',
    '- No Firestore document fields read',
    '- No Firestore or Storage writes/deletes',
    '- No function names output, writes or invocations',
    '- No rules or Hosting deploy',
    '- No imports or production access',
    '- No PII or credentials in report',
    ''
  ].join('\n');
  fs.writeFileSync(path.join(absoluteOut, 'firebase-dev-clean-state-read-only-report.md'), md, 'utf8');

  console.log(JSON.stringify(report, null, 2));
  await deleteApp(app).catch(() => {});
  process.exitCode = exitCode;
}

main().catch(error => {
  const report = {
    gate: 'cxorbia-firebase-dev-clean-state-read-only',
    generatedAt: new Date().toISOString(),
    decision: 'INCONCLUSIVE_PERMISSION_OR_API',
    fatalErrorCategory: errorCategory(error),
    safeState: {
      authWrites: false,
      claimsWrites: false,
      firestoreWrites: false,
      storageWrites: false,
      functionWritesOrInvocations: false,
      rulesDeploy: false,
      hostingDeploy: false,
      imports: false,
      production: false,
      piiOutput: false,
      credentialsOutput: false
    }
  };
  const absoluteOut = path.join(root, outDir);
  fs.mkdirSync(absoluteOut, { recursive: true });
  fs.writeFileSync(path.join(absoluteOut, 'firebase-dev-clean-state-read-only-report.json'), JSON.stringify(report, null, 2), 'utf8');
  console.log(JSON.stringify(report, null, 2));
  process.exitCode = 3;
});
