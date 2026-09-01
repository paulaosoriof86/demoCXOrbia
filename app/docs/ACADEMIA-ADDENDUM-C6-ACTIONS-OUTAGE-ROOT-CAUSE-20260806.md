# ACADEMIA — Addendum C6 Actions outage / root cause

**Fecha:** 2026-08-06

## Aprendizaje reusable

La secuencia técnica correcta para automatizaciones críticas queda documentada así:

```text
request != event
 event != run
 run != provider boundary
 provider boundary != resultado terminal
```

Un control plane confiable debe comprobar cada transición de forma independiente y fail-closed.

## Caso aplicado

GitHub confirmó un outage mayor con webhooks limitados. El commit existió, pero el scheduler no garantizó la creación del run. La solución no es repetir el commit, sino usar dispatch explícito observable y una contingencia independiente de Actions.

## Impacto en cursos y rutas

Sin modificaciones a cursos, manuales, certificaciones, rutas por rol o notificaciones. El hallazgo se incorpora como patrón de resiliencia y trazabilidad backend.
