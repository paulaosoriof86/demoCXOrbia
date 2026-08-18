# RESUMEN-PARA-CLAUDE.md

**Última sincronización:** 2026-08-18 16:39 -06:00  
**SYNC_EPOCH:** `CXORBIA-20260818-I3-11C-IDENTITYMAP-SOURCE-PASS-HOSTING-AUTH-NEXT-11`  
**Estado:** `NO_FRONTEND_PATCH__STAFF_RUNTIME_REACHED__VISITS_CANONICAL__IDENTITYMAP_SOURCE_FIX_PASS__HOSTING_AUTH_NEXT__GO_LIVE_35`

## Estado Phase A

I1 `15/15 PASS`; I2 `20/20 PASS`; I3 `0/25 formal` hasta cierre integral; I4 `0/25`; I5 `0/15` = **35% / 65%**. I3 integral PASS → **60% / 40%**.

## Última ejecución Staff real

Run `32192976458`, job `95891132356`, artifact `9344922862`, digest `sha256:2ac557db3318bbcd9013e455aa8bc34d64324ce89edbb4e325801ee08c3cc2dc`.

El hardening de navegación funcionó: Admin autenticó y el runtime real quedó observable con 15 períodos y 660 visitas.

Estado target:
- provider link exacto presente/aplicado: `shp-57d2e3769946` → canonical `TYA_GT_0C0BA8856E`;
- agosto canonical `2`;
- residual live `0`;
- duplicados visitas/shoppers `0/0`;
- postulación y legal sanos en runtime;
- Historical Shopper no accedido.

El único miss fue `CX.data.__identityMap['shp-57d2e3769946']` ausente (`targetCanonicalActual=null`). No es una falla de usuario, provider data ni UI: el provider exact-link precompose ya había aplicado el canonical a perfiles/visitas, pero el cumulative composer solo exportaba al identityMap relaciones reconstruidas desde los HR shoppers del ciclo.

El one-shot quedó consumido/disabled; no repetirlo.

## Corrección backend source-only ya aplicada

`app/adapters/cxorbia-provider-identity-link-runtime-v1.js` agrega un post-compose bridge reusable que exporta links provider authoritative/exact al canonical identityMap solo cuando el canonical ya existe en la composición. Es fail-closed: no sobreescribe conflicto, no crea identidades, no fuzzy/name/email/phone matching y no escribe provider/Firestore.

Commits:
- adapter: `e8742207db9e81b23f53429d7f487894ae9a9a0d`;
- parity tests: `0d73d6c3dced2d5c0e826a16fd2f785634af7515`;
- parity integrado al P0 source gate: `a4c85480b10678eca83aae5781d255a27a994446`.

Validación source observada:
- Source Safe Runtime Guard SUCCESS;
- P0 exact identity source gate SUCCESS dentro de Visual Smoke run `32193643479`;
- el P0 ahora exige exact identityMap export, conflicto no overwrite, canonical presence, exact technical only y fuzzy false.

## Claude/prototipo — no tocar

No hacer workaround UI para este caso:
- no hardcodear `TYA_GT_0C0BA8856E`;
- no remapear desde `/app/modules` ni `/app/core`;
- no esconder residuales;
- no crear Admin/Shopper alterno;
- no deduplicar por nombre/email/teléfono;
- no modificar la interfaz de `CX.data`.

## Preservar

- R3-C Hosting anterior PASS/frozen;
- Rules I3.11C frozen;
- Historical Shopper e I3.9/I3.10 frozen;
- Staff/Admin existente;
- multi-tenant `tenantId/projectId`;
- Cinépolis proyecto configurable, nunca lógica global;
- HR viva como autoridad operacional;
- provider links exactos/fail-closed.

## Siguiente backend

Se requiere nueva autorización para **1 sola materialización Firebase Hosting DEV** del adapter post-compose ya corregido y remote parity. Ese bloque no ejecutará Staff ni escribirá datos.

Después de Hosting PASS: una nueva lectura Staff/Admin separada deberá comprobar finalmente:
- `targetCanonicalActual = TYA_GT_0C0BA8856E`;
- agosto `2`;
- residual `0`;
- duplicados `0/0`.

Solo entonces I3 puede cerrar.

## Academia

Sin cambio visible de cursos/manuales/rutas en este slice técnico. Registrar impacto cuando I4 produzca cambios funcionales visibles.

## Clasificación

- **Reusable CXOrbia:** canonical identityMap post-compose exacto/fail-closed.
- **Exclusivo TyA/Cinépolis:** IDs y evidencia target.
- **Claude/prototipo:** sin acción UI.
- **Academia:** sin cambio inmediato.
- **Sin impacto Claude inmediato:** Hosting DEV + observación backend.
