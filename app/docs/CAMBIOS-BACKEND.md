# CAMBIOS-BACKEND.md

**Última actualización:** 2026-08-17 14:17 -06:00  
**Estado:** `I3_2B_NO_PERIODS_ROOT_CAUSE_PROVEN__FOCAL_SOURCE_FIX_PASS__I3_2C_GATE_NEXT__NO_REPROCESS`

## 2026-08-17 — I3.2B granular runtime + exact lifecycle correction

Request `i3-2b-granular-authenticated-staff-runtime-recheck-20260817-01`; run `32062886562`; job `95488006557`; artifact `9298816339`.

Artifact runtime authority: `staff_first_NO_PERIODS_VISIBLE`.

Snapshot proved valid Admin Staff membership, 15 periods, 660 visits, current `cinepolis-2026-08`, authority/data ready, rail/view mounted, project selector present, period selector absent, no empty/backend/source block. Legal was loaded/provider-backed/not pending, no error/modal.

### Root cause

`tya-c6-live-user-admin-membership-wiring-v1.js` verifies membership before `CX.app.enter()`. The canonical Auth wrapper rebuilds transient `CX.session.user` inside enter; synchronous `router.mount()` executes before post-enter membership republish. The old compat bridge therefore lost membershipVerified in that narrow window and fell through to legacy `p.id===scopeProjectId`, comparing root project `cinepolis` with period ids `cinepolis-YYYY-MM`.

### Product-adapter fix

`app/adapters/tya-phase-a-authority-compat-v1.js`, commit `852ce453e7a65c5a49bdbfc378cdd1866ac0c697`.

Added exact verified transition scope fallback: only already-verified C6 membership + authenticated backend context with exact tenant/namespace/role/projectIds. No raw scopeProjectId trust; no rail/router/core/module patch; no provider writes.

### QA

`tools/qa/cxorbia-c6-staff-lane-source-preflight.mjs`, commit `a3e130387ceb4148aac85053dd4a2af471202a95`.

Source-preflight request `i3-2b-no-periods-lifecycle-fix-source-preflight-20260817-01`; run `32063359036`; job `95489516680`; artifact `9298942951`; PASS. Provider/deploy/Auth/Firestore/HR/Rules/Storage/Make/Gemini/payment writes/Historical Shopper access = 0.

### Documentation

Source lock `SOURCE-LOCK-I3-2B-NO-PERIODS-LIFECYCLE-ROOT-CAUSE-SOURCE-PASS-20260817.md`; plan lock, unified plan, index, checkpoint, tracker, Claude, PENDIENTES, Academia and PR synchronized.

### Progreso

I1 15/15; I2 20/20; I3 0/25 formal; I4 0/25; I5 0/15 = **35%/65%**. I3.1 PASS; I3.2B exact root cause + source fix PASS; post-fix runtime pending.

### Next

`I3.2C_EXACT_DEV_RUNTIME_CONFIRM_NO_PERIODS_LIFECYCLE_FIX` under a new exact gate because I3.2B consumed its one deploy. PASS should close I3.2/I3.3 and continue I3.4→I3.7 without general diagnosis.

## Frozen

Historical Shopper `31906391682`, Admin `32049054855`, I1/I2, request08, HR 15/660, Finance V2/historical, canonical V2/exact identity, legal prior materialization/deploy. No reprocessing.

## Classification

Reusable CXOrbia: verified membership lifecycle bridge. Exclusive client: TyA/Cinépolis. Claude/prototype: no module/core changes. Academia: lifecycle/readiness. No impact Claude: tooling/gates except preserving the fix.
