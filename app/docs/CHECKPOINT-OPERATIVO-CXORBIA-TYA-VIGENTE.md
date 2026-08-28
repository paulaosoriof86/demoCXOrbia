# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-28  
**STATE_SYNC_EPOCH:** `CXORBIA-20260828-F8-AUTHORIZED-TRANSPORT-STOP-01`  
**MASTER_PLAN_VERSION:** `1.1.0` / `FROZEN`  
**F5:** `CLOSED_PASS_CONSUMED_ZERO_RESIDUE`  
**F6:** `CLOSED_PASS_IMMUTABLE`  
**F7:** `GO_WITH_WARNINGS_NO_P0`  
**F8:** `AUTHORIZED_NOT_YET_CONSUMED__EXTERNAL_TRANSPORT_OUTAGE`  
**NEXT:** `F8_EXECUTE_AUTHORIZED_BACKUP_RESTORE_CUTOVER_WHEN_SECURE_PROVIDER_EXECUTION_CHANNEL_IS_AVAILABLE`  
**PHASE_A:** `100/100`  
**PRODUCTION_REAL_READINESS:** `95/100`

## Release congelado

Permanece exacto `CXORBIA-PHASE-A-RELEASE-100-FROZEN-20260827-01`: functional `f9802fdd498934a8e7729fa5c7d18341bec1cd71`; runtime `2d0b8e83b32b44f6c3eae80b7630f8cd3295fba2`; Cloud Run `cxorbia-live-hr-dev-00013-rns`; image `sha256:eca8b831c24ef81f09e4addda721d0af89a24c5a0d753aa507989988458227ec`; Hosting release `sites/cxorbia-backend-dev/releases/1787796646738000`; Hosting version `sites/cxorbia-backend-dev/versions/afe292cfcbbc6005`.

## F8

`F7-P1-003` continúa `CLOSED/PASS`. Paula emitió autorización explícita single-use para el mínimo backup/export, restore controlado y mutaciones estrictamente necesarias del cutover del release exacto. La autorización está registrada y **no consumida**.

Se preparó un ejecutor F8 fail-closed en `tools/release/tya-f8-backup-restore-cutover-one-shot.mjs`. La ejecución provider no comenzó porque esta sesión carece de un canal GCP/provider autenticado utilizable y no se permite crear/revivir transporte, IAM o credenciales fuera del alcance autorizado.

Clasificación de bloqueo: `EXTERNAL_TRANSPORT_OUTAGE_NO_SAFE_PROVIDER_EXECUTOR_IN_CURRENT_SESSION`; no P0 de producto.

Estado de este cierre: provider/IAM/data/Auth/Firestore/HR/Storage/Rules/pagos/Make/Gemini writes=`0`; backup/export attempt=`0`; restore attempt=`0`; cutover attempt=`0`; deploy/rebuild/reimport/merge=`0`.

**Siguiente gate exacto:** `F8_EXECUTE_AUTHORIZED_BACKUP_RESTORE_CUTOVER_WHEN_SECURE_PROVIDER_EXECUTION_CHANNEL_IS_AVAILABLE`.
