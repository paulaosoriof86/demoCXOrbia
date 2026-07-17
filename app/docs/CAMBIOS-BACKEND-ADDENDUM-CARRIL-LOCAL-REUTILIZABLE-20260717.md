# Cambios backend — carril local reutilizable

Fecha: 2026-07-17

## Archivos creados

- `tools/integration/lib.mjs`.
- `tools/integration/workspace-preflight.mjs`.
- `tools/integration/empalme-candidate.mjs`.
- `tools/integration/run-latest.mjs`.
- `tools/integration/CXORBIA-EMPALMAR-ULTIMA-CANDIDATA.cmd`.
- `tools/integration/EMPALME-PLAN.template.json`.
- políticas de producto, tenant y proyecto en `tools/integration/policies/`.
- `tools/integration/README.md`.
- `incoming/README.md` e `incoming/.gitignore`.
- addendum maestro del carril local.

## Reusable CXOrbia

Preflight, aplicación por plan auditado, rutas protegidas, respaldo, rollback, validación, manifest, build-lock, registro, documentación, idempotencia y commit/push desde un workspace real.

## Exclusivo tenant

TyA tiene una política propia declarada `multiProject: true`, sin proyecto por defecto.

## Exclusivo proyecto

Cinépolis tiene únicamente un perfil opcional de validación. Sus cifras y reglas no se incorporan al motor general.

## Phase A

El carril elimina el bloqueo de transporte de candidatas y deja preparada la ejecución física de V156. V156 aún no se declara empalmada.

## Estado seguro

Sin deploy, merge, producción, imports reales, Firestore/HR writes, Make/Gemini live, Storage real ni pagos.
