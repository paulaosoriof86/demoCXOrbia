# CAMBIOS BACKEND — ADDENDUM LIVE HR / CLOUD BUILD DEV

Fecha: 2026-07-20
Estado: `DEV_DEPLOY_PASS_PENDING_LIVE_CHANGE_AND_VISUAL`

## Qué se hizo

- Se registró la autorización expresa de Paula para Cloud Run DEV read-only y Hosting DEV.
- Se utilizó temporalmente un workflow en `main`, por excepción expresa, para desplegar desde `docs-tya-v6-v71-audit`.
- Paula habilitó las APIs DEV requeridas y otorgó los roles mínimos al principal deployer.
- Los gates de HR viva, inventario, canonización, estado canónico y freshness pasaron nuevamente.
- Cloud Build creó y publicó la imagen.
- Cloud Run DEV se desplegó y pasó smoke directo.
- Hosting DEV se republicó con rewrite same-origin.
- El smoke same-origin pasó después de una corrección focalizada de ruta.

## Corrección raíz del último fallo

Firebase Hosting enviaba la ruta pública `/api/tya/cinepolis/hr-live`, mientras el servicio solo aceptaba la ruta interna `/v1/tenants/tya/projects/cinepolis/hr-live`.

Se modificó únicamente `backend/runtime/hr-live-service/server.mjs` para aceptar ambas rutas sobre el mismo handler, cache y revisión canónica.

Commit funcional desplegado: `15c6e909c5f7002e566474726cc04c5c4f6cafe0`.

No se modificaron `app/modules/**` ni `app/core/**`.

## Evidencia final

Run `29787549700`, job `88515846949`:

- build imagen: PASS;
- Cloud Run DEV: PASS;
- smoke Cloud Run: PASS;
- build exacto same-origin: PASS;
- Hosting DEV: PASS;
- smoke same-origin: PASS;
- decisión: `PASS_LIVE_HR_RUNTIME_DEV_DEPLOY`;
- artefacto: `8480675138`.

La revisión observada en Hosting fue `9bb38bf469651e3cbf572b9b19fbe7d5360f3d1ea424e20f1ff5eac874746ce1`. Los conteos observados son evidencia temporal de la lectura y no constantes operativas.

## Seguridad preservada

- Producción: no.
- HR writes: 0.
- Firestore/Auth/Storage writes: 0.
- Imports: 0.
- Pagos: 0.
- Make/Gemini live: no.

## Clasificación

- **Reusable CXOrbia:** lectura runtime source-safe, alias same-origin, revisión SHA-256, cache corto, fail-closed y smoke completo.
- **Exclusivo cliente:** configuración de fuente TyA/Cinépolis en DEV; el patrón queda parametrizable por tenant/proyecto.
- **Claude/prototipo:** permanecen pendientes KPI/modal, reportes Admin, exportación, branding, gráficas y Panorama por periodo.
- **Academia:** documentar lectura viva, revisión de fuente, refresco por foco/sondeo y diferencia entre fuente ausente y valor cero.
- **Sin impacto Claude:** IAM, Cloud Build, Cloud Run, Hosting DEV y workflow temporal.

## Pendiente real

- Ejecutar prueba con un cambio posterior real en HR.
- Confirmar nueva revisión y reproyección de KPI, detalle, histórico y reportes.
- Validación visual de Paula.
- Correcciones focalizadas.
- Retirar workflow temporal de `main`.
- Congelar Corte 1 únicamente con `APROBADO`.

## Siguiente bloque exacto

`LIVE HR CHANGE TEST → VERIFY NEW REVISION AND REPROJECTION → VISUAL REVIEW → FOCUSED FIXES → REMOVE TEMP WORKFLOW → FREEZE CORTE 1`
