# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-17 15:11 -06:00  
**Estado:** `I3_5_PROVIDER_CROSSWALK_REQUIRED__I3_6_PRODUCT_PASS_HARNESS_SOURCE_FIXED__I3_8_NEXT_AFTER_GATE`

Plan: `ADDENDUM-MAESTRO-PLAN-UNIFICADO-PHASE-A-NO-DESVIACION-CXORBIA-TYA-20260817.md`.
Source lock: `SOURCE-LOCK-I3-5A-NO-INDEPENDENT-CROSSWALK-I3-6-HARNESS-SOURCE-FIX-20260817.md`.

## Closed/frozen

I1/I2/I3.1/I3.2/I3.3/I3.4/I3.7 PASS; Historical Shopper `31906391682`; Admin `32049054855`; request08; HR 15/660; Finance V2/historical; legal durable V0.4 receipt. I3.6 product/evidence frozen PASS; harness source defect fixed without Shopper reprocess.

## Current exact pending

1. **I3.5B** provider-backed exact crosswalk validation/materialization for one August target only. Prove independent exact authority first; if absent STOP zero writes; if present max one identity-link materialization/update + ACK/readback.
2. **I3.6 closure evidence** may reuse frozen evidence + corrected harness; never historical Shopper login/recovery/reset.
3. **I3.8/I3.9** new Shopper provider-backed create/update + E2E under separate write gate as plan requires.
4. **I3.10** KPI/state semantics.
5. **I3.11** integral same-build close.
6. **I4** complete Phase A.
7. **I5** exact production cutover.

## Identity rule

I3.5A source hunt found no independent materialized repo crosswalk. Existing `shopperIdentityLinkCandidates` are explicitly `not_written`. The live `shp-*`/shopperCode derive from HR text and cannot be the sole canonical authority. No fuzzy/name/email/phone/username/hash-derived mapping.

## Progress

Formal **35% / 65%** because I3 is not partially scored. Operationally I3.1/.2/.3/.4/.7 are PASS and I3.6 is frozen product PASS with source-fixed harness. The exact current blocker is I3.5 provider crosswalk.

## Acción actual

`I3.5B_PROVIDER_BACKED_EXACT_CROSSWALK_VALIDATE_AND_MATERIALIZE_ONE_TARGET` — requires explicit provider-write gate.
