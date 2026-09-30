# Addendum CAMBIOS BACKEND - HR Source Bridge

Fecha: 2026-07-03

## Backend HR Source Bridge

Archivos creados o tocados:

- `app/core/backend-hr-source-bridge.js`
- `app/index-backend-dev.html`
- `app/docs/BACKEND-HR-SOURCE-BRIDGE-20260703.md`

Resumen:

- Se agrego un puente backend para escuchar eventos del modulo HR Source de V70.
- Eventos soportados: `hr-source:test`, `hr-source:preview`, `hr-source:sync-request`.
- El bridge no lee DOM y no ejecuta importaciones.
- Si no hay endpoint configurado, responde con estado honesto `pendiente_backend`.
- Se cargo en `index-backend-dev.html` para preview backend DEV.

Restricciones respetadas:

- Sin deploy.
- Sin escritura Firestore.
- Sin importacion de datos.
- Sin tocar `/app/modules`.
- Sin datos crudos ni PII en repo.

Siguiente gate:

- Crear capa real de endpoint DEV para registrar fuente HR, probar conexion, generar preview y mantener sync bloqueado hasta autorizacion explicita.
