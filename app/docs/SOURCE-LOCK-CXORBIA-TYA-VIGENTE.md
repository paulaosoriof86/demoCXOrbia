# SOURCE LOCK CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-28  
**STATE_SYNC_EPOCH:** `CXORBIA-20260828-F8-EXECUTOR-REPAIRED-TRANSPORT-STOP-02`  
**MASTER_PLAN_VERSION:** `1.1.0` / `FROZEN`  
**currentMasterPhase:** `F8_CUTOVER`  
**currentMasterStep:** `F8_AUTHORIZED_EXECUTOR_SOURCE_REPAIRED_TRANSPORT_STOP`  
**NEXT:** `F8_EXECUTE_AUTHORIZED_BACKUP_RESTORE_CUTOVER_WHEN_SECURE_PROVIDER_EXECUTION_CHANNEL_IS_AVAILABLE`  
**PHASE_A:** `100/100`  
**PRODUCTION_REAL_READINESS:** `95/100`

## Source lock funcional y release congelado

`productionState.functionalSourceLock` permanece `f9802fdd498934a8e7729fa5c7d18341bec1cd71`.

Release `CXORBIA-PHASE-A-RELEASE-100-FROZEN-20260827-01`; manifest SHA-256 `29399792e75729c4d5db28865dd793a74f2d79b73f78704d03d5c27094ed68ab`; runtime source `2d0b8e83b32b44f6c3eae80b7630f8cd3295fba2`; runtime tree `f93012599e4ca5195f89f19995251fa91c0d38d9`; Cloud Run `cxorbia-live-hr-dev-00013-rns`; image `sha256:eca8b831c24ef81f09e4addda721d0af89a24c5a0d753aa507989988458227ec`; Hosting release `sites/cxorbia-backend-dev/releases/1787796646738000`; Hosting version `sites/cxorbia-backend-dev/versions/afe292cfcbbc6005`.

Los commits de autorización, executor, reparación source-only, evidencia y docs/control-plane no sustituyen ningún SHA del release funcional congelado.

## F8 autorizado, ejecutor reparado, provider aún no iniciado

La autorización single-use `PAULA-F8-BACKUP-RESTORE-CUTOVER-20260827-01` está registrada y no consumida. Ninguna mutación provider se inició.

El ejecutor `tools/release/tya-f8-backup-restore-cutover-one-shot.mjs` fue reparado en `e95d23a91f26f42e1adf3ac167ccd2f0093dd31a` para eliminar dos bloqueos source-only previos a ejecución: dependencia de un `authorizedExecutionParentHead` inexistente en la autorización canónica y consumo prematuro de la autorización durante prechecks.

El gate de ejecución ahora fija los blobs exactos de autorización y manifest, resuelve el commit de autorización desde Git y exige que sea ancestro del HEAD; la autorización solo se marca consumida al iniciar `BACKUP_EXPORT`, inmediatamente antes de la primera mutación provider. Evidencia: `app/docs/evidence/RC15-F8-EXECUTOR-SOURCE-REPAIR-LATEST.json`.

No crear ni revivir workflow transportador, IAM/WIF, service account, credencial, rama o PR como sustituto. No redeploy/rebuild/reimport del release exacto sin drift y autorización correspondiente.

La sesión actual sigue sin disponer de canal GCP/provider autenticado seguro para invocar el one-shot.

Clasificación: `MECHANISM_SOURCE_DEFECT_REPAIRED__EXTERNAL_TRANSPORT_OUTAGE_REMAINS`; product P0=false; provider writes=0; autorización consumida=false.

PR #7 continúa mirror-only/cerrado/no mergeado. Resolver HEAD vivo antes de cualquier futura mutación provider.

**NEXT:** `F8_EXECUTE_AUTHORIZED_BACKUP_RESTORE_CUTOVER_WHEN_SECURE_PROVIDER_EXECUTION_CHANNEL_IS_AVAILABLE`.
