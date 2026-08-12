# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-12 17:05 -06:00  
**Estado:** `PASS_C6_STAFF_LANE_SOURCE_PREFLIGHT__PHASE_A_88__C6_LANE_READY_100__NO_PROVIDER__NO_PRODUCTION`

## Estado vivo

- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Exact Write V2: PASS cerrado/no repetible.
- Producción: intacta.
- Phase A certificado: **88%**; restante **12%**.
- Readiness source-only del carril C6 Staff: **100% PASS**.

## Causa raíz sistémica corregida

Se eliminó del carril Staff la dependencia de `authorizationSource.endsWith(...)` y la action ahora es un campo explícito/fail-closed del request. Se eliminó la caída accidental a la rama genérica Shopper y se desacopló Staff de los dos parches textuales frágiles que mutaban selector/smoke en runtime.

Cambios source-only:
- `.github/workflows/cxorbia-c6-dev-root-entrypoint-hosting.yml`: action explícita, modo `SOURCE_PREFLIGHT_ONLY`, preflight antes del provider y ruta Hosting `HOSTING_RUNTIME_ONCE` fail-closed.
- `tools/qa/cxorbia-c6-existing-staff-admin-e2e-credential.mjs`: selector Staff dedicado; no Shopper, HR ni Firestore.
- `tools/qa/cxorbia-c6-existing-users-e2e-credentials.mjs`: ruta Staff explícita al selector dedicado.
- `tools/qa/tya-c6-staff-admin-human-auth-browser-smoke.mjs`: smoke Staff dedicado con `#loginForm/#lgUser/#lgPass/#lgSubmit`, reload y new-tab.
- `tools/qa/tya-c6-dev-root-runtime-wrapper.mjs`: Staff ya no transforma el smoke genérico mediante reemplazos de texto.
- `tools/qa/cxorbia-c6-staff-lane-source-preflight.mjs`: gate determinista source-only.

## Ejecución source-only 06

Request `c6-staff-lane-source-preflight-20260812-06`, target `d1951c7cee58070dd2b3714b6636552e429a691f`, commit `cb7156d5fb09d359e26a98d43c358b7b80c511c8`.

- run: `31649467657`;
- job: `94290390013`;
- artifact: `9162011590`;
- digest: `sha256:50b1b0be7d47594456e4b131099107ba7716906ca06655ce2ebf861d1979c9b1`;
- workflow conclusion: `success`;
- decision: `PASS_C6_STAFF_LANE_SOURCE_PREFLIGHT_RUN`;
- preflight: `PASS_C6_STAFF_LANE_SOURCE_PREFLIGHT`.

Checks PASS:
- action explícita/fail-closed;
- derivación por sufijo eliminada;
- preflight antes de provider;
- selector Staff dedicado;
- selector Staff sin dependencia Shopper/HR/Firestore;
- runtime Staff sin text patching;
- selectores canónicos del formulario presentes;
- repo limpio después del run.

Google Cloud Auth, tooling protegido, selector privado y Hosting/runtime quedaron **skipped** por diseño. Provider calls=0; Hosting=0; Auth/Firestore/HR/Rules/Storage/Make/Gemini/pagos=0; merge=false; producción=false.

Evidencia durable: `app/docs/evidence/c6-staff-lane-source-preflight-31649467657.json`.

## Progreso

`M1=35/35 | M2=20/20 | M3=15/15 | M4=5/5 | M5=8/8 | M6=5/5 | M7=0/5 | M8=0/3 | M9=0/3 | M10=0/1`

**Phase A=88% | restante=12% | delta certificado de esta ejecución=+0%.** El porcentaje oficial no sube porque todavía no se ejecutó runtime Staff; sin embargo, el carril source-only que estaba bloqueando las ejecuciones quedó certificado al **100%**.

## Siguiente bloque exacto

Nueva autorización explícita para un único `HOSTING_RUNTIME_ONCE` Staff sobre el HEAD vivo posterior a esta documentación. El request debe incluir `action: C6_LIVE_USER_ADMIN_FRONTEND_WIRING_RUNTIME_READONLY_PROOF`; el workflow ejecutará primero el preflight PASS y solo después podrá autenticar provider, seleccionar exclusivamente Staff, desplegar máximo un Hosting DEV y certificar `Firebase Auth → claims → tenants/tya/users/{uid} → CX.session/RBAC → backend read → frontend` con reload/new-tab.

Ante fallo después de la frontera provider: `STOP_RETRY`. Con PASS real: cerrar M7 y continuar inmediatamente M8 → M9 → M10.

## Clasificación

- **Reusable CXOrbia:** action explícita, preflight fail-closed, selector/smoke Staff dedicados.
- **Exclusivo cliente:** próxima prueba TyA Staff sobre `cxorbia-backend-dev`.
- **Claude/prototipo:** cero modificación frontend/producto.
- **Academia:** sin cambio de contenido hasta runtime PASS.
- **Sin impacto Claude:** workflow, QA tooling, requests, evidencia y docs.
