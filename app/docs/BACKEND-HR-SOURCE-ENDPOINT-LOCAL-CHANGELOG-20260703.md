# Backend HR Source endpoint local - changelog

Fecha: 2026-07-03

## Archivos creados

- `tools/hr-source/tya-hr-source-dev-server.mjs`
- `app/docs/HR-SOURCE-ENDPOINT-DEV-LOCAL-20260703.md`

## Archivos actualizados

- `app/core/backend-config-preview-dev.js`
- `app/core/backend-hr-source-bridge.js`
- `app/docs/BACKEND-HR-SOURCE-BRIDGE-20260703.md`

## Que cambia

- El preview backend puede recibir un endpoint HR local mediante `cxHrSourceLocal=1`.
- El bridge envia `urlPending` solo al endpoint backend, sin guardarla en repo ni en Firestore.
- El endpoint local responde `test`, `preview` y `sync-request` usando el staging preview local ya generado.
- La respuesta mantiene `canImport=false`.

## Seguridad

- Firestore writes: 0.
- Imports executed: 0.
- Deploy: 0.
- Sin credenciales.
- Sin CSV crudos en repo.
- Sin persistir URL completa.

## Siguiente paso

Probar localmente el endpoint contra el preview backend y luego avanzar al conector real Google Sheets / Excel Online.
