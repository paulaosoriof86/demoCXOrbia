# CAMBIOS-BACKEND.md

**Última sincronización:** 2026-08-18 16:18 -06:00  
**SYNC_EPOCH:** `CXORBIA-20260818-I3-11C-STAFF-PUSH-NAVIGATION-HOLD-07`  
**Estado:** `STAFF_ONE_SHOT_CONSUMED__NAVIGATION_TIMEOUT_BEFORE_APP_STATE__SOURCE_ONLY_HARNESS_FIX_NEXT__GO_LIVE_35`

## I3.11C — estado vigente

### R3-C Hosting DEV — PASS y congelado

Run `32185940998`, job `95869431778`, artifact `9342450216`, digest `sha256:03ccb5a71af356eade7eb498fc766af1fb4f266bb12397d2bff1f865714a09bb`.

Resultado: `PASS_I3_11C_R3C_DEV_HOSTING_MATERIALIZATION_REMOTE_PARITY`.

Se materializó exactamente una vez el source corregido en Firebase Hosting DEV. El adapter remoto quedó byte-idéntico y con contrato `materialized + tenant_adjudication`, `fuzzyMatching:false`. Provider/Auth/Firestore-data/Rules/HR/Storage/Make/Gemini/payment writes `0`; Historical Shopper `0`; Cloud Run `0`; Staff runtime `0`; merge/production false.

### Staff/Admin post-Hosting — ejecución única consumida

Autorización exacta de Paula materializada en commit `cabca0da333e498faaa05df5112b6dbe5083234f`.

Push real: run `32188716203`, job `95878165921`, artifact `9343461375`, digest `sha256:e43814d730824a010930f8ebaa53fa5aabc417860297b7d9651bee16769340c1`.

El run sí ejecutó una sola lectura Staff/Admin. El duplicado `pull_request` posterior no ejecutó Staff y no altera esta adjudicación.

Preflight PASS:
- request/single-use/target/source exactos;
- `PASS_PROVIDER_IDENTITY_RUNTIME_CANONICAL_CONTRACT_PARITY`;
- target materialized aplicable;
- identidad técnica exacta, sin fuzzy;
- Rules verificadas previas reutilizadas, deploy actual `0`;
- credencial exclusivamente Staff/Admin existente;
- Historical Shopper fuera de alcance.

### Único bloqueo reproducible

`STAFF_RUNTIME_NAVIGATION_DOMCONTENTLOADED_TIMEOUT_BEFORE_APP_STATE`.

El navegador se detuvo en la primera instrucción de navegación:

`page.goto('https://cxorbia-backend-dev.web.app/', { waitUntil: 'domcontentloaded', timeout: 60000 })`

El artifact registra `lastState=null`. Por tanto no se alcanzó login ni montaje de la aplicación y no existe observación válida de `shp-57d2e3769946 -> TYA_GT_0C0BA8856E` ni de las dos visitas de agosto en este run.

Los resúmenes FAIL de I3.4, I3.5 e I3.7 son downstream del fallo base de navegación y quedan **no adjudicados**; no constituyen regresiones nuevas. I3.6 Historical Shopper reuse permaneció PASS.

No se deben interpretar como datos reales los defaults `targetCanonicalActual=null`, canonical `0` o residual `0`, porque la aplicación nunca llegó a estado observable.

### Seguridad del run

- Historical Shopper access: `0`.
- Shopper credential selection: `0`.
- user creates/updates: `0/0`.
- password changes/resets: `0/0`.
- Auth/Firestore/HR/Rules/Storage writes: `0`.
- Make/Gemini/payment calls-writes: `0`.
- Hosting/Cloud Run deploys: `0/0`.
- credentials/tokens exposed: false.
- merge: false.
- production: false.

El request quedó deshabilitado y consumido en commit `59ccc567aa2aba6bad536b04569fdb4f127d1a29`; no existe permiso para retry automático.

## Causa raíz metodológica/técnica acotada

El smoke Staff usa `waitUntil:'domcontentloaded'` como condición de entrada. `app/index-backend-dev.html` carga recursos externos síncronos antes de `app.js` —incluidos Firebase compat, SheetJS CDN y Mammoth CDN—, por lo que `DOMContentLoaded` depende de que esos recursos terminen. El run no capturó qué recurso quedó pendiente; por eso no corresponde reparar provider, Admin, identidad, visitas ni Hosting.

## Siguiente bloque exacto

`SOURCE_ONLY_STAFF_NAVIGATION_HARNESS_HARDENING_NO_PROVIDER`.

Alcance:
- corregir únicamente el harness QA reutilizable para separar navegación HTTP de readiness visible de la aplicación;
- conservar fail-closed y capturar diagnóstico de navegación si vuelve a fallar;
- source/static checks únicamente;
- Staff/provider reads `0`;
- writes/deploy/merge/production `0`.

Después de source PASS se requerirá una nueva autorización exacta para **una** lectura Staff/Admin que observe finalmente canonical + agosto, sin repetir R3-A/R3-B/R3-C ni Historical Shopper.

## Clasificación

- **Reusable CXOrbia:** hardening del harness de navegación y separación entre transport readiness y runtime readiness.
- **Exclusivo TyA:** IDs de shopper/visitas usados como target del gate.
- **Claude/prototipo:** no parche UI; no compensar desde módulos.
- **Academia:** sin cambio funcional en este bloque.
- **Sin impacto Claude inmediato:** corrección del harness QA.

## Avance

**35% completado / 65% pendiente.** I3 no suma hasta PASS integral.
