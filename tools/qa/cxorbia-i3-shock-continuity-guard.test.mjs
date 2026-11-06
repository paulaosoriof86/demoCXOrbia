import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateShockContinuity, classifyModules} from './cxorbia-i3-shock-continuity-guard.mjs';

const freeze = 'CXORBIA_I3_PLAN_CHOQUE_CIERRE_MONOTONICO_FROZEN_2026-10-28.md';
const mk = () => {
  const modules = Array.from({length: 21}, (_, i) => ({domain: `domain-${i}`, classification: i < 5 ? 'MATCH' : 'SOURCE_FIXED_PENDING_QA_DEV_E2E_HUMAN'}));
  const matrix = {productSource: {sha: 'source'}, modules};
  const descriptor = {branch: 'recovery/cxorbia-phase-a-20260831', productSourceSha: 'source',
    moduleTruthPath: 'matrix.json', moduleTruthExpectedGitBlob: 'matrix-blob',
    production: 'DO_NOT_TOUCH', terminalCertificationAllowed: false,
    exactNextAction: 'G03 readback HR y finanzas; fusión Shopper 32/83 PROVISIONAL; Hosting DEV 3d1d42ad02066ae2 servido',
    i3FusionContinuityRecovered20261031: {receiptPath: 'receipt.json', receiptGitBlob: 'receipt-blob',
      lastIndependentVerifiedGroups: 31, provisionalVerifiedGroups: 32,
      provisionalPendingGroups: 51, recensusRequired: true},
    g03ActualHostingDevReadback20261031: {hostingVersion: 'sites/cxorbia-backend-dev/versions/3d1d42ad02066ae2',
      verifiedBrowserDevOnly: true},
    activeShockControl: {id: 'CXORBIA-I3-SHOCK-MONOTONIC-CLOSURE-20261028', path: freeze, gitBlob: 'freeze-blob'}};
  const pointer = {productSourceSha: 'source', state: 'HOLD', production: 'DO_NOT_TOUCH', authorizationI4: false,
    moduleTruthAuthority: {path: 'matrix.json', gitBlob: 'matrix-blob'},
    nextExactAction: descriptor.exactNextAction,
    i3FusionContinuityRecovered20261031: {...descriptor.i3FusionContinuityRecovered20261031},
    g03ActualHostingDevReadback20261031: {...descriptor.g03ActualHostingDevReadback20261031},
    activeShockControl: {...descriptor.activeShockControl},
    activeShockModuleTruth: {sourceSha: 'source', matrixPath: 'matrix.json', matrixBlob: 'matrix-blob', classificationCounts: classifyModules(matrix)},
    progressByStageSemantics: 'HISTORICAL_SNAPSHOTS_NOT_RELEASE_AUTHORITY'};
  const gitBlob = p => ({[freeze]: 'freeze-blob', 'matrix.json': 'matrix-blob',
    'receipt.json': 'receipt-blob'})[p] || '';
  return {descriptor, pointer, matrix, gitBlob};
};

const withLatestHostingOnlyProof = () => {
  const a = mk();
  a.pointer.currentCanonicalCheckpoint = {path:'V247.md',verifiedTotal:83,remaining:0};
  a.pointer.continuityHandoff = {path:'V247.md'};
  a.pointer.currentDevMaterialization = {sourceSha:'source',sourceTree:'tree',
    hostingVersion:'sites/cxorbia-backend-dev/versions/prior',runtimeRevision:'dev-rev',
    runtimeDigest:'sha256:stable',hostingRelease:'prior-release'};
  a.descriptor.productTreeAuthority = 'tree';
  a.descriptor.exactNextAction = 'I3 HOLD 83/83; G03 HR finanzas; Hosting DEV nuevo verificado; 5/21 MATCH';
  a.pointer.nextExactAction = a.descriptor.exactNextAction;
  a.descriptor.status = 'HOLD_I3_HOSTING_DEV_PASS_PENDING_ROLE_E2E';
  a.pointer.activeShockModuleTruth.meaning = 'HOSTING_DEV_VERIFIED_PENDING_E2E';
  const hosted = {receiptPath:'hosting-proof.json',receiptBlob:'hosting-proof-blob',
    sourceSha:'source',sourceTree:'tree',
    hostingVersion:'sites/cxorbia-backend-dev/versions/current',runtimeRevision:'dev-rev',
    verifiedServedAssetCount:9,cloudRunDeploys:0,firestoreRulesDeploys:0,
    productionChanged:false};
  a.descriptor.currentHostingOnlyDevMaterialization = {...hosted};
  a.pointer.currentHostingOnlyDevMaterialization = {...hosted};
  const previousBlob = a.gitBlob;
  a.gitBlob = file => file === 'hosting-proof.json' ? 'hosting-proof-blob' : previousBlob(file);
  return a;
};

const withBoundedPendingHostingSuccessor = () => {
  const a = withLatestHostingOnlyProof();
  a.descriptor.productSourceSha = 'new-source';
  a.pointer.productSourceSha = 'new-source';
  a.matrix.productSource.sha = 'new-source';
  a.matrix.productSource.authorityState = 'SOURCE_ONLY_PROVEN_PENDING_HOSTING_ONLY_DEV';
  a.matrix.productSource.message = 'New source-only fix pending first Hosting-only DEV materialization';
  a.descriptor.productTreeAuthority = 'new-tree';
  a.pointer.activeShockModuleTruth.sourceSha = 'new-source';
  const sealed = {mode:'PREDECESSOR_SERVING_PENDING_SOURCE',
    sourceSha:'source',sourceTree:'tree',
    hostingVersion:'sites/cxorbia-backend-dev/versions/prior',
    runtimeRevision:'dev-rev',runtimeDigest:'sha256:stable',hostingRelease:'prior-release'};
  a.descriptor.postDeployRunSeal = {...sealed};
  a.pointer.postDeployRunSeal = {...sealed};
  const proposed = {status:'PENDING_HOSTING_ONLY_DEV',findingId:'VRM-310',
    receiptPath:'source-proof.json',receiptBlob:'proof-blob',
    sourceSha:'new-source',sourceTree:'new-tree',
    predecessorServingSourceSha:'source',sourceTestsPass:14,sourceTestsFail:0,
    devPublished:false,production:false};
  a.descriptor.i3Nov06HrSourceStatusFix = {...proposed};
  a.pointer.i3Nov06HrSourceStatusFix = {...proposed};
  const previousBlob = a.gitBlob;
  a.gitBlob = file => file === 'source-proof.json' ? 'proof-blob' : previousBlob(file);
  return a;
};

test('same source, pointers, counts and frozen priority pass', () => {
  assert.equal(validateShockContinuity(mk()).pass, true);
});
test('stale next action fails closed', () => {
  const a = mk(); a.pointer.nextExactAction = 'Only diagnose D07 PDF';
  assert.match(validateShockContinuity(a).failures.join(' '), /NEXT_ACTION_DESYNC/);
});
test('legacy next-action field may not silently contradict the authoritative pointer', () => {
  const a = mk(); a.pointer.exactNextAction = '32/83 historical cohort, no remaining fusion decisions';
  assert.match(validateShockContinuity(a).failures.join(' '), /LEGACY_NEXT_ACTION_DESYNC/);
  a.pointer.exactNextAction = a.pointer.nextExactAction;
  assert.equal(validateShockContinuity(a).pass, true);
});
test('matching but stale pointers cannot erase a proven fusion or served DEV version', () => {
  const a = mk();
  a.descriptor.exactNextAction = 'G03 readback HR y finanzas; 29/83; Hosting a\u00fan NO servido en DEV';
  a.pointer.nextExactAction = a.descriptor.exactNextAction;
  const failures = validateShockContinuity(a).failures.join(' ');
  assert.match(failures, /SHOPPER_FUSION_PROGRESS_STALE/);
  assert.match(failures, /DEV_HOSTING_REALITY_STALE/);
  assert.doesNotMatch(failures, /NEXT_ACTION_DESYNC/);
});
test('current V5 checkpoint supersedes old receipt without erasing its historical identity proof', () => {
  const a = mk();
  a.pointer.currentCanonicalCheckpoint = {path: 'V5.md', verifiedTotal: 83, remaining: 0};
  a.pointer.continuityHandoff = {path: 'V5.md'};
  a.pointer.currentDevMaterialization = {
    sourceSha: 'source', sourceTree: 'tree', hostingVersion: 'sites/cxorbia-backend-dev/versions/new',
    runtimeRevision: 'dev-rev', runtimeDigest: 'sha256:abc', hostingRelease: 'new-release'};
  a.descriptor.productTreeAuthority = 'tree';
  a.descriptor.exactNextAction = 'I3 HOLD 83/83 groups; G03 HR finanzas; DEV source confirmed; 5/21 MATCH';
  a.pointer.nextExactAction = a.descriptor.exactNextAction;
  assert.equal(validateShockContinuity(a).pass, true);
  a.pointer.currentDevMaterialization.sourceSha = 'different-source';
  assert.match(validateShockContinuity(a).failures.join(' '), /DEV_HOSTING_REALITY_STALE/);
});
test('a verified old DEV seal is allowed while a new P0 source awaits materialization, without claiming it is served', () => {
  const a = mk();
  a.pointer.currentCanonicalCheckpoint = {path:'V7.md',verifiedTotal:83,remaining:0};
  a.pointer.continuityHandoff = {path:'V7.md'};
  a.descriptor.exactNextAction = 'G03 HR finanzas 83/83, DEV actual previo, P0 source awaiting materialization';
  a.pointer.nextExactAction = a.descriptor.exactNextAction;
  a.pointer.currentDevMaterialization = {sourceSha:'predecessor',sourceTree:'old-tree',hostingVersion:'sites/cxorbia-backend-dev/versions/old',runtimeRevision:'old-rev',runtimeDigest:'sha256:old',hostingRelease:'old-release'};
  const seal = {mode:'PREDECESSOR_SERVING_PENDING_SOURCE',sourceSha:'predecessor',sourceTree:'old-tree',hostingVersion:'sites/cxorbia-backend-dev/versions/old',runtimeRevision:'old-rev',runtimeDigest:'sha256:old',hostingRelease:'old-release'};
  a.descriptor.postDeployRunSeal = {...seal};a.pointer.postDeployRunSeal = {...seal};
  assert.equal(validateShockContinuity(a).pass,true);
  a.pointer.currentDevMaterialization.sourceSha = 'source';
  assert.match(validateShockContinuity(a).failures.join(' '),/DEV_HOSTING_REALITY_STALE/);
});
test('newer Hosting-only receipt is independently pinned while previous paired runtime seal remains intact', () => {
  assert.equal(validateShockContinuity(withLatestHostingOnlyProof()).pass, true);
});
test('one exact source-tested successor can await Hosting-only DEV without falsifying prior Hosting', () => {
  assert.equal(validateShockContinuity(withBoundedPendingHostingSuccessor()).pass, true);
});
test('a pending source cannot claim an unrelated or unproven previous Hosting deployment', () => {
  const a = withBoundedPendingHostingSuccessor();
  a.descriptor.i3Nov06HrSourceStatusFix.predecessorServingSourceSha = 'some-other-source';
  assert.match(validateShockContinuity(a).failures.join(' '), /ACTIVE_HOSTING_ONLY_COMPONENT_DESYNC/);
  const b = withBoundedPendingHostingSuccessor();
  b.pointer.i3Nov06HrSourceStatusFix.sourceTestsPass = 0;
  assert.match(validateShockContinuity(b).failures.join(' '), /ACTIVE_HOSTING_ONLY_COMPONENT_DESYNC/);
  const c = withBoundedPendingHostingSuccessor();
  c.descriptor.i3Nov06HrSourceStatusFix.production = true;
  assert.match(validateShockContinuity(c).failures.join(' '), /ACTIVE_HOSTING_ONLY_COMPONENT_DESYNC/);
  const d = withBoundedPendingHostingSuccessor();
  d.pointer.i3Nov06HrSourceStatusFix.receiptBlob = 'unverified-proof';
  assert.match(validateShockContinuity(d).failures.join(' '), /ACTIVE_HOSTING_ONLY_COMPONENT_DESYNC/);
});
test('a newer Hosting deployment cannot retain stale source-only or pending-materialization status', () => {
  const a = withLatestHostingOnlyProof();
  a.descriptor.status = 'HOLD_I3_SOURCE_ONLY_PENDING_DEV_MATERIALIZATION';
  assert.match(validateShockContinuity(a).failures.join(' '), /STALE_HOSTING_MATERIALIZATION_STATUS/);
  a.descriptor.status = 'HOLD_I3_HOSTING_DEV_PASS_PENDING_ROLE_E2E';
  a.pointer.activeShockModuleTruth.meaning = 'SOURCE_ONLY_PENDING_DEV';
  assert.match(validateShockContinuity(a).failures.join(' '), /STALE_HOSTING_MATERIALIZATION_STATUS/);
});
test('a newer Hosting receipt mismatched across descriptor, pointer or provider is not a green control', () => {
  const a = withLatestHostingOnlyProof();
  a.pointer.currentHostingOnlyDevMaterialization.hostingVersion = 'sites/cxorbia-backend-dev/versions/wrong';
  assert.match(validateShockContinuity(a).failures.join(' '), /ACTIVE_HOSTING_ONLY_RECEIPT_DESYNC/);
  const b = withLatestHostingOnlyProof();
  b.descriptor.currentHostingOnlyDevMaterialization.sourceSha = 'unproved-source';
  assert.match(validateShockContinuity(b).failures.join(' '), /ACTIVE_HOSTING_ONLY_COMPONENT_DESYNC/);
  const c = withLatestHostingOnlyProof();
  c.pointer.currentHostingOnlyDevMaterialization.productionChanged = true;
  assert.match(validateShockContinuity(c).failures.join(' '), /ACTIVE_HOSTING_ONLY_RECEIPT_DESYNC/);
});
test('V5 current checkpoint cannot claim more fused profiles than the approved cohort', () => {
  const a = mk();
  a.pointer.currentCanonicalCheckpoint = {verifiedTotal: 84, remaining: 0};
  a.descriptor.exactNextAction = 'G03 HR finanzas; 84/83';
  a.pointer.nextExactAction = a.descriptor.exactNextAction;
  assert.match(validateShockContinuity(a).failures.join(' '), /SHOPPER_FUSION_PROGRESS_STALE/);
});
test('lost receipt or divergent fusion status fails closed', () => {
  const a = mk();
  a.pointer.i3FusionContinuityRecovered20261031.provisionalVerifiedGroups = 31;
  const failures = validateShockContinuity(a).failures.join(' ');
  assert.match(failures, /SHOPPER_FUSION_RECEIPT_DESYNC/);
  const b = mk();
  b.gitBlob = () => 'wrong';
  assert.match(validateShockContinuity(b).failures.join(' '), /SHOPPER_FUSION_RECEIPT_DESYNC/);
});
test('stale module counts fail closed', () => {
  const a = mk(); a.pointer.activeShockModuleTruth.classificationCounts.MATCH = 4;
  assert.match(validateShockContinuity(a).failures.join(' '), /CLASSIFICATION_COUNTS_STALE/);
});
test('a legacy direct matrix path cannot silently point at a superseded version', () => {
  const a = mk(); a.pointer.moduleTruthPath = 'old-v245.json';
  assert.match(validateShockContinuity(a).failures.join(' '), /LEGACY_MATRIX_PATH_DESYNC/);
});
test('matrix-reported counts must match actual module classifications', () => {
  const a = mk(); a.matrix.classificationCounts = {...classifyModules(a.matrix), MATCH: 6};
  assert.match(validateShockContinuity(a).failures.join(' '), /MATRIX_REPORTED_CLASS_COUNTS_STALE/);
});
test('a current Hosting receipt rejects a matrix that still claims source-only predecessor', () => {
  const a = withLatestHostingOnlyProof();
  a.matrix.productSource.authorityState = 'SOURCE_ONLY_PROVEN_NOT_YET_COMPOSED_OR_DEV_MATERIALIZED';
  assert.match(validateShockContinuity(a).failures.join(' '), /MATRIX_SOURCE_ONLY_STATUS_AFTER_HOSTING_DEV/);
});
test('different source and frozen document bytes fail closed', () => {
  const a = mk(); a.pointer.productSourceSha = 'other'; a.pointer.activeShockControl.gitBlob = 'other';
  const failures = validateShockContinuity(a).failures.join(' ');
  assert.match(failures, /SOURCE_POINTER_DESYNC/);
  assert.match(failures, /FROZEN_PRIORITY_BLOB_DESYNC/);
});
test('premature production and stale progress authority fail closed', () => {
  const a = mk(); a.pointer.authorizationI4 = true; delete a.pointer.progressByStageSemantics;
  const failures = validateShockContinuity(a).failures.join(' ');
  assert.match(failures, /PREMATURE_PRODUCTION/);
  assert.match(failures, /STALE_PROGRESS_AS_LIVE/);
});

test('the frozen shock status schedules the existing source proof after authority and has no cloud permissions', () => {
  const workflow = fs.readFileSync(new URL('../../.github/workflows/cxorbia-recovery-i3-dev-certification.yml', import.meta.url), 'utf8');
  const block = workflow.split('\n  phasea-rejected-checkpoint-source-proof:\n')[1]?.split(/\n  [a-z0-9-]+:\n/)[0];
  assert.ok(block, 'existing source-proof job must be present');
  assert.match(block, /needs: canonical-candidate-authority/);
  const condition = block.match(/^   if: (.+)$/m)?.[1] || '';
  const values = condition.match(/fromJSON\('([^']+)'\)/)?.[1];
  assert.ok(values, 'source-proof routing must have an explicit accepted-status list');
  const allowed = JSON.parse(values);
  assert.ok(allowed.includes('HOLD_I3_PHASE_A_CROSS_FUNCTIONAL_SHOCK_CONTROL'), 'current frozen shock status must execute source proof');
  assert.ok(allowed.includes('HOLD_I3_B_CUMULATIVE_SOURCE_PROOF_REQUIRED'), 'preserve the existing source-proof status');
  assert.equal(allowed.includes('GO'), false);
  assert.equal(allowed.includes('READY_FOR_TERMINAL_CERTIFICATION'), false);
  assert.match(block, /permissions: \{contents: read\}/);
  assert.match(block, /CXORBIA_I3_PHASEA_COMPLETION_CONTROL_20261007\.sh source-proof/);
  assert.doesNotMatch(block, /google-github-actions|secrets\.|id-token: write|\.sh (?:preflight|materialize|readback|proof)\b/);
});

test('source-proof accepts shock without weakening materialization guards or reporting invented closure counts', () => {
  const script = fs.readFileSync(new URL('../../.github/control/CXORBIA_I3_PHASEA_COMPLETION_CONTROL_20261007.sh', import.meta.url), 'utf8');
  const source = script.split('source-proof)\n')[1]?.split('\npreflight)')[0] || '';
  const preflight = script.split('\npreflight)')[1]?.split('\nmaterialize)')[0] || '';
  assert.match(source, /HOLD_I3_PHASE_A_CROSS_FUNCTIONAL_SHOCK_CONTROL/);
  assert.match(source, /productSourceSha/);
  assert.match(source, /productTreeAuthority/);
  assert.match(source, /git diff --quiet/);
  assert.match(source, /SOURCE_CONTRACTS_ONLY_NOT_I3_CERTIFICATION/);
  assert.doesNotMatch(source, /trueFunctionalDefects:0|g05FocalPass:113/);
  assert.doesNotMatch(source, /gcloud|credentials_json|firebase deploy|firestore\.collection/);
  assert.doesNotMatch(preflight, /HOLD_I3_PHASE_A_CROSS_FUNCTIONAL_SHOCK_CONTROL/);
  const adminInstall = source.indexOf('firebase-admin@13.4.0');
  assert.ok(adminInstall >= 0 && adminInstall < source.indexOf('node tools/qa/'), 'the pinned Admin SDK must be available before source tests import it');
});

test('the canonical workflow remains within the enforced 500 KB file limit', () => {
  const bytes = fs.statSync(new URL('../../.github/workflows/cxorbia-recovery-i3-dev-certification.yml', import.meta.url)).size;
  assert.ok(bytes <= 500 * 1024, `workflow is ${bytes} bytes; GitHub rejects it before any job above 512000 bytes`);
});



const withPendingRuntimeHostingSuccessor=()=>{
 const a=withBoundedPendingHostingSuccessor();
 delete a.descriptor.i3Nov06HrSourceStatusFix;delete a.pointer.i3Nov06HrSourceStatusFix;
 a.matrix.productSource.authorityState='SOURCE_ONLY_PROVEN_PENDING_RUNTIME_AND_HOSTING_DEV';
 a.descriptor.status='HOLD_VRM154_156_DEV_MATERIALIZATION_REQUIRED';
 a.pointer.activeShockModuleTruth.meaning='SOURCE_ONLY_PENDING_DEV';
 const product=['app/modules/cert.js','backend/runtime/hr-live-service/certification-runtime.mjs'];
 const proof={sourceSha:'new-source',sourceTree:'new-tree',predecessorProductSourceSha:'source',
  sourceTestsPass:30,sourceTestsFail:0,allowedProductFiles:product,allowedTestFiles:['backend/runtime/hr-live-service/test/project.test.mjs'],
  production:false,findings:[{id:'P0-example',priority:'P0_PROVEN'}],scopeReceiptPath:'scope.json',scopeReceiptBlob:'scope-blob'};
 const proposed={...proof,state:'P0_PROVEN_PENDING_DEV_MATERIALIZATION',scope:'RUNTIME_AND_HOSTING',
  proofReceiptPath:'proof.json',proofReceiptBlob:'proof-blob',devPublished:false,rulesDeploys:0,storageRulesDeploys:0,
  servingHosting:{...a.descriptor.currentHostingOnlyDevMaterialization},servingRuntimeSeal:{...a.descriptor.postDeployRunSeal}};
 a.descriptor.pendingDevSuccessor=structuredClone(proposed);a.pointer.pendingDevSuccessor=structuredClone(proposed);
 const before=a.gitBlob;a.gitBlob=file=>({'proof.json':'proof-blob','scope.json':'scope-blob'}[file]||before(file));
 a.gitAncestor=()=>true;
 a.gitRead=args=>args[0]==='rev-parse'?'new-tree':args[0]==='diff'?product.join('\n'):
  args[1]==='HEAD:proof.json'?JSON.stringify(proof):args[1]==='HEAD:scope.json'?JSON.stringify({allowedProductFiles:product}):'';
 return a;
};
test('one proven runtime/Hosting successor retains immutable serving receipts while waiting for DEV',()=>{
 assert.equal(validateShockContinuity(withPendingRuntimeHostingSuccessor()).pass,true);
});
test('runtime/Hosting pending transition rejects tree, ancestry, committed proof or extra product drift',()=>{
 for(const mutate of [
  a=>{const prior=a.gitRead;a.gitRead=args=>args[0]==='rev-parse'?'wrong-tree':prior(args);},
  a=>{a.gitAncestor=()=>false;},
  a=>{const prior=a.gitBlob;a.gitBlob=p=>p==='proof.json'?'altered':prior(p);},
  a=>{const prior=a.gitRead;a.gitRead=args=>args[0]==='diff'?prior(args)+'\napp/modules/finance.js':prior(args);},
  a=>{const prior=a.gitRead;a.gitRead=args=>args[1]==='HEAD:proof.json'?JSON.stringify({...JSON.parse(prior(args)),sourceTestsFail:1}):prior(args);},
  a=>{a.pointer.pendingDevSuccessor.sourceSha='parallel-source';},
  a=>{a.descriptor.pendingDevSuccessor.devPublished=true;a.pointer.pendingDevSuccessor.devPublished=true;},
  a=>{a.descriptor.pendingDevSuccessor.servingHosting.hostingVersion='unverified';a.pointer.pendingDevSuccessor.servingHosting.hostingVersion='unverified';}
 ]){
  const a=withPendingRuntimeHostingSuccessor();mutate(a);
  assert.match(validateShockContinuity(a).failures.join(' '),/PENDING_DEV_SUCCESSOR_UNPROVEN/);
 }
});
