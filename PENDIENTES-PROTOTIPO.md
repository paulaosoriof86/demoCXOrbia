# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-12  
**Estado:** `C6_STAFF_SINGLE_VISIBLE_FORM_QA_ROOTCAUSE_FIXED__STOP_RETRY__PHASE_A_88__HOSTING_1_OF_1`

## Pendiente vivo único de continuidad

```text
C6_LIVE_USER_ADMIN_FRONTEND_WIRING_RUNTIME_READONLY_PROOF
→ M7
→ M8
→ M9
→ M10
```

## Wiring C6 ya implementado en source

- Staff permanece fail-closed contra `tenants/tya/users/{uid}` antes del consumo backend.
- `app/core/backend-browser-auth.js` usa el único formulario visible `#loginForm/#lgUser/#lgPass/#lgSubmit`.
- Cero módulos UI modificados en este bloque.

## Resultado del one-shot autorizado

Run `31646324988`:

- selector Staff/admin: PASS;
- source gate: PASS;
- Hosting DEV: PASS;
- root parity: `PASS_C6_DEV_ROOT_ENTRYPOINT_REMOTE_PARITY`;
- Hosting consumido: **1/1**;
- runtime Staff: FAIL antes de enviar credenciales;
- reload/new-tab: no alcanzados;
- nuevos provider/data writes: 0;
- production=false.

Se aplicó `STOP_RETRY`; no hubo segundo intento.

## Nueva causa raíz — cerrada en source, pendiente de reprobar

El harness Staff aún buscaba un overlay legado (`#cxIntegratedAuthStep/#cxIntegratedAuthLogin/...`) que ya no forma parte del contrato real. El producto usa un único formulario visible.

Clasificación: `QA_HARNESS_CONTRACT_DRIFT`.

Corrección source-only:

`5c9663dd6b1174cf8d59186484eb09e83316e862`

sobre `tools/qa/tya-c6-dev-root-runtime-wrapper.mjs`.

El Staff-only generado ahora usa `#loginForm/#lgUser/#lgPass/#lgSubmit`; Shopper/Client genérico se conserva. No hubo rerun/deploy tras la corrección.

## Ya no está pendiente

- Exact Write V2 y canonical readback.
- D technical-login rebase y private handoff.
- Auth340, SKIP13, MultiAuth, HR y M4/static.
- Scope Staff-only del selector dinámico.
- Heredoc shell blocker.
- Bloqueo latente `gha-creds-*.json` contra clean-worktree.
- Desalineación QA Staff con formulario único: **corregida source-only**, aún no certificada en runtime.

No reabrir estos puntos sin drift reproducible.

## Pendiente inmediato

Certificar realmente Staff canónico mediante un nuevo one-shot que llegue a:

`Firebase Auth → claims → tenants/tya/users/{uid} → CX.session/RBAC → backend read → frontend → reload → new-tab`.

No puede ejecutarse con la autorización actual: Hosting DEV fue consumido `1/1` y `STOP_RETRY` prohíbe segundo intento. Requiere nueva autorización explícita.

## Pendiente frontend heredado, separado de C6

`app/modules/cliente-extra.js` mantiene PDF print, XLSX y PPTX como pendientes Claude/prototipo. No son causa del wiring y no bloquean este proof.

## Progreso

`M1=35/35 | M2=20/20 | M3=15/15 | M4=5/5 | M5=8/8 | M6=5/5 | M7=0/5 | M8=0/3 | M9=0/3 | M10=0/1`

**88% certificado | 12% restante | delta certificado +0%.**

## Claude / Academia

No pedir nueva candidata. No tocar frontend para satisfacer el harness antiguo. Academia se actualiza cuando el runtime Staff certifique el flujo real; documentar entonces el formulario único canónico y no el overlay legado.
