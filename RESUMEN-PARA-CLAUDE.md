# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-12  
**Estado:** `C6_STAFF_SINGLE_VISIBLE_FORM_QA_ROOTCAUSE_FIXED__STOP_RETRY__PHASE_A_88__HOSTING_1_OF_1`

## Estado vigente

C6 Staff Exact Write V2 permanece cerrado con PASS real en `cxorbia-backend-dev`.

El wiring source `Firebase Auth → claims → tenants/tya/users/{uid} → CX.session/RBAC → backend read → frontend` permanece implementado para Staff.

El nuevo run autorizado `31646324988` sí llegó a Hosting DEV:

- request/source gate: PASS;
- selector Staff/admin: PASS;
- Hosting deploy: PASS;
- root parity remoto: `PASS_C6_DEV_ROOT_ENTRYPOINT_REMOTE_PARITY`;
- Hosting consumido: **1/1**.

El runtime Staff terminó en `FAIL_C6_LIVE_USER_ADMIN_FRONTEND_WIRING_RUNTIME_READONLY_PROOF` **antes de enviar credenciales**, por lo cual Firebase Auth, claims, membership, CX.session/RBAC, backend read, frontend autenticado, reload y new-tab no quedaron certificados en esta ejecución.

## Causa raíz que NO requiere cambio frontend

El producto vigente usa deliberadamente el único formulario visible `#loginForm/#lgUser/#lgPass/#lgSubmit`, implementado por `app/core/backend-browser-auth.js`.

El QA acumulado Staff todavía esperaba el overlay obsoleto `#cxIntegratedAuthStep/#cxIntegratedAuthLogin/...`. Esa diferencia produjo un falso negativo del smoke.

No corregir el frontend para satisfacer el harness antiguo. No reintroducir un segundo overlay Staff.

La corrección quedó exclusivamente en tooling QA:

- commit `5c9663dd6b1174cf8d59186484eb09e83316e862`;
- archivo `tools/qa/tya-c6-dev-root-runtime-wrapper.mjs`;
- Staff-only sigue ahora el formulario canónico visible;
- lógica genérica Shopper/Client preservada;
- cero rerun/deploy después de la corrección por `STOP_RETRY`.

## Frontend / Claude

- No generar nueva candidata.
- No modificar `app/modules` por este hallazgo.
- No reabrir Login, Exact Write V2, D rebase, Auth340, SKIP13, MultiAuth, HR ni M4/static.
- Mantener `app/core/backend-browser-auth.js` con formulario único visible y fail-closed.
- PDF/XLSX/PPTX de `app/modules/cliente-extra.js` siguen como pendiente frontend heredado separado de C6.

## Progreso

`M1=35/35 | M2=20/20 | M3=15/15 | M4=5/5 | M5=8/8 | M6=5/5 | M7=0/5 | M8=0/3 | M9=0/3 | M10=0/1`

**Phase A certificado: 88% | restante: 12% | delta certificado: +0%.**

## Siguiente acción exacta

La autorización actual está cerrada: Hosting DEV consumido `1/1` y `STOP_RETRY` aplicado. No rerunear `31646324988` ni crear otro request/deploy sin autorización nueva.

El source QA queda preparado para un nuevo `C6_LIVE_USER_ADMIN_FRONTEND_WIRING_RUNTIME_READONLY_PROOF`. Con PASS real continuar `M7 → M8 → M9 → M10`.

## Academia

Sin cambio de contenido todavía. Al certificar runtime Staff, actualizar manuales/cursos sobre login único, rutas por rol, permisos, recuperación/errores de acceso y notificaciones. No enseñar el overlay Staff obsoleto.
