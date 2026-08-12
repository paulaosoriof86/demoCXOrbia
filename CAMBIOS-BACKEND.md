# CAMBIOS-BACKEND.md

**Última actualización:** 2026-08-12 17:43 -06:00  
**Estado:** `C6_RUNTIME_09_STOP_RETRY_POST_AUTH_FRONTEND_HANDOFF__HOSTING_1_OF_1__SOURCE_REPAIR_APPLIED__PHASE_A_88`

## Bloque ejecutado

One-shot `HOSTING_RUNTIME_ONCE` para `C6_LIVE_USER_ADMIN_FRONTEND_WIRING_RUNTIME_READONLY_PROOF`.

## Resultado runtime 09

Request `c6-live-user-admin-membership-runtime-proof-20260812-09` → run `31651410812` / job `94296350609` / artifact `9162751195` / digest `sha256:16970fb360a1fc54d3b94f7a6ff87138afa959ac6b6fa31f7299b78dfeee48d8`.

PASS demostrado:
- request/action/mode exactos;
- preflight Staff v3 con `bash -n`, no nested heredoc, keyboard-submit y binding `submit`;
- Google Cloud DEV auth;
- selector Staff dedicado (`coordinador`), Shopper/Cliente=false;
- source parity PASS;
- Firebase Hosting DEV deploy completo: **1/1**;
- remote parity PASS exact=true, root 302 y canonical 200;
- submit canónico ejecutado;
- contexto Staff alcanzado: `coordinador`, namespace `staff`, tenant `tya`, proyecto `cinepolis`;
- HR authority aplicada: **15 periodos, 660 visitas, 211 shoppers**, `2025-06` a `2026-08`, duplicados=0.

FAIL runtime final:
- `appOn=false`;
- `loginHidden=false`;
- `CX_BACKEND_LAST_STATE.empty=true` persistió aunque `CX.data` ya contenía 15 periodos/660 visitas;
- artifact decisivo: `FAIL_C6_DEV_ROOT_ENTRYPOINT_HOSTING_AND_RUNTIME`.

Clasificación: `C6_POST_AUTH_HR_AUTHORITY_FRONTEND_ENTRY_HANDOFF_GAP__STALE_FIRESTORE_EMPTY_STATE`.

No se demostró fallo nuevo de credenciales, claims, membership, Firestore read o HR. El fallo está localizado en el handoff final post-auth/authority hacia el shell visible.

## Reparación aplicada después de STOP_RETRY

Sin rerun, provider ni Hosting adicional:
1. `app/adapters/tya-c6-live-user-admin-membership-wiring-v1.js` — commit `a89ec134fe1b3b9cd0a8f014b39133d7a72ccd5a`:
   - escucha `cx:protected-auth-hr-authority-ready`;
   - revalida fail-closed la membership Staff canónica;
   - reconcilia `CX_BACKEND_LAST_STATE.empty` y `CX_CORTE4_READONLY.empty` únicamente cuando la autoridad HR canónica está poblada y consistente;
   - reutiliza `CX.app.enter()`; no agrega mutación directa de UI.
2. `tools/qa/tya-c6-staff-admin-human-auth-browser-smoke.mjs` — commit `87bcddebeb74147dc0862ff3115186795978f058`:
   - exige membership verificada + handoff `entered` + stale empty=false + `appOn/loginHidden`;
   - conserva keyboard submit, 3 reloads y new-tab.
3. `tools/qa/cxorbia-c6-staff-lane-source-preflight.mjs` — commit `84e736b064d66bf7f7bde3d54955d98fb0f0a9a9`:
   - preflight v4 incorpora contract checks membership→authority→frontend;
   - bloquea mutación directa del shell desde el adapter.
4. Evidencia durable: `app/docs/evidence/c6-live-user-admin-runtime-proof-31651410812.json`.

No se modificó `/app/modules`, `app/core/backend-preview-status.js` ni UI visual del producto.

Intento auxiliar local de validar raw GitHub falló por DNS (`raw.githubusercontent.com` no resolvió). Se declaró el fallo y no se abrió otro carril ni se tocó provider; el preflight v4 real queda obligatorio antes del próximo provider.

## Seguridad

- Hosting runtime 09: **1/1 físicamente consumido y deploy PASS**.
- Auth/Firestore/HR/Rules/Storage/Make/Gemini/pagos writes nuevos: `0`.
- Segundo Exact Write: `0`.
- Segundo intento: `0`.
- Provider/Hosting posteriores al STOP_RETRY: `0`.
- merge=false; producción=false; secretos/tokens expuestos=false.

## Progreso Phase A

`M1=35/35 | M2=20/20 | M3=15/15 | M4=5/5 | M5=8/8 | M6=5/5 | M7=0/5 | M8=0/3 | M9=0/3 | M10=0/1`

**TOTAL CERTIFICADO=88% | RESTANTE=12% | DELTA CERTIFICADO=+0%.**

## No reabrir

Exact Write V2, private handoff, D rebase, provider snapshot, Auth340, SKIP13, MultiAuth, HR y M4 permanecen cerrados salvo drift reproducible.

## Siguiente frontera exacta

No rerunear `31651410812`. Nueva autorización explícita para un nuevo `HOSTING_RUNTIME_ONCE` Staff bound al HEAD vivo reparado. El preflight v4 debe PASS antes de provider. Con PASS real cerrar M7 y continuar M8 → M9 → M10.

## Clasificación

- **Reusable CXOrbia:** handoff canónico fail-closed y reconciliación de stale provider-empty contra autoridad operativa poblada.
- **Exclusivo cliente:** próximo runtime Staff TyA.
- **Claude/prototipo:** adapter C6 únicamente; cero `/app/modules` o UI visual modificada.
- **Academia:** sin cambio hasta runtime PASS.
- **Sin impacto Claude:** QA/evidencia/docs.
