# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-28  
**STATE_SYNC_EPOCH:** `CXORBIA-20260828-F8-AUTHORIZED-TRANSPORT-STOP-01`  
**MASTER_PLAN_ID:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1`  
**MASTER_PLAN_VERSION:** `1.1.0` / `FROZEN`  
**currentMasterPhase:** `F8_CUTOVER`  
**currentMasterStep:** `F8_AUTHORIZED_BACKUP_RESTORE_CUTOVER_TRANSPORT_STOP`  
**F5:** `CLOSED_PASS_CONSUMED_ZERO_RESIDUE`  
**F6:** `CLOSED_PASS_IMMUTABLE`  
**F7:** `GO_WITH_WARNINGS_NO_P0`  
**F8:** `AUTHORIZED_NOT_YET_CONSUMED__EXTERNAL_TRANSPORT_OUTAGE`  
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
9. ejecutor preparado `tools/release/tya-f8-backup-restore-cutover-one-shot.mjs`;
10. checkpoint/source lock/progress/CAMBIOS/Claude/Pendientes como mirrors;
11. PR #7 mirror-only, cerrado y no mergeado;
12. resolver HEAD vivo de `docs-tya-v6-v71-audit` antes de cualquier mutación provider.

## Release congelado preservado

`CXORBIA-PHASE-A-RELEASE-100-FROZEN-20260827-01`: functional source `f9802fdd498934a8e7729fa5c7d18341bec1cd71`; runtime source `2d0b8e83b32b44f6c3eae80b7630f8cd3295fba2`; Cloud Run `cxorbia-live-hr-dev-00013-rns`; image `sha256:eca8b831c24ef81f09e4addda721d0af89a24c5a0d753aa507989988458227ec`; Hosting release `sites/cxorbia-backend-dev/releases/1787796646738000`; Hosting version `sites/cxorbia-backend-dev/versions/afe292cfcbbc6005`.

No rebuild, redeploy, reimport ni sustitución del release ocurrió.

## F8

`F7-P1-003` permanece `CLOSED/PASS` por run `33131739261`. La autorización explícita actual cubre únicamente backup/export mínimo, restore temporal verificable y mutaciones estrictamente necesarias del cutover, con las exclusiones expresas registradas.

La autorización **no fue consumida**, porque la sesión actual no dispone de un canal autenticado GCP/provider para iniciar el ejecutor y no está permitido inventar el transporte mediante workflow/credencial/IAM nuevo o revivir mecanismos históricos.

Clasificación: `EXTERNAL_TRANSPORT_OUTAGE_NO_SAFE_PROVIDER_EXECUTOR_IN_CURRENT_SESSION`; `productP0Proven=false`.

**NEXT:** `F8_EXECUTE_AUTHORIZED_BACKUP_RESTORE_CUTOVER_WHEN_SECURE_PROVIDER_EXECUTION_CHANNEL_IS_AVAILABLE`.
