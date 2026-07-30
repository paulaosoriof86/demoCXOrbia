# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-07-30  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `CORTE3_FROZEN__R17N_FINAL_DEV_MATERIALIZED_1406__PROVIDER_COMPARE_IDENTITY_PASS__P0_C5_CXDATA_PERIOD_MODEL__RUNTIME_FIX_AUTH_PENDING__NO_PRODUCTION`

## 1. Repositorio
- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Base: `release/cxorbia-tya-rc-20260630`.
- Backend DEV canónico: `cxorbia-backend-dev`.
- Legacy/Hosting final: `tya-plataforma`.
- Sandbox C4: no destino de materialización.

## 2. Lectura obligatoria vigente
1. este índice;
2. reglas maestras + addenda de empalme/carril, Academia, patrones y antidesvío;
3. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
4. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
5. `ADDENDUM-IDENTIDAD-REAL-SHOPPER-PII-SOURCE-SAFE-VS-PLATAFORMA-20260729.md`;
6. `evidence/CURRENT-HR-THROUGH-JULY-SOURCE-SAFE-LATEST.json`;
7. `evidence/VISIT-IDENTITY-CROSSWALK-READONLY-LATEST.json`;
8. `evidence/CURRENT-UNRESOLVED-SHOPPER-IDENTITY-READONLY-LATEST.json`;
9. `evidence/LEGACY-SHOPPERS-CERTIFICATIONS-REFRESH-LATEST.json`;
10. `evidence/R17N-FINAL-WRITE-PLAN-NO-EXECUTE-LATEST.json`;
11. `evidence/R17N-FINAL-DEV-MATERIALIZATION-LATEST.json`;
12. `evidence/R17N-POST-MATERIALIZATION-READONLY-SMOKE-LATEST.json`;
13. CAMBIOS/Claude/PENDIENTES/Academia/tracker más recientes;
14. PR #7 y HEAD vivo.

## 3. Baseline no reabrir
Corte 3 permanece `FROZEN_ACTIVE_BASELINE` en `CXORBIA-TYA-CORTE3-V182-20260729`:
- 14 periodos / 616 visitas hasta julio;
- mayo 44 pagadas;
- junio 2 pagadas / 42 pendientes;
- no V183/R33.

## 4. Fuente e identidad vigentes
HR viva actual hasta julio:
- 14 periodos;
- 616 visitas;
- 208 referencias shopper;
- el snapshot previo de 210 refs / 9 pendientes quedó superado;
- Agosto HN sigue HOLD por país/tab inconsistente.

Identidad actual:
- 201 refs reutilizan shopper canónico existente;
- 2 enlazan perfiles legacy create;
- 5 crean perfil desde HR viva;
- 208/208 ready;
- 0 HOLD de identidad actual.

Nota de crosswalk: las 208 referencias HR resuelven a 194 perfiles shopper canónicos únicos; varias referencias históricas pueden converger determinísticamente al mismo perfil. Esto no es conflicto ni dedupe por nombre.

Legacy útil:
- 149 shoppers únicos;
- 120 perfiles create materializados;
- 22 existing updates siguen HOLD;
- 7 perfiles legacy HOLD;
- 78 certificaciones útiles = 77 materializadas + 1 HOLD.

## 5. R17N FINAL — MATERIALIZACIÓN DEV PASS
Autorización `r17n-final-dev-20260730-01` consumida.

Resultado:
- preflight: 1,406 absent / 0 same / 0 conflict;
- identidad HR revalidada en memoria: 208/208;
- targets canónicos existentes verificados: 201/201;
- 201/201 ya tienen nombre real visible;
- links financieros R14C exactos: 196;
- Firestore writes: **1,406/1,406**;
- readback: **1,406/1,406**;
- mismatch: 0.

Grupos:
- foundation 16;
- perfiles legacy 120;
- perfiles HR actuales 5;
- certificaciones 77;
- visitas 616;
- controles de liquidación 572.

Excluido: tenant update1, existing updates22, legacy holds7, certification hold1, Agosto HN, deletes, pagos/lotes, Auth/Storage/HR/legacy writes, deploy/merge/producción.

## 6. Post-compare read-only — PROVIDER + IDENTIDAD PASS
Run `30514060348`, artifact `8748181730`, digest `sha256:a23f06035043de8568a826aefb52cfce5df9781b3a9b86ccf8238f8fd1c8d3cf`.

Provider:
- 1,406/1,406 rutas materializadas presentes;
- missing 0;
- authorization drift 0;
- production=true 0;
- tenant sin update R17N;
- proyecto padre `cinepolis` presente;
- 14 periodos canónicos;
- 616 visitas;
- 572 controles liquidación;
- 77 certificaciones;
- payments 0 / lots 0.

Identidad:
- 208/208 source refs esperadas;
- 194/194 perfiles canónicos únicos esperados;
- 616/616 visitas con nombre real y target shopper existente;
- 194/194 perfiles referenciados con nombre real;
- 77/77 certificaciones con shopper existente;
- placeholders demo visibles: 0.

## 7. P0 PROVEN — Corte 5 CX.data period model
Decisión: `P0_PROVEN_C5_CXDATA_PERIOD_MODEL_MISMATCH`.

El proveedor y la materialización están correctos; el fallo está localizado en `app/core/backend-firebase.js`:
- `loadTenantData()` lee `tenants/tya/projects` y `buildPeriods()` transforma los documentos de proyecto en periodos;
- no consume la subcolección canónica `tenants/tya/projects/cinepolis/periods`;
- smoke exacto, incluso forzando el padre `cinepolis`, obtiene `projects=1`, `visits=616`, `source=firestore`, `fallback=false`, pero `periods=30` y `currentPeriodId=cinepolis`;
- esperado: 14 periodos canónicos y `currentPeriodId` perteneciente a esos 14 IDs.

Por tanto Corte 5 NO se congela y Corte 6 NO inicia todavía.

## 8. Gate vivo único
`AUTORIZACIÓN EXPRESA DE CORRECCIÓN FOCAL P0-C5-CXDATA-PERIOD-MODEL → PATCH BACKEND ADAPTER SOLAMENTE → POST-COMPARE/SMOKE READ-ONLY → VALIDACIÓN OPERATIVA → FREEZE CORTE 5 → CORTE 6 AUTH/RBAC`.

No repetir materialización. No tocar datos ya escritos. No nueva base/candidata/PR. No UI patch. Cualquier runtime fix requiere autorización expresa por P0 demostrado.

## 9. Claude / Academia
- Claude: no nueva candidata. El P0 está localizado en adapter backend; frontend no debe reinterpretar el modelo.
- Academia: materialización/readback correctos, diferencia referencia HR vs perfil canónico, proyecto padre vs periodos y validación fail-closed post-write.

## 10. Estado seguro
R17N histórico: 1,406 Firestore writes autorizados ya ejecutados. En el bloque post-compare actual: provider reads únicamente; provider/data/Auth/Storage/HR/legacy writes=0; deletes=0; pagos=0; deploy=0; merge=false; producción=false; Make/Gemini=0; PII cruda en repo/artifacts=0.
