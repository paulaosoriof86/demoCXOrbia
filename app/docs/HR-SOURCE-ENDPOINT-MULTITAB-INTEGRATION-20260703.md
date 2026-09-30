# HR Source endpoint multitab integration

Fecha: 2026-07-03

Archivo actualizado:

- `tools/hr-source/tya-hr-source-dev-server.mjs`

Cambio:

- El endpoint DEV ahora intenta preview XLSX multi-tab cuando recibe un `sourceRef` privado de Google Sheets.
- Si XLSX responde correctamente, agrega hojas vivas a `periodsDetected`.
- Si XLSX falla, usa fallback CSV de un solo gid y documenta warning.
- `preview` devuelve conteos de staging preview + conteos live.
- `sync-request` sigue bloqueado.

Seguridad:

- Firestore writes: 0.
- Imports executed: 0.
- Deploy: 0.
- canImport: false.
- URL completa solo local.
- Sin archivos crudos en repo.

Siguiente paso:

- Ejecutar flow check local contra una fuente privada y revisar tabs detectados.
