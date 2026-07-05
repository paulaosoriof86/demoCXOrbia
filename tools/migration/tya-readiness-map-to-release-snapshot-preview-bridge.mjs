#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const bridgeContractPath = path.join(root, 'app', 'contracts', 'readiness-map-to-release-snapshot-bridge-phase-a.tya.contract.json');
const snapshotContractPath = path.join(root, 'app', 'contracts', 'release-readiness-snapshot-preview-phase-a.tya.contract.json');

function parseArgs(argv) {
  const args = {
    input: null,
    output: null,
    tenantId: 'tya',
    projectId: 'cinepolis',
    snapshotId: `release-readiness-snapshot-synthetic-${new Date().toISOString().slice(0, 10)}-preview`,
    snapshotPeriodId: 'phase-a-202607',
    baselineRef: 'latest-audited-baseline-v87-no-delta',
    backendBranchRef: 'docs-tya-v6-v71-audit',
    pullRequestRef: 'PR-7',
    createdByRef: 'chatgpt-backend-preview',
    prototypeP0Status: 'pending'
  };
  for (let i = 2; i < argv.length; i += 1) {
    const token = argv[i];
    const next = argv[i + 1];
    if (token === '--input') { args.input = next; i += 1; }
    else if (token.startsWith('--input=')) args.input = token.slice('--input='.length);
    else if (token === '--output') { args.output = next; i += 1; }
    else if (token.startsWith('--output=')) args.output = token.slice('--output='.length);
    else if (token === '--tenantId') { args.tenantId = next; i += 1; }
    else if (token.startsWith('--tenantId=')) args.tenantId = token.slice('--tenantId='.length);
    else if (token === '--projectId') { args.projectId = next; i += 1; }
    else if (token.startsWith('--projectId=')) args.projectId = token.slice('--projectId='.length);
    else if (token === '--snapshotId') { args.snapshotId = next; i += 1; }
    else if (token.startsWith('--snapshotId=')) args.snapshotId = token.slice('--snapshotId='.length);
    else if (token === '--snapshotPeriodId') { args.snapshotPeriodId = next; i += 1; }
    else if (token.startsWith('--snapshotPeriodId=')) args.snapshotPeriodId = token.slice('--snapshotPeriodId='.length);
    else if (token === '--baselineRef') { args.baselineRef = next; i += 1; }
    else if (token.startsWith('--baselineRef=')) args.baselineRef = token.slice('--baselineRef='.length);
    else if (token === '--backendBranchRef') { args.backendBranchRef = next; i += 1; }
    else if (token.startsWith('--backendBranchRef=')) args.backendBranchRef = token.slice('--backendBranchRef='.length);
    else if (token === '--pullRequestRef') { args.pullRequestRef = next; i += 1; }
    else if (token.startsWith('--pullRequestRef=')) args.pullRequestRef = token.slice('--pullRequestRef='.length);
    else if (token === '--createdByRef') { args.createdByRef = next; i += 1; }
    else if (token.startsWith('--createdByRef=')) args.createdByRef = token.slice('--createdByRef='.length);
    else if (token === '--prototypeP0Status') { args.prototypeP0Status = next; i += 1; }
    else if (token.startsWith('--prototypeP0Status=')) args.prototypeP0Status = token.slice('--prototypeP0Status='.length);
  }
  return args;
}

function readJson(filePath) {
  if (!filePath) throw new Error('Missing --input');
  const resolved = path.isAbsolute(filePath) ? filePath : path.join(root, filePath);
  if (!fs.existsSync(resolved)) throw new Error(`Missing file: ${path.relative(root, resolved)}`);
  return JSON.parse(fs.readFileSync(resolved, 'utf8'));
}

function writeJson(filePath, payload) {
  const json = `${JSON.stringify(payload, null, 2)}\n`;
  if (!filePath) {
    console.log(json.trimEnd());
    return;
  }
  const resolved = path.isAbsolute(filePath) ? filePath : path.join(root, filePath);
  fs.mkdirSync(path.dirname(resolved), { recursive: true });
  fs.writeFileSync(resolved, json, 'utf8');
  console.log(JSON.stringify({ bridge: 'tya-readiness-map-to-release-snapshot-preview-bridge', status: 'wrote_release_snapshot_preview_input', output: path.relative(root, resolved) }, null, 2));
}

function ensureGatesOff(sourceMap, bridgeContract) {
  const issues = [];
  for (const flag of [
    'runtimeEnabled',
    'productionAllowed',
    'firestoreWritesAllowed',
    'storageWritesAllowed',
    'makeWriteAllowed',
    'emailSendAllowed',
    'whatsappSendAllowed',
    'geminiAllowed',
    'importRealDataAllowed',
    'deployAllowed',
    'mergeAllowed'
  ]) {
    if (bridgeContract[flag] !== false) issues.push(`contract_${flag}_must_remain_false`);
    if (sourceMap.safeGateSummary && sourceMap.safeGateSummary[flag] !== false) issues.push(`source_${flag}_must_remain_false`);
  }
  return issues;
}

function statusFromSource(sourceStatus, bridgeContract) {
  return bridgeContract.statusMap?.[sourceStatus] || 'manual_review_required';
}

function readinessFromSource(sourceStatus) {
  if (sourceStatus === 'synthetic_preview_ready') return 'ready_for_review';
  if (sourceStatus === 'preview_review_required') return 'manual_review_required';
  if (sourceStatus === 'blocked_sensitive_or_raw_field_key') return 'blocked_sensitive_data';
  if (sourceStatus === 'blocked_missing_input_or_fixture') return 'blocked_missing_input';
  if (sourceStatus === 'blocked_real_action_flag') return 'blocked_real_gate_off';
  if (sourceStatus === 'blocked_runner_error') return 'blocked_conflict';
  return 'manual_review_required';
}

function gateFromReadiness(readinessStatus) {
  if (String(readinessStatus).startsWith('blocked_')) return 'blocked';
  if (readinessStatus === 'manual_review_required') return 'manual_review_required';
  if (readinessStatus === 'ready_for_review') return 'off_verified';
  return 'off_required';
}

function item(base, overrides) {
  return {
    tenantId: base.tenantId,
    projectId: base.projectId,
    snapshotId: base.snapshotId,
    realActivationRequested: false,
    deployRequested: false,
    writeRequested: false,
    ...overrides
  };
}

function buildItems(sourceMap, args, bridgeContract) {
  const base = { tenantId: args.tenantId, projectId: args.projectId, snapshotId: args.snapshotId };
  const sourceReadiness = readinessFromSource(sourceMap.status);
  const sourceGate = gateFromReadiness(sourceReadiness);
  const blockingReasons = Array.isArray(sourceMap.blockingReasons) ? sourceMap.blockingReasons : [];
  const reviewReasons = Array.isArray(sourceMap.reviewReasons) ? sourceMap.reviewReasons : [];
  const reasonText = [...blockingReasons, ...reviewReasons].filter(Boolean).join('; ').slice(0, 500);
  const items = [];

  items.push(item(base, {
    readinessArea: 'release_governance',
    readinessStatus: sourceReadiness,
    gateStatus: sourceGate,
    validatorId: sourceMap.mapper || 'tya-synthetic-input-pack-readiness-map-preview',
    blockingReason: sourceReadiness.startsWith('blocked_') ? (reasonText || `source_status:${sourceMap.status}`) : undefined,
    manualReviewReason: sourceReadiness === 'manual_review_required' ? (reasonText || `source_status:${sourceMap.status}`) : undefined
  }));

  items.push(item(base, {
    readinessArea: 'sensitive_data_policy',
    readinessStatus: sourceMap.status === 'blocked_sensitive_or_raw_field_key' ? 'blocked_sensitive_data' : 'ready_for_review',
    gateStatus: sourceMap.status === 'blocked_sensitive_or_raw_field_key' ? 'blocked' : 'off_verified',
    validatorId: 'synthetic-pack-source-safety-map',
    blockingReason: sourceMap.status === 'blocked_sensitive_or_raw_field_key' ? (reasonText || 'source safety review required') : undefined
  }));

  items.push(item(base, {
    readinessArea: 'hr_source_preview',
    readinessStatus: sourceMap.status === 'blocked_missing_input_or_fixture' ? 'blocked_missing_input' : 'ready_for_review',
    gateStatus: sourceMap.status === 'blocked_missing_input_or_fixture' ? 'blocked' : 'off_verified',
    validatorId: 'synthetic-pack-fixture-availability-map',
    blockingReason: sourceMap.status === 'blocked_missing_input_or_fixture' ? (reasonText || 'fixture or input missing') : undefined
  }));

  items.push(item(base, {
    readinessArea: 'cx_data_adapter',
    readinessStatus: sourceMap.status === 'synthetic_preview_ready' ? 'ready_for_review' : 'manual_review_required',
    gateStatus: sourceMap.status === 'synthetic_preview_ready' ? 'off_verified' : 'manual_review_required',
    validatorId: 'synthetic-pack-adapter-preview-map',
    manualReviewReason: sourceMap.status === 'synthetic_preview_ready' ? undefined : (reasonText || `source_status:${sourceMap.status}`)
  }));

  const prototypePending = args.prototypeP0Status !== 'resolved';
  if (prototypePending) {
    items.push(item(base, {
      readinessArea: 'prototype_audit',
      readinessStatus: bridgeContract.defaultPrototypeP0Policy.statusWhenUnresolved,
      gateStatus: bridgeContract.defaultPrototypeP0Policy.gateStatus,
      validatorId: 'v87-forensic-audit-p0-honesty-operativa',
      blockingReason: bridgeContract.defaultPrototypeP0Policy.blockingReason,
      manualReviewReason: 'Claude corrective candidate required before source lock'
    }));
  } else {
    items.push(item(base, {
      readinessArea: 'prototype_audit',
      readinessStatus: 'ready_for_review',
      gateStatus: 'off_verified',
      validatorId: 'prototype-corrective-candidate-audit'
    }));
  }

  return items.map((row) => Object.fromEntries(Object.entries(row).filter(([, value]) => value !== undefined && value !== '')));
}

function buildPayload(sourceMap, args, bridgeContract) {
  if (sourceMap.mapper !== bridgeContract.allowedSourceMapper) {
    throw new Error(`Unsupported source mapper: ${sourceMap.mapper || 'missing'}`);
  }
  if (!bridgeContract.sourceMapStatuses.includes(sourceMap.status)) {
    throw new Error(`Unsupported source map status: ${sourceMap.status || 'missing'}`);
  }
  const gateIssues = ensureGatesOff(sourceMap, bridgeContract);
  const snapshotStatus = gateIssues.length ? 'blocked' : statusFromSource(sourceMap.status, bridgeContract);
  const readinessItems = buildItems(sourceMap, args, bridgeContract);
  if (gateIssues.length) {
    readinessItems.push({
      tenantId: args.tenantId,
      projectId: args.projectId,
      snapshotId: args.snapshotId,
      readinessArea: 'release_governance',
      readinessStatus: 'blocked_real_gate_off',
      gateStatus: 'blocked',
      validatorId: 'bridge-gate-integrity-check',
      blockingReason: gateIssues.join('; '),
      realActivationRequested: false,
      deployRequested: false,
      writeRequested: false
    });
  }

  return {
    sourceSafe: true,
    containsRawSensitiveData: false,
    isSyntheticOrSanitized: true,
    snapshot: {
      tenantId: args.tenantId,
      snapshotId: args.snapshotId,
      snapshotPeriodId: args.snapshotPeriodId,
      baselineRef: args.baselineRef,
      prototypeAuditRef: 'app/docs/AUDITORIA-FORENSE-V87-CXORBIA-20260705.md',
      backendBranchRef: args.backendBranchRef,
      pullRequestRef: args.pullRequestRef,
      createdByRef: args.createdByRef,
      status: snapshotStatus,
      deployAllowed: false,
      mergeAllowed: false,
      productionAllowed: false,
      firestoreWritesAllowed: false,
      importRealDataAllowed: false
    },
    readinessItems,
    bridgeMeta: {
      bridge: 'tya-readiness-map-to-release-snapshot-preview-bridge',
      sourceMapper: sourceMap.mapper,
      sourceStatus: sourceMap.status,
      productionDecision: bridgeContract.hardStops?.[0] || 'preview only',
      generatedAt: new Date().toISOString()
    }
  };
}

try {
  const args = parseArgs(process.argv);
  const bridgeContract = readJson(bridgeContractPath);
  readJson(snapshotContractPath);
  const sourceMap = readJson(args.input);
  const payload = buildPayload(sourceMap, args, bridgeContract);
  writeJson(args.output, payload);
} catch (error) {
  console.error(JSON.stringify({ bridge: 'tya-readiness-map-to-release-snapshot-preview-bridge', status: 'error', productionAllowed: false, error: error.message }, null, 2));
  process.exitCode = 1;
}
