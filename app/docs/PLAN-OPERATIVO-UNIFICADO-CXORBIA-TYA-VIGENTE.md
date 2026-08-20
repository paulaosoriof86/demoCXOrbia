# PLAN OPERATIVO UNIFICADO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-20  
**SYNC_EPOCH:** `CXORBIA-20260820-I5-PROVIDER-USER-AUTH-ROUTE-REQUIRED-41`  
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
- 0 proyectos creados;
- 0 Hosting deploys;
- UAT 0;
- 0 writes.

#### Creator-route provider read-only
Run `32332788919`, artifact `9393599029`:
- dedicated/alternate creator credentials ausentes;
- service account DEV presente/autenticada;
- 2 proyectos visibles;
- 0 organizaciones;
- 0 parent probes;
- create capability no demostrada.

### Root cause I5 — PROBADA

Google Cloud documenta que las service accounts solo pueden crear proyectos dentro de Organization y deben especificar parent. `roles/resourcemanager.projectCreator` se concede en Folder/Organization. Por tanto el enfoque de otorgar Project Creator a la service account DEV no puede crear un proyecto standalone cuando no existe/demuestra parent Organization/Folder.

Referencias oficiales:
- https://docs.cloud.google.com/resource-manager/docs/creating-managing-projects
- https://docs.cloud.google.com/iam/docs/roles-permissions/resourcemanager

### Autorización IAM mínima — YA RECIBIDA / NO CONSUMIDA

Permanece vigente, pero no se ejecuta contra la service account DEV porque no resolvería el parent requerido. No crear identidad/key/Organization/Folder ni ampliar privilegios por inferencia.

### Gate activo actualizado

`PROVIDER_USER_AUTH_PROJECT_CREATION_ROUTE_REQUIRED`

No falta otro diagnóstico. El entorno conectado actual no expone una sesión Google Cloud/Firebase de usuario capaz de crear un proyecto standalone ni un conector provider-admin equivalente.

### Transición exacta

1. `USER_AUTHENTICATED_PREPROD_PROJECT_CREATION_HANDOFF`: materializar `cxorbia-preprod-20260819` con identidad Google Cloud/Firebase de usuario autenticada;
2. verificar que el proyecto sea nuevo y limpio;
3. abrir gate separado para resolver identidad mínima de deploy PREPROD sin presumir IAM adicional;
4. ejecutar un único Hosting de `f9802f...` cuando exista autorización/capability suficiente;
5. comprobar paridad remota;
6. ejecutar UAT read-only/source-safe;
7. si PASS, evaluar provider-backed materialization solo con autorizaciones específicas;
8. luego production GO/NO-GO.

### I5.3 — PRODUCTION GO/NO-GO

Permanece cerrado. Requiere PREPROD/UAT suficiente y autorización explícita de producción.

## Circuit breaker / prohibiciones

- No reintentar `projects:create` con la service account DEV.
- No repetir creator-route preflight sin cambio de identidad/provider.
- No crear nueva candidata/rama/PR/workflow transportador.
- No crear service account/key/Organization/Folder.
- No reabrir Shopper/Auth/Finanzas.
- No usar proyecto Firebase preexistente como sustituto del PREPROD limpio.
- No provider business writes, Make/Gemini/pagos, merge o producción sin gate/autorización.

## Verdad financiera congelada

Mayo 44/44 pagadas. Junio 2/44 pagadas + 42 pendientes + Q451. `liquidada != pagada`.
