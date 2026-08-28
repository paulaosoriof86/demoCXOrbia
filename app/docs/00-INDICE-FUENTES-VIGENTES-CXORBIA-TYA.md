# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-28  
**STATE_SYNC_EPOCH:** `CXORBIA-20260828-F8-ENTRYPOINT-ANTI-REPLAY-REPAIRED-03`  
**MASTER_PLAN_ID:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1`  
**MASTER_PLAN_VERSION:** `1.1.0` / `FROZEN`  
**currentMasterPhase:** `F8_CUTOVER`  
**currentMasterStep:** `F8_AUTHORIZED_EXECUTOR_ENTRYPOINT_ANTI_REPLAY_REPAIRED_TRANSPORT_STOP`  
**F5:** `CLOSED_PASS_CONSUMED_ZERO_RESIDUE`  
**F6:** `CLOSED_PASS_IMMUTABLE`  
**F7:** `GO_WITH_WARNINGS_NO_P0`  
**F8:** `AUTHORIZED_NOT_YET_CONSUMED__EXECUTOR_ENTRYPOINT_ANTI_REPLAY_REPAIRED__EXTERNAL_TRANSPORT_OUTAGE`  
**NEXT:** `F8_EXECUTE_AUTHORIZED_BACKUP_RESTORE_CUTOVER_WHEN_SECURE_PROVIDER_EXECUTION_CHANNEL_IS_AVAILABLE`  
**PHASE_A:** `100/100`  
**PRODUCTION_REAL_READINESS:** `95/100`

## Autoridad canónica viva

1. este índice;
2. `backend/config/cxorbia-phase-a-continuity-lock.json` schema `4.3.0` como lock previo aún autoritativo de release/gates; la autorización F8 posterior está registrada por evidencia específica y no se considera consumida;
3. master plan V1.1 congelado `app/docs/PLAN-OPERATIVO-UNIFICADO-CXORBIA-TYA-VIGENTE.md`;
4. manifest inmutable `backend/config/cxorbia-phase-a-release-manifest-v1.json`;
5. evidencia F7 terminal `app/docs/evidence/RC15-F7-INTEGRAL-READINESS-LATEST.json`;
6. bounded load/failure PASS `app/docs/evidence/RC15-F8-BOUNDED-LOAD-FAILURE-READONLY-LATEST.json`;
7. autorización single-use `app/docs/evidence/RC15-F8-BACKUP-RESTORE-CUTOVER-AUTHORIZATION-LATEST.json`;
8. STOP de transporte `app/docs/evidence/RC15-F8-BACKUP-RESTORE-CUTOVER-AUTHORIZATION-AND-TRANSPORT-STOP-LATEST.json`;
9. reparación source del ejecutor `app/docs/evidence/RC15-F8-EXECUTOR-SOURCE-REPAIR-LATEST.json`;
10. reparación entrypoint/anti-replay `app/docs/evidence/RC15-F8-EXECUTOR-ENTRYPOINT-ANTI-REPLAY-REPAIR-LATEST.json`;
11. ejecutor provider `tools/release/tya-f8-backup-restore-cutover-one-shot.mjs`;
12. entrypoint ejecutable `tools/release/tya-f8-backup-restore-cutover-cli.mjs`;
13. `app/docs/CAMBIOS-BACKEND-ADDENDUM-F8-EXECUTOR-ENTRYPOINT-ANTI-REPLAY-20260828.md`;
14. `app/docs/RESUMEN-PARA-CLAUDE-ADDENDUM-F8-EXECUTOR-ENTRYPOINT-ANTI-REPLAY-20260828.md`;
15. `app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-F8-EXECUTOR-ENTRYPOINT-ANTI-REPLAY-20260828.md`;
16. checkpoint/source lock/progress/CAMBIOS/Claude/Pendientes como mirrors;
17. PR #7 mirror-only, cerrado y no mergeado;
18. resolver HEAD vivo de `docs-tya-v6-v71-audit` antes de cualquier mutación provider.

## Release congelado preservado

`CXORBIA-PHASE-A-RELEASE-100-FROZEN-20260827-01`: functional source `f9802fdd498934a8e7729fa5c7d18341bec1cd71`; runtime source `2d0b8e83b32b44f6c3eae80b7630f8cd3295fba2`; Cloud Run `cxorbia-live-hr-dev-00013-rns`; image `sha256:eca8b831c24ef81f09e4addda721d0af89a24c5a0d753aa507989988458227ec`; Hosting release `sites/cxorbia-backend-dev/releases/1787796646738000`; Hosting version `sites/cxorbia-backend-dev/versions/afe292cfcbbc6005`.

No rebuild, redeploy, reimport ni sustitución del release ocurrió.

## F8

La autorización `PAULA-F8-BACKUP-RESTORE-CUTOVER-20260827-01` continúa single-use, `AUTHORIZED_NOT_YET_CONSUMED`. Provider writes, backup/export, restore, cutover y deploy continúan en `0`.

El repair previo `e95d23a91f26f42e1adf3ac167ccd2f0093dd31a` corrigió lineage y momento de consumo. En la continuación se confirmó que el módulo one-shot carecía de punto de entrada ejecutable y que `GITHUB_RUN_ATTEMPT=1` no impedía invocaciones independientes fuera de Actions.

El commit `13170f4156ad4ab5886b65f923ab5b9e198452b8` añadió `tools/release/tya-f8-backup-restore-cutover-cli.mjs`: entrypoint fail-closed, entrada de autenticación efímera sin persistencia/salida, gate de evidencia de consumo/mutación y lease local atómica para replay/concurrencia del mismo checkout. Blob `5c399f101a5cd7a7f9a047d5f9fb48c0986543f3`; `node --check` PASS sobre ese blob exacto.

No se añadió lease global cross-workspace porque exigiría una nueva superficie durable de escritura o contrato de transporte no autorizado. La autoridad global sigue siendo autorización canónica single-use + `automaticRetryAllowed=false` + gates dinámicos + reconciliación inmediata posterior.

### Bloqueo vigente

Esta sesión continúa sin un canal autenticado GCP/provider capaz de ejecutar F8 y no se permite inventar workflow, credencial, IAM, rama o PR para sustituirlo.

Clasificación vigente: `MECHANISM_EXECUTABLE_ENTRYPOINT_AND_LOCAL_ANTI_REPLAY_REPAIRED__EXTERNAL_TRANSPORT_OUTAGE_REMAINS`; `productP0Proven=false`.

**NEXT:** `F8_EXECUTE_AUTHORIZED_BACKUP_RESTORE_CUTOVER_WHEN_SECURE_PROVIDER_EXECUTION_CHANNEL_IS_AVAILABLE`.
