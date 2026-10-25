# RESUMEN PARA CLAUDE — Addendum C6 Login humano e identidad Shopper

**Fecha:** 2026-08-05  
**Clasificación:** Claude/prototipo · Sin delta frontend solicitado

## Hallazgo humano

El login V7.2 mostraba un formulario visible (`#loginForm`, `#lgUser`, `#lgPass`) cuyo submit no autenticaba. Al seleccionar rol, el bridge agregaba otro formulario `#cxIntegratedAuthStep`.

## Cambio backend autorizado

`app/core/backend-browser-auth.js` quedó como único bridge visible:

- usa los campos ya existentes;
- no crea un segundo formulario;
- elimina overlays legados;
- valida rol seleccionado contra claims reales;
- conserva namespaces `staff` y `shopper`.

## Para Claude

- no agregar otro formulario de credenciales;
- no ocultar ni duplicar `#loginForm`;
- no modificar módulos, estilos o copy por este bloque;
- no hardcodear Paula ni shoppers por nombre;
- no comunicar `nombre.apellido / Nombre123*` como regla universal;
- no crear rutas paralelas de Login.

## Auditoría de población

- 340 perfiles Shopper;
- 109 registros de credencial;
- 88 usuarios Auth/claims/proyecto válidos;
- 85 sign-ins compatibles;
- 79 logins con patrón `nombre.apellido`;
- 81 contraseñas con patrón `Nombre123*`;
- 21 identidades Auth faltantes;
- 252 perfiles sin mapeo de credencial;
- 0 memberships Shopper en `tenants/tya/users`.

Paula aparece en dos candidatas, Staff y Shopper. No debe resolverse desde frontend ni mediante hardcode.

## Estado

Source/static PASS. Cero deploy. El siguiente trabajo pertenece a contrato y reparación backend de identidades, no a Claude ni al prototipo visual.
