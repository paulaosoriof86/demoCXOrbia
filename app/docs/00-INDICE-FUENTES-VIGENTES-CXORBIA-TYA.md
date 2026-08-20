# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-20  
**SYNC_EPOCH:** `CXORBIA-20260820-I5-G2A-PRODUCTION-READONLY-PASS-48`  
**PLAN_ID:** `CXORBIA-PHASE-A-GO-LIVE-DEFINITIVE-RC-CLOSURE`  
**Estado:** `I5_G2A_PASS__I5_G2B_AUTHORIZED_STAGE_PENDING__98_2`  
**currentIteration:** `I5-G2`

## Orden obligatorio
1. `backend/config/cxorbia-phase-a-continuity-lock.json`.
2. `backend/config/cxorbia-g2a-production-readonly-smoke.json`.
3. `backend/config/cxorbia-g2-live-in-platform-acceptance-plan.json`.
4. `backend/config/cxorbia-g2b-live-synthetic-acceptance-request.json`.
5. `backend/config/cxorbia-g1-production-cutover.json`.
6. `backend/config/cxorbia-r4-root-cause-closure.json`.
7. `backend/config/cxorbia-consumed-one-shot-gates.json` y `backend/config/cxorbia-evidence-aliases.json`.
8. `backend/config/cxorbia-r3-critical-product-acceptance.json`.
9. Execution State, Source Lock, Checkpoint, Plan Operativo, Phase A Lock, promotion contract/evidence, Go-Live Tracker, `CAMBIOS-BACKEND.md`, `RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md` y addenda de Academia.
10. PR #7 y HEAD vivo.

PR #7 es mirror no autoritativo. HEAD se resuelve dinámicamente. Si contradice el lock: `CONTINUITY_DRIFT_BLOCKED` y solo se reconcilia control-plane.

## Estado vivo
I1–I4, R1–R4 y G1 PASS/FROZEN. G2-A PASS con Staff/Admin fresco y Cliente fresco sobre `https://cxorbia-backend-dev.web.app`; Shopper exacto/histórico permanece FROZEN_REUSE. `productP0Proven=false`.

Score formal permanece **98/100** porque los dos puntos de G2 solo se cierran al completar G2-B con observación visible, cleanup y post-clean readback.

## Único frente restante — G2-B
`LIVE_IN_PLATFORM_SYNTHETIC_ACCEPTANCE` está **AUTORIZADO** para fase `STAGE_AND_TEST` dentro de la misma plataforma productiva. Solo pueden crearse/modificarse/eliminarse registros de prueba identificados `CXORBIA_E2E_SYNTH_*`; se permite crear/eliminar usuarios Auth sintéticos únicamente si son indispensables y evidencias Storage sintéticas únicamente si son necesarias. Paula aún no ha realizado la observación visible del escenario, por lo que cleanup todavía no debe ejecutarse.

Continúan prohibidos: writes a HR externa, modificación de usuarios/credenciales reales, pagos reales, Make, Gemini, deploy, rebuild, merge y writes legacy.

## Anti-bucle
No crear G3, otra candidata, rama, PR, workflow, PREPROD o metodología. No repetir G1/G2-A ni requests consumidos sin P0 nuevo. El request G2-B es one-shot y no admite retry automático.
