# SOURCE LOCK — I3.4→I3.7 READ-ONLY RESULT · I3.4 PASS · I3.5 HOLD · I3.6 FROZEN PASS/HARNESS FIX · I3.7 PASS

**Fecha:** 2026-08-17 14:49 -06:00  
**Repo:** `paulaosoriof86/demoCXOrbia`  
**Rama:** `docs-tya-v6-v71-audit`  
**PR:** #7 draft/open/no merge  
**Estado:** `I3_4_PASS__I3_5_HOLD_EXACT_CROSSWALK_MISSING__I3_6_FROZEN_PASS_HARNESS_SHALLOW_CHECKOUT__I3_7_PASS__STOP_RETRY__NO_REPROCESS`

## 1. Ejecución read-only consumida

Request `i3-4-7-staff-runtime-authority-readonly-20260817-01`.
Target source HEAD `80156d25682ffa28c224bb36c328a55fb77aef5f`.
Request commit `3dc7363a0b361910538422fd0fd1a7ab7fb95e8e`.
Run `32066894011`; job `95500120283`; artifact `9300261023`; digest `sha256:dba8d25a325ffa51668faf66b219a3d86271e23f2c8fad5075513a04eeaaeafc`.

El request quedó consumido/disabled en commit `1c4c85cd2c23b5b3f16a5fd7a2f5f5735369ab94`. No se rerun.

Safety observada: Staff/Admin only; Historical Shopper access `0`; Shopper credential selection `0`; Client credential selection `0`; userCreates/userUpdates/passwordChanges/passwordResets `0`; Auth/Firestore/HR/Rules/Storage/Make/Gemini/payment writes `0`; deploy `0`; merge=false; production=false; legal autoaccept=false.

## 2. I3.4 — PASS/FROZEN

Runtime exacto y estable en primera carga + 3 reloads + new-tab:

- `CX_TYA_POSTULATION_AUTHORITY.ready=true`;
- platform posts `_posts`: `0`;
- HR assignment projection: `208`;
- authority platform posts: `0`;
- authority HR assignments: `208`;
- `hrAssignmentsArePostulations=false`;
- synthetic `hr-post-*` inside platform posts: `0`;
- stable across reloads/new-tab: true.

Conclusión: asignaciones HR y postulaciones de plataforma están separadas. No se vuelve a representar una asignación HR como “Aprobada por HR TyA” dentro de Postulaciones.

## 3. I3.5 — HOLD REAL, EXACTO

El contrato exacto está presente y la composición funciona, pero falta crosswalk técnico exacto para el target de agosto:

- exact identity contract present: true;
- identityMap size: `208`;
- identityReviewQueue: `145`;
- única razón observada: `no_exact_hr_crosswalk`;
- target live technical id: `shp-57d2e3769946`;
- target canonical id esperado por evidencia previa: `TYA_GT_0C0BA8856E`;
- exact canonical actual: `null`;
- visitas AGO ya canónicas bajo `TYA_GT_0C0BA8856E`: `0`;
- visitas AGO residuales bajo `shp-57d2e3769946`: `2`;
- estable en reloads/new-tab.

No existe ambigüedad exacta: existe ausencia de ancla exacta.

### Hallazgo source-only adicional

`tools/hr-source/tya-build-live-hr-source-safe-r20.mjs` genera `shopperId` source-safe como hash determinístico del texto de Shopper de HR. Por ello `shp-57d2e3769946` no es por sí mismo una identidad provider/canonical independiente: deriva del nombre y **no puede usarse como puente exacto canónico** bajo la regla anti-fuzzy. `shopperCode` deriva del mismo texto y tampoco constituye un ancla independiente.

`tools/hr-source/tya-live-provider-registry-identity-dev.mjs` solo recupera displayName desde HR para overlay DEV; no define identidad canónica de plataforma.

Por tanto queda prohibido “resolver” I3.5 hardcodeando el target por nombre, email, teléfono, WhatsApp, username, `shopperCode` o por el hash `shp-*` derivado del nombre. Debe localizarse/reutilizarse una fuente exacta independiente ya existente o, si no existe, materializar un crosswalk provider-backed bajo gate de write posterior.

## 4. I3.6 — PRODUCTO/FROZEN PASS; HARNESS FOCAL

La evidencia congelada `app/docs/evidence/ITERATION3-HISTORICAL-SHOPPER-LOGIN-CHECKPOINT-LATEST.json` mantiene:

- decision `PASS_I3_HISTORICAL_SHOPPER_LOGIN_AFTER_EXACT_RECOVERY`;
- exact/profile/membership/crosswalk/history/historyE2E = true;
- fuzzyMatching = false.

Además los blobs actuales son byte-idénticos a la fuente congelada `e4d6de3e97745dfa777c9c585d75c72de61d3d17`:

- `app/adapters/tya-canonical-shopper-portal-v2.js` → `e186b0d97be42abe6f8dd1f41358feb59aee860a`;
- `app/adapters/cxorbia-shopper-membership-wiring-v1.js` → `a96370a5a72ac6a12a6733d6e768a52293abe82b`.

El runner I3.6 falló solo porque el workflow hizo checkout `fetch-depth:2` y `git rev-parse e4d6de3e...:<path>` no podía resolver el commit histórico. Esto NO es regresión de Shopper ni razón para re-login/recovery. Se corrige únicamente el harness fuente para traer la referencia histórica read-only antes de comparar blobs.

Historical Shopper access en la ejecución actual: `0`; passwordResets: `0`.

## 5. I3.7 — PASS/FROZEN

El mismo Staff runtime provider-backed demostró:

- legal content id `tya-guatemala-honduras-nda-confidentiality-v0.4-interim-20260816`;
- legal version `0.4`;
- digest `6fd4c7cb16e6f8325ccf1c62c8cae640542633631b885e8ca0369ba5da04d7f5`;
- provider authority true;
- loaded true;
- pending false;
- provider bridge accepted true / pending false / reasons `[]`;
- provider snapshot ready + subjectExact true + ambiguous false;
- receipt status `accepted`;
- acceptanceMethod `human_ui`;
- receipt subjectExact true;
- acceptedAt present;
- receipt matches current legal content/version/digest;
- receipt matches authenticated actor;
- stable across first load, 3 reloads and new-tab.

Conclusión: el receipt V0.4 durable está confirmado. La doble presentación previa no es blocker actual. No autoaccept y no reabrir I3.7.

## 6. Progreso

Formal permanece:

- I1 `15/15 PASS`;
- I2 `20/20 PASS`;
- I3 `0/25` hasta I3.11;
- I4 `0/25`;
- I5 `0/15`.

**GO-LIVE formal: 35% / 65%.**

Internamente quedan PASS/frozen I3.1, I3.2, I3.3, I3.4 e I3.7. I3.6 conserva PASS de producto/fuente congelada y requiere cerrar solo la comprobación harness. I3.5 es el único blocker real demostrado del bloque I3.4→I3.7.

## 7. Siguiente acción exacta

`I3.5A_EXACT_TECHNICAL_CROSSWALK_SOURCE_HUNT__PLUS_I3.6_FROZEN_REFERENCE_HARNESS_FIX__SOURCE_ONLY`.

Objetivos:

1. buscar en repo/provider contracts existentes una fuente de crosswalk técnico independiente para agosto, sin fuzzy/PII;
2. corregir el runner I3.6 para traer/leer la referencia congelada sin tocar al Shopper histórico;
3. si existe exact crosswalk reutilizable, integrarlo source-only detrás del contrato exacto;
4. si no existe, declarar `I3_5_PROVIDER_BACKED_CROSSWALK_MATERIALIZATION_REQUIRED` y pedir gate específico antes de cualquier write.

No deploy, no provider write, no historical Shopper login, no HR reimport, no Finance rebuild, no general diagnosis.

## 8. Clasificación

- **Reusable CXOrbia:** separación de autoridades; exact identity fail-closed; frozen-evidence reuse.
- **Exclusivo cliente:** target técnico agosto TyA/Cinépolis y legal V0.4.
- **Claude/prototipo:** no cambiar UI; no mostrar assignment como postulation; no fuzzy identity.
- **Academia:** documentar diferencia entre ID source-safe derivado y ancla canónica independiente.
- **Sin impacto Claude:** harness/source-lock/tooling, salvo preservar reglas de autoridad.
