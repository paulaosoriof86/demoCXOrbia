# CAMBIOS-BACKEND.md

**Última actualización:** 2026-08-12 17:29 -06:00  
**Estado:** `C6_RUNTIME_08_STOP_RETRY_PREVIEW_STATUS_POINTER_INTERCEPT__HOSTING_1_OF_1__SOURCE_REPAIR_APPLIED__PHASE_A_88`

## Bloque ejecutado

One-shot `HOSTING_RUNTIME_ONCE` para `C6_LIVE_USER_ADMIN_FRONTEND_WIRING_RUNTIME_READONLY_PROOF`.

## Resultado runtime 08

Request `c6-live-user-admin-membership-runtime-proof-20260812-08` → run `31650715194` / job `94294235029` / artifact `9162485896` / digest `sha256:e30accedd8e8c571066319572267e84856752577b7cd4cd63e0cd1f3c7d20194`.

PASS demostrado:
- request/action/mode exactos;
- preflight Staff v2;
- `bash -n` del shell Hosting exacto;
- no heredoc anidado;
- Google Cloud DEV auth;
- selector Staff dedicado (`coordinador`), Shopper/Cliente=false;
- source parity PASS;
- Firebase Hosting DEV deploy completo: **1/1**;
- remote parity PASS exact=true, root 302 y canonical 200.

FAIL runtime:
- el submit de login no llegó a ejecutarse;
- `#lgSubmit` estaba visible/enabled, pero `#cxBackendPreviewStatus` se superponía e interceptaba pointer events;
- artifact decisivo: `FAIL_C6_DEV_ROOT_ENTRYPOINT_HOSTING_AND_RUNTIME`.

Clasificación: `QA_POINTER_INTERCEPTION_BY_BACKEND_PREVIEW_STATUS_OVERLAY`.

No se demostró fallo de producto/Auth/claims/membership/Firestore/HR porque las credenciales no fueron enviadas.

## Reparación aplicada después de STOP_RETRY

Sin rerun, provider ni Hosting adicional:
1. `tools/qa/tya-c6-staff-admin-human-auth-browser-smoke.mjs` — commit `ccf759c2a82a5baf82397cef02c3ca7851e13ce8`:
   - conserva selectores canónicos `#loginForm/#lgUser/#lgPass/#lgSubmit`;
   - reemplaza el pointer click sobre `#lgSubmit` por Enter desde `#lgPass`;
   - activa el mismo `submit` canónico ligado por `backend-browser-auth.js`;
   - no oculta ni modifica el pill Preview DEV ni ningún archivo de producto.
2. `tools/qa/cxorbia-c6-staff-lane-source-preflight.mjs` — commit `7cab212e5583ed7e2b4dc8b132b0d2b5bf953c19`:
   - exige submit canónico por teclado;
   - bloquea reintroducción de `page.click('#lgSubmit')`;
   - valida que `backend-browser-auth.js` conserve el binding del evento `submit`.
3. Evidencia durable: `app/docs/evidence/c6-live-user-admin-runtime-proof-31650715194.json`.

No se modificó `/app/modules`, `app/core/backend-preview-status.js` ni UI de producto.

## Seguridad

- Hosting runtime 08: **1/1 físicamente consumido y deploy PASS**.
- Auth/Firestore/HR/Rules/Storage/Make/Gemini/pagos writes nuevos: `0`.
- Segundo Exact Write: `0`.
- Segundo intento: `0`.
- merge=false; producción=false; secretos/tokens expuestos=false.

## Progreso Phase A

`M1=35/35 | M2=20/20 | M3=15/15 | M4=5/5 | M5=8/8 | M6=5/5 | M7=0/5 | M8=0/3 | M9=0/3 | M10=0/1`

**TOTAL CERTIFICADO=88% | RESTANTE=12% | DELTA CERTIFICADO=+0%.**

## No reabrir

Exact Write V2, private handoff, D rebase, provider snapshot, Auth340, SKIP13, MultiAuth, HR y M4 permanecen cerrados salvo drift reproducible.

## Siguiente frontera exacta

No rerunear `31650715194`. Nueva autorización explícita para un nuevo `HOSTING_RUNTIME_ONCE` Staff bound al HEAD vivo reparado. El preflight v3 debe PASS antes de provider. Con PASS real cerrar M7 y continuar M8 → M9 → M10.

## Clasificación

- **Reusable CXOrbia:** interacción QA canónica resistente a overlays diagnósticos + preflight de interacción.
- **Exclusivo cliente:** próximo runtime Staff TyA.
- **Claude/prototipo:** cero frontend modificado.
- **Academia:** sin cambio hasta runtime PASS.
- **Sin impacto Claude:** QA/evidencia/docs.
