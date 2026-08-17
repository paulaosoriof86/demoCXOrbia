# ADDENDUM MAESTRO — PLAN UNIFICADO PHASE A · NO DESVIACIÓN · CXORBIA TyA

**Fecha:** 2026-08-17  
**Última sincronización:** 2026-08-17 16:15 -06:00  
**Estado:** `ACTIVO__PREVALENTE__NO_REPROCESO__I3_1_2_3_4_7_PASS__I3_5C_1_PERIOD_INDEPENDENT_ROLL_FORWARD_SOURCE_PASS__I3_5C_2_PENDING__I3_6_FROZEN_PASS__I4_I5_PENDIENTES`

Repo `paulaosoriof86/demoCXOrbia`; rama `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge; base `release/cxorbia-tya-rc-20260630`.

## Regla

No es un plan nuevo. Cortes 0B→8, S1→S6 e I1→I5 son una sola ruta. No repetir PASS ni reconstruir módulos.

## Progreso formal y operativo

I1 `15/15 PASS`; I2 `20/20 PASS`; I3 `0/25 EN CURSO`; I4 `0/25`; I5 `0/15`.

**GO-LIVE formal: 35% / 65%.** I3 integral →60%; I4→85%; I5→100%.

El 35% es un umbral formal: I3 no suma sus 25 puntos hasta I3.11. Operativamente ya están PASS/frozen I3.1, I3.2, I3.3, I3.4, I3.6 e I3.7. I3.5 está reducido a una única relación pendiente de autoridad/materialización.

## Frozen / no reprocess

Historical Shopper `31906391682` PASS/reset consumed/`passwordResets=0`; Admin `32049054855` PASS; request08 consumed; HR 15/660 no reimport; Finance V2/historical no rebuild; canonical V2/exact identity preserved; legal no autoaccept.

## I3 status

- I3.1 PASS.
- I3.2 PASS.
- I3.3 PASS.
- I3.4 PASS: platform postulations y HR assignments separados; 0 synthetic HR posts.
- I3.5A cerrado: source hunt demostró `no_exact_hr_crosswalk`; el live `shp-*` deriva de texto HR y no es ancla independiente; contratos repo solo definían candidatos `shopperIdentityLinks` `not_written`.
- I3.5B ejecutado una sola vez y consumido: run `32070767910`, job `95513264398`, decisión `HOLD_I3_5B_NO_INDEPENDENT_PROVIDER_AUTHORITY`, `SAFE_HOLD_ZERO_WRITES`. Provider observó 616 visits / 14 periods, 0 identity links y 0 registros de autoridad exacta independiente para agosto. Firestore/provider writes=0; no rerun.
- **I3.5C-1 PASS source-only:** mecanismo reusable period-independent de identity roll-forward implementado. Un vínculo autoritativo vive en `tenants/{tenantId}/shopperIdentityLinks/{identityLinkId}` sin `periodKey`; scope tenant/project/sourceSystem; future-period reuse probado con agosto/septiembre/2027; tenant/project isolation PASS; no hardcode de tenant/proyecto/mes en el contrato reusable.
- **I3.5C-2 pendiente:** resolver una sola vez el target actual mediante autoridad exacta y materializar máximo un vínculo idempotente con provider ACK/readback. Luego probar el mismo link en agosto + fixture septiembre, sin segundo vínculo.
- I3.6 historical Shopper product/evidence PASS congelado; no login/reset/recovery histórico.
- I3.7 PASS: durable legal receipt provider-backed/human_ui/current actor+version+digest/pending=false.
- I3.8/I3.9 pendientes: new Shopper provider-backed create/update + E2E; no se abren mientras I3.5 no quede cerrado.
- I3.10 pendiente KPI semantics.
- I3.11 pendiente integral same-build closure.

## Source lock actual

`SOURCE-LOCK-I3-5C-1-PERIOD-INDEPENDENT-IDENTITY-ROLL-FORWARD-SOURCE-PASS-20260817.md`.

## I3.5 exact authority + future-period rule

La ausencia de autoridad provider-backed para el target actual ya está demostrada; no es permiso para inventar un mapping.

A partir del contrato I3.5C-1:

1. un vínculo autoritativo se materializa una sola vez;
2. el vínculo no pertenece a agosto, septiembre ni a ningún período;
3. la resolución ocurre por `tenantId + sourceSystem + projectScope + source technical token`;
4. scope `project-specific` se usa cuando la identidad upstream es propia del proyecto;
5. scope tenant-wide `*` solo cuando la identidad upstream es realmente común al tenant;
6. mismo source key en otro tenant nunca hereda identidad;
7. ausencia/conflicto permanece fail-closed/review;
8. nombre/email/teléfono/WhatsApp/username/shopperCode/hash humano siguen prohibidos como autoridad única;
9. Shopper creado desde plataforma debe cerrar `Auth → claims → membership → profile → identity link authorityType=platform_created → provider ACK`;
10. períodos futuros reutilizan el mismo vínculo y no vuelven a disparar el problema.

## Multi-tenant / multi-project

Cinépolis continúa siendo un proyecto normal configurable del tenant actual. Ninguna regla reusable de identidad depende de `TyA`, `Cinépolis`, país, mes o período hardcodeado. El mecanismo es reusable CXOrbia y permite project-specific o tenant-wide según la fuente.

## I4 preserved

Documents/instructions, certifications, available/postulation, assignment/scheduling/reprogram/cancel, execution/questionnaire/submit/review, HR bidirectional/Make, Finance, multi-project/config, roles/scopes, evidence/Storage, Academia/manuals/routes/notifications, Gemini gated/human review, S6 same-build E2E.

## I5 preserved

Freeze no P0 → exact SHA/manifest/build-lock/verifier → preproduction → rollback → same-build E2E → explicit production gate → deploy/cutover/smoke → active production baseline.

## Circuit breakers

No repeat PASS; no new candidate/branch/PR/workflow; no historical Shopper/Auth reprocessing; no HR reimport; no Finance rebuild; no fuzzy identity; no localStorage truth; no success before provider ACK; no HR assignment as postulation; no legal autoaccept; no provider write/deploy/merge/production without gate; no rerun I3.5B; no period-scoped identity links.

## Siguiente frontera exacta

`I3.5C-2_ONE_TIME_AUTHORITATIVE_ADJUDICATION_AND_PERIOD_INDEPENDENT_LINK_MATERIALIZATION`.

No existe autorización vigente para ese provider write. El bloque siguiente debe limitarse al único target actual, máximo un upsert idempotente, provider ACK/readback y prueba de reutilización agosto/septiembre. Después, si PASS, cerrar I3.5 y avanzar directamente I3.8→I3.11 bajo sus gates propios.
