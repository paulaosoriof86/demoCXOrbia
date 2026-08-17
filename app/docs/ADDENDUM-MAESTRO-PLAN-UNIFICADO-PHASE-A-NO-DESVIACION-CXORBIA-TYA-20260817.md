# ADDENDUM MAESTRO — PLAN UNIFICADO PHASE A · NO DESVIACIÓN · CXORBIA TyA

**Fecha:** 2026-08-17  
**Última sincronización:** 2026-08-17 16:31 -06:00  
**Estado:** `ACTIVO__PREVALENTE__NO_REPROCESO__I3_1_2_3_4_5_6_7_PASS__I3_8_NEXT__PERIOD_INDEPENDENT_IDENTITY_PROVIDER_BACKED__I4_I5_PENDIENTES`

Repo `paulaosoriof86/demoCXOrbia`; rama `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge; base `release/cxorbia-tya-rc-20260630`.

## Regla

No es un plan nuevo. Cortes 0B→8, S1→S6 e I1→I5 son una sola ruta. No repetir PASS ni reconstruir módulos.

## Progreso formal y operativo

I1 `15/15 PASS`; I2 `20/20 PASS`; I3 `0/25 EN CURSO`; I4 `0/25`; I5 `0/15`.

**GO-LIVE formal: 35% / 65%.** I3 integral →60%; I4→85%; I5→100%.

El 35% es un umbral formal: I3 no suma sus 25 puntos hasta I3.11. Operativamente I3.1→I3.7 ya están cerrados/PASS.

## Frozen / no reprocess

Historical Shopper `31906391682` PASS/reset consumed/`passwordResets=0`; Admin `32049054855` PASS; request08 consumed; HR 15/660 no reimport; Finance V2/historical no rebuild; canonical exact identity preserved; legal V0.4 durable PASS/no autoaccept.

## I3 status

- I3.1 PASS.
- I3.2 PASS.
- I3.3 PASS.
- I3.4 PASS.
- **I3.5 PASS/CLOSED:** source hunt + provider validation + reusable period-independent roll-forward + one authoritative provider-backed link materialized/readback. Run `32076682895`, job `95531280631`, link `irl_3ed1b9a65d36c5873c1306bae1621e9d`.
- **I3.6 CLOSED/FROZEN PASS:** Historical Shopper remains frozen; no credential reprocess; harness shallow-reference source fix preserved.
- I3.7 PASS: durable legal receipt provider-backed/human_ui/current actor+version+digest/pending=false.
- **I3.8 NEXT:** Admin create/update one new Shopper provider-backed with period-independent identity.
- I3.9 pending: new Shopper real E2E login/claims/membership/profile/crosswalk/workspace/reload/new-tab/second logical context.
- I3.10 pending: derived KPI/state semantics.
- I3.11 pending: integral same-build closure.

## I3.5 period-independent proof

The provider-backed link is not period scoped. Validation proves:

- August `2026-08` resolves canonical target;
- September `2026-09` resolves same canonical target;
- same identityLink is reused;
- no second identity link is created.

The current project scope is stored as data (`cinepolis`) and is not reusable code logic. The generic contract supports tenant isolation plus project-specific or tenant-wide scope according to the upstream source.

## Source lock current

`SOURCE-LOCK-I3-5C2-PERIOD-INDEPENDENT-LINK-PASS-I3-5-I3-6-CLOSED-20260817.md`.

## I3.8 contract

One new test Shopper only:

`Admin create/update → exact validation → Auth → claims → membership → profile/shopper → period-independent identity link authorityType=platform_created → provider ACK/readback`.

Rules:

1. do not touch Historical Shopper credentials;
2. do not recreate TARGET_B Admin;
3. no browser/localStorage password truth;
4. identity link must not contain period scope;
5. tenant/project scope comes from provider/config, never month/name hardcode;
6. max one new Shopper identity under a separate explicit provider-write gate;
7. exact counters and readback mandatory;
8. no HR/Finance/Rules/Storage/Make/Gemini/payment/deploy/merge/production unless separately authorized.

## I4 preserved

Documents/instructions, certifications, available/postulation, assignment/scheduling/reprogram/cancel, execution/questionnaire/submit/review, HR bidirectional/Make, Finance, multi-project/config, roles/scopes, evidence/Storage, Academia/manuals/routes/notifications, Gemini gated/human review, S6 same-build E2E.

## I5 preserved

Freeze no P0 → exact SHA/manifest/build-lock/verifier → preproduction → rollback → same-build E2E → explicit production gate → deploy/cutover/smoke → active production baseline.

## Circuit breakers

No repeat PASS; no new candidate/branch/PR; no Historical Shopper/Auth reprocessing; no HR reimport; no Finance rebuild; no fuzzy identity; no localStorage truth; no success before provider ACK; no HR assignment as postulation; no legal autoaccept; no provider write/deploy/merge/production without gate; no rerun I3.5B/I3.5C-2; no period-scoped identity links.

## Next exact frontier

`I3.8_ADMIN_CREATE_UPDATE_ONE_NEW_SHOPPER_PROVIDER_BACKED_PERIOD_INDEPENDENT_IDENTITY` under separate explicit provider-write gate. If PASS, continue directly I3.9→I3.11 without general diagnosis.
