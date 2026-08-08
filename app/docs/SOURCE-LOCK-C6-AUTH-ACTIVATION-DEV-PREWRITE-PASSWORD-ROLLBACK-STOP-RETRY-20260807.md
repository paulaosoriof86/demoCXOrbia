# SOURCE LOCK — C6 AUTH ACTIVATION DEV PREWRITE STOP_RETRY

**Fecha:** 2026-08-07  
**Rama:** `docs-tya-v6-v71-audit`  
**PR:** `#7` draft/open/no merge  
**Estado:** `C6_AUTH_FINAL_PLAN_340_HOLD0_MATERIALIZED__AUTH_ACTIVATION_PREWRITE_STOP_RETRY_PASSWORD_ROLLBACK_HASH_SALT_UNAVAILABLE__ZERO_AUTH_WRITES__NO_PRODUCTION`

## 1. Autorización ejecutada

Se consumió el macrobloque C6 AUTH ACTIVATION DEV autorizado por Paula sobre `cxorbia-backend-dev`.

La adjudicación del tenant quedó registrada de forma definitiva para este plan:

```text
profileFingerprint=7cc28c78de9bfda01d14
keeper=4e6d26551d11db444bd0
duplicateAccessToRetire=9b2b7ca1bd72c1301d29
retirementMode=DISABLE_ONLY_NO_DELETE
```

La adjudicación no afirma superioridad técnica del keeper; rompe el empate simétrico por decisión del tenant.

## 2. Overlay final materializado

El workflow reconstruyó desde el artifact source-safe congelado la partición final y obtuvo PASS antes de tocar provider:

```text
rows=340
uniqueRows=340
CREATE_AUTH=81
UPDATE_AUTH=46
NO_OP=81
HOLD=0
PRESERVE_NO_AUTH=132
emailChanges=39
passwordChanges=14
claimsChanges=38
rowsDigest=68e26a5217957333d256f2cb547faf3e1eef74e2c789bfd85454d42dfd472dc3
```

Source lineage:

```text
sourceRun=31104541809
sourceArtifact=8968941587
sourceArtifactDigest=sha256:02e36c355b3f2d1c9d1e6f1be7fece93259251ddb0f981cdaac35f2262fcb264
sourcePlanDigest=acc93da842d1a5d3244327680f88539f0651cb101bae09dd231fd8b5008bea92
priorFreezeDigest=6060f406a33d4ba926c982871513f8e86ba2b10f44c2da00ab43bd2a409f721b
```

El manifest persistente es `backend/config/c6-shopper-auth-final-freeze-v2.json`; el plan completo source-safe quedó materializado en el artifact terminal del run.

## 3. PREWRITE fail-close

Evidencia terminal:

```text
requestId=c6-auth-activation-dev-20260807-01
requestCommit=b1be563ca9cc3b4931f380277a655f5e07c92ab3
runId=31213274602
jobId=92980855907
artifactId=9007517428
artifactDigest=sha256:cc0c5b60cb066930d6d1e55a3eb23fcf6ed3e99f98c14500a1901969ba7b25ee
decision=STOP_RETRY_C6_AUTH_ACTIVATION_DEV_PREWRITE
```

El prewrite detuvo la activación exactamente por:

```text
PASSWORD_ROLLBACK_HASH_SALT_UNAVAILABLE:ac93d90d9e41512acdcd
```

El perfil bloqueante pertenece al plan final como:

```text
primary=UPDATE_AUTH
changes.email=true
changes.password=true
changes.claims=true
```

La fuente provider V2 previa ya clasificaba su rollback de forma source-safe como `restore_email_disabled_and_claims_snapshot_password_compensation_only`. Bajo la autorización actual eso no es suficiente: Paula exigió rollback completo del password y STOP_RETRY si cualquier password carecía de ese rollback.

## 4. Límite seguro comprobado

El error ocurrió **antes** del write boundary:

```text
prewritePass=false
writeBoundaryEntered=false
AuthCreates=0
AuthUpdates=0
duplicateDisables=0
providerWriteCalls=0
FirestoreWrites=0
membershipWrites=0
HRWrites=0
RulesWrites=0
StorageWrites=0
CloudBuild=0
CloudRun=0
Hosting=0
realRollbackExecuted=false
merge=false
production=false
```

No se retiró acceso al duplicado, no se creó ninguna de las 81 cuentas y no se modificó ninguna de las 46 cuentas existentes.

## 5. Fail-close

```text
requestConsumeCommit=7930d3835a55dd92f3c48f1f7588aea4d332833d
workflowRemovalCommit=2f23b7cb129b745ed2367aa3da9f456eb5ceff2e
requestEnabled=false
requestConsumed=true
allowedExecutions=0
workflowPresent=false
secondProviderAttempt=0
```

No queda una autorización ejecutable ni un workflow one-shot latente.

## 6. Qué está cerrado y qué no

Cerrado:
- adjudicación final del tenant para el par multi-Auth;
- overlay final source-safe 340/340;
- `HOLD=0` de identidad;
- digest y no superposición;
- fail-close antes de write.

No cerrado:
- rollback completo para al menos uno de los 14 password changes;
- snapshot prewrite completo;
- ejecución Auth;
- readback postwrite;
- rollback dry-run postwrite;
- smoke multirrol;
- cutover/promoción.

## 7. Siguiente gate exacto

No repetir provider/Auth reads ni ejecutar Auth bajo este request.

El siguiente bloque debe ser **source-only** para resolver de raíz el rollback de password: determinar si el hash/salt previo del profile fingerprint `ac93d90d9e41512acdcd` puede reconstruirse de una fuente técnica ya disponible y cifrada/versionada, o si el contrato debe tratar ese password mediante una estrategia reversible distinta aprobada. Solo después de PASS source-only podrá solicitarse un request provider nuevo.

Frontend, `CX.data`, HR, shoppers, certificaciones, visitas, liquidaciones, Finanzas, portales, Reservas, multi-tenant y multi-proyecto permanecen sin cambios.
