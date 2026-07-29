# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-07-29  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `CORTE3_FROZEN_ACTIVE_BASELINE__CORTE4_NEW_FIREBASE_CREATED_VISUALLY__IAM_READ_ACCESS_PENDING_NO_PRODUCTION`

## 1. Repositorio

- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Base: `release/cxorbia-tya-rc-20260630`.
- Producción, merge, imports, pagos y writes reales: 0.

## 2. Orden de lectura vigente

1. este índice;
2. reglas maestras vigentes;
3. addendum de empalme directo/carril file-aware;
4. addenda de Academia, patrones y antidesvío;
5. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
6. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
7. `app/docs/ACTIVE-BASELINE-CORTE3-V182-20260729.json`;
8. `app/docs/FREEZE-CORTE3-V182-APPROVED-20260729.md`;
9. contrato/gate Corte 4;
10. CAMBIOS, Claude, PENDIENTES, Academia y tracker;
11. PR #7 y HEAD vivo.

## 3. Corte 3 — fuente congelada

- `FROZEN_ACTIVE_BASELINE`.
- Baseline `CXORBIA-TYA-CORTE3-V182-20260729`.
- V182 empalmada; no V183/R33.
- 14 periodos / 616 visitas.
- Mayo: 44 pagadas / 0 pendientes / CxP Q0-L0.
- Junio: 2 pagadas / 42 pendientes / Q451-L0.
- Run `30416875149`, job `90468374816`: SUCCESS.

P1/P2 de reportes no reabren Corte 3.

## 4. Corte 4 — fuentes activas

Objetivo: Firebase nuevo/vacío, `CX.data` read-only y cero writes.

- `backend/contracts/cxdata-firestore-readonly-corte4-v1.json`;
- `app/core/backend-config.js`;
- `app/core/backend-config-preview-dev.js`;
- `app/core/backend-firebase.js`;
- `app/core/backend-cxdata-read-guard.js`;
- `app/core/backend-cxdata-readonly-corte4.js`;
- `app/index-backend-dev.html`;
- `backend/rules/firestore.corte4-readonly.rules`;
- `tools/qa/cxdata-firestore-readonly-corte4-gate.mjs`;
- `tools/release/cxorbia-probe-firebase-project-identity-corte4.mjs`;
- `tools/release/tya-create-new-empty-firebase-dev-r15b.mjs`.

Reglas:

- interfaz `CX.data` preservada;
- readOnly=true / writeMode=disabled;
- backend vacío visible como vacío;
- error de lectura fail-closed;
- no fallback mock/localStorage;
- no base legacy/preexistente;
- no activación antes de identidad, vacío y Rules.

## 5. Estado del proveedor

`NEW_FIREBASE_CREATED__RUNNER_IAM_READ_ACCESS_PENDING`

- `cxorbia-backend-dev` continúa excluido por no ser nuevo/vacío.
- Proyecto nuevo creado manualmente por Paula: `cxorbia-tya-dev-260729-c4`.
- Nombre visible: `CXOrbia TyA DEV Clean Corte 4`.
- Firebase Console confirma cero apps registradas.
- Gate estático Corte 4: PASS.
- Única ruta de credencial estructuralmente válida: `existing_dev_service_account`.
- Re-probe commit `691ec3c0c76ebc45a9d901b82dfb95d08f27daa6`: `TARGET_PROJECT_PERMISSION_DENIED_C4`.
- Provider writes=0.
- Rules deploy/provider activation=false.

La creación ya no es el bloqueo. Falta IAM read-only de la service account del runner sobre el proyecto nuevo.

## 6. Desbloqueo mínimo

Otorgar a la service account existente rol `Viewer` sobre `cxorbia-tya-dev-260729-c4`; después repetir probe y verificar vacío integral.

No se requiere PowerShell, nueva candidata, ZIP ni datos TyA.

## 7. Claude/prototipo y Academia

- Claude: Corte 3 congelado; no tocar backend/contracts/adapters.
- Academia: documentar creación del proyecto, IAM, Firebase apps, Rules, lectura y escritura como gates distintos.

## 8. Backlog no bloqueante

- PDF sin gráfica visible.
- Excel con formato básico.
- reportKit transversal.
- copy de fuentes.
- registry/gate R20 antes de producción.

## 9. Siguiente bloque exacto

`IAM READ-ONLY RUNNER → RE-PROBE IDENTIDAD → VERIFICAR VACÍO → CONFIG WEB DEV → RULES READ-ONLY → ACTIVAR LECTURA DEV → SMOKE CX.data`.
