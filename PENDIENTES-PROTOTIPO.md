# PENDIENTES-PROTOTIPO.md

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

## Cerrado

M3 y F3 permanecen cerrados. El defecto de carril detectado al iniciar F4 quedó clasificado `MECHANISM_P0` y la reparación autorizada es exclusivamente el workflow existente, adaptado a `PROVIDER_PROMOTION_MECHANISM_V1`.

## Pendiente inmediato único

Ejecutar F4 one-shot. Lease `F4-G2B-PROVIDER-LEASE-20260826-01` emitido/no consumido; primero debe pasar preflight provider read-only y verificar la revisión conocida `cxorbia-live-hr-dev-00011-f2f`. Solo después puede consumirse al iniciar Cloud Build. No retry automático.

Salida: `RECOVERY_PASS_FULL` → 81/100, o STOP terminal `PRODUCT_P0 / MECHANISM_P0 / EXTERNAL_TRANSPORT_OUTAGE`.

## Producto / Claude / Academia

Sin cambio frontend ni tarea nueva para Claude. Source-fix pin `1d2cfecba0a89b637398d747a628e549d9823c68`; no modificar `/app/modules` ni `/app/core`. Sin impacto funcional de Academia durante la reparación del carril.
