import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {randomUUID} from 'node:crypto';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {setTimeout as delay} from 'node:timers/promises';
import {admitReaderCall, readerTicketKey, runAdmittedSnapshot, readReaderOutcome, withReaderIdentity}
  from '../../backend/runtime/hr-live-service/hr-read-admission.mjs';

assert.match(process.env.FIRESTORE_EMULATOR_HOST || '', /^127\.0\.0\.1:[1-9]\d{3,4}$/);
const script = fileURLToPath(import.meta.url);
const [role, runId] = process.argv.slice(2);
const phases = ['seal-meta', 'seal-json', 'canonical-before', 'canonical-json', 'canonical-after'];
const actor = 'google:12345';
const scope = {tenantId:'qa', projectId:'deadline-fixture'};
const bindingKey = 'a'.repeat(64);
const inputs = Array.from({length:6}, (_, i) => ({...scope, countryCode:'GT', periodId:'qa-month',
  bindingFingerprint:bindingKey, driveId:'synthetic-drive', itemId:'synthetic-book', worksheetId:'tab-'+i, rangeAddress:'A1:B2'}));

async function child() {
  assert.match(runId, /^[a-f0-9-]{36}$/);
  const require = createRequire(new URL('../../backend/runtime/hr-live-service/package.json', import.meta.url));
  const {initializeApp, deleteApp} = require('firebase-admin/app');
  const {getFirestore} = require('firebase-admin/firestore');
  const app = initializeApp({projectId:'demo-cxorbia-hr-budget'});
  const db = getFirestore(app);
  const policy = db.doc('cxorbiaProviderBudgets/dev_make_hr_reader');
  const requestId = phase => runId+'-'+phase;
  const submit = (phase,work) => withReaderIdentity({...scope,actor,process:phase,runId,requestId:requestId(phase)},
    () => runAdmittedSnapshot({db,scope,bindingKey,work}));
  try {
    if (role === 'arm') {
      // create() refuses an already occupied emulator; the test never replaces another grant.
      await policy.create({...scope, purpose:'paired-dev-hr-probes', enabled:true, windowId:runId,
        expiresAt:Date.now()+15000, bindingKey, maxCreditsPerCall:3, spendingLimit:90,
        protectedAllocation:190, recoveryReserve:100, reserved:0, allocationReceiptSha256:'f'.repeat(64),
        grants:phases.map(process=>({process,actor,runId,maxCalls:6,tickets:inputs.map(readerTicketKey)}))});
      return;
    }
    const window = (await policy.get()).data();
    assert.equal(window?.windowId, runId);
    let calls = 0;
    if (role === 'in-flight') {
      await assert.rejects(submit(phases[0], async () => {
        await admitReaderCall(inputs[0], async () => ++calls);
        await delay(Math.max(0, window.expiresAt-Date.now())+30);
        await admitReaderCall(inputs[1], async () => ++calls);
      }), /HR_READ_WINDOW_CLOSED/);
      assert.equal(calls, 1);
      return;
    }
    assert.equal(role, 'new-process');
    await assert.rejects(submit(phases[1], () => admitReaderCall(inputs[2], async () => ++calls)), /HR_READ_WINDOW_CLOSED/);
    assert.equal(calls, 0);
    const receipt = await readReaderOutcome(db,scope,actor,phases[0],runId,requestId(phases[0]));
    assert.equal(receipt.state,'FAILED');
    assert.equal(receipt.dispatched,1);
    assert.equal(receipt.returned,1);
    assert.equal(window.reserved,18);
    assert.equal(window.recoveryReserve,100);
    console.log(JSON.stringify({armingProcessExited:true, admittedBeforeExpiry:1, newCallsAfterExpiry:0,
      failedAttemptReadBackInNewProcess:true, reservedSyntheticCredits:18, recoveryReserve:100, realMakeCalls:0}));
  } finally {
    await deleteApp(app);
  }
}

if (role) {
  await child();
} else {
  const run = randomUUID();
  for (const step of ['arm','in-flight','new-process']) {
    execFileSync(process.execPath,[script,step,run],{stdio:'inherit',timeout:45000});
  }
}
