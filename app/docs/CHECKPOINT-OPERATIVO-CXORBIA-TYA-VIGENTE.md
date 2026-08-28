# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-28  
**STATE_SYNC_EPOCH:** `CXORBIA-20260828-F8-CLOSED-ZERO-RESIDUE-F8_5-IN-PROGRESS-07`  
**MASTER_PLAN_VERSION:** `1.1.0` / `FROZEN`  
**F5:** `CLOSED_PASS_CONSUMED_ZERO_RESIDUE`  
**F6:** `CLOSED_PASS_IMMUTABLE_WITH_FINGERPRINT_ERRATA_OVERLAY`  
**F7:** `GO_WITH_WARNINGS_NO_P0`  
**F8:** `CLOSED_PASS_ZERO_RESIDUE`  
**NEXT:** `F8_5_CANONICAL_MODULE_LINEAGE_CERTIFICATION`  
**PHASE_A:** `100/100`  
**PRODUCTION_REAL_READINESS:** `98/100`

## Release congelado

Permanece exacto `CXORBIA-PHASE-A-RELEASE-100-FROZEN-20260827-01`: functional `f9802fdd498934a8e7729fa5c7d18341bec1cd71`; runtime `2d0b8e83b32b44f6c3eae80b7630f8cd3295fba2`; Cloud Run `cxorbia-live-hr-dev-00013-rns`; image `sha256:eca8b831c24ef81f09e4addda721d0af89a24c5a0d753aa507989988458227ec`; Hosting release `sites/cxorbia-backend-dev/releases/1787796646738000`; Hosting version `sites/cxorbia-backend-dev/versions/afe292cfcbbc6005`.

## F8 cerrado

Provider run `33193514608`, job `98924733768`, trigger `dec6e8b451d6dd42303ff244703c798d22628975`, attempt 1: `PASS_F8_BACKUP_RESTORE_CUTOVER_RECONCILED_NO_REDEPLOY`. Backup completado/retenido; temp DB creada; import completado; 9/9 colecciones top-level coinciden; temp DB eliminada; cleanup PASS; release exacto reconciliado; deploy/rebuild/reimport=0; production business/Firestore document/Auth/HR/Rules/pagos/Make/Gemini writes=0; legacy DB access=false.

Revocación IAM verificada con run `33187198967`, attempt 4, job `98940746944`, checkout `be029042e9c937b3c29301be3e4e1b4524702e4f`. Después de retirar el binding temporal, volvieron a faltar exactamente export/import/create/delete/operations.get; `getMetadata` permanece basal. Bucket válido; provider writes=0; F8 mutation job skipped. Residuo IAM=0.

F8 queda `CLOSED_PASS_ZERO_RESIDUE`; readiness `95 → 98`.

## F8.5 en curso

Antes de visualización humana ejecutar y cerrar `F8_5_CANONICAL_MODULE_LINEAGE_CERTIFICATION`: identificar última versión aprobada por módulo y verificar contra canónica y Hosting vivo para módulos, core relevante, entrypoints, scripts, adapters y rutas. Cualquier divergencia bloquea la visualización hasta resolverla conforme al source lock.

**Siguiente gate exacto:** `F8_5_CANONICAL_MODULE_LINEAGE_CERTIFICATION`.
