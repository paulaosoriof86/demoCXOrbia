# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-20  
**SYNC_EPOCH:** `CXORBIA-20260820-I5-G1-PRODUCTION-CUTOVER-EXECUTED-47`  
**PLAN_ID:** `CXORBIA-PHASE-A-GO-LIVE-DEFINITIVE-RC-CLOSURE`  
**Estado:** `I5_G1_PASS__I5_G2_ACTIVE__98_2`  
**currentIteration:** `I5-G2`

## Orden obligatorio
1. `backend/config/cxorbia-phase-a-continuity-lock.json`.
2. `backend/config/cxorbia-g1-production-cutover.json`.
3. `backend/config/cxorbia-r4-root-cause-closure.json`.
4. `backend/config/cxorbia-consumed-one-shot-gates.json`.
5. `backend/config/cxorbia-evidence-aliases.json`.
6. `backend/config/cxorbia-r3-critical-product-acceptance.json`.
7. `EXECUTION-STATE-CXORBIA-TYA-VIGENTE.md`, `SOURCE-LOCK-CXORBIA-TYA-VIGENTE.md`, `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`, `PLAN-OPERATIVO-UNIFICADO-CXORBIA-TYA-VIGENTE.md`, `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`.
8. `backend/config/cxorbia-production-promotion-contract.json` y `backend/config/cxorbia-production-promotion-gate-evidence.json`.
9. Addenda maestras vigentes, `GO-LIVE-PROGRESS-TRACKER-ROOT-CAUSE-20260814.md`, `CAMBIOS-BACKEND.md`, `RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md`.
10. PR #7 y HEAD vivo.

PR #7 es mirror no autoritativo. HEAD se resuelve dinámicamente. Si un mirror contradice el lock: `CONTINUITY_DRIFT_BLOCKED` y solo se reconcilia control-plane.

## Estado vivo
I1–I4 PASS/FROZEN; R1–R4 PASS; **G1 PASS = `PRODUCTION_CUTOVER_EXECUTED`**; score **98/100**. `I5-G2_PRODUCTION_SMOKE_HYPERCARE_AND_FREEZE` es la única iteración activa.

## Cutover ejecutado
La autorización explícita de Paula fue recibida el 2026-08-20 12:55 -06:00. Conforme al contrato `PROMOTE_EXISTING_CLEAN_PROJECT`, que acepta los identificadores y URL actuales como producción y no requiere archivos prod separados, el cutover se ejecutó como `LOGICAL_PROMOTION_EXISTING_DEPLOYMENT_NO_REDEPLOY`.

Producción canónica: project `cxorbia-backend-dev`; Hosting `cxorbia-dev` / `cxorbia-backend-dev`; URL `https://cxorbia-backend-dev.web.app`; Cloud Run `cxorbia-live-hr-dev` / `us-central1`. Source funcional `f9802fdd498934a8e7729fa5c7d18341bec1cd71`.

No hubo redeploy de Hosting/Cloud Run, rebuild, merge ni business/data writes. El mismo deployment ya probado fue designado producción. `tya-plataforma` permanece intacto y sin modificación.

## Siguiente bloque
G2: smoke/hypercare/freeze de producción real, con foco en login/roles, HR viva, shoppers, visitas, Finanzas, reload/new-tab, scopes/cross-tenant, no demo/stale fallback, sincronización HR/plataforma y observabilidad. Salida: `PRODUCTION_FROZEN_PASS_100` → 100%.

## Anti-bucle
`PRODUCTION_CUTOVER_EXECUTED` queda FROZEN_REUSE. No repetir G1 ni redeploy sin nuevo `P0_PROVEN`. Una interrupción de conversación no revierte el 98%.
