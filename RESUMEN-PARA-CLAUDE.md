# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-12 17:44 -06:00  
**Estado:** `C6_RUNTIME_09_STOP_RETRY_POST_AUTH_HANDOFF__SOURCE_REPAIR_APPLIED__PHASE_A_88__NO_MODULE_UI_CHANGE`

## Estado vigente

C6 Staff Exact Write V2 permanece cerrado con PASS real. El runtime 09 avanzó hasta autenticación/contexto Staff y autoridad HR viva completa, pero no cerró la entrada final al shell visible.

## Runtime 09

Run `31651410812`, job `94296350609`, artifact `9162751195`, digest `sha256:16970fb360a1fc54d3b94f7a6ff87138afa959ac6b6fa31f7299b78dfeee48d8`.

PASS:
- action/mode exactos;
- preflight v3 (`bash -n`, no heredoc anidado, keyboard-submit, binding canónico);
- Google Cloud DEV + selector Staff `coordinador`;
- Hosting DEV 1/1;
- remote parity exact=true;
- login submitido;
- contexto `coordinador / staff / tya / cinepolis`;
- HR authority: **15 periodos / 660 visitas / 211 shoppers**, `2025-06 → 2026-08`, duplicados=0.

FAIL final:
- `appOn=false`, `loginHidden=false`;
- el marcador Firestore vacío seguía `true` pese a la autoridad HR ya poblada.

Causa raíz: `C6_POST_AUTH_HR_AUTHORITY_FRONTEND_ENTRY_HANDOFF_GAP__STALE_FIRESTORE_EMPTY_STATE`.

## Reparación sin alterar módulos/UI

- `app/adapters/tya-c6-live-user-admin-membership-wiring-v1.js` commit `a89ec134fe1b3b9cd0a8f014b39133d7a72ccd5a`: al completar la autoridad HR, revalida membership Staff, reconcilia los markers stale de vacío y reutiliza `CX.app.enter()`.
- `tools/qa/tya-c6-staff-admin-human-auth-browser-smoke.mjs` commit `87bcddebeb74147dc0862ff3115186795978f058`: exige membership + authority + handoff `entered` + shell visible + reload x3/new-tab.
- `tools/qa/cxorbia-c6-staff-lane-source-preflight.mjs` commit `84e736b064d66bf7f7bde3d54955d98fb0f0a9a9`: preflight v4 valida el nuevo contrato antes de provider.
- No se modificó `/app/modules`, `app/core/backend-preview-status.js` ni diseño/flujo visual del prototipo.

## Frontend / Claude

- No generar nueva candidata.
- No modificar `app/modules` por C6.
- Mantener formulario único `#loginForm/#lgUser/#lgPass/#lgSubmit`.
- No reintroducir overlays legacy Staff.
- El adapter C6 puede reconciliar estado técnico y llamar al `CX.app.enter()` ya existente; no debe pintar ni mutar directamente la UI.
- No reabrir Exact Write V2, D rebase, Auth340, SKIP13, MultiAuth, HR ni M4/static.
- Pendientes heredados de `app/modules/cliente-extra.js` continúan separados y no bloquean C6 Staff.

## Seguridad

Runtime 09: Hosting `1/1` físicamente consumido; nuevos Auth/Firestore/HR/Rules/Storage/Make/Gemini/pagos writes=0; segundo Exact Write=0; segundo intento=0; merge=false; producción=false; secretos/tokens expuestos=false.

## Progreso

`M1=35/35 | M2=20/20 | M3=15/15 | M4=5/5 | M5=8/8 | M6=5/5 | M7=0/5 | M8=0/3 | M9=0/3 | M10=0/1`

**Phase A=88% | restante=12% | delta certificado runtime 09=+0%.**

## Siguiente acción exacta

No rerunear `31651410812`. Se requiere nuevo `HOSTING_RUNTIME_ONCE` Staff sobre HEAD vivo reparado; preflight v4 obligatorio antes de provider. Con PASS real cerrar M7 y continuar M8 → M9 → M10.

## Academia

Sin cambio de contenido todavía. Tras runtime PASS, actualizar manuales/cursos sobre formulario único, rutas por rol, permisos, continuidad de sesión y estados de acceso. No documentar overlays legacy ni mecanismos QA.
