# RESUMEN PARA CLAUDE — ADDENDUM CORTE 3 FINANZAS CANÓNICAS R23

Fecha: 2026-07-23

## Backend conectado en DEV

- Snapshot financiero source-safe canónico, serializado en chunks determinísticos de build.
- Adapter único de liquidaciones para Finanzas y Beneficios.
- Separación obligatoria de honorario, boleto, combo/reembolso, total, moneda, liquidación y pago.
- Pago siempre fail-closed: cero pagos confirmados.
- 2 vínculos exactos con inconsistencia de monto enviados a revisión.

## Claude no debe tocar ahora

- familia `app/data/tya-financial-canonical-source-safe*.js`.
- `app/adapters/tya-financial-canonical-source-safe-adapter.js`.
- llaves `visitId`, `hrRowId`, `paymentItemId`.
- estados de pago o conciliación definidos por backend.

## Próxima revisión frontend

Solo después de los gates UI/exportaciones se localizarán diferencias reproducibles por archivo/módulo. No pedir nueva candidata por rutina.

## Academia

Actualizar contenidos para explicar:

- liquidación no equivale a pago;
- vínculo exacto no garantiza consistencia de monto;
- honorario, boleto y combo son componentes separados;
- total conflictivo requiere revisión humana;
- `pending_source_confirmation` no es pagado.
