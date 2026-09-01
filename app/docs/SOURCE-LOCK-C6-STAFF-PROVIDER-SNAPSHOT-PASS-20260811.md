# SOURCE LOCK — C6 staff repair/bootstrap provider snapshot PASS

**Fecha:** 2026-08-11  
**Repositorio:** `paulaosoriof86/demoCXOrbia`  
**Rama viva:** `docs-tya-v6-v71-audit`  
**PR:** #7 draft/open/no merge  
**Estado:** `PASS_C6_STAFF_REPAIR_BOOTSTRAP_PROVIDER_SNAPSHOT__AUTH_228__A_REUSE_BOUND__BCD_CREATE__R4_PRESERVED__WRITE_BUDGET_FROZEN__ROLLBACK_DRYRUN_PASS__NO_WRITES__NO_DEPLOY__NO_PRODUCTION`

## 1. Ejecución terminal

Request consumido:

```text
requestId=c6-staff-repair-bootstrap-provider-snapshot-readonly-20260811-02-harness-rootfix
requestCommit=6632ecbdb8593126c094178154fca9b0913592af
targetHead=c09a3e33858ee5d49751c6bf52433c3c78265121
workflowRunId=31518927950
workflowJobId=93870945840
artifactId=9112228351
artifactDigest=sha256:044b9f90df50cb633b90cb87721e22c9a913804ba337227d95eaa1cdea198776
jobConclusion=success
decision=PASS_C6_STAFF_REPAIR_BOOTSTRAP_PREWRITE
blockers=[]
```

La ejecución consumió la primera y única observación provider efectiva autorizada. El request quedó posteriormente disabled/consumed y no admite segundo provider read.

## 2. Provider snapshot

```text
Auth population=228 EXACT
Auth list observations=1
Firestore focal document reads=2
provider writes=0
```

No hubo drift de población ni faltantes focales.

## 3. Adjudicación A–D

### A / super

```text
ownerBindingVerified=true
roleUniquenessUsed=false
providerCollisionCount=1
action=REUSE_EXISTING_CANONICAL
claimsExact=true
userDocAction=CREATE_CANONICAL_USER_DOC
```

La reutilización se adjudicó por binding técnico independiente del owner y claims exactos, nunca por ser el único `super`.

### B / admin

```text
providerCollisionCount=0
action=CREATE_NEW_EPHEMERAL
userDocAction=CREATE_CANONICAL_USER_DOC
```

### C / ops

```text
providerCollisionCount=0
action=CREATE_NEW_EPHEMERAL
userDocAction=CREATE_CANONICAL_USER_DOC
```

### D / ops adicional

```text
providerCollisionCount=0
action=CREATE_NEW_EPHEMERAL
userDocAction=CREATE_CANONICAL_USER_DOC
```

No se emitieron login, email, UID, password, nombre ni claims crudos.

## 4. Históricos y canónico Cliente

Los cuatro grupos históricos tienen 2 principals habilitados cada uno:

```text
R1_SUPER=2
R2_ADMIN=2
R3_OPS=2
R4_CLIENT_HISTORICAL=2
totalHistoricalEnabled=8
retirementMode=DISABLE_ONLY_NO_DELETE
```

El canónico Cliente validado permanece:

```text
enabled=true
claimsExact=true
membershipExact=true
mutation=FORBIDDEN
```

## 5. Write budget exacto congelado

El budget final derivado del snapshot es:

```text
Auth creates=3
custom claims writes=3
Auth disable writes=8
Auth writes TOTAL=14
Auth deletes=0

user document writes=4
audit log writes=12
Firestore writes TOTAL=16
Firestore deletes=0
```

El total Auth vuelve numéricamente a **14**, pero **no es reutilización del viejo cap de 14**. Ese cap histórico estaba invalidado porque excluía el target D adicional. El valor actual fue recalculado desde el snapshot real y coincide en número porque A puede reutilizarse sin create/claims, mientras B/C/D sí requieren create+claims y los ocho históricos requieren disable.

## 6. Rollback dry-run

```text
decision=PASS
uniqueInverseActions=12
authReenableWrites=8
authDisableCreatedWrites=3
userDocDeactivateWrites=4
auditRollbackWrites=12
authDeletes=0
firestoreDeletes=0
validatedClientCanonicalMutation=NONE
```

Reglas: canonical creado -> disable/no-delete; canonical existente adoptado -> desactivar solo el user-doc creado por esta operación si fuera necesario revertir; histórico previamente enabled y retirado -> re-enable; audit log inmutable; canónico Cliente no se toca.

## 7. Evidencia

Fuente persistida source-safe:

`app/docs/evidence/C6-STAFF-REPAIR-BOOTSTRAP-PROVIDER-SNAPSHOT-LATEST.json`.

El artifact efímero terminal fue usado únicamente para verificar el reporte source-safe y no contiene credenciales crudas.

## 8. Progreso

```text
M5 previous=3/8
M5 provider snapshot/prewrite=COMPLETE +1
M5 current=4/8
```

**Avance certificado: 84%. Restante: 16%.**

## 9. Siguiente gate exacto

`C6 STAFF REPAIR/BOOTSTRAP EXACT WRITE AUTHORIZATION`.

La futura ejecución debe respetar exactamente el budget congelado, create-before-retire, readback antes de cada retiro, cero deletes y rollback dry-run ya PASS. No debe reabrir Auth 340, SKIP13, MultiAuth, HR ni static gates.

Provider/Auth/Firestore writes siguen **NO AUTORIZADOS** hasta aprobación explícita del siguiente gate. Tampoco hay deploy, merge o producción autorizados.

## 10. Cierre obligatorio

```text
que_se_hizo=provider snapshot focal + adjudicación A-D + budget exacto + rollback dry-run
avance_Phase_A=84%
que_se_preservo=frontend acumulativo; Auth 228; M1-M4; M6/HR viva; canónico R4; PR7 sin merge
Claude=sin cambios UI; wiring Usuarios & Permisos localizado y pendiente
Academia=impacto conceptual documentado; no bloqueante
pendiente_real=autorización exacta de repair/bootstrap y ejecución focal
siguiente_bloque=C6 STAFF REPAIR/BOOTSTRAP EXACT WRITE AUTHORIZATION
estado_seguro=provider/Auth/Firestore writes 0; deletes 0; deploy 0; merge false; production false
bloqueo_comprobado=writes bloqueados únicamente por autorización explícita del siguiente gate
```

## 11. Clasificación

- **Reusable CXOrbia:** owner-bound canonical reuse, collision gate, exact budget after snapshot, disable-only retirement, reversible rollback.
- **Exclusivo TyA:** Auth 228, focales R1/R2/R3/D/R4 y budget exacto resultante.
- **Claude/prototipo:** sin cambios UI en este bloque.
- **Academia:** principio de altas/retiros auditables y reversibles; sin lección bloqueante.
- **Sin impacto Claude:** snapshot provider, write budget y rollback técnico.
