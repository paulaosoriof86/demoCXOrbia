# PENDIENTES-PROTOTIPO.md

**SYNC_EPOCH:** `CXORBIA-20260819-I5-PREPROD-CREATOR-BLOCKED-39`

## Estado

**Score formal: 85% / 15% pendiente.** I1–I4 están `PASS/FROZEN`. I5 está bloqueado exclusivamente en la creación del proyecto PREPROD nuevo y limpio; producción no está autorizada.

## No reabrir

Auth, Shopper, Finance V2/historical, multi-proyecto/no-code, documentos, reservas, certificaciones y Academia no se reconstruyen por defecto. No nueva candidata, rama, PR o metodología.

## I5 PREPROD — evidencia ya obtenida

- Autorización de Paula para proyecto Firebase PREPROD nuevo/limpio + 1 Hosting PREPROD de `f9802fdd498934a8e7729fa5c7d18341bec1cd71` + UAT read-only.
- Run `32332125828`, artifact `9393386559`: 1 intento de creación, 0 proyectos creados, 0 Hosting PREPROD deploys, 0 UAT, 0 writes.
- Run `32332360361`, artifact `9393462199`: root cause read-only; identidad DEV sin parent Project Creator demostrable.
- Run `32332788919`, artifact `9393599029`: `HOLD_I5_NO_EXISTING_CREATOR_ROUTE_AUTHENTICATES`; secrets creator dedicados ausentes y service account DEV sin `resourcemanager.projects.create` demostrado.

## Pendiente activo único

`NARROW_PROVIDER_ADMIN_PROJECT_CREATOR_AUTH_REQUIRED`

Se necesita una autorización específica para una acción administrativa mínima de IAM/provisioning que permita una de estas rutas:
1. conectar una identidad separada que ya tenga Project Creator al parent correcto; o
2. otorgar el rol/permiso mínimo de creación de proyectos a una identidad de provisión separada.

No incluye service-account/key creation, organización/carpeta distinta, datos de negocio, Auth/Firestore/Storage/HR, Make, Gemini, pagos, merge ni producción salvo autorización explícita adicional.

Una vez la capability quede demostrada, reemitir el request PREPROD bajo la autorización original; no repetir diagnósticos de I1–I4.

## Pendientes frontend separados

- No existe P0 frontend nuevo derivado del HOLD PREPROD.
- `modules/cliente-extra.js` / exports PDF-XLSX-PPTX permanece como hallazgo separado a clasificar en UAT; no modificar por asociación.

## Academia

Sin reconstrucción. Solo actualizar/publicar si PREPROD/UAT demuestra una diferencia real.

## Seguridad

PREPROD project creates exitosos: 0. Hosting PREPROD deploys: 0. UAT: 0. Auth/Firestore/Storage/HR/Make/Gemini/payment writes: 0. Merge: false. Producción: false.
