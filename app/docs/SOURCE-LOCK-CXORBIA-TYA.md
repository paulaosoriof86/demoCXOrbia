# SOURCE LOCK CXORBIA TyA — ESTABLE Y VIGENTE

**Última sincronización:** 2026-08-18 16:26 -06:00  
**SYNC_EPOCH:** `CXORBIA-20260818-I3-11C-NAV-HARNESS-PASS-STAFF-AUTHORIZED-09`  
**Estado:** `LOCKED__R3C_HOSTING_PASS__STAFF_NAVIGATION_HOLD_CONSUMED__NAV_HARNESS_SOURCE_PASS__CURRENT_STAFF_AUTHORIZED__NO_PRODUCTION`

## Carril

Repo `paulaosoriof86/demoCXOrbia`; rama viva `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge; base `release/cxorbia-tya-rc-20260630`; DEV `cxorbia-backend-dev`.

## Avance formal

I1 `15/15 PASS`; I2 `20/20 PASS`; I3 `0/25` hasta PASS integral; I4 `0/25`; I5 `0/15`. **35% completado / 65% pendiente.** I3 integral PASS → **60% / 40%**.

## Frozen / no reprocesar

I1/I2; I3.1→I3.10; Historical Shopper; TARGET_B Admin; request08; I3.5B/I3.5C-2/I3.8; Rules I3.11C run `32163552089`; focal provider read `32171812808`; R3-B `32181137350`; R3-C Hosting `32185940998`; Staff HOLD `32188716203`; HR 15/660; Finance V2/historical; legal V0.4.

No crear Admin/Shopper alterno, no reset/recovery Historical Shopper, no Rules redeploy, no provider identity-link repair y no rerun de gates consumidos.

## R3-C Hosting DEV — PASS / consumido

Run `32185940998`, job `95869431778`, artifact `9342450216`, digest `sha256:03ccb5a71af356eade7eb498fc766af1fb4f266bb12397d2bff1f865714a09bb`.

`PASS_I3_11C_R3C_DEV_HOSTING_MATERIALIZATION_REMOTE_PARITY`: adapter corregido materializado en DEV con paridad remota exacta; `materialized + tenant_adjudication`; `fuzzyMatching:false`; 1 Hosting DEV deploy; resto de writes/deploys `0`; Historical Shopper `0`; merge/production false.

## Staff post-Hosting anterior — HOLD / consumido

Run `32188716203`, job `95878165921`, artifact `9343461375`, digest `sha256:e43814d730824a010930f8ebaa53fa5aabc417860297b7d9651bee16769340c1`.

El run ejecutó Staff una vez pero falló antes del login en `page.goto(... waitUntil:'domcontentloaded')`; `lastState=null`. Canonical/agosto no fueron observados. Los FAIL derivados I3.4/I3.5/I3.7 no se adjudican como regresiones; I3.6 Historical Shopper reuse permanece PASS. Cero writes/deploys/cambios de usuario o contraseña.

## Hardening de navegación — SOURCE PASS

Commit `9feb5f69a35169eac2931843309ad847d374b1b3`, único archivo `tools/qa/tya-c6-staff-admin-human-auth-browser-smoke.mjs`:
- navegación inicial/reloads/nueva pestaña dejan de depender de `DOMContentLoaded` y esperan `commit`;
- selector visible Admin sigue siendo obligatorio y tiene 60 s;
- `waitReady()` y todas las verificaciones funcionales, identidad, HR, legal, reloads y nueva pestaña permanecen intactas.

Validaciones source observadas: `Phase A Source Safe Runtime Guard` SUCCESS y `Run P0 exact identity source gates` SUCCESS. El request anterior quedó `enabled=false / consumed=true`, por lo que no hubo ejecución accidental de Staff/provider ni redeploy R3-C.

## Autorización vigente — una sola ejecución

Paula autorizó en la conversación actual una única ejecución `I3.11C Staff/Admin read-only post-hardening` sobre Hosting DEV usando solo la identidad Staff/Admin existente para verificar:
- `shp-57d2e3769946 -> TYA_GT_0C0BA8856E`;
- agosto canonical `2`;
- residual `0`;
- duplicateVisitKeys `0`;
- duplicateShopperIds `0`.

Límites: Historical Shopper `0`; provider/Auth/Firestore/Rules/HR/Storage/Make/Gemini/pagos writes/calls `0`; deploys `0`; password/user changes `0`; merge/production false.

## Siguiente acción exacta

`EXECUTE_ONE_I3_11C_STAFF_CANONICAL_OBSERVATION_POST_HARDENING` mediante el runner ya existente y un request de ejecución único sobre la misma rama/PR. Si PASS, cerrar I3 integral. Si HOLD, registrar únicamente la nueva causa reproducible; no reabrir R3-A/B/C ni Historical Shopper.

## Circuit breaker

Un blocker → una causa demostrada → un gate exacto → evidencia exacta. Los workflows históricos rojos no reabren gates congelados. No nueva rama, PR, candidata, metodología ni workaround UI.

## Producto / Claude / Academia

TyA primer tenant; Cinépolis primer proyecto configurable, nunca lógica global. Sin cambio UI en este bloque. El patrón de harness/identity exacta es reusable CXOrbia. Academia no cambia funcionalmente hasta slices visibles de I4.

## Producción

Sin autorización de merge ni producción. Después de I3: I4 visible; luego I5 freeze/build-lock/preprod/rollback/same-build E2E/gate explícito de producción/cutover/smoke/baseline.
