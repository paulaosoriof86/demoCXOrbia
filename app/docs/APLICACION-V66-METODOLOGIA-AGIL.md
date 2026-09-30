# APLICACIÓN V66 — METODOLOGÍA ÁGIL

Fecha: 2026-07-02

## Decisión

V66 se aplicó como prototipo visual más reciente y completo mediante overlay controlado.

## Protecciones respetadas

- No extracción destructiva sobre el repo.
- No borrar backend ni archivos ausentes del ZIP.
- No tocar `app/index-backend-dev.html`.
- No tocar `app/core/backend-*.js`.
- No tocar `firestore.rules`, `firebase.json`, `.firebaserc`.
- No deploy, no Hosting, no producción.

## Regla comercial / multi-tenant

El prototipo no queda amarrado a TyA. TyA/Cinépolis se mantiene como tenant/proyecto DEV para ajustar backend y validar reglas reales. Las mejoras útiles se mantienen generalizables para comercialización SaaS multi-tenant, multi-proyecto, multi-país, multi-periodo, por rol, plan, permisos y feature flags.

## Validaciones

- UTF-8 sin BOM.
- Sin mojibake.
- `node --check` en JS.
- `app/index.html` con `<meta charset="UTF-8">`.
- Backend protegido intacto.

## Observación posterior a validación visual

La auditoría visual de Paula detectó que V66 abre y muestra amplitud funcional, pero aún conserva flujos demo, botones no funcionales, módulos superficiales, falta de sincronías y datos hardcodeados. Estos puntos quedan documentados en `AUDITORIA-VISUAL-PAULA-V66-20260702.md` y en el paquete para Claude.

## Resultado esperado

Continuar backend desde V66 como versión visual vigente, documentando cualquier pendiente para Claude y cualquier necesidad de backend para ChatGPT/Firebase.