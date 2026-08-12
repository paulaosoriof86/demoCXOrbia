# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-12 17:05 -06:00  
**Estado:** `PASS_C6_STAFF_LANE_SOURCE_PREFLIGHT__PHASE_A_88__NO_FRONTEND_CHANGE`

## Estado vigente

C6 Staff Exact Write V2 permanece cerrado con PASS real en `cxorbia-backend-dev`. El wiring fuente `Firebase Auth → claims → tenants/tya/users/{uid} → CX.session/RBAC → backend read → frontend` sigue implementado.

El carril de ejecución Staff fue endurecido y quedó certificado source-only con `PASS_C6_STAFF_LANE_SOURCE_PREFLIGHT_RUN` en run `31649467657`.

## Qué se corrigió sin tocar frontend

- La action ya no se deduce de `authorizationSource.endsWith(...)`; ahora es un campo explícito/fail-closed del request.
- El workflow Staff no puede caer accidentalmente en la ruta genérica Shopper.
- Se creó selector Staff dedicado sin HR/Firestore/Shopper.
- Se creó smoke Staff dedicado para `#loginForm/#lgUser/#lgPass/#lgSubmit`.
- El runtime Staff dejó de mutar el smoke genérico mediante sustituciones textuales.
- El preflight de sintaxis/contratos/selectores corre antes de cualquier provider.

## Frontend / Claude

- **Cero archivo frontend modificado en este bloque.**
- No generar nueva candidata.
- No modificar `app/modules` por C6.
- Mantener el formulario único de `app/core/backend-browser-auth.js`.
- No reintroducir overlays legacy `#cxIntegratedAuthStep/#cxIntegratedAuthLogin` para Staff.
- No reabrir Login, Exact Write V2, D rebase, Auth340, SKIP13, MultiAuth, HR ni M4/static.
- PDF/XLSX/PPTX de `app/modules/cliente-extra.js` continúan como pendiente frontend heredado separado y no bloquean C6 Staff.

## Evidencia

Run `31649467657`, job `94290390013`, artifact `9162011590`, digest `sha256:50b1b0be7d47594456e4b131099107ba7716906ca06655ce2ebf861d1979c9b1`.

PASS comprobado:
- action explícita/fail-closed;
- derivación por sufijo eliminada;
- preflight antes de provider;
- selector Staff dedicado sin Shopper/HR/Firestore;
- runtime Staff sin text patching;
- formulario canónico presente en producto y smoke;
- repo limpio.

Google Cloud Auth, selector privado y Hosting/runtime fueron skipped por diseño. Provider=0; Hosting=0; writes=0; merge=false; producción=false.

## Progreso

`M1=35/35 | M2=20/20 | M3=15/15 | M4=5/5 | M5=8/8 | M6=5/5 | M7=0/5 | M8=0/3 | M9=0/3 | M10=0/1`

**Phase A=88% | restante=12% | delta certificado=+0%.** Readiness source-only del carril C6 Staff=**100%**.

## Siguiente acción exacta

Un único `HOSTING_RUNTIME_ONCE` Staff, bound al HEAD vivo, con action explícita `C6_LIVE_USER_ADMIN_FRONTEND_WIRING_RUNTIME_READONLY_PROOF`. El preflight PASS corre primero; después máximo un Hosting DEV y runtime canónico. Con PASS real cerrar M7 y continuar M8 → M9 → M10.

## Academia

Sin cambio de contenido todavía. Tras runtime PASS, actualizar manuales/cursos sobre formulario único, rutas por rol, permisos, errores de acceso y notificaciones. No documentar el overlay legado.
