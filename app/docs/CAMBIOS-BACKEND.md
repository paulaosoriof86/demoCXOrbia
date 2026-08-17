# CAMBIOS-BACKEND.md

**Última actualización:** 2026-08-17 14:20 -06:00  
**Estado:** `I3_2B_NO_PERIODS_ROOT_CAUSE_PROVEN__FOCAL_SOURCE_FIX_PASS__I3_2C_GATE_NEXT__NO_REPROCESS`

## I3.2B — granular runtime and exact lifecycle correction

- Runtime request `i3-2b-granular-authenticated-staff-runtime-recheck-20260817-01`.
- Run `32062886562`, job `95488006557`, artifact `9298816339`.
- Exact runtime blocker: `staff_first_NO_PERIODS_VISIBLE`.
- Runtime simultaneously proved valid Admin Staff membership, 15 periods, 660 visits, current `cinepolis-2026-08`, authority/data ready, rail/view mounted and project selector present.
- Period selector alone was absent; empty/backend/source block were false.
- Legal was loaded/provider-backed/not pending, no error/modal.

### Root cause

Canonical Auth wrapper rebuilds transient session state inside `CX.app.enter()`; synchronous router mount occurs before post-enter verified membership republish. During this narrow window the old compatibility bridge fell to legacy `p.id===scopeProjectId`, comparing root scope `cinepolis` with period IDs `cinepolis-YYYY-MM`.

### Focal source fix

`app/adapters/tya-phase-a-authority-compat-v1.js`, commit `852ce453e7a65c5a49bdbfc378cdd1866ac0c697`.

Uses an exact transient fallback only from already-verified C6 membership and matching authenticated context tenant/namespace/role/projectIds. No raw scopeProjectId, no direct rail/router/UI patch, no core/modules change.

### QA

`tools/qa/cxorbia-c6-staff-lane-source-preflight.mjs`, commit `a3e130387ceb4148aac85053dd4a2af471202a95`.

Source-preflight `32063359036` / `95489516680` PASS. Provider/deploy/Auth/Firestore/HR/Rules/Storage/Make/Gemini/payment writes/Historical Shopper access = 0.

### Documentation

Current source lock `SOURCE-LOCK-I3-2B-NO-PERIODS-LIFECYCLE-ROOT-CAUSE-SOURCE-PASS-20260817.md`; unified plan, Phase A lock, index, checkpoint, tracker, Claude, PENDIENTES and Academia synchronized.

### Progress

I1 15/15; I2 20/20; I3 0/25 formal; I4 0/25; I5 0/15 = **35%/65%**. I3.1 PASS; I3.2B exact root cause + source fix PASS; post-fix runtime pending.

### Next exact gate

`I3.2C_EXACT_DEV_RUNTIME_CONFIRM_NO_PERIODS_LIFECYCLE_FIX`.

New exact authorization is required because I3.2B consumed its one allowed deploy. PASS must certify period selector + 15/660/AGO + legal no-pending + 3 reloads + new-tab, then close I3.2/I3.3 and continue I3.4→I3.7 directly.

## Frozen

Historical Shopper `31906391682`, Admin `32049054855`, I1/I2, request08, HR 15/660, Finance V2/historical, canonical V2/exact identity, legal previous materialization/deploy. No reprocessing.

## Classification

Reusable CXOrbia: verified membership lifecycle bridge. Exclusive client: TyA/Cinépolis. Claude/prototype: no module/core changes. Academia: lifecycle/readiness. No impact Claude: tooling/gates except preserving the fix.
