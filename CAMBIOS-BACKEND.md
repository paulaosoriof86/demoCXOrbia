# CAMBIOS-BACKEND.md

Registro obligatorio de cambios de backend, infraestructura y migración.

## 2026-06-27 — Infraestructura Firebase DEV

- `.firebaserc`: alias DEV para `cxorbia-backend-dev`.
- `firebase.json`: Hosting DEV con `public: app`, rewrite SPA y headers UTF-8.
- `firestore.indexes.json`: índices iniciales vacíos.
- `storage.rules`: Storage cerrado mientras esté pendiente Blaze.

Estado: sin deploy, sin producción y sin datos reales.

## 2026-06-27 — Reglas Firestore

- `firestore.rules`: reglas multi-tenant por `tenantId`, `projectId` y rol.
- `MATRIZ-ROLES-FIRESTORE.md`: matriz de permisos y claims esperados.

Pendiente: validar reglas en DEV antes de publicar o activar adapter.

## 2026-06-27 — Plan Auth DEV T&A

- `AUTH-DEV-TYA.md`: plan de usuarios DEV, roles y claims.

Pendiente: crear usuarios DEV solo con autorización expresa.

## 2026-06-27 — Producto CXOrbia vs tenant T&A

- `ARQUITECTURA-TENANTS-TYA.md`: CXOrbia sigue como producto comercializable; T&A será tenant `tya`.
- `RESUMEN-PARA-CLAUDE.md`: resumen de continuidad.
- `PENDIENTES-PROTOTIPO.md`: pendientes vivos.

## 2026-06-27 — Adapter Firestore desactivado

- `app/core/backend-config.js`: configuración Firebase DEV con `CX.BACKEND.enabled = false`.
- `app/core/backend-firebase.js`: scaffold de adapter Firestore.
- `app/index.html`: único punto de conexión para cargar backend config y adapter.

Impacto: no se modificó `/app/modules`; la app sigue usando mock/localStorage.

## 2026-06-27 — Dataset piloto T&A

- `IMPORTACION-TYA-PILOTO.md`: plan de importación piloto.
- `VALIDACION-TYA-PILOTO.md`: checklist de validación.
- `firebase/seed-tya-piloto.json`: dataset ficticio y anonimizado.
- `firebase/README.md`: restricciones del seed.

## 2026-06-27 — Gate para base buena T&A

- `MIGRACION-BASE-BUENA-TYA.md`: condiciones para pedir/cargar el export limpio de la plataforma anterior.

Estado: todavía no corresponde cargar base real.

## 2026-06-27 — Control PR #1

- `CHECKLIST-PR1-VALIDACION.md`: checklist para mantener PR #1 como draft.
- Comentario agregado en PR #1.

Estado: no merge, no deploy, no datos reales.

## 2026-06-27 — Revisión divergencia con main

- `REVISION-DIVERGENCIA-PR1.md`: se documentó que PR #1 está detrás de `main` por 1 commit y que ese commit trae cambios amplios de prototipo frontend, core, estilos y módulos.

Decisión: no sincronizar todavía. Primero confirmar si ese commit es la nueva base aprobada del prototipo y revisar `app/index.html` para conservar el punto único de conexión backend.
