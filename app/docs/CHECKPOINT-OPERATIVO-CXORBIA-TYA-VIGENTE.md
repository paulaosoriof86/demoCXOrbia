# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-20  
**SYNC_EPOCH:** `CXORBIA-20260820-I5-PROVIDER-USER-AUTH-ROUTE-REQUIRED-41`  
**Estado:** `I4_FROZEN_PASS__I5_PREPROD_SERVICE_ACCOUNT_PARENT_UNAVAILABLE_USER_AUTH_ROUTE_REQUIRED`  
**Frontera:** `I5_PREPRODUCTION_AND_GO_LIVE`  
**Subestado:** `I5_2_PREPROD_SERVICE_ACCOUNT_PARENT_UNAVAILABLE_USER_AUTH_ROUTE_REQUIRED`  
**Score formal:** `85% / 15%`  
**Repo:** `paulaosoriof86/demoCXOrbia`  
**Rama viva:** `docs-tya-v6-v71-audit`  
**PR:** `#7` existente, draft/open/no merge

## 1. Corte de continuidad

I1–I4 están cerrados/frozen. El producto funcional sigue siendo `f9802fdd498934a8e7729fa5c7d18341bec1cd71`. No volver a Auth, Shopper, Finanzas, nueva candidata, nueva rama/PR o auditoría general.

## 2. Autorizaciones vigentes

La autorización PREPROD sigue vigente para un Firebase PREPROD nuevo y limpio, un único Hosting PREPROD del source congelado y UAT read-only, sin merge/producción ni writes de negocio.

La autorización administrativa mínima para Project Creator también sigue vigente y no fue consumida por un IAM write.

## 3. Evidencia PREPROD previa

Run `32332125828`, job `96314651567`, artifact `9393386559`:
- 0 proyectos PREPROD creados;
- 0 Hosting PREPROD deploys;
- 0 UAT;
- 0 writes de negocio.

Run `32332788919`, job `96316503352`, artifact `9393599029`:
- dedicated creator secret ausente;
- alternate creator secret ausente;
- `firebase-adminsdk-fbsvc@cxorbia-backend-dev.iam.gserviceaccount.com` presente/autenticada;
- `projectsVisible=2`;
- `orgsVisible=0`;
- `parentProbes=[]`;
- `resourcemanager.projects.create` no demostrado;
- provider writes 0, project creates 0, deploys 0.

## 4. Causa raíz real — CERRADA

Google Cloud establece que una service account solo puede crear proyectos **dentro de Organization** y debe especificar parent. El rol `roles/resourcemanager.projectCreator` se concede sobre Folder/Organization.

Como la identidad disponible no detecta Organization/Folder parent, un grant Project Creator a la service account DEV o a otra service account sin parent no resuelve `cxorbia-preprod-20260819` standalone.

Referencias oficiales:
- https://docs.cloud.google.com/resource-manager/docs/creating-managing-projects
- https://docs.cloud.google.com/iam/docs/roles-permissions/resourcemanager

## 5. Bloqueo real actualizado

`PROVIDER_USER_AUTH_PROJECT_CREATION_ROUTE_REQUIRED`

Clasificación: `PROVIDER_CONTROL_PLANE_USER_AUTH_ROUTE_BLOCKED`.

No falta autorización. No falta otro diagnóstico IAM. Falta una ruta Google Cloud/Firebase autenticada como usuario capaz de crear un proyecto standalone. El entorno conectado actual no expone esa sesión ni un conector provider-admin Google Cloud/Firebase.

## 6. Circuit breaker anti-bucle

- no repetir creator preflight con la service account DEV;
- no intentar `projects:create` con esa service account;
- no crear service account/key/Organization/Folder;
- no crear workflow/rama/PR nuevos;
- no reabrir I1–I4;
- no volver a solicitar las autorizaciones ya vigentes.

## 7. Siguiente movimiento exacto

`USER_AUTHENTICATED_PREPROD_PROJECT_CREATION_HANDOFF`

Crear `cxorbia-preprod-20260819` mediante una identidad Google Cloud/Firebase de usuario autenticada. Una vez materializado, abrir un gate separado para la identidad mínima de deployment PREPROD antes del único Hosting; ningún nuevo IAM grant se presume.

## 8. Estado seguro

0 PREPROD projects created; 0 PREPROD Hosting deploys; 0 PREPROD UAT; 0 provider IAM writes posteriores a la autorización; 0 Auth/Firestore/Storage/HR/Make/Gemini/payment writes; 0 merge; 0 production.

## 9. Clasificación

- **Reusable CXOrbia:** service account project-creation requires Organization parent; separar user-auth provisioning de runtime identities.
- **Exclusivo TyA:** target `cxorbia-preprod-20260819`.
- **Claude/prototipo:** sin cambio frontend.
- **Academia:** sin cambio funcional; solo continuidad.
- **Sin impacto Claude:** provider provisioning gate.
