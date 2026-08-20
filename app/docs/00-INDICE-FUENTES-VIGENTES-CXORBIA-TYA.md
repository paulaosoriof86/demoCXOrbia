# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-20  
**SYNC_EPOCH:** `CXORBIA-20260820-I5-G2A-PRODUCTION-READONLY-PASS-48`  
**PLAN_ID:** `CXORBIA-PHASE-A-GO-LIVE-DEFINITIVE-RC-CLOSURE`  
**Estado:** `I5_G2A_PASS__I5_G2B_AUTH_PENDING__98_2`  
**currentIteration:** `I5-G2`

## Orden obligatorio
1. `backend/config/cxorbia-phase-a-continuity-lock.json`.
2. `backend/config/cxorbia-g2a-production-readonly-smoke.json`.
3. `backend/config/cxorbia-g2-live-in-platform-acceptance-plan.json`.
4. `backend/config/cxorbia-g1-production-cutover.json`.
5. `backend/config/cxorbia-r4-root-cause-closure.json`.
6. `backend/config/cxorbia-consumed-one-shot-gates.json` y `backend/config/cxorbia-evidence-aliases.json`.
7. `backend/config/cxorbia-r3-critical-product-acceptance.json`.
8. Execution State, Source Lock, Checkpoint, Plan Operativo, Phase A Lock, promotion contract/evidence, Go-Live Tracker, `CAMBIOS-BACKEND.md`, `RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md` y addenda de Academia.
9. PR #7 y HEAD vivo.

PR #7 es mirror no autoritativo. HEAD se resuelve dinámicamente. Si contradice el lock: `CONTINUITY_DRIFT_BLOCKED` y solo se reconcilia control-plane.

## Estado vivo
I1–I4, R1–R4 y G1 PASS/FROZEN. **G2-A PASS** con Staff/Admin fresco y Cliente fresco sobre `https://cxorbia-backend-dev.web.app`; Shopper exacto/histórico se reutiliza como PASS congelado porque el password one-shot anterior no puede reconstruirse read-only y no hay autorización de reset. El primer multirrol fue clasificado `HARNESS_CREDENTIAL_STALE_HOLD_NOT_PRODUCT_P0`; no se repite. `productP0Proven=false`.

Score formal permanece **98/100** porque los dos puntos de G2 solo se cierran al completar G2-B.

## Único frente restante — G2-B
`LIVE_IN_PLATFORM_SYNTHETIC_ACCEPTANCE`: pruebas integrales con datos ficticios dentro de **la misma plataforma productiva**, visible para Paula, con registros `CXORBIA_E2E_SYNTH_*`, cleanup y post-clean readback. Cobertura: hoja de ruta/navegación, Admin, Shopper, Cliente, perfiles/histórico/certificaciones, HR viva/histórica, visitas, cuestionarios/evidencias, Finanzas sin pago real, reload/new-tab, scopes/cross-tenant, sincronización HR↔plataforma y observabilidad.

G2-B está `PENDING_NARROW_WRITE_AUTHORIZATION`; no autoriza HR externo, Auth create/reset, pagos reales, Make/Gemini, deploy, rebuild ni merge.

## Anti-bucle
No crear G3, otra candidata, rama, PR, workflow, PREPROD o metodología. No repetir G1/G2-A ni requests ya ejecutados sin P0 nuevo.
