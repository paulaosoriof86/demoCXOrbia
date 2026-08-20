# EXECUTION STATE CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-19  
**SYNC_EPOCH:** `CXORBIA-20260819-I5-PREPROD-IAM-AUTH-GRANTED-ROUTE-BLOCKED-40`  
**OWNER_FRONTIER:** `I5_PREPRODUCTION_AND_GO_LIVE`  
**SUBSTATE:** `I5_2_PREPROD_PROJECT_CREATOR_AUTH_GRANTED_EXECUTION_ROUTE_BLOCKED`  
**PLAN_SCORE:** `85/100`  
**TARGET_AFTER_I5_GO_LIVE:** `100/100`

## Estado ejecutable actual

Repo `paulaosoriof86/demoCXOrbia`, rama `docs-tya-v6-v71-audit`, PR #7 existente/draft/open/no merge. I1–I4 permanecen `PASS/FROZEN` sobre el source funcional `f9802fdd498934a8e7729fa5c7d18341bec1cd71`.

## I5 PREPROD — autorización y resultado real previo

La autorización PREPROD vigente permite crear/configurar un Firebase PREPROD nuevo y limpio y hacer un único Hosting PREPROD del source congelado + UAT read-only, sin merge/producción ni writes de datos/HR/Auth/Storage/Make/Gemini/pagos.

El request PREPROD anterior fue consumido con HOLD:
- run `32332125828`;
- job `96314651567`;
- artifact `9393386559`;
- target `cxorbia-preprod-20260819` no estaba entre proyectos accesibles;
- se intentó un único comando de creación;
- `projectCreatesSucceeded=0`;
- `hostingDeploys=0`;
- UAT no ejecutado;
- DEV no reutilizado y 0 writes de negocio.

## Causa raíz provider previa

Read-only diagnostic:
- run `32332360361`, artifact `9393462199`;
- `PASS_I5_PREPROD_PROJECT_CREATE_ROOT_CAUSE_READONLY`;
- clasificación: `ROOT_CAUSE_LIKELY_NO_PARENT_PROJECT_CREATOR_SCOPE_OR_ACCOUNT_QUOTA`.

Creator-route preflight:
- run `32332788919`, job `96316503352`, artifact `9393599029`;
- `HOLD_I5_NO_EXISTING_CREATOR_ROUTE_AUTHENTICATES`;
- dedicated creator secret: ausente en ese run;
- alternate creator secret: ausente en ese run;
- DEV service account: presente/autenticado, ve 2 proyectos y 0 organizaciones, pero `resourcemanager.projects.create` no quedó demostrado.

## Autorización IAM mínima — RECIBIDA, NO CONSUMIDA POR WRITE

La autorización específica para `NARROW_PROVIDER_ADMIN_PROJECT_CREATOR_AUTH_REQUIRED` ya fue recibida después de la evidencia anterior. Su alcance queda fijado en:
- reutilizar una identidad separada existente si es posible;
- otorgar únicamente la capacidad mínima necesaria para crear `cxorbia-preprod-20260819`;
- no crear service account ni key;
- no ampliar privilegios fuera de ese propósito;
- 0 business-data/HR/Auth/Firestore/Storage/Make/Gemini/payment writes;
- 0 merge y 0 producción.

No existe evidencia terminal posterior que demuestre un IAM write bajo esta autorización. Por tanto **la autorización no debe volver a solicitarse ni marcarse como ejecutada/consumida**.

## Bloqueo técnico actual

`NARROW_PROVIDER_ADMIN_PROJECT_CREATOR_AUTH_GRANTED__PROVIDER_EXECUTION_ROUTE_UNAVAILABLE`

El carril conectado en esta sesión dispone de control de GitHub, pero no de un control-plane Google Cloud/Firebase IAM directo. El workflow existente `cxorbia-c6-skip13-auth-access-adjudication-readonly.yml` solo inspecciona rutas de credenciales y prueba permisos; no concede IAM. No existe en el HEAD vivo una ruta provider-admin demostrada que permita efectuar el grant autorizado sin inventar credenciales, crear una key o volver a usar la identidad DEV como Project Creator.

Este es un **bloqueo de ejecución provider**, no un bloqueo de autorización y no una regresión del producto.

## Siguiente gate exacto

`PROVIDER_ADMIN_EXECUTION_ROUTE_READBACK`

En cuanto exista una ruta provider-admin conectada y verificable, usar la autorización IAM ya vigente para:
1. leer identidad/parent efectivo;
2. reutilizar una identidad separada existente;
3. aplicar únicamente el grant mínimo de Project Creator necesario;
4. probar `resourcemanager.projects.create`;
5. reemitir la creación PREPROD bajo la autorización PREPROD original;
6. crear `cxorbia-preprod-20260819` nuevo y limpio;
7. desplegar exactamente una vez `f9802fdd498934a8e7729fa5c7d18341bec1cd71` a Hosting PREPROD;
8. ejecutar UAT read-only.

No repetir I1–I4 y no pedir nuevamente las autorizaciones IAM/PREPROD mientras source y alcance permanezcan idénticos.

## Seguridad

Estado actual: PREPROD project creates exitosos `0`; PREPROD Hosting deploys `0`; UAT `0`; IAM writes bajo la autorización nueva `0`; Auth/Firestore/Storage/HR/Make/Gemini/payment writes `0`; merge `false`; production `false`. I4 permanece sin cambios.