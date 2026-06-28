# CAMBIOS-BACKEND.md

Registro obligatorio de cambios de backend, infraestructura y migración.

## 2026-06-27 — Infraestructura Firebase DEV

- `.firebaserc`: alias DEV para `cxorbia-backend-dev`.
- `firebase.json`: Hosting DEV con `public: app`, rewrite SPA y headers UTF-8.
- `firestore.indexes.json`: índices iniciales vacíos.
- `storage.rules`: Storage cerrado mientras esté pendiente Blaze.

Estado: sin deploy de Hosting, sin producción y sin datos reales.

## 2026-06-27 — Reglas Firestore

- `firestore.rules`: reglas multi-tenant por `tenantId`, `projectId` y rol.
- `MATRIZ-ROLES-FIRESTORE.md`: matriz de permisos y claims esperados.
- `CASOS-PRUEBA-FIRESTORE.md`: casos de prueba para validar permisos.
- `VALIDACION-ESTATICA-REGLAS-ADAPTER.md`: revisión estática entre reglas, seed y adapter.

Cambios:

- Lectura controlada para shoppers sobre visitas disponibles del proyecto asignado.
- Matriz de roles actualizada para reflejar visitas disponibles.
- Casos de prueba actualizados para shopper con proyecto, shopper sin proyecto y visitas disponibles.

Pendiente inicial: validar reglas en DEV antes de publicar o activar adapter.

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
- `MAPEO-CXDATA-FIRESTORE.md`: mapeo de interfaz `CX.data` hacia colecciones Firestore.
- `RIESGOS-ASINCRONIA-CXDATA.md`: riesgos por carga asincrónica al usar Firestore.

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
- `PLAN-SINCRONIZACION-MAIN-PR1.md`: plan para sincronizar con `main` sin ejecutar sync automático.
- `CHECKLIST-POST-SYNC-PR1.md`: checklist posterior a una futura sincronización.

Estado: no merge, no deploy de Hosting, no datos reales.

## 2026-06-27 — Revisión divergencia con main

- `REVISION-DIVERGENCIA-PR1.md`: se documentó que PR #1 está detrás de `main` por 1 commit y que ese commit trae cambios amplios de prototipo frontend, core, estilos y módulos.
- `DICTAMEN-MAIN-BASE-PR1.md`: dictamen técnico; `main` parece nueva evolución del frontend, pero requiere confirmación visual/funcional antes de sincronizar PR #1.

Decisión: no sincronizar todavía. Primero confirmar si ese commit es la nueva base aprobada del prototipo y revisar `app/index.html` para conservar el punto único de conexión backend.

## 2026-06-27 — Guía de validación PR #1

- `GUIA-VALIDACION-PR1.md`: guía breve para revisar PR #1 antes de actualizarlo con `main`.

Objetivo: dejar claro qué revisar y qué punto backend debe conservarse antes de sincronizar.

## 2026-06-28 — Publicación reglas Firestore DEV

- `RESULTADO-PUBLICACION-REGLAS-DEV.md`: resultado del deploy exclusivo de reglas Firestore a Firebase DEV.
- `PENDIENTES-PROTOTIPO.md`: actualizado con gate completado, advertencia no bloqueante y archivos locales no versionados generados por emulador/validación.
- `RESUMEN-PARA-CLAUDE.md`: actualizado con sección de publicación de reglas DEV.
- `RESUMEN-PARA-CLAUDE-ADDENDUM-20260628-REGLAS-DEV-PUBLICADAS.md`: addendum específico para Claude.
- `ESTADO-GATES-PR1.md`: actualizado para marcar Firestore rules como publicadas en DEV.

Cambio real ejecutado fuera del repo:

```text
firebase.cmd deploy --only firestore:rules --project cxorbia-backend-dev
```

Resultado:

```text
cloud.firestore: rules file firestore.rules compiled successfully
firestore: released rules firestore.rules to cloud.firestore
Deploy complete!
```

Impacto:

- Reglas Firestore publicadas únicamente en Firebase DEV `cxorbia-backend-dev`.
- No se publicó Hosting.
- No se creó ningún usuario.
- No se asignaron claims.
- No se cargó seed.
- No se activó adapter.
- No se tocaron datos reales.
- No se tocó producción.
- No se modificó `/app/modules`.

Pendiente/riesgo:

- Firebase reportó advertencia no bloqueante: `[W] 51:14 - Unused function: canAccessProject.`
- PowerShell reportó archivos locales no versionados: `firebase/emulator-rules/node_modules/` y `firebase/emulator-rules/package-lock.json`; no deben commitearse.
- Siguiente gate posible: usuarios DEV ficticios y claims, solo con autorización separada.

## 2026-06-28 — Preparación usuarios DEV ficticios y claims

Autorización recibida:

```text
Autorizo crear usuarios DEV ficticios y asignar claims en Firebase DEV, sin usuarios reales, sin datos reales, sin activar adapter y sin tocar producción.
```

Archivos creados/preparados:

- `.gitignore`: exclusión de dependencias locales, salidas DEV y artefactos de emulador.
- `firebase/auth-dev-tools/package.json`: dependencia local de Firebase Admin SDK.
- `firebase/auth-dev-tools/create-dev-users-and-claims.cjs`: script local para crear/actualizar usuarios DEV ficticios y asignar custom claims.
- `PLAN-EJECUCION-USUARIOS-CLAIMS-DEV.md`: plan operativo del gate autorizado.
- `PLANTILLA-RESULTADO-USUARIOS-CLAIMS-DEV.md`: plantilla para registrar resultado después de ejecutar PowerShell.

Estado:

- Script preparado.
- Ejecución real pendiente de PowerShell local porque requiere credencial administrativa local segura.
- No se crearon usuarios todavía desde GitHub.
- No se asignaron claims todavía desde GitHub.
- No se cargó seed.
- No se activó adapter.
- No se tocó producción.
- No se modificó `/app/modules`.

Usuarios DEV definidos:

- `super.dev@cxorbia-dev.example.com`
- `admin.tya.dev@cxorbia-dev.example.com`
- `ops.tya.dev@cxorbia-dev.example.com`
- `shopper.eval01.dev@cxorbia-dev.example.com`
- `cliente.tya.dev@cxorbia-dev.example.com`
- `externo.otro.dev@cxorbia-dev.example.com`

Pendiente/riesgo:

- La ejecución requiere Application Default Credentials o `GOOGLE_APPLICATION_CREDENTIALS` disponible localmente.
- El reporte local generado contendrá password DEV temporal y no debe subirse a GitHub.