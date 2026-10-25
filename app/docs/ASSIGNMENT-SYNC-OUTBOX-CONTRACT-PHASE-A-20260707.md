# Assignment sync outbox contract - Phase A

Fecha: 2026-07-07

## Bloque completado

Se agrego contrato seguro de outbox para preparar la futura integracion Make plataforma ↔ HR sin activar proveedores reales.

Archivo creado:

- `tools/migration/tya-assignment-sync-outbox-contract.mjs`

## Objetivo

Definir el envelope minimo que debe producirse antes de enviar una sincronizacion real a Make.

Este contrato evita:

- llamadas directas a Make desde modulos UI;
- escrituras HR sin gate;
- escrituras Firestore sin gate;
- sincronizaciones sin llave estable;
- eventos sin trazabilidad.

## Campos requeridos

- `eventId`
- `tenantId`
- `projectId`
- `visitId` o `hrRowId`
- `direction`
- `assignmentSource`
- `assignmentSyncStatus`
- `correlationId`
- `createdAt`

Si el evento queda en `queued_reviewed`, tambien requiere `shopperId`.

## Direcciones permitidas

- `platform_to_hr`
- `hr_to_platform`

## Estados permitidos

- `queued_reviewed`
- `blocked_conflict`
- `blocked_missing_key`

## Politica operativa

- `queued_reviewed`: evento ya revisado y apto para gate real futuro.
- `blocked_conflict`: no se envia, queda para revision humana.
- `blocked_missing_key`: no se envia, falta llave estable.

## Estado seguro

La herramienta usa fixtures sinteticos.

No hace:

- llamada Make;
- HR writes;
- Firestore writes;
- imports;
- produccion.

## Impacto Academia

No hay impacto nuevo en Academia.

## Claude

No hay pendiente importante nuevo para Claude.

Este bloque es contrato backend/integracion. Solo se avisara a Claude si luego se requiere UI adicional para estados de sync, revision o conflictos.
