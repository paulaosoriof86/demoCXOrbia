# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-17 14:55 -06:00  
**Estado:** `I3_4_PASS__I3_5_EXACT_CROSSWALK_HOLD__I3_6_FROZEN_PASS_HARNESS_FIX__I3_7_PASS`

Plan: `ADDENDUM-MAESTRO-PLAN-UNIFICADO-PHASE-A-NO-DESVIACION-CXORBIA-TYA-20260817.md`.
Source lock: `SOURCE-LOCK-I3-4-I3-7-READONLY-RESULT-I3-4-I3-7-PASS-I3-5-HOLD-20260817.md`.

## Closed/frozen

I1/I2/I3.1/I3.2/I3.3/I3.4/I3.7 PASS; Historical Shopper `31906391682`; Admin `32049054855`; request08; HR 15/660; Finance V2/historical; legal durable V0.4 receipt.

## Current exact pending

1. **I3.5A** find/reuse an independent exact technical crosswalk authority for August. Current target has `no_exact_hr_crosswalk`; live `shp-*` is name-text-derived and cannot be used as canonical identity authority.
2. **I3.6 harness closure**: frozen Shopper evidence/source are unchanged; fix shallow checkout/reference comparison without Shopper login/access.
3. If no exact crosswalk exists, declare `I3_5_PROVIDER_BACKED_CROSSWALK_MATERIALIZATION_REQUIRED` and obtain explicit write gate before materialization.
4. I3.8/I3.9 new Shopper provider-backed create/update + E2E under write gate.
5. I3.10 KPI/state semantics.
6. I3.11 integral same-build close.
7. I4 complete Phase A.
8. I5 exact production cutover.

## Evidence

Run `32066894011`: I3.4 PASS, I3.7 PASS, I3.5 exact HOLD, I3.6 harness-only issue. No deploy/writes/historical Shopper credential access.

## Progress

Formal **35% / 65%**. I3 integral →60%; I4→85%; I5→100%.

## Acción actual

`I3.5A_EXACT_TECHNICAL_CROSSWALK_SOURCE_HUNT__PLUS_I3.6_FROZEN_REFERENCE_HARNESS_FIX__SOURCE_ONLY`.
