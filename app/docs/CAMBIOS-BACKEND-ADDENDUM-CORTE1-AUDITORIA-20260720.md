# CAMBIOS BACKEND — AUDITORÍA CORTE 1

Fecha: 2026-07-20
Estado: `HOLD`

Se auditó directamente `Prototype development request (11).zip` y no se aplicó.

Resultado reproducible:
- 4 reportes disponibles esperados; 1 observado.
- 12 botones habilitados esperados; 3 observados.
- filtro país ausente.
- Excel de tendencia: 14 filas, todas vacías.

Causa: la candidata asumió `periods[].branches`, score, NPS y región. La proyección vigente usa `rows`, `branchRows`, `catalog`, `filter()` y `report()`.

Fix reusable: se endureció `tools/qa/tya-corte1-report-frontend-consumer-acceptance.mjs` para ejecutar el módulo contra schema 1.1.0. Commit `426c053ab0ca60bfbad6de139f571ed0cb608b17`.

Clasificación:
- Reusable CXOrbia: gate semántico fail-closed.
- Exclusivo TyA: conteos GT/HN de la evidencia.
- Claude/prototipo: corrección de `cli_reportes`.
- Academia: sin cambio visible aplicado.
- Sin impacto Claude: auditoría y trazabilidad.

Baseline V161C preservada. Sin deploy, merge, producción ni escrituras reales.
