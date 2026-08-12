# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-12 17:29 -06:00  
**Estado:** `C6_RUNTIME_08_STOP_RETRY_POINTER_INTERCEPT__SOURCE_REPAIR_APPLIED__PHASE_A_88__NO_FRONTEND_CHANGE`

## Estado vigente

C6 Staff Exact Write V2 permanece cerrado con PASS real en `cxorbia-backend-dev`. El wiring fuente `Firebase Auth → claims → tenants/tya/users/{uid} → CX.session/RBAC → backend read → frontend` sigue implementado.

El runtime Staff 08 avanzó más que los intentos anteriores: preflight v2 PASS, Google Cloud DEV PASS, selector Staff dedicado PASS, source parity PASS, Hosting DEV deploy PASS y remote parity PASS. El fallo ocurrió únicamente en la interacción del smoke antes de enviar credenciales.

## Runtime 08

Run `31650715194`, job `94294235029`, artifact `9162485896`, digest `sha256:e30accedd8e8c571066319572267e84856752577b7cd4cd63e0cd1f3c7d20194`.

PASS:
- action/mode exactos;
- `PASS_C6_STAFF_LANE_SOURCE_PREFLIGHT` v2;
- `bash -n` del shell Hosting exacto;
- Google Cloud DEV auth;
- selector Staff dedicado (`coordinador`);
- Shopper/Cliente selection=false;
- source parity;
- Hosting DEV deploy completo 1/1;
- remote parity exact=true.

FAIL de QA:
- `#lgSubmit` visible/enabled;
- el pill diagnóstico `#cxBackendPreviewStatus` se superpuso al botón e interceptó pointer events;
- las credenciales no llegaron a enviarse;
- no hay fallo nuevo demostrado de Auth/claims/membership/Firestore/HR.

Clasificación: `QA_POINTER_INTERCEPTION_BY_BACKEND_PREVIEW_STATUS_OVERLAY`.

## Reparación sin tocar frontend

- `tools/qa/tya-c6-staff-admin-human-auth-browser-smoke.mjs` commit `ccf759c2a82a5baf82397cef02c3ca7851e13ce8`: submit canónico mediante Enter desde `#lgPass`, preservando `#loginForm/#lgUser/#lgPass/#lgSubmit` y el mismo evento `submit` del producto.
- `tools/qa/cxorbia-c6-staff-lane-source-preflight.mjs` commit `7cab212e5583ed7e2b4dc8b132b0d2b5bf953c19`: preflight v3 exige keyboard-submit y bloquea reintroducción del pointer click sobre `#lgSubmit`.
- No se modificó `app/core/backend-preview-status.js` para acomodar QA.
- No se disparó segundo runtime después del STOP_RETRY.

## Frontend / Claude

- **Cero archivo frontend/producto modificado por esta reparación.**
- No generar nueva candidata.
- No modificar `app/modules` por C6.
- Mantener el formulario único de `app/core/backend-browser-auth.js`: `#loginForm/#lgUser/#lgPass/#lgSubmit`.
- Mantener el pill Preview DEV; la adaptación corresponde al QA, no al producto.
- No reintroducir overlays legacy para Staff.
- No reabrir Login, Exact Write V2, D rebase, Auth340, SKIP13, MultiAuth, HR ni M4/static.
- PDF/XLSX/PPTX de `app/modules/cliente-extra.js` siguen como pendiente frontend heredado separado y no bloquean C6 Staff.

## Seguridad

Runtime 08: Hosting `1/1` físicamente consumido y deploy PASS; nuevos Auth/Firestore/HR/Rules/Storage/Make/Gemini/pagos writes=0; segundo Exact Write=0; segundo intento=0; merge=false; producción=false; secretos/tokens expuestos=false.

## Progreso

`M1=35/35 | M2=20/20 | M3=15/15 | M4=5/5 | M5=8/8 | M6=5/5 | M7=0/5 | M8=0/3 | M9=0/3 | M10=0/1`

**Phase A=88% | restante=12% | delta certificado runtime 08=+0%.**

## Siguiente acción exacta

No rerunear `31650715194`. Por STOP_RETRY se requiere un nuevo `HOSTING_RUNTIME_ONCE` Staff bound al HEAD vivo reparado. El preflight v3 debe validar shell + submit canónico antes de provider; con PASS, máximo un Hosting DEV y runtime. Con PASS real cerrar M7 y continuar M8 → M9 → M10.

## Academia

Sin cambio de contenido todavía. Tras runtime PASS, actualizar manuales/cursos sobre formulario único, rutas por rol, permisos, errores de acceso y notificaciones. No documentar overlays legacy.
