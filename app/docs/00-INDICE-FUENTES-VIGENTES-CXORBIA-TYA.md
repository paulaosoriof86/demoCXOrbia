# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-07-29  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `CORTE3_FROZEN_ACTIVE_BASELINE__CORTE4_VIS01_FIXED__VIS02_P0_PROVEN__FREEZE_BLOCKED__NO_DATA_WRITES`

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
6. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-ADDENDUM-CORTE4-VIS02-P0-20260729.md`;
7. `app/docs/VALIDACION-VISUAL-CORTE4-P0-VIS02-PROVEN-20260729.md`;
8. `app/docs/CAMBIOS-BACKEND-ADDENDUM-CORTE4-VIS02-P0-PROVEN-20260729.md`;
9. `app/docs/RESUMEN-PARA-CLAUDE-ADDENDUM-CORTE4-VIS02-P0-PROVEN-20260729.md`;
10. `app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-CORTE4-VIS02-P0-PROVEN-20260729.md`;
11. `app/docs/ACADEMIA-IMPACTO-CORTE4-VIS02-P0-PROVEN-20260729.md`;
12. `backend/contracts/cxdata-firestore-readonly-corte4-v1.json` como contrato técnico previo al nuevo P0;
13. documentación histórica de P0-C4-VIS-01 y su revalidación PASS;
14. baseline/freeze de Corte 3;
15. PR #7 y HEAD vivo.

## 3. Corte 3 — congelado

- `FROZEN_ACTIVE_BASELINE`.
- Baseline `CXORBIA-TYA-CORTE3-V182-20260729`.
- V182 empalmada; no V183/R33.
- 14 periodos / 616 visitas.
- Mayo: 44 pagadas / 0 pendientes / CxP Q0-L0.
- Junio: 2 pagadas / 42 pendientes / Q451-L0.
- P1/P2 de PDF, Excel, reportKit y copy no reabren Corte 3.

## 4. Corte 4 — objetivo

Firebase nuevo/vacío, `CX.data` read-only, misma interfaz, backend vacío visible como estado válido, fail-closed y cero data writes.

## 5. Gates técnicos previos — PASS

- Firebase nuevo `cxorbia-tya-dev-260729-c4`.
- Identidad/vacío integral: PASS.
- Web App DEV, Firestore `us-central1`, Rules read-only y Auth config: PASS.
- Protected smoke: `source=firestore`, `empty=true`, `fallbackUsed=false`, `readOnly=true`, writes=0, cleanup completo.
- Hosting inicial: PASS técnico.

## 6. P0-C4-VIS-01 — corregido

La visual inicial demostró fallback prohibido a demo/localStorage. La corrección backend/core fue aplicada y revalidada local/remotamente.

La visual humana actual confirma que ese problema ya no está presente:

- Firestore activo;
- no badge demo;
- 0 proyectos / 0 visitas / 0 shoppers / 0 postulaciones;
- `fallbackUsed=false`.

## 7. P0-C4-VIS-02 — PROVEN

Nueva evidencia humana:

- Administración / Coordinación queda con shell/pantalla en blanco sobre backend vacío;
- Shopper puede mostrar shell sin proyecto y `Evaluador (sin identidad)`;
- al regresar desde Shopper, un intento fallido de Administración puede dejar visible el shell Shopper anterior.

P0 activo:

`P0-C4-VIS-02 — EMPTY_BACKEND_ADMIN_SHELL_CRASH_AND_STALE_ROLE_RENDER`.

Causa raíz localizada en shell/core:

- el guard vacía correctamente proyectos/periodo;
- `router.buildRail()` llama `keyOf(p)` con `p=undefined` cuando no existen proyectos;
- `data.programKey/programBase` dereferencian el objeto sin null guard;
- la vista inicial `midia` también presupone periodo existente;
- `showLogin()` no limpia el shell previo, por lo que un fallo de remount puede dejar DOM del rol anterior.

No se debe materializar datos para ocultar el defecto ni tocar módulos UI.

## 8. Seguridad actual

- Firestore document writes=0;
- Auth users permanentes=0;
- Email/Password deshabilitado;
- Storage/Rules/Functions/imports/HR/Make/Gemini/payments/merge/production adicionales=0;
- no Hosting adicional autorizado para VIS-02.

## 9. Gate vivo único

`AUTORIZACIÓN EXPRESA P0-C4-VIS-02 → PATCH CORE FOCALIZADO → GATE EMPTY-BACKEND + ROLE-SWITCH → HOSTING DEV CONTROLADO → REVALIDACIÓN HUMANA → FREEZE CORTE 4 SI PASS → IAM VIEWER → CORTE 5`.

No PowerShell, no nueva candidata, no nueva base y no materialización anticipada.

## 10. Claude/prototipo y Academia

- Claude: no nueva candidata; no tocar `app/modules` por este P0.
- Academia: `backend conectado + dataset vacío` debe enseñarse como estado válido distinto de error/demo.
- Reusable CXOrbia: el shell debe soportar cero proyectos sin crash y el cambio de rol debe limpiar DOM/estado visual previo.
