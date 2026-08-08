# HR Source multitab preview

Fecha: 2026-07-03

Archivos agregados:

- `tools/hr-source/tya-hr-source-xlsx-lite.mjs`
- `tools/hr-source/tya-hr-source-multitab-preview.mjs`

Objetivo:

- Leer una fuente HR ya registrada de forma privada.
- Descargar workbook en formato XLSX.
- Detectar hojas, filas, columnas y encabezados.
- Generar reporte local.

Salidas locales:

- `tmp/hr-source-private/multitab-preview/hrSourceMultitabPreview.md`
- `tmp/hr-source-private/multitab-preview/hrSourceMultitabPreview.json`

Seguridad:

- Firestore writes: 0.
- Imports executed: 0.
- Deploy: 0.
- canImport: false.
- No se suben archivos crudos al repositorio.

Siguiente paso: conectar este preview al endpoint DEV.
