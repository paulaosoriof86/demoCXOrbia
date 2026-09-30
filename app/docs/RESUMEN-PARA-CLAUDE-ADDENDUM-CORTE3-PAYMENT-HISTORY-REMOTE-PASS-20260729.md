# RESUMEN PARA CLAUDE — Corte 3 histórico de pagos — 2026-07-29

## Estado backend vigente

`PAYMENT_HISTORY_HOSTING_DEV_REMOTE_PASS_PENDING_PAULA_FINAL_VISUAL`

V182 permanece empalmada. No preparar V183 ni R33.

## Verdad que el frontend debe preservar

- Mayo 2026: 44 pagadas, 0 pendientes, 2 revisiones financieras preservadas, CxP Q0/L0.
- Junio 2026: 2 pagadas (`JUNIO 26!2`, `JUNIO 26!6`), 42 pendientes, Q451 pagado GT y L0 HN.
- Revisión financiera y pago confirmado son independientes.
- Pago pendiente no significa revisión financiera.
- Pago confirmado no elimina una revisión financiera.
- Un grupo histórico no es un lote ejecutable.
- No sumar GTQ y HNL.

## Contratos/backend conectados

- `backend/contracts/tya-payment-history-source-safe-v1.json`.
- `app/data/tya-payment-history-source-safe.js`.
- `app/adapters/tya-financial-canonical-source-safe-adapter.js`.

Dashboard, Movimientos, Liquidaciones, Lotes y Beneficios consumen una sola verdad por `CX.data`/`CX.liq`.

## No tocar desde candidata frontend

- contrato y proyección de pagos;
- adapter financiero canónico;
- gates R24/R25 y gate de histórico;
- backend/HR/CX.data;
- grupos históricos y llaves `visitId/hrRowId`;
- reglas de no ejecución.

## Ajustes frontend documentados, no bloqueantes

1. Revisar cualquier copy estático que todavía diga “0 pagos confirmados” o “sin fuente” sin distinguir fuente financiera, fuente de pago, presupuesto o reintegro.
2. PDF: gráfica no visible al imprimir.
3. Excel: formato básico.
4. Tratar reportes transversalmente mediante `reportKit`, no con fixes aislados por módulo.

## Validación esperada

No modificar estados para que “se vean bien”. La UI debe leer:

- `paymentConfirmed`;
- `paymentState`;
- `paymentSourceRef`;
- `historicalPaymentGroupId`;
- `financialReviewRequired`;
- `paymentExecutionAllowed=false`.

Cualquier diferencia futura debe ser reproducible y localizada por archivo/módulo. No reabrir reglas HR o de pagos.
