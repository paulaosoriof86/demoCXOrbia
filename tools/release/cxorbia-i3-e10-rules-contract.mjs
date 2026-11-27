import {createHash} from 'node:crypto';

export const E10 = Object.freeze({
  project: 'cxorbia-backend-dev',
  release: 'projects/cxorbia-backend-dev/releases/cloud.firestore',
  source: 'ff9ac83ea7bbe4ad19e8faf7951ef8256be92671',
  tree: 'dd29ad9f85bd426f02eeb35e4baeb8d8849acd5a',
  predecessor: '72874c08560addf5d0bc4a23573d65ce86481c95',
  prior: 'projects/cxorbia-backend-dev/rulesets/25cb3df2-fa16-4804-9124-38d0a8fac057',
  priorHash: '0708af825d2baaad974285acd8d72df0a7861105e453da26199f08fd5a985d3e',
  targetHash: '751b1074d76704a972926dcf6df8593c30ac19c5baf7a2d87d71f8b6bb52b22d',
  rulesBlob: 'beb07ff0312abb617cb224dbd3c7efaaa13aa4a1',
  storage: 'projects/cxorbia-backend-dev/rulesets/30db5c2c-07fe-4d6c-8be3-7de55a9f4457',
  authorityPath: 'docs/checkpoints/CXORBIA_I3_E10_FOCAL_RULES_AUTHORITY_20261126.json',
  authorityBlob: 'ad1a88d898ba0374a3a177fc23f0c69ffce506e3',
});

export function exactPendingRules(pending, gitBlob, gitRead) {
  if (pending.sourceSha !== E10.source)
    return pending.rulesDeploys === 0 && pending.rulesAuthority === undefined;
  return pending.sourceTree === E10.tree && pending.predecessorProductSourceSha === E10.predecessor &&
    pending.scope === 'RUNTIME_AND_HOSTING' && pending.rulesDeploys === 1 &&
    pending.storageRulesDeploys === 0 && pending.rulesAuthority?.path === E10.authorityPath &&
    pending.rulesAuthority.gitBlob === E10.authorityBlob && gitBlob(E10.authorityPath) === E10.authorityBlob &&
    gitRead(['rev-parse', E10.source + ':firestore.rules']).trim() === E10.rulesBlob &&
    createHash('sha256').update(gitRead(['show', E10.source + ':firestore.rules'])).digest('hex') === E10.targetHash;
}

export function validateRulesSeal(result, runId) {
  const proof = result.firestoreRulesTransition;
  if (result.sourceSha !== E10.source)
    return result.firestoreRulesDeploys === 0 && !proof;
  if (!proof || result.sourceTree !== E10.tree || result.firestoreRulesDeploys !== 1 ||
      result.storageRulesDeploys !== 0 || result.executionProvider !== 'GOOGLE_CLOUD_BUILD' ||
      typeof runId !== 'string' || !/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/.test(runId)) return false;
  const newName = proof.after?.rulesetName || '';
  return proof.runId === runId && proof.project === E10.project && proof.release === E10.release &&
    proof.authorityBlob === E10.authorityBlob && proof.sourceSha === E10.source && proof.sourceTree === E10.tree &&
    proof.before?.rulesetName === E10.prior && proof.before.sourceSha256 === E10.priorHash &&
    newName !== E10.prior && /^projects\/cxorbia-backend-dev\/rulesets\/[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/.test(newName) &&
    proof.after.sourceSha256 === E10.targetHash && result.firestoreRuleset === newName &&
    proof.storageBefore === E10.storage && proof.storageAfter === E10.storage &&
    proof.createdRulesetName === newName && proof.releaseTransitions === 1 && proof.rollbackTransitions === 0 &&
    proof.readbackVerified === true && proof.production === false;
}

export function validateMakeAdmission(observation, now = Date.now()) {
  const observed = Date.parse(observation?.observedAt);
  const cents = observation?.unusedCenticredits;
  return observation?.organizationId === 4090072 && observation.automaticPurchasing === false &&
    typeof cents === 'string' && /^[0-9]+$/.test(cents) && BigInt(cents) >= 16000n &&
    Number.isFinite(observed) && now >= observed && now - observed <= 10 * 60_000 &&
    observation.sourceSha === E10.source && observation.sourceTree === E10.tree &&
    observation.hrReadAllowance === 60 && observation.restorationReserve === 100 &&
    observation.concurrentWriter === false && observation.f3Debit === 0;
}
