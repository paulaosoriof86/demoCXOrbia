# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-17 14:18 -06:00  
**Estado:** `I1_PASS__I2_PASS__I3_1_PASS__I3_2B_NO_PERIODS_ROOT_CAUSE_PROVEN__FOCAL_FIX_SOURCE_PASS__I3_2C_GATE_NEXT__GO_LIVE_35__NO_PRODUCTION`

Repo `paulaosoriof86/demoCXOrbia`; rama `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge; DEV `cxorbia-backend-dev`.

Plan: `ADDENDUM-MAESTRO-PLAN-UNIFICADO-PHASE-A-NO-DESVIACION-CXORBIA-TYA-20260817.md`.
Source lock: `SOURCE-LOCK-I3-2B-NO-PERIODS-LIFECYCLE-ROOT-CAUSE-SOURCE-PASS-20260817.md`.

## Frozen/no reprocess

I1/I2 PASS; Historical Shopper `31906391682` PASS/reset consumed/`passwordResets=0`; request08 consumed; TARGET_B Admin `32049054855` PASS; HR 15/660 no reimport; Finance V2/historical no rebuild; canonical V2/exact identity preserved; legal prior materialization/deploy no rerun/autoaccept.

## I3.2B

Run `32062886562`, job `95488006557`, artifact `9298816339` isolated `staff_first_NO_PERIODS_VISIBLE`.

Snapshot: valid Admin Staff membership, 15 periods, 660 visits, current `cinepolis` / `cinepolis-2026-08`, authority/data ready, rail/view mounted, project selector yes, period selector no, empty/backend/source block false. Legal loaded/provider-backed/not pending.

Root cause exact: canonical Auth wrapper rebuilds transient session state inside `CX.app.enter()`; synchronous router mount happens before post-enter membership republish, so the old compat bridge fell to legacy `p.id===scopeProjectId` and hid all `cinepolis-YYYY-MM` rows for root scope `cinepolis`.

Fix source-only `tya-phase-a-authority-compat-v1.js` commit `852ce453e7a65c5a49bdbfc378cdd1866ac0c697`: transient fallback only from already-verified C6 membership with exact tenant/namespace/role/projectIds. No raw scopeProjectId, no UI/core/modules.

QA commit `a3e130387ceb4148aac85053dd4a2af471202a95`; source-preflight `32063359036` / `95489516680` PASS, provider/deploy/writes 0.

## Progress

I1 15/15; I2 20/20; I3 0/25 formal; I4 0/25; I5 0/15 = **35%/65%**. I3.1 PASS; I3.2B exact root cause + source fix PASS.

## Next exact action

`I3.2C_EXACT_DEV_RUNTIME_CONFIRM_NO_PERIODS_LIFECYCLE_FIX`.

New gate required because I3.2B consumed its one deploy. Certify period selector + 15/660/AGO + legal no-pending + three reloads + new-tab. PASS closes I3.2/I3.3 and continues I3.4→I3.7 directly.
