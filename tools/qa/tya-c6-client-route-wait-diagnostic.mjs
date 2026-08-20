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
let browser;
let detailReport;

try {
  browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'] });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, ignoreHTTPSErrors: true, serviceWorkers: 'block' });
  const page = await context.newPage();
  page.on('pageerror', error => pageErrors.push(String(error?.stack || error?.message || error)));
  page.on('console', message => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  await page.goto(`${root}/index-backend-dev.html?cxClientRouteDiagnostic=2&ts=${Date.now()}`, { waitUntil: 'domcontentloaded', timeout: 60000 });

  // Canonical C6 Auth contract: one visible product login. The obsolete
  // #cxIntegratedAuthStep overlay is intentionally removed by backend-browser-auth.js.
  await page.waitForSelector('#loginForm', { state: 'visible', timeout: 30000 });
  await page.waitForSelector('#lgUser', { state: 'visible', timeout: 30000 });
  await page.waitForSelector('#lgPass', { state: 'visible', timeout: 30000 });
  await page.waitForSelector('#lgSubmit', { state: 'visible', timeout: 30000 });
  await page.waitForSelector('.role-btn[data-role="cliente"]', { state: 'visible', timeout: 30000 });
  await page.waitForFunction(() => Boolean(
    window.CX?.app?.__firebaseBrowserAuthWrapped === true &&
    typeof window.CX?.backendAuth?.showForRole === 'function'
  ), null, { timeout: 30000 });

  await page.click('.role-btn[data-role="cliente"]');
  await page.waitForFunction(() => {
    const form = document.getElementById('loginForm');
    const button = document.querySelector('.role-btn[data-role="cliente"]');
    return form?.dataset?.selectedRole === 'cliente' || button?.getAttribute('aria-pressed') === 'true';
  }, null, { timeout: 15000 });

  const loginContract = await page.evaluate(() => ({
    singleVisibleProductLogin: true,
    formExists: Boolean(document.getElementById('loginForm')),
    userInputExists: Boolean(document.getElementById('lgUser')),
    passwordInputExists: Boolean(document.getElementById('lgPass')),
    submitExists: Boolean(document.getElementById('lgSubmit')),
    legacyOverlayExists: Boolean(document.getElementById('cxIntegratedAuthStep')),
    selectedRole: document.getElementById('loginForm')?.dataset?.selectedRole || null,
    browserAuthWrapped: window.CX?.app?.__firebaseBrowserAuthWrapped === true
  }));

  await page.fill('#lgUser', credentials.client.login);
  await page.fill('#lgPass', credentials.client.password);
  await page.click('#lgSubmit');

  let authReady = true;
  try {
    await page.waitForFunction(() => {
      const ctx = window.CX?.backendAuth?.context?.() || null;
      const authority = window.CX_PROTECTED_AUTH_HR_AUTHORITY || null;
      return Boolean(
        ctx?.authenticated === true &&
        ctx?.authNamespace === 'staff' &&
        ['cliente', 'client'].includes(String(ctx?.role || '')) &&
        authority?.applied === true &&
        document.getElementById('app')?.classList.contains('on') === true
      );
    }, null, { timeout: 90000 });
  } catch {
    authReady = false;
  }

  const authObservability = await page.evaluate(() => {
    const ctx = window.CX?.backendAuth?.context?.() || null;
    const error = document.getElementById('cxIntegratedAuthError');
    return {
      authenticated: ctx?.authenticated === true,
      authNamespace: ctx?.authNamespace || null,
      providerRole: ctx?.role || null,
      tenantId: ctx?.tenantId || null,
      projectIds: Array.isArray(ctx?.projectIds) ? ctx.projectIds.slice() : [],
      sessionRole: window.CX?.session?.role || null,
      sessionView: window.CX?.session?.view || null,
      authorityApplied: window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied === true,
      appOn: document.getElementById('app')?.classList.contains('on') === true,
      credentialErrorVisible: Boolean(error && error.style.display !== 'none' && String(error.textContent || '').trim()),
      credentialErrorText: error && error.style.display !== 'none' ? String(error.textContent || '').trim() : null
    };
  });

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

  let routeInvoke = null;
  const samples = [];
  let classification;
  let fullySatisfied = null;

  if (!authReady || !authObservability.authenticated || !authObservability.appOn) {
    classification = {
      owner: 'PRODUCT',
      code: 'PRODUCT_CLIENT_SINGLE_LOGIN_AUTH_NOT_ACCEPTED',
      reason: 'The exact existing Client credential was selected safely, but the canonical single visible product login did not establish the expected authenticated Client runtime.'
    };
  } else {
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

    fullySatisfied = samples.find(sample => sample.sessionView === 'cli_dashboard' && sample.viewExists && sample.viewTextLength > 0) || null;
    const rendered = [...samples].reverse().find(sample => sample.sessionView === 'cli_dashboard' && sample.viewExists && sample.viewTextLength > 0);
    const final = samples.at(-1);

    if (routeInvoke?.routeException || final?.renderException || pageErrors.length) {
      classification = {
        owner: 'PRODUCT',
        code: 'PRODUCT_CLIENT_ROUTE_RENDER_EXCEPTION',
        reason: 'The Client route produced a browser or render exception.'
      };
    } else if (fullySatisfied) {
      classification = {
        owner: 'PASS',
        code: 'PASS_CLIENT_SINGLE_LOGIN_AND_ROUTE_RENDER',
        reason: `Canonical Client single-login authentication and cli_dashboard rendering succeeded by ${fullySatisfied.label}.`
      };
    } else if (rendered) {
      classification = {
        owner: 'PASS',
        code: 'PASS_CLIENT_ROUTE_RENDER_WITHOUT_NAV_DECORATION_DEPENDENCY',
        reason: 'The Client dashboard rendered substantive content; navigation decoration is not treated as a product blocker.'
      };
    } else if (final?.sessionView !== 'cli_dashboard') {
      classification = {
        owner: 'PRODUCT',
        code: 'PRODUCT_CLIENT_ROUTE_NOT_ACCEPTED',
        reason: 'The router did not retain cli_dashboard as the active session view.'
      };
    } else if (!final?.viewExists) {
      classification = {
        owner: 'PRODUCT',
        code: 'PRODUCT_VIEW_CONTAINER_MISSING',
        reason: 'The canonical #view container was absent after Client-route navigation.'
      };
    } else {
      classification = {
        owner: 'PRODUCT',
        code: 'PRODUCT_CLIENT_DASHBOARD_EMPTY_RENDER',
        reason: 'The Client route was active but the canonical view remained empty.'
      };
    }
  }

  const finalSample = samples.at(-1) || null;
  detailReport = {
    schemaVersion: 'cxorbia.c6.client-route-wait-diagnostic.v2',
    generatedAt: new Date().toISOString(),
    decision: 'PASS_C6_CLIENT_ROUTE_WAIT_DIAGNOSTIC_CLASSIFIED',
    root,
    requestId: request.requestId,
    targetHeadSha: request.targetHeadSha,
    loginContract,
    authObservability,
    routeInvoke,
    requestedObservability: finalSample ? {
      sessionView: finalSample.sessionView,
      navElementExists: finalSample.navElementExists,
      navActive: finalSample.navActive,
      viewExists: finalSample.viewExists,
      pageHeaderExists: finalSample.pageHeaderExists,
      viewTextLength: finalSample.viewTextLength,
      renderException: finalSample.renderException || routeInvoke?.routeException || pageErrors.at(-1) || null
    } : null,
    classification,
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
    schemaVersion: 'cxorbia.c6.client-route-wait-diagnostic.failure.v2',
    generatedAt: new Date().toISOString(),
    decision: 'HOLD_C6_CLIENT_ROUTE_WAIT_DIAGNOSTIC_NOT_CLASSIFIED',
    error: String(error?.stack || error?.message || error),
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
check(['PASS', 'PRODUCT', 'HARNESS', 'INCONCLUSIVE'].includes(detailReport?.classification?.owner), 'classification_owner_present');
check(git('status', '--porcelain') === '', 'repository_unchanged_after_diagnostic');

const runnerReport = {
  schemaVersion: '1.5.0',
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
    purpose: 'Validate the canonical Client single visible product login and classify cli_dashboard rendering without deploy or data writes.'
  },
  stableVisitIdentity: null,
  checks,
  blockers: detailReport.classification.owner === 'PRODUCT' ? [detailReport.classification.code] : [],
  commands: ['node tools/qa/tya-c6-client-route-wait-diagnostic.mjs .github/cxorbia-gate-requests/request.json'],
  artifacts: [detailPath],
  summary: {
    status: 'PASS_READONLY_POST_GATES',
    profile: request.profile,
    browserExecuted: true,
    classification: detailReport.classification,
    loginContract: detailReport.loginContract,
    authObservability: detailReport.authObservability,
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
  '# CXOrbia Client single-login diagnostic',
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
  loginContract: detailReport.loginContract,
  authObservability: detailReport.authObservability,
  requestedObservability: detailReport.requestedObservability,
  fullySatisfiedAt: detailReport.fullySatisfiedAt,
  safety: detailReport.safety
}, null, 2));
