# CAMBIOS-BACKEND.md

## 2026-07-11 - Importadores source-safe operativos R4

- Se agregaron importadores separados para pagos/movimientos y certificaciones presentadas.
- Soportan JSON, CSV, XLSX y XLSM.
- Reutilizan el índice HR source-safe ya validado; no reconstruyen periodos, visitas ni shoppers.
- Pagos: match estable por `visitId`, `paymentItemId` o `hrRowId`; certificaciones: `shopperId` o `shopperCode`.
- No deduplican ni enlazan por nombre, semejanza visual o shopper+monto.
- Producen candidatos, `reviewQueue`, `auditEvents`, envelopes source-safe y reporte sin materialización.
- Se agregaron contratos, plantillas CSV, fixtures sanitizados, validador JSON/XLSX y workflow CI.
- Validación: 20 checks PASS; workflow `CXOrbia Phase A Source Safe Importers` success.
- La documentación detallada está en `app/docs/CAMBIOS-BACKEND-ADDENDUM-SOURCE-SAFE-IMPORTERS-R4-20260711.md`.
- Estado seguro: dry-run; sin import real, writes, deploy, proveedores, pagos ni producción.

## Archivo histórico preservado

Los registros acumulados anteriores continúan en el historial Git y en los addenda de `app/docs/`. Este encabezado R4 es la fuente vigente del bloque actual.
