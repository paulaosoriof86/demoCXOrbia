# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-07-29  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `CORTE3_FROZEN__CORTE4_VIS01_FIXED__VIS02_FIXED__VIS02B_FINAL_DEPLOY1_CONSUMED__REMOTE_DIAGNOSTIC_PASS__HUMAN_VISUAL_PENDING__NO_DATA_WRITES`

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
6. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-ADDENDUM-CORTE4-VIS02B-FINAL-REMOTE-PASS-20260729.md`;
7. `app/docs/CAMBIOS-BACKEND-ADDENDUM-CORTE4-VIS02B-FINAL-REMOTE-PASS-20260729.md`;
8. `app/docs/RESUMEN-PARA-CLAUDE-ADDENDUM-CORTE4-VIS02B-FINAL-REMOTE-PASS-20260729.md`;
9. `app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-CORTE4-VIS02B-FINAL-REMOTE-PASS-20260729.md`;
10. `app/docs/ACADEMIA-IMPACTO-CORTE4-VIS02B-FINAL-REMOTE-PASS-20260729.md`;
11. documentación histórica de VIS-01, VIS-02 y VIS-02B;
12. `backend/contracts/cxdata-firestore-readonly-corte4-v1.json`;
13. baseline/freeze Corte 3;
14. PR #7 y HEAD vivo.

Los addenda anteriores quedan como evidencia histórica; prevalecen los documentos `VIS02B-FINAL-REMOTE-PASS` de este índice.

## 3. Corte 3 — congelado
- `FROZEN_ACTIVE_BASELINE`.
- Baseline `CXORBIA-TYA-CORTE3-V182-20260729`.
- V182 empalmada; no V183/R33.
- 14 periodos / 616 visitas.
- Mayo: 44 pagadas / 0 pendientes / CxP Q0-L0.
- Junio: 2 pagadas / 42 pendientes / Q451-L0.
- P1/P2 PDF/Excel/reportKit/copy no reabren Corte 3.

## 4. Corte 4 — objetivo y gates previos
Objetivo: Firebase nuevo/vacío, `CX.data` read-only, misma interfaz, backend vacío visible, fail-closed y cero data writes.

PASS previos:
- Firebase `cxorbia-tya-dev-260729-c4` nuevo/vacío;
- Web App DEV, Firestore `us-central1`, Rules read-only y Auth config;
- protected smoke `source=firestore`, `empty=true`, `fallbackUsed=false`, `readOnly=true`, writes=0;
- P0-C4-VIS-01 corregido: no demo/localStorage y visual humana con 0/0/0/0.

## 5. P0-C4-VIS-02 — corregido
- `app/core/backend-corte4-empty-shell-guard.js` maneja backend vacío como estado válido;
- null-safety de proyecto/período en preview vacío;
- limpieza de rail/view/crumb entre roles;
- no se tocaron `app/modules`.

Gate local de role-switch: PASS.

## 6. P0-C4-VIS-02B — corregido y desplegado
Causa: referencia inexistente `adapters/tya-phase-a-source-safe-dev-adapter.js` en `index-backend-dev.html`; Firebase Hosting la reescribía al HTML principal y el browser intentaba parsearlo como JS.

Corrección:
- referencia huérfana eliminada;
- no se creó adapter ficticio;
- gate reusable `tools/qa/cxorbia-corte4-entrypoint-script-integrity.mjs` PASS.

Autorización final consumida:
`Autorizo un único Hosting DEV final para revalidación de P0-C4-VIS-02B, sin data writes ni producción`.

- authorizationId `c4-p0-vis02b-final-20260729-01`;
- deployed source `e9b7441fab4370ba455a77791b79b6e167cd33ac`;
- `cxorbia/c4p0vis02b-final-deploys1=success`;
- `cxorbia/c4p0vis02b-final-scripts=success`;
- Hosting final autorizado/ejecutado: 1/1;
- workflow one-shot convertido a HOLD.

## 7. Revalidación remota vigente
El status agregado del runner final quedó `error`, por lo que no se interpretó como PASS sin evidencia. Se ejecutó diagnóstico remoto independiente read-only, providerWrites=0.

Resultado:
- `cxorbia/c4p0vis02b-diag-summary=success`;
- `cxorbia/c4p0vis02b-diag-pass=success`;
- proof corresponde al source desplegado;
- 0 pageerrors;
- todos los scripts locales resuelven como JavaScript;
- Admin vacío → logout → Shopper vacío → logout → Admin vacío: PASS;
- sin shell Shopper residual;
- conteos 0/0/0/0, sin demo/localStorage.

## 8. Seguridad actual
- Firestore document writes=0;
- Auth users permanentes=0;
- Email/Password deshabilitado;
- Auth config/user writes adicionales=0;
- Storage/Rules/Functions/imports/HR/Make/Gemini/payments=0;
- producción=false;
- merge=false.

## 9. Gate vivo único
`VALIDACIÓN VISUAL HUMANA DE URL FINAL → si no hay P0: FREEZE CORTE 4 → IAM TEMPORAL A VIEWER → CORTE 5 MATERIALIZACIÓN DEV`.

No PowerShell, no nueva candidata, no nueva base y no materialización anticipada.

## 10. Claude/prototipo y Academia
- Claude: sin nueva candidata; preservar fix core/entrypoint y no tocar `app/modules` por estos P0.
- Academia: backend vacío first-class state + gate anti-dangling-script + role-switch limpio.
- Reusable CXOrbia: sí.
