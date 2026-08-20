# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-20  
**SYNC_EPOCH:** `CXORBIA-20260820-I5-G1-PRODUCTION-CUTOVER-EXECUTED-47`  
**PLAN_ID:** `CXORBIA-PHASE-A-GO-LIVE-DEFINITIVE-RC-CLOSURE`  
**Estado:** `I5_G1_PASS__I5_G2_ACTIVE__98_2`  
**currentIteration:** `I5-G2`

## Orden obligatorio
1. `backend/config/cxorbia-phase-a-continuity-lock.json`.
2. `backend/config/cxorbia-g2-live-in-platform-acceptance-plan.json`.
3. `backend/config/cxorbia-g1-production-cutover.json`.
4. `backend/config/cxorbia-r4-root-cause-closure.json`.
5. `backend/config/cxorbia-consumed-one-shot-gates.json` y `backend/config/cxorbia-evidence-aliases.json`.
6. `backend/config/cxorbia-r3-critical-product-acceptance.json`.
7. `EXECUTION-STATE-CXORBIA-TYA-VIGENTE.md`, `SOURCE-LOCK-CXORBIA-TYA-VIGENTE.md`, `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`, `PLAN-OPERATIVO-UNIFICADO-CXORBIA-TYA-VIGENTE.md`, `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`.
8. Promotion contract/evidence, Go-Live Tracker, `CAMBIOS-BACKEND.md`, `RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md` y addenda de Academia.
9. PR #7 y HEAD vivo.

PR #7 es mirror no autoritativo. HEAD se resuelve dinámicamente. Si contradice el lock: `CONTINUITY_DRIFT_BLOCKED` y solo se reconcilia control-plane.

## Estado vivo
I1–I4 y R1–R4 PASS/FROZEN; G1 PASS `PRODUCTION_CUTOVER_EXECUTED`; **98/100**. Única iteración activa: G2.

## G2
- **G2-A:** smoke remoto multirrol read-only sobre `https://cxorbia-backend-dev.web.app`.
- **G2-B:** `LIVE_IN_PLATFORM_SYNTHETIC_ACCEPTANCE`, obligatorio antes del cierre operacional al 100%. Se ejecutará dentro de la misma plataforma productiva, visible para Paula, con datos sintéticos etiquetados, cleanup y readback. Está pendiente una autorización estrecha de writes sintéticos; no autoriza HR externo, Auth create/reset, pagos reales, Make/Gemini, deploy, rebuild ni merge.

## Anti-bucle
No crear G3, otra candidata, rama, PR, workflow, PREPROD o metodología. No repetir G1 ni requests consumidos sin P0 nuevo.
