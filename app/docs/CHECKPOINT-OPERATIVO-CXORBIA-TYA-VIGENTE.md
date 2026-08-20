# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-19  
**SYNC_EPOCH:** `CXORBIA-20260819-I5-PREPROD-IAM-AUTH-GRANTED-ROUTE-BLOCKED-40`  
**Estado:** `I4_FROZEN_PASS__I5_PREPROD_IAM_AUTH_GRANTED_PROVIDER_ROUTE_BLOCKED`  
**Frontera:** `I5_PREPRODUCTION_AND_GO_LIVE`  
**Subestado:** `I5_2_PREPROD_PROJECT_CREATOR_AUTH_GRANTED_EXECUTION_ROUTE_BLOCKED`  
**Score formal:** `85% / 15%`  
**Repo:** `paulaosoriof86/demoCXOrbia`  
**Rama viva:** `docs-tya-v6-v71-audit`  
**PR:** `#7` existente, draft/open/no merge

## 1. Corte de continuidad

I1–I4 están cerrados/frozen. El producto funcional sigue siendo `f9802fdd498934a8e7729fa5c7d18341bec1cd71`. No volver a Auth, Shopper, Finanzas, nueva candidata, nueva rama/PR o auditoría general.

## 2. Autorizaciones vigentes

La autorización PREPROD sigue vigente para un Firebase PREPROD nuevo y limpio, un único Hosting PREPROD del source congelado y UAT read-only, sin merge/producción ni writes de negocio.

La autorización administrativa mínima para resolver Project Creator también ya fue concedida. No existe evidencia terminal de ejecución posterior, por lo que **no debe volver a solicitarse ni marcarse como consumida**.

## 3. Evidencia PREPROD previa

Run `32332125828`, job `96314651567`, artifact `9393386559`:
- 0 proyectos PREPROD creados;
- 0 Hosting PREPROD deploys;
- 0 UAT;
- 0 writes de negocio.

Run `32332360361`, artifact `9393462199`: no se demostró capacidad Project Creator para la identidad DEV.

Run `32332788919`, job `96316503352`, artifact `9393599029`: `HOLD_I5_NO_EXISTING_CREATOR_ROUTE_AUTHENTICATES`; las rutas dedicadas no estaban configuradas en ese run y la identidad DEV no demostró `resourcemanager.projects.create`.

## 4. Bloqueo real actualizado

`NARROW_PROVIDER_ADMIN_PROJECT_CREATOR_AUTH_GRANTED__PROVIDER_EXECUTION_ROUTE_UNAVAILABLE`

La autorización ya no es el bloqueo. El carril conectado actual permite operar GitHub pero no expone una ruta provider-admin Google Cloud/Firebase verificable para materializar el cambio autorizado. El preflight existente es read-only y no resuelve ese control-plane.

Clasificación: `PROVIDER_CONTROL_PLANE_EXECUTION_ROUTE_BLOCKED`, no `AUTHORIZATION_BLOCKED`.

## 5. Qué se preserva

- I4 completo PASS;
- Shopper y Finanzas sin reproceso;
- source funcional `f9802f...`;
- multi-tenant/multi-proyecto;
- Academia sin reconstrucción;
- 0 PREPROD deploys y 0 producción.

## 6. Siguiente movimiento exacto

`PROVIDER_ADMIN_EXECUTION_ROUTE_READBACK`

Cuando exista una ruta provider-admin verificable, se utilizará la autorización ya vigente para demostrar la capacidad mínima necesaria y continuar inmediatamente con el PREPROD original: proyecto limpio `cxorbia-preprod-20260819` → un único Hosting de `f9802f...` → UAT read-only.

No se vuelve a pedir autorización IAM/PREPROD mientras source y alcance sean idénticos. Si la solución exigiera una identidad nueva, credencial nueva, cambio de parent o privilegios adicionales, se detiene antes porque ese alcance no está incluido.

## 7. Estado seguro

0 PREPROD projects created; 0 PREPROD Hosting deploys; 0 PREPROD UAT; 0 provider IAM writes posteriores a la autorización; 0 Auth/Firestore/Storage/HR/Make/Gemini/payment writes; 0 merge; 0 production.

## 8. Clasificación

- **Reusable CXOrbia:** separación autorización/capacidad de ejecución y fail-closed sin retry.
- **Exclusivo TyA:** target PREPROD y evidencia operacional.
- **Claude/prototipo:** sin cambio frontend.
- **Academia:** sin cambio funcional; PREPROD aún no existe.
- **Sin impacto Claude:** provider provisioning gate y documentación.