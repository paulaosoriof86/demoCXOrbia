# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-12 17:29 -06:00  
**Estado:** `C6_RUNTIME_08_STOP_RETRY_POINTER_INTERCEPT__SOURCE_REPAIR_APPLIED__HOSTING_1_OF_1__PHASE_A_88`

## Pendiente vivo único de continuidad

```text
NEW HOSTING_RUNTIME_ONCE Staff sobre HEAD reparado
→ preflight v3 (shell + canonical keyboard submit)
→ C6_LIVE_USER_ADMIN_FRONTEND_WIRING_RUNTIME_READONLY_PROOF
→ M7
→ M8
→ M9
→ M10
```

## Ya implementado y no reabrir

- Wiring Staff fail-closed contra `tenants/tya/users/{uid}`.
- Formulario único `#loginForm/#lgUser/#lgPass/#lgSubmit`.
- Exact Write V2/canonical readback.
- D technical-login rebase/private handoff.
- Auth340, SKIP13, MultiAuth, HR y M4/static.
- Action explícita/fail-closed; sin derivación por sufijo.
- Selector Staff dedicado sin Shopper/HR/Firestore.
- Smoke Staff dedicado sin transformaciones textuales.
- Preflight Staff antes de provider.
- Shell Hosting sin heredocs Node anidados.
- `bash -n` del script Hosting exacto antes de provider.
- Submit QA canónico por teclado para evitar interferencia del pill diagnóstico Preview DEV sin modificar UI.

No reabrir sin drift reproducible.

## Resultado runtime 08

Run `31650715194`, job `94294235029`, artifact `9162485896`, digest `sha256:e30accedd8e8c571066319572267e84856752577b7cd4cd63e0cd1f3c7d20194`.

- preflight Staff v2: PASS;
- `bash -n`: PASS;
- Google Cloud auth: PASS;
- selector Staff dedicado: PASS (`coordinador`);
- source parity: PASS;
- Hosting DEV: **deploy físico PASS, 1/1 consumido**;
- remote parity: PASS exact=true;
- runtime: FAIL antes de submit de credenciales;
- artifact=`FAIL_C6_DEV_ROOT_ENTRYPOINT_HOSTING_AND_RUNTIME`;
- nuevos Auth/Firestore/HR/Rules/Storage/Make/Gemini/pagos writes=0;
- producción=false.

Causa raíz: `QA_POINTER_INTERCEPTION_BY_BACKEND_PREVIEW_STATUS_OVERLAY`. `#cxBackendPreviewStatus` se superpuso a `#lgSubmit` e interceptó pointer events. No hay fallo nuevo demostrado de Auth/claims/membership/Firestore/HR porque el submit no llegó a ejecutarse.

`STOP_RETRY` aplicado: no rerun, no segundo request, no segundo Hosting.

## Reparación ya aplicada

- smoke Staff commit `ccf759c2a82a5baf82397cef02c3ca7851e13ce8`: submit del mismo formulario canónico mediante Enter desde `#lgPass`, sin mutar/ocultar UI;
- preflight v3 commit `7cab212e5583ed7e2b4dc8b132b0d2b5bf953c19`: exige keyboard-submit, bloquea pointer click sobre `#lgSubmit` y confirma binding canónico `submit` en `backend-browser-auth.js`.

No se ejecutó otro runtime después de la reparación.

## Pendiente inmediato

Nueva autorización explícita para un nuevo `HOSTING_RUNTIME_ONCE` Staff, bound al HEAD vivo reparado, con action exacta `C6_LIVE_USER_ADMIN_FRONTEND_WIRING_RUNTIME_READONLY_PROOF`. El preflight v3 debe PASS antes de provider; luego máximo un Hosting DEV y runtime canónico con reload x3/new-tab. Ante fallo post-provider: `STOP_RETRY`.

## Pendiente frontend heredado separado

`app/modules/cliente-extra.js`: PDF print, XLSX y PPTX. No bloquea este proof C6.

## Progreso

`M1=35/35 | M2=20/20 | M3=15/15 | M4=5/5 | M5=8/8 | M6=5/5 | M7=0/5 | M8=0/3 | M9=0/3 | M10=0/1`

**88% certificado | 12% restante | delta certificado runtime 08=+0%.**

## Claude / Academia

Cero cambio frontend/producto en esta reparación. No pedir candidata. Mantener el pill diagnóstico Preview DEV; QA se adaptó sin tocar UI. Academia se actualiza únicamente después del runtime Staff PASS.
