# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-12 17:44 -06:00  
**Estado:** `C6_RUNTIME_09_STOP_RETRY_POST_AUTH_HANDOFF__SOURCE_REPAIR_APPLIED__HOSTING_1_OF_1__PHASE_A_88`

## Pendiente vivo único de continuidad

```text
NEW HOSTING_RUNTIME_ONCE Staff sobre HEAD reparado
→ preflight v4 (shell + keyboard submit + membership/authority/frontend handoff)
→ C6_LIVE_USER_ADMIN_FRONTEND_WIRING_RUNTIME_READONLY_PROOF
→ M7
→ M8
→ M9
→ M10
```

## Ya implementado y no reabrir

- Exact Write V2/canonical readback.
- Formulario único `#loginForm/#lgUser/#lgPass/#lgSubmit`.
- Action explícita/fail-closed.
- Selector Staff dedicado sin Shopper/HR/Firestore.
- Shell Hosting validado con `bash -n`, sin heredocs anidados.
- Submit QA canónico por Enter desde `#lgPass`.
- Wiring Staff fail-closed contra `tenants/tya/users/{uid}`.
- Nuevo handoff post-auth: authority-ready → membership reverify → stale-empty reconcile → `CX.app.enter()` existente.
- Smoke v3: membership + authority + frontend handoff + shell + reload x3/new-tab.
- Preflight v4: valida todo lo anterior antes de provider y prohíbe mutación directa de UI desde el adapter.
- D technical-login rebase/private handoff, Auth340, SKIP13, MultiAuth, HR y M4/static.

No reabrir sin drift reproducible.

## Resultado runtime 09

Run `31651410812`, job `94296350609`, artifact `9162751195`, digest `sha256:16970fb360a1fc54d3b94f7a6ff87138afa959ac6b6fa31f7299b78dfeee48d8`.

- preflight Staff v3: PASS;
- Google Cloud auth: PASS;
- selector Staff: PASS (`coordinador`);
- source parity: PASS;
- Hosting DEV: **deploy físico PASS, 1/1 consumido**;
- remote parity: PASS exact=true;
- submit: ejecutado;
- contexto Staff: PASS (`coordinador/staff/tya/cinepolis`);
- HR authority: PASS, **15 periodos / 660 visitas / 211 shoppers**, duplicados=0;
- frontend final: FAIL (`appOn=false`, `loginHidden=false`, stale `backendEmpty=true`);
- artifact=`FAIL_C6_DEV_ROOT_ENTRYPOINT_HOSTING_AND_RUNTIME`;
- nuevos writes=0; producción=false.

Causa raíz: `C6_POST_AUTH_HR_AUTHORITY_FRONTEND_ENTRY_HANDOFF_GAP__STALE_FIRESTORE_EMPTY_STATE`.

`STOP_RETRY` aplicado: no rerun, no segundo request, no segundo Hosting.

## Reparación ya aplicada

- membership/frontend handoff: `a89ec134fe1b3b9cd0a8f014b39133d7a72ccd5a`;
- smoke con verificación completa del handoff: `87bcddebeb74147dc0862ff3115186795978f058`;
- preflight v4: `84e736b064d66bf7f7bde3d54955d98fb0f0a9a9`.

No se ejecutó otro runtime después de la reparación.

## Pendiente inmediato

Nueva autorización explícita para un `HOSTING_RUNTIME_ONCE` Staff bound al HEAD vivo reparado. Exigir preflight v4 antes de provider; luego máximo un Hosting DEV. Con PASS real, cerrar M7 y continuar inmediatamente M8 → M9 → M10. Ante fallo post-provider: `STOP_RETRY`.

## Pendiente frontend heredado separado

`app/modules/cliente-extra.js`: PDF print, XLSX y PPTX. No bloquea este proof C6.

## Progreso

`M1=35/35 | M2=20/20 | M3=15/15 | M4=5/5 | M5=8/8 | M6=5/5 | M7=0/5 | M8=0/3 | M9=0/3 | M10=0/1`

**88% certificado | 12% restante | delta certificado runtime 09=+0%.**

## Claude / Academia

Cero cambios en `/app/modules` o UI visual. No pedir candidata. Academia se actualiza únicamente después del runtime Staff PASS.
