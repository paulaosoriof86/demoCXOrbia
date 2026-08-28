# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-28  
**STATE_SYNC_EPOCH:** `CXORBIA-20260828-F8-TEMP-RESTORE-CLEANUP-HARDENED-04`  
**MASTER_PLAN_VERSION:** `1.1.0` / `FROZEN`  
**F5:** `CLOSED_PASS_CONSUMED_ZERO_RESIDUE`  
**F6:** `CLOSED_PASS_IMMUTABLE`  
**F7:** `GO_WITH_WARNINGS_NO_P0`  
**F8:** `AUTHORIZED_NOT_YET_CONSUMED__EXECUTOR_TEMP_RESTORE_CLEANUP_HARDENED__EXTERNAL_TRANSPORT_OUTAGE`  
**NEXT:** `F8_EXECUTE_AUTHORIZED_BACKUP_RESTORE_CUTOVER_WHEN_SECURE_PROVIDER_EXECUTION_CHANNEL_IS_AVAILABLE`  
**PHASE_A:** `100/100`  
**PRODUCTION_REAL_READINESS:** `95/100`

## Release congelado

Permanece exacto `CXORBIA-PHASE-A-RELEASE-100-FROZEN-20260827-01`: functional `f9802fdd498934a8e7729fa5c7d18341bec1cd71`; runtime `2d0b8e83b32b44f6c3eae80b7630f8cd3295fba2`; Cloud Run `cxorbia-live-hr-dev-00013-rns`; image `sha256:eca8b831c24ef81f09e4addda721d0af89a24c5a0d753aa507989988458227ec`; Hosting release `sites/cxorbia-backend-dev/releases/1787796646738000`; Hosting version `sites/cxorbia-backend-dev/versions/afe292cfcbbc6005`.

No hubo rebuild, redeploy, reimport ni sustitución del release.

## F8

La autorización single-use `PAULA-F8-BACKUP-RESTORE-CUTOVER-20260827-01` continúa registrada y no consumida; su alcance no cambió.

Los repairs previos corrigieron lineage/consumo (`e95d23a91f26f42e1adf3ac167ccd2f0093dd31a`) y añadieron entrypoint/anti-replay local (`13170f4156ad4ab5886b65f923ab5b9e198452b8`).

La revisión focalizada del one-shot detectó además tres riesgos previos a ejecución: temp DB nominada antes del export con cleanup potencial sobre un nombre no creado por esta ejecución, colisión de ID entre workspaces dentro del mismo minuto y posible segundo DELETE automático tras un DELETE normal incierto.

El commit `183d56ed5cd70683c6dff1506c46e1beebed8281` dejó schema de ejecución v4: temp DB solo se genera tras backup/export exitoso, usa sufijo aleatorio no secreto de 4 bytes, cleanup solo se habilita cuando CREATE fue aceptado y cada DELETE se desarma antes de emitir su única solicitud. Blob remoto `1d4b01bf3df3ec59ba84194a3b0d77f5c5425630`; exact-blob local PASS y `node --check` PASS.

Evidencia: `app/docs/evidence/RC15-F8-TEMP-RESTORE-CLEANUP-HARDENING-LATEST.json`.

La ejecución provider sigue sin comenzar porque esta sesión no dispone de un canal GCP/provider autenticado utilizable y no se permite crear/revivir workflow, IAM o credenciales.

Clasificación: `MECHANISM_TEMP_RESTORE_IDENTITY_AND_CLEANUP_HARDENED__EXTERNAL_TRANSPORT_OUTAGE_REMAINS`; no P0 de producto.

Estado: provider/IAM/data/Auth/Firestore/HR/Storage/Rules/pagos/Make/Gemini writes=`0`; backup/export=`0`; restore=`0`; cutover=`0`; deploy/rebuild/reimport/merge=`0`; autorización consumida=`false`.

**Siguiente gate exacto:** `F8_EXECUTE_AUTHORIZED_BACKUP_RESTORE_CUTOVER_WHEN_SECURE_PROVIDER_EXECUTION_CHANNEL_IS_AVAILABLE`.
