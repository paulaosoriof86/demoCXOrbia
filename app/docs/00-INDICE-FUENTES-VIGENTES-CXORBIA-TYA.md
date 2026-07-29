# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-07-29  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `CORTE3_PAYMENT_HISTORY_HOSTING_DEV_REMOTE_PASS_PENDING_PAULA_FINAL_VISUAL_NO_FREEZE_NO_PRODUCTION`

## 1. Repositorio

- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Base: `release/cxorbia-tya-rc-20260630`.
- Producción, nueva rama/PR, force push, merge, imports, ejecución de pagos y writes reales: prohibidos/no ejecutados.

## 2. Orden de lectura vigente

1. este índice;
2. reglas maestras vigentes;
3. addendum de empalme directo/carril file-aware;
4. addenda de Academia, patrones y antidesvío;
5. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
6. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
7. contratos, adapters y gates source-safe de HR, finanzas y pagos;
8. CAMBIOS, RESUMEN-PARA-CLAUDE, PENDIENTES, Academia y tracker vigentes;
9. PR #7 y HEAD vivo.

Las auditorías V175–V181 quedan solo como antecedentes HOLD. V182 es la candidata empalmada vigente. No V183 y no R33.

## 3. Baseline y operación

- V174/M1/Corte 1/Corte 2A: FROZEN/APROBADOS.
- V182: auditada GO y empalmada; commit funcional `e3cfe464fd80e5bd4ce273556cfd0021e22c0810`.
- 14 periodos / 616 visitas.
- 247 filas financieras / 209 vínculos exactos / 207 montos canónicos.
- 79 revisiones de vínculo / 2 revisiones de monto / 37 evidencias candidatas.
- 0 lotes ejecutables creados o importados.

## 4. Fuente vigente de histórico de pagos

Fuente privada read-only:

- SHA-256 `b8e753ade03286caf3ff19e119a9b21b4dde7d5bd21d61fba70ab32719afea89`;
- hoja `Liquidación May 26`;
- rango `A1:AB57`;
- Excel crudo y PII excluidos del repo.

Fuentes runtime vigentes:

- `backend/contracts/tya-payment-history-source-safe-v1.json`;
- `app/data/tya-payment-history-source-safe.js`;
- `app/adapters/tya-financial-canonical-source-safe-adapter.js`;
- `tools/qa/tya-payment-history-source-safe-gate.mjs`;
- `tools/release/tya-corte3-hosting-dev-build-r24.mjs`;
- `tools/qa/tya-corte3-remote-live-finance-smoke-r25-gate.mjs`;
- `tools/qa/tya-corte3-v174-runtime-preservation-r24-gate.mjs`.

## 5. Verdad canónica de pagos

### Mayo 2026

- 44 visitas / 44 pagadas / 0 pendientes.
- 42 vínculos exactos / 2 revisiones financieras preservadas.
- CxP GT Q0 / CxP HN L0.
- GT: honorarios Q2,040 + reembolsos Q5,448 = Q7,488 pagados.
- HN: honorarios L2,000 + reembolsos L3,861 = L5,861 pagados.

### Junio 2026

- 44 visitas / 2 pagadas / 42 pendientes.
- Pagadas únicamente `JUNIO 26!2` y `JUNIO 26!6`.
- GT pagado Q451 / HN pagado L0.
- Ningún pago adicional inferido.

Reglas prevalentes:

- revisión financiera y pago confirmado son estados independientes;
- pago pendiente no abre revisión financiera;
- pago confirmado no borra revisión financiera;
- grupos históricos son inmutables/no ejecutables;
- no se inventa `paymentBatchId`;
- GTQ y HNL no se suman.

## 6. Gates y Hosting DEV vigentes

- Gate local: `PASS_TYA_PAYMENT_HISTORY_SOURCE_SAFE_GATE`.
- Adapter harness: `PASS_PAYMENT_HISTORY_ADAPTER_HARNESS`.
- R24 fail-closed: `PASS_CORTE3_V174_RUNTIME_PRESERVATION_R24`.
- Request final: `7d314818e58c19e4332830d4c474ff3a6157b509`.
- Run `30416875149`, job final `90468374816`: SUCCESS.
- Hosting DEV: PASS.
- Live HR: `PASS_REMOTE_LIVE_HR_ENDPOINT`.
- Smoke: `PASS_TYA_CORTE3_REMOTE_LIVE_PAYMENT_HISTORY_SMOKE_R25`.
- Mayo remoto: 44 pagadas / 0 pendientes / CxP Q0-L0.
- Junio remoto: 2 pagadas / 42 pendientes / Q451-L0.
- Shopper identificado: Beneficios con pagos históricos visibles.
- Pagos ejecutados y lotes ejecutables: 0.

Hosting DEV:

`https://cxorbia-backend-dev.web.app/index.html?cxTyaPhaseA=1&r18d=visible&fresh=4`

## 7. Decisión vigente

- Corte 3: empalmado, corregido y desplegado en DEV con smoke remoto PASS.
- Todavía NO `ACTIVE_BASELINE` y NO FROZEN.
- Falta validación visual final de Paula y `APROBADO`.
- Corte 4 no inicia antes del freeze.

## 8. Claude/prototipo y Academia

- Claude: no V183; preservar contrato de pagos históricos; cualquier copy/frontend pendiente se corrige de forma localizada por archivo/módulo.
- Academia: diferenciar visita, liquidación, revisión financiera, pago confirmado y lote/grupo histórico; explicar precisión parcial de fecha y no ejecución de grupos históricos.

## 9. Pendientes no bloqueantes

- PDF imprime sin gráfica visible.
- Excel conserva formato básico.
- Mejora transversal de `reportKit`.

## 10. Siguiente bloque exacto

`VALIDACIÓN VISUAL FINAL PAULA → APROBADO → FREEZE CORTE 3 / ACTIVE_BASELINE → CORTE 4: CX.data READ-ONLY EN FIREBASE NUEVO Y VACÍO`.
