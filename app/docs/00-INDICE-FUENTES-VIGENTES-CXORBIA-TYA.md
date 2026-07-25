# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-07-25  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `V174_ACTIVE_BASELINE_V181_AUDITED_P0_PROVEN_HOLD_V182_REQUIRED_NO_FREEZE_NO_PRODUCTION`

## 1. Repositorio

- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Base: `release/cxorbia-tya-rc-20260630`.
- Nueva rama/PR, `main`, force push, producción, merge, imports, pagos y writes: prohibidos/no ejecutados.

## 2. Lectura obligatoria vigente

1. este índice;
2. reglas maestras vigentes;
3. addendum de empalme directo/carril file-aware;
4. addenda de Academia, patrones y antidesvío;
5. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
6. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
7. validación visual V174 aprobada;
8. reconciliación/canonical finance Corte 3 R20/R23;
9. validación visual Corte 3 HOLD;
10. auditorías V175–V180 como antecedentes;
11. `app/docs/AUDITORIA-V181-CORTE3-P0-PROVEN-HOLD-20260725.md`;
12. `app/docs/RESUMEN-PARA-CLAUDE-ADDENDUM-V181-P0-HOLD-20260725.md`;
13. CAMBIOS/PENDIENTES/ACADEMIA/tracker V181;
14. gates R26, R27, R28, R29, R30, R31 y R32 vigente;
15. manifest/source lock, PR #7 y HEAD vivo.

## 3. Baseline y verdad canónica

- V174/M1/Corte 1/Corte 2A: aprobados.
- Source lock: `d057d77c9117d9d451cfc9a6563083b78b926d57`.
- 14 periodos y 616 visitas.
- 247 filas financieras, 209 vínculos y 207 montos.
- 0 pagos y 0 lotes.
- Mayo: 44 visitas, 42 exactas, 2 revisiones, 32 GT y 10 HN.

## 4. Estado de candidatas

- V175: HOLD R26/R27.
- V176: HOLD R26–R28.
- V177: HOLD R29.
- V178: HOLD R30.
- V179: HOLD R31.
- V180: HOLD R32.
- V181: manifest/sintaxis y R26–R31 PASS; R32 vigente HOLD 23/25; no aplicada.

Delta real V181:

- cambia core;
- cambia Finanzas;
- cambia Beneficios;
- `app.js` y `layout.css` son idénticos a V180.

P0 V181:

- Lotes usa `PENDING_CURRENCY` fuera del scope donde fue declarado;
- Liquidaciones/CxP histórica usa `currencyOf` fuera del scope donde fue declarado;
- ambos producen `ReferenceError` runtime.

## 5. Límite final

R32 continúa siendo el cierre consolidado de fuente y ahora incluye un harness runtime de módulos. No se creó R33.

Cuando R26–R32 vigentes pasen, debe ejecutarse `APPLY_DELTA_DIRECTLY`. Conteos TyA, móvil, host y PDF/XLSX son post-apply y no originan R33 por sí solos.

## 6. Decisión

- Baseline: V174.
- V175–V181 no aplicadas.
- Corte 3: HOLD.
- Freeze: prohibido.
- Corte 4: no iniciar.
- V182 requerida.

## 7. Siguiente bloque

`V182 → EXECUTION_LANE_READY → R26–R32 VIGENTES → APPLY_DELTA_DIRECTLY SI GO → HOSTING DEV → TYA/MÓVIL/HOST/PDF/XLSX → APROBADO → FREEZE CORTE 3`.
