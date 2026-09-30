# Release readiness snapshot preview validator Phase A TyA

Fecha: 2026-07-04

## Objetivo

Cerrar el bloque largo backend de release/readiness snapshot. Este bloque agrupa validaciones, gates, auditoria de prototipo, readiness de Academia y estado de Phase A antes de cualquier activacion real, deploy, merge, importacion o conexion de proveedor.

## Archivos creados

- `app/contracts/release-readiness-snapshot-preview-phase-a.tya.contract.json`
- `tools/migration/tya-release-readiness-snapshot-preview-validator.mjs`

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
- `app/contracts/project-tenant-rule-versioning-preview-phase-a.tya.contract.json`
- `app/contracts/rule-change-changelog-notification-preview-phase-a.tya.contract.json`

## Que valida

1. Gates apagados: runtime, produccion, Firestore, Storage, Make, email, WhatsApp, Gemini, import, deploy y merge.
2. Input source-safe: `sourceSafe=true`, `containsRawSensitiveData=false`, `isSyntheticOrSanitized=true`.
3. Ausencia de datos operativos crudos, credenciales, tokens, secrets, destinatarios crudos o payloads sensibles.
4. Snapshot por `tenantId`, `snapshotId`, `snapshotPeriodId`, `baselineRef`, `backendBranchRef` y `pullRequestRef`.
5. Items de readiness por area, validador, estado, gate y bloqueo.
6. Separacion de blockers: missing input, sensitive data, real gate off, prototype pending, conflict y manual review.
7. Que preview-ready no se confunda con production-ready.
8. Que Academia readiness se trate como area de release, no como nota secundaria.

## Entrada segura esperada

```json
{
  "sourceSafe": true,
  "containsRawSensitiveData": false,
  "isSyntheticOrSanitized": true,
  "snapshot": {
    "tenantId": "tya",
    "snapshotId": "release_snapshot_ref_001",
    "snapshotPeriodId": "phase_a_preview_001",
    "baselineRef": "latest_audited_baseline_ref",
    "backendBranchRef": "docs-tya-v6-v71-audit",
    "pullRequestRef": "pr_7_ref",
    "createdByRef": "backend_ref",
    "status": "draft_preview"
  },
  "readinessItems": [
    {
      "tenantId": "tya",
      "projectId": "cinepolis_gt",
      "snapshotId": "release_snapshot_ref_001",
      "readinessArea": "assignment_sync",
      "readinessStatus": "preview_ready",
      "gateStatus": "off_verified",
      "validatorId": "assignment_sync_conflict_preview"
    }
  ]
}
```

## Uso futuro local seguro

```bash
node tools/migration/tya-release-readiness-snapshot-preview-validator.mjs
node tools/migration/tya-release-readiness-snapshot-preview-validator.mjs --input path/to/release-readiness-snapshot-preview.json
```

Si se ejecuta sin `--input`, el script solo revisa contratos.

## Areas de readiness cubiertas

- prototype audit;
- CX.data adapter;
- Auth claims;
- HR source preview;
- assignment sync;
- visit lifecycle;
- postulation form;
- notification outbox;
- email mailbox;
- CRM folder refs;
- shopper communication history;
- shopper ranking/scoring;
- project rule versioning;
- rule change changelog;
- liquidation/payment preview;
- sensitive data policy;
- Academia readiness;
- Make/Gemini payload preview;
- Storage evidence policy;
- Firestore write plan;
- release governance.

## Outcomes de preview

- `release_snapshot_preview_ready`
- `release_snapshot_ready_for_review`
- `release_snapshot_blocked_missing_input`
- `release_snapshot_blocked_sensitive_data`
- `release_snapshot_blocked_real_gate_off`
- `release_snapshot_blocked_prototype_pending`
- `release_snapshot_manual_review_required`
- `release_snapshot_conflict_review_required`

## Reglas clave

- El snapshot es preview; no dispara deploy, merge, import ni escrituras.
- Cada item debe declarar area, validator, readinessStatus, gateStatus y blocker si aplica.
- Activacion real queda bloqueada hasta aprobacion futura y plan de produccion.
- Missing input bloquea ejecucion de validator, pero no bloquea continuar contratos/docs seguros.
- Prototype pending se separa de backend pending y source/data pending.
- Academia readiness es area de release.
- Conflictos fuerzan review o bloqueo.

## Pendientes backend derivados

1. Preparar input sintetico/sanitizado de release readiness snapshot.
2. Integrar este validator en runner local seguro.
3. Mapear cada validator previo a readinessArea.
4. Preparar payload futuro para dashboard de readiness sin activar runtime.
5. Definir checklist de aprobacion preview-only antes de cualquier plan real.

## Pendientes prototipo / Claude derivados

1. Readiness dashboard debe mostrar preview ready, pending backend, missing input, review required y blocked.
2. No debe decir production ready, deployed, imported, connected, sent o synced si gates estan apagados.
3. Separar prototype pending, backend pending, source/data pending y production gate off.
4. Academia debe explicar release readiness, gates y preview vs production.

## Impacto Academia

Academia debe explicar que significa preview-ready, por que los gates siguen apagados, como leer blockers, como missing input difiere de defecto, y como release readiness protege produccion.

## Estado seguro

Sin cambios frontend, sin runtime, sin deploy, sin merge, sin produccion, sin import real, sin Firestore/Storage writes, sin Make, sin Gemini, sin email/WhatsApp real, sin activacion de proveedor y sin datos sensibles.
