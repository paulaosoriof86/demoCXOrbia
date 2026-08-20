# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**SYNC_EPOCH:** `CXORBIA-20260819-I5-PREPROD-IAM-AUTH-GRANTED-ROUTE-BLOCKED-40`  
**Estado:** `I4_FROZEN_PASS__I5_2_IAM_AUTH_GRANTED_PROVIDER_EXECUTION_ROUTE_BLOCKED__85_15`

## Orden obligatorio vigente

1. `EXECUTION-STATE-CXORBIA-TYA-VIGENTE.md`
2. `SOURCE-LOCK-CXORBIA-TYA-VIGENTE.md`
3. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`
4. `PLAN-OPERATIVO-UNIFICADO-CXORBIA-TYA-VIGENTE.md`
5. addendum prevalente de empalme/carril file-aware y Plan Lock Phase A
6. `GO-LIVE-PROGRESS-TRACKER-ROOT-CAUSE-20260814.md`, `CAMBIOS-BACKEND.md` + addendum I5 vigente, `RESUMEN-PARA-CLAUDE.md` + addendum I5 vigente, `PENDIENTES-PROTOTIPO.md` + addendum I5 vigente
7. addendum Academia I5 vigente y `ACADEMIA-ADDENDUM-I4-PROTECTED-RUNTIME-CLOSE-20260819.md`
8. PR #7 y HEAD de `docs-tya-v6-v71-audit`

Sigue vigente `ADDENDUM-MAESTRO-PRIORIDAD-GO-LIVE-FINANZAS-ANTES-MAKE-20260819.md`.

## I1–I4 — CERRADOS / NO REPROCESAR

I1 `15/15`, I2 `20/20`, I3 `25/25`, I4 `25/25`: `PASS/FROZEN`. Producto funcional congelado: `f9802fdd498934a8e7729fa5c7d18341bec1cd71`. No reabrir Auth, Shopper, Finanzas, multi-proyecto, documentos, reservas, certificaciones o Academia sin P0 nuevo reproducible.

**Score formal:** **85% / 15% pendiente**. El porcentaje no equivale a producción autorizada.

## I5 — evidencia PREPROD actual

La autorización PREPROD sigue vigente para crear/configurar un Firebase PREPROD nuevo y limpio y un único Hosting PREPROD de `f9802f...` + UAT read-only, sin merge/producción ni writes de datos/HR/Auth/Storage/Make/Gemini/pagos.

### Intento previo de creación PREPROD
- target: `cxorbia-preprod-20260819`;
- run `32332125828`, job `96314651567`, artifact `9393386559`;
- 0 proyectos creados;
- 0 Hosting PREPROD deploys;
- 0 UAT;
- 0 writes.

### Root cause read-only previa
- run `32332360361`, artifact `9393462199`: no se demostró `resourcemanager.projects.create` para la identidad DEV.
- run `32332788919`, job `96316503352`, artifact `9393599029`: `HOLD_I5_NO_EXISTING_CREATOR_ROUTE_AUTHENTICATES`; rutas creator dedicadas ausentes en ese run; identidad DEV autenticada sin create capability demostrada.

## Autorización IAM mínima — VIGENTE

La autorización específica para resolver Project Creator ya fue recibida después de los runs anteriores. No existe evidencia terminal de ejecución posterior; por tanto **no se vuelve a solicitar ni se marca como consumida**.

## Frontera viva

`I5_2_PREPROD_PROJECT_CREATOR_AUTH_GRANTED_EXECUTION_ROUTE_BLOCKED`

### Siguiente gate exacto

`NARROW_PROVIDER_ADMIN_PROJECT_CREATOR_AUTH_GRANTED__PROVIDER_EXECUTION_ROUTE_UNAVAILABLE`

El bloqueo actual es técnico: el carril conectado no expone una ruta provider-admin Google Cloud/Firebase verificable para ejecutar el cambio ya autorizado. El preflight existente es read-only y no materializa ese cambio. No reintentar `projects:create` con la identidad DEV ni crear identidad/credencial nueva por inferencia.

Cuando exista control provider-admin verificable, se utiliza la autorización IAM vigente y se continúa con la autorización PREPROD original: demostrar capacidad mínima → crear `cxorbia-preprod-20260819` nuevo y limpio → único Hosting de `f9802f...` → UAT read-only.

## Seguridad

Estado seguro vigente: 0 proyectos PREPROD creados, 0 Hosting PREPROD deploys, 0 PREPROD UAT, 0 IAM writes posteriores a la nueva autorización, 0 Auth/Firestore/Storage/HR/Make/Gemini/payment writes, 0 merge y 0 producción. I4 sigue intacto.