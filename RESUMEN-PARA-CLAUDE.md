# RESUMEN-PARA-CLAUDE.md

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

F4 quedó autorizado por Paula. Se demostró y corrigió focalmente un `MECHANISM_P0`: el workflow existente de runtime había quedado inertizado por M3 y no podía ejecutar el nuevo contrato provider de F3. La reparación reutiliza el mismo workflow/path y el patrón histórico probado; no crea workflow, rama, PR ni cambia source funcional/frontend.

Release exacto para recovery: source funcional `f9802fdd498934a8e7729fa5c7d18341bec1cd71` + source-fix pin `1d2cfecba0a89b637398d747a628e549d9823c68`. Autorización `F4-G2B-RECOVERY-20260826-01`; lease `F4-G2B-PROVIDER-LEASE-20260826-01`, emitido/no consumido hasta el primer Cloud Build posterior a preflight PASS.

No modificar UI, `/app/modules` ni `/app/core`. F4 permite como máximo 1 Build, 1 Cloud Run update y 1 Hosting deploy; datos/Auth/Storage/HR/Rules/Make/Gemini/pagos/merge quedan en cero. Academia: sin impacto funcional en esta reparación; F7 mantiene su revisión integral.
