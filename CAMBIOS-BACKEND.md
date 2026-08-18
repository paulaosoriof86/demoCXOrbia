# CAMBIOS-BACKEND.md

**Última sincronización:** 2026-08-18 16:39 -06:00  
**SYNC_EPOCH:** `CXORBIA-20260818-I3-11C-IDENTITYMAP-SOURCE-PASS-HOSTING-AUTH-NEXT-11`  
**Estado:** `STAFF_POST_HARDENING_HOLD_CONSUMED__IDENTITYMAP_SOURCE_FIX_PASS__HOSTING_MATERIALIZATION_AUTH_NEXT__GO_LIVE_35`

## I3.11C — ejecución Staff post-hardening

Autorización de Paula ejecutada una sola vez mediante request `i3-11c-staff-canonical-observation-post-hardening-20260818-06`.

Push real:
- run `32192976458`;
- job `95891132356`;
- artifact `9344922862`;
- digest `sha256:2ac557db3318bbcd9013e455aa8bc34d64324ce89edbb4e325801ee08c3cc2dc`;
- resultado global `HOLD_READONLY_POST_GATES`.

### Qué quedó probado

El hardening de navegación sí funcionó: esta vez el Staff/Admin llegó al runtime real.

Estado observado:
- role `admin`, namespace `staff`, membership verificada;
- HR authority aplicada;
- períodos `15`, visitas `660`;
- `shp-57d2e3769946` con target canonical esperado `TYA_GT_0C0BA8856E`;
- visitas agosto bajo canonical `2`;
- visitas agosto residuales bajo live id `0`;
- duplicateVisitKeys `0`;
- duplicateShopperIds `0`;
- postulation authority lista: plataforma `8`, asignaciones HR `15`, HR assignments no tratados como postulaciones, synthetic HR posts `0`;
- legal runtime/provider authority/receipt humano vigente sin regresión.

Provider exact identity runtime:
- target link presente;
- identityLinkId `irl_3ed1b9a65d36c5873c1306bae1621e9d`;
- canonical `TYA_GT_0C0BA8856E`;
- status `materialized`;
- authorityType `tenant_adjudication`;
- sourceSystem `hr`;
- sourceIdentityKey exacto coincide con `shp-57d2e3769946`;
- precompose aplicado sin conflictos.

### Único blocker real

`PROVIDER_EXACT_LINK_APPLIED_BUT_NOT_EXPORTED_TO_CANONICAL_IDENTITY_MAP`.

`CX.data.__identityMap['shp-57d2e3769946']` permaneció ausente (`targetCanonicalActual=null`) aunque el target provider link ya estaba presente/aplicado y las dos visitas de agosto ya estaban correctamente bajo `TYA_GT_0C0BA8856E`, con residual `0`.

Los FAIL derivados I3.4/I3.7 del resumen del runner no se adjudican como regresiones: el artifact runtime demuestra postulación y legal sanos. I3.6 Historical Shopper reuse permanece PASS/frozen.

### Safety exacta del one-shot

Historical Shopper `0`; Shopper credential selection `0`; user creates/updates `0`; password changes/resets `0`; Auth/Firestore/HR/Rules/Storage writes `0`; Rules deploy `0`; Make/Gemini/payment `0`; Hosting/Cloud Run deploys `0`; merge/production false; credenciales/tokens expuestos false.

El one-shot quedó cerrado `enabled=false / consumed=true` en commit `b5effad60d643776c4deeb82a43b4ea114a1ec58`. No existe retry automático.

## Corrección source-only — canonical identityMap

### Adapter reusable

Commit `e8742207db9e81b23f53429d7f487894ae9a9a0d` modifica únicamente `app/adapters/cxorbia-provider-identity-link-runtime-v1.js`.

Se agregó un post-compose bridge fail-closed que:
- toma únicamente provider links authoritative/exact ya validados por tenant/proyecto;
- conserva el precompose de perfiles existente;
- exporta `sourceIdentityKey` y aliases técnicos exactos al `result.identityMap` únicamente si el canonical ya existe en shoppers o visitas compuestas;
- nunca sobreescribe un mapping existente distinto; registra conflicto;
- no crea canonical identities;
- no usa nombre/email/teléfono/fuzzy matching;
- no escribe provider, Firestore ni browser truth.

### Gate de contrato

Commit `0d73d6c3dced2d5c0e826a16fd2f785634af7515` amplía `tools/qa/cxorbia-provider-identity-runtime-contract-parity-gate.mjs` para exigir:
- `shp-57d2e3769946 -> TYA_GT_0C0BA8856E` en identityMap source test;
- input no mutado;
- conflicto existente no sobreescrito;
- canonical presente como condición obligatoria;
- exact technical only y fuzzy false.

Commit `a4c85480b10678eca83aae5781d255a27a994446` integra ese parity gate puro dentro de `tools/qa/cxorbia-p0-exact-identity-contract-source-gate.mjs`, sin provider calls ni writes.

## Validación source-only

- `Phase A Source Safe Runtime Guard`: validation SUCCESS.
- `Phase A Visual Smoke` run `32193643479`: `Run P0 exact identity source gates` SUCCESS sobre commit `a4c85480...`; ese P0 ahora ejecuta también el parity exacto de identityMap.
- Request Staff permanece disabled/consumed: workflows source posteriores no ejecutan Staff/provider.
- R3-C workflow source posterior no tiene autorización de deploy y no se usa para materializar automáticamente.

No se ha hecho deploy del adapter post-compose corregido; por tanto aún no se afirma PASS runtime del nuevo identityMap.

## Archivos tocados en este bloque

- `.github/cxorbia-gate-requests/request.json` — autorización y consumo del one-shot.
- `app/docs/SOURCE-LOCK-CXORBIA-TYA.md` — sincronización de lock previa al gate.
- `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md` — checkpoint previo al gate.
- `app/adapters/cxorbia-provider-identity-link-runtime-v1.js` — fix reusable post-compose identityMap.
- `tools/qa/cxorbia-provider-identity-runtime-contract-parity-gate.mjs` — tests fail-closed del export exacto.
- `tools/qa/cxorbia-p0-exact-identity-contract-source-gate.mjs` — ejecución automática del parity dentro del P0 source gate.
- documentación de continuidad actualizada en este cierre.

`/app/modules`: `0`. `/app/core`: `0`. Interfaz pública `CX.data`: no se rediseña; se corrige únicamente la composición autorizada de `__identityMap` dentro del adapter protegido.

## Clasificación

- **Reusable CXOrbia:** provider exact-link post-compose → canonical identityMap, canonical-presence gate y conflict fail-closed.
- **Exclusivo TyA/Cinépolis:** IDs target y evidencia del caso; no lógica hardcodeada.
- **Claude/prototipo:** sin parche UI ni cambio en módulos.
- **Academia:** sin cambio funcional visible; no requiere material nuevo todavía.
- **Sin impacto Claude inmediato:** materialización/validación backend DEV.

## Avance

**Formal: 35% completado / 65% pendiente.** No se suman todavía los 25 puntos de I3 hasta PASS integral runtime.

## Siguiente bloque exacto

`NEW_AUTH_REQUIRED_I3_11C_DEV_HOSTING_MATERIALIZE_IDENTITYMAP_POSTCOMPOSE_SOURCE_NO_STAFF`.

Alcance futuro: máximo `1` Firebase Hosting DEV deploy del source exacto ya corregido + remote byte/SHA parity del adapter; cero Staff runtime; cero provider data/Auth/Firestore-data/Rules/HR/Storage/Make/Gemini/payment writes; cero Historical Shopper; cero Cloud Run; cero merge/production.

Solo después de Hosting PASS se solicitará una nueva observación Staff read-only separada para cerrar I3.
