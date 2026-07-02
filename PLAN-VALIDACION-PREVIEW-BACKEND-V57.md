# PLAN-VALIDACION-PREVIEW-BACKEND-V57.md

## Objetivo

Cerrar el gate visual y técnico del preview backend V57 antes de pedir la base buena completa TyA.

## Estado esperado

- `app/index.html` abre el prototipo normal sin backend global.
- `app/index-backend-dev.html` abre el preview backend DEV.
- El preview no usa prompt del navegador.
- Auth DEV se resuelve con helper local no versionado o variables locales.
- El badge muestra fuente real: `firestore`, `localStorage/demo` o `pending`.
- El tenant visible debe ser `tya`.

## Archivos relevantes

- `app/index-backend-dev.html`
- `app/core/backend-config.js`
- `app/core/backend-config-preview-dev.js`
- `app/core/backend-dev-auth.local.js` local, no versionado
- `app/core/backend-firebase.js`
- `app/core/backend-preview-status.js`
- `app/core/backend-bulletins.js`
- `firebase/auth-dev-tools/create-preview-auth-local.cjs`
- `firebase/client-write-tools/validate-preview-v57-static.mjs`

## Validación estática

Ejecutar localmente el validador estático de preview. Debe reportar `ok: true`.

Si advierte que falta `backend-dev-auth.local.js`, Auth seguirá pendiente hasta crear el helper local.

## Validación navegador

Abrir el preview backend autorizado y verificar badge:

- Fuente: `firestore` para gate aprobado.
- Auth: usuario DEV activo.
- Tenant: `tya`.
- Proyecto: TyA o proyecto Firestore real.
- Conteos: datos Firestore TyA, no demo genérico.

## Gate aprobado solo si

1. Auth OK.
2. Fuente Firestore.
3. Tenant `tya`.
4. No aparece `banca`.
5. No aparecen conteos demo.
6. Admin lee datos autorizados.
7. Shopper lee solo propios.
8. Tablón/novedades lee o queda preparado con Firestore sin romper módulos.

## Restricciones

- No deploy.
- No merge.
- No producción.
- No publicar reglas nuevas sin autorización expresa.
- No cargar datos reales hasta cerrar este gate.
