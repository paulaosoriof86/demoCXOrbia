# Backend HR Source Bridge

Fecha: 2026-07-03
Estado: implementado en preview backend DEV.

## Archivo agregado

- `app/core/backend-hr-source-bridge.js`

## Archivo actualizado

- `app/index-backend-dev.html`
- `app/core/backend-config-preview-dev.js`

## Proposito

Escuchar los eventos del modulo HR Source de V70 y enrutarlos hacia backend cuando exista endpoint configurado.

Eventos soportados:

- `hr-source:test`
- `hr-source:preview`
- `hr-source:sync-request`

## Seguridad

- No escribe Firestore.
- No importa datos.
- No hace deploy.
- No toca modulos de UI.
- No lee DOM.
- No guarda enlaces completos.
- No contiene credenciales.

## Comportamiento actual

Si no existe endpoint backend configurado, responde de forma honesta con estado `pendiente_backend` y una incidencia `backend_endpoint_missing`.

Si se abre el preview con `cxHrSourceLocal=1`, el bridge usa el endpoint local:

```text
http://127.0.0.1:8787/api/hr-source
```

Esto permite probar el contrato UI-backend sin Firestore y sin conexion real a Google Sheets.

## Contrato de endpoint

El bridge envia:

```json
{
  "action": "test|preview|sync-request",
  "tenantId": "tya",
  "projectId": "cinepolis",
  "sourceType": "google_sheets",
  "sourceRef": "ref_opaco",
  "maskedUrl": "***",
  "urlPending": "solo_en_memoria_dev",
  "requestedAt": "ISO_DATE",
  "env": "dev"
}
```

Respuesta esperada:

```json
{
  "status": "ready_for_preview",
  "sourceType": "google_sheets",
  "sourceRef": "ref_opaco",
  "periodsDetected": [],
  "counts": {},
  "issues": [],
  "canImport": false
}
```

## Estados permitidos

- `pendiente_backend`
- `connected`
- `auth_error`
- `not_found`
- `empty_range`
- `schema_changed`
- `parsed_with_warnings`
- `blocked`
- `ready_for_preview`
- `ready_for_import`

## Siguiente paso

Crear el conector real para:

1. Registrar la fuente HR de forma privada.
2. Probar acceso a Google Sheets / Excel Online.
3. Generar preview real de tabs, conteos e incidencias.
4. Mantener importacion bloqueada hasta autorizacion explicita.

## Relacion con pendientes V70

El pendiente de listener HR queda cubierto por el bridge inicial. El endpoint local cubre prueba de contrato con staging preview. Siguen pendientes la conexion real, el registro privado y el preview vivo.
