# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-07-29  
**Estado:** `CORTE3_PAYMENT_HISTORY_HOSTING_DEV_REMOTE_PASS_PENDING_PAULA_FINAL_VISUAL_NO_FREEZE_NO_PRODUCTION`

## 1. Repositorio y seguridad

- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama viva: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Base: `release/cxorbia-tya-rc-20260630`.
- Producción, merge, imports, pagos ejecutados y Firestore/Auth/Storage/HR writes: 0.
- Hosting DEV fue desplegado; Cloud Run no fue redeployado.

## 2. Baseline y V182

- V174/M1/Corte 1/Corte 2A: FROZEN/APROBADOS.
- V182: auditada GO y empalmada sobre V174.
- Commit funcional V182: `e3cfe464fd80e5bd4ce273556cfd0021e22c0810`.
- Delta V182: `app/app.js`, `app/core/finanzas-core.js`, `app/modules/beneficios.js`, `app/modules/finanzas.js`, `app/styles/layout.css`.
- Identidad agregada V182: `62d85bace9276070bfc642df31da74abd684ab072f155eed3895c6e3926c57c9`.
- R26–R32 post-apply: 135/135 PASS.
- No V183. No R33.

## 3. Fuente operacional y financiera preservada

- 14 periodos / 616 visitas.
- 247 filas financieras.
- 209 vínculos exactos.
- 207 montos canónicos.
- 38 sin vínculo exacto.
- 79 revisiones de vínculo.
- 2 revisiones de monto.
- 37 evidencias candidatas.
- 0 lotes ejecutables importados o creados.

## 4. P0 corregido — histórico de pagos omitido

La validación visual de Paula demostró que el runtime anterior omitía pagos históricos: forzaba `paymentConfirmed=false`, `payments=[]` y `batches=[]`, aunque la fuente real confirma mayo completo y junio parcial.

Fuente exacta procesada read-only:

- archivo: `2026 Ingresos Egresos y Presupuesto Paula.xlsx`;
- SHA-256: `b8e753ade03286caf3ff19e119a9b21b4dde7d5bd21d61fba70ab32719afea89`;
- hoja: `Liquidación May 26`;
- rango fuente: `A1:AB57`;
- Excel crudo y PII: no subidos al repo.

## 5. Verdad de pagos vigente

### Mayo 2026

- 44 visitas.
- 44 pagos históricamente confirmados.
- 0 pendientes de pago.
- 42 vínculos financieros exactos.
- 2 revisiones financieras preservadas; revisión financiera y pago confirmado coexisten.
- CxP GT: Q 0.
- CxP HN: L 0.
- GT source-safe: honorarios Q 2,040; reembolsos Q 5,448; total pagado Q 7,488.
- HN source-safe: honorarios L 2,000; reembolsos L 3,861; total pagado L 5,861.

### Junio 2026

- 44 visitas.
- 2 pagos confirmados.
- 42 pendientes.
- Identidades pagadas exactas: `JUNIO 26!2` y `JUNIO 26!6`.
- Pagado GT: Q 451.
- Pagado HN: L 0.
- Ninguna fila adicional fue inferida como pagada.

## 6. Implementación source-safe

- Contrato: `backend/contracts/tya-payment-history-source-safe-v1.json`.
- Proyección: `app/data/tya-payment-history-source-safe.js`.
- Adapter único: `app/adapters/tya-financial-canonical-source-safe-adapter.js`.
- Gate funcional: `tools/qa/tya-payment-history-source-safe-gate.mjs`; no es R33.
- Builder Hosting DEV actualizado para cargar snapshot financiero → histórico de pagos → adapter.
- R24 fail-closed actualizado con identidades exactas, sin comodines.
- Dos grupos históricos inmutables/no ejecutables.
- `paymentBatchId` real no fue inventado.
- `paymentExecutionAllowed=false`.
- Dashboard, Movimientos, Liquidaciones, Lotes y Beneficios consumen la misma verdad mediante `CX.data`/`CX.liq`.
- Módulos UI no fueron reescritos en este bloque.

## 7. Gates y Hosting DEV

- Gate local de histórico: `PASS_TYA_PAYMENT_HISTORY_SOURCE_SAFE_GATE`.
- Adapter harness local: `PASS_PAYMENT_HISTORY_ADAPTER_HARNESS`.
- R24 remoto: `PASS_CORTE3_V174_RUNTIME_PRESERVATION_R24`.
- Request final Hosting DEV: `7d314818e58c19e4332830d4c474ff3a6157b509`.
- Workflow/run: `30416875149`.
- Job final: `90468374816` — SUCCESS.
- Deploy Hosting DEV: PASS.
- Live HR endpoint: `PASS_REMOTE_LIVE_HR_ENDPOINT`.
- Smoke remoto: `PASS_TYA_CORTE3_REMOTE_LIVE_PAYMENT_HISTORY_SMOKE_R25`.
- Mayo remoto: 44 pagadas / 0 pendientes / 2 reviews preservadas / CxP Q0-L0.
- Junio remoto: 2 pagadas / 42 pendientes / IDs exactos / Q451-L0.
- Shopper identificado: Beneficios con pagos históricos visibles.
- Pagos ejecutados: 0.
- Lotes ejecutables creados: 0.

## 8. Hosting DEV vigente

`https://cxorbia-backend-dev.web.app/index.html?cxTyaPhaseA=1&r18d=visible&fresh=4`

## 9. Estado Phase A

- M1 / Corte 1 / Corte 2A: FROZEN/APROBADOS.
- Corte 3: V182 empalmada + fixes focales + histórico de pagos + Hosting DEV + smoke remoto PASS.
- Corte 3 todavía NO está FROZEN/ACTIVE_BASELINE: falta validación visual final de Paula y `APROBADO`.
- Corte 4 no inicia antes del freeze.

## 10. Validación visual final mínima

1. Mayo, Liquidaciones: 44 pagadas, 0 pendientes, 2 revisiones financieras preservadas.
2. Mayo, Movimientos: CxP Q0 y L0.
3. Junio: 2 pagadas, 42 pendientes; Q451 pagado GT y L0 HN.
4. Shopper identificado: Beneficios muestra registros pagados sin revelar otra identidad.
5. Móvil: navegación básica sin regresión.

PDF sin gráfica y Excel con formato básico permanecen P2 transversal no bloqueante.

## 11. Claude/prototipo y Academia

- Claude: no V183; preservar histórico source-safe y separar revisión financiera, pago confirmado y lote. El copy estático que todavía asuma “0 pagos” se documenta por archivo/módulo para futura corrección frontend localizada.
- Academia: explicar visita → liquidación → revisión → pago confirmado → grupo histórico/lote; precisión de fecha `source_day_only`; grupos históricos inmutables/no ejecutables.

## 12. Siguiente bloque exacto

`VALIDACIÓN VISUAL FINAL PAULA → APROBADO → FREEZE CORTE 3 / ACTIVE_BASELINE → CORTE 4: CX.data READ-ONLY EN FIREBASE NUEVO Y VACÍO`.

## 13. Estado seguro

Sin producción, merge, Firestore/Auth/Storage/HR writes, imports, ejecución de pagos, lotes reales, Make ni Gemini live.
