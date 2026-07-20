# CAMBIOS BACKEND — CORTE 1.2 CAPACIDADES Y HANDOFF CLAUDE

Fecha: 2026-07-20
Estado: `BACKEND_PASS_CLAUDE_REQUIRED`

## Archivos creados

- `backend/contracts/phase-a-corte1-report-frontend-consumer-v1.json`.
- `tools/qa/tya-corte1-report-frontend-consumer-acceptance.mjs`.
- `app/docs/PAQUETE-CLAUDE-CORTE1-REPORTES-EXPORTACIONES-20260720.md`.
- `app/docs/CLAUDE-PATRONES-REUTILIZABLES-ADDENDUM-CORTE0B-CORTE1-20260720.md`.

## Archivos actualizados

- `backend/contracts/phase-a-corte1-context-history-reports-v1.json` a schema 1.1.0.
- `tools/release/tya-corte1-report-projection-build.mjs`.
- `tools/qa/tya-corte1-report-projection-browser-gate.mjs`.
- `app/docs/RESUMEN-PARA-CLAUDE-ADDENDUM-FREEZE-CORTE-0B-V161C-20260720.md`.
- `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`.
- `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`.
- `app/docs/PENDIENTES-CORTE1-20260720.md`.

## Mejora de raíz

La proyección anterior permitía conteos por periodo/país, pero no soportaba honestamente todas las tarjetas del Portal Cliente.

Se agregó:

- proyección por sucursal;
- matriz de capacidades `available` / `pending_source`;
- bloqueo de claims sin fuente;
- contrato de alcance por rol en modo preview;
- contrato de exportación coherente;
- gate de aceptación para el delta frontend.

## Evidencia

- Run `29727050055`: SUCCESS.
- Artifact `8454684849`.
- Digest `sha256:da068c013b3911f062ac5d7154580224b5fa68f5df91a6bfd68c0c7e6ec5aabf`.
- 28 filas periodo/país.
- 308 filas periodo/país/sucursal.
- 4 reportes disponibles.
- 3 reportes pendientes de fuente.
- 0 blockers, 0 errores de página y 0 errores de consola.

## Clasificación

- Reusable CXOrbia: proyección multinivel, matriz de capacidades, exports con una única fuente y alcance honesto.
- Exclusivo TyA: inventario Cinépolis y conteos actuales.
- Claude/prototipo: `cli_reportes`, archivos reales, copy, estados y responsive.
- Academia: fuente, alcance, disponibilidad y lectura de reportes.
- Sin impacto Claude: gates, artifacts y digests.

## Estado seguro

No se modificó ningún módulo frontend. Sin deploy nuevo, merge, producción, importación ni escrituras reales.
