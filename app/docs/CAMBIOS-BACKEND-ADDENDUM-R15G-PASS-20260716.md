# CAMBIOS BACKEND — CIERRE R15G PASS

Fecha: 2026-07-16

## Archivos nuevos

- `tools/release/tya-source-safe-binding-build-r15g.mjs`
- `tools/hr-source/tya-build-live-hr-source-safe-r15g.mjs`
- `tools/qa/tya-source-semantics-r15g-gate.mjs`
- `tools/qa/tya-project-period-kpi-history-gate.mjs`
- `tools/qa/verify-fast-lane-promotion-policy.mjs`
- `app/docs/GATE-R15G-TYA-SOURCE-SAFE-PASS-20260716.md`

## Archivos modificados

- `app/core/tya-phase-a-source-safe-preview.js`
- `.github/workflows/cxorbia-phase-a-source-safe-visual-smoke-tya.yml`
- `backend/contracts/prototype-baseline-registry-v1.json`

## Correcciones

- Separación estable entre proyecto y periodo.
- Contexto único `{tenantId, projectId, periodId}`.
- Histórico y KPI acotados al periodo activo.
- Fechas HR serializadas normalizadas a ISO.
- Submitido separado de liquidación y pago.
- Conteo source-safe actualizado a 216 shoppers.
- Fast-lane bloquea promociones híbridas y exclusiones silenciosas de runtime.

## Validación

Workflow `29532682880`: PASS completo. Artifact `8389252633`.

## Estado seguro

Sin cambios en `app/modules/**`, deploy, producción, import real, writes, Make, Gemini ni pagos.

## Clasificación

- Reusable CXOrbia: contexto canónico, gates semánticos y fast-lane atómico.
- Exclusivo cliente: 14 periodos, 616 visitas, 216 shoppers y reglas de junio TyA/Cinépolis.
- Claude/prototipo: no requiere nueva candidata por estas correcciones backend; debe conservar el contrato `CX.data`.
- Academia: proyecto vs periodo, KPI, histórico y estados submitido/liquidación/pago.
- Sin impacto Claude: workflows, validators, registry y policy checks.