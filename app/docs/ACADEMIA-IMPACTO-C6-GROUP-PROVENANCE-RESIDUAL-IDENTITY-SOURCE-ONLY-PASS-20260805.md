# ACADEMIA — Impacto C6 group provenance + residual identity source-only PASS

## Principio metodológico

Dos conjuntos solo pueden compararse si comparten el mismo universo de población, actividad, linking y completitud. Un total `64` frente a `65` no demuestra drift cuando un clasificador acepta solo apellido explícito/técnico y el otro acepta además consenso entre fuentes.

## Vector reusable

El contrato incorpora procedencia por miembro mediante fingerprints, booleanos, conteos y enums. Esto permite explicar entradas y salidas de conjuntos sin publicar identidad personal.

## Distinciones obligatorias

- **Cambio legítimo por consenso:** requiere vectores que prueben incompleto antes y completo después.
- **Diferencia de universo:** los dos algoritmos usan reglas distintas de elegibilidad.
- **Defecto de algoritmo:** solo puede afirmarse después de igualar universos y conservar drift.

En este corte se probó diferencia de universo y defecto del comparador diagnóstico; no se probó defecto del algoritmo de sufijo.

## Residuales humanos

La ausencia total de evidencia de apellido requiere enriquecimiento de fuente o adjudicación tenant. El empate Auth requiere adjudicación contra fingerprints estables. Ninguno puede resolverse por inferencia o conveniencia.

## Sin impacto funcional

No cambian cursos, rutas, notificaciones, frontend ni operación. El impacto es exclusivamente técnico-documental.
