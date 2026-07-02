# APLICACION-V66-METODOLOGIA-AGIL

Fecha: 2026-07-02

## Decision
Aplicar V66 como prototipo mas reciente, completo, mediante overlay controlado.

## Protecciones
- No extraccion destructiva sobre el repo.
- No borrar backend ni archivos ausentes del ZIP.
- No tocar `app/index-backend-dev.html`.
- No tocar `app/core/backend-*.js`.
- No tocar `firestore.rules`, `firebase.json`, `.firebaserc`.
- No deploy, no Hosting, no produccion.

## Regla comercial / multi-tenant
El prototipo no queda amarrado a TyA. TyA/Cinepolis se mantiene como tenant/proyecto DEV para ajustar backend y validar reglas. Las mejoras utiles se mantienen generalizables para comercializacion SaaS.

## Validaciones
- UTF-8 estricto sin BOM.
- Sin mojibake.
- `node --check` en JS.
- index con `<meta charset="UTF-8">`.
- Backend protegido intacto.

## Resultado esperado
Continuar backend desde V66 como version visual vigente, documentando cualquier pendiente para Claude y cualquier necesidad de backend para ChatGPT/Firebase.
