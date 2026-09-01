# SOURCE LOCK — C6 AUTH PLAN V4 PREWRITE HASH_CONFIG_EMPTY STOP_RETRY

**Fecha:** 2026-08-10  
**Repositorio:** `paulaosoriof86/demoCXOrbia`  
**Rama viva:** `docs-tya-v6-v71-audit`  
**PR:** #7 draft/open/no merge  
**Estado:** `C6_AUTH_PLAN_V4_PREWRITE_STOP_HASH_CONFIG_EMPTY__GET_SHAPE_REPAIR_PASS__ZERO_AUTH_WRITES__NO_SECOND_PROVIDER_ATTEMPT__NO_PRODUCTION`

## 1. Freeze rector preservado

```text
rows=340
uniqueRows=340
CREATE_AUTH=118
UPDATE_AUTH=9
NO_OP=81
HOLD=0
PRESERVE_NO_AUTH=132
emailChanges=2
passwordChanges=8
claimsChanges=1
expectedAuthUsersBefore=110
expectedAuthUsersAfter=228
digest=c0c31fadb88928f5fc0b8a19248188c8610e13362608f1bae3e267034f893ba4
```

No reabrir SKIP13, multi-Auth, lineage `ac93...`, universo UPDATE del plan v3 ni reconstrucción de identidad.

## 2. Reparación source-only ejecutada

Se corrigió exclusivamente la forma del GET administrativo removiendo el query inválido `?mask=hashConfig`, preservando el resto del ejecutor v1 mediante wrapper v2.

Evidencia source-only observable:

```text
sourceRepairHead=c6d4fdb83303a0293b1c6adce375b522d0c29db8
sourceRepairRunId=31402335372
decision=PASS_C6_HASH_CONFIG_SOURCE_REPAIR_STATIC_ZERO_WRITES
```

El gate verificó:

- GET a `projects/*/config` sin `mask`;
- mismo freeze/digest v4;
- 118 CREATE, 9 UPDATE, 0 HOLD y 8 cambios de password;
- cero llamadas Auth write antes de `state.writeBoundaryEntered=true`;
- sintaxis y self-test PASS.

## 3. Request único consumido

```text
requestId=c6-auth-plan-v4-activation-dev-20260810-02
requestCommit=f0f655608f6fe53a976096f53d64e9c95670ec64
runId=31402395938
jobId=93500386091
artifactId=9068194459
artifactDigest=sha256:a469cf5d2d6607e8a205af52cbef78042a814886d7be5229480cfadce05013a9
providerAttempts=1
secondProviderAttempt=false
```

Pasaron request-only gate, claim one-shot, self-test, circuit breaker, freeze/digest y descarga del artefacto v4. Se cargó la credencial DEV privada y se consumió el único PREWRITE autorizado.

## 4. Resultado terminal

```text
decision=STOP_RETRY_C6_AUTH_PLAN_V4_PREWRITE
errorCode=HASH_CONFIG_EMPTY
errorFingerprint=e9514406bb62df47b26382a9
prewritePass=false
writeBoundaryEntered=false
AuthCreates=0
AuthUpdates=0
duplicateDisables=0
providerWriteCalls=0
snapshotProduced=false
runtimeSmokeExecuted=false
```

El GET ya no falló con HTTP 400. La ejecución avanzó hasta validar la respuesta y se detuvo porque el parser no encontró `hashConfig` en la ubicación que esperaba.

## 5. Diagnóstico source-only posterior al STOP

El ejecutor heredado v1 extrae:

```text
body.hashConfig || body.hash_config
```

La referencia oficial de Identity Platform modela la respuesta `Config` con `signIn` como objeto de nivel superior y `hashConfig` dentro de `SignInConfig`. Por tanto, existe un defecto source-only objetivo en la ruta de extracción: el código no inspecciona `body.signIn.hashConfig`.

Este diagnóstico NO autoriza un segundo provider attempt. Además, antes de un nuevo provider PREWRITE deberá comprobarse source-only/read-only que la identidad usada tenga el permiso necesario para recibir material de hash cuando corresponda; la ejecución actual no permite distinguir por sí sola entre campo anidado omitido por parser y campo sensible omitido por permisos.

## 6. Fail-close

```text
request=consumed/disabled
allowedExecutions=0
oneShotWorkflow=removed
sourceRepairWorkflow=removed
providerAttempts=1
secondProviderAttempt=false
AuthExecuted=false
AuthWrites=0
FirestoreWrites=0
membershipWrites=0
HRWrites=0
RulesWrites=0
StorageWrites=0
CloudBuild=0
CloudRun=0
Hosting=0
Make=0
Gemini=0
payments=0
merge=false
production=false
```

No se ejecutó smoke acumulativo porque estaba condicionado a `PASS_C6_AUTH_PLAN_V4_ACTIVATION_DEV`.

## 7. Próximo bloque exacto

Solo con nueva autorización:

`C6 AUTH V4 HASH CONFIG RESPONSE PATH + PERMISSION READINESS SOURCE-ONLY → SINGLE PREWRITE RETRY`

Debe:

1. corregir source-only la extracción para el esquema oficial `Config.signIn.hashConfig` sin modificar identidad ni freeze;
2. validar read-only la disponibilidad/permiso de `firebaseauth.configs.getHashConfig` para la identidad exacta del PREWRITE, sin IAM writes;
3. conservar el digest v4 exacto;
4. crear un request nuevo y no superpuesto;
5. ejecutar como máximo un PREWRITE provider;
6. solo con PREWRITE PASS y exactamente 8 rollback entries + snapshot cifrado roundtrip cruzar el Auth write boundary;
7. después ejecutar readback, idempotencia, rollback dry-run y smoke acumulativo Admin/Operaciones, Shopper y Cliente.

Ante cualquier fallo: STOP_RETRY, sin segundo provider attempt.

## 8. Phase A preservada

Frontend acumulativo, Login, `CX.data`, HR histórico, shoppers, postulaciones, certificaciones, visitas, liquidaciones/pagos, Finanzas, Portal Cliente, Portal Shopper, Reservas, multi-tenant, multi-proyecto, sincronización HR/plataforma y Academia permanecen preservados.
