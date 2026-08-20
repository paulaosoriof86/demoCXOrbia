# PLAN OPERATIVO UNIFICADO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-19  
**SYNC_EPOCH:** `CXORBIA-20260819-I5-PREPROD-IAM-AUTH-GRANTED-ROUTE-BLOCKED-40`  
**Frontera:** `I5_PREPRODUCTION_AND_GO_LIVE`  
**Score formal:** `85/100`

## Objetivo

Completar el 15% final hacia go-live sobre la misma build `f9802fdd498934a8e7729fa5c7d18341bec1cd71`, sin reabrir I1–I4, sin nueva candidata/rama/PR y sin mezclar infraestructura con cambios de producto.

## I1–I4 — CERRADOS / FROZEN

I1 `15/15`, I2 `20/20`, I3 `25/25`, I4 `25/25`. Auth/Shopper/Finanzas/multi-proyecto/Academia no se reprocesan por defecto.

## I5 — PREPRODUCTION_AND_GO_LIVE

### I5.1 — PREPRODUCTION_READINESS — PASS suficiente para abrir ejecución

Ya quedaron preparados source lock, secret scan, regresión/continuidad, UAT source-safe y seguridad fail-closed.

### I5.2 — PREPROD NEW CLEAN FIREBASE + HOSTING + UAT

La autorización PREPROD vigente cubre:
- proyecto Firebase PREPROD nuevo y limpio;
- no reutilizar DEV/base previa;
- 1 Hosting PREPROD exacto de `f9802f...`;
- UAT read-only;
- 0 merge/producción y 0 data/HR/Auth/Storage/Make/Gemini/payment writes.

#### Ejecución previa — HOLD sin materialización
Run `32332125828`, artifact `9393386559`:
- 1 comando de creación intentado;
- 0 proyectos creados;
- 0 Hosting deploys;
- UAT 0;
- 0 writes.

#### Root cause previa
Run `32332360361`, artifact `9393462199`: identidad DEV sin parent creator capability demostrable.

Run `32332788919`, artifact `9393599029`: `HOLD_I5_NO_EXISTING_CREATOR_ROUTE_AUTHENTICATES`.
- rutas creator dedicadas ausentes en ese run;
- identidad DEV autenticada, 2 proyectos visibles, 0 organizaciones;
- create capability no demostrada.

### Autorización IAM mínima — YA RECIBIDA

La autorización administrativa mínima para habilitar Project Creator ya está vigente. No existe evidencia terminal de una ejecución posterior; no debe volver a solicitarse ni considerarse consumida.

### Gate activo actualizado

`NARROW_PROVIDER_ADMIN_PROJECT_CREATOR_AUTH_GRANTED__PROVIDER_EXECUTION_ROUTE_UNAVAILABLE`

La restricción actual es de control-plane: el carril conectado no expone una ruta provider-admin Google Cloud/Firebase verificable para ejecutar el cambio autorizado. No retry de creación con la identidad DEV y no nueva metodología de producto.

Cuando la ruta provider-admin quede disponible y verificada:
1. demostrar la capacidad mínima necesaria bajo la autorización IAM vigente;
2. reemitir request PREPROD bajo la autorización ya dada;
3. crear `cxorbia-preprod-20260819` nuevo y limpio;
4. desplegar exactamente `f9802f...` a Hosting una sola vez;
5. comprobar paridad remota;
6. ejecutar UAT read-only/source-safe;
7. si PASS, evaluar el siguiente gate de materialización provider-backed únicamente con autorización específica para los writes que requiera;
8. luego production GO/NO-GO.

### I5.3 — PRODUCTION GO/NO-GO

Permanece cerrado. Requiere PREPROD/UAT suficiente y autorización explícita de producción.

## Prohibiciones

- No reintentar con la misma identidad DEV como Project Creator.
- No crear nueva candidata/rama/PR/workflow transportador.
- No reabrir Shopper/Auth/Finanzas.
- No usar proyecto Firebase preexistente como sustituto del PREPROD limpio.
- No crear identidad/credencial nueva, cambiar parent o ampliar privilegios fuera de la autorización vigente.
- No provider business writes, Make/Gemini/pagos, merge o producción sin gate/autorización.

## Verdad financiera congelada

Mayo 44/44 pagadas. Junio 2/44 pagadas + 42 pendientes + Q451. `liquidada != pagada`.