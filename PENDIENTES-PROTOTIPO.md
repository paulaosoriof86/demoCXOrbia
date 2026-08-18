# PENDIENTES-PROTOTIPO.md

**Última sincronización:** 2026-08-18 16:23 -06:00  
**SYNC_EPOCH:** `CXORBIA-20260818-I3-11C-NAV-HARNESS-SOURCE-PASS-08`  
**Estado:** `NO_UI_WORKAROUND__NAV_HARNESS_SOURCE_PASS__NEW_STAFF_AUTH_NEXT__GO_LIVE_35`

## Pendiente vivo único antes de continuar I3

`NEW_EXACT_AUTH_I3_11C_STAFF_CANONICAL_OBSERVATION_AFTER_NAV_HARNESS_SOURCE_PASS`.

R3-C Hosting está PASS/frozen. El Staff run `32188716203` ocurrió una vez y quedó consumido; no se repite.

## Qué falló realmente en ese run

`STAFF_RUNTIME_NAVIGATION_DOMCONTENTLOADED_TIMEOUT_BEFORE_APP_STATE`.

No alcanzó login ni app state (`lastState=null`), por lo que canonical/agosto no fueron observados. I3.4/I3.5/I3.7 quedan no adjudicados por ese timeout base; I3.6 Historical Shopper reuse sigue PASS.

## Corrección source-only completada

Commit `9feb5f69a35169eac2931843309ad847d374b1b3` modifica solo el smoke Staff QA:
- `waitUntil:'domcontentloaded'` → `waitUntil:'commit'` en entrada, reloads y nueva pestaña;
- selector visible Admin conserva el gate de UI y pasa a 60 s;
- `waitReady()` conserva todos los requisitos funcionales posteriores.

Source checks ya observados: `Phase A Source Safe Runtime Guard` SUCCESS y `Run P0 exact identity source gates` SUCCESS. El request está disabled/consumed, por lo que workflows de sincronización no ejecutan Staff/provider; R3-C no redeployó.

## Nueva autorización necesaria

Una sola lectura Staff/Admin existente sobre DEV para verificar exclusivamente:
- `shp-57d2e3769946 -> TYA_GT_0C0BA8856E`;
- agosto canonical `2`;
- residual live `0`;
- duplicateVisitKeys `0`;
- duplicateShopperIds `0`.

Cero Historical Shopper; provider/Auth/Firestore/Rules/HR/Storage/Make/Gemini/pagos writes `0`; deploys `0`; cambios de contraseña/usuarios `0`; merge/production false.

## No hacer

No provider repair, no Admin/Shopper nuevo, no reset, no Hosting/Rules redeploy, no HR reimport, no parche UI, no rama/PR/candidata/metodología nueva y no repetir R3-A/R3-B/R3-C.

## Frozen / no reprocesar

I1/I2/I3.1→I3.10; Historical Shopper; TARGET_B Admin; request08; I3.5B/I3.5C-2/I3.8; Rules I3.11C; focal provider read; R3-B; R3-C; Staff run `32188716203`; HR 15/660; Finance V2/historical; legal V0.4.

## I4 — después de I3

Shopper lifecycle; agenda/visita/evidencias/cuestionario/review; sync HR bidireccional; Finanzas/liquidaciones/pagos; multi-proyecto/no-code; roles/notificaciones/integraciones; Academia/manuales/rutas.

## I5

Freeze sin P0 → SHA/manifest/build-lock/verifier → preproducción → rollback → same-build E2E → gate producción → cutover/smoke → baseline.

## Avance

**35% / 65% pendiente.** I3 integral PASS → **60% / 40%**.
