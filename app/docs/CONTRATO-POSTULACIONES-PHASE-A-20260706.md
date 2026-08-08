# Contrato postulaciones Phase A

Fecha: 2026-07-06

## Objetivo

Preparar flujo de decision de postulaciones antes de asignacion real o sincronizacion de fuente.

## Archivo creado

- `app/contracts/postulation-decision-flow-phase-a.tya.contract.json`

## Identidad

- `tenantId`
- `projectId`
- `visitId`
- `shopperId`
- `postulationId`
- `hrRowId`

## Estados

- `draft`
- `submitted_preview`
- `pending_review`
- `selected_preview`
- `not_selected_preview`
- `needs_more_info`
- `withdrawn`
- `cancelled`

## Puente con asignaciones

El contrato referencia `app/contracts/assignment-sync-phase-a.tya.contract.json` y mantiene `writesAllowedNow=false`.

## Notificaciones

Solo contempla estado outbox preview. No permite envio real.

## Seguridad

Contrato solamente. Sin runtime. Sin escritura real. Sin produccion.
