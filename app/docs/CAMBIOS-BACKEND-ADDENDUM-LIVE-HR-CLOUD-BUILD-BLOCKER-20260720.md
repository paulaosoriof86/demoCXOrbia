# CAMBIOS BACKEND — ADDENDUM LIVE HR / CLOUD BUILD DEV

Fecha: 2026-07-20
Estado: `BLOCKED_BY_DEPLOYER_IAM`

## Qué se hizo

- Se registró la autorización expresa de Paula para Cloud Run DEV read-only y Hosting DEV.
- Se creó temporalmente un workflow en `main`, por excepción expresa, únicamente para ejecutar el despliegue desde la rama viva `docs-tya-v6-v71-audit`.
- El workflow comprobó autorización, source branch e identidad del build.
- Los gates de HR viva, inventario, canonización, estado canónico y freshness volvieron a pasar.
- Después de que Paula habilitó las APIs, se reejecutó el run `29787549700`.

## Resultado después de habilitar APIs

- Autenticación Google Cloud DEV: PASS.
- Lectura HR viva y gates runtime: PASS.
- Upload de la fuente al bucket Cloud Build: PASS.
- `gcloud builds submit`: FAIL.
- Error: `PERMISSION_DENIED: The caller does not have permission`.
- Principal: `firebase-adminsdk-fbsvc@cxorbia-backend-dev.iam.gserviceaccount.com`.
- Cloud Run desplegado: no.
- Hosting DEV republicado: no.

## Causa raíz exacta

La API Cloud Build ya está habilitada, pero la cuenta de servicio deployer no tiene permiso `cloudbuild.builds.create`. También deben quedar cubiertos, antes de completar el flujo, los permisos mínimos de Cloud Run, uso de service identity y lectura de Artifact Registry.

No es un fallo de:

- empalme V164;
- lectura de HR;
- builder/adaptador live;
- gates predeploy;
- trigger GitHub Actions;
- sintaxis o rutas esenciales.

## Seguridad preservada

- Producción: no.
- HR writes: 0.
- Firestore/Auth/Storage writes: 0.
- Imports: 0.
- Pagos: 0.
- No se alcanzó Cloud Run ni Hosting DEV.

## Clasificación

- **Reusable CXOrbia:** gate que diferencia API deshabilitada, IAM insuficiente y error de código; evidencia fail-closed.
- **Exclusivo cliente:** proyecto GCP DEV `cxorbia-backend-dev` y endpoint TyA/Cinépolis.
- **Claude/prototipo:** sin cambio nuevo; permanecen reportes, branding, exportación y Panorama.
- **Academia:** explicar lectura viva, principal deployer, roles mínimos y diferencia entre predeploy, deploy y aprobación visual.
- **Sin impacto Claude:** IAM, Cloud Build, Cloud Run, Hosting DEV y workflow temporal.

## Pendiente real

Otorgar a la cuenta de servicio deployer los roles DEV mínimos y reejecutar el mismo runner temporal. No se reconstruye el empalme, no se solicita candidata y no se cambia la metodología.

## Siguiente bloque exacto

`GRANT DEV DEPLOYER IAM → RERUN TEMPORARY DEPLOY → CLOUD RUN DEV → HOSTING DEV → REMOTE SMOKE → LIVE HR CHANGE TEST → VISUAL REVIEW → REMOVE TEMP WORKFLOW → FREEZE CORTE 1`
