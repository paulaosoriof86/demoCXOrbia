# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-26
**STATE_SYNC_EPOCH:** `RC15-M2-F0-CLOSED-20260825-01`
**M3_MECHANISM_EPOCH:** `RC15-M3-MECHANISM-20260825-02`
**F3_PROMOTION_EPOCH:** `RC15-F3-PROVIDER-PROMOTION-20260826-01`
**F4_RECOVERY_EPOCH:** `RC15-F4-G2B-RECOVERY-20260826-01`
**MASTER_PLAN_ID:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1`
**MASTER_PLAN_VERSION:** `1.1.0`
**MASTER_PLAN_STATUS:** `FROZEN`
**PLAN_CHANGE_REQUEST:** `PCR-20260826-PRODUCTION-ACCELERATION-01`
**currentMasterPhase:** `F4_G2B_RECOVERY_ONE_SHOT`
**currentMasterStep:** `F4_G2B_ONE_SHOT_EXECUTION`
**M1:** `CLOSED_PASS`
**M2/F0:** `CLOSED_PASS_4_OF_4`
**M3:** `CLOSED_PASS_30_OF_30_ZERO_RESIDUAL_DIRECT_REMOTE_READBACK`
**F3:** `CLOSED_PASS_PROVIDER_PROMOTION_MECHANISM_V1_G2B_RECOVERY_LANE_PASS`
**F4:** `AUTHORIZED_MECHANISM_P0_REPAIRED_PENDING_EXECUTION`
**NEXT:** `F4_G2B_ONE_SHOT_EXECUTION`
**PHASE_A:** `98/100`
**PRODUCTION_REAL_READINESS:** `76/100`

M3 y F3 permanecen terminales. Al entrar a F4 se demostró un `MECHANISM_P0`: el mismo workflow de runtime que históricamente ejecutaba G2-B seguía inertizado por M3 y no podía consumir la autoridad estructurada de F3. No es P0 de producto. La reparación es focal sobre el workflow existente; no se crea rama, PR, workflow ni metodología.

## Autoridad canónica viva

1. master plan V1.1 congelado y su hash;
2. `backend/config/cxorbia-phase-a-continuity-lock.json`;
3. `backend/config/cxorbia-provider-promotion-mechanism-v1.json` blob `f1c265164b7bc697ecb5cd9b247c334afd76a5f2`;
4. `backend/config/cxorbia-f4-g2b-release-authorization.json`;
5. `backend/config/cxorbia-f4-g2b-provider-mutation-lease.json`;
6. `backend/config/cxorbia-f4-g2b-recovery-execute.json`;
7. `app/docs/evidence/RC15-F4-G2B-MECHANISM-P0-LANE-INERT-LATEST.json`;
8. evidencia terminal F3/M3 + tombstones + consumed ledger + aliases;
9. checkpoint/Claude/Pendientes como mirrors;
10. progress lock para porcentaje real.

## F4 autorizado

Autorización vigente: instrucción de Paula `continúa con el siguiente bloque`. Release authorization `F4-G2B-RECOVERY-20260826-01`; lease single-use `F4-G2B-PROVIDER-LEASE-20260826-01`, emitido y todavía no consumido. Source-fix exacto: `1d2cfecba0a89b637398d747a628e549d9823c68`. Rollback conocido: `cxorbia-live-hr-dev-00011-f2f`.

Budget máximo F4: 1 Cloud Build, 1 Cloud Run update y 1 Hosting deploy. Firestore/Auth/Storage/HR externa/datos/credenciales reales/pagos/Rules/Make/Gemini/merge = 0. Sin retry automático. El lease solo se consume inmediatamente antes del primer Cloud Build después de preflight provider read-only y drift gate PASS.

PR #7 permanece cerrado/no mergeado. El siguiente estado será `RECOVERY_PASS_FULL` o STOP terminal con exactamente `PRODUCT_P0`, `MECHANISM_P0` o `EXTERNAL_TRANSPORT_OUTAGE`.
