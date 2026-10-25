# Pendientes addendum rollback audit TyA

Fecha: 2026-07-09
Fuente puente: `app/docs/PHASE-A-DEV-ROLLBACK-AUDIT-PLAN-TYA-20260709.md`

## Pendientes Claude/prototipo

- Mostrar rollback como preparado, no ejecutado.
- Mostrar auditoria como requisito previo, no como produccion lista.
- Representar estados bloqueado, degradado, pendiente, source-safe y revision humana.
- No afirmar sync, import, pago o proveedor real sin gate.
- Mantener Cinépolis como proyecto configurable TyA.
- Mantener junio como liquidaciones/pagos.

## Backend replicable para prototipo

- Rollback antes de activacion.
- Auditoria antes de escritura.
- Referencias opacas en logs.
- Cola de revision humana.
- Gates apagados por defecto.
- Dry-run antes de import.

## Academia

Debe explicar rollback, auditoria, referencias opacas, datos que no van en logs, revision de conflictos y diferencia DEV/runtime/produccion.

## Estado seguro

Documento solamente. No modifica UI/core ni activa procesos.
