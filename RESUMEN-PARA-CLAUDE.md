# RESUMEN-PARA-CLAUDE.md

**SYNC_EPOCH:** `CXORBIA-20260820-I5-G1-PRODUCTION-CUTOVER-EXECUTED-47`  
**PLAN_ID:** `CXORBIA-PHASE-A-GO-LIVE-DEFINITIVE-RC-CLOSURE`  
**currentIteration:** `I5-G2`  
**ACTIVE_BLOCKER: `NONE`**  
**PREPROD_PROJECT_CREATOR_ROUTE: `SUPERSEDED`**

## Estado único
`I5_G1_PASS__I5_G2_ACTIVE__98_2`. Producción canónica `https://cxorbia-backend-dev.web.app`, source `f9802fdd498934a8e7729fa5c7d18341bec1cd71`. No rebuild/redeploy/merge/business-data writes.

## G2
G2-A = smoke remoto multirrol read-only.  
G2-B = `LIVE_IN_PLATFORM_SYNTHETIC_ACCEPTANCE`, obligatorio antes del cierre operacional 100%: dentro de la misma plataforma productiva, visible para Paula, datos sintéticos `CXORBIA_E2E_SYNTH_*`, cleanup y readback.

No tocar `/app/modules`, `/app/core`, adapters/data ni UI por esta definición. Si la prueba viva demuestra una incidencia real, documentar el archivo/módulo exacto para Claude; no parchar frontend desde backend sin P0 probado.

G2-B todavía no tiene autorización de writes. HR externo, Auth create/reset, pagos reales, Make/Gemini, deploy, rebuild y merge permanecen prohibidos.

## Academia
Mantener rutas, roles y contenidos actuales hasta que la prueba viva produzca evidencia funcional distinta. Registrar observaciones de Paula y cualquier impacto real en manuales/cursos por módulo.
