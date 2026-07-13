#!/usr/bin/env node
/*
  CXOrbia Phase A R15 — create and verify a brand-new empty Firebase DEV project.

  Explicit authorization scope:
  - create one new DEV-only Google Cloud/Firebase project;
  - add Firebase to that new project;
  - verify the baseline through sanitized provider reads;
  - no billing link, Auth/Firestore/Storage initialization, data import, deploy,
    Hosting, Functions, rules deployment, production access or deletion.

  Safety:
  - the target project ID must not exist before the run;
  - an existing or inaccessible target is never reused;
  - output contains counts, booleans and coarse error categories only;
  - credentials, IAM principals, document fields and object names are never output.
*/
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const REQUIRED_CONFIRMATION = 'CREATE_NEW_EMPTY_FIREBASE_DEV';
const args = process.argv.slice(2);
function arg(name, fallback) {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : fallback;
}

const outDir = arg('--out', '.tmp/firebase-new-empty-r15');
const targetProjectId = String(process.env.CXORBIA_NEW_PROJECT_ID || '').trim();
const targetDisplayName = String(process.env.CXORBIA_NEW_PROJECT_NAME || 'CXOrbia TyA DEV Clean R15A').trim();
const sourceCredentialProjectId = String(process.env.CXORBIA_SOURCE_CREDENTIAL_PROJECT_ID || 'cxorbia-backend-dev').trim();
const credentialPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const root = process.cwd();

function safeCategory(error) {
  const raw = String(
    error?.category || error?.code || error?.status || error?.response?.status ||
    error?.name || error?.message || 'UNKNOWN'
  );
  if (/already.exists|409/i.test(raw)) return 'ALREADY_EXISTS';
  if (/403|permission|denied|forbidden/i.test(raw)) return 'PERMISSION_DENIED';
  if (/401|unauth/i.test(raw)) return 'UNAUTHENTICATED';
  if (/404|not.found/i.test(raw)) return 'NOT_FOUND';
  if (/429|quota|rate/i.test(raw)) return 'QUOTA_OR_RATE_LIMIT';
  if (/billing/i.test(raw)) return 'BILLING_REQUIRED_OR_RESTRICTED';
  if (/organization|folder|parent/i.test(raw)) return 'RESOURCE_HIERARCHY_RESTRICTION';
  if (/timeout/i.test(raw)) return 'TIMEOUT';
  return raw.replace(/[^A-Z0-9_.-]/gi, '_').slice(0, 100) || 'UNKNOWN';
}

function validateTargetId(value) {
  return /^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(value) && !/--/.test(value);
}

function writeReport(report) {
  const absolute = path.join(root, outDir);
  fs.mkdirSync(absolute, { recursive: true });
  fs.writeFileSync(
    path.join(absolute, 'firebase-new-empty-r15-report.source-safe.json'),
    JSON.stringify(report, null, 2) + '\n',
    'utf8'
  );
  const checks = report.checks || {};
  const md = [
    '# CXOrbia Phase A R15 — Firebase DEV nuevo y vacío',
    '',
    `Generated: ${report.generatedAt}`,
    `Decision: **${report.decision}**`,
    `Target project: \`${report.target?.projectId || 'not-set'}\``,
    `Project created in this run: ${Boolean(report.summary?.projectCreated)}`,
    `Firebase added in this run: ${Boolean(report.summary?.firebaseAdded)}`,
    `Empty baseline verified: ${Boolean(report.summary?.emptyBaselineVerified)}`,
    '',
    '## Sanitized checks',
    ...Object.entries(checks).map(([key, value]) => `- ${key}: ${JSON.stringify(value)}`),
    '',
    '## Safe state',
    `- Provider write attempted only for project creation/Firebase addition: ${Boolean(report.safeState?.authorizedProviderWriteAttempted)}`,
    `- Billing link attempted: ${Boolean(report.safeState?.billingLinkAttempted)}`,
    `- Auth initialization or user writes: ${Boolean(report.safeState?.authWrites)}`,
    `- Firestore initialization or document writes: ${Boolean(report.safeState?.firestoreWrites)}`,
    `- Storage bucket creation or object writes: ${Boolean(report.safeState?.storageWrites)}`,
    `- Rules/Functions/Hosting deploy: ${Boolean(report.safeState?.deploy)}`,
    `- Imports: ${Boolean(report.safeState?.imports)}`,
    `- Production: ${Boolean(report.safeState?.production)}`,
    `- PII/credentials in output: ${Boolean(report.safeState?.piiOrCredentialsOutput)}`,
    ''
  ].join('\n');
  fs.writeFileSync(path.join(absolute, 'firebase-new-empty-r15-report.source-safe.md'), md, 'utf8');
  console.log(JSON.stringify({
    decision: report.decision,
    target: report.target,
    summary: report.summary,
    safeState: report.safeState
  }, null, 2));
}

function baseReport() {
  return {
    schemaVersion: '1.0.0',
    gate: 'cxorbia-phase-a-create-new-empty-firebase-dev-r15',
    generatedAt: new Date().toISOString(),
    authorization: {
      explicitAuthorizationRecorded: process.env.CXORBIA_CONFIRM === REQUIRED_CONFIRMATION,
      scope: 'create_new_empty_firebase_dev_and_sanitized_verify_only'
    },
    target: {
      projectId: targetProjectId,
      displayName: targetDisplayName,
      environment: 'DEV',
      production: false
    },
    sourceCredential: {
      credentialProjectExpected: sourceCredentialProjectId,
      credentialTypeValid: false,
      credentialProjectMatch: false,
      serviceAccountDomainMatch: false,
      identifierOutput: false
    },
    checks: {},
    summary: {
      targetAbsenceVerifiedBeforeCreate: false,
      projectCreateAttempted: false,
      projectCreated: false,
      firebaseAddAttempted: false,
      firebaseAdded: false,
      projectActive: false,
      emptyBaselineVerified: false,
      appCount: null,
      authUserCount: null,
      firestoreDatabaseCount: null,
      storageBucketCount: null,
      hostingSiteCount: null
    },
    safeState: {
      authorizedProviderWriteAttempted: false,
      onlyAuthorizedProviderWrites: true,
      projectDeletionAttempted: false,
      billingLinkAttempted: false,
      authWrites: false,
      claimsWrites: false,
      firestoreWrites: false,
      storageWrites: false,
      rulesDeploy: false,
      functionsDeployOrInvocation: false,
      hostingDeploy: false,
      deploy: false,
      imports: false,
      dataMigration: false,
      production: false,
      piiOrCredentialsOutput: false,
      credentialPersisted: false
    }
  };
}

async function main() {
  const report = baseReport();

  if (process.env.CXORBIA_CONFIRM !== REQUIRED_CONFIRMATION) {
    report.decision = 'BLOCKED_MISSING_EXPLICIT_AUTHORIZATION';
    writeReport(report);
    return;
  }
  if (!validateTargetId(targetProjectId)) {
    report.decision = 'BLOCKED_INVALID_TARGET_PROJECT_ID';
    writeReport(report);
    return;
  }
  if (!credentialPath || !fs.existsSync(credentialPath)) {
    report.decision = 'BLOCKED_MISSING_TEMPORARY_CREDENTIAL';
    writeReport(report);
    return;
  }

  let credentialJson;
  try {
    credentialJson = JSON.parse(fs.readFileSync(credentialPath, 'utf8'));
  } catch {
    report.decision = 'BLOCKED_INVALID_CREDENTIAL_JSON';
    writeReport(report);
    return;
  }

  const credentialProject = String(credentialJson.project_id || '');
  const credentialEmail = String(credentialJson.client_email || '');
  report.sourceCredential.credentialTypeValid = credentialJson.type === 'service_account';
  report.sourceCredential.credentialProjectMatch = credentialProject === sourceCredentialProjectId;
  report.sourceCredential.serviceAccountDomainMatch = credentialEmail.endsWith(`@${sourceCredentialProjectId}.iam.gserviceaccount.com`);
  if (!report.sourceCredential.credentialTypeValid || !report.sourceCredential.credentialProjectMatch || !report.sourceCredential.serviceAccountDomainMatch) {
    report.decision = 'BLOCKED_SOURCE_CREDENTIAL_MISMATCH';
    writeReport(report);
    return;
  }

  const { GoogleAuth } = await import('google-auth-library');
  const googleAuth = new GoogleAuth({
    credentials: credentialJson,
    scopes: ['https://www.googleapis.com/auth/cloud-platform']
  });
  const authClient = await googleAuth.getClient();

  async function token() {
    const result = await authClient.getAccessToken();
    const value = typeof result === 'string' ? result : result?.token;
    if (!value) throw Object.assign(new Error('access token unavailable'), { category: 'UNAUTHENTICATED' });
    return value;
  }

  async function request(method, url, body) {
    const accessToken = await token();
    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' })
      },
      body: body === undefined ? undefined : JSON.stringify(body)
    });
    let payload = null;
    const text = await response.text();
    if (text) {
      try { payload = JSON.parse(text); } catch { payload = null; }
    }
    return { status: response.status, ok: response.ok, payload };
  }

  async function pollOperation(baseUrl, operationName, maxAttempts = 90) {
    if (!operationName) return { done: true, response: null };
    const url = `${baseUrl}/${String(operationName).replace(/^\//, '')}`;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const result = await request('GET', url);
      if (!result.ok) {
        const err = new Error(`operation poll failed ${result.status}`);
        err.category = String(result.status);
        throw err;
      }
      if (result.payload?.done) {
        if (result.payload?.error) {
          const err = new Error('operation completed with provider error');
          err.category = String(result.payload.error?.code || result.payload.error?.status || 'OPERATION_ERROR');
          throw err;
        }
        return result.payload;
      }
      await new Promise(resolve => setTimeout(resolve, 4000));
    }
    const err = new Error('operation timeout');
    err.category = 'TIMEOUT';
    throw err;
  }

  // Read the known DEV project only to inherit its organization/folder parent.
  let parent = null;
  try {
    const source = await request('GET', `https://cloudresourcemanager.googleapis.com/v1/projects/${encodeURIComponent(sourceCredentialProjectId)}`);
    if (source.ok && source.payload?.parent?.type && source.payload?.parent?.id) {
      parent = { type: String(source.payload.parent.type), id: String(source.payload.parent.id) };
    }
    report.checks.sourceParentDiscovery = {
      available: source.ok,
      parentTypePresent: Boolean(parent?.type),
      parentIdOutput: false,
      errorCategory: source.ok ? null : safeCategory({ status: source.status })
    };
  } catch (error) {
    report.checks.sourceParentDiscovery = {
      available: false,
      parentTypePresent: false,
      parentIdOutput: false,
      errorCategory: safeCategory(error)
    };
  }

  // Hard stop if target already exists or its absence cannot be proven.
  try {
    const existing = await request('GET', `https://cloudresourcemanager.googleapis.com/v1/projects/${encodeURIComponent(targetProjectId)}`);
    if (existing.status === 404) {
      report.summary.targetAbsenceVerifiedBeforeCreate = true;
      report.checks.targetPreexistence = { available: true, absent: true, statusCategory: 'NOT_FOUND' };
    } else if (existing.ok) {
      report.checks.targetPreexistence = { available: true, absent: false, statusCategory: 'EXISTS' };
      report.decision = 'BLOCKED_TARGET_PROJECT_ALREADY_EXISTS_DO_NOT_REUSE';
      writeReport(report);
      return;
    } else {
      report.checks.targetPreexistence = { available: false, absent: false, statusCategory: safeCategory({ status: existing.status }) };
      report.decision = 'BLOCKED_TARGET_PROJECT_EXISTENCE_UNVERIFIED';
      writeReport(report);
      return;
    }
  } catch (error) {
    report.checks.targetPreexistence = { available: false, absent: false, statusCategory: safeCategory(error) };
    report.decision = 'BLOCKED_TARGET_PROJECT_EXISTENCE_UNVERIFIED';
    writeReport(report);
    return;
  }

  // Authorized provider write 1: create the new DEV project.
  try {
    report.summary.projectCreateAttempted = true;
    report.safeState.authorizedProviderWriteAttempted = true;
    const createBody = {
      projectId: targetProjectId,
      name: targetDisplayName,
      ...(parent ? { parent } : {})
    };
    const created = await request('POST', 'https://cloudresourcemanager.googleapis.com/v1/projects', createBody);
    if (!created.ok) {
      const err = new Error(`project create failed ${created.status}`);
      err.category = String(created.payload?.error?.status || created.payload?.error?.code || created.status);
      throw err;
    }
    await pollOperation('https://cloudresourcemanager.googleapis.com/v1', created.payload?.name);
    report.summary.projectCreated = true;
    report.checks.projectCreation = { attempted: true, succeeded: true, errorCategory: null };
  } catch (error) {
    report.checks.projectCreation = { attempted: true, succeeded: false, errorCategory: safeCategory(error) };
    report.decision = 'BLOCKED_PROJECT_CREATION_PERMISSION_OR_POLICY';
    writeReport(report);
    return;
  }

  // Authorized provider write 2: add Firebase to the newly created project.
  try {
    report.summary.firebaseAddAttempted = true;
    const add = await request('POST', `https://firebase.googleapis.com/v1beta1/projects/${encodeURIComponent(targetProjectId)}:addFirebase`, {});
    if (!add.ok) {
      const err = new Error(`add firebase failed ${add.status}`);
      err.category = String(add.payload?.error?.status || add.payload?.error?.code || add.status);
      throw err;
    }
    await pollOperation('https://firebase.googleapis.com/v1beta1', add.payload?.name);
    report.summary.firebaseAdded = true;
    report.checks.firebaseAddition = { attempted: true, succeeded: true, errorCategory: null };
  } catch (error) {
    report.checks.firebaseAddition = { attempted: true, succeeded: false, errorCategory: safeCategory(error) };
    report.decision = 'PROJECT_CREATED_FIREBASE_ADDITION_BLOCKED_REVIEW_REQUIRED';
    writeReport(report);
    return;
  }

  async function sanitizedCheck(id, fn) {
    try {
      return { id, available: true, ...(await fn()) };
    } catch (error) {
      return { id, available: false, errorCategory: safeCategory(error) };
    }
  }

  report.checks.projectState = await sanitizedCheck('projectState', async () => {
    const result = await request('GET', `https://cloudresourcemanager.googleapis.com/v1/projects/${encodeURIComponent(targetProjectId)}`);
    if (!result.ok) throw Object.assign(new Error('project state unavailable'), { category: String(result.status) });
    const active = result.payload?.lifecycleState === 'ACTIVE';
    report.summary.projectActive = active;
    return { active, lifecycleStateCategory: active ? 'ACTIVE' : 'NON_ACTIVE', projectNumberOutput: false };
  });

  report.checks.firebaseProject = await sanitizedCheck('firebaseProject', async () => {
    const result = await request('GET', `https://firebase.googleapis.com/v1beta1/projects/${encodeURIComponent(targetProjectId)}`);
    if (!result.ok) throw Object.assign(new Error('firebase project unavailable'), { category: String(result.status) });
    return { availableAsFirebaseProject: Boolean(result.payload?.projectId), identifiersOutput: false };
  });

  let appCount = 0;
  const appTypes = [
    ['androidApps', 'androidApps'],
    ['iosApps', 'iosApps'],
    ['webApps', 'webApps']
  ];
  for (const [id, endpoint] of appTypes) {
    report.checks[id] = await sanitizedCheck(id, async () => {
      const result = await request('GET', `https://firebase.googleapis.com/v1beta1/projects/${encodeURIComponent(targetProjectId)}/${endpoint}?pageSize=100`);
      if (!result.ok) throw Object.assign(new Error('app inventory unavailable'), { category: String(result.status) });
      const items = Array.isArray(result.payload?.[endpoint]) ? result.payload[endpoint] : [];
      appCount += items.length;
      return { count: items.length, empty: items.length === 0, identifiersOutput: false };
    });
  }
  report.summary.appCount = appCount;

  report.checks.authUsers = await sanitizedCheck('authUsers', async () => {
    const result = await request(
      'POST',
      `https://identitytoolkit.googleapis.com/v1/projects/${encodeURIComponent(targetProjectId)}/accounts:query`,
      { returnUserInfo: false, maxResults: 1 }
    );
    if (result.status === 403 || result.status === 404) {
      report.summary.authUserCount = 0;
      return { count: 0, empty: true, state: 'NOT_INITIALIZED_OR_API_DISABLED', identifiersOutput: false };
    }
    if (!result.ok) throw Object.assign(new Error('auth inventory unavailable'), { category: String(result.status) });
    const count = Array.isArray(result.payload?.userInfo) ? result.payload.userInfo.length : 0;
    report.summary.authUserCount = count;
    return { count, empty: count === 0, state: 'AVAILABLE', identifiersOutput: false };
  });

  report.checks.firestoreDatabases = await sanitizedCheck('firestoreDatabases', async () => {
    const result = await request('GET', `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(targetProjectId)}/databases?pageSize=100`);
    if (result.status === 403 || result.status === 404) {
      report.summary.firestoreDatabaseCount = 0;
      return { count: 0, empty: true, state: 'NOT_INITIALIZED_OR_API_DISABLED', identifiersOutput: false };
    }
    if (!result.ok) throw Object.assign(new Error('firestore inventory unavailable'), { category: String(result.status) });
    const count = Array.isArray(result.payload?.databases) ? result.payload.databases.length : 0;
    report.summary.firestoreDatabaseCount = count;
    return { count, empty: count === 0, state: 'AVAILABLE', identifiersOutput: false };
  });

  report.checks.storageBuckets = await sanitizedCheck('storageBuckets', async () => {
    const result = await request('GET', `https://storage.googleapis.com/storage/v1/b?project=${encodeURIComponent(targetProjectId)}&maxResults=100`);
    if (result.status === 403 || result.status === 404) {
      report.summary.storageBucketCount = 0;
      return { count: 0, empty: true, state: 'NOT_INITIALIZED_OR_API_DISABLED', identifiersOutput: false };
    }
    if (!result.ok) throw Object.assign(new Error('storage inventory unavailable'), { category: String(result.status) });
    const count = Array.isArray(result.payload?.items) ? result.payload.items.length : 0;
    report.summary.storageBucketCount = count;
    return { count, empty: count === 0, state: 'AVAILABLE', identifiersOutput: false };
  });

  report.checks.hostingSites = await sanitizedCheck('hostingSites', async () => {
    const result = await request('GET', `https://firebasehosting.googleapis.com/v1beta1/projects/${encodeURIComponent(targetProjectId)}/sites?pageSize=100`);
    if (result.status === 403 || result.status === 404) {
      report.summary.hostingSiteCount = 0;
      return { count: 0, empty: true, state: 'NOT_INITIALIZED_OR_API_DISABLED', identifiersOutput: false };
    }
    if (!result.ok) throw Object.assign(new Error('hosting inventory unavailable'), { category: String(result.status) });
    const count = Array.isArray(result.payload?.sites) ? result.payload.sites.length : 0;
    report.summary.hostingSiteCount = count;
    return { count, empty: count === 0, state: 'AVAILABLE', identifiersOutput: false };
  });

  const directZeroOrNotInitialized = [
    report.summary.appCount,
    report.summary.authUserCount,
    report.summary.firestoreDatabaseCount,
    report.summary.storageBucketCount,
    report.summary.hostingSiteCount
  ].every(value => value === 0);
  const mandatoryAvailableOrNotInitialized = [
    'projectState', 'firebaseProject', 'androidApps', 'iosApps', 'webApps',
    'authUsers', 'firestoreDatabases', 'storageBuckets', 'hostingSites'
  ].every(key => report.checks[key]?.available === true);

  report.summary.emptyBaselineVerified = Boolean(
    report.summary.targetAbsenceVerifiedBeforeCreate &&
    report.summary.projectCreated &&
    report.summary.firebaseAdded &&
    report.summary.projectActive &&
    directZeroOrNotInitialized &&
    mandatoryAvailableOrNotInitialized
  );

  report.decision = report.summary.emptyBaselineVerified
    ? 'NEW_EMPTY_FIREBASE_DEV_VERIFIED'
    : 'NEW_FIREBASE_DEV_CREATED_VERIFICATION_INCONCLUSIVE_REVIEW_REQUIRED';

  writeReport(report);
}

main().catch(error => {
  const report = baseReport();
  report.decision = 'UNEXPECTED_RUNNER_FAILURE_REVIEW_REQUIRED';
  report.checks.runner = { available: false, errorCategory: safeCategory(error) };
  writeReport(report);
});
