# CXOrbia TyA — Progreso hacia producción real

**Fecha de baseline:** 2026-08-26
**Métrica canónica:** `PRODUCTION_REAL_READINESS`
**Estado actual:** `76/100`
**MASTER_PLAN_VERSION:** `1.1.0`
**PLAN_CHANGE_REQUEST:** `PCR-20260826-PRODUCTION-ACCELERATION-01`

`PHASE_A=98/100` se conserva como métrica técnica interna.

## Gates cerrados

- `69 → 74`: M3 terminal `CLOSED_PASS`, 30/30 HOLD terminales, residual 0.
- `74 → 76`: F3 `PROVIDER_PROMOTION_MECHANISM_V1` + `G2B_RECOVERY_LANE_PASS`.

## F4 — activo, sin incremento todavía

Paula autorizó F4 en la conversación vigente. Antes de provider access se probó un `MECHANISM_P0`: el workflow vivo G2-B estaba todavía inertizado por M3. Se corrige focalmente el mismo workflow existente y se ejecuta sobre source-fix pin `1d2cfecba0a89b637398d747a628e549d9823c68`.

Autorización `F4-G2B-RECOVERY-20260826-01`; lease `F4-G2B-PROVIDER-LEASE-20260826-01`, emitido pero no consumido. El lease solo se consume al iniciar el primer Cloud Build después de preflight provider read-only PASS. No hay retry automático.

El porcentaje sigue en `76/100` hasta demostrar `RECOVERY_PASS_FULL` mediante Cloud Run/Hosting readback y cero writes prohibidos.

## Escalera congelada V1.1

- `76 → 81`: F4 recovery G2-B one-shot `RECOVERY_PASS_FULL`.
- `81 → 86`: F5 aceptación sintética integral real `PASS`, cleanup y readback.
- `86 → 90`: F6 release Phase A inmutable.
- `90 → 95`: F7 readiness integral `GO`/`GO_WITH_WARNINGS` sin P0.
- `95 → 98`: F8 cutover exacto.
- `98 → 100`: F9 aceptación postproducción.

Si F4 no termina PASS, el STOP debe ser exactamente `PRODUCT_P0`, `MECHANISM_P0` o `EXTERNAL_TRANSPORT_OUTAGE`; skipped/no runner/cero steps nunca equivalen a fallo de producto.
