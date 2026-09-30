#!/usr/bin/env node
import fs from 'node:fs';

function fail(message, details = {}) {
  const result = {
    decision: 'HOLD_C6_CONTROL_PLANE_PREFLIGHT',
    message,
    ...details,
    providerBoundaryAllowed: false
  };
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  process.exitCode = 2;
}

function readJson(filePath, label) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    fail(`${label}_INVALID_JSON`, {
      filePath,
      error: String(error?.message || error)
    });
    return null;
  }
}

const [contractPath, evidencePath] = process.argv.slice(2);

if (!contractPath || !evidencePath) {
  fail('USAGE: node cxorbia-c6-control-plane-preflight.mjs <contract.json> <evidence.json>');
} else {
  const contract = readJson(contractPath, 'CONTRACT');
  const evidence = readJson(evidencePath, 'EVIDENCE');

  if (contract && evidence) {
    const expectedFalse = [
      'providerWrites',
      'authWrites',
      'passwordChanges',
      'membershipWrites',
      'firestoreWrites',
      'rulesWrites',
      'storageWrites',
      'hrWrites',
      'deploy',
      'merge',
      'production',
      'make',
      'gemini',
      'payments'
    ];

    const contractOk =
      contract.schemaVersion === 'cxorbia.c6.execution-control-plane.v2' &&
      contract.repository === 'paulaosoriof86/demoCXOrbia' &&
      contract.branch === 'docs-tya-v6-v71-audit' &&
      Number(contract.pullRequest) === 7 &&
      expectedFalse.every((key) => contract.safety?.[key] === false);

    if (!contractOk) {
      fail('CONTROL_PLANE_CONTRACT_INVALID');
    } else if (evidence.lane === 'github_actions_explicit_dispatch') {
      const operational =
        evidence.githubStatus?.actions === 'operational' &&
        evidence.githubStatus?.incidentId === 'qcvjkzcs7j74' &&
        evidence.githubStatus?.incidentStatus === 'resolved' &&
        evidence.githubStatus?.pushPullTriggersRestored === true;

      if (!operational) {
        fail('GITHUB_ACTIONS_NOT_FULLY_RECOVERED', {
          githubStatus: evidence.githubStatus || null
        });
      } else {
        const dispatchOk =
          evidence.event === 'workflow_dispatch' &&
          /^[0-9]+$/.test(String(evidence.runId || '')) &&
          /^[0-9]+$/.test(String(evidence.jobId || '')) &&
          typeof evidence.requestId === 'string' &&
          evidence.requestId.length > 0 &&
          /^[a-f0-9]{40}$/.test(evidence.sourceLock || '') &&
          evidence.claimStatus === 'pending' &&
          evidence.requestId === evidence.claimRequestId &&
          evidence.sourceLock === evidence.claimSourceLock;

        if (!dispatchOk) {
          fail('EXPLICIT_DISPATCH_EVIDENCE_INCOMPLETE');
        } else {
          const result = {
            decision: 'PASS_C6_CONTROL_PLANE_PRE_PROVIDER',
            lane: evidence.lane,
            runId: String(evidence.runId),
            jobId: String(evidence.jobId),
            requestId: evidence.requestId,
            sourceLock: evidence.sourceLock,
            providerBoundaryAllowed: true
          };
          process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
        }
      }
    } else if (evidence.lane === 'direct_trusted_runner') {
      const directOk =
        contract.fallbackLane?.status === 'AUTHORIZED_AND_DEPLOYED' &&
        evidence.separateAuthorization === true &&
        evidence.authenticatedInvocation === true &&
        evidence.idempotencyLease === 'acquired' &&
        typeof evidence.requestId === 'string' &&
        evidence.requestId.length > 0 &&
        /^[a-f0-9]{40}$/.test(evidence.sourceLock || '');

      if (!directOk) {
        fail('DIRECT_TRUSTED_RUNNER_NOT_AUTHORIZED_OR_NOT_DEPLOYED');
      } else {
        const result = {
          decision: 'PASS_C6_CONTROL_PLANE_PRE_PROVIDER',
          lane: evidence.lane,
          requestId: evidence.requestId,
          sourceLock: evidence.sourceLock,
          providerBoundaryAllowed: true
        };
        process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      }
    } else {
      fail('UNSUPPORTED_CONTROL_PLANE_LANE', {
        lane: evidence.lane || null
      });
    }
  }
}
