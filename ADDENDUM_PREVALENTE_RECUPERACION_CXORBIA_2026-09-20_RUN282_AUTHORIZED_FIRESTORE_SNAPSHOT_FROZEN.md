# ADDENDUM PREVALENTE — I3 RUN 282 AUTHORIZED FIRESTORE SNAPSHOT HANDOFF LOCK

**Fecha:** 2026-09-20  
**ID:** `CXORBIA-I3-RUN282-AUTHORIZED-FIRESTORE-SNAPSHOT-20260920`  
**Estado:** `FROZEN_PREVALENT_UNTIL_I3_GO_OR_NEWER_EXPLICIT_SUPERSESSION`  
**Iteración:** `I3 — FUNCTIONAL CLOSURE`

## Evidencia física
Run 282 (`35495945752`) pasó Step21, Step23, Gate20 y artifact único sobre source `23a2b3b076a585cad7da3a4c50dfe9d4e3192995`.

Live fixtures: `7/10`; `cleanup=true`; `build=0`; `deploy=0`; `production=false`; artifact `1556dcf704a53f7f131efe29f986b6723efc58bca5c882e316eea0ff6504cc34`; HR revision `bb0d190c8aa8e70ef23f1d7183b071cf6894027eb877557303b645a11b354905`.

Los cuatro shoppers sintéticos persistieron, autenticaron y, tras `CX.backend.refresh()`, estaban presentes en `CX.data.shoppers` con país, teléfono, correo y estado exactos. Cross-project quedó bloqueado con `SHOPPER_COMMAND_SCOPE_DENIED`. Sin embargo, las filas DOM seguían ausentes y el detalle HN no podía abrirse.

Primer causal: `FUNCTIONAL_DEFECT:ADMIN_FIXTURE_REQUIRES_EXPLICIT_BACKEND_REFRESH`.

## Causa raíz
El empalme Firestore→HR dependía de capturar el objeto mutable `CX.data`. No existía un snapshot autorizado e inmutable publicado por el backend antes de los eventos de composición. Esto permitía que una recomposición consumiera un estado anterior aunque Firestore ya tuviera los perfiles nuevos. Además, el refresh wrapper podía limpiar `lastProtectedState` inmediatamente después de que `backend-ready` lo hubiese actualizado.

## Corrección focal
- `backend-firebase.js` publica `CX_BACKEND_AUTHORIZED_STATE` antes de cualquier evento de backend.
- El bridge consume preferentemente ese snapshot exacto.
- `CX.backend.refresh()` deja de borrar el snapshot recién capturado.
- La composición final emite `shoppers` y `visit-flow` para refrescar explícitamente la vista activa.
- El harness guarda `probe` y `finalPresentation` y separa recomposición, scope y rerender si persistiera un fallo.

Nueva product source: `2ca71bac1fe66b7cdc28ea99b106e7e99010f048`  
Tree: `8425d3c07bc78fad23eaf75dc30f93835cf53c8f`

Producción: `DO_NOT_TOUCH`.