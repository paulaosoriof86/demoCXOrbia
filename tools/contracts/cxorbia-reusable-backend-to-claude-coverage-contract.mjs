#!/usr/bin/env node
/**
 * CXOrbia reusable backend-to-Claude coverage contract.
 *
 * Preview-only validator that makes sure reusable backend/product patterns are
 * explicitly translated into Claude/prototype and Academia instructions before
 * a new client/prototype candidate is accepted. It does not touch UI, providers,
 * databases, imports, payments, notifications, deploys or production.
 */

export const CONTRACT_NAME = 'cxorbia-reusable-backend-to-claude-coverage-contract';
export const CONTRACT_VERSION = '2026-07-08.preview-only';

const REQUIRED_FIELDS = Object.freeze([
  'patternId',
  'name',
  'reusableCxorbia',
  'backendArtifacts',
  'prototypeInstructions',
  'academyInstructions',
  'tenantProjectApplicability',
  'claudeDeliveryExpectation',
  'goNoGoCriteria',
  'safeState',
]);

const REQUIRED_PATTERN_IDS = Object.freeze([
  'multi_tenant_project_config',
  'admin_configurability',
  'academy_admin_actions',
  'conflict_review_import_readiness',
  'readiness_dashboard_source_safe',
  'synthetic_input_pack_runner',
  'questionnaire_routing',
  'visit_lifecycle',
  'settlement_payment_eligibility',
  'evidence_storage_gate',
  'historical_import_clean',
  'assignment_sync_hr_platform',
  'notification_outbox_gates',
  'rule_versioning_changelog',
  'sensitive_data_policy',
  'provider_agnostic_integrations',
]);

const BLOCKED_TRUE_FLAGS = Object.freeze([
  'touchUiAutomatically',
  'modifyAppModules',
  'modifyAppCore',
  'activateProvider',
  'providerActive',
  'connectFirestore',
  'connectAuth',
  'connectStorage',
  'writeToHr',
  'writeToDatabase',
  'writeToStorage',
  'sendRealNotification',
  'sendRealEmail',
  'sendRealWhatsapp',
  'payNow',
  'importRealData',
  'deployNow',
  'productionReady',
  'containsSensitiveRawData',
]);

const PROHIBITED_CLAIMS = Object.freeze([
  'produccion lista',
  'production ready',
  'import real',
  'sync real aplicado',
  'envio real realizado',
  'pago real confirmado',
  'provider activo',
  'Firestore conectado',
  'Storage activo',
  'HR sincronizada',
  'Make activo',
  'Gemini activo',
  'deploy realizado',
]);

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object') return Object.values(value);
  return [];
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function hasProhibitedClaim(value) {
  const text = JSON.stringify(value || {}).toLowerCase();
  return PROHIBITED_CLAIMS.filter((claim) => text.includes(claim.toLowerCase()));
}

function collectBlockedFlags(node, path = '$', issues = []) {
  if (!node || typeof node !== 'object') return issues;
  for (const [key, value] of Object.entries(node)) {
    const nextPath = `${path}.${key}`;
    if (BLOCKED_TRUE_FLAGS.includes(key) && value === true) issues.push(`${nextPath}=true`);
    if (value && typeof value === 'object') collectBlockedFlags(value, nextPath, issues);
  }
  return issues;
}

function validatePattern(pattern, index) {
  const errors = [];
  const warnings = [];
  const prefix = `patterns[${index}]`;

  for (const field of REQUIRED_FIELDS) {
    if (!(field in (pattern || {}))) errors.push(`${prefix} missing ${field}`);
  }

  if (!isNonEmptyString(pattern?.patternId)) errors.push(`${prefix}.patternId required`);
  if (pattern?.reusableCxorbia !== true) errors.push(`${prefix}.${pattern?.patternId || 'unknown'} must be reusableCxorbia=true`);

  const backendArtifacts = asArray(pattern?.backendArtifacts);
  const prototypeInstructions = asArray(pattern?.prototypeInstructions);
  const academyInstructions = asArray(pattern?.academyInstructions);
  const goNoGoCriteria = asArray(pattern?.goNoGoCriteria);

  if (!backendArtifacts.length) errors.push(`${prefix}.${pattern?.patternId || 'unknown'} missing backendArtifacts`);
  if (!prototypeInstructions.length) errors.push(`${prefix}.${pattern?.patternId || 'unknown'} missing prototypeInstructions`);
  if (!academyInstructions.length) errors.push(`${prefix}.${pattern?.patternId || 'unknown'} missing academyInstructions`);
  if (!goNoGoCriteria.length) errors.push(`${prefix}.${pattern?.patternId || 'unknown'} missing goNoGoCriteria`);

  if (!pattern?.tenantProjectApplicability?.appliesToNewClients) errors.push(`${prefix}.${pattern?.patternId || 'unknown'} must apply to new clients`);
  if (!pattern?.claudeDeliveryExpectation?.mustBeSharedWithClaude) errors.push(`${prefix}.${pattern?.patternId || 'unknown'} must be shared with Claude`);
  if (!pattern?.claudeDeliveryExpectation?.mustBeInPrototypeCandidateAudit) errors.push(`${prefix}.${pattern?.patternId || 'unknown'} must be audited in prototype candidate`);
  if (!pattern?.claudeDeliveryExpectation?.mustBeInAcademia) errors.push(`${prefix}.${pattern?.patternId || 'unknown'} must be in Academia`);

  const safeState = pattern?.safeState || {};
  for (const flag of ['runtime', 'providerActivation', 'databaseWrites', 'hrWrites', 'storageWrites', 'realNotifications', 'payments', 'imports', 'deploy', 'production']) {
    if (safeState[flag] !== false && safeState[flag] !== 'not_connected') {
      errors.push(`${prefix}.${pattern?.patternId || 'unknown'} safeState.${flag} must remain false/not_connected`);
    }
  }

  const prohibited = hasProhibitedClaim(pattern);
  if (prohibited.length) errors.push(`${prefix}.${pattern?.patternId || 'unknown'} prohibited claims: ${prohibited.join('|')}`);

  if (!prototypeInstructions.some((item) => /Claude|prototipo|UI|pantalla|copy|estado/i.test(String(item)))) {
    warnings.push(`${prefix}.${pattern?.patternId || 'unknown'} prototypeInstructions should mention Claude/prototype/UI/copy/state explicitly`);
  }
  if (!academyInstructions.some((item) => /Academia|curso|manual|checklist|rol/i.test(String(item)))) {
    warnings.push(`${prefix}.${pattern?.patternId || 'unknown'} academyInstructions should mention Academia/course/manual/checklist/role explicitly`);
  }

  return { errors, warnings };
}

function pattern(patternId, name, backendArtifacts, prototypeInstructions, academyInstructions, goNoGoCriteria, extra = {}) {
  return {
    patternId,
    name,
    reusableCxorbia: true,
    backendArtifacts,
    prototypeInstructions,
    academyInstructions,
    tenantProjectApplicability: {
      appliesToCurrentClient: true,
      appliesToNewClients: true,
      requiresTenantId: true,
      requiresProjectId: true,
      clientSpecificDataAllowed: false,
    },
    claudeDeliveryExpectation: {
      mustBeSharedWithClaude: true,
      mustBeInPrototypeCandidateAudit: true,
      mustBeInAcademia: true,
      mustBeInGoNoGoChecklist: true,
      mustNotBePresentedAsRealExecution: true,
    },
    goNoGoCriteria,
    safeState: {
      runtime: 'not_connected',
      providerActivation: false,
      databaseWrites: false,
      hrWrites: false,
      storageWrites: false,
      realNotifications: false,
      payments: false,
      imports: false,
      deploy: false,
      production: false,
    },
    ...extra,
  };
}

export function sampleManifest() {
  return {
    mode: 'preview_only',
    sourceSafe: true,
    isSyntheticOrSanitized: true,
    manifestId: 'reusable_backend_to_claude_coverage_demo_001',
    generatedFor: 'Claude/prototype handoff + next-client configurability',
    patterns: [
      pattern(
        'multi_tenant_project_config',
        'Multi-tenant project configuration',
        ['admin configurability contract', 'project/tenant rule versioning preview', 'readiness dashboard'],
        ['Claude debe mostrar configuracion por tenant/proyecto, no logica hardcodeada por cliente.', 'UI debe separar tenantId/projectId, pais, moneda, reglas, fuentes y gates.'],
        ['Academia debe explicar tenant, proyecto, configuracion reusable y diferencias entre cliente actual y nuevo cliente.'],
        ['NO GO si el prototipo hardcodea un cliente como logica unica.', 'GO si la configuracion queda expresada como patron reusable.']
      ),
      pattern(
        'admin_configurability',
        'Admin configurability expanded domains',
        ['cxorbia-admin-configurability-contract.mjs', 'cxorbia-admin-configurability-expanded-fixture.mjs'],
        ['Claude debe exponer dominios administrables con acciones, roles, versionado, auditRef y gates.', 'Provider preparado no significa provider activo.'],
        ['Academia debe explicar administrabilidad por dominio, roles, gates y revision humana.'],
        ['NO GO si faltan acciones por dominio o si se promete activacion real.', 'GO si queda visible como preview/gate/revision.']
      ),
      pattern(
        'academy_admin_actions',
        'Academia administrable por rol y contenido',
        ['admin configurability expanded fixture', 'NEXT-CANDIDATE-AUDIT-ACADEMIA-ADMIN-ACTIONS-20260708.md'],
        ['Claude debe mostrar crear, editar, archivar/soft-delete, duplicar, versionar, estados y motivo para cursos/manuales/checklists/glosario.', 'Debe corregir la ausencia visual detectada en Academia.'],
        ['Academia debe incluir manual de administracion: borrar vs archivar, duplicar, versionar, revision humana y permisos.'],
        ['NO GO si Academia sigue sin acciones visibles o simula borrado real sin gate.', 'GO si acciones y estados quedan visibles o documentados con honestidad.']
      ),
      pattern(
        'conflict_review_import_readiness',
        'Conflict queue and import readiness',
        ['cxorbia-conflict-review-import-readiness-contract.mjs', 'cxorbia-conflict-review-import-readiness-expanded-fixture.mjs'],
        ['Claude debe mostrar cola de conflictos, severidad, sourceRefs opacas, stable keys, motivo y revision humana.', 'UI debe bloquear import cuando haya blocker.'],
        ['Academia debe explicar blocker vs warning, stable keys, sourceRefs opacas y por que no hay dedupe visual.'],
        ['NO GO si deduplica por nombre/coincidencia visual o auto-resuelve.', 'GO si conflictos requieren revision humana.']
      ),
      pattern(
        'readiness_dashboard_source_safe',
        'Readiness dashboard source-safe',
        ['cxorbia-readiness-dashboard-source-safe-contract.mjs', 'cxorbia-readiness-dashboard-bridge-runner.mjs'],
        ['Claude debe mostrar readiness como preview/gate/warning/fail/revision humana, nunca como produccion lista.', 'Debe usar sourceRefs opacas y motivos visibles.'],
        ['Academia debe explicar readiness dashboard, preview vs real, warnings, blockers y gates.'],
        ['NO GO si muestra production ready/import real/sync real.', 'GO si todo estado es honesto y source-safe.']
      ),
      pattern(
        'synthetic_input_pack_runner',
        'Synthetic input pack runner',
        ['cxorbia-synthetic-input-pack-runner.mjs'],
        ['Claude puede mostrar diagnostico synthetic runner como pass/fail/warnings sin ejecucion real.', 'UI no debe confundir fixture sintetico con fuente real.'],
        ['Academia debe explicar fixtures sinteticos, input sanitizado y limite de diagnostico.'],
        ['NO GO si se interpreta runner como import real.', 'GO si se muestra como diagnostico preview.']
      ),
      pattern(
        'questionnaire_routing',
        'Questionnaire routing configurable',
        ['cxorbia-questionnaire-routing-contract.mjs'],
        ['Claude debe mostrar rutas CXOrbia, TyAOnline, externo, link general y ref por visita como configurables.', 'No usar “cuestionario enviado” si no hay envio real.'],
        ['Academia debe explicar rutas de cuestionario por proyecto/visita.'],
        ['NO GO si hardcodea una sola ruta.', 'GO si rutas quedan configurables por proyecto/visita.']
      ),
      pattern(
        'visit_lifecycle',
        'Visit lifecycle and reservations',
        ['cxorbia-visit-lifecycle-contract.mjs'],
        ['Claude debe mostrar visita/reserva/asignacion/reprogramacion/cancelacion con estados y motivos.', 'No debe sobrescribir sin revision.'],
        ['Academia debe explicar ciclo de visita, franja, quincena, rango y consecuencias.'],
        ['NO GO si acciones criticas no piden motivo.', 'GO si estados son auditables.']
      ),
      pattern(
        'settlement_payment_eligibility',
        'Settlement and payment eligibility',
        ['cxorbia-settlement-eligibility-contract.mjs'],
        ['Claude debe separar visita realizada, cuestionario realizado, submitido, elegibilidad, liquidacion y pago real.', 'Mis beneficios debe separar honorario, reembolso, boleto, combo y estado.'],
        ['Academia debe explicar elegibilidad vs pago real y lote/item.'],
        ['NO GO si marca pago real sin confirmacion.', 'GO si pagos quedan pendiente gate/revision.']
      ),
      pattern(
        'evidence_storage_gate',
        'Evidence and Storage gate',
        ['cxorbia-evidence-storage-contract.mjs'],
        ['Claude debe mostrar evidencias como requerido/preparado/pendiente carga real/revision, sin adjuntos crudos.', 'Storage preparado no significa Storage activo.'],
        ['Academia debe explicar tipos de evidencia, Storage futuro y proteccion de adjuntos.'],
        ['NO GO si sube/muestra adjuntos crudos.', 'GO si usa referencias opacas.']
      ),
      pattern(
        'historical_import_clean',
        'Historical import clean',
        ['cxorbia-historical-import-clean-contract.mjs'],
        ['Claude debe mostrar import historico como preview/control, no import real.', 'Debe mostrar rechazos/conflictos/revision.'],
        ['Academia debe explicar import limpio, fuente sanitizada y no conectar base vieja.'],
        ['NO GO si conecta/copia base vieja.', 'GO si se mantiene preview source-safe.']
      ),
      pattern(
        'assignment_sync_hr_platform',
        'HR/platform assignment sync',
        ['assignment sync conflict preview validator', 'conflict review expanded fixture'],
        ['Claude debe mostrar plataforma->HR y HR->plataforma con assignmentSource, assignmentSyncStatus, lastSyncedAt y conflictos.', 'No debe mostrar HR sincronizada real.'],
        ['Academia debe explicar sync bidireccional, llaves estables y revision de conflictos.'],
        ['NO GO si sobrescribe silenciosamente.', 'GO si conflictos pasan a revision.']
      ),
      pattern(
        'notification_outbox_gates',
        'Notification outbox and gates',
        ['notification outbox preview validator'],
        ['Claude debe mostrar correos/WhatsApp como preparados/pendientes gate, no enviados reales.', 'Debe conservar confirmacion manual si aplica.'],
        ['Academia debe explicar outbox, gate, provider preparado y envio real futuro.'],
        ['NO GO si dice enviado/notificado real.', 'GO si copy es preparado/pendiente.']
      ),
      pattern(
        'rule_versioning_changelog',
        'Rule versioning and changelog',
        ['project tenant rule versioning validator', 'rule change changelog notification validator'],
        ['Claude debe mostrar reglas versionadas, changelog en draft/review/approved preview y audiencia por rol.', 'No publicar ni notificar real.'],
        ['Academia debe explicar versionado, changelog, impacto por rol y revision humana.'],
        ['NO GO si publica cambios sin revision.', 'GO si changelog queda preview.']
      ),
      pattern(
        'sensitive_data_policy',
        'Sensitive data protection',
        ['SENSITIVE-DATA-POLICY-PHASE-A-TYA-20260704.md', 'validators source-safe'],
        ['Claude debe ocultar DPI, banco, NDA firmado, tokens, webhooks, telefonos/correos crudos y adjuntos.', 'Debe usar referencias opacas.'],
        ['Academia debe explicar datos sensibles, privacidad, referencias opacas y permisos.'],
        ['NO GO si expone datos sensibles.', 'GO si todo se muestra protegido.']
      ),
      pattern(
        'provider_agnostic_integrations',
        'Provider-agnostic integrations',
        ['admin configurability integrations/make/gemini domains', 'readiness bridge'],
        ['Claude debe mostrar integraciones como provider agnostic y gate_required, no activo.', 'Make/Gemini/Storage/Auth/Firestore deben quedar preparados, no conectados.'],
        ['Academia debe explicar proveedor configurado vs proveedor activo y aprobaciones necesarias.'],
        ['NO GO si muestra Make/Gemini/Storage activo.', 'GO si todo queda gate_required/preview.']
      ),
    ],
  };
}

export function validateReusableBackendToClaudeCoverage(manifest = {}) {
  const errors = [];
  const warnings = [];

  if (manifest.mode !== 'preview_only') errors.push('manifest.mode must be preview_only');
  if (manifest.sourceSafe !== true) errors.push('manifest.sourceSafe must be true');
  if (manifest.isSyntheticOrSanitized !== true) errors.push('manifest.isSyntheticOrSanitized must be true');

  const blockedFlags = collectBlockedFlags(manifest);
  if (blockedFlags.length) errors.push(`blocked true flags: ${blockedFlags.join(', ')}`);

  const patterns = asArray(manifest.patterns);
  if (!patterns.length) errors.push('manifest.patterns required');

  const ids = new Set();
  patterns.forEach((item, index) => {
    if (item?.patternId) ids.add(item.patternId);
    const result = validatePattern(item, index);
    errors.push(...result.errors);
    warnings.push(...result.warnings);
  });

  for (const required of REQUIRED_PATTERN_IDS) {
    if (!ids.has(required)) errors.push(`missing required reusable pattern: ${required}`);
  }

  return {
    contract: CONTRACT_NAME,
    version: CONTRACT_VERSION,
    ok: errors.length === 0,
    verdict: errors.length ? 'NO_GO_REUSABLE_BACKEND_TO_CLAUDE_COVERAGE' : 'GO_REUSABLE_BACKEND_TO_CLAUDE_COVERAGE_PREVIEW_ONLY',
    mode: 'preview_only',
    sourceSafe: true,
    patternCount: patterns.length,
    requiredPatternCount: REQUIRED_PATTERN_IDS.length,
    errors: [...new Set(errors)],
    warnings: [...new Set(warnings)],
    coverage: {
      requiredPatternIds: REQUIRED_PATTERN_IDS,
      deliveredPatternIds: Array.from(ids).sort(),
      allRequiredDelivered: REQUIRED_PATTERN_IDS.every((id) => ids.has(id)),
    },
    safeState: {
      runtime: 'not_connected',
      providerActivation: false,
      databaseWrites: false,
      hrWrites: false,
      storageWrites: false,
      realNotifications: false,
      payments: false,
      imports: false,
      deploy: false,
      production: false,
    },
    classification: {
      reusableCxorbia: [
        'ensures reusable backend patterns become prototype and Academia requirements for new clients',
        'prevents backend-only knowledge from being lost before Claude works UI',
      ],
      exclusivoCliente: [
        'TyA-specific values are excluded; current client is only one implementation of reusable patterns',
      ],
      claudePrototipo: [
        'every reusable pattern must include explicit Claude/prototype instructions and GO/NO GO criteria',
      ],
      academia: [
        'every reusable pattern must include Academia/manual/checklist/role training impact',
      ],
      sinImpactoClaude: [
        'contract has no UI mutation by itself but exists to enforce Claude handoff completeness',
      ],
    },
  };
}

function main() {
  const result = validateReusableBackendToClaudeCoverage(sampleManifest());
  console.log(JSON.stringify(result, null, 2));
  process.exitCode = result.ok ? 0 : 1;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
