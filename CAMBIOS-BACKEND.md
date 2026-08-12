# CAMBIOS-BACKEND.md

**Última actualización:** 2026-08-12 17:05 -06:00  
**Estado:** `PASS_C6_STAFF_LANE_SOURCE_PREFLIGHT__PHASE_A_88__C6_LANE_READY_100`

## Bloque ejecutado

Hardening source-only integral del carril `C6_LIVE_USER_ADMIN_FRONTEND_WIRING_RUNTIME_READONLY_PROOF`.

## Cambios aplicados

1. `.github/workflows/cxorbia-c6-dev-root-entrypoint-hosting.yml`
   - action explícita en request;
   - eliminada derivación por `authorizationSource.endsWith(...)`;
   - nuevo modo `SOURCE_PREFLIGHT_ONLY`;
   - futura ejecución real separada como `HOSTING_RUNTIME_ONCE`;
   - preflight antes de Google Cloud/provider;
   - selector y runtime Staff fail-closed, sin fallback genérico.
2. `tools/qa/cxorbia-c6-existing-staff-admin-e2e-credential.mjs`
   - selector Staff dedicado;
   - no Shopper, HR ni Firestore.
3. `tools/qa/cxorbia-c6-existing-users-e2e-credentials.mjs`
   - Staff enruta directamente al selector dedicado.
4. `tools/qa/tya-c6-staff-admin-human-auth-browser-smoke.mjs`
   - smoke Staff dedicado;
   - formulario canónico `#loginForm/#lgUser/#lgPass/#lgSubmit`;
   - reload x3 + new-tab.
5. `tools/qa/tya-c6-dev-root-runtime-wrapper.mjs`
   - Staff ya no modifica el smoke genérico mediante reemplazos de texto.
6. `tools/qa/cxorbia-c6-staff-lane-source-preflight.mjs`
   - gate source-only determinista/fail-closed.
7. `backend/config/corte6-dev-root-entrypoint-hosting-execute.json`
   - request source-only 06, bound a `d1951c7cee58070dd2b3714b6636552e429a691f`.
8. Evidencia durable `app/docs/evidence/c6-staff-lane-source-preflight-31649467657.json`.

No se modificó `/app/modules` ni UI de producto.

## Ejecución certificada

Run `31649467657` / job `94290390013` / artifact `9162011590` / digest `sha256:50b1b0be7d47594456e4b131099107ba7716906ca06655ce2ebf861d1979c9b1`.

Resultado:
- workflow `success`;
- `PASS_C6_STAFF_LANE_SOURCE_PREFLIGHT_RUN`;
- preflight `PASS_C6_STAFF_LANE_SOURCE_PREFLIGHT`;
- action explícita/fail-closed PASS;
- derivación por sufijo eliminada PASS;
- preflight-before-provider PASS;
- selector Staff dedicado PASS;
- no Shopper/HR/Firestore dependency PASS;
- Staff runtime sin text patching PASS;
- selectores canónicos producto/smoke PASS;
- repo limpio PASS.

Google Cloud Auth, instalación tooling protegido, selector privado y Hosting/runtime: **skipped**. Provider calls=0; Hosting=0; Auth/Firestore/HR/Rules/Storage/Make/Gemini/pagos=0; merge=false; producción=false.

## Progreso

`M1=35/35 | M2=20/20 | M3=15/15 | M4=5/5 | M5=8/8 | M6=5/5 | M7=0/5 | M8=0/3 | M9=0/3 | M10=0/1`

**Phase A=88% | restante=12% | delta certificado=+0%.** El carril C6 source-only quedó **100% ready**; el porcentaje oficial no sube hasta runtime real.

## No reabrir

Exact Write V2, private handoff, provider snapshot, D rebase, Auth340, SKIP13, MultiAuth, HR y M4 permanecen cerrados salvo drift reproducible.

## Siguiente frontera exacta

Nueva autorización explícita para un único `HOSTING_RUNTIME_ONCE` Staff sobre HEAD vivo. El preflight debe pasar primero; luego máximo un Hosting DEV y prueba canónica `Firebase Auth → claims → tenants/tya/users/{uid} → CX.session/RBAC → backend read → frontend`. PASS cierra M7 y continúa M8 → M9 → M10.

## Clasificación

- **Reusable CXOrbia:** action explícita, preflight fail-closed, selector/smoke Staff dedicados.
- **Exclusivo cliente:** futuro runtime TyA Staff en `cxorbia-backend-dev`.
- **Claude/prototipo:** cero frontend modificado.
- **Academia:** sin cambio de contenido hasta runtime PASS.
- **Sin impacto Claude:** workflow, QA tooling, request, evidencia y docs.
