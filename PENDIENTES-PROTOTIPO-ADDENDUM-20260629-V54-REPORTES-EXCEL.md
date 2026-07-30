# PENDIENTES-PROTOTIPO-ADDENDUM-20260629-V54-REPORTES-EXCEL

## Fuente

- Revisión V54.
- Comentario de Paula: los reportes deben exportarse también en Excel, no solo CSV.

## Dictamen

La mejora V54 de exportar CSV real es correcta, pero no cierra el pendiente de reportes.

## Pendiente para Claude

Los reportes deben exportarse en dos formatos como mínimo:

1. CSV UTF-8 con BOM para compatibilidad simple.
2. Excel real `.xlsx`, no solo archivo `.csv` renombrado.

## Requisitos mínimos para Excel

- Usar SheetJS o mecanismo equivalente.
- Generar workbook `.xlsx` real.
- Una hoja por tabla o sección del reporte.
- Nombre de hoja legible y corto.
- Encabezados claros.
- Fechas y números como valores, no solo texto cuando sea posible.
- Respetar filtros activos del reporte.
- Incluir metadata del reporte:
  - tenant;
  - proyecto;
  - país;
  - periodo;
  - fecha de generación;
  - usuario que exportó.
- Mantener caracteres en UTF-8.
- No romper el botón CSV existente.
- No usar toast si no descarga archivo.

## Requisitos futuros backend

Cada exportación debe poder registrarse como `reportExport`:

- exportId;
- reportId;
- format: csv|xlsx|pdf;
- status;
- generatedBy;
- generatedAt;
- filtersSanitized;
- storageFileAssetId si se guarda en Storage;
- rowCount;
- error si falla.

## Estado

No tachar reportes como cerrado. Marcar como:

```text
Reportes CSV: avanzado.
Reportes Excel real: pendiente.
```
