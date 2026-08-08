# CAMBIOS BACKEND — Addendum C6 Actions outage / root cause

Se documentó la causa raíz demostrada del no-run C6: incidente oficial GitHub Actions `qcvjkzcs7j74`, impacto crítico, componente Actions en outage mayor y triggers webhook limitados.

Se crearon:

- `backend/contracts/c6-execution-control-plane-v2.json`;
- `tools/qa/cxorbia-c6-control-plane-preflight.mjs`;
- source lock y addenda obligatorios en `app/docs`.

La solución elimina commit/push como señal de ejecución provider, exige dispatch explícito observable y deja diseñado un carril directo autenticado independiente de GitHub Actions.

Estado: source-only; provider reads/writes, deploy, merge y producción = 0.
