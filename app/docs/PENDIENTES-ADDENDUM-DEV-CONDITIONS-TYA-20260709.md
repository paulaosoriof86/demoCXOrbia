# Pendientes addendum DEV conditions TyA

Fecha: 2026-07-09
Fuente puente: `app/docs/PHASE-A-DEV-CONDITIONS-TYA-20260709.md`

## Pendientes Claude/prototipo

- Mostrar DEV como pendiente hasta autorizacion explicita.
- No mostrar proveedores activos si no existe gate aprobado.
- Mantener Cinépolis como proyecto configurable de TyA.
- Mantener HR como fuente operacional.
- Mostrar datos TyA como source-safe o pendiente, no importados.
- Mantener junio como liquidaciones/pagos.
- Preservar certificaciones ya presentadas.
- Enviar conflictos a revision humana.

## Backend replicable para prototipo

- Tenant y proyecto separados.
- Base nueva limpia.
- Secrets fuera del repo.
- Punto unico `CX.data`.
- Gates antes de proveedores.
- Rollback y auditoria antes de activacion.

## Academia

Debe cubrir DEV vs produccion, gates, fuente source-safe, base nueva limpia, `CX.data`, conflictos, certificaciones preservadas y liquidaciones/pagos.

## Estado seguro

Documento solamente. No modifica UI/core ni activa procesos.
