# AUDITORÍA CANDIDATA CLAUDE — CORTE 1.2 REPORTES

Fecha: 2026-07-20
Decisión: `HOLD — P0_PROVEN — NO APLICAR`

## 1. Candidata auditada

- Archivo: `Prototype development request (11).zip`.
- SHA-256: `ccc216ccb6b1a666e8fb9ce423e0886c03d0687779a3cdbb985dd5a2e8523af0`.
- Baseline: V161C/R21.
- Rama objetivo: `docs-tya-v6-v71-audit`.
- HEAD remoto auditado: `67a73af9d568f01af0d2a740142e0bc9cd783103`.
- PR #7: draft/open/no merge.

Archivos únicos de la candidata:

- `app/modules/cliente-extra.js`;
- `app/index.html`;
- `app/vendor/pptxgenjs.min.js`;
- `app/REPORTE-DE-CAMBIOS.md`.

## 2. Controles que sí pasaron

- ZIP exacto y extraíble.
- Alcance de archivos coincide con los permitidos.
- `node --check` PASS en `cliente-extra.js` y `pptxgenjs.min.js`.
- UTF-8 sin BOM.
- `index.html` conserva `<meta charset="UTF-8">`.
- Asset PPTX local cargado sin CDN PPTX remoto.
- No se encontraron secretos ni PII agregada.
- Los archivos protegidos no están dentro del ZIP.
- El gate estático anterior dio `PASS_CORTE1_REPORT_FRONTEND_CONSUMER`.

## 3. P0 reproducible

La candidata no consume la forma real y ya aprobada de `window.CX_TYA_CORTE1_REPORTS`.

### Contrato real vigente

La proyección de build schema `1.1.0` expone:

- `periods`: arreglo de claves de periodo como `"2026-07"`;
- `rows`: filas por periodo/país;
- `branchRows`: filas por periodo/país/sucursal;
- `catalog`: matriz de capacidades;
- métodos `filter(scope, level)` y `report(reportId, scope)`.

No expone `periods[].branches`, `entry.history`, `byPeriod`, scores, NPS ni región.

### Forma asumida por la candidata

La candidata declara que el contrato no estaba publicado y supone:

- `periods[].branches`;
- `entry.history`;
- `byPeriod[p.id]`;
- filas con `score`, `nps` y `region`;
- coincidencia de `periodKey` contra `CX.data.period().id`.

Ese supuesto contradice los dos contratos entregados en el paquete Claude y la proyección técnica aprobada antes de solicitar la candidata.

## 4. Prueba semántica con la proyección real

Se ejecutó el módulo candidato contra la evidencia exacta del run Corte 1 `29727050055` / artifact `8454684849`:

- schema: `1.1.0`;
- periodos: 14;
- visitas: 616;
- filas periodo/país: 28;
- filas sucursal: 308;
- países: GT/HN;
- cuatro reportes marcados disponibles por contrato.

Resultado de la candidata:

- reportes disponibles esperados: 4;
- reportes disponibles observados: 1;
- tres reportes válidos aparecen falsamente como `Sin datos para este periodo y alcance`;
- botones habilitados esperados: 12;
- botones habilitados observados: 3;
- botones deshabilitados esperados: 9;
- botones deshabilitados observados: 18;
- selector de país esperado para Director: presente;
- selector de país observado: ausente.

## 5. Exportación falsa reproducible

El único reporte que la candidata habilita con la forma real es `period_trend`, porque interpreta el arreglo de strings `periods` como registros históricos.

Al ejecutar Excel:

- archivo generado: `tendencia-operativa-por-periodo_cinepolis_jul-2026_2026-07-20.xlsx`;
- filas exportadas: 14;
- filas con contenido real: 0;
- columnas: Periodo, Score, Visitas y NPS;
- las 14 filas quedan completamente vacías.

La candidata, por tanto, puede mostrar éxito y descargar un archivo real pero sin datos, incumpliendo el requisito de exportación honesta.

## 6. Claims incompatibles

La candidata intenta calcular o mostrar:

- score por sucursal;
- NPS;
- score promedio por país;
- región;
- tendencia de score/NPS.

La fuente actual solo soporta métricas operativas:

- visitas;
- asignadas/no asignadas;
- realizadas;
- cuestionario;
- submitidas;
- pago confirmado.

Scorecard, planes de acción y brechas permanecen `pending_source`.

## 7. Diagnóstico de causa raíz

Claude no consumió los contratos incluidos en el paquete. En `REPORTE-DE-CAMBIOS.md` afirma que el esquema no estaba publicado y que el gate no existía en su entorno, pese a que ambos fueron entregados como fuentes obligatorias.

El gate anterior era demasiado superficial: comprobaba presencia de cadenas y librerías, pero no ejecutaba el módulo contra la forma real de la proyección. Por eso podía dar PASS a una implementación semánticamente incompatible.

## 8. Corrección de raíz aplicada en tooling

Se endureció:

`tools/qa/tya-corte1-report-frontend-consumer-acceptance.mjs`

Commit: `426c053ab0ca60bfbad6de139f571ed0cb608b17`.

El gate ahora:

- bloquea formas inventadas `periods[].branches`, `byPeriod`, score/NPS/región;
- exige usar `report()` y `filter()`;
- ejecuta el módulo en VM contra fixture schema 1.1.0;
- exige cuatro reportes disponibles;
- exige 12 botones habilitados y 9 deshabilitados;
- exige filtro país para Director;
- detecta uso de `p.id` en lugar de `periodKey`.

## 9. Decisión

`P0_PROVEN` porque la candidata rompe el consumidor esencial del Corte 1 y genera una exportación vacía presentada como exitosa.

No se permite:

- aplicar el delta;
- commit/push de archivos de la candidata;
- usar Codex para empalmar;
- Hosting DEV;
- merge o producción.

## 10. Corrección requerida a Claude

No se requiere candidata general. Se requiere una única corrección incremental sobre el mismo alcance:

- `app/modules/cliente-extra.js`;
- `app/index.html` solo si conserva el vendor local;
- `app/vendor/pptxgenjs.min.js`;
- `app/REPORTE-DE-CAMBIOS.md`.

La corrección debe consumir la API real:

- `projection.report(reportId, scope)`;
- `projection.filter(scope, level)`;
- `periodKey = CX.data.period().periodKey`;
- `branchName` para alcance sucursal;
- métricas operativas, sin score/NPS/región;
- catálogo `available/pending_source` como única verdad.

Estado seguro: baseline V161C intacta, sin deploy, merge, producción, importaciones o escrituras reales.
