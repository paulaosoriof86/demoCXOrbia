# PLAN OPERATIVO UNIFICADO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-20  
**SYNC_EPOCH:** `CXORBIA-20260820-I5-G1-PRODUCTION-CUTOVER-EXECUTED-47`  
**PLAN_ID:** `CXORBIA-PHASE-A-GO-LIVE-DEFINITIVE-RC-CLOSURE`  
**currentIteration:** `I5-G2`  
**Score:** `98/100`

## Plan formal
I1–I4 PASS/FROZEN = 85. R1=PASS 2, R2=PASS 3, R3=PASS 3, R4=PASS 2, **G1=PASS 3**, G2=ACTIVE 2.

## G1 — PASS
Salida `PRODUCTION_CUTOVER_EXECUTED`. La autorización explícita posterior a R4 fue recibida y consumida. Se ejecutó el cutover según el contrato `PROMOTE_EXISTING_CLEAN_PROJECT`: el deployment limpio ya probado (`cxorbia-backend-dev`, `https://cxorbia-backend-dev.web.app`) se convirtió en producción canónica sin redeploy ni rebuild porque `acceptCurrentIdentifiersAndUrlAsProduction=true` y `requiresSeparateProdFiles=false`.

No se autorizó ni ejecutó merge o business/data/HR/Auth/Firestore/Rules/Storage/Make/Gemini/payment writes. `tya-plataforma` sigue intacto.

## G2 — ACTIVE
Objetivo único restante: smoke/hypercare/freeze post-cutover sobre el mismo runtime y cierre de RC12 `POST_PRODUCTION_OBSERVABILITY_AND_SYNC_REGRESSION_RISK`.

Comprobar: URL/entrypoint; login y roles; Staff/Admin/Shopper/Cliente; HR viva e historia; shoppers/visitas; Finanzas; reload/new-tab; tenant/project scopes y cross-tenant; no demo/stale fallback; sincronización HR/plataforma sin duplicidad/overwrite silencioso; errores/observabilidad. Si aparece P0 reproducible, circuit breaker; si no, `PRODUCTION_FROZEN_PASS_100`.

## Continuidad
G1 está congelado como evidencia terminal. No crear otra iteración ni repetir cutover por pausa, timeout o cambio de conversación. El continuity lock gobierna.
