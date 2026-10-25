# CAMBIOS BACKEND — CORTE 1 REPORT PROJECTION

Fecha: 2026-07-20
Estado: `PASS_WITH_FRONTEND_CONSUMER_PENDING`

## Archivos creados

- `backend/contracts/phase-a-corte1-context-history-reports-v1.json`.
- `tools/qa/tya-corte1-context-history-reports-gate.mjs`.
- `tools/release/tya-corte1-report-projection-build.mjs`.
- `tools/qa/tya-corte1-report-projection-browser-gate.mjs`.
- `app/docs/PHASE-A-CORTE1-INICIO-CONTEXTO-HR-HISTORICO-REPORTES-20260720.md`.

## Archivo actualizado

- `.github/workflows/cxorbia-phase-a-r18a-canonical-assets-integration.yml`.

## Resultado

- Run `29725084348`: SUCCESS.
- Run `29725365613`: SUCCESS.
- 14 periodos, 616 visitas y 28 filas periodo/país.
- JSON/CSV source-safe.
- Gate navegador sin blockers ni errores.
- PDF/XLSX/PPTX siguen pendientes del consumidor frontend.

## Clasificación

- Reusable CXOrbia: contrato de reportes por contexto y exportación source-safe.
- Exclusivo TyA: inventario Cinépolis junio 2025–julio 2026.
- Claude/prototipo: conectar `cli_reportes` al contrato aprobado.
- Academia: documentar lectura de histórico, fuente y reportes.
- Sin impacto Claude: gates, builder y artefactos de evidencia.

Sin deploy, merge, producción ni escrituras reales.
