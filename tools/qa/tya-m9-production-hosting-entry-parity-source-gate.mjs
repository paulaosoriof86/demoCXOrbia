#!/usr/bin/env node
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const fail = (code) => { throw new Error(code); };
const read = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim();
const testedTarget = '62edaf552c2a62a8964671f691d600a417ae63f8';
const expectedBuild = 'ecc725866acc3eb8';
const expectedAggregate = 'ecc725866acc3eb8aab292000be3ec31d1c46b5c14a53c8889fa7d6716a997e2';
const report = {
  schemaVersion: 'cxorbia.m9.production-hosting-entry-parity-source-gate.v1',
  generatedAt: new Date().toISOString(),
  decision: 'FAIL_M9_PRODUCTION_HOSTING_ENTRY_PARITY_SOURCE_GATE',
  testedTarget,
  expectedBuild,
  expectedAggregate,
  checks: {},
  safety: { providerReads: 0, providerWrites: 0, hostingDeploys: 0, cloudRunDeploys: 0, authWrites: 0, firestoreWrites: 0, hrWrites: 0, merge: false, productionMutation: false }
};

try {
  const canonical = read('firebase.json');
  const deploy = read('firebase.deploy.json');
  const ch = canonical.hosting || {};
  const dh = deploy.hosting || {};
  const findRedirect = (h) => (h.redirects || []).find(x => x?.source === '/');
  const findRun = (h, source) => (h.rewrites || []).find(x => x?.source === source)?.run || null;
  const findSpa = (h) => (h.rewrites || []).find(x => x?.source === '**') || null;
  const cRoot = findRedirect(ch), dRoot = findRedirect(dh);
  const cTenants = findRun(ch, '/api/tenants/**'), dTenants = findRun(dh, '/api/tenants/**');
  const cHr = findRun(ch, '/api/tya/cinepolis/hr-live'), dHr = findRun(dh, '/api/tya/cinepolis/hr-live');
  const cSpa = findSpa(ch), dSpa = findSpa(dh);

  Object.assign(report.checks, {
    targetParity: ch.target === 'cxorbia-dev' && dh.target === ch.target,
    publicParity: ch.public === 'app' && dh.public === ch.public,
    rootRedirectParity: cRoot?.destination === '/index-backend-dev.html' && cRoot?.type === 302 && dRoot?.destination === cRoot.destination && dRoot?.type === cRoot.type,
    tenantsRewriteParity: cTenants?.serviceId === 'cxorbia-live-hr-dev' && cTenants?.region === 'us-central1' && dTenants?.serviceId === cTenants.serviceId && dTenants?.region === cTenants.region,
    liveHrRewriteParity: cHr?.serviceId === 'cxorbia-live-hr-dev' && cHr?.region === 'us-central1' && dHr?.serviceId === cHr.serviceId && dHr?.region === cHr.region,
    spaFallbackParity: cSpa?.destination === '/index.html' && dSpa?.destination === cSpa.destination,
    backendEntryExists: fs.existsSync('app/index-backend-dev.html'),
    genericEntryExists: fs.existsSync('app/index.html')
  });

  const backendEntry = fs.readFileSync('app/index-backend-dev.html', 'utf8');
  const genericEntry = fs.readFileSync('app/index.html', 'utf8');
  Object.assign(report.checks, {
    backendEntryCanonicalBootstrap: backendEntry.includes('cxDevEntryCanonicalBootstrap') && backendEntry.includes('authenticated-human-canonical'),
    backendEntrySelfSetsProtectedRuntime: backendEntry.includes("params.set('cxProtectedRuntime',PROTECTED)") && backendEntry.includes("params.set('cxHumanFullVisual',FULL_VISUAL)"),
    backendEntryLiveHr: backendEntry.includes('/api/tya/cinepolis/hr-live'),
    backendEntryFirebase: backendEntry.includes('/__/firebase/init.js'),
    genericEntryNotBackendBootstrap: !genericEntry.includes('cxDevEntryCanonicalBootstrap') && !genericEntry.includes('/__/firebase/init.js')
  });

  const runtimeAppDrift = git('diff', '--name-only', `${testedTarget}..HEAD`, '--', 'app').split(/\r?\n/).filter(Boolean).filter(x => !x.startsWith('app/docs/'));
  report.runtimeAppDriftAfterM8 = runtimeAppDrift;
  report.checks.runtimeAppBytesUnchanged = runtimeAppDrift.length === 0;

  const lockSource = fs.readFileSync('app/core/build-lock.js', 'utf8');
  report.checks.buildIdStillBound = lockSource.includes(expectedBuild);
  report.checks.aggregateStillBound = lockSource.includes(expectedAggregate);

  const failed = Object.entries(report.checks).filter(([,v]) => v !== true).map(([k]) => k);
  report.failedChecks = failed;
  if (failed.length) fail('M9_PRODUCTION_HOSTING_ENTRY_PARITY_FAILED:' + failed.join(','));
  report.decision = 'PASS_M9_PRODUCTION_HOSTING_ENTRY_PARITY_SOURCE_GATE';
  report.classification = 'ROOT_CAUSE_CLOSED_SOURCE_ONLY__DEPLOY_CONFIG_HAD_DROPPED_TESTED_ROOT_REDIRECT_AND_TENANT_REWRITE';
  report.next = 'PRODUCTION_COMPATIBLE_READONLY_RUNTIME_PREFLIGHT_BEFORE_ANY_FUTURE_CUTOVER_GATE';
} catch (error) {
  report.error = String(error?.message || error);
  process.exitCode = 1;
}

process.stdout.write(JSON.stringify(report, null, 2) + '\n');
