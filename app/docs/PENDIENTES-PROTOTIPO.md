# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-17 15:30 -06:00  
**Estado:** `I3_5B_CONSUMED_SAFE_HOLD__I3_5C_AUTHORITY_REQUIRED__I3_6_PRODUCT_PASS_HARNESS_SOURCE_FIXED`

Plan: `ADDENDUM-MAESTRO-PLAN-UNIFICADO-PHASE-A-NO-DESVIACION-CXORBIA-TYA-20260817.md`.
Source lock: `SOURCE-LOCK-I3-5B-PROVIDER-VALIDATION-SAFE-HOLD-ZERO-WRITES-20260817.md`.

## Closed/frozen

I1/I2/I3.1/I3.2/I3.3/I3.4/I3.7 PASS; Historical Shopper `31906391682`; Admin `32049054855`; request08; HR 15/660; Finance V2/historical; legal durable V0.4 receipt. I3.6 product/evidence frozen PASS; harness source defect fixed without Shopper reprocess.

I3.5A source hunt is closed. I3.5B provider validation is also closed/consumed: run `32070767910`, job `95513264398`, decision `HOLD_I3_5B_NO_INDEPENDENT_PROVIDER_AUTHORITY`, zero writes and no retry.

## Current exact pending

1. **I3.5C — authority creation/adjudication:** provider has 616 visits/14 periods, 0 identity links and 0 exact independent authority for the August target. Continue only with a new exact technical source or explicit tenant adjudication recorded against source-safe technical fingerprints. No automatic/fuzzy mapping.
2. **I3.6 closure evidence:** product/evidence frozen PASS and harness source fixed; never historical Shopper login/recovery/reset.
3. **I3.8/I3.9:** new Shopper provider-backed create/update + E2E only after I3.5 is exact and under a separate write gate.
4. **I3.10:** KPI/state semantics.
5. **I3.11:** integral same-build close.
6. **I4:** complete Phase A.
7. **I5:** exact production cutover.

## Safety

I3.5B Firestore/identity-link/Auth/user/password/HR/Finance/Rules/Storage/Make/Gemini/payment/deploy writes = 0; Historical Shopper access/login/recovery/reset = 0; merge=false; production=false.

## Identity rule

The live `shp-*`/shopperCode derive from HR text and cannot be sole canonical authority. The expected canonical target is an assertion to validate, not authority. No name/email/phone/WhatsApp/username/hash-derived mapping.

## Progress

Formal **35% / 65%** because I3 is not partially scored. Operationally I3.5A and I3.5B are complete; blocker = real absence of exact authority.

## Acción actual

`I3.5C_AUTHORITATIVE_TENANT_ADJUDICATION_REQUIRED__STOP_AUTOMATIC_MAPPING`.
