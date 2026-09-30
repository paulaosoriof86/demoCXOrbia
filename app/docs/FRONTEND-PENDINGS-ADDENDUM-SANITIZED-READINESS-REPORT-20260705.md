# Frontend pendings addendum - Sanitized readiness report

Fecha: 2026-07-05

## Contexto

Backend ya tiene generador de reporte sanitizado de release readiness preview. Esto no corrige frontend, pero define como deben mostrarse estados sin prometer produccion.

## Reglas de UI futuras

Cuando frontend incorpore readiness, debe mostrar:

- preview ready;
- ready for review;
- manual review required;
- blocked prototype pending;
- blocked missing input;
- blocked sensitive data;
- blocked real gate off;
- not production ready.

No debe mostrar:

- production ready;
- enviado;
- sincronizado;
- conectado;
- importado;
- pagado;
- movido;

si no existe gate real activo y autorizacion futura.

## P0 vigente

La auditoria V87 mantiene P0 de honestidad operativa. El reporte sanitizado debe seguir marcando `prototype_audit` como blocker hasta que Claude entregue correccion y sea auditada.

## P1 posterior

Despues del P0, frontend puede incorporar un panel de readiness para Admin/Super que lea estados de preview, review y blockers, sin activar proveedores.
