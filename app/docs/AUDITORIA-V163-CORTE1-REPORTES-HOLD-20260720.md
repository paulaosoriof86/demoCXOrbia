# AUDITORÍA V163 — CORTE 1.2 REPORTES

Fecha: 2026-07-20
Estado: `HOLD_P0_PROVEN_NO_APPLY`

## Identidad de candidata

- Archivo: `Prototype development request (12).zip`.
- SHA-256: `73fcffc48f6d897c7b4e701ff6dbc61898ef6c9afe1ea8291d1950f0d8f5cfe0`.
- Archivos: 4.
  - `app/modules/cliente-extra.js`.
  - `app/index.html`.
  - `app/vendor/pptxgenjs.min.js`.
  - `app/REPORTE-DE-CAMBIOS.md`.

## Controles aprobados

- ZIP extraíble y limitado a los cuatro archivos autorizados.
- No incluye ni carga `app/adapters/tya-corte1-report-projection.js`.
- `app/index.html` reconstruido sin la línea PptxGenJS coincide exactamente con el blob vigente `b780839adee4f4ee53219372745d71e127e6e6dd`.
- `app/modules/cliente-extra.js` reconstruido con el bloque `cli_reportes` vigente coincide exactamente con el blob `6e2abecb23ecd6bc670515bed5fcdfaebe72bfec`; no hay cambios fuera del módulo autorizado.
- El contenido vigente completo de `app/REPORTE-DE-CAMBIOS.md` se conserva exactamente bajo la nueva sección V163; blob preservado `c9a690a9fc1c6a71a52f5dd2e490e2715d3ab3ae`.
- `node --check app/modules/cliente-extra.js`: PASS.
- `node --check app/vendor/pptxgenjs.min.js`: PASS.
- PptxGenJS 3.12.0 carga como función en contexto navegador.
- Director: cuatro reportes disponibles, tres pendientes de fuente y selector Todos/GT/HN.
- Nombres de archivo incluyen alcance.
- Sin adapter guardado, PII, secretos, score, NPS, benchmark o región inventados.

## P0-1 — fuga de alcance para el rol Sucursal

La candidata resuelve correctamente `scopeSucursal` desde ID a `branchName`, pero solo aplica la sucursal al reporte `branch_operational_status`.

Para `executive_operational_summary`, `country_coverage` y `period_trend`, `scopeFor()` reemplaza la sucursal por el país y consume `rows` de todo el país.

Prueba reproducible:

- `scopeSucursal = suc-miraflores`.
- Catálogo UI: `{id: "suc-miraflores", name: "C. Miraflores"}`.
- Proyección: Miraflores 2 visitas julio; Oakland 2 visitas julio; ambas GT.

Resultado observado:

- Estado por sucursal: 2 visitas — correcto.
- Resumen ejecutivo: 34 visitas GT — incorrecto.
- Cobertura por país: 34 visitas GT — incorrecto.
- Tendencia: 68 visitas GT junio+julio — incorrecto.

Impacto: un Responsable de Sucursal visualiza y exporta métricas de otras sucursales. Viola `mustRespectScope`, el alcance por rol y la promesa visible de datos acotados.

## P0-2 — fallback silencioso al último periodo

Código observado:

`p.periodKey ? p.periodKey : proj.latestPeriod`

Prueba:

- `p.id = cinepolis-2026-06`.
- `p.periodKey` ausente.
- `proj.latestPeriod = 2026-07`.

Resultado observado: el módulo selecciona julio, habilita reportes y permite exportar cifras de julio.

Resultado esperado: fail-closed; no inferir periodo, no mostrar filas y no exportar.

Impacto: puede presentar información de un mes distinto al contexto visual, contradiciendo el contrato que define `CX.data.period().periodKey` como única fuente del periodo.

## P1 — periodo activo incluido en Tendencia

El contrato vigente exige `defaultExcludesLatestActivePeriod: true`.

Con periodos `2026-06` y `2026-07`, y `latestPeriod = 2026-07`, la candidata devuelve ambos periodos en `period_trend`.

Resultado esperado: excluir `2026-07` por defecto y mantener los periodos históricos verificables.

## P1 de hardening — coincidencia normalizada no única

`resolveBranchName()` usa `find()` para la coincidencia normalizada. Si dos sucursales normalizan al mismo nombre, elige la primera silenciosamente.

Resultado esperado: coincidencia exacta o normalizada única; cualquier ambigüedad pasa a `Pendiente de alcance autorizado`.

## Decisión

- P0 demostrados: 2.
- P1 demostrados: 2.
- Decisión: `HOLD_P0_PROVEN_NO_APPLY`.
- V163 no se aplica ni pasa a Codex.
- V161C/R21 permanece como `ACTIVE_BASELINE`.
- No hubo cambios de frontend, deploy, merge, producción, imports ni escrituras reales.

## Siguiente acción exacta

`CLAUDE_CORRIGE_V163 -> CHATGPT_REAUDITA -> SI_GO_APPLY_DELTA_DIRECTLY -> POST_GATES -> HOSTING_DEV_AUTORIZADO -> REVISION_VISUAL_PAULA -> FREEZE_CORTE_1`
