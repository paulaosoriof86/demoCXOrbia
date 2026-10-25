# RESUMEN PARA CLAUDE — CORRECCIÓN CORTE 1.2

Fecha: 2026-07-20
Estado: `CORRECTION_REQUIRED`

La candidata `Prototype development request (11).zip` no se aplicó.

Problema:
- supuso `periods[].branches`, `byPeriod`, score, NPS y región;
- comparó periodo contra `p.id`;
- no usó `projection.report()` ni `projection.filter()`.

La proyección real schema 1.1.0 expone:
- `periods` como claves string;
- `rows`;
- `branchRows`;
- `catalog`;
- `filter(scope, level)`;
- `report(reportId, scope)`.

Corrección requerida:
- usar `CX.data.period().periodKey`;
- usar `branchName` para sucursal;
- usar solo visitas, asignadas, no asignadas, realizadas, cuestionario, submitidas y pago confirmado;
- no usar score, NPS o región;
- usar `catalog` para disponible/pendiente de fuente;
- conservar PDF, XLSX y PPTX desde las mismas filas;
- mostrar una etiqueta humana de fuente segura.

Gate obligatorio actualizado:
`node tools/qa/tya-corte1-report-frontend-consumer-acceptance.mjs`

No tocar core, backend, adapters, HR, finanzas, certificaciones o recursos.
