# Cambios backend - arquitectura definitiva del carril

Fecha: 2026-07-17

## Archivos creados
- `app/docs/ADDENDUM-MAESTRO-ARQUITECTURA-DEFINITIVA-CARRIL-EMPALMES-CXORBIA-20260717.md`.
- `backend/contracts/integration-lane-architecture-lock-v1.json`.
- `tools/qa/assert-integration-architecture-lock.mjs`.

## Archivos modificados
- `AGENTS.md`.
- `tools/integration/workspace-preflight.mjs`.
- `tools/integration/run-latest.mjs`.

## Cambio
La solucion aprobada basada en el carril probado de Orbit queda como arquitectura prevalente. El preflight exige contrato activo, workspace conjunto ZIP + checkout Git autenticado, politicas multi-tenant/multi-proyecto, seleccion explicita de proyecto, respaldo/rollback e idempotencia. `run-latest.mjs` ejecuta primero el validador de arquitectura.

## Reusable CXOrbia
Motor deterministico comun, contrato, control de cambios, preflight, rollback, idempotencia, manifest, build-lock y evidencia de commit/push.

## Exclusivo cliente
TyA permanece multi-proyecto. Ninguna regla de Cinepolis pasa a producto o default del tenant.

## Claude/prototipo
Claude entrega ZIP; no necesita conexion con GitHub o Codex. La candidata sigue generica y configurable.

## Academia
Cada empalme posterior registra impacto real en manuales, cursos, rutas por rol y notificaciones segun modulos modificados.

## Phase A
Se elimina el bloqueo estructural del carril. V156 sigue pendiente de ejecucion fisica local.

## Estado seguro
Sin merge, deploy, produccion, imports reales, Firestore/HR writes, Make/Gemini live, Storage real ni pagos.
