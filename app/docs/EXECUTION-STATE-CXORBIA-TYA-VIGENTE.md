# EXECUTION STATE CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-20  
**SYNC_EPOCH:** `CXORBIA-20260820-I5-PROVIDER-USER-AUTH-ROUTE-REQUIRED-41`  
**OWNER_FRONTIER:** `I5_PREPRODUCTION_AND_GO_LIVE`  
**SUBSTATE:** `I5_2_PREPROD_SERVICE_ACCOUNT_PARENT_UNAVAILABLE_USER_AUTH_ROUTE_REQUIRED`  
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
- `projectCreatesSucceeded=0`;
- `hostingDeploys=0`;
- UAT no ejecutado;
- DEV no reutilizado y 0 writes de negocio.

Creator-route provider read-only:
- run `32332788919`, job `96316503352`, artifact `9393599029`;
- `HOLD_I5_NO_EXISTING_CREATOR_ROUTE_AUTHENTICATES`;
- `CXORBIA_GCP_PROJECT_CREATOR_JSON`: ausente;
- `GOOGLE_CLOUD_PROJECT_CREATOR_JSON`: ausente;
- identidad disponible: `firebase-adminsdk-fbsvc@cxorbia-backend-dev.iam.gserviceaccount.com`;
- autenticada, `projectsVisible=2`, `orgsVisible=0`, `parentProbes=[]`, `resourcemanager.projects.create=false/not proven`.

## Causa raíz I5 — PROBADA

La documentación oficial de Google Cloud establece que una **service account solo puede crear proyectos dentro de un recurso Organization** y debe especificar el parent; no puede crear proyectos standalone fuera de Organization. También establece que `roles/resourcemanager.projectCreator` se concede sobre Folder/Organization, no sobre un proyecto DEV existente.

La evidencia provider-backed actual muestra 0 organizaciones visibles y 0 parents Organization/Folder detectados para la identidad disponible. Por ello, otorgar Project Creator a esa misma service account o a otra service account sin un parent Organization/Folder **no resuelve** la creación de `cxorbia-preprod-20260819`.

Referencias oficiales:
- https://docs.cloud.google.com/resource-manager/docs/creating-managing-projects
- https://docs.cloud.google.com/iam/docs/roles-permissions/resourcemanager

## Autorización IAM mínima — RECIBIDA / NO CONSUMIDA

La autorización específica para el grant mínimo de Project Creator permanece vigente pero no fue consumida. Ya no se considera la transición efectiva inmediata porque el parent necesario para una service account no existe/demuestra en el carril actual.

No crear service account, key, Organization/Folder ni ampliar privilegios por inferencia.

## Bloqueo técnico actual

`PROVIDER_USER_AUTH_PROJECT_CREATION_ROUTE_REQUIRED`

Clasificación: `PROVIDER_CONTROL_PLANE_USER_AUTH_ROUTE_BLOCKED`.

El carril conectado dispone de GitHub y de una service account DEV, pero no dispone de una sesión Google Cloud/Firebase de usuario transferible para crear un proyecto standalone. Tampoco existe actualmente un plugin/conector Google Cloud/Firebase provider-admin disponible en el entorno conectado.

Este es un bloqueo de ejecución provider, no de autorización ni de producto.

## Siguiente gate exacto

`USER_AUTHENTICATED_PREPROD_PROJECT_CREATION_HANDOFF`

La única transición segura sin introducir una Organization/Folder nueva es materializar `cxorbia-preprod-20260819` mediante una identidad de usuario Google Cloud/Firebase autenticada con capacidad de creación de proyecto standalone. Después de que el proyecto exista, se deberá resolver por gate separado la identidad mínima de despliegue PREPROD antes del único Hosting; no se infieren nuevos IAM grants.

No repetir I1–I4, no repetir preflights de Project Creator con la service account DEV y no solicitar nuevamente las autorizaciones ya recibidas mientras source y alcance permanezcan idénticos.

## Seguridad

Estado actual: PREPROD project creates exitosos `0`; PREPROD Hosting deploys `0`; UAT `0`; IAM writes bajo la autorización nueva `0`; Auth/Firestore/Storage/HR/Make/Gemini/payment writes `0`; merge `false`; production `false`. I4 permanece sin cambios.
