# ADDENDUM MAESTRO — PLAN UNIFICADO PHASE A · NO DESVIACIÓN · CXORBIA TyA

**Fecha:** 2026-08-17  
**Última sincronización:** 2026-08-17 15:05 -06:00  
**Estado:** `ACTIVO__PREVALENTE__NO_REPROCESO__I3_1_2_3_4_7_PASS__I3_5_PROVIDER_CROSSWALK_REQUIRED__I3_6_PRODUCT_PASS_HARNESS_SOURCE_FIXED__I4_I5_PENDIENTES`

Repo `paulaosoriof86/demoCXOrbia`; rama `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge; base `release/cxorbia-tya-rc-20260630`.

## Regla

No es un plan nuevo. Cortes 0B→8, S1→S6 e I1→I5 son una sola ruta. No repetir PASS ni reconstruir módulos.

## Progreso formal y operativo

I1 `15/15 PASS`; I2 `20/20 PASS`; I3 `0/25 EN CURSO`; I4 `0/25`; I5 `0/15`.
**GO-LIVE formal: 35% / 65%.** I3 integral →60%; I4→85%; I5→100%.

El 35% es un umbral formal: I3 no suma sus 25 puntos hasta I3.11. Operativamente ya están PASS/frozen I3.1, I3.2, I3.3, I3.4 e I3.7; I3.6 conserva PASS de producto/evidencia y su defecto de harness quedó corregido source-only. I3.5 es el blocker real actual.

## Frozen/no reprocess

Historical Shopper `31906391682` PASS/reset consumed/`passwordResets=0`; Admin `32049054855` PASS; request08 consumed; HR 15/660 no reimport; Finance V2/historical no rebuild; canonical V2/exact identity preserved; legal no autoaccept.

## I3 status

- I3.1 PASS.
- I3.2 PASS.
- I3.3 PASS.
- I3.4 PASS: platform postulations y HR assignments separados; 0 synthetic HR posts.
- I3.5: source hunt completado. Runtime reporta `no_exact_hr_crosswalk`; el live `shp-*` deriva de texto HR y no es ancla independiente. Los contratos repo solo definen candidatos `shopperIdentityLinks` con `writeStatus=not_written`; no se localizó autoridad materializada reutilizable. Estado: `I3_5_PROVIDER_BACKED_CROSSWALK_MATERIALIZATION_REQUIRED`.
- I3.6: historical Shopper product/evidence PASS congelado; harness source fix commit `84d26871c6f0cff96eaa84a8789d78b462e190ee` hace fetch read-only del commit histórico si el checkout es shallow. No login/reset/recovery histórico.
- I3.7 PASS: durable legal receipt provider-backed/human_ui/current actor+version+digest/pending=false.
- I3.8/I3.9 pendientes: new Shopper provider-backed create/update + E2E.
- I3.10 pendiente KPI semantics.
- I3.11 pendiente integral same-build closure.

## Source lock actual

`SOURCE-LOCK-I3-5A-NO-INDEPENDENT-CROSSWALK-I3-6-HARNESS-SOURCE-FIX-20260817.md`.

## I4 preserved

Documents/instructions, certifications, available/postulation, assignment/scheduling/reprogram/cancel, execution/questionnaire/submit/review, HR bidirectional/Make, Finance, multi-project/config, roles/scopes, evidence/Storage, Academia/manuals/routes/notifications, Gemini gated/human review, S6 same-build E2E.

## I5 preserved

Freeze no P0 → exact SHA/manifest/build-lock/verifier → preproduction → rollback → same-build E2E → explicit production gate → deploy/cutover/smoke → active production baseline.

## Circuit breakers

No repeat PASS; no new candidate/branch/PR/workflow; no historical Shopper/Auth reprocessing; no HR reimport; no Finance rebuild; no fuzzy identity; no localStorage truth; no success before provider ACK; no HR assignment as postulation; no legal autoaccept; no provider write/deploy/merge/production without gate.

## Siguiente acción exacta

`I3.5B_PROVIDER_BACKED_EXACT_CROSSWALK_VALIDATE_AND_MATERIALIZE_ONE_TARGET`.

Primero debe probar una autoridad técnica exacta e independiente en provider. Si no existe, STOP con cero writes. Solo si existe puede materializarse el único identity link necesario y exigir ACK/readback. Después PASS: cerrar I3.5/I3.6 y continuar directamente I3.8→I3.11.
