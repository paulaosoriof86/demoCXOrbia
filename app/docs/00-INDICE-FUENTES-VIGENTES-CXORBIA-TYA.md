# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-07-29  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `CORTE3_FROZEN_ACTIVE_BASELINE__CORTE4_HOSTING_DEV_PASS__VISUAL_VALIDATION_PENDING__NO_DATA_WRITES`

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
8. `app/docs/CAMBIOS-BACKEND-ADDENDUM-CORTE4-HOSTING-DEV-PASS-20260729.md`;
9. `app/docs/RESUMEN-PARA-CLAUDE-ADDENDUM-CORTE4-HOSTING-DEV-PASS-20260729.md`;
10. `app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-CORTE4-HOSTING-DEV-PASS-20260729.md`;
11. `app/docs/ACADEMIA-IMPACTO-CORTE4-HOSTING-DEV-PASS-20260729.md`;
12. `app/docs/ACTIVE-BASELINE-CORTE3-V182-20260729.json`;
13. `app/docs/FREEZE-CORTE3-V182-APPROVED-20260729.md`;
14. PR #7 y HEAD vivo.

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
- `readOnly=true` / `writeMode=disabled`;
- backend vacío visible como vacío;
- error de lectura fail-closed;
- no fallback mock/localStorage;
- base legacy/preexistente prohibida.

## 5. Gates 1–3 — PASS

Firebase nuevo:

- projectId `cxorbia-tya-dev-260729-c4`;
- display name `CXOrbia TyA DEV Clean Corte 4`;
- identidad nueva PASS;
- vacío integral previo PASS;
- `cxorbia-backend-dev` sigue excluido;
- Web App DEV READY;
- Firestore `(default)` READY, Native/Standard, `us-central1`, sin colecciones;
- Rules read-only DEPLOYED + VERIFIED;
- Firebase Authentication INITIALIZED.

Bootstrap idempotente: `BOOTSTRAP_DEV_READONLY_COMPLETED_C4`.

## 6. Gate 4 — protected CX.data smoke: PASS

Autorización consumida: `Autorizo operador DEV temporal para smoke protegido de Corte 4`.

Intento válido: `b698a925f5f6a7c8405afb7fb54a9f4c551e8498`.

Resultado comprobado:

- `source=firestore`;
- `empty=true`;
- `fallbackUsed=false`;
- `readOnly=true` / `writeMode=disabled`;
- interfaz pública `CX.data` preservada;
- claims temporales `role=admin`, `tenantId=tya` verificados;
- write directo bloqueado;
- Firestore document writes=0;
- operador temporal eliminado;
- Auth users final=0;
- Email/Password final=deshabilitado.

El falso negativo del publicador se corrigió en `9967146e112322efcd043155ae05351bbbbd4e8a` sin rerun ni nuevo Auth write.

## 7. Gate 5 — Hosting DEV: PASS

Autorización consumida: `Autorizo Hosting DEV de Corte 4 para validación visual.`

- Authorization ID: `c4-hosting-visual-20260729-01`.
- Deployed source commit: `fabba5c76bb40f5105f8e10dd54be63e9b3eb783`.
- Status `cxorbia/corte4-hosting-dev-visual = success`.
- Status `cxorbia/c4hosting-deploys1 = success`.
- Hosting deploy executions: exactamente 1.
- Remote proof: verificado.
- Entrypoint `index-backend-dev.html`: verificado.
- Deployment: Hosting-only sobre `cxorbia-tya-dev-260729-c4`.
- Firestore/Auth/Storage/Rules/Functions/HR/import/Make/Gemini/payment/merge/production writes: 0.

Visual URL:

`https://cxorbia-tya-dev-260729-c4.web.app/index-backend-dev.html?cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV&c4visual=fabba5c76bb40f5105f8e10dd54be63e9b3eb783`

La autorización one-shot quedó consumida y congelada: workflow en HOLD y request con `hostingDeployExecutions=0`.

## 8. Seguridad actual

- Firestore document writes=0;
- Auth users permanentes=0;
- Email/Password=deshabilitado;
- Storage writes=0;
- Hosting DEV Corte 4: 1 deploy autorizado y consumido;
- Rules/Functions/imports/HR/Make/Gemini/payments/merge/production adicionales=0.

## 9. Siguiente acción exacta

`VALIDACIÓN VISUAL PAULA → si P0 reproducible, corrección focalizada únicamente → si no P0, FREEZE CORTE 4 → retirar IAM temporal elevado y dejar runner en Viewer → CORTE 5 materialización DEV`.

No se requiere PowerShell, nueva candidata, ZIP ni datos TyA para la validación visual.

## 10. Claude/prototipo y Academia

- Claude: sin nueva candidata; no tocar backend/contracts/adapters. Solo actuar si la validación visual demuestra P0 localizado.
- Academia: distinguir Hosting DEV de producción, deployment de runtime, protected smoke y visual humana.
- Reusable CXOrbia: autorización one-shot, deploy Hosting-only, proof remoto, antiredeploy por `authorizationId` y freeze posterior.
