# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-07-29  
**Estado:** `CORTE3_FROZEN_ACTIVE_BASELINE__CORTE4_PROVIDER_BOOTSTRAP_COMPLETED__PROTECTED_CXDATA_SMOKE_AUTH_PRINCIPAL_PENDING__NO_DATA_WRITES`

## 1. Repositorio y seguridad

- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama viva: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Base: `release/cxorbia-tya-rc-20260630`.
- Producción, merge, imports, pagos y Firestore/Auth/Storage/HR **data writes permanentes**: 0.

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

Gate estático previo: `PASS_READONLY_POST_GATES`.

## 6. Bootstrap DEV read-only — autorización e IAM

Paula autorizó expresamente: `Autorizo bootstrap DEV read-only de Corte 4`.

Alcance autorizado consumido:

- Web App DEV;
- Firestore DEV mínimo;
- inicialización de Firebase Authentication sin proveedores ni usuarios;
- Rules read-only DEV;
- revalidación idempotente.

Fuera de ese alcance y todavía no ejecutado: import/materialización, Storage, Hosting deploy nuevo, Functions, HR writes, Make/Gemini, pagos/lotes, merge y producción.

IAM temporal confirmado por Paula sobre la service account del runner:

- Viewer;
- Firebase Editor;
- Cloud Datastore Owner;
- Service Usage Admin.

Ubicación Firestore autorizada: `us-central1`.

Re-preflight commit `baadb8254fd70436b315992348405929b2cfd0db`:

- decisión `BOOTSTRAP_PREFLIGHT_READY_FOR_AUTHORIZED_WRITES_C4`;
- missing IAM permissions=0;
- location=`us-central1`.

## 7. Bootstrap provider — COMPLETADO

Ejecutor:

- `tools/release/cxorbia-corte4-bootstrap-readonly-execute.mjs`;
- workflow `.github/workflows/cxorbia-corte4-bootstrap-readonly-execute.yml`;
- request `.github/cxorbia-firebase-requests/corte4-bootstrap-execute.json`.

Resultado antes de la inicialización manual de Auth:

- Web App DEV `CXOrbia TyA DEV Corte 4`: READY;
- Firestore `(default)`: READY, Native/Standard, `us-central1`, sin colecciones;
- Rules `backend/rules/firestore.corte4-readonly.rules`: DEPLOYED + VERIFIED;
- Auth config: requería inicialización única en Firebase Console.

Paula completó en consola `Authentication → Comenzar/Get started` y se detuvo en el panel de proveedores sin habilitar Email/Password, Google ni ningún otro proveedor.

Revalidación idempotente disparada en commit `e524b968c0003c27351d5d5826e21ffcf7cbfdbe`:

- `cxorbia/corte4-bootstrap-execute = success`;
- `cxorbia/c4exec-BOOTSTRAP_DEV_READONLY_COMPLETED_C4 = success`;
- `cxorbia/c4bootstrap-w0-webtrue-dbtrue-authtrue-rulestrue = success`;
- Web App=true;
- Firestore=true;
- Auth config=true;
- Rules=true;
- provider config writes en esta revalidación=0.

Decisión canónica: `BOOTSTRAP_DEV_READONLY_COMPLETED_C4`.

## 8. Gate real siguiente — principal DEV temporal para lectura protegida

Las Rules desplegadas exigen `request.auth` y rol `super|admin|ops|coordinador` con tenant permitido. El Firebase nuevo conserva Auth users=0 y ningún proveedor de inicio de sesión habilitado.

Consecuencia: no se puede ejecutar honestamente un smoke de navegador de `CX.data` bajo las Rules actuales sin introducir un principal autenticado. Hacerlo silenciosamente implicaría un Auth user write y/o habilitación de proveedor no contemplados por el request consumido.

Ruta mínima, reversible y sin datos TyA:

1. autorización expresa de un principal DEV temporal;
2. habilitar Email/Password únicamente en este Firebase DEV;
3. crear exactamente 1 usuario temporal con credencial aleatoria no expuesta y claims `role=admin`, `tenantId=tya`;
4. ejecutar smoke protegido contra Firestore vacío: `source=firestore`, `empty=true`, `fallbackUsed=false`, interfaz `CX.data` preservada, Firestore document writes=0;
5. eliminar el usuario temporal;
6. deshabilitar Email/Password;
7. confirmar nuevamente Auth users=0;
8. conservar todas las Rules de escritura denegadas.

Esto no sustituye Auth/RBAC de Corte 6.

## 9. Seguridad comprobada

- Firestore document writes: 0.
- Auth users permanentes: 0.
- Storage writes: 0.
- Hosting deploy nuevo: 0.
- Functions: 0.
- imports/materialización: 0.
- HR writes: 0.
- Make/Gemini: 0.
- pagos/lotes: 0.
- merge/producción: 0.

El bootstrap ya no está bloqueado por Firebase Authentication. El único bloqueo actual es el gate de identidad autenticada para demostrar la lectura protegida de cliente sin romper la regla de cero writes de datos.

## 10. Siguiente acción exacta

`AUTORIZAR PRINCIPAL DEV TEMPORAL → SMOKE PROTEGIDO CX.data → CERRAR EVIDENCIA TÉCNICA → AUTORIZACIÓN SEPARADA HOSTING DEV → VALIDACIÓN VISUAL → FREEZE CORTE 4 → RETIRAR IAM TEMPORAL A VIEWER`.

No se necesita PowerShell, nueva candidata, ZIP ni datos TyA.

## 11. Claude/prototipo y Academia

- Claude/prototipo: sin nueva candidata; no tocar backend/contracts/adapters. Solo abrir tarea si el smoke demuestra una diferencia reproducible localizada.
- Academia: diferenciar inicialización Auth, proveedor, usuario temporal, claims, lectura protegida y Auth/RBAC completo.
- Reusable CXOrbia: preflight IAM/location, bootstrap idempotente, fail-closed, principal temporal reversible para smoke y retiro de privilegios.
- Exclusivo cliente: projectId DEV TyA y `us-central1` de este entorno.
- Sin impacto Claude: runners, IAM y provider bootstrap.

## 12. Estado seguro

PR #7 draft/open/no merge. Corte 3 preservado. Corte 4 tiene provider bootstrap completo y permanece bloqueado únicamente antes del principal autenticado temporal requerido para el smoke protegido; no hay datos TyA materializados y no hay producción.
