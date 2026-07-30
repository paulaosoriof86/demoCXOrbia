# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-07-30  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `CORTE3_FROZEN__R17N_FINAL_DEV_MATERIALIZED_1406__C5_CXDATA_PERIOD_MODEL_FIXED__READONLY_RESMOKE_PASS__EXISTING_HOSTING_VISUAL_PREFLIGHT_AUTH_HOLD__DEPLOY0__NO_PRODUCTION`

## 1. Repositorio
- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Base: `release/cxorbia-tya-rc-20260630`.
- Backend DEV canónico: `cxorbia-backend-dev`.
- Hosting DEV de visualización existente: `cxorbia-backend-dev` / target `cxorbia-dev` / `https://cxorbia-backend-dev.web.app`.
- Legacy/Hosting final: `tya-plataforma`.
- Sandbox C4: no destino de materialización.
- No crear nuevo Firebase ni nuevo Hosting por rutina.

## 2. Lectura obligatoria vigente
1. este índice;
2. reglas maestras + addenda de empalme/carril, Academia, patrones y antidesvío;
3. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
4. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
5. `CORTE5-EXISTING-HOSTING-DEV-PREFLIGHT-AUTH-DEPENDENCY-20260730.md`;
6. `ADDENDUM-IDENTIDAD-REAL-SHOPPER-PII-SOURCE-SAFE-VS-PLATAFORMA-20260729.md`;
7. `evidence/CURRENT-HR-THROUGH-JULY-SOURCE-SAFE-LATEST.json`;
8. `evidence/VISIT-IDENTITY-CROSSWALK-READONLY-LATEST.json`;
9. `evidence/CURRENT-UNRESOLVED-SHOPPER-IDENTITY-READONLY-LATEST.json`;
10. `evidence/LEGACY-SHOPPERS-CERTIFICATIONS-REFRESH-LATEST.json`;
11. `evidence/R17N-FINAL-WRITE-PLAN-NO-EXECUTE-LATEST.json`;
12. `evidence/R17N-FINAL-DEV-MATERIALIZATION-LATEST.json`;
13. `evidence/R17N-POST-MATERIALIZATION-READONLY-SMOKE-LATEST.json` + `.md`;
14. addenda más recientes de CAMBIOS/Claude/PENDIENTES/Academia y tracker;
15. PR #7 y HEAD vivo.

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
- snapshot previo 210 refs /9 pendientes superado;
- Agosto HN HOLD por país/tab inconsistente.

Identidad:
- 208/208 refs listas;
- resuelven a 194 perfiles canónicos únicos;
- 616/616 visitas con nombre real y target existente;
- 77/77 certificaciones con shopper existente;
- placeholders demo 0.

Legacy útil:
- 149 shoppers únicos;
- 120 perfiles create materializados;
- 22 existing updates HOLD;
- 7 perfiles legacy HOLD;
- 78 certificaciones útiles =77 materializadas +1 HOLD.

## 5. R17N FINAL — MATERIALIZACIÓN DEV PASS
Autorización consumida `r17n-final-dev-20260730-01`.

- Firestore writes: **1,406/1,406**;
- readback: **1,406/1,406**;
- mismatch: 0;
- foundation16 + legacy profiles120 + HR profiles5 + certifications77 + visits616 + liquidation controls572.

Excluido: tenant update1, existing updates22, legacy holds7, certification hold1, Agosto HN, deletes, pagos/lotes, Auth/Storage/HR/legacy writes, deploy/merge/producción.

## 6. Corte 5 — P0 de modelo proyecto/periodo corregido
P0 histórico: `P0_PROVEN_C5_CXDATA_PERIOD_MODEL_MISMATCH`.

Runtime fix:
- archivo `app/core/backend-firebase.js`;
- commit `96cb7601559a76595d6203724a4bcf2d0b35b390`;
- `CX.data.periods` ya consume `tenants/tya/projects/<projectId>/periods`;
- project docs raíz ya no son periodos;
- `currentPeriodId` stale se sustituye por un ID canónico.

Instrumentación QA:
- primer post-fix `30544254033` dio `periods=0` porque el snapshot simulado no incluía `periods`, no por fallo del proveedor/runtime;
- harness corregido en `21ce464772bfe6543b3672ad4b6d7deafd564adc` para incluir los periodos ya leídos del proveedor en el snapshot en memoria.

## 7. Re-smoke read-only final — PASS
Run `30544595440`; artifact `8760141578`; digest `sha256:337c4e8b07786effea5c326c77dfb31f9edc2fa49e09d7e46e18fa4c8dacbc98`.

Provider:
- 1,406/1,406 rutas;
- missing/auth drift/production drift 0/0/0;
- parent project `cinepolis` presente;
- 14 periodos;
- 616 visitas;
- 572 controles;
- 77 certificaciones;
- payments/lots 0/0.

CX.data:
- `source=firestore`;
- `fallbackUsed=false`;
- interfaz preservada;
- projects=1;
- periods=14;
- visits=616;
- currentProjectId=`cinepolis`;
- currentPeriodId=`2026-07`;
- adapterPeriodIds = canonicalPeriodIds;
- read-only/writeMode disabled;
- blockers 0.

## 8. Hosting DEV existente — preflight Auth HOLD antes de deploy
Paula autorizó un único redeploy del Hosting DEV **existente**, no la creación de otro.

El preflight verificó el destino correcto y detuvo la ejecución antes de consumirla:
- Hosting DEV existente = `cxorbia-backend-dev` / target `cxorbia-dev`;
- new Hosting=false;
- new Firebase project=false;
- deploy ejecutado=0;
- autorización de deploy consumida=false.

Bloqueo seguro:
- Firestore requiere usuario autenticado + claims para leer datos reales;
- `index-backend-dev.html` requiere Firebase Auth para su preview real;
- los botones visibles de rol en `app.js` no son autenticación Firebase;
- el alcance autorizado excluye Auth writes/Rules deploy;
- credenciales/tokens/PII no pueden publicarse en JS/URL/Hosting.

La autorización del redeploy queda reservada; no se solicita otra autorización de Hosting mientras siga 0/1.

## 9. Gate vivo único
Estado máximo actual: `CORTE5_TECHNICAL_PASS__VISUAL_BLOCKED_BY_SECURE_AUTH_PREREQUISITE__DEPLOY_NOT_CONSUMED`.

Siguiente gate:
`CORTE6 AUTH/RBAC PREP READ-ONLY/OFFLINE → reconciliar Auth existente + claims + login seguro → autorización solo para cambios Auth/Rules mínimos → reutilizar el MISMO Hosting DEV y el redeploy ya autorizado → validación visual real → freeze`.

No repetir materialización. No tocar UI por rutina. No nueva base/candidata/rama/PR/Hosting. No producción ni cutover `tya-plataforma` todavía.

## 10. Claude / Academia
- Claude: no nueva candidata. El login visible debe convertirse en autenticación real antes de producción; no usar selector de rol como sustituto de Auth.
- Academia: selección de rol ≠ autenticación, Hosting con PII requiere RBAC, proyecto padre vs periodo, readback vs consumidor runtime e identidad real vs source-safe.

## 11. Estado seguro
R17N histórico: 1,406 writes autorizados ya ejecutados. Bloque actual: Hosting deploy=0; Firestore/Auth/Storage/HR/legacy writes=0; Rules/Functions deploy=0; deletes=0; pagos=0; merge=false; producción=false; Make/Gemini=0; PII cruda repo/artifacts=0.
