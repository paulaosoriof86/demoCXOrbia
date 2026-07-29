# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-07-29  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `CORTE3_FROZEN_ACTIVE_BASELINE__CORTE4_WEB_FIRESTORE_RULES_READY__AUTH_CONSOLE_INITIALIZATION_REQUIRED__NO_DATA_WRITES`

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
7. `app/docs/CHECKPOINT-CORTE4-BOOTSTRAP-PREFLIGHT-20260729.md`;
8. `app/docs/ACTIVE-BASELINE-CORTE3-V182-20260729.json`;
9. `app/docs/FREEZE-CORTE3-V182-APPROVED-20260729.md`;
10. contrato/gates Corte 4;
11. CAMBIOS, Claude, PENDIENTES, Academia y tracker;
12. PR #7 y HEAD vivo.

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

Hardening vigente:

- interfaz `CX.data` preservada;
- readOnly=true / writeMode=disabled;
- backend vacío visible como vacío;
- error de lectura fail-closed;
- no fallback mock/localStorage;
- base legacy/preexistente prohibida.

## 5. Firebase nuevo — Gates 1–2 PASS

- projectId `cxorbia-tya-dev-260729-c4`;
- display name `CXOrbia TyA DEV Clean Corte 4`;
- identidad nueva PASS;
- vacío integral previo PASS;
- `cxorbia-backend-dev` sigue excluido.

## 6. Bootstrap DEV read-only — estado vivo

Paula autorizó `Autorizo bootstrap DEV read-only de Corte 4` y confirmó `us-central1`.

IAM temporal sobre la service account del runner:

- Viewer;
- Firebase Editor;
- Cloud Datastore Owner;
- Service Usage Admin.

Re-preflight: `BOOTSTRAP_PREFLIGHT_READY_FOR_AUTHORIZED_WRITES_C4`, missing permissions=0, location=`us-central1`.

Provider bootstrap completado hasta:

- Web App DEV `CXOrbia TyA DEV Corte 4`: READY;
- Firestore `(default)`: READY, Native/Standard, `us-central1`, sin colecciones;
- Rules `backend/rules/firestore.corte4-readonly.rules`: DEPLOYED + VERIFIED;
- Auth config: PENDING CONSOLE INITIALIZATION.

Estado sanitizado en commit `3acfaf9566f54e08e5a8db61247f445e90612ca5`:

`BOOTSTRAP_DEV_READONLY_PROVIDER_READY_AUTH_CONSOLE_REQUIRED_C4`

Diagnóstico: `web=true`, `db=true`, `auth=false`, `rules=true`.

## 7. Causa raíz Auth

El endpoint público `projects.identityPlatform.initializeAuth` devuelve HTTP 400 en este proyecto Spark. Google documenta que esa variante pública está disponible solo para proyectos con facturación habilitada. Se retiró el reintento automático; Auth permanece fail-closed.

## 8. Seguridad actual

- Firestore document writes=0;
- Auth user writes=0;
- Storage writes=0;
- Hosting deploy=0;
- Functions/imports/HR/Make/Gemini/payments/merge/production=0.

Hubo únicamente config writes autorizados para API/Web App/Firestore/Rules. No existe materialización de datos TyA.

## 9. Siguiente acción exacta

`FIREBASE CONSOLE → AUTHENTICATION → COMENZAR/GET STARTED (SIN HABILITAR PROVEEDORES) → REEJECUTAR BOOTSTRAP IDEMPOTENTE → CONFIG WEB DEV → ACTIVAR LECTURA → SMOKE CX.data → VALIDACIÓN VISUAL → FREEZE CORTE 4 → RETIRAR IAM TEMPORAL A VIEWER`.

No se requiere PowerShell, nueva candidata, ZIP ni datos TyA.

## 10. Claude/prototipo y Academia

- Claude: sin nueva candidata; no tocar backend/contracts/adapters. Solo actuar si smoke demuestra P0 localizado.
- Academia: diferenciar proyecto, IAM, API, Web App, Firestore, Auth, Rules, lectura y materialización.
- Reusable CXOrbia: bootstrap idempotente/fail-closed y least privilege posterior.
