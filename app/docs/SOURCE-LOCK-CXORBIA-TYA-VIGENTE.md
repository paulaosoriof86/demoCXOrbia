# SOURCE LOCK CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-20  
**SYNC_EPOCH:** `CXORBIA-20260820-I5-G2A-PRODUCTION-READONLY-PASS-48`  
**PLAN_ID:** `CXORBIA-PHASE-A-GO-LIVE-DEFINITIVE-RC-CLOSURE`  
**currentIteration:** `I5-G2`

## Source funcional y producción
Source validado/congelado: `f9802fdd498934a8e7729fa5c7d18341bec1cd71`. Producción canónica activa: project `cxorbia-backend-dev`; Hosting target `cxorbia-dev`; site `cxorbia-backend-dev`; URL `https://cxorbia-backend-dev.web.app`; Cloud Run `cxorbia-live-hr-dev`, `us-central1`.

No rebuild ni provider redeploy. `tya-plataforma` permanece intacto.

## Evidencia congelada vigente
R3 `CRITICAL_PRODUCT_ACCEPTANCE_PASS`; R4 `ROOT_CAUSE_CLOSED_PASS`; G1 `PRODUCTION_CUTOVER_EXECUTED`; **G2-A `PRODUCTION_REMOTE_READONLY_SMOKE_PASS_WITH_FROZEN_SHOPPER_REUSE`**. Staff/Admin fresco run `32411160766`; Cliente fresco run `32411411249`; Shopper histórico exacto PASS congelado. `productP0Proven=false`.

## Seguridad
G2-A ejecutó provider reads únicamente; business/data/HR/Auth/Firestore/Rules/Storage/Make/Gemini/payment writes=0; password reset=0; deploy/rebuild/merge=0.

## Siguiente
G2-B in-platform synthetic acceptance en la misma URL; score sigue 98/100 hasta cleanup/readback final.
