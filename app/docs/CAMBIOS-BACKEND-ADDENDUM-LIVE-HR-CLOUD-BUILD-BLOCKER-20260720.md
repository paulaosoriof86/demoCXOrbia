# CAMBIOS BACKEND — ADDENDUM LIVE HR / CLOUD BUILD DEV

Fecha: 2026-07-20
Estado: `BLOCKED_BY_CLOUD_BUILD_API_DISABLED`

## Qué se hizo

- Se registró la autorización expresa de Paula para Cloud Run DEV read-only y Hosting DEV.
- Se creó temporalmente un workflow en `main`, por excepción expresa, únicamente para ejecutar el despliegue desde la rama viva `docs-tya-v6-v71-audit`.
- El workflow comprobó la autorización, el source branch y la identidad del build.
- Los gates de HR viva, inventario, canonización, estado canónico y freshness volvieron a pasar en el run `29787549700`.
- Se ejecutó diagnóstico GCP reproducible en el run `29787418426`.

## Causa raíz exacta

- La cuenta de servicio `firebase-adminsdk-fbsvc` del proyecto DEV puede autenticarse y leer la HR para los gates.
- No tiene permiso para listar ni habilitar servicios de Google Cloud (`serviceusage.services.list` / `serviceusage.services.enable`).
- Cloud Build API (`cloudbuild.googleapis.com`) está deshabilitada o nunca se utilizó en `cxorbia-backend-dev`.
- `gcloud builds submit` falló antes de crear imagen o servicio Cloud Run.

## Resultado de los intentos

- Cloud Run desplegado: no.
- Hosting DEV republicado: no.
- Producción: no.
- HR writes: 0.
- Firestore/Auth/Storage writes: 0.
- Imports: 0.
- Pagos: 0.

## Clasificación

- **Reusable CXOrbia:** gate que diferencia error de código, API deshabilitada y permiso IAM; evidencia sanitizada y fail-closed.
- **Exclusivo cliente:** proyecto GCP DEV `cxorbia-backend-dev` y endpoint TyA/Cinépolis.
- **Claude/prototipo:** sin cambio nuevo; permanecen los pendientes localizados de reportes, branding, exportación y Panorama.
- **Academia:** explicar lectura viva, API/proveedor habilitado, principal autorizado, estado degradado y diferencia entre deploy técnico y aprobación visual.
- **Sin impacto Claude:** IAM, Service Usage, Cloud Build, Cloud Run, Hosting DEV y workflow temporal.

## Pendiente real

Un principal con privilegio administrativo debe habilitar Cloud Build API y cualquier API DEV requerida que continúe deshabilitada. Después se reejecuta el mismo runner temporal; no se reconstruye el empalme ni se solicita nueva candidata.

## Siguiente bloque exacto

`ENABLE REQUIRED DEV APIS → RERUN TEMPORARY DEPLOY → CLOUD RUN DEV → HOSTING DEV → REMOTE SMOKE → LIVE HR CHANGE TEST → VISUAL REVIEW → REMOVE TEMP WORKFLOW → FREEZE CORTE 1`
