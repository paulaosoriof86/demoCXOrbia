# PENDIENTES PROTOTIPO — R16E provider compare PASS

Fecha: 2026-07-29

## P0
No se detectó P0 frontend nuevo.

## Pendiente Phase A que sí bloquea writes
1. No ejecutar las 1,415 candidatas R16E automáticamente.
2. Construir R17/write plan exacto sin ejecutar, distinguiendo topología canónica vs materialización DEV previa.
3. Refresh dirigido del legacy TyA para shoppers nuevos/actualizados y certificaciones desde el último corte.
4. Diff shoppers por llave estable; sin match por nombre ni fusión automática.
5. Mantener agosto HN en HOLD por inconsistencia País=GT en la pestaña HN.
6. Después, dry-run/idempotencia y autorización de writes exactos.

## P1/P2 heredados
- PDF con gráficas;
- Excel con formato;
- reportKit/copy y demás backlog ya documentado.

No justifican nueva candidata ni bloquean el trabajo backend actual.

## Claude
No intervenir ahora. La validación frontend siguiente corresponde después de materialización controlada y smoke del backend canónico.
