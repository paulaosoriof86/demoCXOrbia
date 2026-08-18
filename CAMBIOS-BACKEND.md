# CAMBIOS-BACKEND.md

**Última sincronización:** 2026-08-18 16:23 -06:00  
**SYNC_EPOCH:** `CXORBIA-20260818-I3-11C-NAV-HARNESS-SOURCE-PASS-08`  
**Estado:** `STAFF_ONE_SHOT_CONSUMED__NAVIGATION_HARNESS_HARDENED__NEW_STAFF_AUTH_NEXT__GO_LIVE_35`

## I3.11C — estado vigente

### R3-C Hosting DEV — PASS y congelado

Run `32185940998`, job `95869431778`, artifact `9342450216`, digest `sha256:03ccb5a71af356eade7eb498fc766af1fb4f266bb12397d2bff1f865714a09bb`.

Resultado: `PASS_I3_11C_R3C_DEV_HOSTING_MATERIALIZATION_REMOTE_PARITY`. El adapter remoto quedó byte-idéntico al source corregido y acepta `materialized + tenant_adjudication`, con `fuzzyMatching:false`. R3-C no se repite.

### Staff/Admin post-Hosting — ejecución única HOLD y consumida

Autorización exacta de Paula: commit `cabca0da333e498faaa05df5112b6dbe5083234f`.

Push real: run `32188716203`, job `95878165921`, artifact `9343461375`, digest `sha256:e43814d730824a010930f8ebaa53fa5aabc417860297b7d9651bee16769340c1`.

Preflight PASS: request/single-use/target/source exactos; `PASS_PROVIDER_IDENTITY_RUNTIME_CANONICAL_CONTRACT_PARITY`; target materialized aplicable; sin fuzzy; Rules previas reutilizadas; Staff-only existente; Historical Shopper `0`.

Único bloqueo reproducible: `STAFF_RUNTIME_NAVIGATION_DOMCONTENTLOADED_TIMEOUT_BEFORE_APP_STATE`.

El browser agotó 60 s en la navegación inicial esperando `DOMContentLoaded`. Artifact: `lastState=null`. No alcanzó login ni app state, por lo que canonical y agosto no fueron observados. I3.4/I3.5/I3.7 quedan no adjudicados por este fallo base; I3.6 Historical Shopper reuse permaneció PASS.

Safety del run: Historical Shopper/Shopper credential selection/user creates-updates/password changes-resets/Auth/Firestore/HR/Rules/Storage/Make/Gemini/payment/Hosting/Cloud Run = `0`; merge/production false.

El request quedó `enabled=false`, `consumed=true` mediante commit `59ccc567aa2aba6bad536b04569fdb4f127d1a29`. Cualquier workflow posterior lo salta; no existe retry automático.

## Hardening source-only del harness — aplicado

Commit `9feb5f69a35169eac2931843309ad847d374b1b3` modifica únicamente `tools/qa/tya-c6-staff-admin-human-auth-browser-smoke.mjs`.

Delta exacto:
- navegación inicial: `waitUntil:'domcontentloaded'` → `waitUntil:'commit'`;
- selector Admin sigue siendo el readiness visible y su presupuesto sube de 30 s a 60 s;
- los 3 reloads usan `waitUntil:'commit'` y continúan sujetos a `waitReady()`;
- nueva pestaña usa `waitUntil:'commit'` y continúa sujeta a `waitReady()`.

Esto no relaja las condiciones funcionales de PASS: login canónico, membership, HR authority, `CX.data`, identidad exacta, agosto, legal, reloads y new-tab siguen validados igual. Solo elimina la dependencia falsa de `DOMContentLoaded` como precondición de transporte.

Validación source-only sobre HEAD del fix:
- diff GitHub confirma 1 archivo QA y 4 líneas lógicas cambiadas;
- `CXORBIA_READONLY_POST_GATES_RUNNER` con request disabled: SUCCESS y Staff/provider execution skipped;
- R3-C workflow disparado por sincronización: ejecución/deploy steps skipped;
- `Phase A Source Safe Runtime Guard`: SUCCESS;
- `Run P0 exact identity source gates` dentro de `Phase A Visual Smoke`: SUCCESS.

No hubo Staff/provider read, data write, deploy, merge o producción por este hardening.

## Siguiente bloque exacto

`NEW_EXACT_AUTH_I3_11C_STAFF_CANONICAL_OBSERVATION_AFTER_NAV_HARNESS_SOURCE_PASS`.

Una sola lectura Staff/Admin existente sobre DEV para observar, sin modificar:
- `shp-57d2e3769946 -> TYA_GT_0C0BA8856E`;
- agosto canonical `2`;
- residual live `0`;
- duplicateVisitKeys `0`;
- duplicateShopperIds `0`.

Cero Historical Shopper, provider/Auth/Firestore/Rules/HR/Storage/Make/Gemini/pagos writes, deploys, cambios de contraseña/usuarios, merge o producción. No repetir R3-A/R3-B/R3-C.

## Clasificación

- **Reusable CXOrbia:** navegación del harness desacoplada de `DOMContentLoaded`; readiness funcional permanece fail-closed.
- **Exclusivo TyA:** IDs y visitas usados como target del gate.
- **Claude/prototipo:** sin parche UI.
- **Academia:** sin cambio funcional.
- **Sin impacto Claude:** cambio QA source-only.

## Avance

**35% completado / 65% pendiente.** I3 no suma hasta PASS integral; si el siguiente gate cierra I3, pasa a **60% / 40%**.
