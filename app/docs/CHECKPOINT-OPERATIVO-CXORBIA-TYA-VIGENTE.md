# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-26
**MASTER_PLAN_ID:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1`
**MASTER_PLAN_VERSION:** `1.1.0`
**MASTER_PLAN_STATUS:** `FROZEN`
**PLAN_CHANGE_REQUEST:** `PCR-20260826-PRODUCTION-ACCELERATION-01`
**M3:** `CLOSED_PASS_30_OF_30_ZERO_RESIDUAL_DIRECT_REMOTE_READBACK`
**F3:** `CLOSED_PASS_PROVIDER_PROMOTION_MECHANISM_V1_G2B_RECOVERY_LANE_PASS`
**F4:** `AUTHORIZED_MECHANISM_P0_REPAIRED_PENDING_EXECUTION`
**NEXT:** `F4_G2B_ONE_SHOT_EXECUTION`
**PHASE_A:** `98/100`
**PRODUCTION_REAL_READINESS:** `76/100`

F4 está autorizado por la instrucción vigente de Paula `continúa con el siguiente bloque`. El preflight source/control-plane demostró `MECHANISM_P0`: `.github/workflows/cxorbia-phase-a-live-hr-runtime-deploy-dev.yml` estaba `HISTORICAL_INERT_M3`, aunque en `1d2cfecba0a89b637398d747a628e549d9823c68` el mismo path contiene el ejecutor probado Cloud Build → Cloud Run → smoke → Hosting → post-readback. La reparación se limita a ese workflow existente y al contrato F4; frontend/source funcional no cambia.

Release authorization: `F4-G2B-RECOVERY-20260826-01`. Lease: `F4-G2B-PROVIDER-LEASE-20260826-01`, single-use, emitido/no consumido. El runner debe ejecutar primero preflight provider read-only y exigir revisión actual `cxorbia-live-hr-dev-00011-f2f`; solo después puede consumir el lease en el borde del primer Cloud Build.

Source funcional preservado `f9802fdd498934a8e7729fa5c7d18341bec1cd71`; release source-fix pin `1d2cfecba0a89b637398d747a628e549d9823c68`. Budget: Build 1, Run update 1, Hosting deploy 1; Firestore/Auth/Storage/HR externa/datos/credenciales reales/pagos/Rules/Make/Gemini/merge = 0; retry automático = 0.

Hasta que exista run + provider post-readback terminal, readiness permanece `76/100`.
