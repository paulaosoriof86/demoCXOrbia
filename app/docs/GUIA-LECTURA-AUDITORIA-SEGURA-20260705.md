# Guia lectura auditoria segura

Fecha: 2026-07-05

## Objetivo

Definir como leer el reporte de auditoria segura cuando exista ejecucion autorizada.

## Estados

- `ok_to_continue_documental`: permite seguir documentando.
- `review_required`: requiere revisar hallazgos antes de avanzar.
- `blocked`: detiene cualquier decision posterior.

## Interpretacion

- Hallazgos P0 no significan falla tecnica.
- Exit code distinto de cero puede significar revision requerida.
- Ninguna salida habilita produccion por si sola.

## Orden de lectura

1. Estado general.
2. Resultado por check.
3. Hallazgos P0.
4. Readiness.
5. Consistencia.
6. Decision.

## Regla

Si hay duda, se documenta y se mantiene bloqueado.
