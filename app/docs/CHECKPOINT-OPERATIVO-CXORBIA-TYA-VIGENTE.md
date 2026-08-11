# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-11  
**Estado:** `PASS_C6_STAFF_REPAIR_BOOTSTRAP_PROVIDER_SNAPSHOT__AUTH_228__A_REUSE_BOUND__BCD_CREATE__R4_PRESERVED__WRITE_BUDGET_FROZEN__ROLLBACK_DRYRUN_PASS__NO_WRITES__NO_DEPLOY__NO_PRODUCTION`

## 1. Control

- repo: `paulaosoriof86/demoCXOrbia`;
- rama viva: `docs-tya-v6-v71-audit`;
- PR #7: draft/open/no merge;
- source lock vigente: `app/docs/SOURCE-LOCK-C6-STAFF-PROVIDER-SNAPSHOT-PASS-20260811.md`;
- producción: intacta.

## 2. Baseline protegido

```text
AuthUsersAfter=228
Activation=PASS
Readback=PASS
RollbackDryRun=PASS
SKIP13=closed 13/13
MultiAuth=closed
HashConfig=closed PASS
DirectRunnerDEV=PASS
HRSourceMapped=true
HRSourceLive=true
M4=COMPLETE
M6=COMPLETE
```

No reconstruir Auth, no reabrir HR y no repetir PREWRITE/Activation históricos.

## 3. M5 provider snapshot — PASS

```text
requestId=c6-staff-repair-bootstrap-provider-snapshot-readonly-20260811-02-harness-rootfix
requestCommit=6632ecbdb8593126c094178154fca9b0913592af
runId=31518927950
jobId=93870945840
artifactId=9112228351
decision=PASS_C6_STAFF_REPAIR_BOOTSTRAP_PREWRITE
AuthPopulation=228
AuthListObservations=1
FirestoreDocumentReads=2
providerWrites=0
blockers=[]
```

El request quedó disabled/consumed. No repetir provider snapshot.

## 4. Adjudicación focal

```text
A super: REUSE_EXISTING_CANONICAL
  ownerBindingVerified=true
  roleUniquenessUsed=false
  claimsExact=true
  userDocAction=CREATE_CANONICAL_USER_DOC
B admin: CREATE_NEW_EPHEMERAL, collision=0
C ops: CREATE_NEW_EPHEMERAL, collision=0
D ops adicional: CREATE_NEW_EPHEMERAL, collision=0
R4 client canonical: enabled + claims exact + membership exact + mutation forbidden
```

R1/R2/R3/R4 históricos mantienen 2 principals enabled cada uno. Retiro futuro: `DISABLE_ONLY_NO_DELETE` y solo después del canonical readback correspondiente.

## 5. Budget exacto congelado

```text
Auth creates=3
custom claims writes=3
Auth disable writes=8
Auth writes total=14
Auth deletes=0

user document writes=4
audit log writes=12
Firestore writes total=16
Firestore deletes=0
```

El total Auth=14 es un resultado nuevo del snapshot real; no reabre ni reutiliza el antiguo cap de 14. La coincidencia numérica ocurre porque A se reutiliza y B/C/D se crean.

## 6. Rollback dry-run

```text
PASS
uniqueInverseActions=12
authReenableWrites=8
authDisableCreatedWrites=3
userDocDeactivateWrites=4
auditRollbackWrites=12
authDeletes=0
firestoreDeletes=0
validatedClientCanonicalMutation=NONE
```

## 7. M5 subasignación

```text
M5a contract source-only                    = COMPLETE 1/8
M5b executable backend source materialized = COMPLETE 1/8
M5c static terminal gate                    = COMPLETE 1/8
M5d provider snapshot + exact prewrite      = COMPLETE 1/8
M5 remaining                                = PENDING 4/8
```

## 8. Progreso

```text
M1 35 COMPLETE
M2 20 COMPLETE
M3 15 COMPLETE
M4  5 COMPLETE
M5  4/8 COMPLETE
M6  5 COMPLETE
M7  0/5
M8  0/3
M9  0/3
M10 0/1
```

**Avance certificado: 84%. Restante: 16%.**

## 9. Siguiente gate exacto

`C6 STAFF REPAIR/BOOTSTRAP EXACT WRITE AUTHORIZATION`.

Debe autorizar únicamente el budget congelado, create-before-retire, readback antes de cada disable, cero deletes y rollback pactado. No requiere volver a leer provider antes de los writes salvo que el executor detecte drift mediante precondition/readback dentro de la misma ejecución autorizada.

## 10. Estado seguro

```text
providerReadsConsumed=1 Auth list + 2 focal Firestore docs
providerWrites=0
AuthWrites=0
FirestoreWrites=0
HRWrites=0
RulesWrites=0
StorageWrites=0
deletes=0
deploys=0
merge=false
production=false
```
