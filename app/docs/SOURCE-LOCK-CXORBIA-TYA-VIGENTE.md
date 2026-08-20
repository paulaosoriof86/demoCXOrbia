# SOURCE LOCK CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-20  
**SYNC_EPOCH:** `CXORBIA-20260820-I5-PROVIDER-USER-AUTH-ROUTE-REQUIRED-41`

## Destino canónico

- Repo: `paulaosoriof86/demoCXOrbia`
- Rama viva: `docs-tya-v6-v71-audit`
- PR: `#7` existente, draft/open/no merge
- Ref documental/operativa: HEAD vivo de la rama; no `main`, no nueva rama, no nuevo PR.

## Source lock funcional

El producto funcional validado y autorizado para PREPROD sigue siendo exactamente:

`f9802fdd498934a8e7729fa5c7d18341bec1cd71`

Ningún intento I5 cambió ese source ni desplegó otro producto. Los commits I5 posteriores son QA/request/documentación; no autorizan sustituir la build congelada.

## Evidencia I4 preservada

- Hosting DEV: run `32328316954`, artifact `9392151808`, exact remote parity PASS.
- Staff/Admin: run `32329139725`, artifact `9392431939`, runtime provider-backed read-only PASS.
- Shopper: `PASS_I3_HISTORICAL_SHOPPER_LOGIN_AFTER_EXACT_RECOVERY`, sin reproceso.
- Finanzas: blob `088c68680177c470a4539622e1694128dd211d85`; mayo 44/44; junio 2/44 + 42 pendientes + Q451; `liquidada != pagada`.

## I5 PREPROD — sin materialización aún

Target reservado: `cxorbia-preprod-20260819`.

- run `32332125828`: 0 proyectos creados, 0 Hosting deploys, 0 UAT;
- run `32332788919`: rutas creator dedicadas ausentes; `firebase-adminsdk-fbsvc@cxorbia-backend-dev.iam.gserviceaccount.com` autenticada; 2 proyectos visibles, 0 organizaciones, 0 parent probes y create capability no demostrada.

## Root cause provider — PROBADA

Google Cloud documenta que una service account solo puede crear proyectos dentro de Organization y debe especificar parent. `roles/resourcemanager.projectCreator` se concede en Folder/Organization. La identidad disponible no detectó Organization/Folder parent, por lo que un grant Project Creator sobre esa service account no puede materializar un proyecto standalone PREPROD.

Referencias oficiales:
- https://docs.cloud.google.com/resource-manager/docs/creating-managing-projects
- https://docs.cloud.google.com/iam/docs/roles-permissions/resourcemanager

## IAM mínimo — autorización vigente no consumida

La autorización administrativa mínima permanece vigente, pero no se ejecuta contra la service account DEV porque el parent requerido no está disponible. No crear nueva identidad/key/Organization/Folder ni ampliar privilegios por inferencia.

## Regla de continuación

Frente vigente: `I5_2_PREPROD_SERVICE_ACCOUNT_PARENT_UNAVAILABLE_USER_AUTH_ROUTE_REQUIRED`.

Gate técnico:

`PROVIDER_USER_AUTH_PROJECT_CREATION_ROUTE_REQUIRED`

El carril conectado actual no expone una sesión Google Cloud/Firebase de usuario transferible ni un conector provider-admin capaz de crear un proyecto standalone. No repetir Project Creator preflights con la service account DEV.

La siguiente transición segura es `USER_AUTHENTICATED_PREPROD_PROJECT_CREATION_HANDOFF`: crear `cxorbia-preprod-20260819` con identidad de usuario Google Cloud/Firebase. Después se resuelve por gate separado la identidad mínima de deploy PREPROD; no se infiere ningún IAM grant adicional.

## Seguridad

0 PREPROD projects created, 0 PREPROD deploys, 0 PREPROD UAT, 0 IAM writes bajo la autorización nueva, 0 provider business-data writes, 0 Auth/Firestore/Storage/HR/Make/Gemini/payment writes, 0 merge y 0 producción.
