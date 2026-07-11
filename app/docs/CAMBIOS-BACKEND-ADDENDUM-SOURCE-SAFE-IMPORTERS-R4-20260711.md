# CAMBIOS BACKEND — importadores source-safe R4

## Archivos nuevos

- comando dry-run y módulos internos;
- validador JSON/XLSX;
- dependencia XLSX fijada;
- tres fixtures sanitizados;
- dos contratos de importación;
- dos plantillas CSV;
- workflow CI;
- documentación de Phase A, Claude, pendientes, Academia y tracker.

## Cambio funcional

Se habilitó un dry-run end-to-end para pagos/movimientos y certificaciones presentadas. La salida tiene el formato consumido por el adapter R3, pero no se aplica automáticamente al runtime ni a una base.

## Recuperación de trabajo previo

- HR y shoppers ya validados se usan como índice, no se reconstruyen.
- Honorario, boleto y combo permanecen separados.
- Pago por lote genera ítems individuales.
- Pagos históricos se cruzan antes de nuevos lotes.
- Certificaciones presentadas se preservan solo con evidencia y revisión.

## Estado

Operativo en dry-run. Sin provider calls ni writes.
