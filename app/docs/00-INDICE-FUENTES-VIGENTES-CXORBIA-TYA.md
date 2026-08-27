# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-27  
**STATE_SYNC_EPOCH:** `CXORBIA-20260827-F6-PHASE-A-RELEASE-100-FROZEN-01`  
**MASTER_PLAN_ID:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1`  
**MASTER_PLAN_VERSION:** `1.1.0`  
**MASTER_PLAN_STATUS:** `FROZEN`  
**PLAN_CHANGE_REQUEST:** `PCR-20260826-PRODUCTION-ACCELERATION-01`  
**currentMasterPhase:** `F7_INTEGRAL_READINESS`  
**currentMasterStep:** `F6_PHASE_A_RELEASE_100_FROZEN`  
**M1:** `CLOSED_PASS`  
**M2/F0:** `CLOSED_PASS_4_OF_4`  
**M3:** `CLOSED_PASS_30_OF_30_ZERO_RESIDUAL_DIRECT_REMOTE_READBACK`  
**F3:** `CLOSED_PASS_PROVIDER_PROMOTION_MECHANISM_V1_G2B_RECOVERY_LANE_PASS`  
**F4:** `CLOSED_PASS_RECOVERY_PASS_FULL_READONLY_RECERTIFIED`  
**F5:** `CLOSED_PASS_CONSUMED_ZERO_RESIDUE`  
**F6:** `CLOSED_PASS_IMMUTABLE`  
**NEXT:** `F7_INTEGRAL_READINESS`  
**PHASE_A:** `100/100`  
**PRODUCTION_REAL_READINESS:** `90/100`

## 1. Autoridad canónica viva

Leer y respetar en este orden operativo:

1. este índice;
2. fuentes maestras vigentes de continuidad, empalme, Academia, patrones reutilizables y antidesvío;
3. master plan V1.1 congelado `app/docs/PLAN-OPERATIVO-UNIFICADO-CXORBIA-TYA-VIGENTE.md`, blob `0ea2cd9802e687938086886d8d03648f105a7d64`, SHA-256 `7b49f7df172f8b322c3ae38bdf55f50936696d2d6f7b5086ae8a68e97827dafa`;
4. `backend/config/cxorbia-phase-a-continuity-lock.json` schema `3.6.0`;
5. manifest inmutable `backend/config/cxorbia-phase-a-release-manifest-v1.json`;
6. evidencia terminal `app/docs/evidence/RC15-F6-PHASE-A-IMMUTABLE-RELEASE-LATEST.json`;
7. evidencia terminal F5/F4/F3/M3 conservada por referencia;
8. checkpoint, source lock, progress lock, CAMBIOS, Claude y Pendientes como mirrors sincronizados;
9. PR #7 permanece `mirror-only`, cerrado y no mergeado;
10. resolver siempre el HEAD vivo de `docs-tya-v6-v71-audit` dinámicamente antes de escribir.

El master plan está congelado. Sus encabezados históricos de fase no se reescriben sin un nuevo `PLAN_CHANGE_REQUEST`; el estado operativo vivo se resuelve mediante continuity lock + evidencia terminal + mirrors sincronizados.

## 2. F6 cerrado PASS — release Phase A inmutable

Release ID: `CXORBIA-PHASE-A-RELEASE-100-FROZEN-20260827-01`.

- Manifest blob: `732dbfd48912b3550c6fb20bc592bd118647263a`.
- Manifest SHA-256: `29399792e75729c4d5db28865dd793a74f2d79b73f78704d03d5c27094ed68ab`.
- Functional source SHA: `f9802fdd498934a8e7729fa5c7d18341bec1cd71`.
- Runtime release source SHA: `2d0b8e83b32b44f6c3eae80b7630f8cd3295fba2`.
- Runtime release tree: `f93012599e4ca5195f89f19995251fa91c0d38d9`.
- Cloud Run: `cxorbia-live-hr-dev-00013-rns`.
- Image digest: `sha256:eca8b831c24ef81f09e4addda721d0af89a24c5a0d753aa507989988458227ec`.
- Hosting release: `sites/cxorbia-backend-dev/releases/1787796646738000`.
- Hosting version: `sites/cxorbia-backend-dev/versions/afe292cfcbbc6005`.
- F5 lifecycle/cleanup/post-clean readback: PASS / PASS / PASS_ZERO_RESIDUE.
- F6 provider access, provider writes, rebuilds, deploys, data reimport y merge: 0.

F6 no reabre F5 y no autoriza rebuild/redeploy del release congelado.

## 3. Hallazgo de mecanismo no bloqueante

Run read-only `33085991102`: `MECHANISM_P1_NON_BLOCKING` por arranque local sin `firebase-admin` instalado. No hubo provider mutation ni deploy. Permanece pendiente de reparación en el carril de mecanismo, sin reabrir F5/F6.

## 4. Siguiente exacto

`F7_INTEGRAL_READINESS`.

F7 debe evaluar exclusivamente el release exacto congelado: seguridad/IAM/Rules/secrets, aislamiento tenant, migración, Auth/RBAC, HR viva/histórica, shoppers, postulaciones, certificaciones, visitas, liquidaciones/pagos, multi-proyecto, sincronización HR↔plataforma, E2E/regresión, carga/cuotas, failure injection, idempotencia, backup/restore, rollback, observabilidad, alertas, runbooks, Claude y Academia.

Criterio de salida: `GO` o `GO_WITH_WARNINGS` sin P0 demostrado. `HOLD/NO_GO` exige evidencia reproducible.
