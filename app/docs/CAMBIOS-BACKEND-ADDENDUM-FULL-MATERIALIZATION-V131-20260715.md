# CAMBIOS BACKEND — MATERIALIZACIÓN COMPLETA V131

Fecha: 2026-07-15

## Cambios

- Se amplió el workflow para conservar el fixture de regresión y procesar también el snapshot HR vivo source-safe.
- El snapshot vivo se canoniza con los contratos R18A antes de construir el plan.
- El validador dejó de depender de un conteo histórico fijo de shoppers y ahora exige igualdad entre las operaciones planificadas y la fuente canónica actual.
- Se publican como artefacto el plan completo, cuatro lotes, resumen, verificación, snapshot vivo y snapshot canonizado.

## Resultado comprobado

- PASS.
- 1,421 operaciones.
- 14 periodos, 616 visitas, 216 shoppers y 572 liquidaciones candidatas.
- 4 lotes: 400, 400, 400 y 221.
- Sin rutas duplicadas, datos sensibles, pagos inferidos ni certificaciones inventadas.
- Pagos y certificaciones continúan retenidos por ausencia de fuente confirmada.

No se modificó frontend, `CX.data`, módulos ni runtime V131.

## Clasificación

- Reusable CXOrbia: materialización completa source-safe, canonización previa y validación contra fuente actual.
- Exclusivo cliente: conteos y activos TyA/Cinépolis.
- Claude/prototipo: sin impacto.
- Academia: materialización sigue siendo dry-run y requiere revisión humana/autorización antes de writes.
- Sin impacto Claude: backend/CI.

Sin writes, deploy, producción, Make, Gemini ni pagos.
