# Assignment sync conflict preview - Phase A

Fecha: 2026-07-07

## Bloque completado

Se agrego herramienta segura para modelar la sincronizacion plataforma ↔ HR sin escribir datos reales.

Archivo creado:

- `tools/migration/tya-assignment-sync-conflict-preview.mjs`

## Objetivo

Preparar la logica Phase A de asignaciones sin duplicar visitas ni sobrescribir conflictos silenciosamente.

La herramienta valida escenarios sinteticos:

- asignacion nacida en plataforma y pendiente de reflejar en HR;
- asignacion nacida en HR y pendiente de reflejar en plataforma;
- asignacion ya sincronizada;
- conflicto entre shopper plataforma y shopper HR;
- bloqueo por falta de llave estable.

## Llaves estables requeridas

- `tenantId`
- `projectId`
- `visitId` o `hrRowId`
- `shopperId` cuando hay asignacion
- `assignmentSource`
- `assignmentSyncStatus`
- `lastSyncedAt`

## Decisiones generadas

- `platform_to_hr`: la asignacion viene de plataforma y debe reflejarse en HR por Make cuando el gate real se active.
- `hr_to_platform`: la asignacion viene de HR y debe reflejarse en plataforma.
- `already_synced_noop`: ambas fuentes coinciden.
- `conflict_review_required`: ambas fuentes asignan shopper distinto y debe ir a revision humana.
- `missing_stable_key`: falta llave estable y no debe sincronizarse.

## Politica clave

No deduplicar por coincidencia visual simple.

No sobrescribir silenciosamente.

Todo conflicto va a revision.

## Estado seguro

La herramienta usa fixtures sinteticos.

No hace:

- HR writes;
- Firestore writes;
- imports;
- proveedores;
- produccion.

## Impacto Academia

No hay impacto nuevo en Academia.

## Claude

No hay pendiente nuevo importante para Claude.

Este bloque prepara contrato/backend de sincronizacion. Solo se avisara a Claude si luego se requiere UI para mostrar conflictos o estados de revision de forma distinta al prototipo actual.
