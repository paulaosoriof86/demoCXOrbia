# CAMBIOS BACKEND — Corte 3 histórico de pagos source-safe — 2026-07-29

## Estado

`PAYMENT_HISTORY_HOSTING_DEV_REMOTE_PASS_PENDING_PAULA_FINAL_VISUAL`

## Causa raíz

El runtime financiero canónico preservaba liquidaciones y revisiones, pero omitía la fuente histórica de pagos al exponer `paymentConfirmed=false`, `payments=[]` y `batches=[]`. La validación visual confirmó que mayo debía estar completamente pagado y junio parcialmente pagado.

## Fuente privada procesada

- SHA-256: `b8e753ade03286caf3ff19e119a9b21b4dde7d5bd21d61fba70ab32719afea89`.
- Hoja: `Liquidación May 26`.
- Rango: `A1:AB57`.
- Lectura: read-only.
- Excel crudo, nombres y datos bancarios: excluidos del repo.

## Archivos creados

- `backend/contracts/tya-payment-history-source-safe-v1.json` — contrato reusable de histórico read-only, grupos inmutables/no ejecutables y llaves estables.
- `app/data/tya-payment-history-source-safe.js` — proyección source-safe de mayo completo y junio parcial.
- `tools/qa/tya-payment-history-source-safe-gate.mjs` — gate funcional de fuente, identidad, totales, no PII y cero lotes ejecutables; no es R33.

## Archivos modificados

- `app/adapters/tya-financial-canonical-source-safe-adapter.js` — aplica una sola verdad de pago a Dashboard, Movimientos, Liquidaciones, Lotes y Beneficios; preserva revisión financiera independiente.
- `app/index-backend-dev.html` — carga el overlay source-safe antes del adapter.
- `tools/release/tya-corte3-hosting-dev-build-r24.mjs` — incorpora el overlay de pagos al build efímero de Hosting DEV.
- `tools/qa/tya-corte3-remote-live-finance-smoke-r25-gate.mjs` — valida mayo completo y junio parcial en remoto.
- `tools/qa/tya-corte3-v174-runtime-preservation-r24-gate.mjs` — bloquea las nuevas identidades exactas sin comodines.
- `backend/config/phase-a-live-hr-runtime-deploy-request-v1.json` — request Hosting DEV controlado.
- checkpoint, índice y plan Phase A vigentes.

## Resultado

Mayo:

- 44 pagadas / 0 pendientes;
- 42 exactas / 2 revisiones preservadas;
- CxP GT Q0 / HN L0;
- GT pagado Q7,488 / HN pagado L5,861.

Junio:

- 2 pagadas / 42 pendientes;
- IDs exactos `JUNIO 26!2` y `JUNIO 26!6`;
- GT pagado Q451 / HN L0.

## Gates

- `PASS_TYA_PAYMENT_HISTORY_SOURCE_SAFE_GATE`.
- `PASS_PAYMENT_HISTORY_ADAPTER_HARNESS`.
- `PASS_CORTE3_V174_RUNTIME_PRESERVATION_R24`.
- `PASS_REMOTE_LIVE_HR_ENDPOINT`.
- `PASS_TYA_CORTE3_REMOTE_LIVE_PAYMENT_HISTORY_SMOKE_R25`.
- Run `30416875149`, job final `90468374816`: SUCCESS.

## Clasificación

- **Reusable CXOrbia:** histórico separado de liquidación/lote; revisión y pago independientes; precisión parcial de fecha; grupos inmutables/no ejecutables.
- **Exclusivo TyA:** mayo 2026 completo, junio 2026 parcial, GT/HN y mapeo HR.
- **Claude/prototipo:** no V183; preservar contrato y corregir solo copy/frontend localizado si aún supone cero pagos.
- **Academia:** explicar la cadena visita → liquidación → revisión → pago → grupo/lote.
- **Sin impacto Claude:** contrato, proyección, gates, builder y adapter backend source-safe.

## Estado seguro

Sin producción, merge, writes reales, imports, ejecución de pagos, lotes reales, Make ni Gemini.
