# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-20  
**SYNC_EPOCH:** `CXORBIA-20260820-I5-G2A-PRODUCTION-READONLY-PASS-48`  
**PLAN_ID:** `CXORBIA-PHASE-A-GO-LIVE-DEFINITIVE-RC-CLOSURE`  
**currentIteration:** `I5-G2`  
**Score:** `98% / 2%`  
**Repo:** `paulaosoriof86/demoCXOrbia`  
**Rama:** `docs-tya-v6-v71-audit`  
**PR:** `#7`

## Estado
G1 PASS/FROZEN. G2-A PASS con receipt `backend/config/cxorbia-g2a-production-readonly-smoke.json`. Staff/Admin fresco run `32411160766`; Cliente fresco run `32411411249`; Shopper exacto histórico reutilizado como PASS congelado. Primer intento combinado: hold de credencial histórica stale del harness, no P0 de producto. `productP0Proven=false`.

## Único pendiente
G2-B `LIVE_IN_PLATFORM_SYNTHETIC_ACCEPTANCE` — `PENDING_NARROW_WRITE_AUTHORIZATION`. Debe ejecutarse en la misma plataforma productiva y ser visible para Paula. Solo datos sintéticos `CXORBIA_E2E_SYNTH_*`, cleanup y post-clean readback. Incluye Admin, Shopper, Cliente, HR viva/histórico, visitas, Finanzas, sincronización, scopes, navegación, persistencia y observabilidad.

No hay autorización actual para business/data writes sintéticos ni para HR externo, Auth create/reset, pagos reales, Make/Gemini, deploy, rebuild o merge.

## Anti-pérdida
No cerrar 100% antes de G2-B. No repetir G1/G2-A ni PASS congelados por cambio de conversación. PR #7 es mirror no autoritativo.
