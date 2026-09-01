# PENDIENTES PROTOTIPO — ADDENDUM I5 PROVIDER USER-AUTH ROOT CAUSE

**Fecha:** 2026-08-20  
**SYNC_EPOCH:** `CXORBIA-20260820-I5-PROVIDER-USER-AUTH-ROUTE-REQUIRED-41`

## Pendiente vivo único de esta frontera

`USER_AUTHENTICATED_PREPROD_PROJECT_CREATION_HANDOFF`

La autorización PREPROD y la autorización IAM mínima ya existen. El bloqueo no es una nueva autorización ni un defecto del producto. La identidad disponible en el carril es una service account sin Organization/Folder parent visible; Google Cloud no permite a una service account crear un proyecto standalone fuera de Organization.

## Condición de salida

1. disponer de una identidad Google Cloud/Firebase de usuario autenticada capaz de crear proyecto standalone;
2. crear una sola vez `cxorbia-preprod-20260819` nuevo y limpio;
3. verificar que el proyecto exista y no reutilice DEV/base previa;
4. resolver mediante gate separado la identidad mínima de deploy PREPROD;
5. ejecutar un único Hosting PREPROD de `f9802fdd498934a8e7729fa5c7d18341bec1cd71` cuando exista capability/autorización suficiente;
6. comprobar paridad remota;
7. ejecutar UAT read-only/source-safe.

## No pendientes / no reprocesar

- Auth;
- Shopper histórico;
- Finanzas;
- multi-proyecto;
- certificaciones/documentos/reservas;
- Academia;
- frontend;
- diagnóstico Project Creator con la service account DEV.

## Prohibiciones anti-bucle

- no reintentar `projects:create` con `firebase-adminsdk-fbsvc@cxorbia-backend-dev.iam.gserviceaccount.com`;
- no repetir creator preflight sin cambio real de provider/identidad;
- no crear service account, key, Organization/Folder, workflow, rama o PR;
- no solicitar nuevamente las autorizaciones IAM/PREPROD vigentes;
- no inventar URL PREPROD antes de materialización.

## Seguridad actual

0 proyectos PREPROD creados, 0 Hosting PREPROD deploys, 0 UAT, 0 IAM writes posteriores a la autorización vigente, 0 writes de negocio, 0 merge y 0 producción.
