# HR Source flow check

Fecha: 2026-07-03

Se agrego `tools/hr-source/tya-hr-source-private-flow-check.mjs`.

Objetivo:

- Ejecutar una validacion local de `test`, `preview` y `sync-request`.
- Usar el endpoint DEV local.
- Combinar staging preview con referencia privada ya registrada.
- Generar reporte local en `tmp/hr-source-private-flow-check`.

Seguridad:

- Firestore writes: 0.
- Imports executed: 0.
- Deploy: 0.
- canImport: false.

Siguiente paso: ejecutar validacion local y avanzar al conector multi-tab.
