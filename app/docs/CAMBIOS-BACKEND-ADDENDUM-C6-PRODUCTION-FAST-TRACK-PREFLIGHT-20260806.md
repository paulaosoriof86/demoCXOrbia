# CAMBIOS BACKEND — Addendum C6 fast-track de producción source-only

**Fecha:** 2026-08-06  
**Estado:** `C6_PRODUCTION_FAST_TRACK_PREFLIGHT_GATE_HOLD__LIVE_HR_V4_UNRESOLVED__PRODUCTION_STRATEGY_UNMATERIALIZED__NO_WRITES__NO_DEPLOY__NO_PRODUCTION`

## Archivos creados

- `tools/qa/cxorbia-c6-production-target-preflight-source-only.mjs`;
- `backend/config/cxorbia-production-promotion-contract.template.json`;
- `app/docs/evidence/C6-PRODUCTION-FAST-TRACK-PREFLIGHT-LATEST.json`;
- `app/docs/evidence/C6-PRODUCTION-TARGET-PREFLIGHT-LATEST.json`;
- `app/docs/SOURCE-LOCK-C6-PRODUCTION-FAST-TRACK-PREFLIGHT-20260806.md`;
- este addendum;
- addenda de Claude, Pendientes, Academia y tracker del mismo bloque.

## Archivos auditados sin modificación funcional

- `.firebaserc`;
- `firebase.json`;
- `.github/cxorbia-firebase-requests/live-hr-current-reconcile.json`;
- `.github/workflows/cxorbia-live-hr-current-reconcile.yml`;
- fuentes canónicas y PR #7.

## Gate ejecutado

```text
node --check tools/qa/cxorbia-c6-production-target-preflight-source-only.mjs = PASS
execution exitCode=2 esperado fail-closed
decision=HOLD_PRODUCTION_STRATEGY_UNMATERIALIZED
holdReason=PRODUCTION_PROMOTION_STRATEGY_NOT_AUTHORIZED_OR_MATERIALIZED
```

El gate acepta dos estrategias, sin imponer una:

- `PROMOTE_EXISTING_CLEAN_PROJECT`;
- `SEPARATE_CLEAN_PROD_PROJECT`.

Ambas exigen autorización expresa y prohíben usar la base legacy como backend nuevo.

## Plantilla preparada

`backend/config/cxorbia-production-promotion-contract.template.json` quedó deshabilitada y sin estrategia. No autoriza writes, deploy, merge ni cutover; permite materializar rápidamente la opción elegida sin rediseñar el contrato.

## Hallazgo

El repositorio materializa actualmente `cxorbia-backend-dev`, target `cxorbia-dev` y servicio `cxorbia-live-hr-dev`. Falta una decisión contractual de promoción; no se infiere que deba crearse otro proyecto ni que el DEV pueda promoverse sin autorización.

## Límites

No se modificó frontend, `CX.data`, request HR, workflow, Firebase, Auth, Rules, Storage, HR, Hosting, Cloud Run ni producción.

## Clasificación

- Reusable CXOrbia: gate y plantilla de estrategia de producción autorizada.
- Exclusivo TyA: preparación del cutover.
- Claude/prototipo: sin cambios.
- Academia: impacto documentado.
- Sin impacto Claude: módulos Phase A preservados.
