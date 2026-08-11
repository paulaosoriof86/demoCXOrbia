# CAMBIOS-BACKEND.md

**Última actualización:** 2026-08-11  
**Fuente operativa vigente:** `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`.

## Estado actual

`PASS_C6_STAFF_REPAIR_BOOTSTRAP_PROVIDER_SNAPSHOT__AUTH_228__A_REUSE_BOUND__BCD_CREATE__R4_PRESERVED__WRITE_BUDGET_FROZEN__ROLLBACK_DRYRUN_PASS__NO_WRITES__NO_DEPLOY__NO_PRODUCTION`

## Baseline preservado

Auth 228, Activation/readback/rollback, SKIP13, MultiAuth, HashConfig, DirectRunnerDEV, M4 y HR M6 siguen cerrados. No reabrir.

## Live user-admin y static gate

Se preservan:

```text
backend/contracts/c6-live-user-admin-v1.json
backend/runtime/hr-live-service/user-admin.mjs
backend/runtime/hr-live-service/server.mjs
backend/runtime/hr-live-service/package.json
backend/runtime/hr-live-service/Dockerfile
firebase.json
```

Static live-user-admin source gate continúa PASS terminal.

## Prewrite/provider source creado

```text
backend/contracts/c6-staff-repair-bootstrap-prewrite-v1.json
backend/config/c6-staff-provider-collision-targets-v1.json
backend/contracts/c6-staff-provider-snapshot-runner-v1.json
tools/qa/cxorbia-c6-staff-repair-bootstrap-provider-snapshot-readonly.mjs
tools/qa/cxorbia-c6-staff-provider-snapshot-request-gate.mjs
tools/qa/cxorbia-c6-staff-provider-snapshot-runner-report.mjs
```

Se reutilizó `.github/workflows/cxorbia-readonly-post-gates-runner.yml`; no se creó workflow/rama/PR nuevo.

## Incidente de harness cerrado

Primer request `...-01`: source preflight + request gate PASS, pero abort pre-provider por `NESTED_HEREDOC_DELIMITER_INDENTATION`.

```text
runId=31518115944
jobId=93868277963
providerScriptStarted=false
authListObservations=0
firestoreProviderReads=0
repositoryDelta=false
```

Request congelado como `HARNESS_ABORTED_PRE_PROVIDER_READS_0`. El root fix eliminó nested-heredoc y fue validado con request disabled en run `31518696584`, job `93870136421`, success. Source lock: `app/docs/SOURCE-LOCK-C6-STAFF-PROVIDER-SNAPSHOT-HARNESS-REPAIRED-20260811.md`.

## Provider snapshot terminal — PASS

Request corregido consumido una sola vez:

```text
requestId=c6-staff-repair-bootstrap-provider-snapshot-readonly-20260811-02-harness-rootfix
requestCommit=6632ecbdb8593126c094178154fca9b0913592af
runId=31518927950
jobId=93870945840
artifactId=9112228351
artifactDigest=sha256:044b9f90df50cb633b90cb87721e22c9a913804ba337227d95eaa1cdea198776
decision=PASS_C6_STAFF_REPAIR_BOOTSTRAP_PREWRITE
AuthPopulation=228
AuthListObservations=1
FirestoreDocumentReads=2
providerWrites=0
blockers=[]
```

Evidencia persistida: `app/docs/evidence/C6-STAFF-REPAIR-BOOTSTRAP-PROVIDER-SNAPSHOT-LATEST.json`.

Source lock: `app/docs/SOURCE-LOCK-C6-STAFF-PROVIDER-SNAPSHOT-PASS-20260811.md`.

## Adjudicación

```text
A super = REUSE_EXISTING_CANONICAL
  ownerBindingVerified=true
  roleUniquenessUsed=false
  claimsExact=true
  userDocAction=CREATE_CANONICAL_USER_DOC
B admin = CREATE_NEW_EPHEMERAL, collision=0
C ops   = CREATE_NEW_EPHEMERAL, collision=0
D ops   = CREATE_NEW_EPHEMERAL, collision=0
R4 Cliente canónico = preserved exact, mutation forbidden
```

Los ocho históricos focales siguen enabled. Futuro retiro: `DISABLE_ONLY_NO_DELETE` y solo después del canonical readback.

## Budget exacto congelado

```text
Auth creates=3
customClaims writes=3
Auth disables=8
Auth writes TOTAL=14
Auth deletes=0
userDocs=4
auditLogs=12
Firestore writes TOTAL=16
Firestore deletes=0
```

El Auth=14 actual fue recalculado desde el snapshot real; solo coincide numéricamente con el cap histórico superseded porque A es reusable y B/C/D requieren create+claims.

## Rollback dry-run

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

## UI / Claude

No se modificó `app/modules/configuracion.js` desde backend. El wiring localizado sigue pendiente después del repair/bootstrap y runtime autorizado.

## HR

M6 continúa COMPLETE: 2026-08 = 34 GT + 10 HN = 44.

## Métrica estable

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

## Siguiente acción exacta

`C6 STAFF REPAIR/BOOTSTRAP EXACT WRITE AUTHORIZATION`.

No requiere repetir provider snapshot. Cualquier ejecución debe respetar el budget congelado, create-before-retire, readback y rollback, sin deletes. Auth/Firestore writes, deploy, merge y producción siguen sin autorización.

## Seguridad

Provider snapshot consumió 1 Auth list y 2 Firestore document reads. Provider/Auth/Firestore/Rules/Storage/HR writes=0; deletes=0; deploy=0; merge=false; production=false.
