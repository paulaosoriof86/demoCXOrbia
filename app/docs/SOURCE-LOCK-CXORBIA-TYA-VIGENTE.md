# SOURCE LOCK CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-28  
**STATE_SYNC_EPOCH:** `CXORBIA-20260828-F8-TEMP-RESTORE-CLEANUP-HARDENED-04`  
**MASTER_PLAN_VERSION:** `1.1.0` / `FROZEN`  
**currentMasterPhase:** `F8_CUTOVER`  
**currentMasterStep:** `F8_AUTHORIZED_EXECUTOR_TEMP_RESTORE_CLEANUP_HARDENED_TRANSPORT_STOP`  
**NEXT:** `F8_EXECUTE_AUTHORIZED_BACKUP_RESTORE_CUTOVER_WHEN_SECURE_PROVIDER_EXECUTION_CHANNEL_IS_AVAILABLE`  
**PHASE_A:** `100/100`  
**PRODUCTION_REAL_READINESS:** `95/100`

## Source lock funcional y release congelado

`productionState.functionalSourceLock` permanece `f9802fdd498934a8e7729fa5c7d18341bec1cd71`.

Release `CXORBIA-PHASE-A-RELEASE-100-FROZEN-20260827-01`; manifest SHA-256 `29399792e75729c4d5db28865dd793a74f2d79b73f78704d03d5c27094ed68ab`; runtime source `2d0b8e83b32b44f6c3eae80b7630f8cd3295fba2`; runtime tree `f93012599e4ca5195f89f19995251fa91c0d38d9`; Cloud Run `cxorbia-live-hr-dev-00013-rns`; image `sha256:eca8b831c24ef81f09e4addda721d0af89a24c5a0d753aa507989988458227ec`; Hosting release `sites/cxorbia-backend-dev/releases/1787796646738000`; Hosting version `sites/cxorbia-backend-dev/versions/afe292cfcbbc6005`.

Los commits de autorización, executor, entrypoint, hardening, evidencia y docs/control-plane no sustituyen ningún SHA del release funcional congelado.

## F8 autorizado, ejecutor endurecido, provider no iniciado

La autorización single-use `PAULA-F8-BACKUP-RESTORE-CUTOVER-20260827-01` sigue no consumida. Ninguna mutación provider se inició.

El ejecutor fue reparado previamente para lineage/consumo y el entrypoint quedó ejecutable con anti-replay local. La revisión posterior demostró riesgos en identidad y cleanup de la base temporal: nominación previa al export, posible colisión cross-workspace por precisión al minuto y posibilidad de un segundo DELETE automático.

El commit `183d56ed5cd70683c6dff1506c46e1beebed8281` actualizó `tools/release/tya-f8-backup-restore-cutover-one-shot.mjs` a schema v4. La temp DB se genera solo después del backup/export, usa un sufijo aleatorio no secreto de 4 bytes, solo se vuelve cleanup-eligible después de que CREATE sea aceptado y las rutas DELETE se desarman antes de emitir una única solicitud. Blob `1d4b01bf3df3ec59ba84194a3b0d77f5c5425630`; exact local blob + syntax PASS.

No crear ni revivir workflow transportador, IAM/WIF, service account, credencial, rama o PR como sustituto. No redeploy/rebuild/reimport del release exacto sin drift y autorización correspondiente.

La sesión actual sigue sin canal GCP/provider autenticado seguro para ejecutar F8.

Clasificación: `MECHANISM_TEMP_RESTORE_IDENTITY_AND_CLEANUP_HARDENED__EXTERNAL_TRANSPORT_OUTAGE_REMAINS`; product P0=false; provider writes=0; autorización consumida=false.

PR #7 continúa mirror-only/cerrado/no mergeado. Resolver HEAD vivo antes de cualquier futura mutación provider.

**NEXT:** `F8_EXECUTE_AUTHORIZED_BACKUP_RESTORE_CUTOVER_WHEN_SECURE_PROVIDER_EXECUTION_CHANNEL_IS_AVAILABLE`.
