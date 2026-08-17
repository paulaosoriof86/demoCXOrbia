# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-17 14:50 -06:00  
**Estado vivo:** `I1_PASS__I2_PASS__I3_1_2_3_4_7_PASS__I3_5_HOLD_EXACT_CROSSWALK__I3_6_FROZEN_PASS_HARNESS_FIX__GO_LIVE_35`

## Prevalencia

Secuencia/porcentaje/subgates: `ADDENDUM-MAESTRO-PLAN-UNIFICADO-PHASE-A-NO-DESVIACION-CXORBIA-TYA-20260817.md`.
Source lock técnico actual: **`SOURCE-LOCK-I3-4-I3-7-READONLY-RESULT-I3-4-I3-7-PASS-I3-5-HOLD-20260817.md`**.
Último exact DEV build-lock: `app/docs/evidence/I3-2C-DEV-BUILD-LOCK-LATEST.json`.

## Carril

Repo `paulaosoriof86/demoCXOrbia`; rama única `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge; base `release/cxorbia-tya-rc-20260630`; DEV `cxorbia-backend-dev`.

No nueva candidata/rama/PR/workflow, no reauditoría general.

## Frozen/no reprocess

I1/I2 PASS; I3.1/I3.2/I3.3/I3.4/I3.7 PASS; Historical Shopper `31906391682` PASS/reset consumed/`passwordResets=0`; TARGET_B Admin `32049054855` PASS; request08 consumed; HR 15/660 no reimport; Finance V2/historical no rebuild; canonical V2/exact identity preserved; legal V0.4 receipt durable PASS/no autoaccept.

## I3.4→I3.7 read-only result

Request `i3-4-7-staff-runtime-authority-readonly-20260817-01`; target `80156d25682ffa28c224bb36c328a55fb77aef5f`; request commit `3dc7363a0b361910538422fd0fd1a7ab7fb95e8e`; run `32066894011`; job `95500120283`; artifact `9300261023`.

- **I3.4 PASS:** platform posts `0`, HR assignment projection `208`, synthetic `hr-post-*` in platform posts `0`, assignmentsArePostulations=false, stable reload/new-tab.
- **I3.5 HOLD:** identityMap `208`, reviewQueue `145`, reason `no_exact_hr_crosswalk`; target `shp-57d2e3769946` has no canonical map and retains 2 August visits; target canonical `TYA_GT_0C0BA8856E` has 0 August visits.
- **I3.6 frozen PASS/no product drift:** historical checkpoint remains PASS; canonical Shopper portal and membership blobs unchanged. Runner failed only because shallow checkout could not resolve old frozen commit.
- **I3.7 PASS:** V0.4 provider receipt accepted/human_ui, exact actor + current version/digest, provider-backed, pending=false, stable reload/new-tab.

The source-safe live `shp-*` ID is generated as a hash of HR Shopper text, so it cannot itself be promoted to an independent canonical exact anchor. No fuzzy/name/email/phone/username/code matching.

## Progreso

I1 `15/15`; I2 `20/20`; I3 formal `0/25`; I4 `0/25`; I5 `0/15` = **35%/65%**. I3 integral →60%.

## Siguiente acción exacta

`I3.5A_EXACT_TECHNICAL_CROSSWALK_SOURCE_HUNT__PLUS_I3.6_FROZEN_REFERENCE_HARNESS_FIX__SOURCE_ONLY`.

No deploy/write/provider mutation. If no independent exact crosswalk authority exists, declare provider-backed materialization required and request a separate write gate.
