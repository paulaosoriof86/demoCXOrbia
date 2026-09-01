# HR Source endpoint + private live check

Fecha: 2026-07-03
Estado: endpoint DEV local conectado al registro privado de fuente HR.

## Archivo actualizado

- `tools/hr-source/tya-hr-source-dev-server.mjs`

## Qué cambia

El endpoint DEV local ahora puede usar una fuente privada registrada cuando recibe un `sourceRef` con formato:

```text
hrsrc_...
```

Si ese `sourceRef` existe en el registro privado local, el endpoint:

1. Lee la URL real solo desde `tmp/hr-source-private/sources.secrets.local.json`.
2. No imprime la URL completa.
3. No la guarda en repo.
4. Ejecuta live check seguro.
5. Combina resultado live con staging preview local.
6. Devuelve respuesta al frontend con `maskedUrl`, `counts`, `issues`, `periodsDetected` y `canImport=false`.

## Acciones impactadas

### `test`

- Sin fuente privada: confirma solo que el endpoint responde.
- Con fuente privada: confirma endpoint y revisa fuente registrada.

### `preview`

- Combina conteos de staging preview con señales live de la fuente.
- Si hay críticos, responde `blocked`.
- Si solo hay warnings, responde `parsed_with_warnings`.
- Si no hay issues, responde `ready_for_preview`.

### `sync-request`

- Sigue siempre bloqueado.
- Agrega issue `sync_blocked_until_authorization`.
- Mantiene `canImport=false`.

## Seguridad

- Firestore writes: 0.
- Imports executed: 0.
- Deploy: 0.
- `canImport=false`.
- No se persiste URL completa fuera de `tmp/hr-source-private` local.
- No se suben CSV crudos.

## Limitación vigente

Google Sheets live check por ahora valida CSV de un solo `gid`. Para HR multi-tab completo sigue pendiente:

- Google Sheets API backend; o
- export XLSX + parser backend; o
- conector Google Drive controlado.

## Siguiente paso

Preparar prueba local guiada del flujo completo:

1. Registrar fuente privada local.
2. Ejecutar full check.
3. Abrir preview backend con `cxHrSourceLocal=1`.
4. Verificar que HR Source muestre conteos/incidencias reales sin permitir importación.
