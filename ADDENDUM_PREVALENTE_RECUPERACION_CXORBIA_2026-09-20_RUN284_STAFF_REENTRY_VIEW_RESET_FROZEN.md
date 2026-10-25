# ADDENDUM PREVALENTE — I3 RUN 284 STAFF RE-ENTRY VIEW RESET LOCK

**Fecha:** 2026-09-20  
**ID:** `CXORBIA-I3-RUN284-STAFF-REENTRY-VIEW-RESET-20260920`  
**Estado:** `FROZEN`  
**Iteración:** `I3 — FUNCTIONAL CLOSURE`

## Run 284
Run `35497810660`:
- Step23 PASS
- Gate20 PASS
- artifact único PASS
- live fixtures `7/10`
- cleanup=true
- build=0
- deploy=0
- production=false
- Gate21 SKIPPED

Primer causal físico:
`VISUAL_DEFECT:ADMIN_ROWS_NOT_RERENDERED_AFTER_COMPOSITION`.

## Root cause exacto
El handoff Staff `app/adapters/tya-c6-live-user-admin-membership-wiring-v1.js::finalizeStaffFrontend` escucha cada `cx:protected-auth-hr-authority-ready` y ejecutaba incondicionalmente `CX.app.enter()`.

`backend-browser-auth.js` envuelve `app.enter()` y reaplica `applyCxSession(currentContext)`, que hace `CX.session.clear()` y luego `CX.session.view=null`. El posterior `router.mount()` cae a la primera ruta Admin permitida: `midia`. Por eso los perfiles ya estaban en `CX.data` y en `shoppersFor()`, pero las filas de `shoppers` desaparecían del DOM.

## Corrección focal
Si el shell Staff canónico ya está visible (`#app.on`, login oculto y sesión con rol), el handoff NO vuelve a ejecutar `CX.app.enter()`. Solo republish membership/estado canónico. La primera entrada real conserva el flujo existente.

Nueva product source:
- `6e5c8c2af101c25c418ceeb6dbd83c7779af383d`
- tree `ff7c5b5b6cab06478e3efa19dff33532644e4db1`

## Shopper histórico vivo — evidencia actual
En el mismo Run 284, `PASS_I3_HUMAN_LIVE_ACCEPTANCE` navegó realmente como shopper GT y HN contra HR revision:
`3faa7a0edcf4810f0b86ab6f2bbed788398468e65f6e0352f544b7129d80de6f`.

Vista `Mis Visitas`:
- GT: Historial 11 / Total 12.
- HN: Historial 5 / Total 5.
- autoridad HR viva aplicada=true.
- fuente: `hr-live-all-periods+firestore-authenticated-exact-overlay`.

Por tanto, el shopper ya dispone de historial vivo visible en su propio portal DEV canónico.

Producción: `DO_NOT_TOUCH`.

Siguiente acción: una sola recertificación canónica hasta Step23 → Gate20 → artifact único → live fixtures 10/10 → Gate21 PASS.