# Frontend pendings addendum - Controlled production matrix

Fecha: 2026-07-05

## Contexto

La matriz de produccion controlada deja claro que el frontend/prototipo es el blocker principal de source lock por P0 de honestidad operativa.

## P0 obligado

Corregir textos visibles o semivisibles que indiquen acciones reales sin gates activos:

- envio real;
- sincronizacion real;
- movimiento automatico de liquidacion;
- cuestionario enviado cuando corresponde realizado/completado pendiente revision.

## Reglas para una candidata correctiva

- Debe tener delta real contra la baseline inmediata.
- Debe ser quirurgica.
- No debe tocar backend, contratos ni tools.
- No debe ampliar Academia antes de cerrar P0.
- Debe dejar 0 scripts faltantes, 0 duplicados y 0 fallas JS.

## P1 despues del P0

- Readiness UI honesta.
- Estados de gates.
- availableFrom.
- outboxStatus.
- mailboxId.
- formVersion.
- externalFolderRef.
- crmEntityId.
- Academia de preview vs produccion.

## Decision

No source lock mientras estos P0 sigan vivos.
