# CXOrbia TyA — Progreso hacia producción real

**Fecha de baseline vigente:** 2026-08-27  
**Métrica canónica:** `PRODUCTION_REAL_READINESS`  
**Estado actual:** `90/100`  
**PHASE_A:** `100/100`  
**MASTER_PLAN_VERSION:** `1.1.0`  
**PLAN_CHANGE_REQUEST:** `PCR-20260826-PRODUCTION-ACCELERATION-01`

## Gates cerrados

- `69 → 74`: M3 terminal `CLOSED_PASS`, 30/30 HOLD terminales, residual 0.
- `74 → 76`: F3 `PROVIDER_PROMOTION_MECHANISM_V1` + `G2B_RECOVERY_LANE_PASS`.
- `76 → 81`: F4 `RECOVERY_PASS_FULL`.
- `81 → 86`: F5 `F5_LIVE_SYNTHETIC_ACCEPTANCE_PASS` + cleanup + post-clean readback cero.
- `86 → 90`: F6 `F6_PHASE_A_RELEASE_100_FROZEN` con manifest inmutable y readbacks exactos.

## Evidencia F6 para 90/100

Release `CXORBIA-PHASE-A-RELEASE-100-FROZEN-20260827-01`:

- manifest blob `732dbfd48912b3550c6fb20bc592bd118647263a`;
- manifest SHA-256 `29399792e75729c4d5db28865dd793a74f2d79b73f78704d03d5c27094ed68ab`;
- functional source `f9802fdd498934a8e7729fa5c7d18341bec1cd71`;
- runtime release source `2d0b8e83b32b44f6c3eae80b7630f8cd3295fba2`;
- runtime tree `f93012599e4ca5195f89f19995251fa91c0d38d9`;
- Cloud Run revision `cxorbia-live-hr-dev-00013-rns`;
- image digest `sha256:eca8b831c24ef81f09e4addda721d0af89a24c5a0d753aa507989988458227ec`;
- Hosting release `sites/cxorbia-backend-dev/releases/1787796646738000`;
- Hosting version `sites/cxorbia-backend-dev/versions/afe292cfcbbc6005`;
- F5 lifecycle PASS, cleanup PASS y post-clean readback `PASS_ZERO_RESIDUE`;
- provider/data/Auth/HR/pagos/Rules/Storage/Make/Gemini/deploy/rebuild/reimport/merge durante F6 = 0.

Evidencia: `app/docs/evidence/RC15-F6-PHASE-A-IMMUTABLE-RELEASE-LATEST.json`.

## Escalera congelada V1.1

- actual: `90/100`;
- `90 → 95`: F7 readiness integral `GO`/`GO_WITH_WARNINGS` sin P0;
- `95 → 98`: F8 cutover exacto;
- `98 → 100`: F9 aceptación postproducción.

No se aumenta porcentaje por diagnóstico, preparación o documentación sin gate terminal cerrado.

## Siguiente gate

`F7_INTEGRAL_READINESS`.

F7 se ejecuta contra el release exacto congelado. `HOLD/NO_GO` requiere P0 o bloqueo reproducible; una advertencia P1/P2 documentada no reabre F6.
