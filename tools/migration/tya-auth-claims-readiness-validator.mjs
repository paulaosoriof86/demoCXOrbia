#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const rulesPath = path.join(root, 'app', 'contracts', 'firestore-dev-staging.rules.draft');
const contractPath = path.join(root, 'app', 'contracts', 'auth-claims-phase-a.tya.contract.json');

function readText(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing required file: ${path.relative(root, filePath)}`);
  }
  return fs.readFileSync(filePath, 'utf8');
}

function collectRolesFromRules(rulesText) {
  const roles = new Set();
  const roleInRegex = /roleIn\(\s*\[([^\]]*)\]\s*\)/g;
  let match;
  while ((match = roleInRegex.exec(rulesText)) !== null) {
    const values = match[1]
      .split(',')
      .map((value) => value.trim().replace(/^['"]|['"]$/g, ''))
      .filter(Boolean);
    for (const value of values) roles.add(value);
  }
  return [...roles].sort();
}

function main() {
  const rulesText = readText(rulesPath);
  const contract = JSON.parse(readText(contractPath));

  const canonicalClaims = Object.keys(contract.canonicalClaims || {});
  const canonicalRoles = contract.canonicalClaims?.role?.allowedValues || [];
  const transitionalRoles = (contract.transitionalCompatibility?.roleAliases || []).map((alias) => alias.legacyValue);
  const rolesInRules = collectRolesFromRules(rulesText);

  const claimChecks = canonicalClaims.map((claim) => ({
    claim,
    referencedInRules: rulesText.includes(`request.auth.token.${claim}`)
  }));

  const rolesMissingInRules = canonicalRoles.filter((role) => !rolesInRules.includes(role));
  const nonCanonicalRolesInRules = rolesInRules.filter(
    (role) => !canonicalRoles.includes(role) && !transitionalRoles.includes(role)
  );
  const transitionalRolesInRules = rolesInRules.filter((role) => transitionalRoles.includes(role));

  const safetyChecks = {
    draftOnlyCommentPresent: rulesText.includes('Draft only'),
    noRawSensitiveKeysPresent: rulesText.includes('noRawSensitiveKeys'),
    deleteBlockedSomewhere: /allow\s+delete\s*:\s*if\s+false/.test(rulesText),
    syncEventsAppendOnly: rulesText.includes('match /syncEvents/{syncEventId}') &&
      /allow\s+create\s*:\s*if/.test(rulesText) &&
      /allow\s+update,\s*delete\s*:\s*if\s+false/.test(rulesText)
  };

  const issues = [];
  for (const check of claimChecks) {
    if (!check.referencedInRules && check.claim !== 'role') {
      issues.push(`Claim not referenced in rules draft: ${check.claim}`);
    }
  }
  if (transitionalRolesInRules.length) {
    issues.push(`Transitional role values still referenced in rules draft: ${transitionalRolesInRules.join(', ')}`);
  }
  if (nonCanonicalRolesInRules.length) {
    issues.push(`Non-canonical role values found in rules draft: ${nonCanonicalRolesInRules.join(', ')}`);
  }
  if (!safetyChecks.noRawSensitiveKeysPresent) issues.push('Sensitive-key guard not found.');
  if (!safetyChecks.syncEventsAppendOnly) issues.push('syncEvents append-only guard not confirmed.');

  const report = {
    validator: 'tya-auth-claims-readiness-validator',
    status: issues.length ? 'review_required' : 'ready_for_emulator_review',
    runtimeEnabled: false,
    productionAllowed: false,
    firestoreWritesAllowed: false,
    authRealAllowed: false,
    filesChecked: [
      path.relative(root, rulesPath),
      path.relative(root, contractPath)
    ],
    canonicalClaims,
    claimChecks,
    canonicalRoles,
    rolesInRules,
    rolesMissingInRules,
    transitionalRolesInRules,
    nonCanonicalRolesInRules,
    safetyChecks,
    issues,
    nextRequiredHumanDecisions: contract.readinessDecisionsRequiredBeforeDevAuth || []
  };

  console.log(JSON.stringify(report, null, 2));
}

try {
  main();
} catch (error) {
  console.error(JSON.stringify({
    validator: 'tya-auth-claims-readiness-validator',
    status: 'error',
    runtimeEnabled: false,
    productionAllowed: false,
    firestoreWritesAllowed: false,
    authRealAllowed: false,
    error: error.message
  }, null, 2));
  process.exitCode = 1;
}
