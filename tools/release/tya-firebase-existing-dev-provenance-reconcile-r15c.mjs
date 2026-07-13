#!/usr/bin/env node
/*
  CXOrbia Phase A R15C - existing Firebase DEV provenance reconciliation.

  Provider access is strictly read-only. The report contains only counts,
  booleans and categorized findings. It never persists user identifiers,
  document fields, collection names other than the expected allowlisted name,
  raw provider responses or credentials.
*/

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const REQUIRED_CONFIRMATION = 'RECONCILE_EXISTING_FIREBASE_DEV_READ_ONLY';
const DEFAULT_CONFIG = 'backend/config/phase-a-firebase-existing-dev-provenance-r15c.source-safe.json';
const args = process.argv.slice(2);
const configIdx = args.indexOf('--config');
const outIdx = args.indexOf('--out');
const configPath = configIdx >= 0 ? args[configIdx + 1] : DEFAULT_CONFIG;
const outDirArg = outIdx >= 0 ? args[outIdx + 1] : '.tmp/firebase-existing-dev-provenance-r15c';
const root = process.cwd();

function hardStop(message, code = 4) {
  console.error(message);
  process.exit(code);
}

function readJson(relativePath) {
  const absolute = path.join(root, relativePath);
  if (!fs.existsSync(absolute)) hardStop(`Blocked: missing JSON file ${relativePath}`, 2);
  return JSON.parse(fs.readFileSync(absolute, 'utf8'));
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
    const value = await fn();
    return { id, available: true, ...value };
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

function minimumSatisfied(actual, minimum) {
  return Number.isFinite(actual) && actual >= minimum;
}

async function main() {
  if (process.env.CXORBIA_CONFIRM !== REQUIRED_CONFIRMATION) {
    hardStop(`Blocked: CXORBIA_CONFIRM must equal ${REQUIRED_CONFIRMATION}`, 2);
  }

  const config = readJson(configPath);
  if (config.status !== 'authorized_read_only' || config.authorization?.providerReadAuthorized !== true) {
    hardStop('Blocked: R15C source-safe configuration is not authorized for provider reads.', 2);
  }

  const expectedProjectId = String(config.target?.projectId || '');
  const expectedBucket = String(config.target?.storageBucket || '');
  const expectedServiceAccountSuffix = String(config.target?.expectedServiceAccountEmailSuffix || '');
  const tenantId = String(config.target?.tenantId || '');
  const credentialPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!expectedProjectId || !expectedBucket || !expectedServiceAccountSuffix || !tenantId) {
    hardStop('Blocked: R15C target configuration is incomplete.', 2);
  }
  if (!credentialPath || !fs.existsSync(credentialPath)) {
    hardStop('Blocked: GOOGLE_APPLICATION_CREDENTIALS is missing or unreadable.', 2);
  }

  const credentialJson = JSON.parse(fs.readFileSync(credentialPath, 'utf8'));
  const projectIdMatch = String(credentialJson.project_id || '') === expectedProjectId;
  const serviceAccountDomainMatch = String(credentialJson.client_email || '').endsWith(expectedServiceAccountSuffix);

  const [{ initializeApp, cert, deleteApp }, { getAuth }, firestoreModule, { GoogleAuth }] = await Promise.all([
    import('firebase-admin/app'),
    import('firebase-admin/auth'),
    import('firebase-admin/firestore'),
    import('google-auth-library')
  ]);
  const { getFirestore, FieldPath } = firestoreModule;

  const app = initializeApp({
    credential: cert(credentialJson),
    projectId: expectedProjectId,
    storageBucket: expectedBucket
  }, `cxorbia-r15c-${Date.now()}`);

  const absoluteOut = path.join(root, outDirArg);
  fs.mkdirSync(absoluteOut, { recursive: true });

  if (!projectIdMatch || !serviceAccountDomainMatch) {
    const report = {
      gate: 'phase-a-firebase-existing-dev-provenance-r15c',
      generatedAt: new Date().toISOString(),
      decision: config.decisionPolicy.hardStopDecision,
      target: { projectIdMatch, serviceAccountDomainMatch },
      safeState: {
        providerCallsExecuted: false,
        authWrites: false,
        claimsWrites: false,
        firestoreWrites: false,
        rulesDeploy: false,
        hostingDeploy: false,
        imports: false,
        production: false,
        piiOutput: false,
        credentialsOutput: false
      }
    };
    fs.writeFileSync(path.join(absoluteOut, config.report.json), JSON.stringify(report, null, 2), 'utf8');
    console.log(JSON.stringify(report, null, 2));
    await deleteApp(app).catch(() => {});
    process.exitCode = 4;
    return;
  }

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
  const db = getFirestore(app);
  const checks = {};

  checks.authProvenance = await runCheck('authProvenance', async () => {
    const auth = getAuth(app);
    const knownSuffix = String(config.knownHistory.auth.knownEmailSuffix || '');
    const requiredClaimKeys = config.knownHistory.auth.requiredClaimKeys || [];
    const expectedTenantId = String(config.knownHistory.auth.expectedTenantId || '');
    let totalCount = 0;
    let knownFictitiousDomainCount = 0;
    let structurallyExpectedClaimsCount = 0;
    let expectedTenantClaimCount = 0;
    let disabledCount = 0;
    let pageToken;
    do {
      const page = await auth.listUsers(1000, pageToken);
      for (const user of page.users) {
        totalCount += 1;
        const email = String(user.email || '');
        const claims = user.customClaims && typeof user.customClaims === 'object' ? user.customClaims : {};
        if (knownSuffix && email.endsWith(knownSuffix)) knownFictitiousDomainCount += 1;
        if (requiredClaimKeys.every((key) => Object.prototype.hasOwnProperty.call(claims, key))) {
          structurallyExpectedClaimsCount += 1;
        }
        if (claims.tenantId === expectedTenantId) expectedTenantClaimCount += 1;
        if (user.disabled === true) disabledCount += 1;
      }
      pageToken = page.pageToken;
      if (totalCount > 1000000) throw Object.assign(new Error('unexpected user volume'), { code: 'COUNT_LIMIT_EXCEEDED' });
    } while (pageToken);
    return {
      totalCount,
      knownFictitiousDomainCount,
      structurallyExpectedClaimsCount,
      expectedTenantClaimCount,
      disabledCount,
      unclassifiedAggregateCount: Math.max(0, totalCount - knownFictitiousDomainCount),
      minimumKnownFictitiousUsersSatisfied: knownFictitiousDomainCount >= config.knownHistory.auth.minimumKnownFictitiousUsers
    };
  });

  checks.firestoreLineage = await runCheck('firestoreLineage', async () => {
    const rootCollections = await db.listCollections();
    const expectedRoot = String(config.knownHistory.firestore.expectedRootCollection || '');
    const expectedRootPresent = rootCollections.some((ref) => ref.id === expectedRoot);
    const unexpectedRootCollectionCount = rootCollections.filter((ref) => ref.id !== expectedRoot).length;

    const tenantQuery = db.collection(expectedRoot)
      .where(FieldPath.documentId(), '==', config.knownHistory.firestore.expectedTenantDocumentId)
      .select();
    const tenantSnapshot = await tenantQuery.get();
    const tenantDocumentExists = !tenantSnapshot.empty;

    const tenantRef = db.collection(expectedRoot).doc(tenantId);
    const collectionCounts = {};
    const minimumChecks = {};
    for (const [collectionName, minimum] of Object.entries(config.knownHistory.firestore.minimumCounts || {})) {
      const aggregate = await tenantRef.collection(collectionName).count().get();
      const count = Number(aggregate.data().count || 0);
      collectionCounts[collectionName] = count;
      minimumChecks[collectionName] = minimumSatisfied(count, Number(minimum));
    }

    const projectChecks = [];
    for (const item of config.knownHistory.firestore.knownProjects || []) {
      const projectQuery = tenantRef.collection('projects')
        .where(FieldPath.documentId(), '==', item.projectId)
        .select();
      const projectSnapshot = await projectQuery.get();
      const exists = !projectSnapshot.empty;
      const visitsAggregate = await tenantRef.collection('projects').doc(item.projectId).collection('visits').count().get();
      const visitCount = Number(visitsAggregate.data().count || 0);
      projectChecks.push({
        knownProjectSlot: true,
        exists,
        minimumVisits: Number(item.minimumVisits || 0),
        visitCount,
        minimumVisitsSatisfied: minimumSatisfied(visitCount, Number(item.minimumVisits || 0))
      });
    }

    return {
      rootCollectionCount: rootCollections.length,
      expectedRootPresent,
      unexpectedRootCollectionCount,
      tenantDocumentExists,
      collectionCounts,
      minimumChecks,
      projectChecks
    };
  });

  checks.rulesLineage = await runCheck('rulesLineage', async () => {
    const payload = await googleGetJson(authClient, `https://firebaserules.googleapis.com/v1/projects/${encodeURIComponent(expectedProjectId)}/releases?pageSize=100`);
    const releaseCount = Array.isArray(payload?.releases) ? payload.releases.length : 0;
    return {
      releaseCount,
      minimumReleaseCountSatisfied: releaseCount >= Number(config.knownHistory.rules.minimumReleaseCount || 1)
    };
  });

  const findings = [];
  const reviewItems = [];

  if (!checks.authProvenance.available) findings.push('auth_provenance_unavailable');
  if (checks.authProvenance.available && !checks.authProvenance.minimumKnownFictitiousUsersSatisfied) findings.push('known_dev_auth_lineage_below_minimum');
  if (checks.authProvenance.available && checks.authProvenance.unclassifiedAggregateCount > 0) reviewItems.push('auth_users_above_documented_minimum_require_aggregate_review');

  if (!checks.firestoreLineage.available) findings.push('firestore_lineage_unavailable');
  if (checks.firestoreLineage.available) {
    if (!checks.firestoreLineage.expectedRootPresent) findings.push('expected_tenants_root_missing');
    if (checks.firestoreLineage.unexpectedRootCollectionCount > 0) findings.push('unexpected_root_collections_detected');
    if (!checks.firestoreLineage.tenantDocumentExists) findings.push('tenant_tya_document_missing');
    for (const [collectionName, satisfied] of Object.entries(checks.firestoreLineage.minimumChecks || {})) {
      if (!satisfied) findings.push(`known_minimum_not_met:${collectionName}`);
    }
    if ((checks.firestoreLineage.projectChecks || []).some((item) => !item.exists || !item.minimumVisitsSatisfied)) {
      findings.push('known_project_lineage_not_fully_matched');
    }
  }

  if (!checks.rulesLineage.available) findings.push('rules_lineage_unavailable');
  if (checks.rulesLineage.available && !checks.rulesLineage.minimumReleaseCountSatisfied) findings.push('rules_release_lineage_below_minimum');

  const lineageMatched = findings.length === 0;
  const decision = lineageMatched
    ? config.decisionPolicy.passWithReviewDecision
    : config.decisionPolicy.reviewDecision;

  const report = {
    gate: 'phase-a-firebase-existing-dev-provenance-r15c',
    generatedAt: new Date().toISOString(),
    decision,
    target: {
      projectIdMatch,
      serviceAccountDomainMatch,
      environment: config.target.environment,
      tenantId
    },
    checks,
    summary: {
      lineageMatched,
      blockingFindingCount: findings.length,
      reviewItemCount: reviewItems.length,
      findings,
      reviewItems,
      readOnlyCxDataGateEligible: lineageMatched && config.decisionPolicy.allowReadOnlyCxDataAfterPassWithReview === true
    },
    safeState: {
      providerCallsExecuted: true,
      userIdentifiersPersisted: false,
      userEmailsPersisted: false,
      firestoreDocumentFieldsPersisted: false,
      rawProviderResponsesPersisted: false,
      authWrites: false,
      claimsWrites: false,
      firestoreWrites: false,
      storageWrites: false,
      rulesDeploy: false,
      hostingDeploy: false,
      imports: false,
      production: false,
      piiOutput: false,
      credentialsOutput: false
    }
  };

  fs.writeFileSync(path.join(absoluteOut, config.report.json), JSON.stringify(report, null, 2), 'utf8');
  const markdown = [
    '# CXOrbia R15C - Firebase DEV provenance reconciliation',
    '',
    `Generated: ${report.generatedAt}`,
    `Decision: ${report.decision}`,
    `Lineage matched: ${report.summary.lineageMatched}`,
    `Read-only CX.data gate eligible: ${report.summary.readOnlyCxDataGateEligible}`,
    `Blocking findings: ${report.summary.blockingFindingCount}`,
    `Review items: ${report.summary.reviewItemCount}`,
    '',
    '## Sanitized checks',
    `- Auth: ${JSON.stringify(report.checks.authProvenance)}`,
    `- Firestore: ${JSON.stringify(report.checks.firestoreLineage)}`,
    `- Rules: ${JSON.stringify(report.checks.rulesLineage)}`,
    '',
    '## Safe state',
    '- Read-only provider calls only',
    '- No user identifiers or email addresses persisted',
    '- No Firestore document fields persisted',
    '- No Auth, claims, Firestore or Storage writes',
    '- No rules or Hosting deploy',
    '- No import and no production access',
    ''
  ].join('\n');
  fs.writeFileSync(path.join(absoluteOut, config.report.markdown), markdown, 'utf8');

  console.log(JSON.stringify(report, null, 2));
  await deleteApp(app).catch(() => {});
  process.exitCode = lineageMatched ? 0 : 2;
}

main().catch((error) => {
  console.error(`R15C failed safely: ${errorCategory(error)}`);
  process.exitCode = 3;
});
