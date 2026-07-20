# RESUMEN PARA CLAUDE — V161C BASELINE Y CORTE 1 REPORTES

Fecha: 2026-07-20
Estado: `CORTE_1_FRONTEND_CONSUMER_PENDING`

## Baseline

- V161C/R21 es `ACTIVE_BASELINE`.
- No reauditar ni pedir nueva candidata general.
- Cada corte termina con revisión visual de Paula antes del freeze.

## Backend Corte 1 listo

- Contrato: `backend/contracts/phase-a-corte1-context-history-reports-v1.json`.
- Proyección de build: `CX_TYA_CORTE1_REPORTS`.
- 14 periodos, 616 visitas y 28 filas periodo/país.
- JSON/CSV source-safe filtrables por periodo y país.
- 0 PII y 0 pagos inferidos.
- Gate fuente y gate navegador sin blockers.

## Ajuste frontend localizado

Archivo: `app/modules/cliente-extra.js`.
Módulo: `cli_reportes`.

Los botones PDF, Excel y PPT todavía muestran toast demo. Deben consumir exclusivamente la proyección aprobada y respetar tenant, proyecto, periodo, país y alcance del rol.

Requisitos:

- cambiar periodo cambia KPI, filas, detalle y exportación;
- histórico excluye por defecto el periodo activo;
- sin dato mostrar `Pendiente de fuente`;
- no inventar scores, pagos ni métricas;
- no tocar `app/core/data.js`, `app/core/store.js` ni contratos R20/R21.

## Certificaciones y recursos

- Certificaciones: Corte 2 funcional, Corte 6 permisos, Corte 7 sincronización/preservación.
- Recursos: catálogo/contexto Corte 1, entrega contextual Corte 2, permisos Corte 6, carga protegida/versionado Corte 7.

No modificar todavía certificaciones o recursos fuera del contrato del corte correspondiente.
