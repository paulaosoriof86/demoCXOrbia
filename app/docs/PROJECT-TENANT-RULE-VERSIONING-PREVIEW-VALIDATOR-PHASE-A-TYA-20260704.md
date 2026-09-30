# Project/tenant rule versioning preview validator Phase A TyA

Fecha: 2026-07-04

## Objetivo

Cerrar el bloque largo backend de versionamiento transversal de reglas/configuraciones por tenant y proyecto. Este bloque prepara contrato y validador preview para que las reglas operativas evolucionen por proyecto sin hard-codear, sin sobrescribir silenciosamente, sin romper historicos, sin activar integraciones reales y sin escribir produccion.

## Archivos creados

- `app/contracts/project-tenant-rule-versioning-preview-phase-a.tya.contract.json`
- `tools/migration/tya-project-tenant-rule-versioning-preview-validator.mjs`

## Dependencias documentales

- `app/contracts/sensitive-data-policy-phase-a.tya.contract.json`
- `app/contracts/assignment-sync-conflict-preview-phase-a.tya.contract.json`
- `app/contracts/visit-lifecycle-reservation-preview-phase-a.tya.contract.json`
- `app/contracts/postulation-dynamic-form-preview-phase-a.tya.contract.json`
- `app/contracts/notification-outbox-preview-phase-a.tya.contract.json`
- `app/contracts/email-user-mailbox-preview-phase-a.tya.contract.json`
- `app/contracts/crm-external-folder-refs-preview-phase-a.tya.contract.json`
- `app/contracts/shopper-communication-history-preview-phase-a.tya.contract.json`
- `app/contracts/shopper-ranking-scoring-preview-phase-a.tya.contract.json`

## Que valida

1. Gates apagados: runtime, produccion, Firestore, Make, Gemini e import real.
2. Input source-safe: `sourceSafe=true`, `containsRawSensitiveData=false`, `isSyntheticOrSanitized=true`.
3. Ausencia de secretos, tokens, payloads crudos o datos sensibles en reglas.
4. Versionamiento por `tenantId`, `projectId`, `ruleSetId`, `ruleSetVersion` y `ruleSetType`.
5. Tipos de reglas configurables por proyecto.
6. Cambios de alto impacto con revision humana.
7. Cambios breaking con `migrationPlanId` y `rollbackPlanId`.
8. Que no se active proveedor/integracion real desde preview.
9. Que no se use una regla de un proyecto como default global SaaS sin revision.

## Entrada segura esperada

```json
{
  "sourceSafe": true,
  "containsRawSensitiveData": false,
  "isSyntheticOrSanitized": true,
  "ruleSets": [
    {
      "tenantId": "tya",
      "projectId": "cinepolis_gt",
      "ruleSetId": "ruleset_ref_001",
      "ruleSetVersion": "1.0.0-preview",
      "ruleSetType": "visit_lifecycle_rules",
      "status": "draft_preview",
      "effectiveFrom": "2026-07-01",
      "createdByRef": "admin_ref_001",
      "reviewedByRef": "admin_review_ref_001",
      "sourceRuleRef": "source_rule_ref_001",
      "changeType": "non_breaking_addition"
    }
  ]
}
```

## Uso futuro local seguro

```bash
node tools/migration/tya-project-tenant-rule-versioning-preview-validator.mjs
node tools/migration/tya-project-tenant-rule-versioning-preview-validator.mjs --input path/to/project-tenant-rule-versioning-preview.json
```

Si se ejecuta sin `--input`, el script solo revisa contratos.

## RuleSet types cubiertos

- `project_config`
- `hr_source_mapping`
- `questionnaire_source`
- `postulation_form`
- `certification_rules`
- `visit_lifecycle_rules`
- `assignment_sync_rules`
- `notification_templates`
- `email_mailbox_policy`
- `crm_folder_refs_policy`
- `shopper_communication_policy`
- `liquidation_payment_rules`
- `reimbursement_rules`
- `ranking_scoring_rules`
- `academy_content_policy`
- `sensitive_data_policy`

## Outcomes de preview

- `rule_version_preview_ready`
- `human_review_required`
- `breaking_change_review_required`
- `blocked_sensitive_payload`
- `blocked_real_activation`
- `rollback_plan_required`
- `migration_plan_required`
- `conflict_review_required`

## Reglas clave

- Toda regla operacional por proyecto debe versionarse.
- No sobrescribir reglas activas silenciosamente.
- Cambios con impacto historico deben conservar version previa.
- Cambios breaking requieren plan de migracion y rollback.
- Cambios de integracion no activan proveedores reales desde preview.
- Cambios de pais/moneda/pago requieren revision humana.
- HR mapping y questionnaire routing requieren preview antes de activacion.
- Sensitive data policy requiere revision de gate sensible.
- No convertir una regla de proyecto en default global SaaS sin revision.

## Pendientes backend derivados

1. Preparar input sintetico/sanitizado de ruleSets.
2. Integrar este validator en runner local seguro.
3. Definir mapa de ruleSetType -> modulo afectado.
4. Preparar payload futuro para UI de configuracion por proyecto sin activar runtime.
5. Relacionar versionamiento de reglas con Academia, notificaciones y changelog.

## Pendientes prototipo / Claude derivados

1. UI de configuracion debe mostrar draft/review/future active/deprecated, no sobrescritura silenciosa.
2. Mostrar impacto de cambios en visitas, HR, cuestionario, pagos, notificaciones, CRM, ranking y Academia.
3. No decir proveedor activo si solo existe version de regla.
4. Mostrar migration/rollback required para breaking changes.
5. Academia debe explicar versionamiento de reglas y revision de impacto.

## Impacto Academia

Academia debe crear/profundizar curso de versionamiento de reglas por rol, cambios breaking/no breaking, revision de impacto, rollback, provider gates, cambios de pago/pais/moneda, HR mapping y cuestionario.

## Estado seguro

Sin cambios frontend, sin runtime, sin deploy, sin produccion, sin import real, sin Firestore writes, sin Make, sin Gemini, sin activacion de proveedor, sin cambio historico real y sin datos sensibles.
