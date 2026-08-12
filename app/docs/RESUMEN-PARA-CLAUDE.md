# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-12 17:17 -06:00  
**Estado:** `C6_RUNTIME_07_STOP_RETRY_PRE_HOSTING__SOURCE_REPAIR_APPLIED__PHASE_A_88__NO_FRONTEND_CHANGE`

## Estado vigente

C6 Staff Exact Write V2 permanece cerrado con PASS real en `cxorbia-backend-dev`. El wiring fuente `Firebase Auth → claims → tenants/tya/users/{uid} → CX.session/RBAC → backend read → frontend` sigue implementado.

El runtime Staff 07 no demostró una regresión de producto: pasó preflight, autenticación Google Cloud DEV y selector Staff dedicado; se detuvo por sintaxis shell del workflow antes de Hosting y antes de runtime.

## Runtime 07

Run `31649967019`, job `94291913408`, artifact `9162195599`, digest `sha256:91af7648302218477177f7e2785b4b32bea517e2cdebe0b41cc60d082136891e`.

PASS:
- action/mode exactos;
- `PASS_C6_STAFF_LANE_SOURCE_PREFLIGHT`;
- Google Cloud DEV auth;
- selector Staff dedicado, role `coordinador`;
- Shopper/Cliente selection=false;
- Auth/password writes=0.

FAIL técnico pre-Hosting:
- bash: `here-document ... wanted NODE`;
- bash: `syntax error: unexpected end of file`;
- artifact: `FAIL_C6_DEV_ROOT_ENTRYPOINT_HOSTING_AND_RUNTIME`;
- deploy attempted=false; Hosting=0; runtime=null.

Clasificación: `PREFLIGHT_SHELL_SYNTAX_COVERAGE_GAP__NESTED_HEREDOC_INDENTATION`.

## Reparación sin tocar frontend

- Workflow commit `66cffe4a0f236097264d2e0b2f361115464c8e34`: heredocs anidados del paso Hosting eliminados; asserts reemplazados por `node -e`.
- Preflight commit `b024fd97cd7360a90a32041eb57bd0b003a029a2`: ahora extrae el script shell exacto del paso Hosting, exige `bash -n` PASS y bloquea heredoc anidado antes de provider.
- No se disparó otro runtime después de la reparación.

## Frontend / Claude

- **Cero archivo frontend modificado en este bloque.**
- No generar nueva candidata.
- No modificar `app/modules` por C6.
- Mantener el formulario único de `app/core/backend-browser-auth.js`: `#loginForm/#lgUser/#lgPass/#lgSubmit`.
- No reintroducir overlays legacy para Staff.
- No reabrir Login, Exact Write V2, D rebase, Auth340, SKIP13, MultiAuth, HR ni M4/static.
- PDF/XLSX/PPTX de `app/modules/cliente-extra.js` siguen como pendiente frontend heredado separado y no bloquean C6 Staff.

## Seguridad

Runtime 07: Hosting `0/1` físicamente consumido; nuevos Auth/Firestore/HR/Rules/Storage/Make/Gemini/pagos writes=0; segundo Exact Write=0; segundo intento=0; merge=false; producción=false; secretos/tokens expuestos=false.

## Progreso

`M1=35/35 | M2=20/20 | M3=15/15 | M4=5/5 | M5=8/8 | M6=5/5 | M7=0/5 | M8=0/3 | M9=0/3 | M10=0/1`

**Phase A=88% | restante=12% | delta certificado runtime 07=+0%.**

## Siguiente acción exacta

No rerunear `31649967019`. Por STOP_RETRY se requiere un nuevo `HOSTING_RUNTIME_ONCE` Staff bound al HEAD vivo reparado. El preflight actualizado debe validar `bash -n` antes de provider; con PASS, máximo un Hosting DEV y runtime canónico. Con PASS real cerrar M7 y continuar M8 → M9 → M10.

## Academia

Sin cambio de contenido todavía. Tras runtime PASS, actualizar manuales/cursos sobre formulario único, rutas por rol, permisos, errores de acceso y notificaciones. No documentar overlays legacy.
