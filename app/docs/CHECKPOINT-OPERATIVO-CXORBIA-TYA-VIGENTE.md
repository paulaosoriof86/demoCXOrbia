# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-07-29  
**Estado:** `CORTE3_FROZEN_ACTIVE_BASELINE__CORTE4_WEB_FIRESTORE_RULES_READY__AUTH_CONSOLE_INITIALIZATION_REQUIRED__NO_DATA_WRITES`

## 1. Repositorio y seguridad

- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama viva: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Base: `release/cxorbia-tya-rc-20260630`.
- Producción, merge, imports, pagos y Firestore/Auth/Storage/HR **data writes**: 0.

## 2. Corte 3 — FROZEN / ACTIVE_BASELINE

- Baseline: `CXORBIA-TYA-CORTE3-V182-20260729`.
- V182 empalmada; no V183/R33.
- R26–R32: 135/135 PASS.
- HR remota, Hosting DEV y smoke de pagos: PASS.
- Mayo: 44 pagadas / 0 pendientes / 42 exactas / 2 reviews / CxP Q0-L0.
- Junio: 2 pagadas / 42 pendientes / Q451-L0.
- Pagos/lotes ejecutados por CXOrbia: 0.

Backlog P1/P2 de PDF, Excel, reportKit y copy no reabre Corte 3.

## 3. Corte 4 — objetivo

`CX.data READ-ONLY → Firebase nuevo y vacío → misma interfaz → cero data writes`.

## 4. Firebase nuevo / Gates 1–2

- Project ID: `cxorbia-tya-dev-260729-c4`.
- Display name: `CXOrbia TyA DEV Clean Corte 4`.
- `cxorbia-backend-dev` permanece excluido: no se conecta, copia o reutiliza.
- Identidad nueva: PASS, commit `b18f0b6cf74afb8b3ac770a73231c6cf1353b37c`.
- Vacío integral previo: PASS, commit `7b0e40f8607b80a4f37238314a66064af35c5e6d`.
- Antes del bootstrap: apps=0, Auth users=0, Firestore databases=0, Storage buckets=0; `DEFAULT_SITE` provider-managed no cuenta como contaminación.

## 5. Hardening read-only

- contrato `backend/contracts/cxdata-firestore-readonly-corte4-v1.json`;
- backend disabled por defecto;
- `readOnly=true` / `writeMode=disabled`;
- interfaz pública `CX.data` preservada;
- mutaciones/persistencia bloqueadas;
- backend vacío = vacío;
- errores fail-closed;
- no fallback mock/localStorage.

Gate estático: `PASS_READONLY_POST_GATES`.

## 6. Bootstrap DEV read-only — autorización e IAM

Paula autorizó expresamente: `Autorizo bootstrap DEV read-only de Corte 4`.

Alcance autorizado:

- Web App DEV;
- Firestore DEV mínimo;
- Auth bootstrap mínimo para lectura protegida;
- Rules read-only DEV;
- activación de lectura/smoke posterior.

Fuera de alcance: import/materialización, Storage, Hosting deploy, Functions, HR writes, Make/Gemini, pagos/lotes, merge y producción.

IAM temporal confirmado por Paula sobre la service account del runner:

- Viewer;
- Firebase Editor;
- Cloud Datastore Owner;
- Service Usage Admin.

Ubicación Firestore autorizada: `us-central1`.

Re-preflight commit `baadb8254fd70436b315992348405929b2cfd0db`:

- decisión `BOOTSTRAP_PREFLIGHT_READY_FOR_AUTHORIZED_WRITES_C4`;
- missing IAM permissions=0;
- location=`us-central1`;
- Firestore API era la única requerida deshabilitada y quedó habilitable dentro del alcance autorizado.

## 7. Bootstrap provider — avance real

Ejecutor:

- `tools/release/cxorbia-corte4-bootstrap-readonly-execute.mjs`;
- workflow `.github/workflows/cxorbia-corte4-bootstrap-readonly-execute.yml`;
- request `.github/cxorbia-firebase-requests/corte4-bootstrap-execute.json`.

Resultado confirmado:

- Web App DEV `CXOrbia TyA DEV Corte 4`: **READY**;
- Firestore `(default)`: **READY**, Native/Standard, `us-central1`, sin colecciones;
- Rules `backend/rules/firestore.corte4-readonly.rules`: **DEPLOYED + VERIFIED**;
- Auth config: **PENDING CONSOLE INITIALIZATION**;
- estado sanitizado en commit `3acfaf9566f54e08e5a8db61247f445e90612ca5`: `BOOTSTRAP_DEV_READONLY_PROVIDER_READY_AUTH_CONSOLE_REQUIRED_C4`;
- diagnóstico: `web=true`, `db=true`, `auth=false`, `rules=true`.

Las Rules permiten únicamente lectura autenticada para operadores autorizados del tenant y niegan create/update/delete.

## 8. Causa raíz Auth

El endpoint público `projects.identityPlatform.initializeAuth` devolvió HTTP 400 aun con request body vacío. La documentación oficial de Google indica que esa variante pública está disponible solo para proyectos con facturación habilitada. Este Firebase está en plan Spark.

Corrección de raíz:

- no seguir reintentando el endpoint incompatible;
- mantener Auth fail-closed;
- completar Web App/Firestore/Rules automáticamente;
- inicializar Firebase Authentication una sola vez desde Firebase Console;
- después revalidar automáticamente e idempotentemente.

No se habilitará ningún proveedor de inicio de sesión en este paso.

## 9. Seguridad comprobada

- Firestore document writes: 0.
- Auth user writes: 0.
- Storage writes: 0.
- Hosting deploy: 0.
- Functions: 0.
- imports/materialización: 0.
- HR writes: 0.
- Make/Gemini: 0.
- pagos/lotes: 0.
- merge/producción: 0.

Hubo config writes autorizados exclusivamente para API/Web App/Firestore/Rules. Los intentos de inicialización Auth devolvieron 400 y no crearon usuarios ni datos.

## 10. Siguiente acción humana mínima

En `CXOrbia TyA DEV Clean Corte 4`:

`Firebase Console → Authentication → Comenzar / Get started`.

Detenerse cuando aparezca el panel de Authentication. **No habilitar Email/Password, Google ni ningún otro proveedor todavía.**

Después ChatGPT:

1. reejecuta el bootstrap idempotente;
2. confirma Auth config;
3. recupera/configura Web App DEV;
4. activa únicamente lectura DEV;
5. ejecuta smoke `CX.data` con `source=firestore`, `empty=true`, `fallbackUsed=false`, interfaz preservada y writes=0;
6. valida visualmente;
7. congela Corte 4;
8. retira los tres roles IAM elevados temporales y deja al runner nuevamente en `Viewer`.

## 11. Claude/prototipo y Academia

- Claude/prototipo: sin nueva candidata; no tocar backend/contracts/adapters. Solo abrir tarea si el smoke demuestra una diferencia reproducible localizada.
- Academia: documentar separación entre proyecto, IAM, API, Web App, Firestore, Auth, Rules, lectura y materialización. El bloqueo de Auth por plan Spark es infraestructura, no cambio de flujo UI.
- Reusable CXOrbia: preflight IAM/location, bootstrap idempotente, fail-closed y retiro de privilegios.
- Exclusivo cliente: projectId DEV TyA y `us-central1` de este entorno.
- Sin impacto Claude: runners, IAM y provider bootstrap.

## 12. Estado seguro

PR #7 draft/open/no merge. Corte 3 preservado. Corte 4 está a una inicialización de Authentication en consola de completar el bootstrap provider; no hay datos TyA materializados y no hay producción.
