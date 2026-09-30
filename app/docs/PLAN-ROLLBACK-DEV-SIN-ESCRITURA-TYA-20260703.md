# Plan rollback DEV sin escritura TyA

Fecha: 2026-07-03

## Objetivo

Definir rollback antes de cualquier escritura DEV futura.

## Estado

Documento preventivo. No ejecuta cambios.

## Reglas

- Todo lote futuro debe tener batchId.
- Todo lote debe guardar manifest previo.
- Todo lote debe generar lista de rutas afectadas antes de escribir.
- El rollback debe poder ubicar y revertir solo ese batchId.

## Antes de escribir en DEV futuro

1. Crear manifest del lote.
2. Crear plan de rutas.
3. Crear snapshot o respaldo previo si aplica.
4. Ejecutar dry-run.
5. Solicitar autorizacion.
6. Escribir solo si todos los gates estan listos.

## Rollback futuro

- Revertir por batchId.
- No tocar datos fuera del batch.
- Generar reporte de reversa.
- Mantener auditoria de quien autorizo y cuando.

## Estado seguro actual

- Sin escritura.
- Sin importacion.
- Sin deploy.
