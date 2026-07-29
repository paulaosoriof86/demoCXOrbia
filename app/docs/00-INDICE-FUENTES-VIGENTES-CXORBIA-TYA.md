# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-07-29  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `CORTE3_FROZEN_ACTIVE_BASELINE__CORTE4_READONLY_HARDENED_PROVIDER_IDENTITY_PENDING_NO_PRODUCTION`

## 1. Repositorio

- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Base: `release/cxorbia-tya-rc-20260630`.
- Producción, merge, imports, pagos ejecutados y writes reales: prohibidos/no ejecutados.

## 2. Orden de lectura vigente

1. este índice;
2. reglas maestras vigentes;
3. addendum de empalme directo/carril file-aware;
4. addenda de Academia, patrones y antidesvío;
5. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
6. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
7. `app/docs/ACTIVE-BASELINE-CORTE3-V182-20260729.json`;
8. `app/docs/FREEZE-CORTE3-V182-APPROVED-20260729.md`;
9. contratos/adapters/gates source-safe vigentes;
10. CAMBIOS, RESUMEN-PARA-CLAUDE, PENDIENTES, Academia y tracker;
11. PR #7 y HEAD vivo.

## 3. Corte 3 — fuente congelada

- Estado: `FROZEN_ACTIVE_BASELINE`.
- Baseline: `CXORBIA-TYA-CORTE3-V182-20260729`.
- Aprobación Paula: `Procede`.
- Baseline head: `1b34c3998625a3f2402ceeada283ab57b56ffbf6`.
- V182 empalmada; no V183 y no R33.
- 14 periodos / 616 visitas.
- Mayo: 44 pagadas / 0 pendientes / CxP Q0-L0.
- Junio: 2 pagadas / 42 pendientes / Q451-L0.
- Run `30416875149`, job `90468374816`: SUCCESS.

Corte 3 no se reabre por P1/P2.

## 4. Corte 4 — fuentes activas

Objetivo: Firebase nuevo/vacío, `CX.data` read-only y cero writes.

Fuentes vigentes:

- `backend/contracts/cxdata-firestore-readonly-corte4-v1.json`;
- `app/core/backend-config.js`;
- `app/core/backend-config-preview-dev.js`;
- `app/core/backend-firebase.js`;
- `app/core/backend-cxdata-read-guard.js`;
- `app/core/backend-cxdata-readonly-corte4.js`;
- `app/index-backend-dev.html`;
- `tools/qa/cxdata-firestore-readonly-corte4-gate.mjs`.

Reglas prevalentes:

- `CX.data` conserva interfaz pública;
- lectura solamente;
- `writeMode=disabled`;
- backend vacío se representa como vacío;
- error de lectura falla cerrado;
- no fallback silencioso a mock/localStorage;
- no conexión/copias de base legacy;
- no provider activation hasta verificar identidad, vacío y Rules.

## 5. Estado del proveedor

`READONLY_HARDENED_PROVIDER_IDENTITY_PENDING`

- Firebase projectId configurado como referencia: `cxorbia-backend-dev`.
- Identidad de proyecto nuevo/limpio: pendiente de verificación.
- Vacío del proyecto: pendiente de verificación.
- Config completa DEV: pendiente, sin secretos en repo.
- Activación: prohibida por ahora.

## 6. Claude/prototipo y Academia

- Claude: Corte 3 congelado; no tocar backend/contracts/adapters desde candidata; P1/P2 solo por archivo/módulo.
- Academia: documentar baseline Corte 3 y Corte 4 read-only/fail-closed.

## 7. Pendientes no bloqueantes preservados

- PDF imprime sin gráfica visible.
- Excel conserva formato básico.
- Mejora transversal de `reportKit`.
- Refinamiento de copy “Pendiente de fuente”.
- Registry/gate R20 antes de producción.

## 8. Siguiente bloque exacto

`VERIFICAR FIREBASE NUEVO/LIMPIO → VERIFICAR VACÍO Y RULES READ-ONLY → GATE CORTE 4 → ACTIVAR LECTURA DEV → SMOKE CX.data`.
