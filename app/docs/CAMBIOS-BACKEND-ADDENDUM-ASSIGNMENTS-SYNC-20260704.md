# Cambios backend - Addendum assignments sync Phase A

Fecha: 2026-07-04

## Archivos creados

- `app/contracts/assignment-sync-phase-a.tya.contract.json`
- `tools/migration/tya-assignment-sync-contract-validator.mjs`
- `app/docs/ASSIGNMENTS-POSTULATIONS-SYNC-MODULE-REVIEW-PHASE-A-TYA-20260704.md`
- `app/docs/ACADEMIA-IMPACT-POSTULACIONES-ASIGNACIONES-TYA-20260704.md`
- `app/docs/CAMBIOS-BACKEND-ADDENDUM-ASSIGNMENTS-SYNC-20260704.md`

## Motivo

Continuar backend Phase A desde V82 con revision modulo por modulo, iniciando por postulaciones, asignaciones y sincronizacion HR/plataforma.

## Decision

Se define contrato seguro para asignaciones bidireccionales plataforma/HR sin activar Make, sin escribir HR y sin escribir Firestore.

## Impacto prototipo

- Cambiar textos que prometen `HR sincronizada` si el sync real esta apagado.
- Mostrar estados honestos de sync: pendiente, preparado, conflicto o deshabilitado preview.
- Mantener conflictos HR/plataforma como revision, no sobrescritura.

## Impacto Academia

Se documento contenido requerido para admin, ops, shopper, cliente y consultora/representante/franquiciado/aliado/socio.

## Estado seguro

Sin cambios frontend, sin runtime, sin Firestore writes, sin HR writes, sin Make real, sin deploy y sin produccion.
