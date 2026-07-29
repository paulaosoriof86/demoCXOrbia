# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-07-29  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `CORTE3_FROZEN__CORTE4_VIS01_FIXED__VIS02_CORE_LOCAL_PASS__DEPLOY1_CONSUMED__REMOTE_BLOCKED_BY_DANGLING_SCRIPT__FIX_STAGED__FINAL_REDEPLOY_AUTH_PENDING__NO_DATA_WRITES`

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
6. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-ADDENDUM-CORTE4-VIS02-DEPLOY1-DANGLING-SCRIPT-20260729.md`;
7. `app/docs/CAMBIOS-BACKEND-ADDENDUM-CORTE4-VIS02-DEPLOY1-DANGLING-SCRIPT-20260729.md`;
8. `app/docs/RESUMEN-PARA-CLAUDE-ADDENDUM-CORTE4-VIS02-DEPLOY1-DANGLING-SCRIPT-20260729.md`;
9. `app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-CORTE4-VIS02-DEPLOY1-DANGLING-SCRIPT-20260729.md`;
10. `app/docs/ACADEMIA-IMPACTO-CORTE4-VIS02-DEPLOY1-DANGLING-SCRIPT-20260729.md`;
11. documentación histórica `VALIDACION-VISUAL-CORTE4-P0-VIS02-PROVEN-20260729.md`;
12. `backend/contracts/cxdata-firestore-readonly-corte4-v1.json`;
13. baseline/freeze Corte 3;
14. PR #7 y HEAD vivo.

Los addenda de VIS-02 anteriores quedan como evidencia histórica; prevalecen los documentos `VIS02-DEPLOY1-DANGLING-SCRIPT` de este índice.

## 3. Corte 3 — congelado
- `FROZEN_ACTIVE_BASELINE`.
- Baseline `CXORBIA-TYA-CORTE3-V182-20260729`.
- V182 empalmada; no V183/R33.
- 14 periodos / 616 visitas.
- Mayo: 44 pagadas / 0 pendientes / CxP Q0-L0.
- Junio: 2 pagadas / 42 pendientes / Q451-L0.
- P1/P2 PDF/Excel/reportKit/copy no reabren Corte 3.

## 4. Corte 4 — gates previos
Objetivo: Firebase nuevo/vacío, `CX.data` read-only, misma interfaz, backend vacío visible, fail-closed y cero data writes.

PASS previos:
- Firebase `cxorbia-tya-dev-260729-c4` nuevo/vacío;
- Web App DEV, Firestore `us-central1`, Rules read-only y Auth config;
- protected smoke `source=firestore`, `empty=true`, `fallbackUsed=false`, `readOnly=true`, writes=0;
- P0-C4-VIS-01 corregido: no demo/localStorage y visual humana con 0/0/0/0.

## 5. P0-C4-VIS-02 — core fix aplicado
La visual humana demostró Admin blanco y shell Shopper residual con backend vacío.

Corrección focalizada sin tocar `app/modules`:
- `app/core/backend-corte4-empty-shell-guard.js`;
- carga del guard antes de app boot en `app/index-backend-dev.html`.

Gate local de role switch: PASS para `Admin vacío → logout → Shopper vacío → logout → Admin vacío`.

## 6. Hosting VIS-02 — autorización consumida
Autorización: `Autorizo corrección focalizada de P0-C4-VIS-02 y un único Hosting DEV de revalidación de Corte 4, sin data writes ni producción`.

- authorizationId `c4-p0-vis02-revalidate-20260729-01`;
- deployed source `548e5f89c5d077686611d1904f4166d3188a2ccd`;
- `cxorbia/c4p0vis02-deploys1=success`;
- exactamente 1 deploy Hosting DEV;
- `cxorbia/c4p0vis02-revalidation=error`.

La autorización está consumida. No puede ejecutarse otro Hosting con ella.

## 7. Causa exacta del error remoto
El remote browser no volvió a demostrar el crash de roles; el bloqueo fue un pageerror `Unexpected token '<'`.

Probe HTTP read-only:
- `cxorbia/c4p0vis02-script-summary=error`;
- única ruta mala: `adapters/tya-phase-a-source-safe-dev-adapter.js`;
- el archivo no existe en repo ni en el deployed source;
- el entrypoint sí lo referenciaba;
- Firebase Hosting reescribía la ruta faltante al HTML principal y devolvía 200; el navegador intentaba interpretar `<!DOCTYPE html>` como JS.

Subhallazgo bloqueante: `P0-C4-VIS-02B — DANGLING_ENTRYPOINT_SCRIPT_REWRITTEN_AS_HTML`.

## 8. Corrección VIS-02B ya preparada, no desplegada
- referencia inexistente eliminada de `app/index-backend-dev.html`;
- no se creó adapter ficticio;
- gate reusable `tools/qa/cxorbia-corte4-entrypoint-script-integrity.mjs`;
- `cxorbia/c4-entrypoint-script-integrity=success` después del fix.

## 9. Seguridad actual
- Firestore document writes=0;
- Auth users permanentes=0;
- Email/Password deshabilitado;
- Storage/Rules/Functions/imports/HR/Make/Gemini/payments=0;
- producción=false;
- merge=false;
- Hosting VIS-02 total autorizado/ejecutado en este bloque=1/1.

## 10. Gate vivo único
`NUEVA AUTORIZACIÓN EXPRESA PARA 1 HOSTING DEV FINAL VIS-02B → REMOTE BROWSER 0 PAGEERRORS + ROLE-SWITCH PASS → VALIDACIÓN VISUAL HUMANA → FREEZE CORTE 4 → IAM TEMPORAL A VIEWER → CORTE 5`.

No PowerShell, no nueva candidata, no nueva base y no materialización anticipada.

## 11. Claude/prototipo y Academia
- Claude: sin nueva candidata; no tocar `app/modules`.
- Academia: backend vacío es first-class state; un rewrite global puede transformar un asset JS faltante en HTML 200, por lo que todo entrypoint necesita gate de integridad de assets.
- Reusable CXOrbia: empty-shell role switching + anti-dangling-script gate.
