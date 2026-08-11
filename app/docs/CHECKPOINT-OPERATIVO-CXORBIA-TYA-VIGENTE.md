# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-11  
**Estado:** `C6_AUTH_CANONICAL_STAFF_OWNER_INPUT_PARTIAL_CAPTURED__OWNER_REFERENCES_RECEIVED__PROJECT_ENTITLEMENTS_PENDING__NO_PROVIDER__NO_REPAIR__NO_PRODUCTION`

## 1. Control

- repo: `paulaosoriof86/demoCXOrbia`;
- rama viva: `docs-tya-v6-v71-audit`;
- PR #7: draft/open/no merge;
- HEAD verificado al inicio de la sesión: `e62f62e6c4161216b2cb32071fda036ba700a020`;
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
```

No reconstruir las 340 identidades ni repetir PREWRITE/Activation/smoke históricos.

## 3. Input empresarial recibido el 2026-08-11

Se recibió de Paula la designación empresarial humana para los roles staff canónicos:

```text
A / Superadministración = Paula Andrea Osorio Franco
B / Administración      = Paula Andrea Osorio Franco
C / Operaciones          = Carlos Castro
additionalOpsAccess      = Samuel Daza
```

Estas referencias son de negocio y se usan solo transitoriamente para resolver owner anchors/role bindings. **No deben persistirse en código, configuración ejecutable ni claims como datos hardcodeados.** Los correos compartidos en conversación tampoco se persisten en este checkpoint ni deben usarse como identidad técnica canónica por defecto.

La observación de Samuel Daza se clasifica como **usuario adicional de Operaciones**, no como sustitución automática del titular C. Debe materializarse posteriormente como dato administrable en la plataforma, no como constante de código.

## 4. Autoadministrabilidad obligatoria

La creación inicial de A/B/C y del acceso adicional de Operaciones es un bootstrap operativo, no una definición estructural permanente.

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

Paula debe poder crear, editar, cambiar roles/scope, deshabilitar y administrar usuarios desde la plataforma con RBAC. La desactivación debe preservar auditoría; eliminación física queda separada y protegida.

## 5. Pendiente mínimo real

Faltan únicamente los **alcances de proyecto** para cerrar el target de A/B/C:

```text
A / Superadministración -> TYA_COMPLETE o SPECIFIC_PROJECTS
B / Administración      -> TYA_COMPLETE o SPECIFIC_PROJECTS
C / Operaciones          -> TYA_COMPLETE o SPECIFIC_PROJECTS
Samuel / Operaciones     -> TYA_COMPLETE o SPECIFIC_PROJECTS
```

`TYA_COMPLETE` debe expandirse a projectIds canónicos exactos; no wildcard. `SPECIFIC_PROJECTS` exige resolución 1:1 a projectIds canónicos. No asumir Cinépolis.

## 6. Progreso de cierre a producción — métrica estable

Se adopta para las sesiones restantes una métrica de 100 puntos, sin recalcular el denominador:

```text
M1 Baseline acumulativa/Phase A preservada        35 pts = COMPLETE
M2 Auth V4 activation/readback/rollback           20 pts = COMPLETE
M3 SKIP13/MultiAuth/HashConfig/direct runner      15 pts = COMPLETE
M4 Owners + exact project entitlements             5 pts = PARTIAL (owners recibidos; scopes pendientes)
M5 Repair focal A-D + readback/rollback             8 pts = PENDING
M6 HR final production evidence                     5 pts = PENDING
M7 Final accumulative multirole smoke               5 pts = PENDING
M8 Human validation + rollback ready                3 pts = PENDING
M9 Explicit cutover + one production promotion      3 pts = PENDING
M10 Post-cutover smoke + freeze                     1 pt  = PENDING
```

Avance certificado antes de cerrar M4: **70% completo + 2/5 de M4 capturado = 72% operativo de cierre**.

Esta escala se conserva en adelante. Solo aumenta cuando un milestone obtiene evidencia terminal; un STOP_RETRY no reduce porcentaje ya ganado salvo P0 demostrado que invalide evidencia previa.

## 7. Circuit breaker anti-bucle

1. No reabrir milestones M1-M3 sin P0 reproducible.
2. No volver a preguntar owner names ya recibidos.
3. No convertir staff inicial en constantes de código.
4. No crear nueva candidata, rama o PR.
5. No repetir PREWRITE/Activation general.
6. No ejecutar provider/repair hasta cerrar scopes exactos.
7. Cada interacción reportará: `avance nuevo`, `porcentaje acumulado`, `porcentaje restante`, `siguiente gate exacto`.

## 8. Siguiente bloque exacto

`C6 AUTH CANONICAL STAFF OWNER INPUT CAPTURE AND TARGET DIGEST — COMPLETE PROJECT ENTITLEMENTS, SOURCE-SAFE / NO PROVIDER / NO REPAIR`.

Una vez recibidos los cuatro scopes, convertir owner references a anchors/digests, enumerar projectIds exactos, generar target claims + expectedClaimsDigest y preparar el repair focal reversible. No provider ni repair en ese bloque.

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
