# RESUMEN-PARA-CLAUDE.md

**SYNC_EPOCH:** `CXORBIA-20260820-I5-G2A-PRODUCTION-READONLY-PASS-48`  
**PLAN_ID:** `CXORBIA-PHASE-A-GO-LIVE-DEFINITIVE-RC-CLOSURE`  
**currentIteration:** `I5-G2`  
**ACTIVE_BLOCKER: `NONE`**  
**PREPROD_PROJECT_CREATOR_ROUTE: `SUPERSEDED`**

## Estado único
`I5_G2A_PASS__I5_G2B_AUTHORIZED_STAGE_PENDING__98_2`. Producción `https://cxorbia-backend-dev.web.app`, source `f9802fdd498934a8e7729fa5c7d18341bec1cd71`.

G2-A PASS: Staff/Admin fresh y Client fresh en producción; Shopper histórico exacto FROZEN_REUSE. El hold del primer multirrol fue credential staleness del harness, no P0. Sin reset, writes, deploy, rebuild o merge.

## Único pendiente
G2-B `LIVE_IN_PLATFORM_SYNTHETIC_ACCEPTANCE` ya está autorizado para `STAGE_AND_TEST` dentro de la misma plataforma, visible para Paula, usando exclusivamente datos `CXORBIA_E2E_SYNTH_*`.

Permisos estrechos vigentes: datos sintéticos create/update/delete; Auth sintético create/delete si es indispensable; Storage sintético upload/delete si es necesario. Siguen prohibidos HR externa, usuarios/credenciales reales, pagos reales, Make, Gemini, deploy, rebuild y merge.

El escenario debe quedar visible después del stage. `paulaObservationsCaptured=false`; cleanup y post-clean readback se ejecutan después de la observación y son obligatorios antes del 100%.

No tocar `/app/modules`, `/app/core`, adapters/data ni UI por esta autorización. Si G2-B demuestra incidencia real, documentar archivo/módulo exacto para Claude; no parchear frontend desde backend sin P0 probado.

## Academia
Sin cambio funcional demostrado todavía. Mantener contenidos actuales; registrar únicamente diferencias reales que aparezcan durante la observación visible y actualizar manuales/cursos después de confirmarlas.
