# Cambios role taxonomy org scope

Fecha: 2026-07-09

## Archivos agregados

- `backend/contracts/phase-a-role-taxonomy-org-scope-v1.json`
- `backend/config/phase-a-role-taxonomy-personas.source-safe.json`
- `tools/release/tya-role-taxonomy-org-scope-validate.mjs`
- `app/docs/PHASE-A-ROLE-TAXONOMY-ORG-SCOPE-20260709.md`

## Motivo

Se detecto que la matriz minima de Auth/RBAC no cubria completo perfiles operativos como representantes, coordinadores, franquiciados/franquicia y cliente/marca evaluada.

## Resultado

Se agrego una taxonomia reusable que separa persona operativa, rol tecnico, scope y permisos, manteniendo claims pequenos y seguros.

## Estado seguro

No Auth real, no claims, no Firestore writes, no deploy, no produccion, no datos sensibles.
