# HR Source endpoint DEV local

Fecha: 2026-07-03
Estado: implementado como endpoint local Node, sin Firestore writes.

## Archivo agregado

- `tools/hr-source/tya-hr-source-dev-server.mjs`

## Archivos actualizados

- `app/core/backend-config-preview-dev.js`
- `app/core/backend-hr-source-bridge.js`

## Proposito

Proveer un endpoint DEV local para que el modulo HR Source pueda recibir respuestas reales de backend durante el preview, sin conectar aun Google Sheets ni escribir Firestore.

El endpoint lee los archivos locales generados por `tya-build-staging-preview.ps1` y responde al frontend con el contrato:

```json
{
  "status": "blocked",
  "counts": {},
  "periodsDetected": [],
  "issues": [],
  "canImport": false
}
```

## Acciones soportadas

- `test`
- `preview`
- `sync-request`

## Seguridad

- Firestore writes: 0.
- Imports executed: 0.
- Deploy: 0.
- No guarda URL completa.
- Si recibe `urlPending`, solo la usa en memoria para DEV y no la persiste.
- `sync-request` siempre responde bloqueado hasta autorizacion explicita.

## Estados esperados

- `test`: responde `connected` si el endpoint local esta activo.
- `preview`: responde `blocked` si hay issues criticos, `parsed_with_warnings` si solo hay warnings o `ready_for_preview` si no hay issues.
- `sync-request`: responde `blocked` siempre.

## Como probar

1. Tener generado `tmp/tya-staging-preview`.
2. Ejecutar el endpoint local con Node.
3. Abrir `index-backend-dev.html` con token preview y parametro:

```text
cxHrSourceLocal=1
```

Endpoint local esperado:

```text
http://127.0.0.1:8787/api/hr-source
```

## Smoke test

Se agrego:

- `tools/hr-source/tya-hr-source-dev-smoke.mjs`
- `app/docs/HR-SOURCE-ENDPOINT-SMOKE-20260703.md`

El smoke valida `test`, `preview` y `sync-request`; confirma que `canImport=false` y que `sync-request` queda bloqueado.

## Pendiente siguiente

Crear el conector real Google Sheets / Excel Online y registrar la fuente como configuracion privada. Este endpoint local solo valida el contrato UI-backend con datos de preview ya sanitizados.
