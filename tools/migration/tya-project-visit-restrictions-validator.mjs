#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const contractPath = path.join(root, 'app', 'contracts', 'project-visit-restrictions-postulation-card-phase-a.tya.contract.json');

function readJson(filePath) {
  if (!fs.existsSync(filePath)) throw new Error(`Missing file: ${path.relative(root, filePath)}`);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function main() {
  const contract = readJson(contractPath);
  const issues = [];
  const warnings = [];

  for (const flag of ['runtimeEnabled', 'productionAllowed', 'firestoreWritesAllowed']) {
    if (contract[flag] !== false) issues.push(`${flag} must remain false`);
  }

  const measurement = contract.projectMeasurementConfig || {};
  for (const field of ['visitFrequency', 'measurementPeriod', 'restrictionSourceType']) {
    if (!measurement.requiredFields?.includes(field)) issues.push(`Missing measurement required field: ${field}`);
  }
  for (const source of ['client_requirement', 'internal_progress_measurement']) {
    if (!measurement.restrictionSourceTypes?.includes(source)) issues.push(`Missing restriction source type: ${source}`);
  }
  if (measurement.cinepolisDefault?.visitFrequency !== 'monthly') warnings.push('Cinepolis default should keep monthly visit frequency');
  if (measurement.cinepolisDefault?.measurementPeriod !== 'quincena') warnings.push('Cinepolis default should keep quincena measurement period');

  const restrictionTypes = contract.visitRestrictionTypes || {};
  for (const group of ['shopperProfile', 'visitFrequency', 'scheduleWindow', 'scenario']) {
    if (!Array.isArray(restrictionTypes[group]) || !restrictionTypes[group].length) issues.push(`Missing restriction group: ${group}`);
  }

  const cardFields = contract.postulationCardRequiredFields || [];
  for (const field of ['honorarium', 'reimbursement', 'scenarioSummary', 'projectSummary', 'shopperEligibilitySummary', 'availableWindowSummary', 'restrictionWarnings']) {
    if (!cardFields.includes(field)) issues.push(`Missing postulation card field: ${field}`);
  }

  const cardRules = contract.postulationCardRules || [];
  if (!cardRules.some((rule) => rule.includes('before applying'))) issues.push('Missing visible before applying rule');
  if (!cardRules.some((rule) => rule.includes('client requirements'))) issues.push('Missing client requirement label rule');
  if (!cardRules.some((rule) => rule.includes('internal progress'))) issues.push('Missing internal measurement label rule');

  const hardStops = contract.hardStops || [];
  for (const phrase of ['Do not hard-code Cinepolis', 'Do not hide restrictions', 'Do not automatically penalize']) {
    if (!hardStops.some((stop) => stop.includes(phrase))) issues.push(`Missing hard stop: ${phrase}`);
  }

  const academy = contract.academyImpact || {};
  if (!Array.isArray(academy.roles) || !academy.roles.includes('shopper')) warnings.push('Academy impact should include shopper role');
  if (!Array.isArray(academy.newLessons) || !academy.newLessons.some((lesson) => lesson.includes('postulation card'))) warnings.push('Academy should include postulation card lesson');

  const report = {
    validator: 'tya-project-visit-restrictions-validator',
    status: issues.length ? 'review_required' : 'project_restrictions_contract_ready_for_safe_mapping',
    runtimeEnabled: false,
    productionAllowed: false,
    firestoreWritesAllowed: false,
    fileChecked: path.relative(root, contractPath),
    measurementConfig: measurement,
    restrictionGroups: Object.keys(restrictionTypes),
    postulationCardRequiredFields: cardFields,
    academyImpact: academy,
    issues,
    warnings,
    nextSafeSteps: [
      'Use this contract to map project restrictions into the postulation card without frontend changes now.',
      'Keep Cinepolis franja/monthly/quincena as project-specific defaults, not global rules.',
      'Create shopper scoring/ranking contract before applying penalties.',
      'Update Academy content for postulation card, restrictions and client vs internal measurement.'
    ]
  };

  console.log(JSON.stringify(report, null, 2));
}

try {
  main();
} catch (error) {
  console.error(JSON.stringify({
    validator: 'tya-project-visit-restrictions-validator',
    status: 'error',
    runtimeEnabled: false,
    productionAllowed: false,
    firestoreWritesAllowed: false,
    error: error.message
  }, null, 2));
  process.exitCode = 1;
}
