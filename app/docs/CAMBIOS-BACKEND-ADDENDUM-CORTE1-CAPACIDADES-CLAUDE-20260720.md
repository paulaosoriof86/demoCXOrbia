# CAMBIOS BACKEND — CORTE 1.2 REPORTES

Fecha: 2026-07-20
Estado: `DEV_PASS_PENDING_VISUAL`

## Actualización DEV

- Run `29771355833`: SUCCESS.
- Artifact `8473242334`.
- Build `v164-corte1-reportes-20260720-dev`.
- Reportes y roles remotos: PASS.
- Revisión visual de Paula: pendiente.

## Base preparada

- Contrato de consumidor frontend.
- Proyección periodo/país y sucursal.
- Matriz de reportes disponibles y pendientes de fuente.
- Gates estático, runtime y navegador.

## V164 integrada

- Commit de empalme: `f708515a637a3998eefdbe39ef66d37a3f130fb6`.
- Archivos: `app/modules/cliente-extra.js`, `app/index.html`, `app/vendor/pptxgenjs.min.js`, `app/REPORTE-DE-CAMBIOS.md`.
- Conflictos: ninguno.
- Manifest: `app/docs/MANIFEST-V164-CORTE1-REPORTES-EMPALME-DIRECTO-20260720.json`.
- Verificador: `tools/qa/verify-v164-corte1-reportes-lock.mjs`.

## Mejoras técnicas locales y reutilizables

- `backend/contracts/phase-a-corte1-context-history-reports-v1.json`: schema 1.2.0 y formatos frontend técnicamente listos.
- `tools/release/tya-corte1-report-projection-build.mjs`: disponibilidad de formatos derivada del contrato.
- `tools/qa/tya-corte1-report-projection-browser-gate.mjs`: expectativas derivadas del contrato, sin versión fija.
- `tools/qa/tya-corte1-report-frontend-runtime-gate.mjs`: validación dinámica de Director, Regional, Sucursal, periodo faltante, Tendencia y exportaciones.
- Smoke visual ampliado a `cli_reportes`.
- Carril de publicación DEV consumido y nuevamente en HOLD.

## Evidencia

- Run técnico `29768206645`: SUCCESS.
- Artifact técnico `8471655866`.
- Run DEV `29771355833`: SUCCESS.
- Artifact DEV `8473242334`.
- 14 periodos, 616 visitas, 28 filas periodo/país y 308 filas de sucursal.
- 611 asignadas, 5 sin asignar, 592 realizadas, 590 cuestionarios y 527 submitidas.
- 4 reportes disponibles y 3 pendientes de fuente.
- JSON, CSV, PDF, XLSX y PPTX listos.
- Gates sin blockers ni errores de navegador.

## Clasificación

- Reusable CXOrbia: scope fail-closed, gate runtime, formatos por contrato y gate navegador dinámico.
- Exclusivo TyA: inventario y conteos Cinépolis.
- Claude/prototipo: V164 completada; sin nueva candidata pendiente.
- Academia: alcance por rol, fuentes y exportaciones.
- Sin impacto Claude: manifest, verificador y artifacts.

## Pendiente

Revisión visual y freeze Corte 1.
