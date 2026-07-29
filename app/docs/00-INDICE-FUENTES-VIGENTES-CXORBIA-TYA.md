# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-07-29  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `CORTE3_FROZEN_ACTIVE_BASELINE__CORTE4_VISUAL_P0_PROVEN__FREEZE_BLOCKED__NO_DATA_WRITES`

## 1. Repositorio

- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Base: `release/cxorbia-tya-rc-20260630`.
- Producción, merge, imports, pagos y data writes reales: 0.

## 2. Orden de lectura vigente

1. este índice;
2. reglas maestras vigentes;
3. addendum de empalme directo/carril file-aware;
4. addenda de Academia, patrones y antidesvío;
5. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
6. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
7. `backend/contracts/cxdata-firestore-readonly-corte4-v1.json`;
8. `app/docs/VALIDACION-VISUAL-CORTE4-P0-PROVEN-20260729.md`;
9. `app/docs/CAMBIOS-BACKEND-ADDENDUM-CORTE4-VISUAL-P0-PROVEN-20260729.md`;
10. `app/docs/RESUMEN-PARA-CLAUDE-ADDENDUM-CORTE4-VISUAL-P0-PROVEN-20260729.md`;
11. `app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-CORTE4-VISUAL-P0-PROVEN-20260729.md`;
12. `app/docs/ACADEMIA-IMPACTO-CORTE4-VISUAL-P0-PROVEN-20260729.md`;
13. `app/docs/ACTIVE-BASELINE-CORTE3-V182-20260729.json`;
14. `app/docs/FREEZE-CORTE3-V182-APPROVED-20260729.md`;
15. PR #7 y HEAD vivo.

## 3. Corte 3 — congelado

- `FROZEN_ACTIVE_BASELINE`.
- Baseline `CXORBIA-TYA-CORTE3-V182-20260729`.
- V182 empalmada; no V183/R33.
- 14 periodos / 616 visitas.
- Mayo: 44 pagadas / 0 pendientes / CxP Q0-L0.
- Junio: 2 pagadas / 42 pendientes / Q451-L0.
- P1/P2 de PDF, Excel, reportKit y copy no reabren Corte 3.

## 4. Corte 4 — objetivo y hardening

Objetivo: Firebase nuevo/vacío, `CX.data` read-only, misma interfaz y cero data writes.

Hardening exigido:

- interfaz `CX.data` preservada;
- `readOnly=true` / `writeMode=disabled`;
- backend vacío visible como vacío;
- error de lectura fail-closed;
- no fallback mock/localStorage;
- base legacy/preexistente prohibida.

## 5. Gates 1–4 — PASS técnico

- Firebase nuevo `cxorbia-tya-dev-260729-c4`.
- Identidad y vacío integral: PASS.
- Web App DEV, Firestore `us-central1`, Rules read-only y Auth config: PASS.
- Protected smoke: `source=firestore`, `empty=true`, `fallbackUsed=false`, `readOnly=true`, writes=0 y cleanup completo.

Intento protegido válido: `b698a925f5f6a7c8405afb7fb54a9f4c551e8498`.

## 6. Gate 5 — Hosting DEV: PASS técnico

Autorización consumida: `Autorizo Hosting DEV de Corte 4 para validación visual.`

- Authorization ID: `c4-hosting-visual-20260729-01`.
- Deployed source commit: `fabba5c76bb40f5105f8e10dd54be63e9b3eb783`.
- exactamente 1 deploy Hosting-only;
- remote proof y entrypoint verificados;
- Firestore/Auth/Storage/Rules/Functions/HR/import/Make/Gemini/payment/merge/production writes: 0.

## 7. Gate 6 — validación visual: P0 PROVEN

Paula aportó evidencia visual reproducible del runtime publicado:

- `Fuente: localStorage/demo`;
- `Auth: pendiente`;
- `Proyecto: proyecto retail`;
- `Proyectos: 3 · Visitas: 108 · Shoppers: 18 · Postulaciones: 48`;
- badge `Demo comercial · datos ficticios`;
- proyectos Retail/Banca/Restaurantes y KPIs demo visibles.

Esto viola directamente `fallbackToMockOnReadError=false`, `fallbackToLocalStorageOnEmpty=false` y `emptyBackendMustRenderAsEmpty=true`.

P0 activo: `P0-C4-VIS-01 — FORBIDDEN_DEMO_FALLBACK_ON_AUTH_PENDING`.

Causa raíz localizada en backend: preview Auth queda habilitado lógicamente, pero el principal temporal fue correctamente eliminado después del protected smoke; `backend-firebase.js` ante credencial ausente marca y conserva `localStorage/demo` en lugar de fail-closed vacío.

## 8. Seguridad actual

- Firestore document writes=0;
- Auth users permanentes=0;
- Email/Password=deshabilitado;
- Storage writes=0;
- Hosting DEV Corte 4: 1 deploy autorizado y consumido;
- Rules/Functions/imports/HR/Make/Gemini/payments/merge/production adicionales=0.

## 9. Siguiente acción exacta

`AUTORIZACIÓN EXPRESA DE CORRECCIÓN P0-C4-VIS-01 → PATCH BACKEND FOCALIZADO → GATES → HOSTING DEV CONTROLADO → REVALIDACIÓN VISUAL → FREEZE CORTE 4 SI PASS → RETIRAR IAM TEMPORAL A VIEWER → CORTE 5`.

No se requiere PowerShell, nueva candidata, ZIP ni datos TyA.

## 10. Claude/prototipo y Academia

- Claude: sin nueva candidata; no tocar módulos UI ni backend/contracts/adapters.
- Academia: registrar diferencia entre protected smoke PASS, Hosting proof PASS y runtime visual con fallback prohibido.
- Reusable CXOrbia: `AUTH NO DISPONIBLE + BACKEND REAL SELECCIONADO => FAIL-CLOSED`, nunca demo/localStorage silencioso.