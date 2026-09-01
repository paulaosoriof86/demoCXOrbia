# CAMBIOS BACKEND — ADDENDUM I5 PROVIDER USER-AUTH ROOT CAUSE

**Fecha:** 2026-08-20  
**SYNC_EPOCH:** `CXORBIA-20260820-I5-PROVIDER-USER-AUTH-ROUTE-REQUIRED-41`

## Cambio ejecutado

Se cerró la causa raíz que mantenía I5 en bucle alrededor de Project Creator.

La evidencia provider-backed de run `32332788919` confirmó que la única credencial disponible es `firebase-adminsdk-fbsvc@cxorbia-backend-dev.iam.gserviceaccount.com`, con `projectsVisible=2`, `orgsVisible=0`, `parentProbes=[]` y sin `resourcemanager.projects.create` demostrado. Las rutas dedicated/alternate creator estaban ausentes.

La documentación oficial de Google Cloud establece que una service account solo puede crear proyectos dentro de Organization y debe especificar parent; `roles/resourcemanager.projectCreator` se concede sobre Folder/Organization. Por tanto un grant Project Creator a la service account DEV no puede crear un proyecto standalone sin parent Organization/Folder.

Referencias oficiales:
- https://docs.cloud.google.com/resource-manager/docs/creating-managing-projects
- https://docs.cloud.google.com/iam/docs/roles-permissions/resourcemanager

## Frontera corregida

Anterior: `NARROW_PROVIDER_ADMIN_PROJECT_CREATOR_AUTH_GRANTED__PROVIDER_EXECUTION_ROUTE_UNAVAILABLE`.

Nueva frontera probada:

`PROVIDER_USER_AUTH_PROJECT_CREATION_ROUTE_REQUIRED`

Clasificación: `PROVIDER_CONTROL_PLANE_USER_AUTH_ROUTE_BLOCKED`.

## Archivos tocados

- `app/docs/EXECUTION-STATE-CXORBIA-TYA-VIGENTE.md`
- `app/docs/SOURCE-LOCK-CXORBIA-TYA-VIGENTE.md`
- `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`
- `app/docs/PLAN-OPERATIVO-UNIFICADO-CXORBIA-TYA-VIGENTE.md`
- `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`
- addenda I5 de CAMBIOS, Claude, Pendientes y Academia
- PR #7 debe permanecer sincronizado al mismo epoch.

## Producto preservado

- source funcional: `f9802fdd498934a8e7729fa5c7d18341bec1cd71`;
- I1–I4 `PASS/FROZEN`;
- sin cambios frontend/runtime;
- sin reproceso Auth/Shopper/Finanzas/multi-proyecto/Academia;
- score formal permanece `85/100`.

## Seguridad

0 PREPROD projects created, 0 Hosting PREPROD deploys, 0 UAT, 0 IAM writes, 0 business-data/HR/Auth/Firestore/Storage/Make/Gemini/payment writes, 0 merge, 0 producción.

## Siguiente bloque exacto

`USER_AUTHENTICATED_PREPROD_PROJECT_CREATION_HANDOFF` → verificar proyecto nuevo/limpio → gate separado de identidad mínima de deploy PREPROD → único Hosting del source congelado → UAT read-only.

## Clasificación

- **Reusable CXOrbia:** service-account project creation requiere Organization parent.
- **Exclusivo TyA:** target `cxorbia-preprod-20260819`.
- **Claude/prototipo:** sin impacto funcional.
- **Academia:** solo continuidad documental.
- **Sin impacto Claude:** provider provisioning.
