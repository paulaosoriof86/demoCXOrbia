# Contrato sincronizacion asignaciones Phase A

Fecha: 2026-07-06

## Objetivo

Documentar el contrato existente de sincronizacion de asignaciones entre fuente operacional y plataforma.

## Archivo base

- `app/contracts/assignment-sync-phase-a.tya.contract.json`

## Llaves estables

- `tenantId`
- `projectId`
- `visitId`
- `hrRowId`
- `shopperId`
- `assignmentId`
- `postulationId`
- `assignmentSource`
- `assignmentSyncStatus`
- `lastSyncedAt`

## Fuentes de asignacion

- `platform_postulation`
- `platform_manual_admin`
- `hr_detected`
- `historical_import_preview`
- `manual_review`

## Estados de sincronizacion

- `not_synced`
- `pending_make_sync`
- `synced_from_platform`
- `synced_from_hr`
- `sync_disabled_preview_only`
- `conflict_review_required`
- `manual_review_required`
- `cancelled`

## Politica

No se permite deduplicar por coincidencia visual. No se permite sobrescritura silenciosa. Si hay diferencia entre fuente operacional y plataforma, debe ir a revision.

## Seguridad

Contrato documental. No llama Make. No escribe Firestore. No escribe fuente operacional. No habilita produccion.
