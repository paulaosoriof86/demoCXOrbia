#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const argValue = (name, fallback) => {
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
};

const devRcPath = argValue('--dev-rc', '.firebaserc');
const devFirebasePath = argValue('--dev-firebase', 'firebase.json');
const contractPath = argValue('--contract', 'backend/config/cxorbia-production-promotion-contract.json');
const prodRcPath = argValue('--prod-rc', '.firebaserc.prod');
const prodFirebasePath = argValue('--prod-firebase', 'firebase.prod.json');
const outPath = argValue('--out', '');

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const exists = (file) => fs.existsSync(file);
const fail = (message) => {
  throw new Error(message);
};

const getDeployment = (rc, firebase, aliases) => {
  const projectId = aliases.map((alias) => rc?.projects?.[alias]).find(Boolean) || null;
  const hostingTarget = firebase?.hosting?.target || null;
  const hostingSite = projectId && hostingTarget
    ? rc?.targets?.[projectId]?.hosting?.[hostingTarget]?.[0] || null
    : null;
  const rewrite = (firebase?.hosting?.rewrites || [])
    .find((entry) => entry?.source === '/api/tya/cinepolis/hr-live')?.run || null;
  return {
    projectId,
    hostingTarget,
    hostingSite,
    cloudRunService: rewrite?.serviceId || null,
    cloudRunRegion: rewrite?.region || null,
    publicDirectory: firebase?.hosting?.public || null,
    utf8HtmlHeaderPresent: (firebase?.hosting?.headers || []).some((entry) =>
      entry?.source === '**/*.html' &&
      (entry?.headers || []).some((header) =>
        header?.key === 'Content-Type' && /charset=utf-8/i.test(header?.value || '')
      )
    )
  };
};

const report = {
  schemaVersion: 'cxorbia.c6.production-target-preflight-source-only.v2',
  generatedAt: new Date().toISOString(),
  mode: 'SOURCE_ONLY_NO_PROVIDER_NO_DEPLOY',
  inputs: {
    devRcPath,
    devFirebasePath,
    contractPath,
    prodRcPath,
    prodFirebasePath
  },
  checks: {},
  decision: 'HOLD_PRODUCTION_STRATEGY_UNMATERIALIZED',
  safeState: {
    providerReads: 0,
    providerWrites: 0,
    hrWrites: 0,
    firestoreWrites: 0,
    authWrites: 0,
    rulesWrites: 0,
    storageWrites: 0,
    hostingDeploys: 0,
    cloudRunDeploys: 0,
    merge: false,
    production: false
  }
};

try {
  if (!exists(devRcPath)) fail(`missing_dev_rc:${devRcPath}`);
  if (!exists(devFirebasePath)) fail(`missing_dev_firebase:${devFirebasePath}`);

  const devRc = readJson(devRcPath);
  const devFirebase = readJson(devFirebasePath);
  const dev = getDeployment(devRc, devFirebase, ['dev', 'default']);
  report.dev = dev;
  Object.assign(report.checks, {
    devProjectPresent: Boolean(dev.projectId),
    devHostingTargetPresent: Boolean(dev.hostingTarget),
    devHostingSitePresent: Boolean(dev.hostingSite),
    devCloudRunServicePresent: Boolean(dev.cloudRunService),
    devRegionIsUsCentral1: dev.cloudRunRegion === 'us-central1',
    devPublicDirectoryIsApp: dev.publicDirectory === 'app',
    devUtf8HtmlHeaderPresent: dev.utf8HtmlHeaderPresent === true
  });

  if (!exists(contractPath)) {
    report.checks.productionPromotionContractPresent = false;
    report.holdReason = 'PRODUCTION_PROMOTION_STRATEGY_NOT_AUTHORIZED_OR_MATERIALIZED';
  } else {
    const contract = readJson(contractPath);
    const strategy = contract?.strategy || null;
    const allowedStrategies = ['PROMOTE_EXISTING_CLEAN_PROJECT', 'SEPARATE_CLEAN_PROD_PROJECT'];
    report.contract = {
      schemaVersion: contract?.schemaVersion || null,
      authorizationId: contract?.authorizationId || null,
      authorizedBy: contract?.authorizedBy || null,
      authorized: contract?.authorized === true,
      strategy,
      legacyProjectReuseForBackend: contract?.legacyProjectReuseForBackend === true,
      productionProjectId: contract?.productionProjectId || null,
      productionHostingTarget: contract?.productionHostingTarget || null,
      productionHostingSite: contract?.productionHostingSite || null,
      productionCloudRunService: contract?.productionCloudRunService || null,
      productionCloudRunRegion: contract?.productionCloudRunRegion || null
    };

    Object.assign(report.checks, {
      productionPromotionContractPresent: true,
      contractSchemaValid: contract?.schemaVersion === 'cxorbia.production-promotion-contract.v1',
      contractAuthorized: contract?.authorized === true,
      authorizationIdPresent: typeof contract?.authorizationId === 'string' && contract.authorizationId.length > 10,
      strategyAllowed: allowedStrategies.includes(strategy),
      legacyProjectNotReusedForBackend: contract?.legacyProjectReuseForBackend === false,
      productionProjectPresent: Boolean(contract?.productionProjectId),
      productionHostingTargetPresent: Boolean(contract?.productionHostingTarget),
      productionHostingSitePresent: Boolean(contract?.productionHostingSite),
      productionCloudRunServicePresent: Boolean(contract?.productionCloudRunService),
      productionRegionIsUsCentral1: contract?.productionCloudRunRegion === 'us-central1'
    });

    let deployment = null;
    if (strategy === 'PROMOTE_EXISTING_CLEAN_PROJECT') {
      deployment = dev;
      Object.assign(report.checks, {
        promotedProjectMatchesCurrentCleanProject: contract?.productionProjectId === dev.projectId,
        promotedHostingTargetMatchesCurrentTarget: contract?.productionHostingTarget === dev.hostingTarget,
        promotedHostingSiteMatchesCurrentSite: contract?.productionHostingSite === dev.hostingSite,
        promotedCloudRunServiceMatchesCurrentService: contract?.productionCloudRunService === dev.cloudRunService,
        separateProdFilesRequired: false
      });
      report.warnings = [
        'PROMOTION_REUSES_CURRENT_DEV_NAMED_IDENTIFIERS',
        'CUTOVER_REQUIRES_EXPLICIT_ACCEPTANCE_OF_CURRENT_PROJECT_AND_URL_AS_PRODUCTION'
      ];
    } else if (strategy === 'SEPARATE_CLEAN_PROD_PROJECT') {
      report.checks.separateProdFilesRequired = true;
      report.checks.productionRcPresent = exists(prodRcPath);
      report.checks.productionFirebasePresent = exists(prodFirebasePath);
      if (exists(prodRcPath) && exists(prodFirebasePath)) {
        const prodRc = readJson(prodRcPath);
        const prodFirebase = readJson(prodFirebasePath);
        deployment = getDeployment(prodRc, prodFirebase, ['production', 'prod']);
        Object.assign(report.checks, {
          separateProjectMatchesContract: deployment.projectId === contract?.productionProjectId,
          separateTargetMatchesContract: deployment.hostingTarget === contract?.productionHostingTarget,
          separateSiteMatchesContract: deployment.hostingSite === contract?.productionHostingSite,
          separateServiceMatchesContract: deployment.cloudRunService === contract?.productionCloudRunService,
          separateRegionMatchesContract: deployment.cloudRunRegion === contract?.productionCloudRunRegion,
          projectSeparatedFromDev: Boolean(deployment.projectId && dev.projectId && deployment.projectId !== dev.projectId),
          targetSeparatedFromDev: Boolean(deployment.hostingTarget && dev.hostingTarget && deployment.hostingTarget !== dev.hostingTarget),
          siteSeparatedFromDev: Boolean(deployment.hostingSite && dev.hostingSite && deployment.hostingSite !== dev.hostingSite),
          serviceSeparatedFromDev: Boolean(deployment.cloudRunService && dev.cloudRunService && deployment.cloudRunService !== dev.cloudRunService)
        });
      }
    }

    report.productionDeployment = deployment;

    const commonChecks = [
      'contractSchemaValid',
      'contractAuthorized',
      'authorizationIdPresent',
      'strategyAllowed',
      'legacyProjectNotReusedForBackend',
      'productionProjectPresent',
      'productionHostingTargetPresent',
      'productionHostingSitePresent',
      'productionCloudRunServicePresent',
      'productionRegionIsUsCentral1'
    ];
    const strategyChecks = strategy === 'PROMOTE_EXISTING_CLEAN_PROJECT'
      ? [
          'promotedProjectMatchesCurrentCleanProject',
          'promotedHostingTargetMatchesCurrentTarget',
          'promotedHostingSiteMatchesCurrentSite',
          'promotedCloudRunServiceMatchesCurrentService'
        ]
      : [
          'productionRcPresent',
          'productionFirebasePresent',
          'separateProjectMatchesContract',
          'separateTargetMatchesContract',
          'separateSiteMatchesContract',
          'separateServiceMatchesContract',
          'separateRegionMatchesContract',
          'projectSeparatedFromDev',
          'targetSeparatedFromDev',
          'siteSeparatedFromDev',
          'serviceSeparatedFromDev'
        ];

    const failedChecks = [...commonChecks, ...strategyChecks]
      .filter((key) => report.checks[key] !== true);
    report.failedChecks = failedChecks;
    if (failedChecks.length === 0) {
      report.decision = strategy === 'PROMOTE_EXISTING_CLEAN_PROJECT'
        ? 'PASS_PRODUCTION_PROMOTION_CONTRACT_EXISTING_CLEAN_PROJECT'
        : 'PASS_PRODUCTION_TARGET_SOURCE_ONLY_CONTRACT_SEPARATE_PROJECT';
      report.holdReason = null;
    } else {
      report.decision = 'HOLD_PRODUCTION_PROMOTION_CONTRACT_INCOMPLETE';
      report.holdReason = 'PRODUCTION_STRATEGY_OR_CONFIGURATION_INCOMPLETE';
    }
  }
} catch (error) {
  report.decision = 'FAIL_CLOSED_PRODUCTION_TARGET_PREFLIGHT';
  report.error = error instanceof Error ? error.message : String(error);
}

const output = `${JSON.stringify(report, null, 2)}\n`;
if (outPath) {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, output, 'utf8');
}
process.stdout.write(output);

if (report.decision.startsWith('PASS_')) {
  process.exit(0);
}
process.exitCode = 2;
