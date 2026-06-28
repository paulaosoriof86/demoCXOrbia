# RESUMEN-PARA-CLAUDE.md

## Sesión 2026-06-27 — Backend DEV y Hosting DEV

### 1. Qué se conectó al backend y funciona

Aún no se conectó lógica de frontend al backend. Esta sesión preparó infraestructura Firebase DEV en rama aislada:

- Repo usado como prototipo modular aprobado: `paulaosoriof86/demoCXOrbia`.
- Rama creada: `feat/firebase-backend-dev-config-20260627`.
- Firebase DEV nuevo: `cxorbia-backend-dev`.
- Firestore: creado en Firebase Console.
- Auth Email/Password: activado en Firebase Console.
- Storage: pendiente porque requiere Blaze.
- Hosting producción actual: `https://tya-plataforma.web.app/` se mantiene y NO se tocó.
- Deploy: NO autorizado y NO ejecutado.

Archivos agregados:

- `.firebaserc`
- `firebase.json`
- `firestore.rules`
- `firestore.indexes.json`
- `storage.rules`
- `CAMBIOS-BACKEND.md`
- `RESUMEN-PARA-CLAUDE.md`
- `PENDIENTES-PROTOTIPO.md`
- `ARQUITECTURA-TENANTS-TYA.md`

### 1.1. Decisión clave de producto vs cliente

Paula aclaró que `demoCXOrbia` es el repo del prototipo y seguirá evolucionando como plataforma comercializable. T&A Consultores será el primer cliente/tenant real que se migra a esa plataforma.

Implicación técnica:

- CXOrbia debe permanecer genérico, multi-tenant y comercializable.
- T&A no debe hardcodearse en módulos ni core de UI.
- T&A debe entrar como `tenantId: tya` y sus campañas/clientes finales como `projectId` dentro del tenant.
- La migración de T&A debe cargar datos reales limpios a Firestore, no conectar la base vieja como backend vivo.
- Producción actual de T&A sigue siendo `https://tya-plataforma.web.app/` y no se despliega sin autorización.

### 2. Qué NO se pudo conectar y por qué

- No se conectó `CX.data` a Firestore todavía. Falta crear un adapter backend nuevo que mantenga exactamente la misma interfaz actual.
- No se activó Storage porque Firebase solicita plan Blaze para Cloud Storage. Queda pendiente decisión de pago y diseño de reglas/rutas.
- No se publicó Hosting DEV ni producción. La usuaria indicó explícitamente: no deploy.
- No se tocó `tya-plataforma.web.app`.
- No se migraron datos reales.

### 3. Qué partes del frontend necesitan ajuste

Ninguna por ahora. No se modificó `/app/modules` ni se detectó necesidad de cambio visual durante esta preparación.

Cuando se conecte Firestore, revisar si algún módulo asume datos síncronos inmediatos de `CX.data`; si aparece ese caso, NO parchar en el módulo. Documentarlo aquí para ajuste posterior.

### 4. Errores o inconsistencias detectadas en el prototipo

- Se confirmó que el repo `paulaosoriof86/cxorbia-tya-plataforma` no mostraba claramente el `/app` modular aprobado desde GitHub durante la revisión.
- El repo `paulaosoriof86/demoCXOrbia` sí contiene `/app/index.html`, `/app/core`, `/app/modules` y `/app/docs`, y se tomó como fuente del prototipo modular aprobado por instrucción de Paula.
- Storage queda pendiente por Blaze; no usar Storage viejo como backend vivo.

### 5. Regla de oro vigente

No tocar módulos de UI. El prototipo manda. Backend nuevo debe conectarse en archivos nuevos y en un único punto de conexión, manteniendo la interfaz de `CX.data`.
