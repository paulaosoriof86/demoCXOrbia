# CAMBIOS-BACKEND.md

**Última actualización:** 2026-08-17 14:53 -06:00  
**Estado:** `I3_4_PASS__I3_5_HOLD_EXACT_CROSSWALK__I3_6_FROZEN_PASS_HARNESS_FIX__I3_7_PASS__NO_REPROCESS`

## 2026-08-17 — I3.4→I3.7 Staff-only read-only authority block

Request `i3-4-7-staff-runtime-authority-readonly-20260817-01`; target `80156d25682ffa28c224bb36c328a55fb77aef5f`; request commit `3dc7363a0b361910538422fd0fd1a7ab7fb95e8e`; run `32066894011`; job `95500120283`; artifact `9300261023`; digest `sha256:dba8d25a325ffa51668faf66b219a3d86271e23f2c8fad5075513a04eeaaeafc`.

Safety: Staff/Admin only; Historical Shopper access/Shopper credential selection/Client credential selection/user changes/password changes/resets/provider-data writes/deploy/merge/production = 0/false.

### I3.4 PASS

Platform posts `0`; HR assignments `208`; synthetic `hr-post-*` inside platform posts `0`; `hrAssignmentsArePostulations=false`; stable across reloads/new-tab. HR assignment ≠ platform postulation is now runtime-certified.

### I3.5 HOLD exact

IdentityMap `208`; reviewQueue `145`; reason `no_exact_hr_crosswalk`. Target live `shp-57d2e3769946` maps to no canonical ID, retains 2 August visits; canonical `TYA_GT_0C0BA8856E` has 0 August visits.

Source-only inspection proved `shp-*` and `shopperCode` are deterministic hashes of HR Shopper text, not independent provider identity anchors. They cannot be used to bridge the canonical profile under the anti-fuzzy rule. No name/email/phone/username/hash-derived shortcut is permitted.

### I3.6 underlying PASS / harness focal

Frozen checkpoint remains PASS; current canonical Shopper portal and shopper membership adapter blobs equal their frozen-source blobs. The runner failed only because checkout depth `2` could not resolve frozen commit `e4d6de3e...`. No historical Shopper re-login/recovery/reset.

### I3.7 PASS

V0.4 provider receipt: accepted, `human_ui`, subject exact, actor exact, current content/version/digest exact, pending=false, provider authority, stable first load + 3 reloads + new-tab. No auto-consent.

### Tooling source-only

Added/reused Staff-only read-only I3 profile through existing `.github/workflows/cxorbia-readonly-post-gates-runner.yml`; no new workflow. Added `tools/qa/tya-i3-staff-authority-readonly.mjs`; extended Staff browser smoke and source preflight; controlled-runner contract updated. The read-only request was consumed/disabled in commit `1c4c85cd2c23b5b3f16a5fd7a2f5f5735369ab94`.

### Current source lock

`SOURCE-LOCK-I3-4-I3-7-READONLY-RESULT-I3-4-I3-7-PASS-I3-5-HOLD-20260817.md`.

### Progress

Formal **35% / 65%**. I3.1-4 and I3.7 PASS/frozen; I3.6 product frozen PASS/harness closure pending; I3.5 real blocker.

### Next

`I3.5A_EXACT_TECHNICAL_CROSSWALK_SOURCE_HUNT__PLUS_I3.6_FROZEN_REFERENCE_HARNESS_FIX__SOURCE_ONLY`.

## Frozen/no reprocess

Historical Shopper `31906391682`; TARGET_B Admin `32049054855`; request08; HR 15/660; Finance V2/historical; canonical V2/exact identity; durable legal receipt. No fuzzy identity, HR reimport, Finance rebuild or autoaccept.

## Classification

Reusable CXOrbia: authority separation/exact-identity fail-closed/frozen evidence reuse. Exclusive client: TyA August technical crosswalk. Claude/prototype: no UI changes. Academia: distinguish source-safe derived ID from canonical identity anchor. No impact Claude: tooling except preserved authority rules.
