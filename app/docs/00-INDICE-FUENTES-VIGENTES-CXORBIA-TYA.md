# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-07-29  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `CORTE3_FROZEN_ACTIVE_BASELINE__CORTE4_PROTECTED_CXDATA_SMOKE_PASS__HOSTING_DEV_AUTH_PENDING__NO_DATA_WRITES`

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
8. `app/docs/CAMBIOS-BACKEND-ADDENDUM-CORTE4-PROTECTED-SMOKE-PASS-20260729.md`;
9. `app/docs/RESUMEN-PARA-CLAUDE-ADDENDUM-CORTE4-PROTECTED-SMOKE-PASS-20260729.md`;
10. `app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-CORTE4-PROTECTED-SMOKE-PASS-20260729.md`;
11. `app/docs/ACADEMIA-IMPACTO-CORTE4-PROTECTED-SMOKE-PASS-20260729.md`;
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
- readOnly=true / writeMode=disabled;
- backend vacío visible como vacío;
- error de lectura fail-closed;
- no fallback mock/localStorage;
- base legacy/preexistente prohibida.

## 5. Firebase nuevo — Gates 1–3 PASS

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

Intento válido: commit `b698a925f5f6a7c8405afb7fb54a9f4c551e8498`.

Evidencia sanitizada:

- `cxorbia/c4smoke-error-NONE`;
- `cxorbia/c4smoke-srcfirestore-etrue-fbfalse-rotrue`;
- `cxorbia/c4cleanup-u0-emailfalse`.

Resultado comprobado:

- `source=firestore`;
- `empty=true`;
- `fallbackUsed=false`;
- `readOnly=true` / `writeMode=disabled`;
- interfaz pública `CX.data` preservada;
- claims temporales `role=admin`, `tenantId=tya` verificados por el smoke exitoso;
- Firestore document writes=0;
- operador temporal eliminado;
- Auth users final=0;
- Email/Password final=deshabilitado.

No hubo materialización de datos TyA.

### Falso negativo de reporting — resuelto

El status agregado del workflow quedó `error` porque el publicador exigía un segundo archivo de cleanup aun cuando el executor principal ya había ejecutado y verificado `cleanup.complete=true`. No fue fallo de Firebase ni del browser smoke.

Corrección de raíz: commit `9967146e112322efcd043155ae05351bbbbd4e8a`, sin volver a ejecutar el principal temporal. El publicador ahora acepta el cleanup verificado por el executor principal y no se auto-dispara al editar su propio workflow.

## 7. Seguridad actual

- Firestore document writes=0;
- Auth users permanentes=0;
- Email/Password=deshabilitado;
- Storage writes=0;
- Hosting deploy nuevo=0;
- Functions/imports/HR/Make/Gemini/payments/merge/production=0.

## 8. Siguiente acción exacta

`AUTORIZACIÓN SEPARADA HOSTING DEV DEL BUILD READ-ONLY → DEPLOY DEV → VALIDACIÓN VISUAL → CORRECCIÓN SOLO SI P0 REPRODUCIBLE → FREEZE CORTE 4 → RETIRAR IAM TEMPORAL A VIEWER`.

No se requiere PowerShell, nueva candidata, ZIP ni datos TyA.

## 9. Claude/prototipo y Academia

- Claude: sin nueva candidata; no tocar backend/contracts/adapters. Solo actuar si la validación visual demuestra P0 localizado.
- Academia: distinguir ejecución del gate, cleanup y status agregado; documentar falso negativo de reporting y su corrección sin rerun.
- Reusable CXOrbia: bootstrap idempotente/fail-closed, principal temporal reversible, smoke protegido, cleanup verificable y least privilege posterior.
