# CAMBIOS-BACKEND.md

Registro obligatorio de cambios de backend, infraestructura y migración.

## 2026-06-27 — Infraestructura Firebase DEV

Archivos creados:

- `.firebaserc`: alias `default` y `dev` apuntando a `cxorbia-backend-dev`; target Hosting DEV `cxorbia-dev`.
- `firebase.json`: Hosting con `public: app`, rewrite a `/index.html`, headers UTF-8 y referencias a reglas Firestore/Storage.
- `firestore.indexes.json`: archivo inicial vacío de índices.
- `storage.rules`: Storage cerrado por completo mientras esté pendiente Blaze.

Estado:

- Producción `tya-plataforma.web.app` no fue tocada.
- No hubo deploy.
- No se cargaron datos reales.

## 2026-06-27 — Reglas Firestore

Archivos creados/modificados:

- `firestore.rules`
- `MATRIZ-ROLES-FIRESTORE.md`

Cambios:

- Se reforzó el modelo multi-tenant por `tenantId`, `projectId` y rol.
- Se mantuvo deny-by-default.
- Se separaron permisos para `super`, `admin`, `ops`, `shopper` y `cliente/client`.
- Se limitó al cliente para que no lea finanzas, lotes, liquidaciones ni postulaciones internas.
- Se limitó al shopper para que lea/actualice solo recursos propios o asignados.
- Finanzas quedó reservado para `admin/super`.
- Se agregó matriz documental de roles y claims esperados.

Pendiente:

- Validar reglas en DEV antes de publicarlas.
- Crear usuarios DEV con claims coherentes.
- Probar escenarios por rol antes de activar el adapter.

## 2026-06-27 — Producto CXOrbia vs tenant T&A

Archivos creados/modificados:

- `ARQUITECTURA-TENANTS-TYA.md`
- `RESUMEN-PARA-CLAUDE.md`
- `PENDIENTES-PROTOTIPO.md`

Cambios:

- Se documentó que `demoCXOrbia` es el prototipo/base comercializable de CXOrbia.
- T&A Consultores será el primer cliente/tenant real bajo `tenantId: tya`.
- T&A no debe hardcodearse en módulos ni core UI.
- Las campañas/clientes finales de T&A deben vivir como proyectos bajo el tenant.

## 2026-06-27 — Adapter Firestore desactivado

Archivos creados/modificados:

- `app/core/backend-config.js`
- `app/core/backend-firebase.js`
- `app/index.html`

Cambios:

- Se agregó configuración Firebase DEV con `CX.BACKEND.enabled = false`.
- Se creó `CX.backend` como scaffold de adapter Firestore.
- Se preparó lectura de `/tenants/{tenantId}` y subcolecciones por proyecto.
- Se preparó aplicación de datos a `CX.data` manteniendo la interfaz estable.
- Se agregó un único punto de conexión en `app/index.html` para cargar los dos archivos nuevos.

Impacto:

- No se modificó `/app/modules`.
- Con `enabled:false`, la app sigue usando mock/localStorage.

## 2026-06-27 — Dataset piloto T&A

Archivos creados:

- `IMPORTACION-TYA-PILOTO.md`
- `VALIDACION-TYA-PILOTO.md`
- `firebase/seed-tya-piloto.json`
- `firebase/README.md`

Cambios:

- Se agregó plan de importación piloto.
- Se agregó dataset ficticio y anonimizado para tenant `tya` y proyecto `tya-piloto`.
- Se agregó checklist de validación manual antes de cargar datos o activar adapter.

Restricciones:

- No usar como producción.
- No cargar datos reales todavía.
- No usar base anterior como backend vivo.
- No activar Storage hasta definir Blaze y reglas privadas.
