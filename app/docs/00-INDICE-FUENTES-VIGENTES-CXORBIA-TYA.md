# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-07-26  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `V174_ACTIVE_BASELINE_V182_AUDITED_GO_APPLY_LANE_PENDING_NO_FREEZE_NO_PRODUCTION`

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
9. auditorías V175–V181 como antecedentes;
10. `app/docs/AUDITORIA-V182-CORTE3-GO-APPLY-LANE-PENDING-20260726.md`;
11. `app/docs/RESUMEN-PARA-CLAUDE-ADDENDUM-V182-SOURCE-GO-20260726.md`;
12. CAMBIOS/PENDIENTES/ACADEMIA/tracker V182;
13. gates R26–R32 vigentes;
14. manifest/source lock, PR #7 y HEAD vivo.

## 3. Baseline y verdad canónica

- V174/M1/Corte 1/Corte 2A: aprobados.
- Source lock: `d057d77c9117d9d451cfc9a6563083b78b926d57`.
- 14 periodos y 616 visitas.
- 247 filas financieras, 209 vínculos y 207 montos.
- 0 pagos y 0 lotes.
- Mayo: 44 visitas, 42 exactas, 2 revisiones, 32 GT y 10 HN.

## 4. Estado de candidatas

- V175–V181: HOLD documentado; ninguna aplicada.
- V182: manifest/hashes/UTF-8/sintaxis/CSS/secretos PASS.
- V182 runtime: Lotes PASS; CxP histórica PASS.
- V182 R26–R32 vigentes: 135/135 PASS.
- V182: `AUDITED_GO`, P0 de fuente 0.
- No V183.
- No R33.

Delta V181→V182:

- cambia solo `app/modules/finanzas.js`.

Empalme acumulado V174→V182:

- `app/app.js`;
- `app/core/finanzas-core.js`;
- `app/modules/beneficios.js`;
- `app/modules/finanzas.js`;
- `app/styles/layout.css`.

## 5. Límite final

R32 es el cierre de fuente. TyA, móvil, host y PDF/XLSX son post-apply y no originan V183/R33 por sí solos.

## 6. Aplicación

Estado: `AUDITED_GO_APPLY_LANE_PENDING`.

- método autorizado: checkout Git autenticado o `CXORBIA_ATOMIC_APPLY_RUNNER`;
- blobs exactos disponibles: core y Beneficios;
- blobs grandes pendientes de transferencia exacta: app.js, finanzas.js y layout.css;
- no aplicación parcial ni método alterno.

## 7. Decisión

- Baseline viva: V174.
- V182 cerrada como source-GO.
- Corte 3 todavía no frozen.
- Corte 4 no inicia.
- No producción, merge, pagos, imports ni writes.

## 8. Siguiente bloque

`COMPLETAR BLOBS → CXORBIA_ATOMIC_APPLY_RUNNER → COMMIT FUNCIONAL → R26–R32 POST-APPLY → HOSTING DEV → TYA/MÓVIL/HOST/PDF/XLSX → APROBADO → FREEZE CORTE 3`.

---

## Actualizacion vigente 2026-07-28 - V182 empalmada

**Estado vigente:** `V182_EMPALMED_PENDING_VISUAL_NO_FREEZE_NO_PRODUCTION`.

V182 fue empalmada funcionalmente mediante checkout Git autenticado/file-aware sobre `docs-tya-v6-v71-audit`.

- HEAD_BEFORE: `2a4f93ecb8e5d309363cd7968f72947a61e2b754`.
- Commit funcional: `e3cfe464fd80e5bd4ce273556cfd0021e22c0810`.
- HEAD_AFTER remoto: `e3cfe464fd80e5bd4ce273556cfd0021e22c0810`.
- Archivos aplicados: `app/app.js`, `app/core/finanzas-core.js`, `app/modules/beneficios.js`, `app/modules/finanzas.js`, `app/styles/layout.css`.
- Identidad funcional: 5/5 SHA-256, 5/5 Git blob SHA y agregado `62d85bace9276070bfc642df31da74abd684ab072f155eed3895c6e3926c57c9` PASS.
- ZIP disponible clasificado como `ZIP_CONTAINER_REPACKAGED`.
- R26-R32 post-apply: 135/135 PASS.
- Lotes runtime: PASS.
- CxP historica runtime: PASS.
- ReferenceError: 0.

V182 no queda ACTIVE_BASELINE/FROZEN hasta Hosting DEV, smoke remoto, validacion visual Paula y APROBADO.

**Siguiente bloque exacto:** `HOSTING DEV DEL MISMO HEAD_AFTER -> SMOKE REMOTO -> TYA/MOVIL/HOST/PDF/XLSX -> VALIDACION VISUAL PAULA -> CORRECCION FOCALIZADA SI APLICA -> APROBADO -> FREEZE CORTE 3`.