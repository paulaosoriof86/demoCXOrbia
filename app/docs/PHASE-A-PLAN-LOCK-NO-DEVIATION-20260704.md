# CXOrbia TyA — PHASE A PLAN LOCK · NO DEVIATION

**Estado:** ACTIVO Y PREVALENTE  
**Fecha:** 2026-08-20  
**SYNC_EPOCH:** `CXORBIA-20260820-I5-G2A-PRODUCTION-READONLY-PASS-48`  
**PLAN_ID:** `CXORBIA-PHASE-A-GO-LIVE-DEFINITIVE-RC-CLOSURE`  
**currentIteration:** `I5-G2`

## Estado
I1–I4 PASS/FROZEN; R1–R4 PASS; G1 PASS `PRODUCTION_CUTOVER_EXECUTED`; **G2-A PASS/FROZEN**; G2-B pendiente de autorización estrecha. Score formal **98/100** hasta completar el cierre integral de G2.

Producción canónica activa mediante `LOGICAL_PROMOTION_EXISTING_DEPLOYMENT_NO_REDEPLOY` del mismo artefacto `f9802fdd498934a8e7729fa5c7d18341bec1cd71`. URL: `https://cxorbia-backend-dev.web.app`.

## G2-A cerrado
Staff/Admin se revalidó en producción con run `32411160766`; Cliente con run `32411411249` y `PASS_CLIENT_SINGLE_LOGIN_AND_ROUTE_RENDER`. Shopper exacto/histórico conserva `PASS_I3_HISTORICAL_SHOPPER_LOGIN_AFTER_EXACT_RECOVERY` como FROZEN_REUSE. El hold del primer multirrol fue credencial histórica stale del harness, no P0 de producto; no se reseteó contraseña ni se repite G2-A.

## Único bloque restante
G2-B `LIVE_IN_PLATFORM_SYNTHETIC_ACCEPTANCE`: pruebas en vivo dentro de la misma plataforma productiva, visibles para Paula, con datos `CXORBIA_E2E_SYNTH_*`, cleanup y post-clean readback. Requiere autorización estrecha de writes sintéticos. No autoriza HR externo, Auth create/reset, pagos reales, Make/Gemini, deploy, rebuild ni merge.

## No desviación
No nueva candidata/rama/PR/workflow/PREPROD; no rebuild; no repetir G1/G2-A; no fallback demo/stale; no overwrite silencioso HR/plataforma. Solo un `P0_PROVEN` nuevo permite reabrir producto o un PASS congelado.

## Continuidad
Los receipts terminales y el continuity lock sobreviven a cortes de conversación. PR #7 es mirror no autoritativo.
