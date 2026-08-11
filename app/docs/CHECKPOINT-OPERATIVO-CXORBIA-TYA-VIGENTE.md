# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-11  
**Estado:** `C6_AUTH_CANONICAL_STAFF_OWNER_INPUT_PARTIAL_CAPTURED__PROJECT_ENTITLEMENTS_PENDING__LIVE_USER_ADMIN_BACKEND_GAP_PROVEN__NO_PROVIDER__NO_REPAIR__NO_PRODUCTION`

## 1. Control

- repo: `paulaosoriof86/demoCXOrbia`;
- rama viva: `docs-tya-v6-v71-audit`;
- PR #7: draft/open/no merge;
- producción: intacta.

## 2. Baseline Auth protegido

```text
rows=340
CREATE_AUTH=118
UPDATE_AUTH=9
NO_OP=81
HOLD=0
PRESERVE_NO_AUTH=132
AuthUsersAfter=228
Activation=PASS
Readback=PASS
RollbackDryRun=PASS
SKIP13=closed 13/13
MultiAuth=closed
targetLineage(ac93)=closed
HashConfig=closed PASS
DirectRunnerDEV=PASS
```

No reconstruir las 340 identidades ni repetir PREWRITE/Activation/smoke históricos.

## 3. Input empresarial recibido el 2026-08-11

La conversación actual entregó las designaciones humanas para A/B/C y un usuario adicional de Operaciones. Conforme al contrato source-safe vigente, las referencias humanas y correos se consideran datos transitorios y no se persisten en el estado vivo de documentación/configuración ejecutable/claims/artifacts/logs.

```text
A / Superadministración = OWNER_REFERENCE_RECEIVED_TRANSIENTLY
B / Administración      = OWNER_REFERENCE_RECEIVED_TRANSIENTLY
C / Operaciones          = OWNER_REFERENCE_RECEIVED_TRANSIENTLY
additionalOpsAccess      = ADDITIONAL_USER_REFERENCE_RECEIVED_TRANSIENTLY
```

No volver a pedir estas referencias humanas.

## 4. Autoadministrabilidad obligatoria y hallazgo reproducible

La creación inicial de staff es bootstrap operativo, no configuración hardcodeada.

Contrato obligatorio:

```text
usersAndRoleAssignmentsAreLiveData=true
hardcodedStaffUsers=false
editableFromAuthorizedAdminSurface=true
roleAndProjectScopeEditable=true
disableInsteadOfHardDeleteByDefault=true
technicalIdentityDerivedAtRuntime=true
rawCredentialsInRepo=false
```

### Evidencia actual

`app/modules/configuracion.js` ya contiene la UI de **Usuarios & Permisos** con alta, edición, cambio de rol, activación/desactivación, proyecto y matriz de permisos. Sin embargo, su persistencia actual es exclusivamente:

```text
cx_users -> localStorage
cx_custom_roles -> localStorage
cx_perm -> localStorage
```

El flujo de alta muestra además `Invitación preparada (vista previa)`. `app/core/backend-firebase.js` envuelve/persiste actualmente proyectos, shoppers y visitas, pero no expone una operación backend para crear/editar/deshabilitar usuarios Auth ni sus claims/scope.

Clasificación:

```text
LIVE_USER_ADMIN_UI_EXISTS=true
LIVE_USER_ADMIN_FIREBASE_AUTH_WRITE_PATH=false
LIVE_USER_ADMIN_CLAIMS_SCOPE_WRITE_PATH=false
LOCALSTORAGE_PREVIEW_ONLY=true
PRODUCTION_BLOCKER=true
```

Este gap **no reabre frontend general ni Auth V4**. Se incorpora dentro de M5 como corrección focal de bootstrap/admin de usuarios. No crear nueva metodología.

## 5. Pendiente mínimo de M4

Faltan únicamente los alcances de proyecto para cerrar los targets staff iniciales:

```text
A / Superadministración -> TYA_COMPLETE o SPECIFIC_PROJECTS
B / Administración      -> TYA_COMPLETE o SPECIFIC_PROJECTS
C / Operaciones          -> TYA_COMPLETE o SPECIFIC_PROJECTS
additional Ops user      -> TYA_COMPLETE o SPECIFIC_PROJECTS
```

`TYA_COMPLETE` debe expandirse a projectIds canónicos exactos; no wildcard. `SPECIFIC_PROJECTS` exige resolución 1:1. No asumir Cinépolis.

## 6. Progreso de cierre a producción — métrica estable

```text
M1 Baseline acumulativa/Phase A preservada        35 pts = COMPLETE
M2 Auth V4 activation/readback/rollback           20 pts = COMPLETE
M3 SKIP13/MultiAuth/HashConfig/direct runner      15 pts = COMPLETE
M4 Owners + exact project entitlements             5 pts = PARTIAL
M5 Staff repair/bootstrap + live admin + rollback  8 pts = PENDING
M6 HR final production evidence                     5 pts = PENDING
M7 Final accumulative multirole smoke               5 pts = PENDING
M8 Human validation + rollback ready                3 pts = PENDING
M9 Explicit cutover + one production promotion      3 pts = PENDING
M10 Post-cutover smoke + freeze                     1 pt  = PENDING
```

**Avance certificado actual: 72%. Restante: 28%.** El denominador no cambia. El nuevo gap se incorpora como condición interna de M5; no crea puntos ni fases nuevas.

## 7. Circuit breaker anti-bucle

1. No reabrir M1-M3 sin P0 reproducible.
2. No volver a preguntar owner names ya recibidos.
3. No persistir staff inicial como constantes de código.
4. No crear nueva candidata, rama o PR por este gap.
5. No repetir PREWRITE/Activation general.
6. No ejecutar provider/repair hasta cerrar scopes exactos.
7. Resolver el gap de administración en un único carril: backend/contrato source-only + ajuste frontend localizado por archivo/módulo, sin rediseño.
8. Cada interacción reportará avance nuevo, porcentaje acumulado, porcentaje restante y siguiente gate exacto.

## 8. Siguiente bloque exacto

Primero cerrar los cuatro scopes empresariales. Inmediatamente después:

`C6 STAFF TARGET DIGEST + LIVE USER ADMIN BACKEND CONTRACT — SOURCE-SAFE / NO PROVIDER / NO REPAIR`.

Debe producir target claims/digests y un contrato backend administrable para create/update/disable/role/project-scope con RBAC, snapshot, idempotencia, readback y rollback; sin hardcodear usuarios ni credenciales.

## 9. Estado seguro

```text
providerReadsCurrentBlock=0
providerWrites=0
AuthWrites=0
IAMWrites=0
FirestoreReads/Writes=0/0
HRReads/Writes=0/0
RulesWrites=0
StorageWrites=0
PREWRITE=false
Activation=false
smoke=false
repair=false
Make=0
Gemini=0
payments=0
deploys=0
merge=false
production=false
rawCredentialsStored=false
```
