# GO-LIVE PROGRESS TRACKER — ROOT CAUSE · CXORBIA TyA

**Fecha:** 2026-08-17 14:14 -06:00

| Iteración | Peso | Estado |
|---|---:|---|
| I1 | 15 | PASS 15/15 |
| I2 | 20 | PASS 20/20 |
| I3 | 25 | 0/25 formal; I3.1 PASS; I3.2B exact blocker fixed source-only; I3.2C runtime next |
| I4 | 25 | 0/25 |
| I5 | 15 | 0/15 |

**GO-LIVE formal: 35% / 65%.** I3 integral →60%; I4 →85%; I5 →100%.

## I3.2B

Run `32062886562`, job `95488006557`, artifact `9298816339` isolated `staff_first_NO_PERIODS_VISIBLE`.

Runtime already had 15 periods, 660 visits, current August, valid Staff membership/authority/data, rail/view mounted and project selector present. Only period selector was absent. Legal was loaded/provider-backed/not pending and is not the current blocker.

Root cause: canonical Auth wrapper rebuilds transient session state inside `CX.app.enter()` before synchronous `router.mount()`, while verified membership metadata is republished only after enter returns. The compat bridge therefore fell temporarily to legacy `p.id===scopeProjectId`, comparing `cinepolis` to period IDs.

Fix source-only: `tya-phase-a-authority-compat-v1.js` commit `852ce453e7a65c5a49bdbfc378cdd1866ac0c697`, using only already-verified membership with exact tenant/namespace/role/projectIds during that lifecycle window. No raw scopeProjectId, no UI/core/module patch.

QA focal commit `a3e130387ceb4148aac85053dd4a2af471202a95`; source-preflight `32063359036` / `95489516680` PASS, zero provider/deploy/writes/Historical Shopper access.

## Frozen

Historical Shopper `31906391682`; Admin `32049054855`; I1/I2; request08; HR 15/660; Finance V2/historical; canonical V2/exact identity; legal previous materialization/deploy.

## Next

`I3.2C_EXACT_DEV_RUNTIME_CONFIRM_NO_PERIODS_LIFECYCLE_FIX` under a new exact one-shot gate. PASS must certify period selector + 15/660/AGO + legal no-pending + reload/new-tab, then close I3.2/I3.3 and continue I3.4→I3.7 directly.
