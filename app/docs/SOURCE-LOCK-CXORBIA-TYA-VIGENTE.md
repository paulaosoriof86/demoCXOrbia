# SOURCE LOCK CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-20  
**SYNC_EPOCH:** `CXORBIA-20260820-I5-G1-PRODUCTION-CUTOVER-EXECUTED-47`  
**PLAN_ID:** `CXORBIA-PHASE-A-GO-LIVE-DEFINITIVE-RC-CLOSURE`  
**currentIteration:** `I5-G2`

## Source funcional y producción
Source validado/congelado: `f9802fdd498934a8e7729fa5c7d18341bec1cd71`. G1 ejecutó `PRODUCTION_CUTOVER_EXECUTED` sin rebuild ni provider redeploy.

Producción canónica activa: project `cxorbia-backend-dev`; Hosting target `cxorbia-dev`; site `cxorbia-backend-dev`; URL `https://cxorbia-backend-dev.web.app`; Cloud Run `cxorbia-live-hr-dev`, `us-central1`.

El contrato `PROMOTE_EXISTING_CLEAN_PROJECT` contiene `acceptCurrentIdentifiersAndUrlAsProduction=true` y `requiresSeparateProdFiles=false`. Por eso no se creó proyecto/URL alterno ni se recompiló el producto.

## Seguridad
Hosting deploys=0, Cloud Run deploys=0, rebuild=0, merge=false, business/data/HR/Auth/Firestore/Rules/Storage/Make/Gemini/payment writes=0 durante G1. `tya-plataforma` permanece intacto.

## Evidencia congelada
R3 `CRITICAL_PRODUCT_ACCEPTANCE_PASS`; R4 `ROOT_CAUSE_CLOSED_PASS`; G1 `PRODUCTION_CUTOVER_EXECUTED`. Todos son FROZEN_REUSE y solo se reabren ante `P0_PROVEN` nuevo.

## Siguiente
`I5-G2` smoke/hypercare/freeze sobre la URL ya designada producción. Score 98/100.
