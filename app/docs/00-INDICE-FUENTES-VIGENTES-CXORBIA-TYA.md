# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-07-30  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `CORTE6_AUTH_RBAC_READONLY_RECONCILED__MINIMAL_PROVIDER_DELTA_PREPARED_NO_EXECUTE__HOSTING_REDEPLOY_RESERVED_0OF1__NO_PRODUCTION`

## 1. Repositorio y destinos
- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Base: `release/cxorbia-tya-rc-20260630`.
- Backend DEV canónico: `cxorbia-backend-dev`.
- Hosting DEV existente: `cxorbia-backend-dev` / target `cxorbia-dev` / `https://cxorbia-backend-dev.web.app`.
- Hosting público final: `tya-plataforma`.
- Sandbox C4: no destino.
- No crear nuevo Firebase, Hosting, rama o PR por rutina.

## 2. Lectura obligatoria vigente
1. este índice;
2. reglas maestras + addenda de empalme/carril, Academia, patrones y antidesvío;
3. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
4. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
5. `CAMBIOS-BACKEND.md`;
6. `RESUMEN-PARA-CLAUDE.md`;
7. `PENDIENTES-PROTOTIPO.md`;
8. `PHASE-A-BLOCK-PROGRESS-TRACKER-TYA-20260704.md`;
9. `ACADEMIA-IMPACTO-CORTE6-AUTH-RBAC-20260730.md`;
10. `evidence/CORTE6-AUTH-RBAC-READONLY-RECONCILIATION-LATEST.json` + `.md`;
11. `CORTE5-EXISTING-HOSTING-DEV-PREFLIGHT-AUTH-DEPENDENCY-20260730.md`;
12. `evidence/R17N-FINAL-DEV-MATERIALIZATION-LATEST.json`;
13. `evidence/R17N-POST-MATERIALIZATION-READONLY-SMOKE-LATEST.json` + `.md`;
14. `evidence/CURRENT-HR-THROUGH-JULY-SOURCE-SAFE-LATEST.json`;
15. PR #7 y HEAD vivo.

## 3. Baseline no reabrir
- Corte 3 `CXORBIA-TYA-CORTE3-V182-20260729`: FROZEN.
- R17N FINAL: Firestore 1,406/1,406 writes y readback 1,406/1,406; mismatch0.
- Corte 5 CX.data: P0 proyecto/periodo corregido; re-smoke PASS source=firestore, fallback=false, project1, periods14, visits616, currentProject=`cinepolis`, currentPeriod=`2026-07`.
- No repetir materialización ni reabrir 210 refs/9 pendientes.

## 4. Fuente real vigente
- HR hasta julio 2026: 14 periodos/616 visitas/208 refs shopper.
- 208/208 refs listas →194 perfiles canónicos únicos.
- 77 certificaciones materializadas.
- 572 controles de liquidación.
- Agosto HN continúa HOLD por inconsistencia país/tab.

## 5. Corte 6 Auth/RBAC — evidencia actual
Read-only/source-safe:
- Auth users17; password activos17; tenant TyA válido13.
- operadores listos7.
- clientes2: tenant válido2, proyecto canónico0, ready0.
- shoppers4: tenant válido4, proyecto canónico0, shopperId exacto3, ready0.
- scopes legacy observados `tya` / `tya-piloto`; proyecto canónico Phase A `cinepolis`.
- provider writes0; PII exportada0.

Conclusión: claims legacy no alcanzan para visual real cliente/shopper bajo reglas actuales.

## 6. Corte 6 preparado NO EXECUTE
- Browser Auth Firebase interactivo solo en `index-backend-dev.html`.
- Adapter `CX.data` con reads acotados al principal autenticado.
- Config DEV sin password/email persistidos.
- `firestore.rules` preparada para campo canónico `status` y compatibilidad legacy `estado` en visita disponible.
- claim normalizer fail-closed preparado.
- request `.github/cxorbia-firebase-requests/corte6-auth-rbac-activation.json`: `enabled=false`, `consumed=false`.
- máximo previsto: 5 claim updates existentes =2 cliente +3 shopper con perfil exacto.
- no usuario nuevo/password/delete; Firestore data0; Hosting0; producción0.

## 7. Hosting DEV
Paula ya autorizó un único redeploy del Hosting DEV existente. Preflight lo dejó sin consumir:
- executions0/1;
- consumed=false;
- new Hosting=false;
- new Firebase project=false.

No volver a pedir autorización de Hosting. Consumirla únicamente después de PASS Auth/RBAC.

## 8. Siguiente gate único
`AUTORIZACIÓN CORTE6 AUTH CLAIMS MÁX5 + FIRESTORE RULES → EJECUTAR Y VERIFY READINESS → REDEPLOY HOSTING DEV YA AUTORIZADO → SMOKE REAL → FREEZE → REFRESH/RESOLVER AGOSTO → MATERIALIZAR SOLO DELTA AGOSTO → PREPROD/CUTOVER`.

## 9. Claude / Academia
- Claude: no nueva candidata; solo tarea localizada si smoke posterior demuestra P0 frontend reproducible.
- Academia: Auth real vs selector visual, scopes tenant/proyecto, shopperId, mínimo privilegio, visita disponible protegida y conflicto a review.

## 10. Estado seguro
R17N histórico: 1,406 writes ya ejecutados. Corte6 actual: Auth writes0; Firestore data writes0; Rules deploy0; Hosting deploy0; Storage/HR/legacy0; payments0; merge=false; production=false; Make/Gemini0; PII cruda repo/artifacts0.
