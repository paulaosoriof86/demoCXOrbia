# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-07-23  
**Estado:** `V174_ACTIVE_BASELINE_CORTE3_FINANCIAL_RECONCILIATION_R20_RUNNER_READY_PENDING_EXECUTION_NO_PRODUCTION`

## 1. Repositorio y seguridad

- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama obligatoria: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Base: `release/cxorbia-tya-rc-20260630`.
- No nueva rama, PR, `main` ni force push.
- Producción, merge, imports, pagos y writes reales: no ejecutados.

## 2. V174 congelada como baseline activa

- Package SHA-256: `e48452a4385e5dd2647437c04fdae47c9887e97af7b5a8de97d4f8ce522e2b2f`.
- Commit funcional V174: `b21e494d127fb4b902de5576e3fab0292362b097`.
- Corrección focalizada V174: `0acdc6772f2d4a7743dea0992a4279241dcb79d7`.
- Source-lock final: `d057d77c9117d9d451cfc9a6563083b78b926d57`.
- Aggregate: `ab11bc47dfd096cbe6a110db250c46e656c2dc9760ad832c07958b6c9a886818`.
- Backend, adapters live, contratos operativos, overlays y `CX.data`: preservados.

## 3. Cierre M1/Corte 1/Corte 2A

- Gates técnicos: PASS.
- Validación visual de Paula: APROBADA.
- Hosting DEV: vigente.
- HR viva: 14 periodos, 616 visitas y 34 GT/10 HN por periodo.

## 4. Hallazgos P1/P2 aceptados

- P1: responsive parcial en algunas tablas y fichas.
- P1: PDF sin gráficas.
- P2: Excel sin formato operativo suficiente.
- P2: `sourceAccessMode` conserva una etiqueta técnica anterior.

No bloquean la baseline ni reabren V174. Quedan para delta incremental posterior de UX/exportaciones.

## 5. Corte 3 Finanzas

Fuentes recuperadas e inventariadas:

- `app/data/tya-financial-control-source-safe.js`;
- `backend/contracts/phase-a-liquidation-payment-control-v1.json`;
- `backend/config/phase-a-financial-workbook-source-safe-r14.json`;
- `backend/config/phase-a-financial-live-hr-reconciliation-r14c.source-safe.json`;
- `backend/config/phase-a-financial-review-queue-r14c.source-safe.json`;
- `backend/config/phase-a-ledger-payment-evidence-candidates-r14c.source-safe.json`.

Baseline R14C:

- 247 filas financieras;
- 196 enlaces exactos;
- 51 filas a revisión;
- 92 entradas en review queue;
- junio con cero enlaces exactos aceptados;
- pagos y lotes importados: 0.

## 6. Reglas activas

- `liquidada` no equivale a `paid`.
- realizada, cuestionario o submitido no prueban pago.
- pago exige lote, fecha, fuente, confirmación y referencia de auditoría.
- cruces por llaves estables; nunca solo por nombre.
- conflictos a revisión humana.
- datos bancarios crudos fuera del repo.

## 7. Carril técnico preparado

Archivos creados o actualizados:

- `tools/qa/tya-corte3-financial-reconciliation-r20-gate.mjs`;
- `tools/release/cxorbia-readonly-post-gates-runner.mjs`;
- `tools/qa/cxorbia-controlled-runners-contract-gate.mjs`;
- `.github/workflows/cxorbia-readonly-post-gates-runner.yml`;
- `backend/contracts/cxorbia-controlled-runners-v1.json`;
- addendum prevalente vigente.

Perfil: `CORTE3_FINANCIAL_RECONCILIATION_R20`.

Comportamiento:

- regenera conciliación contra HR R20 actual en entorno efímero;
- compara conteos y llaves contra R14C baseline;
- bloquea pérdida/cambio de enlaces aceptados;
- envía todo enlace nuevo o cambio de estado a revisión humana;
- no instala navegador para este perfil;
- cero import, pago, deploy, producción o writes.

## 8. Siguiente paso exacto

`ACTIVAR REQUEST LIGADO AL HEAD EXACTO → EJECUTAR PERFIL CORTE3 → LEER ARTIFACT Y DELTA → PASS ESTABLE O HOLD FOCALIZADO DE REVISIÓN HUMANA`.

## 9. Clasificación

- **Reusable CXOrbia:** perfil financiero fail-closed, comparación de identidad y review queue.
- **Exclusivo cliente:** cobertura financiera TyA/Cinépolis y cortes mayo-junio.
- **Claude/prototipo:** sin cambios frontend; responsive/PDF/Excel siguen documentados.
- **Academia:** separación entre liquidación, evidencia y pago confirmado.
- **Sin impacto Claude:** runner, gate, contrato, artifacts, índice y checkpoint.

## 10. Estado seguro

Sin merge, deploy productivo, producción, import real, Firestore/Auth/Storage/HR writes, Make/Gemini live ni pagos.
