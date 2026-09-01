# CAMBIOS BACKEND — Addendum C6 cancelación HR antes del runner

**Fecha:** 2026-08-06  
**Estado:** `PASS_V2_V3_PROVIDER_READS_0_PROVEN_BEFORE_RUNNER_STEPS`

## Archivos creados

- `tools/qa/cxorbia-live-hr-run-consumption-classifier.mjs`: clasifica consumo provider desde evidencia run/job/steps.
- `app/docs/evidence/LIVE-HR-V2-V3-RUNNER-CANCELLATION-ROOT-CAUSE-LATEST.json`: evidencia source-safe de los runs v2/v3.
- `app/docs/SOURCE-LOCK-C6-LIVE-HR-V2-V3-RUNNER-CANCELLATION-20260806.md`: source lock de causa raíz y antibucle.
- addenda de Claude, Pendientes, Academia y tracker.

## Causa raíz corregida

La ausencia de commit status se había tratado como ausencia de run. Los runs sí existieron; ambos jobs `reconcile` terminaron `cancelled` con cero steps. Por el orden contractual del workflow, no alcanzaron la frontera provider y consumieron cero lecturas.

## Validación

```text
node --check classifier=PASS
fixture v2/v3=PASS
runs=2
steps=0/0
provider read lower bound=0
provider read upper bound=0
```

## No modificado

- `.github/cxorbia-firebase-requests/live-hr-current-reconcile.json`;
- `.github/workflows/cxorbia-live-hr-current-reconcile.yml`;
- `/app/modules/*`;
- `/app/core/*`.

## Clasificación

- **Reusable CXOrbia:** diagnóstico determinístico previo a provider.
- **Exclusivo TyA:** futura lectura HR viva.
- **Claude/prototipo:** sin cambio frontend.
- **Academia:** troubleshooting de jobs sin runner.
- **Sin impacto Claude:** Phase A acumulativa preservada.

## Seguridad

Cero trigger, provider read, write, deploy, merge o producción.
