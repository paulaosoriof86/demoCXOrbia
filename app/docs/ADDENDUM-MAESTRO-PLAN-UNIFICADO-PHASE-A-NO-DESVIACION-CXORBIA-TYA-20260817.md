# ADDENDUM MAESTRO — PLAN UNIFICADO PHASE A · NO DESVIACIÓN · CXORBIA TyA

**Fecha:** 2026-08-17  
**Última sincronización:** 2026-08-17 14:13 -06:00  
**Estado:** `ACTIVO__PREVALENTE__MISMA_CANDIDATA__NO_REPROCESO__I1_PASS__I2_PASS__I3_EN_CURSO__I3_2B_NO_PERIODS_ROOT_CAUSE_FIXED_SOURCE_ONLY__I3_2C_GATE_NEXT__I4_I5_PENDIENTES`  
**Repo:** `paulaosoriof86/demoCXOrbia`  
**Rama única:** `docs-tya-v6-v71-audit`  
**PR:** `#7` draft/open/no merge  
**Base:** `release/cxorbia-tya-rc-20260630`

## 0. Decisión

Este documento no crea un plan nuevo. Unifica Cortes 0B→8, controles S1→S6 y avance formal I1→I5. El source lock técnico más reciente prevalece para el detalle de implementación; ningún subgate PASS se repite.

No nueva candidata, rama, PR, workflow, reconstrucción general ni reauditoría general.

## 1. Crosswalk preservado

- Corte 0B: motor canónico histórico + tenant/login + visual → I1/I2/I3/I5.
- Corte 1: contexto/proyecto/periodos/HR/histórico → I1/I2/I3.
- Corte 2: ciclo Shopper → I3 identidad/persistencia + I4 operación.
- Corte 3: Finance/liquidaciones/pagos → I4, preservando Finance V2/histórico.
- Corte 4: `CX.data` backend/interfaz estable → I1/I2 PASS, validar por flujo.
- Corte 5: materialización DEV/idempotencia/trazabilidad → I2/I3/I4 gated.
- Corte 6: Auth/RBAC persona/rol/scope → I3.
- Corte 7: HR bidireccional/evidencias/conflictos → I4.
- Corte 8: preproducción/rollback/producción → I5.

S1 canonical runtime, S2 persistence, S3 Shopper/Auth, S4 HR bidirectional, S5 Finance y S6 same-build E2E continúan dentro de I1→I5.

## 2. Avance formal

I1 `15/15 PASS`; I2 `20/20 PASS`; I3 `0/25 EN CURSO`; I4 `0/25`; I5 `0/15`.

**GO-LIVE formal: 35% / 65%.** I3 integral →60%; I4 PASS →85%; I5 PASS →100%.

Subgates I3 cerrados quedan congelados aunque no sumen puntos parciales.

## 3. No reprocesar

Historical Shopper `31906391682` PASS/reset consumido/`passwordResets=0`; request08 consumido; TARGET_B Admin `32049054855` PASS; HR 15/660 no reimport; cumulative read model V2, Shopper portal V2, HR authority V2, state semantics V2, Finance V2 y exact identity preserved; Finance historical no rebuild; legal prior materialization/deploy no rerun; legal never autoaccept.

## 4. I3 sequence

### I3.1 authority/composition source fix
PASS.

### I3.2 runtime/build alignment
I3.2A deploy/parity proved exact DEV build. I3.2B granular runtime isolated `staff_first_NO_PERIODS_VISIBLE`.

I3.2B snapshot proved simultaneously: Admin Staff + membership verified + 15 periods + 660 visits + current `cinepolis` / `cinepolis-2026-08` + authority/data ready + rail/view mounted + project selector present + period selector absent. Empty shell/backend/source block were false.

Legal was loaded/provider-backed/not pending, no error/modal, so legal is not the current blocker.

Root cause exact: backend-browser-auth rebuilds transient session state inside canonical `CX.app.enter()`; synchronous `router.mount()` occurs before post-enter membership republish. During that narrow window the authority compat bridge previously fell through to legacy `p.id===scopeProjectId`, comparing root project `cinepolis` with period IDs `cinepolis-YYYY-MM`.

Source fix commit `852ce453e7a65c5a49bdbfc378cdd1866ac0c697`: transient fallback only from already-verified C6 membership and only if tenant/namespace/role/projectIds match exactly. No raw scopeProjectId trust, no UI/core/modules patch.

QA focal commit `a3e130387ceb4148aac85053dd4a2af471202a95`; source-preflight run `32063359036` PASS, provider/deploy/writes 0.

### I3.2C exact runtime confirmation — NEXT
Requires a new exact gate because I3.2B consumed its one deploy. Must certify:
1. project selector present;
2. period selector present;
3. 15 periods / 660 visits / August active;
4. legal loaded/provider-backed/not pending;
5. three reloads stable;
6. new tab stable;
7. no hidden source/backend blocker.

If PASS, close I3.2 and I3.3 immediately.

### I3.3 project/period/HR/history
Closes with I3.2C PASS: Cinépolis, 15 periods, August active, 660 visits, historical navigation intact.

### I3.4 postulation vs HR assignment
Persisted postulations only; HR assignments remain separate; zero synthetic HR approvals as platform posts.

### I3.5 exact August crosswalk
Review exact technical anchors only; no fuzzy/no reset historical.

### I3.6 Mi Perfil + historical Shopper
Session → exact canonical profile → history/certification; no credential/reset reprocessing.

### I3.7 durable legal receipt
Human acceptance already done. Validate provider-backed receipt exact identity/version/digest + reload/new-tab. No autoaccept.

### I3.8 Admin create/update one new Shopper provider-backed
Admin command → Auth/claims/membership/profile/crosswalk/ACK/readback under explicit write gate.

### I3.9 new Shopper E2E
Login/reload/new-tab/second context.

### I3.10 KPI/state semantics
Validate questionnaire/submit/out-of-range/liquidation/payment facets against canonical semantics.

### I3.11 integral same-build closure
Only here I3 becomes 25/25 and global progress 60%.

## 5. I4 coverage preserved

Documents/instructions; certification and history; available visits + real postulation; assignment/agenda/reprogram/cancel; realized/questionnaire/submit/review; HR bidirectional/Make gated; Finance; multi-project/config; roles/scopes; evidence/Storage; Academia/manuals/routes/notifications; Gemini gated/human review; S6 same-build E2E.

I4 PASS = 85% global.

## 6. I5

Freeze no P0 → exact SHA/manifest/build-lock/verifier → remote preproduction exact → rollback → same-build final E2E → explicit production authorization → deploy/cutover/smoke → `ACTIVE_BASELINE_PHASE_A_PRODUCTION`.

## 7. Circuit breakers

No repeat frozen PASS; no new candidate/branch/PR/workflow; no historical Shopper/Auth reprocessing; no HR reimport; no Finance rebuild; no fuzzy identity; no localStorage as productive truth; no success before provider ACK; no assignment HR as postulation; no hardcode Cinépolis globally; no legal autoaccept; no provider writes/deploy/merge/production outside explicit gate; one-shot consumed ≠ rerunnable.

## 8. Siguiente acción exacta

`I3.2C_EXACT_DEV_RUNTIME_CONFIRM_NO_PERIODS_LIFECYCLE_FIX`.

If PASS: close I3.2/I3.3 and continue I3.4→I3.7 directly without general diagnosis.
