# PENDIENTES PROTOTIPO — Addendum C6 Actions outage / root cause

**Fecha:** 2026-08-06

## Pendiente vivo

1. No volver a usar commits `push` o eventos `pull_request` como señal única para ejecutar provider.
2. Esperar que el incidente GitHub Actions `qcvjkzcs7j74` figure `resolved` y Actions `operational`.
3. Ejecutar el preflight `tools/qa/cxorbia-c6-control-plane-preflight.mjs` antes de cualquier nueva frontera provider.
4. Autorizar separadamente un dispatch explícito observable para SKIP13.
5. Diseñar y desplegar, con autorización independiente, el carril `direct_trusted_runner` fuera de GitHub Actions.

## No pendientes de frontend

No hay regresión UI, módulo huérfano ni ajuste visual derivado de este incidente.

## Bloqueos

```text
GitHubActions=major_outage
incident=qcvjkzcs7j74
webhookTriggers=throttled
providerExecutionAuthorized=false
```
