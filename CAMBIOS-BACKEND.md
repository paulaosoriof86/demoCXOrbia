# CAMBIOS-BACKEND.md

**Última actualización:** 2026-08-12  
**Estado:** `C6_STAFF_SINGLE_VISIBLE_FORM_QA_ROOTCAUSE_FIXED__STOP_RETRY__PHASE_A_88__HOSTING_1_OF_1`

## Bloque ejecutado

`C6_LIVE_USER_ADMIN_FRONTEND_WIRING_RUNTIME_READONLY_PROOF`.

Objetivo autorizado: certificar exclusivamente Staff canónico en DEV:

`Firebase Auth → claims → tenants/tya/users/{uid} → CX.session/RBAC → backend read → frontend`, incluyendo reload/new-tab.

## Archivos tocados en este bloque

1. `backend/config/corte6-dev-root-entrypoint-hosting-execute.json`
   - nuevo request one-shot `c6-live-user-admin-membership-runtime-proof-20260812-04`;
   - request commit `eec93e7f1fe89d1a63ca2ea6e7bf8b99f2d6af7d`;
   - bound al target autorizado `33ad176fb886c51c0dd3d8d81afee3ac83ac4be9`.
2. `tools/qa/tya-c6-dev-root-runtime-wrapper.mjs`
   - commit source-only `5c9663dd6b1174cf8d59186484eb09e83316e862`;
   - corrección Staff-only del contrato QA hacia el formulario real `#loginForm/#lgUser/#lgPass/#lgSubmit`;
   - Shopper/Client genérico preservado.
3. `app/docs/evidence/c6-live-user-admin-runtime-proof-31646324988.json`
   - evidencia sanitizada y durable de ejecución, Hosting, root parity, fallo runtime, causa raíz y seguridad.
4. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`, `CAMBIOS-BACKEND.md`, `RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md`, índice vigente y mirrors documentales.

No se modificó `app/modules` ni UI de producto.

## Ejecución 31646324988

- artifact: `9160870076`;
- digest: `sha256:e92ec72789ded9db63346bb6b1ca39e71861b4a28b14e35558940124f7e7782b`;
- request/source gate: PASS;
- selector privado Staff/admin: PASS;
- Hosting DEV deploy: PASS, exit `0`;
- Hosting consumido: **1/1**;
- root parity: `PASS_C6_DEV_ROOT_ENTRYPOINT_REMOTE_PARITY`;
- runtime Staff: `FAIL_C6_LIVE_USER_ADMIN_FRONTEND_WIRING_RUNTIME_READONLY_PROOF`.

La ejecución no certificó la cadena Staff porque falló antes del envío de credenciales. Reload/new-tab no fueron alcanzados.

## Causa raíz demostrada

El runtime QA estaba desalineado con el producto.

`app/core/backend-browser-auth.js` define deliberadamente un único formulario visible para Staff: `#loginForm/#lgUser/#lgPass/#lgSubmit`.

El smoke acumulado aún esperaba el overlay legado `#cxIntegratedAuthStep/#cxIntegratedAuthLogin/#cxIntegratedAuthPassword/#cxIntegratedAuthSubmit`; por eso produjo un falso negativo inmediatamente después de seleccionar admin.

Clasificación: `QA_HARNESS_CONTRACT_DRIFT`. No hay evidencia de fallo provider/data/Auth/membership porque la prueba no llegó a autenticación.

## Corrección post-fallo sin segundo intento

Commit `5c9663dd6b1174cf8d59186484eb09e83316e862` corrige únicamente el wrapper QA Staff para seguir el formulario canónico visible. No se ejecutó otro request, Hosting o runtime después de la corrección.

`STOP_RETRY` se respetó.

## Seguridad

- Hosting DEV de esta autorización: `1/1` consumido.
- Nuevos Auth writes: `0`.
- Nuevos Firestore writes: `0`.
- HR/Rules/Storage writes: `0`.
- Make/Gemini/pagos: `0`.
- Segundo Exact Write: `0`.
- Segundo intento: `0`.
- Secretos/valores exportados: `0`.
- Merge: `false`.
- Producción: `false`.

## Progreso Phase A

`M1=35/35 | M2=20/20 | M3=15/15 | M4=5/5 | M5=8/8 | M6=5/5 | M7=0/5 | M8=0/3 | M9=0/3 | M10=0/1`

**TOTAL CERTIFICADO=88% | RESTANTE=12% | DELTA CERTIFICADO=+0%.**

Hosting/root parity sí avanzaron técnicamente, pero M7 no se acredita hasta tener PASS real del runtime Staff completo.

## No reabrir

Exact Write V2, private handoff, D rebase, provider snapshot, Auth340, SKIP13, MultiAuth, HR y M4 permanecen cerrados salvo drift reproducible.

## Siguiente frontera exacta

La autorización actual está consumida y cerrada por `STOP_RETRY`. El source quedó preparado para un nuevo proof Staff, pero no puede ejecutarse sin una nueva autorización explícita que permita otro Hosting DEV.

Con PASS: `M7 → M8 → M9 → M10`.

## Clasificación

- **Reusable CXOrbia:** tooling QA alineado al formulario canónico único.
- **Exclusivo cliente:** request/Hosting/proof TyA DEV.
- **Claude/prototipo:** cero cambios frontend; no reintroducir overlay Staff legado.
- **Academia:** sin cambio hasta runtime PASS.
- **Sin impacto Claude:** tooling, evidencia y docs.
