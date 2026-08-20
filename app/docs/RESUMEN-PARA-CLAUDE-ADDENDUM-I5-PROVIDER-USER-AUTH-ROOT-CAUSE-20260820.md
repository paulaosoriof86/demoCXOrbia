# RESUMEN PARA CLAUDE — ADDENDUM I5 PROVIDER USER-AUTH ROOT CAUSE

**Fecha:** 2026-08-20  
**SYNC_EPOCH:** `CXORBIA-20260820-I5-PROVIDER-USER-AUTH-ROUTE-REQUIRED-41`

## Estado que Claude debe respetar

- I1–I4 permanecen `PASS/FROZEN`.
- Source funcional congelado: `f9802fdd498934a8e7729fa5c7d18341bec1cd71`.
- Score formal: `85/100`.
- PREPROD todavía no existe.
- La autorización PREPROD sigue vigente.
- La autorización IAM mínima para Project Creator sigue vigente y no fue consumida por un write.

## Causa raíz I5 probada

Run `32332788919`, job `96316503352`, artifact `9393599029` demostró:
- rutas dedicated/alternate creator ausentes;
- única identidad provider disponible: `firebase-adminsdk-fbsvc@cxorbia-backend-dev.iam.gserviceaccount.com`;
- autenticada;
- `projectsVisible=2`;
- `orgsVisible=0`;
- `parentProbes=[]`;
- `resourcemanager.projects.create` no demostrado.

Google Cloud documenta que una service account solo puede crear proyectos dentro de Organization y debe especificar parent; `roles/resourcemanager.projectCreator` se concede en Folder/Organization. Por tanto el enfoque de Project Creator sobre la service account DEV no puede materializar un PREPROD standalone sin parent Organization/Folder.

Referencias oficiales:
- https://docs.cloud.google.com/resource-manager/docs/creating-managing-projects
- https://docs.cloud.google.com/iam/docs/roles-permissions/resourcemanager

## Bloqueo canónico

`PROVIDER_USER_AUTH_PROJECT_CREATION_ROUTE_REQUIRED`

Clasificación: `PROVIDER_CONTROL_PLANE_USER_AUTH_ROUTE_BLOCKED`.

No es un defecto frontend/backend runtime, Auth, Shopper, Finanzas, multi-proyecto ni Academia.

## Qué NO debe modificar Claude

- no tocar `/app/modules` ni `/app/core` por este bloqueo;
- no crear nueva candidata;
- no reconstruir autenticación ni Finanzas;
- no crear service account, key, Organization/Folder, workflow, rama o PR;
- no reintentar `projects:create` con la service account DEV;
- no repetir creator-route preflight sin cambio real de provider/identidad.

## Próxima transición

`USER_AUTHENTICATED_PREPROD_PROJECT_CREATION_HANDOFF`

Materializar `cxorbia-preprod-20260819` mediante identidad Google Cloud/Firebase de usuario autenticada capaz de crear proyecto standalone. Después, resolver por gate separado la identidad mínima de deploy PREPROD antes del único Hosting de `f9802f...`; no presumir grants IAM adicionales.

## Impacto frontend / Claude

Ninguno. El producto funcional permanece congelado.
