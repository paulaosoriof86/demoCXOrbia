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
- `CASOS-PRUEBA-FIRESTORE.md`: casos de prueba para validar permisos.

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
- `PLAN-VALIDACION-ADAPTER-DEV.md`: plan de validación del adapter solo en DEV/preview.

Impacto: no se modificó `/app/modules`; la app sigue usando mock/localStorage.

## 2026-06-27 — Dataset piloto T&A

- `IMPORTACION-TYA-PILOTO.md`: plan de importación piloto.
- `VALIDACION-TYA-PILOTO.md`: checklist de validación.
- `firebase/seed-tya-piloto.json`: dataset ficticio y anonimizado.
- `firebase/README.md`: restricciones del seed.
- `PLAN-EJECUCION-SEED-TYA.md`: plan para ejecutar el seed ficticio cuando corresponda, sin credenciales en repo.
- `DISENO-SCRIPT-SEED-TYA.md`: diseño del futuro script de carga con modo dry-run y validaciones previas.
- `AUTORIZACION-DRY-RUN-SEED.md`: frase exacta requerida para permitir dry-run.
- `RESULTADO-DRY-RUN-SEED-TYA.md`: validación documental del seed sin conectar Firebase ni escribir datos.

## 2026-06-27 — Gate para base buena T&A

- `MIGRACION-BASE-BUENA-TYA.md`: condiciones para pedir/cargar el export limpio de la plataforma anterior.

Estado: todavía no corresponde cargar base real.

## 2026-06-27 — Control PR #1

- `CHECKLIST-PR1-VALIDACION.md`: checklist para mantener PR #1 como draft.
- `ESTADO-GATES-PR1.md`: matriz centralizada de gates.
- Comentario agregado en PR #1.

Estado: no merge, no deploy, no datos reales.

## 2026-06-27 — Revisión divergencia con main

- `REVISION-DIVERGENCIA-PR1.md`: se documentó que PR #1 está detrás de `main` por 1 commit y que ese commit trae cambios amplios de prototipo frontend, core, estilos y módulos.
- `DICTAMEN-MAIN-BASE-PR1.md`: dictamen técnico; `main` parece nueva evolución del frontend, pero requiere confirmación visual/funcional antes de sincronizar PR #1.

Decisión: no sincronizar todavía. Primero confirmar si ese commit es la nueva base aprobada del prototipo y revisar `app/index.html` para conservar el punto único de conexión backend.

## 2026-06-27 — Guía de validación PR #1

- `GUIA-VALIDACION-PR1.md`: guía breve para revisar PR #1 antes de actualizarlo con `main`.

Objetivo: dejar claro qué revisar y qué punto backend debe conservarse antes de sincronizar.
