# Predeploy gate fail fix - backend config API key

Fecha: 2026-07-07

## Bloque completado

Se reviso el artifact del primer `CXOrbia RC Phase A Predeploy Gate`.

## Resultado inicial

El predeploy gate fallo con:

- `sensitive_or_secret_pattern_found`
- archivo: `app/core/backend-config.js`
- patron: `google_api_key_literal`

El gate tambien reporto warning esperado sobre reglas Firestore/Storage presentes en `firebase.json`, pero ese warning no fue la causa del fallo.

## Causa raiz

`app/core/backend-config.js` tenia una Firebase Web API key literal dentro del repo.

Aunque una Web API key de Firebase no siempre funciona como secreto clasico, para esta fase se mantiene la politica segura: no dejar claves reales ni credenciales reales en el repositorio mientras el backend real esta desactivado.

## Correccion aplicada

Archivo modificado:

- `app/core/backend-config.js`

Cambios:

- `apiKey` paso a `null`.
- `messagingSenderId`, `appId` y `measurementId` pasaron a `null`.
- Se agrego `configSource: 'repo-placeholder'`.
- Se documento en comentario que no se deben guardar API keys, secretos ni credenciales reales en repo.
- `enabled` se mantiene en `false`.

## Impacto operativo

No debe afectar la app actual porque el backend real sigue desactivado.

Si mas adelante se activa Firebase real, la configuracion debera inyectarse por mecanismo seguro y por gate separado, no por hardcode en repo.

## Impacto Claude

Este hallazgo no requiere paquete Claude ahora.

Es un ajuste backend/release de seguridad, no un pendiente UX.

## Estado seguro

Sin deploy, sin produccion real, sin merge final, sin proveedores reales, sin imports y sin datos sensibles.
