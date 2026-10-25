# ADDENDUM PREVALENTE — I3 RUN 277 HR REVISION SINGLE-AUTHORITY LOCK

**Fecha:** 2026-09-20  
**ID:** `CXORBIA-I3-RUN277-HR-SINGLE-AUTHORITY-20260920`  
**Estado:** `FROZEN_PREVALENT_UNTIL_I3_GO_OR_NEWER_EXPLICIT_SUPERSESSION`  
**Iteración:** `I3 — FUNCTIONAL CLOSURE`

## Evidencia física
Run 277 (`35491841485`) certificó product source `f5d7113547df0c69d5d49bad3951dbd793684788` / tree `804b7e5998bd2c6c786f8f81d7a05bb0a8068034`.
Step 17 fijó HR revision `7451f66478afb5d0d7645e5d27f3a6a84c81ef0606719879af90ae615860ef01`.
Step 21 pasó exigiendo exactamente esa revisión. Step 22 persistencia y cleanup pasó. Step 23 falló primero con `RELEASE_COMPOSITION_FAILURE:ADMIN_HR_REVISION_MISMATCH`. Gate20, artifact, live fixtures y Gate21 no corrieron.

## Causa raíz demostrada
El entrypoint activo `app/index-backend-dev.html` carga `app/adapters/tya-live-source-refresh-watch-v2.js`.
Ese watcher, después de que la autoridad canónica protegida queda lista, ejecutaba `getJson('meta',{fresh:'1'})` y además reintentaba por `canonical_authority_ready`, focus, visibility, load y polling cada 20 segundos.
Por tanto, aunque el bridge protegido corregido en Run 276 ya no forzaba refresh, el watcher seguía siendo una segunda autoridad de refresh externo y podía crear otra revisión entre Step 21 y Step 23.

**Run classification:** `RELEASE_COMPOSITION_FAILURE`  
**P0 root:** `FUNCTIONAL_DEFECT:BROWSER_LIVE_WATCHER_FORCES_HR_REFRESH`  
**Owner exacto:** `app/adapters/tya-live-source-refresh-watch-v2.js::check`

## AFTER
- El watcher ya no envía `fresh=1`; consume la revisión/cache runtime.
- El runtime `hr-live-service` queda como única autoridad de cadencia de refresh externo.
- Step 17 continúa siendo el único refresh forzado de certificación.
- El gate `tools/qa/cxorbia-p0-shopper-hr-authority-source-gate.mjs` ahora falla si el watcher vuelve a contener un refresh forzado.
- El workflow agrega guard estático equivalente.
- No se cambia Auth general, mapping general, datos reales ni producción.

## Nueva candidata de producto
- source: `16d1bc8649f358f72d9576d6e4c20bfa6b833272`
- tree: `74bec1dbb83681e94b17320ea3756fa926bbb912`

## Cierre
Reejecutar únicamente el workflow canónico I3. Exigir Step21 y Step23 sobre la misma revisión fijada; luego Gate20, artifact único, live fixtures 10/10 con cleanup y Gate21 sobre el mismo manifest/artifact/revisión. Producción sigue `DO_NOT_TOUCH`.
