# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-20  
**SYNC_EPOCH:** `CXORBIA-20260820-I5-G1-PRODUCTION-CUTOVER-EXECUTED-47`  
**PLAN_ID:** `CXORBIA-PHASE-A-GO-LIVE-DEFINITIVE-RC-CLOSURE`  
**currentIteration:** `I5-G2`  
**Score:** `98% / 2%`  
**Repo:** `paulaosoriof86/demoCXOrbia`  
**Rama:** `docs-tya-v6-v71-audit`  
**PR:** `#7`

## Estado
G1 `PRODUCTION_CUTOVER_EXECUTED` está cerrado y congelado. Source `f9802fdd498934a8e7729fa5c7d18341bec1cd71`; producción `https://cxorbia-backend-dev.web.app`; provider redeploy=0; rebuild=0; business/data writes=0; merge=0; rollback listo; legacy intacto.

## G2 actual
G2-A: smoke remoto multirrol read-only en producción — ACTIVE.  
G2-B: `LIVE_IN_PLATFORM_SYNTHETIC_ACCEPTANCE` — `PENDING_NARROW_WRITE_AUTHORIZATION`.

G2-B debe ejecutarse en la misma plataforma productiva y ser visible para Paula. Usará solo datos sintéticos etiquetados `CXORBIA_E2E_SYNTH_`; incluirá Admin, Shopper, Cliente, HR viva/histórico, visitas, Finanzas, sincronización, scopes, navegación y persistencia. Cleanup y post-clean readback son obligatorios. No hay autorización actual para esos writes ni para HR externo, Auth create/reset, pagos reales, Make/Gemini, deploy, rebuild o merge.

## Anti-pérdida
No cerrar 100% antes de completar ambos subgates. No repetir G1 ni PASS congelados por cambio de conversación. PR #7 es mirror no autoritativo.
