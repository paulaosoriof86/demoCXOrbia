# CAMBIOS BACKEND — Addendum C6 Actions outage / root cause

**Fecha:** 2026-08-06  
**Estado:** source-control-only, sin provider, sin deploy.

## Archivos creados

- `backend/contracts/c6-execution-control-plane-v2.json`.
- `tools/qa/cxorbia-c6-control-plane-preflight.mjs`.
- `app/docs/SOURCE-LOCK-C6-GITHUB-ACTIONS-OUTAGE-ROOT-CAUSE-AND-FAILOVER-20260806.md`.
- addenda de CAMBIOS, Claude, Pendientes, Academia y tracker Phase A.

## Causa raíz

Incidente oficial `qcvjkzcs7j74`: GitHub Actions en `major_outage`, webhooks limitados y múltiples eventos push/pull request sin generar workflows.

## Solución preparada

- eliminar commit/push como señal de ejecución provider;
- exigir dispatch explícito y observable;
- preflight fail-closed antes de provider;
- diseñar carril directo autenticado independiente de Actions como contingencia futura.

## Validación

El preflight fue validado con Node 24 y devuelve correctamente `HOLD_C6_CONTROL_PLANE_PREFLIGHT / GITHUB_ACTIONS_NOT_FULLY_RECOVERED` ante el estado vigente.

## Estado seguro

```text
provider reads=0
provider writes=0
Auth/Firestore/Rules/Storage/HR writes=0
deploy=0
merge=0
production=false
```
