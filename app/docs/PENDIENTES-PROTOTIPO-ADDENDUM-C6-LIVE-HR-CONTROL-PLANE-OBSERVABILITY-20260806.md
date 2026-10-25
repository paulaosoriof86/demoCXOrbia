# PENDIENTES PROTOTIPO — Addendum C6 observabilidad control-plane HR viva

**Fecha:** 2026-08-06

## Cerrado en este bloque

- Ambigüedad futura sobre si una ejecución alcanzó la frontera provider.
- Ausencia de journal source-safe.
- Ausencia de artifact sanitizado.
- Request v2 aceptable por el workflow anterior.

## Pendiente P0

1. Autorización fresca para exactamente un request v3.
2. Confirmar si GitHub Actions inicia la ejecución y publica `WORKFLOW_STARTED_PROVIDER_READS_0`.
3. Confirmar frontera provider y consumo mediante journal/status/artifact.
4. Validar HR viva `2026-08` con tabs GT/HN.
5. Validar mutación histórica y `sourceRevision` transversal.
6. Continuar al precheck Auth con `HOLD=0`.

## Antecedente no resuelto

```text
request v2=4e404f2db48ff8b07430d7ac7505eff6c040458a
providerReadConsumption=UNKNOWN_NO_EXECUTION_EVIDENCE
```

No reintentar ni reinterpretar ese request como cero.

## P1/P2 preservado

- PDF con gráficas completas.
- Excel con formato final.
- Mejoras visuales no bloqueantes.

No sustituyen el P0 de HR viva.

## Seguridad

```text
nuevo provider read=0
writes/deploy/merge/production=0
```
