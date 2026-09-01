# CAMBIOS BACKEND — ADDENDUM I5 PRODUCTION TOPOLOGY RESTORED

**Fecha:** 2026-08-20  
**SYNC_EPOCH:** `CXORBIA-20260820-I5-EXISTING-CLEAN-PROJECT-PROMOTION-RESTORED-42`

## Cambio ejecutado

Se corrigió el descarrilamiento I5 que había introducido un proyecto PREPROD adicional innecesario.

La reconciliación recuperó como autoridad:

- `backend/config/cxorbia-production-promotion-contract.json`;
- `app/docs/SOURCE-LOCK-C6-PRODUCTION-PROMOTION-PASS-20260806.md`;
- `app/core/backend-config.js`;
- `backend/config/i3-11-identity-link-runtime-bridge-rules-hosting-dev.json`.

## Hallazgo terminal

La estrategia productiva ya estaba autorizada como `PROMOTE_EXISTING_CLEAN_PROJECT` sobre `cxorbia-backend-dev`, con Hosting `cxorbia-backend-dev`, target `cxorbia-dev` y aceptación expresa de la URL actual como producción futura.

El sandbox `cxorbia-tya-dev-260729-c4` no es destino Phase A. `tya-plataforma` es legacy y no se reutiliza como backend nuevo.

La build congelada `f9802fdd498934a8e7729fa5c7d18341bec1cd71` ya fue desplegada una vez al Hosting existente y obtuvo `PASS_I3_11C_R3C_DEV_HOSTING_MATERIALIZATION_REMOTE_PARITY`, run `32328316954`, artifact `9392151808`, con paridad remota exacta.

## Ruta retirada

`cxorbia-preprod-20260819` nunca fue creado y se retira como frontera ejecutable. No se continúa Project Creator ni user-auth project creation por esa ruta.

El request histórico `backend/config/i5-preprod-provision-hosting-uat-request-v1.json` permanece consumido únicamente como evidencia del intento fallido; no gobierna I5.

## Archivos tocados

- `app/docs/EXECUTION-STATE-CXORBIA-TYA-VIGENTE.md`;
- `app/docs/SOURCE-LOCK-CXORBIA-TYA-VIGENTE.md`;
- `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
- `app/docs/PLAN-OPERATIVO-UNIFICADO-CXORBIA-TYA-VIGENTE.md`;
- `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`;
- addenda I5 de CAMBIOS, Claude, Pendientes y Academia;
- PR #7 se sincroniza al mismo epoch.

## Producto preservado

- source funcional `f9802fdd498934a8e7729fa5c7d18341bec1cd71`;
- I1–I4 `PASS/FROZEN`;
- sin cambios frontend/runtime;
- score formal `85/100`.

## Próximo bloque exacto

`I5_EXISTING_PROJECT_PRECUTOVER_EVIDENCE_RECONCILIATION`.

Reconciliar los seis requisitos del contrato de promoción contra evidencia terminal ya existente, sin reruns por defecto.

## Seguridad

0 proyecto PREPROD nuevo; 0 deploy adicional; 0 provider/data/HR/Auth/Firestore/Storage/Make/Gemini/payment writes; 0 merge; 0 producción.

## Clasificación

- **Reusable CXOrbia:** precedencia de contrato explícito de promoción y ambiente limpio existente.
- **Exclusivo TyA:** destino `cxorbia-backend-dev` y legacy `tya-plataforma`.
- **Claude/prototipo:** sin impacto funcional.
- **Academia:** continuidad documental.
- **Sin impacto Claude:** topología/cutover.
