#!/usr/bin/env node
/*
  CXOrbia Phase A R15D - provider read-only CX.data smoke.

  Reads only allowlisted Firestore fields, hydrates the backend adapter in
  memory, validates the synchronous facade and persists aggregate evidence only.
*/

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {
  createFirebaseCxDataReadonlyAdapter,
  createSynchronousCxDataFacade,
  inspectFacadeCompatibility,
  scanForbiddenFields
} from '../../backend/adapters/firebase-cxdata-readonly-r15d.mjs';

const REQUIRED_CONFIRMATION = 'CXDATA_FIRESTORE_READONLY_R15D';
const DEFAULT_CONFIG = 'backend/config/phase-a-cxdata-firestore-readonly-r15d.source-safe.json';
const args = process.argv.slice(2);
const configIdx = args.indexOf('--config');
const outIdx = args.indexOf('--out');
const configPath = configIdx >= 0 ? args[configIdx + 1] : DEFAULT_CONFIG;
const outDirArg = outIdx >= 0 ? args[outIdx + 1] : '.tmp/cxdata-firestore-readonly-r15d';
const root = process.cwd();

function hardStop(message, code = 4) {
  console.error(message);
  process.exit(code);
}

function errorCategory(error) {
  const raw = String(error?.code || error?.response?.status || error?.status || error?.name || 'UNKNOWN');
  if (/403|permission|denied/i.test(raw)) return 'PERMISSION_DENIED';
  if (/404|not[-_ ]?found/i.test(raw)) return 'NOT_FOUND_OR_API_NOT_INITIALIZED';
  if (/401|unauth/i.test(raw)) return 'UNAUTHENTICATED';
  if (/429|quota/i.test(raw)) return 'QUOTA_OR_RATE_LIMIT';
  return raw.replace(/[^A-Z0-9_.-]/gi, '_').slice(0, 80) || 'UNKNOWN';
}

function readJson(relativePath) {
  const absolute = path.join(root, relativePath);
  if (!fs.existsSync(absolute)) hardStop(`Blocked: missing ${relativePath}`, 2);
  return JSON.parse(fs.readFileSync(absolute, 'utf8'));
}

function writeReport(outDir, report) {
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'cxdata-firestore-readonly-r15d-report.json'), JSON.stringify(report, null, 2), 'utf8');
  const markdown = [
    '# CXOrbia R15D - CX.data Firestore read-only smoke',
    '',
    `Generated: ${report.generatedAt}`,
    `Decision: ${report.decision}`,
    `Preferred project found: ${report.snapshot.preferredProjectFound}`,
    `Selected project is preferred: ${report.snapshot.selectedProjectIsPreferred}`,
    `Selected project uses fallback: ${report.snapshot.selectedProjectUsesFallback}`,
    `Projects: ${report.snapshot.projectCount}`,
    `Shoppers: ${report.snapshot.shopperCount}`,
    `Visits: ${report.snapshot.visitCount}`,
    `Postulations: ${report.snapshot.postulationCount}`,
    `Certifications: ${report.snapshot.certificationCount}`,
    `Liquidations: ${report.snapshot.liquidationCount}`,
    `Shopper benefits: ${report.snapshot.shopperBenefitCount}`,
    `Selected-project visits: ${report.facade.selectedProjectVisitCount}`,
    `Selected-project postulations: ${report.facade.selectedProjectPostulationCount}`,
    `Facade compatible: ${report.facade.compatible}`,
    `Forbidden-field violations: ${report.security.forbiddenFieldViolationCount}`,
    `Blocked write checks passed: ${report.writeGates.allBlocked}`,
    '',
    '## Safe state',
    '- Provider reads only',
    '- Allowlisted fields only',
    '- No records, IDs, names, emails or document fields persisted in the report',
    '- No Auth, claims, Firestore or Storage writes',
    '- No import, deploy, runtime switch or production access',
    ''
  ].join('\n');
  fs.writeFileSync(path.join(outDir, 'cxdata-firestore-readonly-r15d-report.md'), markdown, 'utf8');
}

async function main() {
  if (process.env.CXORBIA_CONFIRM !== REQUIRED_CONFIRMATION) {
    hardStop(`Blocked: CXORBIA_CONFIRM must equal ${REQUIRED_CONFIRMATION}`, 2);
  }

  const config = readJson(configPath);
  if (config.status !== 'authorized_read_only' || config.authorization?.providerReadAuthorized !== true) {
    hardStop('Blocked: R15D configuration is not authorized read-only.', 2);
  }
  if (config.authorization?.writesAuthorized !== false) {
    hardStop('Blocked: R15D writes must remain disabled.', 2);
  }

  const credentialPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!credentialPath || !fs.existsSync(credentialPath)) {
    hardStop('Blocked: GOOGLE_APPLICATION_CREDENTIALS is missing or unreadable.', 2);
  }
  const credentialJson = JSON.parse(fs.readFileSync(credentialPath, 'utf8'));
  const projectIdMatch = String(credentialJson.project_id || '') === String(config.target.firebaseProjectId || '');
  const serviceAccountDomainMatch = String(credentialJson.client_email || '').endsWith(String(config.target.expectedServiceAccountEmailSuffix || ''));
  const absoluteOut = path.join(root, outDirArg);

  if (!projectIdMatch || !serviceAccountDomainMatch) {
    const report = {
      gate: 'phase-a-cxdata-firestore-readonly-r15d',
      generatedAt: new Date().toISOString(),
      decision: config.decisionPolicy.hardStop,
      target: { projectIdMatch, serviceAccountDomainMatch },
      snapshot: {},
      facade: { compatible: false },
      security: { forbiddenFieldViolationCount: null },
      writeGates: { allBlocked: true },
      safeState: {
        providerCallsExecuted: false,
        firestoreWrites: false,
        authWrites: false,
        imports: false,
        deploy: false,
        production: false
      }
    };
    writeReport(absoluteOut, report);
    console.log(JSON.stringify(report, null, 2));
    process.exitCode = 4;
    return;
  }

  const [{ initializeApp, cert, deleteApp }, { getFirestore }] = await Promise.all([
    import('firebase-admin/app'),
    import('firebase-admin/firestore')
  ]);
  const app = initializeApp({
    credential: cert(credentialJson),
    projectId: config.target.firebaseProjectId,
    storageBucket: config.target.storageBucket
  }, `cxorbia-r15d-${Date.now()}`);

  try {
    const db = getFirestore(app);
    const adapter = createFirebaseCxDataReadonlyAdapter({ db, config });
    const snapshot = await adapter.hydrate();
    const facade = createSynchronousCxDataFacade(snapshot);
    const compatibility = inspectFacadeCompatibility(facade, config.requiredFacadeMembers || []);
    const forbiddenScan = scanForbiddenFields(snapshot, config.forbiddenFields || []);

    const selectedProject = facade.project();
    const selectedProjectExists = Boolean(selectedProject);
    const selectedProjectVisitCount = facade.visitas().length;
    const selectedProjectPostulationCount = facade.posts().length;
    const projectsForCount = facade.projectsFor('admin').length;
    const shoppersForCount = facade.shoppersFor().length;

    const blockedResults = [
      facade.addShopper({}),
      facade.updateShopper('source_safe_ref', {}),
      facade.assignVisit('source_safe_visit_ref', 'source_safe_shopper_ref'),
      facade.postularVisita('source_safe_visit_ref', 'source_safe_shopper_ref'),
      facade.setVisitState('source_safe_visit_ref', 'agendada'),
      facade.payVisits([], null, null),
      facade.addProject({})
    ];
    const allBlocked = blockedResults.every((item) => item?.writeExecuted === false && item?.status === 'blocked_by_gate');

    const selectedProjectIsPreferred = snapshot.selectedProjectId === snapshot.preferredProjectId;
    const selectedProjectUsesFallback = !selectedProjectIsPreferred && Boolean(snapshot.fallbackProjectId) && snapshot.selectedProjectId === snapshot.fallbackProjectId;
    const basePass = compatibility.compatible && forbiddenScan.safe && selectedProjectExists && snapshot.projects.length > 0 && allBlocked;

    let decision = config.decisionPolicy.review;
    if (basePass && selectedProjectIsPreferred) decision = config.decisionPolicy.preferredPass;
    else if (basePass && selectedProjectUsesFallback) decision = config.decisionPolicy.fallbackPass;

    const report = {
      gate: 'phase-a-cxdata-firestore-readonly-r15d',
      generatedAt: new Date().toISOString(),
      decision,
      target: {
        projectIdMatch,
        serviceAccountDomainMatch,
        tenantIdMatch: snapshot.tenantId === config.target.tenantId
      },
      snapshot: {
        preferredProjectFound: snapshot.preferredProjectFound,
        selectedProjectIsPreferred,
        selectedProjectUsesFallback,
        projectCount: snapshot.projects.length,
        shopperCount: snapshot.shoppers.length,
        visitCount: snapshot.visits.length,
        postulationCount: snapshot.postulations.length,
        certificationCount: snapshot.certifications.length,
        liquidationCount: snapshot.liquidations.length,
        shopperBenefitCount: snapshot.shopperBenefits.length
      },
      facade: {
        compatible: compatibility.compatible,
        requiredMemberCount: compatibility.requiredCount,
        presentMemberCount: compatibility.presentCount,
        missingMemberCount: compatibility.missing.length,
        selectedProjectExists,
        selectedProjectVisitCount,
        selectedProjectPostulationCount,
        projectsForCount,
        shoppersForCount,
        synchronousReadMethodsOperational: selectedProjectExists && Array.isArray(facade.visitas()) && Array.isArray(facade.posts())
      },
      security: {
        forbiddenFieldViolationCount: forbiddenScan.violationCount,
        forbiddenFieldViolationCollectionCount: forbiddenScan.violationCollectionCount,
        allowlistedProjectionSafe: forbiddenScan.safe,
        rawRecordsPersisted: false,
        identifiersPersisted: false,
        piiPersisted: false
      },
      writeGates: {
        checkedMethodCount: blockedResults.length,
        allBlocked,
        writeExecutedCount: blockedResults.filter((item) => item?.writeExecuted === true).length
      },
      summary: {
        basePass,
        readOnlyFacadeReadyForControlledConnectionPoint: basePass,
        frontendConnectionExecuted: false,
        nextGate: basePass ? 'CONTROLLED_SINGLE_CXDATA_CONNECTION_POINT_READONLY' : 'R15D_REVIEW'
      },
      safeState: {
        providerCallsExecuted: true,
        firestoreReadsExecuted: true,
        firestoreWrites: false,
        authWrites: false,
        claimsWrites: false,
        storageWrites: false,
        imports: false,
        deploy: false,
        runtimeSwitch: false,
        production: false,
        credentialsOutput: false,
        piiOutput: false
      }
    };

    writeReport(absoluteOut, report);
    console.log(JSON.stringify(report, null, 2));
    process.exitCode = basePass ? 0 : 2;
  } finally {
    await deleteApp(app).catch(() => {});
  }
}

main().catch((error) => {
  console.error(`R15D failed safely: ${errorCategory(error)}`);
  process.exitCode = 3;
});
