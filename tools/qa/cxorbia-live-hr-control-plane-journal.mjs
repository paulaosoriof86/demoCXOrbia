import fs from 'node:fs';
import path from 'node:path';

const command = process.argv[2];
const outputPath = process.env.CXORBIA_CONTROL_PLANE_JOURNAL || '.tmp/control-plane/journal.json';
const now = new Date().toISOString();

function fail(message) {
  console.error(message);
  process.exit(1);
}

function baseJournal() {
  return {
    schemaVersion: 'cxorbia.live-hr-control-plane-journal.v1',
    repository: process.env.GITHUB_REPOSITORY || null,
    workflow: process.env.GITHUB_WORKFLOW || null,
    eventName: process.env.GITHUB_EVENT_NAME || null,
    requestCommit: process.env.GITHUB_SHA || null,
    runId: process.env.GITHUB_RUN_ID || null,
    runAttempt: process.env.GITHUB_RUN_ATTEMPT || null,
    createdAt: now,
    updatedAt: now,
    state: 'WORKFLOW_STARTED_PROVIDER_READS_0',
    logicalProviderReadBoundaryEntered: false,
    logicalProviderReadSequenceCompleted: false,
    logicalProviderReadExecutionsLowerBound: 0,
    logicalProviderReadExecutionsUpperBound: 0,
    providerReadConsumption: 'ZERO_BEFORE_BOUNDARY',
    providerWrites: 0,
    hrWrites: 0,
    firestoreWrites: 0,
    authWrites: 0,
    rulesWrites: 0,
    storageWrites: 0,
    hostingDeploys: 0,
    cloudRunDeploys: 0,
    merge: false,
    production: false,
    pii: false,
    transitions: [{ state: 'WORKFLOW_STARTED_PROVIDER_READS_0', at: now }]
  };
}

function readJournal() {
  if (!fs.existsSync(outputPath)) fail(`control_plane_journal_missing:${outputPath}`);
  return JSON.parse(fs.readFileSync(outputPath, 'utf8'));
}

function writeJournal(journal) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  journal.updatedAt = now;
  fs.writeFileSync(outputPath, `${JSON.stringify(journal, null, 2)}\n`, 'utf8');
}

if (command === 'open') {
  if (!process.env.GITHUB_SHA) fail('github_sha_required');
  writeJournal(baseJournal());
  console.log('PASS_CONTROL_PLANE_JOURNAL_OPEN_PROVIDER_READS_0');
  process.exit(0);
}

const journal = readJournal();
if (journal.requestCommit !== (process.env.GITHUB_SHA || journal.requestCommit)) {
  fail('control_plane_request_commit_mismatch');
}

if (command === 'enter-provider-boundary') {
  if (journal.logicalProviderReadBoundaryEntered) fail('provider_boundary_already_entered');
  journal.state = 'PROVIDER_READ_BOUNDARY_ENTERED_MAX1';
  journal.logicalProviderReadBoundaryEntered = true;
  journal.logicalProviderReadExecutionsLowerBound = 0;
  journal.logicalProviderReadExecutionsUpperBound = 1;
  journal.providerReadConsumption = 'UNKNOWN_AFTER_BOUNDARY_MAX1';
  journal.transitions.push({ state: journal.state, at: now });
  writeJournal(journal);
  console.log('PASS_PROVIDER_READ_BOUNDARY_ENTERED_MAX1');
  process.exit(0);
}

if (command === 'complete-provider-sequence') {
  if (!journal.logicalProviderReadBoundaryEntered) fail('provider_boundary_not_entered');
  journal.state = 'PROVIDER_READ_SEQUENCE_COMPLETED_MAX1';
  journal.logicalProviderReadSequenceCompleted = true;
  journal.logicalProviderReadExecutionsLowerBound = 1;
  journal.logicalProviderReadExecutionsUpperBound = 1;
  journal.providerReadConsumption = 'CONSUMED_LOGICAL_EXECUTION_1';
  journal.transitions.push({ state: journal.state, at: now });
  writeJournal(journal);
  console.log('PASS_PROVIDER_READ_SEQUENCE_COMPLETED_LOGICAL_1');
  process.exit(0);
}

if (command === 'finalize') {
  const jobStatus = process.env.CXORBIA_JOB_STATUS || 'unknown';
  journal.finalJobStatus = jobStatus;
  journal.finalizedAt = now;
  journal.transitions.push({ state: `FINAL_${jobStatus.toUpperCase()}`, at: now });
  writeJournal(journal);
  console.log(`PASS_CONTROL_PLANE_JOURNAL_FINAL_${jobStatus.toUpperCase()}`);
  process.exit(0);
}

fail(`unknown_command:${command || 'missing'}`);
