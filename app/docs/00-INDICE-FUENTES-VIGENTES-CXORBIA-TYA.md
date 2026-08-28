# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-28  
**STATE_SYNC_EPOCH:** `CXORBIA-20260828-F8-BOUNDED-LOAD-PASS-AUTH-GATE-01`  
**MASTER_PLAN_ID:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1`  
**MASTER_PLAN_VERSION:** `1.1.0` / `FROZEN`  
**currentMasterPhase:** `F8_CUTOVER`  
**currentMasterStep:** `F8_BOUNDED_LOAD_FAILURE_READONLY_PASS`  
**F5:** `CLOSED_PASS_CONSUMED_ZERO_RESIDUE`  
**F6:** `CLOSED_PASS_IMMUTABLE`  
**F7:** `GO_WITH_WARNINGS_NO_P0`  
**F8:** `READY_BACKUP_RESTORE_CUTOVER_AUTHORIZATION_GATE`  
**NEXT:** `F8_BACKUP_RESTORE_AND_CUTOVER_EXPLICIT_AUTHORIZATION_GATE`  
**PHASE_A:** `100/100`  
**PRODUCTION_REAL_READINESS:** `95/100`

## Autoridad canónica viva

1. este índice;
2. `backend/config/cxorbia-phase-a-continuity-lock.json` schema `4.3.0`;
3. master plan V1.1 congelado `app/docs/PLAN-OPERATIVO-UNIFICADO-CXORBIA-TYA-VIGENTE.md`;
4. manifest inmutable `backend/config/cxorbia-phase-a-release-manifest-v1.json`;
5. evidencia F7 terminal `app/docs/evidence/RC15-F7-INTEGRAL-READINESS-LATEST.json`;
6. evidencia provider F8 `app/docs/evidence/RC15-F8-PROVIDER-SECURITY-QUOTA-READONLY-LATEST.json`;
7. reconciliación IAM P1 `app/docs/evidence/RC15-F8-IAM-METADATA-NONBLOCKING-RECONCILIATION-LATEST.json`;
8. bounded load/failure PASS `app/docs/evidence/RC15-F8-BOUNDED-LOAD-FAILURE-READONLY-LATEST.json`;
9. plan read-only de frontera backup/restore/cutover `app/docs/evidence/RC15-F8-BACKUP-RESTORE-CUTOVER-READONLY-PLAN-LATEST.json`;
10. evidencias F8 Shopper y terminales F6/F5/F4/F3/M3 por referencia;
11. fuentes maestras vigentes de continuidad, empalme, Academia, patrones reutilizables y antidesvío;
12. checkpoint/source lock/progress/CAMBIOS/Claude/Pendientes como mirrors;
13. PR #7 permanece mirror-only, cerrado y no mergeado;
14. resolver HEAD vivo de `docs-tya-v6-v71-audit` antes de escribir.

## Release congelado preservado

`CXORBIA-PHASE-A-RELEASE-100-FROZEN-20260827-01`: functional source `f9802fdd498934a8e7729fa5c7d18341bec1cd71`; runtime source `2d0b8e83b32b44f6c3eae80b7630f8cd3295fba2`; Cloud Run `cxorbia-live-hr-dev-00013-rns`; image `sha256:eca8b831c24ef81f09e4addda721d0af89a24c5a0d753aa507989988458227ec`; Hosting release `sites/cxorbia-backend-dev/releases/1787796646738000`; Hosting version `sites/cxorbia-backend-dev/versions/afe292cfcbbc6005`.

No rebuild, deploy, reimport ni sustitución del release ocurrió durante el cierre read-only de este bloque.

## F8 — gates read-only cerrados

`F7-P1-002` continúa como warning P1 no bloqueante: el listado de metadata Secret Manager no es legible por el principal DEV, pero el runtime exacto ya tiene readback PASS, `plaintextSensitiveKeyCount=0`, `secretBackedEnvCount=0`, APIs 4/4 y cuotas 4/4 PASS; no se leyeron payloads.

`F7-P1-003` queda `CLOSED/PASS`. Run `33131739261`: 24/24 GET correctos, concurrencia 4, 0 HTTP 5xx, 0 fallos de contrato, p95 `181.87 ms`, una sola huella de revisión, 15 períodos y 660 visitas. Las inyecciones read-only de token operacional inválido/ausente y Origin no confiable fallaron cerrado. El run `33131536618` se conserva como falso negativo del harness, no como P0 de producto.

La evidencia disponible no demuestra drift del release congelado y el bounded gate operó sobre `F6_FROZEN_RELEASE`; por idempotencia **no corresponde redeploy ahora**. Cualquier reconciliación posterior debe retener el release exacto salvo drift probado por gate autorizado.

## Frontera actual

`PRODUCTION_REAL_READINESS` permanece `95/100` hasta F8 terminal. `F7-P1-004` — backup/export + restore verificable — continúa pendiente y, junto con cualquier cutover/provider mutation, requiere autorización explícita específica vigente.

No se identificó en el control-plane vivo inspeccionado un ejecutor F8 ya autorizado para esa mutación; los workflows de deploy revisados son históricos/consumidos/inertes y no deben revivirse.

**NEXT:** `F8_BACKUP_RESTORE_AND_CUTOVER_EXPLICIT_AUTHORIZATION_GATE`.
