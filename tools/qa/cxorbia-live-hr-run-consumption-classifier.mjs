#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const argv = process.argv.slice(2);
const readArg = (name, fallback = null) => {
  const index = argv.indexOf(name);
  return index >= 0 && argv[index + 1] ? argv[index + 1] : fallback;
};

const inputPath = readArg('--input');
const outputPath = readArg('--out');

if (!inputPath) {
  throw new Error('missing_required_argument:--input');
}

const source = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
if (source.schemaVersion !== 'cxorbia.live-hr-actions-run-observation.v1') {
  throw new Error('unsupported_input_schema');
}
if (!Array.isArray(source.runs) || source.runs.length === 0) {
  throw new Error('runs_required');
}

const boundaryName = source.contract?.providerBoundaryStepName
  || 'Mark provider-read boundary before provider access';
const sequenceName = source.contract?.providerSequenceStepName
  || 'Mark provider-read sequence completed';

const normalizeStep = (step) => ({
  name: String(step?.name || ''),
  status: String(step?.status || ''),
  conclusion: step?.conclusion == null ? null : String(step.conclusion)
});

const classifyRun = (run) => {
  const steps = Array.isArray(run.steps) ? run.steps.map(normalizeStep) : [];
  const boundaryStep = steps.find((step) => step.name === boundaryName) || null;
  const sequenceStep = steps.find((step) => step.name === sequenceName) || null;
  const boundaryCompleted = boundaryStep?.status === 'completed'
    && boundaryStep?.conclusion === 'success';
  const sequenceCompleted = sequenceStep?.status === 'completed'
    && sequenceStep?.conclusion === 'success';

  let providerReadConsumption = 'UNKNOWN_FAIL_CLOSED';
  let decision = 'HOLD_INSUFFICIENT_RUN_STEP_EVIDENCE';
  let providerReadLowerBound = 0;
  let providerReadUpperBound = 1;

  if (run.status === 'completed' && run.conclusion === 'cancelled' && steps.length === 0) {
    providerReadConsumption = 'PROVEN_ZERO_BEFORE_RUNNER_STEPS';
    decision = 'PASS_PROVIDER_READS_0_BEFORE_RUNNER_STEPS';
    providerReadUpperBound = 0;
  } else if (sequenceCompleted) {
    providerReadConsumption = 'PROVEN_LOGICAL_ONE';
    decision = 'PASS_PROVIDER_READ_SEQUENCE_COMPLETED_LOGICAL_1';
    providerReadLowerBound = 1;
    providerReadUpperBound = 1;
  } else if (boundaryCompleted) {
    providerReadConsumption = 'UNKNOWN_AFTER_BOUNDARY_AT_MOST_ONE';
    decision = 'HOLD_PROVIDER_BOUNDARY_REACHED_SEQUENCE_NOT_PROVEN';
  } else if (steps.length > 0 && boundaryStep == null) {
    providerReadConsumption = 'PROVEN_ZERO_BEFORE_PROVIDER_BOUNDARY_STEP';
    decision = 'PASS_PROVIDER_READS_0_BEFORE_PROVIDER_BOUNDARY';
    providerReadUpperBound = 0;
  }

  return {
    requestVersion: run.requestVersion || null,
    requestCommit: run.requestCommit || null,
    runId: Number(run.runId),
    jobId: Number(run.jobId),
    status: run.status,
    conclusion: run.conclusion,
    stepsCount: steps.length,
    providerBoundaryStepObserved: boundaryStep !== null,
    providerBoundaryCompleted: boundaryCompleted,
    providerSequenceStepObserved: sequenceStep !== null,
    providerSequenceCompleted: sequenceCompleted,
    providerReadConsumption,
    providerReadLowerBound,
    providerReadUpperBound,
    decision
  };
};

const runs = source.runs.map(classifyRun);
const allProviderReadsProvenZero = runs.every((run) => run.providerReadUpperBound === 0);
const anyUnknown = runs.some((run) => run.providerReadConsumption.startsWith('UNKNOWN'));

const report = {
  schemaVersion: 'cxorbia.live-hr-actions-run-consumption-classification.v1',
  generatedAt: new Date().toISOString(),
  sourceObservationSchema: source.schemaVersion,
  workflow: source.workflow || null,
  contract: {
    providerBoundaryStepName: boundaryName,
    providerSequenceStepName: sequenceName,
    invariant: 'provider access occurs only after provider boundary step'
  },
  runs,
  summary: {
    runsObserved: runs.length,
    allProviderReadsProvenZero,
    anyUnknown,
    totalProviderReadLowerBound: runs.reduce((sum, run) => sum + run.providerReadLowerBound, 0),
    totalProviderReadUpperBound: runs.reduce((sum, run) => sum + run.providerReadUpperBound, 0)
  },
  decision: allProviderReadsProvenZero
    ? 'PASS_V2_V3_PROVIDER_READS_0_PROVEN_BEFORE_RUNNER_STEPS'
    : 'HOLD_PROVIDER_READ_CONSUMPTION_NOT_FULLY_PROVEN',
  safety: {
    providerCallsPerformedByClassifier: 0,
    writesPerformedByClassifier: 0,
    requestModified: false,
    triggerEmitted: false
  }
};

const rendered = `${JSON.stringify(report, null, 2)}\n`;
if (outputPath) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, rendered, 'utf8');
} else {
  process.stdout.write(rendered);
}

if (!allProviderReadsProvenZero) {
  process.exitCode = 2;
}
