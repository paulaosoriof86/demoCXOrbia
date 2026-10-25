# RESUMEN PARA CLAUDE — liquidaciones/pagos/certificaciones R3

Backend ya entrega:

- liquidación separada de pago;
- `paymentState` independiente;
- `amountStatus` y campos faltantes;
- bloqueo de pago source-safe;
- carryover `pending_source`/`carried_over`;
- reviewQueue con llaves estables.

Pendientes frontend concretos:

1. `core/liquidacion.js` genérico no debe mapear `liquidada` a `pagada`.
2. `modules/finanzas.js` y `modules/beneficios.js` deben mostrar `paymentState`, `amountStatus` y `pending_financial_source`.
3. El botón Pagar lote debe respetar `loteEligible` y el gate backend.
4. `modules/cert.js` debe consultar carryover confirmado antes de pedir certificación y nunca habilitar por `approved_preview` o `pending_backend`.
5. Mostrar 4 registros de junio con quincena faltante como revisión, no inferirlos silenciosamente.
6. Mostrar que hasta mayo existe claim histórico pagado pendiente de match, evitando re-pagar.

No reimplementar IDs, cálculos o reviewQueue en UI; consumir el adapter.
