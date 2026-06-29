# RESULTADO-CARGA-SEED-FIRESTORE-DEV-INTENTO-1-FALLIDO.md

## Fecha

2026-06-28

## Resultado

Primer intento de carga falló con HTTP 403 usando REST directo.

## Causa

Los claims del usuario DEV fueron diagnosticados y estaban correctos. El método REST no fue el adecuado para esta carga controlada con reglas de cliente.

## Corrección

Se cambió a Firebase Web SDK con usuario DEV ficticio autenticado.

## Confirmaciones

- No se activó adapter.
- No se hizo deploy de Hosting.
- No se hizo merge.
- No se tocó producción.
