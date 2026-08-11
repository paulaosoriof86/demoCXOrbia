# CAMBIOS-BACKEND.md

**Última actualización:** 2026-08-11  
**Fuente operativa vigente:** `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`.

## Estado actual

`PASS_C6_STAFF_REPAIR_BOOTSTRAP_PROVIDER_SNAPSHOT__AUTH_228__A_REUSE_BOUND__BCD_CREATE__R4_PRESERVED__WRITE_BUDGET_FROZEN__ROLLBACK_DRYRUN_PASS__NO_WRITES__NO_DEPLOY__NO_PRODUCTION`

## Baseline preservado

Auth 228, Activation/readback/rollback, SKIP13, MultiAuth, HashConfig, DirectRunnerDEV, M4 y HR M6 siguen cerrados. No reabrir.

## Live user-admin y static gate

Se preservan contrato, handler, routing/packaging y static live-user-admin source gate PASS terminal. No se modificó UI desde backend.

## Provider snapshot terminal — PASS

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

Evidencia: `app/docs/evidence/C6-STAFF-REPAIR-BOOTSTRAP-PROVIDER-SNAPSHOT-LATEST.json`.
Source lock: `app/docs/SOURCE-LOCK-C6-STAFF-PROVIDER-SNAPSHOT-PASS-20260811.md`.

El request quedó disabled/consumed. No repetir provider snapshot.

## Adjudicación

```text
A super = REUSE_EXISTING_CANONICAL; owner-bound; roleUniquenessUsed=false; claims exact
B admin = CREATE_NEW_EPHEMERAL; collision=0
C ops   = CREATE_NEW_EPHEMERAL; collision=0
D ops   = CREATE_NEW_EPHEMERAL; collision=0
R4 Cliente canónico = preserved exact; mutation forbidden
```

Los ocho históricos focales siguen enabled. Retiro futuro: `DISABLE_ONLY_NO_DELETE` después de canonical readback.

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
rollbackDryRun=PASS
uniqueInverseActions=12
```

El Auth=14 actual fue recalculado desde el snapshot real; solo coincide numéricamente con el cap histórico superseded porque A se reutiliza y B/C/D se crean.

## Incidente de harness cerrado

El request `...-01` abortó antes de provider por `NESTED_HEREDOC_DELIMITER_INDENTATION`: provider reads efectivos 0. Se corrigió el mismo workflow con normalizador shell-safe y luego se consumió la única observación efectiva en el request `...-02`. No hubo segundo provider read.

## HR / Claude / Academia

M6 sigue COMPLETE (34 GT + 10 HN = 44). No se tocó `app/modules/configuracion.js`; wiring Usuarios & Permisos sigue localizado para después del repair/bootstrap. Impacto Academia actualizado como conceptual/no bloqueante.

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

No requiere repetir provider snapshot. Cualquier ejecución debe respetar budget Auth=14 / Firestore=16, create-before-retire, readback, rollback y cero deletes. Auth/Firestore writes, deploy, merge y producción siguen sin autorización.

## Seguridad

Provider snapshot consumió 1 Auth list y 2 Firestore reads. Provider/Auth/Firestore/Rules/Storage/HR writes=0; deletes=0; deploy=0; merge=false; production=false.
