#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { initializeApp, getApps, applicationDefault } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import {
  LEGAL_PUBLICATION_GATE,
  LEGAL_PUBLICATION_COMMAND_TYPE,
  createLegalPublicationProvider
} from '../../backend/runtime/cxorbia-legal-publication-provider-v1.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '../..');
const argv = process.argv.slice(2);
const arg = (name, fallback = null) => {
  const i = argv.indexOf(name);
  return i >= 0 ? argv[i + 1] : fallback;
};
const requestPath = path.resolve(repo, arg('--request', 'backend/requests/i3-legal-v04-materialization-dev.json'));
const outPath = path.resolve(repo, arg('--out', '.tmp/i3-legal-v04-materialization-dev/result.json'));
const templatePath = path.resolve(repo, 'app/docs/CANDIDATA-LEGAL-TYA-V0.4-INTERIM-GOLIVE-COUNSEL-DEFERRED-20260816.md');
const contractPath = path.resolve(repo, 'backend/contracts/cxorbia-legal-v04-interim-materialization-v1.json');
const stableJson = value => JSON.stringify(value, null, 2) + '\n';
const sha256 = value => crypto.createHash('sha256').update(String(value), 'utf8').digest('hex');
const str = value => String(value == null ? '' : value).trim();
const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const currentHead = () => execFileSync('git', ['rev-parse', 'HEAD'], { cwd: repo, encoding: 'utf8' }).trim();

const result = {
  schemaVersion: 'cxorbia.i3.legal-v04-materialization-result.v1',
  requestId: null,
  sourceHeadSha: null,
  targetProject: null,
  targetTenant: null,
  status: 'NOT_STARTED',
  providerAttempted: false,
  providerAck: false,
  committed: false,
  readbackReady: false,
  legalContentId: null,
  legalVersion: null,
  contentDigest: null,
  firestoreWrites: 0,
  legalProfileWrites: 0,
  legalProviderWrites: 0,
  legalContentWrites: 0,
  legalAcceptanceWrites: 0,
  authWrites: 0,
  passwordResets: 0,
  historicalCredentialAccess: 0,
  historicalReconciliationWrites: 0,
  hrWrites: 0,
  rulesWrites: 0,
  storageWrites: 0,
  makeWrites: 0,
  geminiCalls: 0,
  paymentWrites: 0,
  deploys: 0,
  automaticAcceptance: false,
  humanAcceptanceRequired: true,
  production: false,
  merge: false,
  blockers: []
};

const block = code => {
  if (!result.blockers.includes(code)) result.blockers.push(code);
};
const assert = (condition, code) => { if (!condition) block(code); };
const writeResult = () => {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, stableJson(result), 'utf8');
};

try {
  const request = readJson(requestPath);
  const contract = readJson(contractPath);
  result.requestId = str(request.requestId) || null;
  result.sourceHeadSha = str(request.sourceHeadSha) || null;
  result.targetProject = str(request.targetProject) || null;
  result.targetTenant = str(request.tenantId) || null;

  assert(request.schemaVersion === 'cxorbia.i3.legal-v04-materialization-request.v1', 'REQUEST_SCHEMA_INVALID');
  assert(Boolean(result.requestId), 'REQUEST_ID_REQUIRED');
  assert(request.enabled === true, 'REQUEST_NOT_ENABLED');
  assert(request.consumed === false, 'REQUEST_ALREADY_CONSUMED');
  assert(request.authorizationGate === LEGAL_PUBLICATION_GATE, 'AUTHORIZATION_GATE_MISMATCH');
  assert(result.targetProject === contract.target.projectId && result.targetProject === 'cxorbia-backend-dev', 'TARGET_PROJECT_MISMATCH');
  assert(result.targetTenant === contract.target.tenantId && result.targetTenant === 'tya', 'TARGET_TENANT_MISMATCH');
  assert(result.sourceHeadSha === currentHead(), 'SOURCE_HEAD_MISMATCH');
  assert(request.commandType === LEGAL_PUBLICATION_COMMAND_TYPE, 'COMMAND_TYPE_MISMATCH');
  assert(request.expectedWriteBudget?.firestoreWrites === 4, 'REQUEST_WRITE_BUDGET_INVALID');
  assert(request.expectedWriteBudget?.legalAcceptanceWrites === 0, 'REQUEST_ACCEPTANCE_BUDGET_INVALID');
  assert(request.expectedWriteBudget?.authWrites === 0, 'REQUEST_AUTH_BUDGET_INVALID');
  assert(request.expectedWriteBudget?.passwordResets === 0, 'REQUEST_RESET_BUDGET_INVALID');
  assert(request.expectedWriteBudget?.historicalCredentialAccess === 0, 'REQUEST_HISTORICAL_ACCESS_BUDGET_INVALID');
  assert(request.expectedWriteBudget?.historicalReconciliationWrites === 0, 'REQUEST_HISTORICAL_RECONCILE_BUDGET_INVALID');

  const profile = request.initialPublicProfile || {};
  assert(str(profile.tenantId) === 'tya', 'PROFILE_TENANT_INVALID');
  assert(Boolean(str(profile.operator?.legalDisplayName)), 'PROFILE_OPERATOR_NAME_REQUIRED');
  assert(Boolean(str(profile.operator?.taxId)), 'PROFILE_TAX_ID_REQUIRED');
  assert(profile.operator?.registeredLegalDomicileRestricted === undefined, 'RESTRICTED_DOMICILE_MUST_NOT_TRANSIT_REQUEST');
  assert(Boolean(str(profile.contacts?.legal)), 'PROFILE_LEGAL_CONTACT_REQUIRED');
  assert(Boolean(str(profile.platformBrandProfile?.displayName)), 'PLATFORM_DISPLAY_NAME_REQUIRED');
  assert(str(profile.platformBrandProfile?.legalGenericReference).toLowerCase() === 'la plataforma', 'PLATFORM_GENERIC_REFERENCE_INVALID');

  if (result.blockers.length) {
    result.status = 'BLOCKED_PRE_PROVIDER';
    writeResult();
    process.exit(2);
  }

  const rawTemplate = fs.readFileSync(templatePath, 'utf8').replace(/\r\n?/g, '\n');
  const startMarker = '# ACUERDO DE USO DE PLATAFORMA, CONFIDENCIALIDAD, PROTECCIÓN DE INFORMACIÓN, PROPIEDAD INTELECTUAL Y TRATAMIENTO DE DATOS';
  const endMarker = '# CONDICIONES TÉCNICAS PARA PUBLICACIÓN INTERINA';
  const start = rawTemplate.indexOf(startMarker);
  const end = rawTemplate.indexOf(endMarker);
  assert(start >= 0 && end > start, 'LEGAL_TEMPLATE_BOUNDARY_INVALID');
  let renderedContent = rawTemplate.slice(start, end).trimEnd() + '\n';
  renderedContent = renderedContent
    .replaceAll('{{tenant.operator.legalDisplayName}}', str(profile.operator.legalDisplayName))
    .replaceAll('{{platform.displayName}}', str(profile.platformBrandProfile.displayName));
  assert(!renderedContent.includes('{{') && !renderedContent.includes('}}'), 'LEGAL_TEMPLATE_UNRESOLVED_PLACEHOLDER');
  assert(!/LEGAL_REVIEW_REQUIRED/.test(renderedContent), 'LEGAL_TEMPLATE_INTERNAL_MARKER_FORBIDDEN');
  if (result.blockers.length) {
    result.status = 'BLOCKED_PRE_PROVIDER';
    writeResult();
    process.exit(2);
  }

  const digest = sha256(renderedContent);
  result.legalContentId = contract.target.legalContentId;
  result.legalVersion = contract.target.legalVersion;
  result.contentDigest = digest;

  const publication = {
    legalContentId: contract.target.legalContentId,
    legalVersion: contract.target.legalVersion,
    templateId: 'tya-legal-v04-interim-golive',
    templateVersion: '20260816-v0.4',
    scopeMode: 'tenant',
    roleApplicability: ['admin', 'operaciones', 'coordinador', 'shopper', 'cliente', 'superadmin'],
    renderedContent,
    renderedContentEncoding: 'UTF-8',
    renderedContentLineEndings: 'LF',
    contentDigest: digest,
    counselReviewed: false,
    counselStatus: 'deferred_post_golive',
    interimGoLive: true,
    resolvedPublicSections: {
      operator: {
        legalDisplayName: str(profile.operator.legalDisplayName),
        taxId: str(profile.operator.taxId),
        countryOfEstablishment: str(profile.operator.countryOfEstablishment),
        operatingCountries: Array.isArray(profile.operator.operatingCountries) ? profile.operator.operatingCountries : [],
        publicLegalAddressMode: str(profile.operator.publicLegalAddressMode),
        publicLegalAddress: str(profile.operator.publicLegalAddress)
      },
      contacts: {
        legal: str(profile.contacts?.legal),
        privacy: str(profile.contacts?.privacy),
        securityIncidents: str(profile.contacts?.securityIncidents)
      },
      platformBrandProfile: {
        displayName: str(profile.platformBrandProfile?.displayName),
        legalGenericReference: str(profile.platformBrandProfile?.legalGenericReference),
        registrationStatus: str(profile.platformBrandProfile?.registrationStatus)
      },
      activeProviders: [{
        providerKey: str(request.coreProvider?.providerKey),
        displayName: str(request.coreProvider?.displayName),
        purpose: str(request.coreProvider?.purpose)
      }]
    }
  };

  const command = {
    commandType: LEGAL_PUBLICATION_COMMAND_TYPE,
    entityType: 'legalPublication',
    entityId: null,
    tenantId: 'tya',
    projectId: '',
    payload: {
      scopeMode: 'tenant',
      expectedProfileRevision: 'absent',
      tenantLegalProfile: profile,
      coreProvider: request.coreProvider,
      publication
    }
  };

  const gate = {
    enabled: true,
    consumed: false,
    providerWriteAuthorized: true,
    targetProject: 'cxorbia-backend-dev',
    commandType: LEGAL_PUBLICATION_COMMAND_TYPE,
    allowedExecutions: 1,
    firestoreWrites: 4,
    legalProfileWrites: 1,
    legalProviderWrites: 1,
    legalContentWrites: 2,
    legalAcceptanceWrites: 0,
    authWrites: 0,
    passwordResets: 0,
    historicalCredentialAccess: 0,
    historicalReconciliationWrites: 0,
    otherIdentityWrites: 0,
    hrWrites: 0,
    rulesWrites: 0,
    storageWrites: 0,
    makeWrites: 0,
    geminiCalls: 0,
    paymentWrites: 0,
    deploys: 0,
    production: false,
    merge: false,
    automaticAcceptance: false,
    humanAcceptanceRequired: true
  };

  result.providerAttempted = true;
  result.status = 'PROVIDER_ATTEMPTED';
  writeResult();

  const app = getApps()[0] || initializeApp({
    credential: applicationDefault(),
    projectId: 'cxorbia-backend-dev'
  });
  const db = getFirestore(app);
  const provider = createLegalPublicationProvider({
    firestore: db,
    serverTimestamp: () => FieldValue.serverTimestamp()
  });
  const ack = await provider.materialize({ command, gate });
  result.providerAck = ack.providerAck === true;
  result.committed = ack.committed === true;
  result.firestoreWrites = Number(ack.firestoreWrites || 0);
  result.legalProfileWrites = Number(ack.legalProfileWrites || 0);
  result.legalProviderWrites = Number(ack.legalProviderWrites || 0);
  result.legalContentWrites = Number(ack.legalContentWrites || 0);
  result.legalAcceptanceWrites = Number(ack.legalAcceptanceWrites || 0);
  result.authWrites = Number(ack.authWrites || 0);
  result.passwordResets = Number(ack.passwordResets || 0);
  result.historicalCredentialAccess = Number(ack.historicalCredentialAccess || 0);
  result.historicalReconciliationWrites = Number(ack.historicalReconciliationWrites || 0);

  const readback = await provider.readback({
    tenantId: 'tya',
    legalContentId: contract.target.legalContentId,
    legalVersion: contract.target.legalVersion
  });
  result.readbackReady = readback.ready === true;
  assert(result.providerAck, 'PROVIDER_ACK_MISSING');
  assert(result.committed, 'PROVIDER_COMMIT_MISSING');
  assert(result.firestoreWrites === 4, 'PROVIDER_WRITE_COUNT_MISMATCH');
  assert(result.legalAcceptanceWrites === 0, 'LEGAL_ACCEPTANCE_WRITE_DETECTED');
  assert(result.authWrites === 0, 'AUTH_WRITE_DETECTED');
  assert(result.passwordResets === 0, 'PASSWORD_RESET_DETECTED');
  assert(result.historicalCredentialAccess === 0, 'HISTORICAL_CREDENTIAL_ACCESS_DETECTED');
  assert(result.historicalReconciliationWrites === 0, 'HISTORICAL_RECONCILIATION_DETECTED');
  assert(result.readbackReady, 'PROVIDER_READBACK_NOT_READY');
  assert(str(readback.contentDigest) === digest, 'PROVIDER_READBACK_DIGEST_MISMATCH');
  assert(readback.counselStatus === 'deferred_post_golive', 'PROVIDER_READBACK_COUNSEL_STATUS_INVALID');
  assert(readback.interimGoLive === true, 'PROVIDER_READBACK_INTERIM_FLAG_INVALID');
  assert(readback.restrictedFieldsReturned === false, 'PROVIDER_READBACK_RESTRICTED_FIELD_LEAK');

  result.status = result.blockers.length ? 'COMMITTED_READBACK_FAILED' : 'PASS_COMMITTED_READBACK';
  writeResult();
  if (result.blockers.length) process.exit(2);
} catch (error) {
  block(str(error?.code || error?.message || 'UNEXPECTED_EXECUTOR_FAILURE'));
  if (result.status === 'NOT_STARTED') result.status = 'BLOCKED_PRE_PROVIDER';
  else if (result.committed) result.status = 'COMMITTED_WITH_EXECUTOR_ERROR';
  else result.status = 'PROVIDER_ATTEMPT_FAILED';
  writeResult();
  process.exit(2);
}
