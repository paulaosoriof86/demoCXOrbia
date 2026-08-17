# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-17 15:10 -06:00  
**Estado:** `NO_REPROCESS__I3_5_PROVIDER_CROSSWALK_REQUIRED__I3_6_HARNESS_SOURCE_FIXED__NO_UI_REBUILD`

Plan: `ADDENDUM-MAESTRO-PLAN-UNIFICADO-PHASE-A-NO-DESVIACION-CXORBIA-TYA-20260817.md`.
Source lock: `SOURCE-LOCK-I3-5A-NO-INDEPENDENT-CROSSWALK-I3-6-HARNESS-SOURCE-FIX-20260817.md`.

## No tocar

No nueva candidata/rama/PR/workflow. No reconstruir Dashboard/Shoppers/Postulaciones/Finance/HR/Auth. No tocar `app/modules` ni `app/core` para I3.5. No mostrar HR assignment como postulation, no autoaccept legal, no fuzzy identity.

## Estado I3

I3.1/.2/.3/.4/.7 PASS. I3.6 historical Shopper product/evidence frozen PASS; harness shallow-checkout source defect fixed in `84d26871c6f0cff96eaa84a8789d78b462e190ee` without Shopper access/reset.

I3.5 source hunt completed: runtime exact target still has `no_exact_hr_crosswalk`. The live `shp-*` and shopperCode derive from HR Shopper text, so they cannot be promoted as independent canonical identity anchors. Existing source-safe contracts only define identity-link candidates as `not_written`; no materialized repo authority was found.

Decision: `I3_5_PROVIDER_BACKED_CROSSWALK_MATERIALIZATION_REQUIRED`.

## Claude rule

Do not solve this in UI, do not hardcode the target, do not merge profiles by name/email/phone/WhatsApp/username or derived hash. The next action is provider-backed exact validation/materialization behind a gate, not a frontend change.

## Frozen

Historical Shopper `31906391682`; Admin `32049054855`; request08; HR 15/660; Finance V2/historical; exact identity; durable legal receipt.

## Progress

Formal **35%/65%** because I3 is a single 25-point integral gate until I3.11. Operationally multiple I3 subgates are already closed; I3.5 is the current real blocker.

## Next frontier

`I3.5B_PROVIDER_BACKED_EXACT_CROSSWALK_VALIDATE_AND_MATERIALIZE_ONE_TARGET` under explicit gate. First prove independent exact authority; if absent STOP zero writes; if present max one identity-link materialization/update + ACK/readback.
