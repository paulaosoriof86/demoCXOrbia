# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-12 13:42 -06:00  
**Estado:** `C6_LIVE_USER_ADMIN_FRONTEND_WIRING_SOURCE_IMPLEMENTED__RUNTIME_PROOF_PENDING__PHASE_A_88`

## Estado vigente

C6 Staff Exact Write V2 permanece cerrado con PASS real en `cxorbia-backend-dev`: Auth writes=14, Firestore writes=16, deletes=0 y canonical readback A/B/C/D/R4=PASS.

El siguiente hueco real ya fue localizado y corregido a nivel source: el runtime autenticaba por Firebase + claims y entraba al backend sin reconciliar el documento canónico `tenants/tya/users/{uid}` creado por el Exact Write.

Se agregó `app/adapters/tya-c6-live-user-admin-membership-wiring-v1.js` y se carga únicamente en `app/index-backend-dev.html`, después de `backend-browser-auth.js` y antes de `backend-firebase.js`.

Para Staff, el adapter exige antes del consumo backend: membership activa, tenant/namespace/rol exactos, `TYA_COMPLETE`, projectIds exactos, claimsDigest exacto y providerUidFingerprint exacto. Es fail-closed y no expone visibleLogin, UID ni secretos.

**Phase A certificado: 88% | restante: 12%.** No se suma porcentaje hasta el readback runtime real del mismo build.

## Frontend / Claude

- No generar nueva candidata.
- No reabrir Login, Exact Write V2, D rebase, Auth340, SKIP13, MultiAuth, HR ni M4/static.
- No se modificó ningún archivo de `app/modules` en este wiring.
- Un gate heredado detectó en `app/modules/cliente-extra.js` ausencia de flujos PDF/XLSX/PPTX. Es pendiente frontend localizado y separado del C6 wiring; no bloquear ni reinterpretar la membresía por ese hallazgo.
- Si el runtime DEV del wiring produce una diferencia visible reproducible, documentarla y corregirla por archivo/módulo; no rediseñar.

## Siguiente acción exacta

`C6_LIVE_USER_ADMIN_FRONTEND_WIRING_RUNTIME_READONLY_PROOF → M7 → M8 → M9 → M10`.

El runtime proof necesita ejecutar el build con el nuevo source en Hosting DEV. No existe autorización nueva de deploy dentro de este bloque source-only.

## Academia

Sin cambio de contenido aún. Cuando el runtime certifique administración/roles reales, revisar manuales, cursos, rutas por rol, permisos, errores frecuentes y notificaciones relacionadas con acceso y administración.