# PLAN-BACKEND-REPORTES-EXCEL-20260629

## Decisión

Los reportes no quedan cerrados con CSV. Deben exportarse también como Excel real `.xlsx`.

## Estado V54

- CSV real: avance correcto.
- PDF por impresión: avance básico.
- Excel real: pendiente.

## Requisitos para Claude/frontend

- Mantener CSV.
- Agregar botón Excel.
- Generar `.xlsx` real con SheetJS u opción equivalente.
- No renombrar CSV como XLSX.
- Respetar filtros activos.
- Exportar columnas visibles o seleccionadas.
- Si el reporte tiene varias tablas, generar varias hojas.
- Incluir hoja o encabezado de metadata.
- No mostrar éxito si no se descargó archivo.

## Requisitos backend futuro

Backend debe registrar exportaciones con metadata auditable:

- tenantId.
- exportId.
- reportId.
- nombre del reporte.
- formato: csv, xlsx o pdf.
- estado.
- projectId.
- país.
- periodo.
- filtros sanitizados.
- columnas.
- cantidad de filas.
- cantidad de hojas si aplica.
- referencia a Storage si se conserva archivo.
- error si falla.
- usuario que exportó.
- fecha de generación.

## Colecciones propuestas

```text
tenants/{tenantId}/reportExports/{exportId}
tenants/{tenantId}/reportDefinitions/{reportId}
```

## Relación con Storage

Si la exportación se conserva, el archivo debe guardarse en Storage y Firestore solo debe guardar metadata.

## Relación con acciones persistibles

Exportar reporte puede ser una action auditable cuando aplique:

```text
operationActions.actionType = exportReport
entityType = report
entityId = reportId
```

## Pendiente para Claude

Agregar a PENDIENTES-PROTOTIPO:

```text
Reportes: CSV está avanzado, pero falta exportación Excel real XLSX. No tachar el pendiente de reportes hasta que exista botón Excel y genere workbook válido.
```
