#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const contractPath = path.join(root, 'app', 'contracts', 'postulation-dynamic-form-preview-phase-a.tya.contract.json');
const sensitivePolicyPath = path.join(root, 'app', 'contracts', 'sensitive-data-policy-phase-a.tya.contract.json');
const assignmentContractPath = path.join(root, 'app', 'contracts', 'assignment-sync-conflict-preview-phase-a.tya.contract.json');
const visitContractPath = path.join(root, 'app', 'contracts', 'visit-lifecycle-reservation-preview-phase-a.tya.contract.json');

const sensitivePatterns = [
  /dpi/i,
  /document(Number|o)?/i,
  /passport|pasaporte/i,
  /bank|banco/i,
  /account|cuenta/i,
  /iban|swift/i,
  /nda/i,
  /signature|firma/i,
  /raw(Email|Whatsapp|Attachment|Audio|Body|File)?/i,
  /base64/i,
  /attachment|adjunto/i,
  /address|direccion|dirección/i,
  /phone|telefono|teléfono|whatsapp/i
];

function readJson(filePath) {
  if (!fs.existsSync(filePath)) throw new Error(`Missing file: ${path.relative(root, filePath)}`);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function parseArgs(argv) {
  const args = { input: null };
  for (let i = 2; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === '--input') {
      args.input = argv[i + 1];
      i += 1;
    } else if (token.startsWith('--input=')) {
      args.input = token.slice('--input='.length);
    }
  }
  return args;
}

function flattenKeys(value, prefix = '') {
  if (!value || typeof value !== 'object') return [];
  const keys = [];
  for (const [key, child] of Object.entries(value)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    keys.push(fullKey);
    if (child && typeof child === 'object' && !Array.isArray(child)) keys.push(...flattenKeys(child, fullKey));
  }
  return keys;
}

function detectSensitiveKeys(payload) {
  const keys = flattenKeys(payload);
  return [...new Set(keys.filter((key) => sensitivePatterns.some((pattern) => pattern.test(key))))];
}

function hasStableVisitRef(row) {
  return Boolean(row.visitId || row.hrRowId || row.sourceVisitRef);
}

function formKey(form) {
  return `${form.tenantId || ''}::${form.projectId || ''}::${form.formId || ''}::${form.formVersion || ''}`;
}

function postulationFormKey(postulation) {
  return `${postulation.tenantId || ''}::${postulation.projectId || ''}::${postulation.formId || ''}::${postulation.formVersion || ''}`;
}

function validateForm(form, contract) {
  const failures = [];
  for (const field of contract.requiredFormConfigFields || []) {
    if (form[field] === undefined || form[field] === null || form[field] === '') failures.push(`missing_form_${field}`);
  }
  if (form.status && !contract.allowedFormStatuses?.includes(form.status)) failures.push('invalid_form_status');
  if (!Array.isArray(form.fields) || !form.fields.length) failures.push('missing_form_fields');

  const fieldIds = new Set();
  for (const fieldConfig of Array.isArray(form.fields) ? form.fields : []) {
    for (const requiredField of contract.requiredFieldConfigFields || []) {
      if (fieldConfig[requiredField] === undefined || fieldConfig[requiredField] === null || fieldConfig[requiredField] === '') failures.push(`missing_field_${requiredField}`);
    }
    if (fieldConfig.fieldId) {
      if (fieldIds.has(fieldConfig.fieldId)) failures.push('duplicate_field_id');
      fieldIds.add(fieldConfig.fieldId);
    }
    if (fieldConfig.type && !contract.fieldTypes?.includes(fieldConfig.type)) failures.push(`unsupported_field_type:${fieldConfig.type}`);
    if (fieldConfig.sensitivityLevel && !contract.fieldSensitivityLevels?.includes(fieldConfig.sensitivityLevel)) failures.push(`unsupported_sensitivity:${fieldConfig.sensitivityLevel}`);
    if ((fieldConfig.sensitivityLevel || '').includes('restricted') && fieldConfig.shopperVisible === true) failures.push(`restricted_field_shopper_visible:${fieldConfig.fieldId}`);
    if (fieldConfig.sensitivityLevel === 'sensitive_blocked_phase_a') failures.push(`sensitive_blocked_phase_a:${fieldConfig.fieldId}`);
    if (fieldConfig.type && String(fieldConfig.type).includes('file') && fieldConfig.allowRawUpload === true) failures.push(`raw_upload_not_allowed:${fieldConfig.fieldId}`);
  }
  return [...new Set(failures)];
}

function normalizeAnswers(postulation) {
  if (postulation.answers && typeof postulation.answers === 'object') return postulation.answers;
  if (postulation.fields && typeof postulation.fields === 'object') return postulation.fields;
  return {};
}

function valueLooksRawFile(value) {
  if (!value) return false;
  if (typeof value === 'string') return value.startsWith('data:') || value.length > 2000;
  if (typeof value === 'object') return Boolean(value.base64 || value.rawFile || value.rawAttachment || value.bytes || value.content);
  return false;
}

function validatePostulation(postulation, form, contract) {
  const failures = [];
  for (const key of ['tenantId', 'projectId', 'formId', 'formVersion', 'postulationId', 'shopperId']) {
    if (!postulation[key]) failures.push(`missing_${key}`);
  }
  if (postulation.visitScoped === true && !hasStableVisitRef(postulation)) failures.push('missing_stable_visit_ref');
  if (!form) failures.push('missing_matching_form_config');

  const answers = normalizeAnswers(postulation);
  const fields = Array.isArray(form?.fields) ? form.fields : [];
  for (const fieldConfig of fields) {
    const value = answers[fieldConfig.fieldId];
    const empty = value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0);
    if (fieldConfig.required === true && empty) failures.push(`missing_required:${fieldConfig.fieldId}`);
    if (!empty && valueLooksRawFile(value)) failures.push(`raw_file_value_not_allowed:${fieldConfig.fieldId}`);
    if (!empty && fieldConfig.sensitivityLevel === 'sensitive_blocked_phase_a') failures.push(`sensitive_value_blocked:${fieldConfig.fieldId}`);
    if (!empty && fieldConfig.type && String(fieldConfig.type).includes('file')) {
      if (typeof value === 'string' && !value.startsWith('private_ref:') && !value.startsWith('pending_storage:') && !value.startsWith('source_safe_ref:')) {
        failures.push(`file_value_must_be_private_ref:${fieldConfig.fieldId}`);
      }
    }
  }

  for (const key of Object.keys(answers)) {
    if (sensitivePatterns.some((pattern) => pattern.test(key))) failures.push(`sensitive_answer_key_detected:${key}`);
  }

  return [...new Set(failures)];
}

function outcomeForPostulation(failures) {
  if (failures.some((f) => f.includes('sensitive') || f.includes('raw_file') || f.includes('file_value'))) return 'sensitive_field_review_required';
  if (failures.some((f) => f.includes('missing_required'))) return 'missing_required_fields';
  if (failures.some((f) => f.includes('missing_'))) return 'manual_review_required';
  if (failures.length) return 'conflict_review_required';
  return 'postulation_ready_for_review';
}

function validatePreviewInput(inputFile, contract) {
  const inputPath = path.isAbsolute(inputFile) ? inputFile : path.join(root, inputFile);
  const payload = readJson(inputPath);
  const issues = [];
  const warnings = [];

  if (payload.sourceSafe !== true) issues.push('input.sourceSafe must be true');
  if (payload.containsRawSensitiveData !== false) issues.push('input.containsRawSensitiveData must be false');
  if (payload.isSyntheticOrSanitized !== true) issues.push('input.isSyntheticOrSanitized must be true');

  const sensitiveKeys = detectSensitiveKeys(payload);
  if (sensitiveKeys.length) issues.push(`sensitive_or_raw_field_keys_detected:${sensitiveKeys.join(',')}`);

  const forms = Array.isArray(payload.forms) ? payload.forms : [];
  const postulations = Array.isArray(payload.postulations) ? payload.postulations : [];
  if (!Array.isArray(payload.forms)) warnings.push('input.forms missing or not an array');
  if (!Array.isArray(payload.postulations)) warnings.push('input.postulations missing or not an array');

  const formsByKey = new Map(forms.map((form) => [formKey(form), form]));
  const formRows = forms.map((form) => {
    const failures = validateForm(form, contract);
    return {
      outcome: failures.length ? 'form_config_review_required' : 'form_config_ready',
      validationFailures: failures,
      tenantId: form.tenantId || null,
      projectId: form.projectId || null,
      formId: form.formId || null,
      formVersion: form.formVersion || null,
      status: form.status || null,
      fieldCount: Array.isArray(form.fields) ? form.fields.length : 0
    };
  });

  const postulationRows = postulations.map((postulation) => {
    const form = formsByKey.get(postulationFormKey(postulation));
    const failures = validatePostulation(postulation, form, contract);
    const outcome = outcomeForPostulation(failures);
    return {
      outcome,
      validationFailures: failures,
      tenantId: postulation.tenantId || null,
      projectId: postulation.projectId || null,
      formId: postulation.formId || null,
      formVersion: postulation.formVersion || null,
      postulationId: postulation.postulationId || null,
      shopperId: postulation.shopperId || null,
      visitId: postulation.visitId || null,
      hrRowId: postulation.hrRowId || null,
      sourceVisitRef: postulation.sourceVisitRef || null,
      recommendedStatus: outcome === 'postulation_ready_for_review' ? 'pending_admin_review' : outcome
    };
  });

  const counts = [...formRows, ...postulationRows].reduce((acc, row) => {
    acc.outcomes[row.outcome] = (acc.outcomes[row.outcome] || 0) + 1;
    for (const failure of row.validationFailures) acc.failures[failure] = (acc.failures[failure] || 0) + 1;
    return acc;
  }, { outcomes: {}, failures: {} });

  return {
    inputChecked: path.relative(root, inputPath),
    formCount: forms.length,
    postulationCount: postulations.length,
    sensitiveKeys,
    counts,
    formRows,
    postulationRows,
    issues,
    warnings
  };
}

function main() {
  const args = parseArgs(process.argv);
  const contract = readJson(contractPath);
  const sensitivePolicy = readJson(sensitivePolicyPath);
  const assignmentContract = readJson(assignmentContractPath);
  const visitContract = readJson(visitContractPath);
  const issues = [];
  const warnings = [];

  for (const flag of ['runtimeEnabled', 'productionAllowed', 'firestoreWritesAllowed', 'storageWritesAllowed', 'makeWriteAllowed', 'hrWriteAllowed', 'importRealDataAllowed']) {
    if (contract[flag] !== false) issues.push(`${flag} must remain false`);
  }
  if (sensitivePolicy.importRealDataAllowed !== false) issues.push('Sensitive data policy must keep real imports disabled');
  if (assignmentContract.runtimeEnabled !== false) issues.push('Assignment dependency must keep runtime disabled');
  if (visitContract.runtimeEnabled !== false) issues.push('Visit lifecycle dependency must keep runtime disabled');

  for (const key of ['tenantId', 'projectId', 'formId', 'formVersion', 'fieldId', 'postulationId', 'shopperId', 'visitId', 'hrRowId', 'sourceVisitRef']) {
    if (!contract.stableKeys?.includes(key)) issues.push(`Missing stable key: ${key}`);
  }

  for (const outcome of ['form_config_ready', 'postulation_ready_for_review', 'missing_required_fields', 'sensitive_field_review_required', 'manual_review_required']) {
    if (!contract.previewOutcomes?.includes(outcome)) issues.push(`Missing preview outcome: ${outcome}`);
  }

  if (!contract.fieldTypes?.includes('file_ref_pending_storage')) issues.push('Missing file_ref_pending_storage field type');
  if (!contract.fieldSensitivityLevels?.includes('sensitive_blocked_phase_a')) issues.push('Missing sensitive_blocked_phase_a level');

  let inputPreview = null;
  if (args.input) {
    inputPreview = validatePreviewInput(args.input, contract);
    issues.push(...inputPreview.issues);
    warnings.push(...inputPreview.warnings);
  } else {
    warnings.push('No --input provided; only contracts were checked');
  }

  const report = {
    validator: 'tya-postulation-dynamic-form-preview-validator',
    status: issues.length ? 'review_required' : 'postulation_dynamic_form_preview_ready',
    runtimeEnabled: false,
    productionAllowed: false,
    firestoreWritesAllowed: false,
    storageWritesAllowed: false,
    makeWriteAllowed: false,
    hrWriteAllowed: false,
    fileChecked: path.relative(root, contractPath),
    dependenciesChecked: [
      path.relative(root, sensitivePolicyPath),
      path.relative(root, assignmentContractPath),
      path.relative(root, visitContractPath)
    ],
    inputPreview,
    issues,
    warnings,
    nextSafeSteps: [
      'Run with synthetic/sanitized forms and postulations only.',
      'Keep file fields as private refs or pending Storage while gates are off.',
      'Route sensitive or ambiguous fields to manual review.',
      'Update Claude/prototype and Academia with dynamic postulation form rules.'
    ]
  };

  console.log(JSON.stringify(report, null, 2));
}

try {
  main();
} catch (error) {
  console.error(JSON.stringify({
    validator: 'tya-postulation-dynamic-form-preview-validator',
    status: 'error',
    runtimeEnabled: false,
    productionAllowed: false,
    firestoreWritesAllowed: false,
    error: error.message
  }, null, 2));
  process.exitCode = 1;
}
