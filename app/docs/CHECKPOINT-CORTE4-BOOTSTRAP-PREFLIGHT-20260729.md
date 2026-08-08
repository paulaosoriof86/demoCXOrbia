# CHECKPOINT — Corte 4 bootstrap DEV read-only

Fecha: 2026-07-29

Estado exacto: `CORTE3_FROZEN__CORTE4_WEB_FIRESTORE_RULES_READY__AUTH_CONSOLE_INITIALIZATION_REQUIRED__NO_DATA_WRITES`

- PR #7 draft/open/no merge.
- Corte 3 baseline V182 preservado.
- Corte 4 identidad nueva: PASS.
- Corte 4 vacío integral previo: PASS.
- Bootstrap DEV read-only: autorizado por Paula.
- IAM temporal confirmado por Paula: Viewer + Firebase Editor + Cloud Datastore Owner + Service Usage Admin sobre la service account del runner.
- Ubicación Firestore autorizada explícitamente: `us-central1`.
- Re-preflight commit `baadb8254fd70436b315992348405929b2cfd0db`: `BOOTSTRAP_PREFLIGHT_READY_FOR_AUTHORIZED_WRITES_C4`, permisos faltantes=0, ubicación=`us-central1`.
- `firestore.googleapis.com` fue la única API requerida que estaba deshabilitada y quedó habilitada dentro del bootstrap autorizado.
- Web App DEV `CXOrbia TyA DEV Corte 4`: creada/verificada.
- Firestore `(default)`: creado/verificado en `us-central1`, Native/Standard, sin colecciones.
- Rules `backend/rules/firestore.corte4-readonly.rules`: publicadas y verificadas; lectura solo para operador autenticado del tenant y create/update/delete denegados.
- Estado final del runner en commit `3acfaf9566f54e08e5a8db61247f445e90612ca5`: `BOOTSTRAP_DEV_READONLY_PROVIDER_READY_AUTH_CONSOLE_REQUIRED_C4`.
- Diagnóstico sanitizado: Web App=true, Firestore=true, Auth=false, Rules=true.
- El endpoint público `projects.identityPlatform.initializeAuth` devolvió HTTP 400 en el proyecto Spark. La documentación oficial indica que esa variante pública solo está disponible para proyectos con facturación habilitada; por seguridad se retiró el intento automático y Auth queda fail-closed hasta inicialización desde Firebase Console.
- Firestore document writes: 0.
- Auth user writes: 0.
- Storage/Hosting deploy/Functions/imports/HR/Make/Gemini/payments/merge/production: 0.

Siguiente acción humana mínima: en el Firebase nuevo abrir `Authentication` y pulsar `Comenzar/Get started` únicamente para inicializar Firebase Authentication. No habilitar proveedores de inicio de sesión todavía. Después ChatGPT reejecuta el mismo runner de forma idempotente; si Auth config ya existe, valida Rules/Firestore/Web App y continúa con la conexión/smoke `CX.data` sin nueva autorización mientras el alcance no cambie.

Después del bootstrap completo se retirarán los tres roles elevados temporales y la service account volverá a `Viewer` antes de avanzar.

No pedir nueva candidata, ZIP, PowerShell ni datos TyA.
