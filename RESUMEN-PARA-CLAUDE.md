# RESUMEN-PARA-CLAUDE.md

## Sesión 2026-06-27 — Backend DEV y Hosting DEV

### 1. Qué se conectó al backend y funciona

Aún no se activó lógica real contra Firestore. Esta sesión preparó infraestructura Firebase DEV en rama aislada y dejó un scaffold de adapter desactivado:

- Repo usado como prototipo modular aprobado: `paulaosoriof86/demoCXOrbia`.
- Rama creada: `feat/firebase-backend-dev-config-20260627`.
- Firebase DEV nuevo: `cxorbia-backend-dev`.
- Firestore: creado en Firebase Console.
- Auth Email/Password: activado en Firebase Console.
- Storage: pendiente porque requiere Blaze.
- Hosting producción actual: `https://tya-plataforma.web.app/` se mantiene y NO se tocó.
- Deploy: NO autorizado y NO ejecutado en esta sesión inicial.

Archivos agregados principales:

- `.firebaserc`
- `firebase.json`
- `firestore.rules`
- `firestore.indexes.json`
- `storage.rules`
- `app/core/backend-config.js`
- `app/core/backend-firebase.js`
- `firebase/seed-tya-piloto.json`
- documentación de arquitectura, roles, Auth DEV, claims, seed, adapter, gates, migración, dictamen de main, dry-run documental, validación estática, plan de sync, mapeo `CX.data`, finanzas DEV y validación de reglas.

Archivo modificado:

- `app/index.html` solo para cargar `core/backend-config.js` y `core/backend-firebase.js` como punto único de conexión.

### 1.1. Decisión clave de producto vs cliente

Paula aclaró que `demoCXOrbia` es el repo del prototipo y seguirá evolucionando como plataforma comercializable. T&A Consultores será el primer cliente/tenant real que se migra a esa plataforma.

Implicación técnica:

- CXOrbia debe permanecer genérico, multi-tenant y comercializable.
- T&A no debe hardcodearse en módulos ni core de UI.
- T&A debe entrar como `tenantId: tya` y sus campañas/clientes finales como `projectId` dentro del tenant.
- La migración de T&A debe cargar datos reales limpios a Firestore, no conectar la base vieja como backend vivo.
- Producción actual de T&A sigue siendo `https://tya-plataforma.web.app/` y no se despliega sin autorización.

### 1.2. Estado del adapter Firestore

Se creó un scaffold seguro:

- `CX.BACKEND.enabled` está en `false`.
- `CX.backend` existe, pero no inicializa Firebase si no está habilitado.
- Con `enabled:false`, la plataforma sigue funcionando con mock/localStorage.
- Cuando se active, el adapter espera SDK Firebase compat cargado, lee `/tenants/{tenantId}`, subcolecciones de proyectos y aplica datos a `CX.data`.
- También envuelve métodos como `addProject`, `setVisitState`, `assignVisit`, `payVisits`, `addShopper` y `updateShopper` para persistir cambios.

Documentación nueva relacionada:

- `PLAN-VALIDACION-ADAPTER-DEV.md`
- `VALIDACION-ESTATICA-REGLAS-ADAPTER.md`
- `MAPEO-CXDATA-FIRESTORE.md`
- `RIESGOS-ASINCRONIA-CXDATA.md`

Notas relevantes:

- `CX.data` actual expone `projects`, `shoppers`, `_visitas`, `_posts`, `currentProjectId` y métodos como `visitas()`, `posts()`, `setVisitState()`, `assignVisit()`, `payVisits()`, `kpis()` y `phaseFlow()`.
- El adapter inicial solo lee `projects`, `shoppers`, `visits` y `postulations`.
- Finanzas generadas desde `CX.finStore` aún no quedan persistidas por el adapter.
- Si aparece problema de asincronía en módulos, debe documentarse y no parchar `/app/modules` dentro del PR backend.

### 1.3. Finanzas DEV

Se agregó documentación para una fase posterior:

- `MAPEO-FINSTORE-FIRESTORE.md`
- `PLAN-PERSISTENCIA-FINANCIERA-DEV.md`
- `CAMBIOS-BACKEND-20260627-FINANZAS.md`

Estado:

- No se creó adapter financiero.
- No se modificó UI.
- No se tocó `/app/modules`.
- No se escribió Firestore.
- La persistencia financiera queda pendiente hasta validar reglas, seed, adapter base y comportamiento de `CX.finStore`.

### 1.4. Auth DEV y claims

Se agregó documentación para la fase Auth/claims:

- `AUTH-DEV-TYA.md`
- `PLAN-AUTH-CLAIMS-DEV.md`
- `CHECKLIST-AUTH-DEV-SIN-USUARIOS.md`
- `CAMBIOS-BACKEND-20260627-AUTH.md`

Estado:

- No se crearon usuarios.
- No se asignaron claims.
- No se usaron credenciales.
- No se modificó UI.
- No se activó backend.
- Los claims esperados siguen siendo `role`, `tenantId`, `projectIds` y `shopperId` para rol shopper.

### 1.5. Validación de reglas DEV

Se agregó documentación para la validación real futura:

- `PLAN-VALIDACION-REGLAS-DEV.md`
- `PLANTILLA-RESULTADO-VALIDACION-REGLAS-DEV.md`
- `CAMBIOS-BACKEND-20260627-REGLAS-DEV.md`

Estado inicial:

- No se publicaron reglas.
- No se ejecutó validación real.
- No se crearon usuarios.
- No se asignaron claims.
- No se cargó seed.
- No se activó adapter.

### 1.6. Dataset piloto T&A

Se agregó un dataset ficticio para validar la estructura antes de cargar datos reales:

- `IMPORTACION-TYA-PILOTO.md`
- `VALIDACION-TYA-PILOTO.md`
- `firebase/seed-tya-piloto.json`
- `firebase/README.md`
- `PLAN-EJECUCION-SEED-TYA.md`
- `DISENO-SCRIPT-SEED-TYA.md`
- `AUTORIZACION-DRY-RUN-SEED.md`
- `RESULTADO-DRY-RUN-SEED-TYA.md`

Este dataset no se importó a Firebase. Se validó documentalmente con conteos: 1 tenant, 1 proyecto, 4 shoppers ficticios, 8 visitas ficticias, 3 postulaciones, 1 cuestionario demo y 3 preguntas demo.

### 1.7. Reglas y roles

Se endureció `firestore.rules` y se agregó documentación de validación:

- `MATRIZ-ROLES-FIRESTORE.md`
- `CASOS-PRUEBA-FIRESTORE.md`
- `VALIDACION-ESTATICA-REGLAS-ADAPTER.md`

Cambios relevantes:

- Cliente no lee finanzas, lotes, liquidaciones ni postulaciones internas.
- Shopper queda limitado a recursos propios/asignados.
- Se agregó lectura controlada para que shoppers con proyecto asignado puedan ver visitas disponibles y postularse.
- Admin/super controlan finanzas.
- Ops opera visitas, postulaciones, documentos y cuestionarios, pero no finanzas.
- La regla sigue dependiendo de claims coherentes: `role`, `tenantId`, `projectIds` y `shopperId` cuando aplique.

### 1.8. Gate de base buena T&A

Se agregó `MIGRACION-BASE-BUENA-TYA.md`.

Decisión:

- Todavía NO corresponde cargar la base buena real.
- Se avisará a Paula cuando ya sea momento de pedir/cargar el export limpio.
- Antes deben validarse reglas, usuarios DEV, seed ficticio, adapter en DEV/preview y render de módulos con datos piloto.
- La base anterior nunca debe conectarse como backend vivo.
- El export bueno debe venir en JSON UTF-8, sin datos demo mezclados, con copia original intacta y transformación separada para Firestore.

### 1.9. Estado de gates PR #1

Se agregó `ESTADO-GATES-PR1.md`.

Estado actual:

- PR #1 sigue en draft.
- No merge.
- No deploy de Hosting.
- No producción.
- No datos reales.
- No base buena.
- No usuarios reales.
- No Storage.
- No seed escrito en Firebase.
- No adapter activo.
- Firestore rules publicadas en DEV el 2026-06-28.

### 1.10. Dictamen de `main` y plan de sincronización

Se agregó:

- `DICTAMEN-MAIN-BASE-PR1.md`
- `PLAN-SINCRONIZACION-MAIN-PR1.md`
- `CHECKLIST-POST-SYNC-PR1.md`

Dictamen:

- `main` parece una evolución relevante del prototipo frontend.
- Contiene cambios amplios en core, estilos, index y módulos.
- PR #1 no debe sincronizarse automáticamente todavía.
- Antes se debe confirmar visual/funcionalmente si `main` es nueva base aprobada.
- Si se sincroniza, conservar en `app/index.html` los scripts backend después de `core/notif.js` y antes de `core/topbar.js`.

### 1.11. Publicación de reglas Firestore DEV — 2026-06-28

Paula autorizó publicar reglas Firestore únicamente en Firebase DEV, sin crear usuarios, sin cargar seed, sin activar adapter y sin tocar producción.

Resultado documentado:

- `RESULTADO-PUBLICACION-REGLAS-DEV.md`
- `RESUMEN-PARA-CLAUDE-ADDENDUM-20260628-REGLAS-DEV-PUBLICADAS.md`

Salida relevante:

```text
cloud.firestore: rules file firestore.rules compiled successfully
firestore: released rules firestore.rules to cloud.firestore
Deploy complete!
```

Restricciones conservadas:

- No se publicó Hosting.
- No se creó Auth.
- No se asignaron claims.
- No se cargó seed.
- No se cargaron datos reales.
- No se activó `CX.BACKEND.enabled`.
- No se tocó `/app/modules`.
- No se tocó producción.

Advertencia observada:

```text
[W] 51:14 - Unused function: canAccessProject.
```

Claude puede revisar esa función en una limpieza posterior de reglas, sin cambiar permisos funcionales sin revisar la matriz.

### 2. Qué NO se pudo conectar y por qué

- No se activó `CX.data` contra Firestore todavía. Falta cargar SDK en ambiente controlado, validar usuarios DEV/claims, ejecutar seed ficticio y probar adapter en DEV/preview.
- No se activó Storage porque Firebase solicita plan Blaze para Cloud Storage. Queda pendiente decisión de pago y diseño de reglas/rutas.
- No se publicó Hosting DEV ni producción.
- No se tocó `tya-plataforma.web.app`.
- No se migraron datos reales.
- No se crearon usuarios Auth DEV todavía.
- No se asignaron claims todavía.
- No se pidió ni cargó la base buena de la plataforma anterior.
- No se creó persistencia financiera real.

### 3. Qué partes del frontend necesitan ajuste

Ninguna por ahora dentro del PR backend. No se modificó `/app/modules` desde backend.

Pendientes importantes:

- PR #1 está detrás de `main` por 1 commit.
- Ese commit de `main` contiene cambios amplios de frontend, core, estilos y módulos.
- No sincronizar automáticamente hasta confirmar si `main` es la nueva base aprobada del prototipo.
- Usar `PLAN-SINCRONIZACION-MAIN-PR1.md` y luego `CHECKLIST-POST-SYNC-PR1.md`.
- Revisar `app/index.html` al sincronizar para conservar el punto único de conexión backend.
- Revisar asincronía de módulos cuando se active Firestore en DEV.
- Revisar si finanzas consume `CX.finStore` como interfaz estable antes de crear adapter financiero.

### 4. Errores o inconsistencias detectadas en el prototipo

- Se confirmó que el repo `paulaosoriof86/cxorbia-tya-plataforma` no mostraba claramente el `/app` modular aprobado desde GitHub durante la revisión.
- El repo `paulaosoriof86/demoCXOrbia` sí contiene `/app/index.html`, `/app/core`, `/app/modules` y `/app/docs`, y se tomó como fuente del prototipo modular aprobado por instrucción de Paula.
- Storage queda pendiente por Blaze; no usar Storage viejo como backend vivo.
- PowerShell mostró archivos locales no versionados generados por emulador/validación: `firebase/emulator-rules/node_modules/` y `firebase/emulator-rules/package-lock.json`; no deben commitearse.

### 5. Regla de oro vigente

No tocar módulos de UI. El prototipo manda. Backend nuevo debe conectarse en archivos nuevos y en un único punto de conexión, manteniendo la interfaz de `CX.data`.