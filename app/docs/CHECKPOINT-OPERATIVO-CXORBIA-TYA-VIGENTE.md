# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-28  
**STATE_SYNC_EPOCH:** `CXORBIA-20260828-F8-EXECUTOR-REPAIRED-TRANSPORT-STOP-02`  
**MASTER_PLAN_VERSION:** `1.1.0` / `FROZEN`  
**F5:** `CLOSED_PASS_CONSUMED_ZERO_RESIDUE`  
**F6:** `CLOSED_PASS_IMMUTABLE`  
**F7:** `GO_WITH_WARNINGS_NO_P0`  
**F8:** `AUTHORIZED_NOT_YET_CONSUMED__EXECUTOR_SOURCE_REPAIRED__EXTERNAL_TRANSPORT_OUTAGE`  
**NEXT:** `F8_EXECUTE_AUTHORIZED_BACKUP_RESTORE_CUTOVER_WHEN_SECURE_PROVIDER_EXECUTION_CHANNEL_IS_AVAILABLE`  
**PHASE_A:** `100/100`  
**PRODUCTION_REAL_READINESS:** `95/100`

## Release congelado

Permanece exacto `CXORBIA-PHASE-A-RELEASE-100-FROZEN-20260827-01`: functional `f9802fdd498934a8e7729fa5c7d18341bec1cd71`; runtime `2d0b8e83b32b44f6c3eae80b7630f8cd3295fba2`; Cloud Run `cxorbia-live-hr-dev-00013-rns`; image `sha256:eca8b831c24ef81f09e4addda721d0af89a24c5a0d753aa507989988458227ec`; Hosting release `sites/cxorbia-backend-dev/releases/1787796646738000`; Hosting version `sites/cxorbia-backend-dev/versions/afe292cfcbbc6005`.

No hubo rebuild, redeploy, reimport ni sustitución del release.

## F8

La autorización explícita single-use `PAULA-F8-BACKUP-RESTORE-CUTOVER-20260827-01` sigue registrada y **no consumida**. Su alcance no cambió.

Antes de ejecutar provider se revisó el one-shot y se demostraron dos defectos source-only: dependencia de `authorizedExecutionParentHead`, campo inexistente en la autorización canónica, y consumo prematuro de la autorización durante prechecks. Ambos quedaron reparados en `e95d23a91f26f42e1adf3ac167ccd2f0093dd31a`.

El ejecutor ahora fija los blobs inmutables de autorización/manifest, resuelve el commit real de autorización y exige ancestry contra el HEAD de ejecución; además solo marca la autorización consumida al iniciar `BACKUP_EXPORT`, inmediatamente antes de la primera mutación provider. Validación sintáctica: `PASS`.

Evidencia: `app/docs/evidence/RC15-F8-EXECUTOR-SOURCE-REPAIR-LATEST.json`.

La ejecución provider sigue sin comenzar porque la sesión no dispone de un canal GCP/provider autenticado utilizable y no se permite crear/revivir workflow, IAM o credenciales fuera del alcance autorizado.

Clasificación vigente: `MECHANISM_SOURCE_DEFECT_REPAIRED__EXTERNAL_TRANSPORT_OUTAGE_REMAINS`; no P0 de producto.

Estado: provider/IAM/data/Auth/Firestore/HR/Storage/Rules/pagos/Make/Gemini writes=`0`; backup/export attempt=`0`; restore attempt=`0`; cutover attempt=`0`; deploy/rebuild/reimport/merge=`0`; autorización consumida=`false`.

**Siguiente gate exacto:** `F8_EXECUTE_AUTHORIZED_BACKUP_RESTORE_CUTOVER_WHEN_SECURE_PROVIDER_EXECUTION_CHANNEL_IS_AVAILABLE`.
