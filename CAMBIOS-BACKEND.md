# CAMBIOS-BACKEND.md

**Última actualización:** 2026-08-12 16:40 -06:00  
**Estado:** `C6_STAFF_ACTION_METADATA_SUFFIX_ROOTCAUSE_PROVEN__STOP_RETRY__PHASE_A_88__HOSTING_0_OF_1_THIS_RUN`

## Bloque ejecutado

`C6_LIVE_USER_ADMIN_FRONTEND_WIRING_RUNTIME_READONLY_PROOF`.

Objetivo autorizado: certificar Staff canónico en DEV mediante `Firebase Auth → claims → tenants/tya/users/{uid} → CX.session/RBAC → backend read → frontend`, con reload/new-tab y el formulario único `#loginForm/#lgUser/#lgPass/#lgSubmit`.

## Archivos tocados

1. `backend/config/corte6-dev-root-entrypoint-hosting-execute.json`
   - request 05 `c6-live-user-admin-membership-runtime-proof-20260812-05`;
   - request commit `5c30fcc75faa96334bd8c11ac3ede7f1bbfba816`;
   - target HEAD `8162460c41446f956ac66c9bd594b5e6fa2e07cd`.
2. `app/docs/evidence/c6-live-user-admin-runtime-proof-31647758560.json`
   - evidencia durable del fallo pre-Hosting y su causa raíz.
3. Checkpoint, `CAMBIOS-BACKEND.md`, `RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md`, índice y mirrors documentales.

No se modificó `app/modules` ni UI de producto.

## Ejecución 31647758560

- job: `94285159177`;
- artifact: `9161420264`;
- digest: `sha256:38136897ad4a6c973577bbf4f608afa4ee03466370d7feb2183570c1cc908594`;
- checkout/autorización/GCP/tooling: PASS;
- `Select existing DEV credentials privately`: FAIL;
- Hosting: skipped;
- deploy attempted=false;
- Hosting de este one-shot: **0/1**;
- source/runtime: no ejecutados.

`STOP_RETRY` se respetó; no hubo segundo intento.

## Causa raíz demostrada

El workflow Staff determina la acción exacta únicamente cuando `authorizationSource.endsWith('C6_LIVE_USER_ADMIN_FRONTEND_WIRING_RUNTIME_READONLY_PROOF')`.

El request 05 agregó el sufijo `_single_visible_login_form` después del token exacto. La acción resuelta quedó vacía y el workflow entró en la rama genérica Staff+Shopper, cuyo stage terminó en `select_existing_credentials_v6__HOLD_SHOPPER_R109_U104_V1_D1_H0_S0_M616_L208_P194`.

Clasificación: `REQUEST_ACTION_METADATA_SUFFIX_DRIFT`.

El repair Staff QA `5c9663dd6b1174cf8d59186484eb09e83316e862` no falló: nunca fue alcanzado. Tampoco hay nuevo fallo demostrado de provider, Auth, Firestore, membership o datos.

## Corrección preparada

Para el próximo one-shot, `authorizationSource` debe terminar exactamente en `C6_LIVE_USER_ADMIN_FRONTEND_WIRING_RUNTIME_READONLY_PROOF`, sin texto posterior. Se verificará la acción resuelta antes del selector/deploy.

## Seguridad

- Nuevos Auth writes: `0`.
- Nuevos Firestore writes: `0`.
- HR/Rules/Storage writes: `0`.
- Make/Gemini/pagos: `0`.
- Segundo Exact Write: `0`.
- Segundo intento: `0`.
- Secretos/tokens expuestos: `0`.
- Merge: `false`.
- Producción: `false`.

## Progreso Phase A

`M1=35/35 | M2=20/20 | M3=15/15 | M4=5/5 | M5=8/8 | M6=5/5 | M7=0/5 | M8=0/3 | M9=0/3 | M10=0/1`

**TOTAL CERTIFICADO=88% | RESTANTE=12% | DELTA CERTIFICADO=+0%.**

## No reabrir

Exact Write V2, private handoff, D rebase, provider snapshot, Auth340, SKIP13, MultiAuth, HR y M4 permanecen cerrados salvo drift reproducible.

## Siguiente frontera exacta

No rerunear `31647758560` ni reutilizar request 05. Por `STOP_RETRY`, se requiere una nueva autorización explícita aunque Hosting haya quedado físicamente `0/1`.

El próximo request debe quedar bound al HEAD vivo y resolver exactamente la action Staff antes de cualquier selector/deploy. Con PASS real: `M7 → M8 → M9 → M10`.

## Clasificación

- **Reusable CXOrbia:** contrato exacto de action para requests one-shot.
- **Exclusivo cliente:** proof TyA Staff en `cxorbia-backend-dev`.
- **Claude/prototipo:** cero frontend modificado.
- **Academia:** sin cambio hasta runtime PASS.
- **Sin impacto Claude:** orquestación, evidencia y docs.
