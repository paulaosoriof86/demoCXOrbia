# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-28  
**STATE_SYNC_EPOCH:** `CXORBIA-20260828-F8-ENTRYPOINT-ANTI-REPLAY-REPAIRED-03`  
**MASTER_PLAN_VERSION:** `1.1.0` / `FROZEN`  
**F5:** `CLOSED_PASS_CONSUMED_ZERO_RESIDUE`  
**F6:** `CLOSED_PASS_IMMUTABLE`  
**F7:** `GO_WITH_WARNINGS_NO_P0`  
**F8:** `AUTHORIZED_NOT_YET_CONSUMED__EXECUTOR_ENTRYPOINT_ANTI_REPLAY_REPAIRED__EXTERNAL_TRANSPORT_OUTAGE`  
**NEXT:** `F8_EXECUTE_AUTHORIZED_BACKUP_RESTORE_CUTOVER_WHEN_SECURE_PROVIDER_EXECUTION_CHANNEL_IS_AVAILABLE`  
**PHASE_A:** `100/100`  
**PRODUCTION_REAL_READINESS:** `95/100`

## Release congelado

Permanece exacto `CXORBIA-PHASE-A-RELEASE-100-FROZEN-20260827-01`: functional `f9802fdd498934a8e7729fa5c7d18341bec1cd71`; runtime `2d0b8e83b32b44f6c3eae80b7630f8cd3295fba2`; Cloud Run `cxorbia-live-hr-dev-00013-rns`; image `sha256:eca8b831c24ef81f09e4addda721d0af89a24c5a0d753aa507989988458227ec`; Hosting release `sites/cxorbia-backend-dev/releases/1787796646738000`; Hosting version `sites/cxorbia-backend-dev/versions/afe292cfcbbc6005`.

No hubo rebuild, redeploy, reimport ni sustitución del release.

## F8

La autorización single-use `PAULA-F8-BACKUP-RESTORE-CUTOVER-20260827-01` continúa registrada y no consumida; su alcance no cambió.

El repair source previo `e95d23a91f26f42e1adf3ac167ccd2f0093dd31a` corrigió lineage y momento de consumo. En la continuación se confirmó que el módulo one-shot no tenía punto de entrada ejecutable y que el gate `GITHUB_RUN_ATTEMPT=1` no protegía contra dos invocaciones independientes fuera de Actions.

El commit `13170f4156ad4ab5886b65f923ab5b9e198452b8` añadió `tools/release/tya-f8-backup-restore-cutover-cli.mjs` con punto de entrada real, autenticación efímera no persistida, bloqueo de evidencia previa consumida/mutada y lease local atómica para replay/concurrencia del mismo checkout. El blob exacto `5c399f101a5cd7a7f9a047d5f9fb48c0986543f3` pasó `node --check`.

No se agregó una lease global entre workspaces porque requeriría una nueva superficie durable no autorizada. Cross-workspace continúa gobernado por autorización canónica single-use, `automaticRetryAllowed=false`, gates dinámicos y reconciliación inmediata posterior.

La ejecución provider no comenzó: esta sesión sigue sin un canal GCP/provider autenticado utilizable y no se permite crear/revivir workflow, IAM o credenciales.

Clasificación: `MECHANISM_EXECUTABLE_ENTRYPOINT_AND_LOCAL_ANTI_REPLAY_REPAIRED__EXTERNAL_TRANSPORT_OUTAGE_REMAINS`; no P0 de producto.

Estado: provider/IAM/data/Auth/Firestore/HR/Storage/Rules/pagos/Make/Gemini writes=`0`; backup/export=`0`; restore=`0`; cutover=`0`; deploy/rebuild/reimport/merge=`0`; autorización consumida=`false`.

**Siguiente gate exacto:** `F8_EXECUTE_AUTHORIZED_BACKUP_RESTORE_CUTOVER_WHEN_SECURE_PROVIDER_EXECUTION_CHANNEL_IS_AVAILABLE`.
