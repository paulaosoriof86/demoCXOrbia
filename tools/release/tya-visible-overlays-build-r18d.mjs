#!/usr/bin/env node
/*
  CXOrbia Phase A R18D — build-time visible overlay for existing R11D/R14C/certification results.

  This tool runs only on a checked-out build copy. It does not modify app/modules,
  app/core, providers, Firestore, HR, production or the checked-in V131 runtime.
*/
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const args = process.argv.slice(2);
const valueOf = (flag, fallback) => {
  const index = args.indexOf(flag);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
};

const root = process.cwd();
const htmlPath = path.resolve(valueOf('--html', 'app/index.html'));
const payloadSrc = valueOf('--payload-src', 'data/tya-hr-source-safe-periods.js');
const baseAdapterSrc = valueOf('--base-adapter-src', 'adapters/tya-phase-a-source-safe-dev-adapter-r18a.js');
const overlayAdapterSrc = valueOf('--overlay-adapter-src', 'adapters/tya-phase-a-visible-overlays-r18d.js');
const reportDir = path.resolve(valueOf('--out', '.tmp/r18d-visible-overlay-build'));
const mode = valueOf('--mode', 'apply');

function fail(message, code = 2) {
  console.error(message);
  process.exit(code);
}

if (!fs.existsSync(htmlPath)) fail(`Missing HTML: ${htmlPath}`);
const appDir = path.dirname(htmlPath);
const payloadFile = path.join(appDir, payloadSrc);
const baseAdapterFile = path.join(appDir, baseAdapterSrc);
const overlayAdapterFile = path.join(appDir, overlayAdapterSrc);
if (!fs.existsSync(payloadFile)) fail(`Missing R18B source-safe payload: ${payloadFile}`);
if (!fs.existsSync(baseAdapterFile)) fail(`Missing R18A base adapter: ${baseAdapterFile}`);

const payloadText = fs.readFileSync(payloadFile, 'utf8');
if (!payloadText.includes('R18B_APPLY_EXISTING_R11D_R14C_AND_CERTIFICATION_OUTPUTS')) {
  fail('R18D requires the R18B payload with existing overlays applied.', 3);
}

const adapterCode = `/* CXOrbia Phase A R18D visible overlays. Generated at build time; no provider calls or writes. */
window.CX = window.CX || {};
(function(){
  const params = new URLSearchParams(window.location.search || '');
  const host = String(window.location.hostname || '').toLowerCase();
  const enabled = host === 'cxorbia-backend-dev.web.app' || params.get('cxTyaPhaseA') === '1';
  const snapshot = window.CX_TYA_HR_SOURCE_SAFE || null;
  window.CX_TYA_R18D_VISIBLE_READY = false;
  if(!enabled || !window.CX || !CX.data || !snapshot) return;
  if(snapshot.existingOverlays?.integrationId !== 'R18B_APPLY_EXISTING_R11D_R14C_AND_CERTIFICATION_OUTPUTS') return;

  const clone = value => JSON.parse(JSON.stringify(value));
  const sourceVisits = new Map((snapshot.visits || []).map(item => [item.id, item]));
  CX.data._visitas = (CX.data._visitas || []).map(current => {
    const source = sourceVisits.get(current.id);
    if(!source) return current;
    const exact = source.financialControl && source.financialControl.appliedFrom === 'R14C_existing_result';
    return Object.assign({}, current, {
      financialControl: source.financialControl ? clone(source.financialControl) : null,
      liquidationState: source.liquidationState || current.liquidationState || null,
      paymentState: source.paymentState || current.paymentState || null,
      paymentConfirmed: source.paymentConfirmed === true,
      paymentControlOnly: source.paymentControlOnly === true,
      paymentEvidence: source.paymentEvidence || null,
      paid: false,
      lotEligible: false,
      reviewRequired: source.reviewRequired === true,
      reviewReasons: Array.isArray(source.reviewReasons) ? [...source.reviewReasons] : [],
      r14cExactControl: exact,
      sourceSafe: true,
      imported: false,
      production: false
    });
  });

  const sourceShoppers = new Map((snapshot.shoppers || []).map(item => [item.shopperId || item.id, item]));
  CX.data.shoppers = (CX.data.shoppers || []).map(current => {
    const source = sourceShoppers.get(current.shopperId || current.id);
    if(!source) return current;
    return Object.assign({}, current, {
      certificationStatus: source.certificationStatus || 'pending_certification_source',
      certificationCarryoverConfirmed: source.certificationCarryoverConfirmed === true,
      certificationReviewRequired: source.certificationReviewRequired !== false,
      certificationSourceStatus: source.certificationSourceStatus || 'pending_certification_source',
      sourceSafe: true,
      piiProtected: true
    });
  });

  const queue = Array.isArray(snapshot.reviewQueue) ? clone(snapshot.reviewQueue) : [];
  const financialReview = queue.filter(item => item.appliedFrom === 'R14C_existing_result');
  const shopperReview = queue.filter(item => item.appliedFrom === 'R11D_existing_result');
  const certificationReview = queue.filter(item => item.queueType === 'certification_source_pending');
  const exactControls = (CX.data._visitas || []).filter(item => item.r14cExactControl === true);
  const certificationHold = (CX.data.shoppers || []).filter(item => item.certificationCarryoverConfirmed !== true);

  CX.data.reviewQueue = queue;
  CX.data.financialReviewQueue = financialReview;
  CX.data.shopperReviewQueue = shopperReview;
  CX.data.certificationReviewQueue = certificationReview;
  CX.data.previewMeta = Object.assign({}, CX.data.previewMeta || {}, {
    overlayVersion: 'R18D_VISIBLE_EXISTING_OVERLAYS',
    financialExactLinks: exactControls.length,
    financialReviewQueue: financialReview.length,
    shopperReviewQueue: shopperReview.length,
    certificationReviewQueue: certificationReview.length,
    certificationHoldShoppers: certificationHold.length,
    paidConfirmed: 0,
    certificationCarryoverConfirmed: 0,
    requestedAgainAutomatically: Number(snapshot.existingOverlays?.certification?.requestedAgainAutomatically || 0),
    writes: false,
    imported: false,
    production: false
  });

  window.CX_TYA_R18D_VISIBLE_CONTRACT = {
    integrationId: 'R18D_VISIBLE_EXISTING_OVERLAYS',
    tenantId: snapshot.tenantId,
    projectId: snapshot.projectId,
    periodCount: Array.isArray(snapshot.periods) ? snapshot.periods.length : 0,
    visitCount: Array.isArray(snapshot.visits) ? snapshot.visits.length : 0,
    shopperCount: Array.isArray(snapshot.shoppers) ? snapshot.shoppers.length : 0,
    financialExactLinks: exactControls.length,
    financialReviewQueue: financialReview.length,
    shopperReviewQueue: shopperReview.length,
    certificationReviewQueue: certificationReview.length,
    certificationSourceRecords: Number(snapshot.existingOverlays?.certification?.sourceRecords || 0),
    certificationHoldShoppers: certificationHold.length,
    certificationCarryoverConfirmed: 0,
    requestedAgainAutomatically: Number(snapshot.existingOverlays?.certification?.requestedAgainAutomatically || 0),
    paidConfirmed: 0,
    paymentLotsCreated: 0,
    writes: false,
    imported: false,
    production: false,
    runtimeSyncActive: false,
    sourceSafe: true
  };

  document.documentElement.setAttribute('data-cx-financial-overlay', 'r14c-pending-review');
  document.documentElement.setAttribute('data-cx-certification-carryover', 'hold-pending-source');
  window.CX_TYA_R18D_VISIBLE_READY = true;
  window.dispatchEvent(new CustomEvent('cx:r18d-visible-ready', {detail: clone(window.CX_TYA_R18D_VISIBLE_CONTRACT)}));
})();
`;

if (mode === 'apply') {
  fs.mkdirSync(path.dirname(overlayAdapterFile), { recursive: true });
  fs.writeFileSync(overlayAdapterFile, adapterCode, 'utf8');
}
if (!fs.existsSync(overlayAdapterFile)) fail(`Missing generated R18D overlay adapter: ${overlayAdapterFile}`);

let html = fs.readFileSync(htmlPath, 'utf8');
const baseTag = `<script src="${baseAdapterSrc}"></script>`;
const overlayTag = `<script src="${overlayAdapterSrc}"></script>`;
const count = (text, needle) => text.split(needle).length - 1;
const before = { baseAdapterTags: count(html, baseTag), overlayAdapterTags: count(html, overlayTag) };
if (before.baseAdapterTags !== 1) fail(`Expected one R18A base adapter tag, got ${before.baseAdapterTags}.`, 3);
if (before.overlayAdapterTags > 1) fail('Duplicate R18D overlay adapter tags detected.', 3);

if (mode === 'apply' && before.overlayAdapterTags === 0) {
  html = html.replace(baseTag, `${baseTag}\n${overlayTag}`);
  fs.writeFileSync(htmlPath, html, 'utf8');
}

const afterHtml = fs.readFileSync(htmlPath, 'utf8');
const after = {
  baseAdapterTags: count(afterHtml, baseTag),
  overlayAdapterTags: count(afterHtml, overlayTag),
  baseAdapterPosition: afterHtml.indexOf(baseTag),
  overlayAdapterPosition: afterHtml.indexOf(overlayTag),
  appBootPosition: afterHtml.indexOf('<script src="app.js"></script>')
};
const generated = fs.readFileSync(overlayAdapterFile, 'utf8');
const semanticChecks = {
  exactFinancialControlExposed: generated.includes('financialExactLinks'),
  financialReviewQueueExposed: generated.includes('financialReviewQueue'),
  noPaymentConfirmation: generated.includes('paidConfirmed: 0') && generated.includes('paymentLotsCreated: 0'),
  certificationHoldExposed: generated.includes('certificationHoldShoppers') && generated.includes('requestedAgainAutomatically'),
  noFrontendModuleMutation: !generated.includes('CX.module('),
  noProviderCall: !/firebase|fetch\(|XMLHttpRequest|https:\/\//i.test(generated)
};
const structuralValid = after.baseAdapterTags === 1 && after.overlayAdapterTags === 1 &&
  after.overlayAdapterPosition > after.baseAdapterPosition && after.appBootPosition > after.overlayAdapterPosition;
const valid = structuralValid && Object.values(semanticChecks).every(Boolean);

const report = {
  schemaVersion: '1.0.0',
  reportId: 'phase-a-r18d-visible-overlay-build',
  generatedAt: new Date().toISOString(),
  mode,
  decision: valid ? 'PASS_R18D_VISIBLE_OVERLAY_BUILD' : 'FAIL_R18D_VISIBLE_OVERLAY_BUILD',
  html: path.relative(root, htmlPath).replace(/\\/g, '/'),
  adapter: path.relative(root, overlayAdapterFile).replace(/\\/g, '/'),
  buildCopyModified: mode === 'apply',
  sourceLockRepoFileModifiedByCommit: false,
  before,
  after,
  semanticChecks,
  gates: {
    frontendModulesModified: false,
    coreFilesModified: false,
    providerCalls: false,
    firestoreWrites: false,
    hrWrites: false,
    imports: false,
    deploy: false,
    production: false
  }
};
fs.mkdirSync(reportDir, { recursive: true });
fs.writeFileSync(path.join(reportDir, 'r18d-visible-overlay-build.json'), JSON.stringify(report, null, 2) + '\n', 'utf8');
fs.writeFileSync(path.join(reportDir, 'r18d-visible-overlay-build.md'), [
  '# R18D visible overlay build', '',
  `Decision: **${report.decision}**`,
  `Generated adapter: ${report.adapter}`,
  `Overlay tag count: ${after.overlayAdapterTags}`, '',
  'Build-copy only. No app/modules or app/core changes, providers, writes, imports, deploy or production.'
].join('\n') + '\n', 'utf8');
console.log(JSON.stringify(report, null, 2));
process.exitCode = valid ? 0 : 4;
