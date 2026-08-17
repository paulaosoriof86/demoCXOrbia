# GO-LIVE PROGRESS TRACKER — ROOT CAUSE · CXORBIA TyA

**Fecha:** 2026-08-17 14:05 -06:00

| Iteración | Peso | Estado |
|---|---:|---|
| I1 | 15 | PASS 15/15 |
| I2 | 20 | PASS 20/20 |
| I3 | 25 | 0/25 formal; I3.1 PASS; I3.2B exact blocker fixed in source |
| I4 | 25 | 0/25 |
| I5 | 15 | 0/15 |

**GO-LIVE formal: 35% / 65%.** I3 integral →60%; I4 →85%; I5 →100%.

## I3.2B

Run `32062886562`, job `95488006557`, artifact `9298816339` isolated `staff_first_NO_PERIODS_VISIBLE`.

At failure: 15 periods, 660 visits, current `cinepolis` / `cinepolis-2026-08`, membership/authority/data ready, rail mounted, project selector yes, period selector no. Legal loaded/provider-backed/not pending; not the blocker.

Root cause: synchronous `router.mount()` occurs inside canonical `CX.app.enter()` during the narrow window after Auth wrapper rebuilds session and before verified membership metadata is republished. Legacy fallback interprets `cinepolis` as period id and hides all `cinepolis-YYYY-MM` rows.

Fix: `tya-phase-a-authority-compat-v1.js` commit `852ce453e7a65c5a49bdbfc378cdd1866ac0c697` uses only already-verified C6 membership scope with exact tenant/namespace/role/projectIds during this transition. No raw `scopeProjectId`, no UI/core/module patch.

Source QA commit `a3e130387ceb4148aac85053dd4a2af471202a95`; source-preflight run `32063359036` / job `95489516680`: PASS, zero provider/deploy/writes/Historical Shopper access.

## No reprocesar

Historical Shopper `31906391682`; Admin `32049054855`; I1/I2; request08; HR 15/660; Finance V2/historical; canonical V2/exact identity; legal previous materialization/deploy.

## I3 next

`I3.2C_EXACT_DEV_RUNTIME_CONFIRM_NO_PERIODS_LIFECYCLE_FIX` under a new exact gate because I3.2B consumed its one deploy. PASS must certify period selector + 15/660/AGO + legal no-pending + reload/new-tab. Then close I3.2/I3.3 and continue I3.4→I3.7 directly.
