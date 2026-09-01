# Resultado HR Source private full flow TyA

Fecha: 2026-07-03
Rama: `docs-tya-v6-v71-audit`
PR: #7 draft
Origen: reporte local ejecutado por Paula en PowerShell.

## Resultado ejecutivo

La prueba local privada de HR Source SI logro leer la HR viva en modo XLSX multi-tab. Esto corrige el problema original de lectura parcial por un solo `gid`/CSV.

Resultado visible del reporte:

- Repo correcto detectado.
- Rama correcta: `docs-tya-v6-v71-audit`.
- Endpoint local ejecutado.
- Lectura por tabs vivos: `live_xlsx_tab`.
- `Errors`: none.
- Firestore writes: 0.
- Imports executed: 0.
- Deploy: 0.
- Produccion: 0.

## Cobertura HR viva detectada

El reporte mostro tabs vivos por XLSX:

| Tab / periodo | Source | Filas | Columnas | Estado |
|---|---|---:|---:|---|
| SEPTIEMBRE 25 | live_hr | 35 | 34 | live_xlsx_tab |
| SEPTIEMBRE 25 HN | live_hr | 24 | 34 | live_xlsx_tab |
| OCTUBRE 25 | live_hr | 35 | 34 | live_xlsx_tab |
| OCTUBRE 25 HN | live_hr | 24 | 34 | live_xlsx_tab |
| NOVIEMBRE 25 | live_hr | 35 | 34 | live_xlsx_tab |
| NOVIEMBRE 25 HN | live_hr | 24 | 34 | live_xlsx_tab |
| DICIEMBRE 25 | live_hr | 35 | 34 | live_xlsx_tab |
| DICIEMBRE 25 HN | live_hr | 11 | 34 | live_xlsx_tab |
| ENERO 26 | live_hr | 35 | 35 | live_xlsx_tab |
| ENERO 26 HN | live_hr | 11 | 35 | live_xlsx_tab |
| FEBRERO 26 | live_hr | 35 | 34 | live_xlsx_tab |
| FEBRERO 26 HN | live_hr | 11 | 34 | live_xlsx_tab |
| MARZO 26 | live_hr | 35 | 35 | live_xlsx_tab |
| MARZO 26 HN | live_hr | 11 | 35 | live_xlsx_tab |
| ABRIL 26 | live_hr | 35 | 35 | live_xlsx_tab |
| ABRIL 26 HN | live_hr | 11 | 35 | live_xlsx_tab |
| MAYO 26 | live_hr | 35 | 35 | live_xlsx_tab |
| MAYO 26 HN | live_hr | 11 | 35 | live_xlsx_tab |
| JUNIO 26 | live_hr | 36 | 35 | live_xlsx_tab |
| JUNIO 26 HN | live_hr | 12 | 35 | live_xlsx_tab |
| JULIO 26 | live_hr | 35 | 30 | live_xlsx_tab |
| JULIO 26 HN | live_hr | 11 | 30 | live_xlsx_tab |
| DASHBOARD | live_hr | 43 | 9 | live_xlsx_tab |
| DASHBOARD HN | live_hr | 15 | 1 | live_xlsx_tab |

## Lectura interpretada

La lectura multi-tab esta funcionando. El resultado ya no cae en fallback CSV de un solo `gid`; todos los tabs visibles aparecen como `live_xlsx_tab`.

Se detectan diferencias esperadas o de revision:

- `JUNIO 26` aparece con 36 filas.
- `JUNIO 26 HN` aparece con 12 filas.
- `JULIO 26` / `JULIO 26 HN` usan 30 columnas, distinto a meses previos.
- `DASHBOARD` y `DASHBOARD HN` son tabs informativos/resumen y no deben tratarse como visitas operativas.
- Meses 2025 HN aparecen con 24 filas, mientras meses 2026 HN aparecen con 11 o 12 filas; requiere clasificacion historica por etapa/pais.

## Issues reportados

El reporte mostro los siguientes issues:

| Codigo | Severidad | Fuente | Mensaje |
|---|---|---|---|
| questionnaire_marks_duplicate_postulations | critical | questionnaire_marks.csv | `questionnaire_marks.csv` equals `postulations.csv`; do not import as independent questionnaire source. |
| dpi_present_in_shoppers | critical | shoppers.csv | Sensitive DPI field present in shoppers.csv; exclude from sanitized preview and define encryption/drop policy. |
| liquidations_require_external_excel | warning | migration_liquidations_base_hr.csv | Liquidation candidates require external finance Excel crosscheck before final debt/payment import. |
| notification_recipients_unresolved | warning | notification_trace.csv | Notification recipients are not canonical yet; keep as history until resolved. |

## Dictamen

La lectura de HR viva/historico queda desbloqueada en modo preview multi-tab. Todavia NO queda autorizada la importacion.

El siguiente trabajo ya no es volver a probar lectura basica, sino convertir esta cobertura a staging canonico:

1. Clasificar tabs operativos vs tabs dashboard.
2. Normalizar periodos detectados.
3. Separar pais GT/HN.
4. Marcar meses preparacion/revision.
5. Mantener `JUNIO 26 HN` en revision.
6. Mantener liquidaciones como candidatas.
7. Mantener issues criticos como bloqueantes antes de escritura.

## Estado seguro

- Firestore writes: 0.
- Imports executed: 0.
- Deploy: 0.
- Produccion: 0.
- canImport: false.
