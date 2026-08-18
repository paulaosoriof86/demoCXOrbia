# PENDIENTES-PROTOTIPO.md

**Última sincronización:** 2026-08-18 16:18 -06:00  
**SYNC_EPOCH:** `CXORBIA-20260818-I3-11C-STAFF-PUSH-NAVIGATION-HOLD-07`  
**Estado:** `NO_UI_WORKAROUND__HOSTING_PASS__STAFF_NAVIGATION_HARNESS_SOURCE_FIX_NEXT__GO_LIVE_35`

## Pendiente vivo único antes de continuar I3

`SOURCE_ONLY_STAFF_NAVIGATION_HARNESS_HARDENING_NO_PROVIDER`.

R3-C Hosting ya pasó y está congelado. La única ejecución Staff/Admin post-Hosting autorizada también ocurrió y quedó consumida: run `32188716203`, job `95878165921`, artifact `9343461375`.

## Bloqueo demostrado

`STAFF_RUNTIME_NAVIGATION_DOMCONTENTLOADED_TIMEOUT_BEFORE_APP_STATE`.

El browser agotó 60 s en `page.goto(... waitUntil:'domcontentloaded')` antes del login. `lastState=null`.

Por tanto en ese run **no fueron observados**:
- `shp-57d2e3769946 -> TYA_GT_0C0BA8856E`;
- canonical agosto `2`;
- residual agosto `0`;
- duplicados `0/0`.

Los valores default del resumen no se usan como verdad del provider/runtime. I3.4/I3.5/I3.7 quedan no adjudicados por el fallo base de navegación; I3.6 Historical Shopper reuse sigue PASS.

## Qué NO corresponde hacer

- no repetir run `32188716203`;
- no tocar provider identity link;
- no crear/reparar Admin o Shopper;
- no resetear contraseñas;
- no redeploy Hosting/Rules;
- no reimportar HR;
- no parche UI;
- no abrir rama, PR, candidata o metodología nueva.

## Próximo bloque

Corregir solo `tools/qa/tya-c6-staff-admin-human-auth-browser-smoke.mjs` para separar navegación HTTP de readiness visible/runtime y conservar diagnóstico fail-closed. Source/static checks únicamente; cero Staff/provider reads, writes, deploy, merge o producción.

Después de source PASS se pedirá una única nueva autorización Staff/Admin read-only para cerrar la observación canonical + agosto. No se repiten R3-A/R3-B/R3-C ni Historical Shopper.

## Frozen / no reprocesar

I1/I2/I3.1→I3.10; Historical Shopper; TARGET_B Admin; request08; I3.5B/I3.5C-2/I3.8; Rules I3.11C; focal provider read; R3-B; R3-C Hosting; Staff run `32188716203`; HR 15/660; Finance V2/historical; legal V0.4.

## I4 — pendiente después de I3

Shopper lifecycle; agenda/visita/evidencias/cuestionario/review; sync HR bidireccional; Finanzas/liquidaciones/pagos; multi-proyecto/no-code; roles/notificaciones/integraciones; Academia/manuales/rutas.

## I5

Freeze sin P0 → SHA/manifest/build-lock/verifier → preproducción → rollback → same-build E2E → gate producción → cutover/smoke → baseline.

## Avance

**Formal 35% / 65% pendiente.** I3 integral PASS llevará a **60% / 40%**.
