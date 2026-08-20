# RESUMEN-PARA-CLAUDE.md

**SYNC_EPOCH:** `CXORBIA-20260820-I5-G2A-PRODUCTION-READONLY-PASS-48`  
**PLAN_ID:** `CXORBIA-PHASE-A-GO-LIVE-DEFINITIVE-RC-CLOSURE`  
**currentIteration:** `I5-G2`  
**ACTIVE_BLOCKER: `NONE`**  
**PREPROD_PROJECT_CREATOR_ROUTE: `SUPERSEDED`**

## Estado único
`I5_G2A_PASS__I5_G2B_AUTH_PENDING__98_2`. Producción `https://cxorbia-backend-dev.web.app`, source `f9802fdd498934a8e7729fa5c7d18341bec1cd71`.

G2-A PASS: Staff/Admin fresh y Client fresh en producción; Shopper histórico exacto FROZEN_REUSE. El hold del primer multirrol fue credential staleness del harness, no P0. Sin reset, writes, deploy, rebuild o merge.

## Único pendiente
G2-B `LIVE_IN_PLATFORM_SYNTHETIC_ACCEPTANCE`: dentro de la misma plataforma, visible para Paula, datos `CXORBIA_E2E_SYNTH_*`, cleanup/readback. Pendiente autorización estrecha de writes sintéticos.

No tocar `/app/modules`, `/app/core`, adapters/data ni UI por esta definición. Si G2-B demuestra incidencia real, documentar archivo/módulo exacto para Claude; no parchear frontend desde backend sin P0 probado.

## Academia
Sin cambio funcional en G2-A. Mantener contenidos actuales; registrar observaciones de Paula y solo ajustar manuales/cursos si G2-B prueba una diferencia real.
