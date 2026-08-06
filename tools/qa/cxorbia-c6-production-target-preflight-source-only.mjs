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
const prodRcPath = argValue('--prod-rc', '.firebaserc.prod');
const prodFirebasePath = argValue('--prod-firebase', 'firebase.prod.json');
const outPath = argValue('--out', '');

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const exists = (file) => fs.existsSync(file);
const fail = (message) => {
  throw new Error(message);
};

const report = {
  schemaVersion: 'cxorbia.c6.production-target-preflight-source-only.v1',
  generatedAt: new Date().toISOString(),
  mode: 'SOURCE_ONLY_NO_PROVIDER_NO_DEPLOY',
  inputs: {
    devRcPath,
    devFirebasePath,
    prodRcPath,
    prodFirebasePath
  },
  checks: {},
  decision: 'HOLD_PRODUCTION_TARGET_UNMATERIALIZED',
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
  const devProject = devRc?.projects?.dev || devRc?.projects?.default || null;
  const devTarget = devFirebase?.hosting?.target || null;
  const devSite = devProject && devTarget
    ? devRc?.targets?.[devProject]?.hosting?.[devTarget]?.[0] || null
    : null;
  const devService = (devFirebase?.hosting?.rewrites || [])
    .find((entry) => entry?.source === '/api/tya/cinepolis/hr-live')?.run?.serviceId || null;

  report.dev = { projectId: devProject, hostingTarget: devTarget, hostingSite: devSite, cloudRunService: devService };
  report.checks.devProjectPresent = Boolean(devProject);
  report.checks.devHostingTargetPresent = Boolean(devTarget);
  report.checks.devHostingSitePresent = Boolean(devSite);
  report.checks.devCloudRunServicePresent = Boolean(devService);
  report.checks.devPublicDirectoryIsApp = devFirebase?.hosting?.public === 'app';

  if (!exists(prodRcPath) || !exists(prodFirebasePath)) {
    report.checks.productionRcPresent = exists(prodRcPath);
    report.checks.productionFirebasePresent = exists(prodFirebasePath);
    report.holdReason = 'PRODUCTION_CONFIGURATION_FILES_NOT_MATERIALIZED';
  } else {
    const prodRc = readJson(prodRcPath);
    const prodFirebase = readJson(prodFirebasePath);
    const prodProject = prodRc?.projects?.production || prodRc?.projects?.prod || null;
    const prodTarget = prodFirebase?.hosting?.target || null;
    const prodSite = prodProject && prodTarget
      ? prodRc?.targets?.[prodProject]?.hosting?.[prodTarget]?.[0] || null
      : null;
    const prodRewrite = (prodFirebase?.hosting?.rewrites || [])
      .find((entry) => entry?.source === '/api/tya/cinepolis/hr-live')?.run || null;
    const prodService = prodRewrite?.serviceId || null;
    const prodRegion = prodRewrite?.region || null;

    report.production = {
      projectId: prodProject,
      hostingTarget: prodTarget,
      hostingSite: prodSite,
      cloudRunService: prodService,
      cloudRunRegion: prodRegion
    };

    Object.assign(report.checks, {
      productionRcPresent: true,
      productionFirebasePresent: true,
      productionProjectPresent: Boolean(prodProject),
      productionHostingTargetPresent: Boolean(prodTarget),
      productionHostingSitePresent: Boolean(prodSite),
      productionCloudRunServicePresent: Boolean(prodService),
      productionRegionIsUsCentral1: prodRegion === 'us-central1',
      productionPublicDirectoryIsApp: prodFirebase?.hosting?.public === 'app',
      projectSeparatedFromDev: Boolean(prodProject && devProject && prodProject !== devProject),
      targetSeparatedFromDev: Boolean(prodTarget && devTarget && prodTarget !== devTarget),
      siteSeparatedFromDev: Boolean(prodSite && devSite && prodSite !== devSite),
      serviceSeparatedFromDev: Boolean(prodService && devService && prodService !== devService),
      productionServiceNotNamedDev: Boolean(prodService && !/(^|-)dev($|-)/i.test(prodService)),
      productionRedirectPresent: Array.isArray(prodFirebase?.hosting?.redirects),
      utf8HtmlHeaderPresent: (prodFirebase?.hosting?.headers || []).some((entry) =>
        entry?.source === '**/*.html' &&
        (entry?.headers || []).some((header) =>
          header?.key === 'Content-Type' && /charset=utf-8/i.test(header?.value || '')
        )
      )
    });

    const requiredChecks = [
      'productionProjectPresent',
      'productionHostingTargetPresent',
      'productionHostingSitePresent',
      'productionCloudRunServicePresent',
      'productionRegionIsUsCentral1',
      'productionPublicDirectoryIsApp',
      'projectSeparatedFromDev',
      'targetSeparatedFromDev',
      'siteSeparatedFromDev',
      'serviceSeparatedFromDev',
      'productionServiceNotNamedDev',
      'utf8HtmlHeaderPresent'
    ];

    const failedChecks = requiredChecks.filter((key) => report.checks[key] !== true);
    report.failedChecks = failedChecks;
    if (failedChecks.length === 0) {
      report.decision = 'PASS_PRODUCTION_TARGET_SOURCE_ONLY_CONTRACT';
      report.holdReason = null;
    } else {
      report.holdReason = 'PRODUCTION_CONFIGURATION_CONTRACT_INCOMPLETE_OR_NOT_SEPARATED';
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

if (report.decision === 'PASS_PRODUCTION_TARGET_SOURCE_ONLY_CONTRACT') {
  process.exit(0);
}
process.exitCode = 2;
