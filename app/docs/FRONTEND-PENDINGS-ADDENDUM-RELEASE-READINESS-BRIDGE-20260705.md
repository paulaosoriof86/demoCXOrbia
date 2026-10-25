# Frontend pendings addendum - Release readiness bridge

Fecha: 2026-07-05

## Contexto

Mientras Claude no tiene capacidad, backend avanzo el puente de readiness preview. Esto no corrige frontend, pero cambia como se debe leer el estado de salida controlada.

## Pendiente P0 vigente

El prototipo sigue bloqueado para source lock porque V87 no corrigio textos de acciones reales con gates apagados. El release readiness bridge mantiene `prototype_audit` como `blocked_prototype_pending` por defecto.

## Que debe mostrar frontend cuando incorpore readiness

Cuando exista vista o texto de readiness, debe separar estados:

- backend preview ready;
- revision requerida;
- input faltante;
- gate real apagado;
- prototipo pendiente;
- source lock pendiente;
- produccion no autorizada.

No usar textos como listo para produccion, sincronizado, enviado, conectado, importado, pagado o movido mientras gates reales sigan apagados.

## Pendiente P1 para despues del P0

Incorporar senales backend:

- `availableFrom`
- `outboxStatus`
- `mailboxId`
- `formVersion`
- `externalFolderRef`
- `crmEntityId`

## Academia

Academia debe explicar preview vs produccion, gates, blockers y revision manual, pero esto no debe desplazar la correccion P0 inmediata cuando Claude recupere capacidad.
