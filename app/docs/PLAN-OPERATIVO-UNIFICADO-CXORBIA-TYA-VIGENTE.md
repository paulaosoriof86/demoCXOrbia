# PLAN OPERATIVO UNIFICADO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-19  
**SYNC_EPOCH:** `CXORBIA-20260819-I5-PREPROD-CREATOR-BLOCKED-39`  
**Frontera:** `I5_PREPRODUCTION_AND_GO_LIVE`  
**Score formal:** `85/100`

## Objetivo

Completar el 15% final hacia go-live sobre la misma build `f9802fdd498934a8e7729fa5c7d18341bec1cd71`, sin reabrir I1–I4, sin nueva candidata/rama/PR y sin mezclar infraestructura con cambios de producto.

## I1–I4 — CERRADOS / FROZEN

I1 `15/15`, I2 `20/20`, I3 `25/25`, I4 `25/25`. Auth/Shopper/Finanzas/multi-proyecto/Academia no se reprocesan por defecto.

## I5 — PREPRODUCTION_AND_GO_LIVE

### I5.1 — PREPRODUCTION_READINESS — PASS suficiente para abrir ejecución

Ya quedaron preparados source lock, secret scan, regresión/continuidad, UAT source-safe y seguridad fail-closed.

### I5.2 — PREPROD NEW CLEAN FIREBASE + HOSTING + UAT — BLOQUEADO ANTES DE CREACIÓN

Autorización de Paula recibida para:
- proyecto Firebase PREPROD nuevo y limpio;
- no reutilizar DEV/base previa;
- 1 Hosting PREPROD exacto de `f9802f...`;
- UAT read-only;
- 0 merge/producción y 0 data/HR/Auth/Storage/Make/Gemini/payment writes.

#### Ejecución 1 — consumida HOLD
Run `32332125828`, artifact `9393386559`:
- 1 comando de creación intentado;
- 0 proyectos creados;
- 0 Hosting deploys;
- UAT 0;
- 0 writes.

#### Root cause
Run `32332360361`, artifact `9393462199`: identidad DEV sin parent creator capability demostrable.

Run `32332788919`, artifact `9393599029`: `HOLD_I5_NO_EXISTING_CREATOR_ROUTE_AUTHENTICATES`.
- secrets históricos `CXORBIA_GCP_PROJECT_CREATOR_JSON` y `GOOGLE_CLOUD_PROJECT_CREATOR_JSON`: ausentes;
- única identidad presente: `FIREBASE_SERVICE_ACCOUNT_CXORBIA_BACKEND_DEV`;
- autenticada, 2 proyectos visibles, 0 organizaciones, create capability no demostrada.

### Gate activo

`NARROW_PROVIDER_ADMIN_PROJECT_CREATOR_AUTH_REQUIRED`

No retry de creación hasta capability proven. Requiere autorización explícita separada para IAM/service-account administration mínima. El alcance correcto es únicamente habilitar la creación del proyecto PREPROD; no datos de negocio ni servicios Phase A.

Cuando capability quede probada:
1. reemitir request PREPROD sobre la misma rama/PR;
2. crear `cxorbia-preprod-20260819` nuevo y limpio;
3. desplegar exactamente `f9802f...` a Hosting una sola vez;
4. comprobar paridad remota;
5. ejecutar UAT read-only/source-safe;
6. si PASS, preparar provider-backed PREPROD materialization solo con autorización específica para los writes que requiera;
7. luego production GO/NO-GO.

### I5.3 — PRODUCTION GO/NO-GO

Permanece cerrado. Requiere PREPROD/UAT suficiente y autorización explícita de producción.

## Prohibiciones

- No reintentar con la misma identidad DEV.
- No crear nueva candidata/rama/PR/workflow transportador.
- No reabrir Shopper/Auth/Finanzas.
- No usar proyecto Firebase preexistente como sustituto del PREPROD limpio.
- No IAM writes, key creation, provider business writes, Make/Gemini/pagos, merge o producción sin gate/autorización.

## Verdad financiera congelada

Mayo 44/44 pagadas. Junio 2/44 pagadas + 42 pendientes + Q451. `liquidada != pagada`.
