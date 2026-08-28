# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-28  
**STATE_SYNC_EPOCH:** `CXORBIA-20260828-F8-TERMINAL-PASS-PENDING-IAM-REVOCATION-06`  
**MASTER_PLAN_ID:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1`  
**MASTER_PLAN_VERSION:** `1.1.0` / `FROZEN`  
**currentMasterPhase:** `F8_CUTOVER`  
**currentMasterStep:** `F8_TERMINAL_PASS_PENDING_TEMP_IAM_REVOCATION_VERIFICATION`  
**F5:** `CLOSED_PASS_CONSUMED_ZERO_RESIDUE`  
**F6:** `CLOSED_PASS_IMMUTABLE_WITH_FINGERPRINT_ERRATA_OVERLAY`  
**F7:** `GO_WITH_WARNINGS_NO_P0`  
**F8:** `TERMINAL_PROVIDER_PASS__AUTH_CONSUMED__PENDING_TEMP_IAM_REVOCATION_ZERO_RESIDUE`  
**NEXT:** `F8_REVOKE_TEMP_DATASTORE_OWNER_VERIFY_ZERO_RESIDUE_THEN_F8_5_CANONICAL_MODULE_LINEAGE_CERTIFICATION`  
**PHASE_A:** `100/100`  
**PRODUCTION_REAL_READINESS:** `95/100`

## Autoridad canónica viva

1. este índice;
2. `backend/config/cxorbia-phase-a-continuity-lock.json` como lock de release/gates previo aún autoritativo;
3. master plan congelado `app/docs/PLAN-OPERATIVO-UNIFICADO-CXORBIA-TYA-VIGENTE.md`;
4. manifest histórico inmutable `backend/config/cxorbia-phase-a-release-manifest-v1.json`;
5. errata overlay `backend/config/cxorbia-phase-a-release-manifest-errata-v1.json`;
6. autorización F8 histórica `app/docs/evidence/RC15-F8-BACKUP-RESTORE-CUTOVER-AUTHORIZATION-LATEST.json`;
7. autorización IAM excepcional `app/docs/evidence/RC15-F8-TEMP-DATASTORE-OWNER-AUTHORIZATION-LATEST.json`;
8. ejecución F8 terminal `app/docs/evidence/RC15-F8-BACKUP-RESTORE-CUTOVER-EXECUTION-LATEST.json`;
9. estado IAM temporal `app/docs/evidence/RC15-F8-TEMP-DATASTORE-OWNER-STATE-LATEST.json`;
10. evidencia de causa raíz `app/docs/evidence/RC15-F8-IAM-BRIDGE-ROOT-CAUSE-LATEST.json`;
11. executor `tools/release/tya-f8-backup-restore-cutover-one-shot.mjs` schema v6 y CLI correspondiente;
12. mirrors checkpoint/source-lock/progress y addenda CAMBIOS/Claude/Pendientes;
13. PR #7 mirror-only, cerrado y no mergeado;
14. única rama viva: `docs-tya-v6-v71-audit`.

## Release congelado preservado

`CXORBIA-PHASE-A-RELEASE-100-FROZEN-20260827-01`: functional `f9802fdd498934a8e7729fa5c7d18341bec1cd71`; runtime `2d0b8e83b32b44f6c3eae80b7630f8cd3295fba2`; Cloud Run `cxorbia-live-hr-dev-00013-rns`; image `sha256:eca8b831c24ef81f09e4addda721d0af89a24c5a0d753aa507989988458227ec`; Hosting release `sites/cxorbia-backend-dev/releases/1787796646738000`; Hosting version `sites/cxorbia-backend-dev/versions/afe292cfcbbc6005`.

No rebuild, redeploy, reimport ni sustitución del release ocurrió.

## F8 terminal provider PASS

Run `33193514608`, job `98924733768`, trigger exacto `dec6e8b451d6dd42303ff244703c798d22628975`, attempt 1.

Decisión: `PASS_F8_BACKUP_RESTORE_CUTOVER_RECONCILED_NO_REDEPLOY`; stage `TERMINAL_PASS`; autorización F8 consumida=true; automaticRetryAllowed=false; providerWrites=4.

Backup/export completado y retenido en bucket GCS same-project `US/STANDARD`; base temporal creada; import completado; 9/9 colecciones top-level coinciden; base temporal eliminada; cleanup completo; Cloud Run y Hosting exactos; release reconciliado; deploy/rebuild/reimport=0; production business data/Firestore document/Auth/HR/Rules/pagos/Make/Gemini writes=0; legacy DB access=false.

## Residuo IAM pendiente

El binding temporal `roles/datastore.owner` ya cumplió su función y debe retirarse. Revocación observada=false; verificación pendiente=true. Por seguridad, `PRODUCTION_REAL_READINESS` permanece 95 hasta demostrar residuo IAM cero. Tras revocación verificada: cerrar F8 y mover `95 → 98`.

## F8.5 obligatorio antes de visualización

Después de revocación verificada ejecutar `F8_5_CANONICAL_MODULE_LINEAGE_CERTIFICATION`. Debe identificar la última versión aprobada por módulo y comparar canónica versus Hosting vivo en `app/modules/**`, `app/core/**` relevante, entrypoints/index, scripts, adapters y rutas. Cualquier mismatch bloquea visualización humana.

La rama accidental `__invalid_should_not_create__` permanece inerte/no autoritativa y no debe usarse.

**NEXT:** `F8_REVOKE_TEMP_DATASTORE_OWNER_VERIFY_ZERO_RESIDUE_THEN_F8_5_CANONICAL_MODULE_LINEAGE_CERTIFICATION`.