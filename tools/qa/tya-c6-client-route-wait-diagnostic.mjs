#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { chromium } from 'playwright';

const root = String(process.env.CXORBIA_DEV_ROOT_URL || 'https://cxorbia-backend-dev.web.app').replace(/\/$/, '');
const requestPath = process.argv[2] || '.github/cxorbia-gate-requests/request.json';
const privatePath = process.env.CXORBIA_E2E_PRIVATE_CREDENTIALS || '.tmp/phase-a-runtime-private/private-e2e.json';
const outDir = '.tmp/c6-client-route-wait-diagnostic';
const runnerDir = '.tmp/cxorbia-readonly-post-gates-runner';
const detailPath = path.join(outDir, 'report.json');
const runnerReportPath = path.join(runnerDir, 'report.json');
const runnerReportMdPath = path.join(runnerDir, 'report.md');

const safeState = {
  repositoryWrites: false,
  dataWrites: false,
  deploy: false,
  merge: false,
  production: false,
  imports: false,
  payments: false,
  make: false,
  gemini: false,
  firestoreWrites: false,
  authWrites: false,
  storageWrites: false,
  hrWrites: false
};

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}
function git(...args) {
  return execFileSync('git', args, { encoding: 'utf8' }).trim();
}
function ensure(condition, code) {
  if (!condition) throw new Error(code);
}
function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

const request = readJson(requestPath);
const checks = [];
const check = (condition, code) => {
  ensure(condition, code);
  checks.push(code);
};

check(request.schemaVersion === 'cxorbia.readonly-post-gates-request.v1', 'request_schema_valid');
check(request.enabled === true, 'request_enabled');
check(request.profile === 'C6_CLIENT_ROUTE_WAIT_DIAGNOSTIC', 'profile_exact');
check(request.repository === 'paulaosoriof86/demoCXOrbia', 'repository_exact');
check(request.branch === 'docs-tya-v6-v71-audit', 'branch_exact');
check(Number(request.pullRequest) === 7, 'pull_request_exact');
check(request.targetHeadSha === git('rev-parse', 'HEAD^'), 'target_head_exact');
check(request.allowedExecutions === 1, 'single_execution_exact');
check(request.repositoryWrites === false, 'repository_writes_forbidden');
check(request.dataWrites === false, 'data_writes_forbidden');
check(request.deploy === false && request.merge === false && request.production === false, 'deploy_merge_production_forbidden');
for (const [key, expected] of Object.entries(safeState)) {
  check(request.safeState?.[key] === expected, `safe_state_${key}`);
}
check(fs.existsSync(privatePath), 'private_credentials_present');
const credentials = readJson(privatePath);
check(Boolean(credentials?.client?.login && credentials?.client?.password), 'private_client_credential_present');

const pageErrors = [];
const consoleErrors = [];
let routeInvoke = null;
let detailReport = null;
let browser;

try {
  browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'] });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, ignoreHTTPSErrors: true, serviceWorkers: 'block' });
  const page = await context.newPage();
  page.on('pageerror', error => pageErrors.push(String(error?.stack || error?.message || error)));
  page.on('console', message => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  await page.goto(`${root}/index-backend-dev.html?cxClientRouteDiagnostic=1&ts=${Date.now()}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForSelector('.role-btn[data-role="cliente"]', { state: 'visible', timeout: 30000 });
  await page.click('.role-btn[data-role="cliente"]');
  await page.waitForSelector('#cxIntegratedAuthStep', { state: 'visible', timeout: 30000 });
  await page.fill('#cxIntegratedAuthLogin', credentials.client.login);
  await page.fill('#cxIntegratedAuthPassword', credentials.client.password);
  await page.click('#cxIntegratedAuthSubmit');
  await page.waitForFunction(() => {
    const ctx = window.CX?.backendAuth?.context?.() || null;
    const authority = window.CX_PROTECTED_AUTH_HR_AUTHORITY || null;
    return Boolean(ctx?.authenticated === true && ctx?.authNamespace === 'staff' && ctx?.role === 'cliente' && authority?.applied === true && document.getElementById('app')?.classList.contains('on') === true);
  }, null, { timeout: 90000 });

  await page.evaluate(() => {
    window.__CX_CLIENT_ROUTE_DIAG_ERRORS = [];
    window.addEventListener('error', event => {
      window.__CX_CLIENT_ROUTE_DIAG_ERRORS.push({
        type: 'error',
        message: String(event?.error?.stack || event?.error?.message || event?.message || 'unknown_error')
      });
    });
    window.addEventListener('unhandledrejection', event => {
      window.__CX_CLIENT_ROUTE_DIAG_ERRORS.push({
        type: 'unhandledrejection',
        message: String(event?.reason?.stack || event?.reason?.message || event?.reason || 'unknown_rejection')
      });
    });
  });

  const capture = async label => page.evaluate(currentLabel => {
    const nav = document.getElementById('nav-cli_dashboard');
    const view = document.getElementById('view');
    const pageHeader = view?.querySelector('.ph') || null;
    const viewText = String(view?.innerText || '').trim();
    const errors = Array.isArray(window.__CX_CLIENT_ROUTE_DIAG_ERRORS) ? window.__CX_CLIENT_ROUTE_DIAG_ERRORS.slice() : [];
    let roleCanAccess = null;
    try { roleCanAccess = window.CX?.roleCanAccess?.(window.CX?.session?.testRole || window.CX?.session?.role, 'cli_dashboard') ?? null; } catch {}
    return {
      label: currentLabel,
      capturedAt: new Date().toISOString(),
      sessionView: window.CX?.session?.view || null,
      sessionRole: window.CX?.session?.role || null,
      clientModuleExists: typeof window.CX?.modules?.cli_dashboard === 'function',
      clientModuleMetadataExists: Boolean(window.CX?.MODULES?.cli_dashboard),
      roleCanAccess,
      navElementExists: Boolean(nav),
      navActive: nav?.classList.contains('active') === true,
      viewExists: Boolean(view),
      pageHeaderExists: Boolean(pageHeader),
      heading: pageHeader?.querySelector('.ph-t')?.textContent?.trim() || null,
      viewTextLength: viewText.length,
      viewHtmlLength: String(view?.innerHTML || '').length,
      appOn: document.getElementById('app')?.classList.contains('on') === true,
      renderException: errors.length ? errors[errors.length - 1] : null,
      renderErrors: errors
    };
  }, label);

  const samples = [];
  samples.push(await capture('before_route_request'));
  routeInvoke = await page.evaluate(() => {
    try {
      const clientModule = typeof window.CX?.modules?.cli_dashboard === 'function';
      const routerAvailable = typeof window.CX?.router?.nav === 'function';
      if (clientModule && routerAvailable) window.CX.router.nav('cli_dashboard');
      return {
        requested: true,
        clientModule,
        routerAvailable,
        routeException: null,
        routeAfterRequest: window.CX?.session?.view || null
      };
    } catch (error) {
      return {
        requested: true,
        clientModule: typeof window.CX?.modules?.cli_dashboard === 'function',
        routerAvailable: typeof window.CX?.router?.nav === 'function',
        routeException: String(error?.stack || error?.message || error),
        routeAfterRequest: window.CX?.session?.view || null
      };
    }
  });

  for (const [delay, label] of [[0, 'after_route_0ms'], [50, 'after_route_50ms'], [250, 'after_route_250ms'], [1000, 'after_route_1000ms'], [3000, 'after_route_3000ms']]) {
    if (delay) await page.waitForTimeout(delay);
    samples.push(await capture(label));
  }

  const fullySatisfied = samples.find(sample => sample.sessionView === 'cli_dashboard' && sample.navElementExists && sample.navActive && sample.viewExists && sample.pageHeaderExists && sample.viewTextLength > 0);
  const rendered = [...samples].reverse().find(sample => sample.sessionView === 'cli_dashboard' && sample.viewExists && sample.viewTextLength > 0);
  const final = samples.at(-1);
  let owner = 'INCONCLUSIVE';
  let code = 'INCONCLUSIVE_CLIENT_ROUTE_STATE';
  let reason = 'The focal observations did not isolate a single product or harness condition.';

  if (routeInvoke.routeException || final.renderException || pageErrors.length) {
    owner = 'PRODUCT';
    code = 'PRODUCT_CLIENT_ROUTE_RENDER_EXCEPTION';
    reason = 'The client route produced a browser or render exception.';
  } else if (fullySatisfied) {
    owner = 'HARNESS';
    code = fullySatisfied.label === 'after_route_0ms' ? 'HARNESS_PRIOR_TIMEOUT_NOT_REPRODUCED' : 'HARNESS_ROUTE_TIMING_TRANSIENT';
    reason = `All prior wait conditions became true at ${fullySatisfied.label}.`;
  } else if (rendered && (!rendered.navElementExists || !rendered.navActive)) {
    owner = 'HARNESS';
    code = 'HARNESS_NAV_ACTIVE_SUBCONDITION_MISMATCH';
    reason = 'The client dashboard rendered with content, but the navigation-element assumption did not become true.';
  } else if (rendered && !rendered.pageHeaderExists) {
    owner = 'HARNESS';
    code = 'HARNESS_PAGE_HEADER_SELECTOR_MISMATCH';
    reason = 'The client dashboard rendered content, but the gate-required #view .ph selector was absent.';
  } else if (final.sessionView !== 'cli_dashboard') {
    owner = 'PRODUCT';
    code = 'PRODUCT_CLIENT_ROUTE_NOT_ACCEPTED';
    reason = 'The router did not retain cli_dashboard as the active session view.';
  } else if (!final.viewExists) {
    owner = 'PRODUCT';
    code = 'PRODUCT_VIEW_CONTAINER_MISSING';
    reason = 'The canonical #view container was absent after client-route navigation.';
  } else if (final.viewTextLength === 0) {
    owner = 'PRODUCT';
    code = 'PRODUCT_CLIENT_DASHBOARD_EMPTY_RENDER';
    reason = 'The client route was active but the canonical view remained empty.';
  }

  detailReport = {
    schemaVersion: 'cxorbia.c6.client-route-wait-diagnostic.v1',
    generatedAt: new Date().toISOString(),
    decision: 'PASS_C6_CLIENT_ROUTE_WAIT_DIAGNOSTIC_CLASSIFIED',
    root,
    requestId: request.requestId,
    targetHeadSha: request.targetHeadSha,
    routeInvoke,
    requestedObservability: {
      sessionView: final.sessionView,
      navElementExists: final.navElementExists,
      navActive: final.navActive,
      viewExists: final.viewExists,
      pageHeaderExists: final.pageHeaderExists,
      viewTextLength: final.viewTextLength,
      renderException: final.renderException || routeInvoke.routeException || pageErrors.at(-1) || null
    },
    classification: { owner, code, reason },
    fullySatisfiedAt: fullySatisfied?.label || null,
    samples,
    pageErrors,
    consoleErrors: consoleErrors.slice(-20),
    credentialsExposed: false,
    tokensExposed: false,
    safety: {
      hostingDeploys: 0,
      cloudRunDeploys: 0,
      firestoreWrites: 0,
      authWrites: 0,
      passwordChanges: 0,
      passwordResets: 0,
      rulesWrites: 0,
      storageWrites: 0,
      hrWrites: 0,
      makeCalls: 0,
      geminiCalls: 0,
      paymentWrites: 0,
      repositoryWrites: 0,
      merge: false,
      production: false
    }
  };
  writeJson(detailPath, detailReport);
  await context.close();
} catch (error) {
  detailReport = {
    schemaVersion: 'cxorbia.c6.client-route-wait-diagnostic.failure.v1',
    generatedAt: new Date().toISOString(),
    decision: 'HOLD_C6_CLIENT_ROUTE_WAIT_DIAGNOSTIC_NOT_CLASSIFIED',
    error: String(error?.stack || error?.message || error),
    routeInvoke,
    pageErrors,
    consoleErrors: consoleErrors.slice(-20),
    credentialsExposed: false,
    tokensExposed: false,
    safety: {
      hostingDeploys: 0,
      cloudRunDeploys: 0,
      firestoreWrites: 0,
      authWrites: 0,
      rulesWrites: 0,
      storageWrites: 0,
      hrWrites: 0,
      merge: false,
      production: false
    }
  };
  writeJson(detailPath, detailReport);
  throw error;
} finally {
  if (browser) await browser.close();
}

check(detailReport?.decision === 'PASS_C6_CLIENT_ROUTE_WAIT_DIAGNOSTIC_CLASSIFIED', 'diagnostic_classified');
check(['PRODUCT', 'HARNESS', 'INCONCLUSIVE'].includes(detailReport?.classification?.owner), 'classification_owner_present');
check(git('status', '--porcelain') === '', 'repository_unchanged_after_diagnostic');

const runnerReport = {
  schemaVersion: '1.4.0',
  runner: 'CXORBIA_READONLY_POST_GATES_RUNNER',
  generatedAt: new Date().toISOString(),
  status: 'PASS_READONLY_POST_GATES',
  repository: process.env.GITHUB_REPOSITORY || request.repository,
  branch: process.env.GITHUB_REF_NAME || request.branch,
  requestPath,
  requestId: request.requestId,
  requestCommitSha: git('rev-parse', 'HEAD'),
  targetHeadSha: request.targetHeadSha,
  profile: request.profile,
  profileDefinition: {
    browserRequired: true,
    providerReads: true,
    stableVisitIdentityRequired: false,
    runtimeInventoryFilterRequired: false,
    purpose: 'Classify the focal client_route_wait failure as product, harness or inconclusive without deploy or data writes.'
  },
  stableVisitIdentity: null,
  checks,
  blockers: [],
  commands: ['node tools/qa/tya-c6-client-route-wait-diagnostic.mjs .github/cxorbia-gate-requests/request.json'],
  artifacts: [detailPath],
  summary: {
    status: 'PASS_READONLY_POST_GATES',
    profile: request.profile,
    browserExecuted: true,
    classification: detailReport.classification,
    requestedObservability: detailReport.requestedObservability,
    fullySatisfiedAt: detailReport.fullySatisfiedAt,
    providerWrites: false,
    dataWrites: false,
    deploy: false,
    production: false
  },
  safeState
};
writeJson(runnerReportPath, runnerReport);
fs.writeFileSync(runnerReportMdPath, [
  '# CXOrbia client route wait diagnostic',
  '',
  `- Status: \`${runnerReport.status}\``,
  `- Request: \`${runnerReport.requestId}\``,
  `- Profile: \`${runnerReport.profile}\``,
  `- Classification: \`${detailReport.classification.owner}\``,
  `- Code: \`${detailReport.classification.code}\``,
  `- Reason: ${detailReport.classification.reason}`,
  '',
  'Read-only: no deploy, provider writes, repository writes, merge or production.'
].join('\n') + '\n', 'utf8');

console.log(JSON.stringify({
  decision: detailReport.decision,
  classification: detailReport.classification,
  requestedObservability: detailReport.requestedObservability,
  fullySatisfiedAt: detailReport.fullySatisfiedAt,
  safety: detailReport.safety
}, null, 2));
