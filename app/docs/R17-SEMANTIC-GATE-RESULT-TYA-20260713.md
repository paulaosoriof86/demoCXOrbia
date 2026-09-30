# R17 — resultado gate semántico TyA

Fecha: 2026-07-13

## Decisión

`NO_GO_VISIBLE_TYA_R17_SEMANTIC_DATA_MAPPING`

Run:

`29293299119`

Artifact compacto:

- nombre: `tya-r17-semantic-gate-summary`;
- digest: `sha256:130bbabf74960b77094b738fc5f84066dbee2d1cc143911ecf346e54b0d2ceb8`.

Artifact completo:

- nombre: `phase-a-tya-source-safe-visual-smoke`;
- digest: `sha256:087f4c49d7a7d88c1069a73ab70204a0d5f46091ae059fc5fe267ef49b18a2f6`.

## Resultado automático

- blockers: 8;
- warnings: 2;
- errores de consola: 0;
- errores de página: 0;
- writes/import/deploy/producción: 0.

## Blockers confirmados

1. `login_duplicate_tenant_title_without_logo` — `TyA / TyA`.
2. `deployed_app_uses_build_time_hr_snapshot_not_runtime_live_hr`.
3. `submitted_conflated_with_liquidated_without_financial_evidence` — 401 filas.
4. `raw_spreadsheet_numeric_dates_in_source_payload` — 1,488 señales de fecha numérica.
5. `dashboard_month_selector_not_bound_to_canonical_sidebar_period` — `JUN 2026 / JUL 2026`.
6. `my_day_july_calendar_empty_despite_period_date_rows` — 44 visitas / 44 filas con fecha, 0 celdas activas.
7. `visits_table_displays_raw_spreadsheet_date_serials` — 44/44 filas visibles con serial numérico en Agenda.
8. `shopper_operational_rating_uniform_placeholder` — rating único 4.3.

## Warnings

1. `login_flags_show_all_configured_countries_not_active_country_selection` — GT/HN.
2. `shopper_list_is_protected_reference_projection_not_complete_operational_profile` — 215 referencias.

## Snapshot leído durante el gate

- 14 periodos;
- 28 tabs;
- 616 visitas;
- 215 shoppers protegidos;
- GT 476;
- HN 140;
- estados proyectados por el builder actual:
  - `liquidada`: 401;
  - `cuestionario`: 142;
  - `realizada`: 46;
  - `agendada`: 26;
  - `fuera_rango`: 1.

Esta distribución no se acepta como semántica TyA válida porque `liquidada` está inferida por submitido y no por fuente financiera.

## Prueba de periodo dividido

Después de seleccionar JUN 2026 en el sidebar:

- `CX.data.currentProjectId`: `cinepolis-2026-06`;
- periodo real: JUN 2026;
- selector interno Dashboard: JUL 2026;
- banner Dashboard: JUL 2026;
- datos/KPIs: 44 visitas de junio.

El selector interno no controla la fuente.

## Prueba de Mi Día

Con JUL 2026 seleccionado:

- 44 visitas del periodo;
- 44 filas con agenda/disponible desde;
- calendario julio abierto;
- 0 celdas con actividad.

La causa es la combinación de estado de calendario independiente y fechas numéricas no normalizadas.

## Prueba de rutas versus semántica

Las 13 rutas críticas renderizaron y no tuvieron errores JS, pero el gate semántico falló. Esto demuestra que `13/13 rutas` no equivale a migración correcta.

El smoke anterior también falló con `shopper_count_mismatch:215/210`, confirmando drift entre el snapshot desplegado y la lectura HR posterior.

## Estado seguro

- browser/local read-only;
- sin Firestore/Auth/Storage/HR writes;
- sin imports, rules, Functions, Make, Gemini, pagos, deploy o producción;
- sin PII en artifacts;
- PR #7 draft/open/no merge.
