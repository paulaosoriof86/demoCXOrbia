# Resultado local dry-run TyA V6 + V7.1

Fecha: 2026-07-03
Fuente: ejecución local reportada por Paula en PowerShell.

## Resultado observado

El validador `tools/migration/tya-dry-run-validator.ps1` se ejecutó localmente sobre los paquetes V6 + V7.1.

Resultado reportado por consola:

- Reporte Markdown generado en `tmp/tya-dry-run-report/tya-dry-run-report.md`.
- Reporte JSON generado en `tmp/tya-dry-run-report/tya-dry-run-report.json`.
- Critical issues: 2.
- Firestore writes: 0.
- Imports executed: 0.
- Reporte copiado al portapapeles.

## Lectura del resultado

La ejecución fue exitosa como dry-run. No hubo carga de datos.

Los 2 críticos esperados, según auditoría previa, son:

1. `shoppers.csv` incluye DPI o dato sensible equivalente. Requiere política de descarte, cifrado o staging restringido antes de importación.
2. `questionnaire_marks.csv` es idéntico a `postulations.csv`. No debe usarse como fuente independiente de cuestionarios.

## Gates vigentes

La importación continúa bloqueada hasta resolver:

- política DPI / datos sensibles;
- cuestionarios duplicados o fuente real separada;
- codificación/mojibake RTDB;
- destinatarios canónicos de notificaciones;
- revisión de `JUNIO 26 HN`;
- cruce financiero externo para liquidaciones.

## Estado de seguridad

- Firestore writes: 0.
- Imports executed: 0.
- Deploy: 0.
- Frontend tocado: no.
- `/app/modules` tocado: no.
- CSV crudos subidos al repo: no.
