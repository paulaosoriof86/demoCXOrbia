# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-17 14:12 -06:00  
**Estado vivo:** `I1_PASS__I2_PASS__I3_1_PASS__I3_2B_EXACT_NO_PERIODS_ROOT_CAUSE_PROVEN__FOCAL_SOURCE_FIX_PASS__I3_2C_RUNTIME_GATE_NEXT__GO_LIVE_35`

## Prevalencia

Secuencia/porcentaje/subgates: `ADDENDUM-MAESTRO-PLAN-UNIFICADO-PHASE-A-NO-DESVIACION-CXORBIA-TYA-20260817.md`.

Source lock técnico actual: **`SOURCE-LOCK-I3-2B-NO-PERIODS-LIFECYCLE-ROOT-CAUSE-SOURCE-PASS-20260817.md`**.

## Carril

Repo `paulaosoriof86/demoCXOrbia`; rama única `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge; base `release/cxorbia-tya-rc-20260630`; DEV `cxorbia-backend-dev`.

No nueva candidata/rama/PR/workflow; no reauditoría general.

## Congelado — NO REPROCESAR

I1/I2 PASS; Historical Shopper `31906391682` PASS/reset consumido/`passwordResets=0`; TARGET_B Admin `32049054855` PASS; request08 consumido; HR 15/660 no reimport; Finance V2/source-safe/historical no rebuild; canonical V2/exact identity preserved; legal materialization/deploy previos no rerun/autoaccept.

## I3.2B resultado exacto

Run `32062886562`, job `95488006557`, artifact `9298816339`.

Blocker runtime exacto: **`staff_first_NO_PERIODS_VISIBLE`**.

Snapshot: Admin Staff/membership verified, 15 periodos, 660 visitas, current `cinepolis` / `cinepolis-2026-08`, authority/data ready, rail/view mounted, project selector sí, period selector no, empty/backend/source block false.

Legal quedó descartado como blocker actual: loaded=true, pending=false, providerAuthority=true, error=null, modal=false.

## Root cause + fix

Durante `CX.app.enter()`, backend-browser-auth reconstruye temporalmente `CX.session.user`; `router.mount()` corre antes del post-enter membership republish. El compat adapter perdía el scope verificado en esa ventana y caía al legacy `p.id===scopeProjectId`, por lo que root project `cinepolis` no coincidía con period ids `cinepolis-YYYY-MM`.

Fix focal en `tya-phase-a-authority-compat-v1.js`, commit `852ce453e7a65c5a49bdbfc378cdd1866ac0c697`: fallback transitorio solo desde membership C6 ya verificada, con tenant/namespace/role/projectIds exactos. No raw scopeProjectId; no UI/core/modules.

QA focal commit `a3e130387ceb4148aac85053dd4a2af471202a95`; source-preflight run `32063359036`, job `95489516680`: PASS; provider/deploy/writes/Historical Shopper access = 0.

## Progreso

I1 `15/15`; I2 `20/20`; I3 formal `0/25`; I4 `0/25`; I5 `0/15` = **35%/65%**.

Avance interno: I3.1 PASS; I3.2B causa exacta + fix source PASS. Falta runtime post-fix para cerrar I3.2/I3.3.

## Siguiente acción exacta

`I3.2C_EXACT_DEV_RUNTIME_CONFIRM_NO_PERIODS_LIFECYCLE_FIX`.

Requiere gate nuevo porque I3.2B consumió su único deploy. Debe certificar period selector + 15/660/AGO + legal no-pending + reload/new-tab. Si PASS: cerrar I3.2/I3.3 y continuar I3.4→I3.7 sin diagnóstico general.
