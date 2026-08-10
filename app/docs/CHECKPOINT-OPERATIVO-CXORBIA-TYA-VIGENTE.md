# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-10  
**Estado:** `C6_AUTH_PLAN_V4_PREWRITE_STOP_HASH_CONFIG_EMPTY__GET_SHAPE_REPAIR_PASS__ZERO_AUTH_WRITES__NO_SECOND_PROVIDER_ATTEMPT__NO_PRODUCTION`

## 1. Control

- repo: `paulaosoriof86/demoCXOrbia`;
- rama viva: `docs-tya-v6-v71-audit`;
- PR #7: draft/open/no merge;
- source lock vigente: `app/docs/SOURCE-LOCK-C6-AUTH-PLAN-V4-PREWRITE-HASH-CONFIG-EMPTY-STOP-RETRY-20260810.md`;
- evidencia terminal: `app/docs/evidence/C6-AUTH-PLAN-V4-PREWRITE-HASH-CONFIG-EMPTY-STOP-RETRY-20260810.json`;
- freeze rector: `backend/config/c6-shopper-auth-final-freeze-v4.json`;
- digest rector: `c0c31fadb88928f5fc0b8a19248188c8610e13362608f1bae3e267034f893ba4`;
- request v2: consumido/deshabilitado;
- allowedExecutions: 0;
- workflows one-shot/source-repair del bloque: retirados;
- producción: intacta;
- Auth ejecutado: no;
- write boundary alcanzado: no.

## 2. Identidad cerrada — no reabrir

```text
SKIP13=closed 13/13
multiAuthProfile=7cc28c78de9bfda01d14
keeper=4e6d26551d11db444bd0
duplicateAccessToRetire=9b2b7ca1bd72c1301d29
retirementMode=DISABLE_ONLY_NO_DELETE
targetLineage(ac93)=closed
updateUniversePlanV3=closed
```

No reconstruir identidad ni plan. El freeze v4 permanece inmutable.

## 3. Freeze v4 rector

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
rowsDigest=c0c31fadb88928f5fc0b8a19248188c8610e13362608f1bae3e267034f893ba4
AuthExecuted=false
```

## 4. Reparación source-only del HTTP 400 — PASS

Se agregó wrapper v2 para remover exclusivamente `?mask=hashConfig` del GET administrativo, preservando el ejecutor v1 y todos sus gates.

```text
sourceRepairHead=c6d4fdb83303a0293b1c6adce375b522d0c29db8
sourceRepairRunId=31402335372
decision=PASS_C6_HASH_CONFIG_SOURCE_REPAIR_STATIC_ZERO_WRITES
```

El gate verificó sintaxis, mismo freeze/digest, mismos conteos 118/9/8 y cero Auth writes antes del write boundary.

## 5. PREWRITE v2 — terminal

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

Pasaron:

```text
request-only gate=PASS
one-shot claim=PASS
self-test=PASS
identity circuit breaker=PASS
frozen plan artifact/digest=PASS
DEV credential load=PASS
GET request shape no-mask=executed
```

Terminal:

```text
decision=STOP_RETRY_C6_AUTH_PLAN_V4_PREWRITE
errorCode=HASH_CONFIG_EMPTY
errorFingerprint=e9514406bb62df47b26382a9
prewritePass=false
writeBoundaryEntered=false
snapshotProduced=false
AuthCreates=0
AuthUpdates=0
duplicateDisables=0
providerWriteCalls=0
runtimeSmokeExecuted=false
```

El error anterior `HASH_CONFIG_HTTP_400` quedó superado: el GET ya no se detuvo por forma de request. La ejecución falló después, al extraer la configuración de hash de la respuesta.

## 6. Causa raíz source-only nueva

El ejecutor heredado busca:

```text
body.hashConfig || body.hash_config
```

El esquema oficial `Config` devuelve `signIn` como objeto de nivel superior y `hashConfig` dentro de `SignInConfig`; por tanto, la ruta de extracción del ejecutor no coincide con el esquema oficial.

Clasificación:

```text
HASH_CONFIG_RESPONSE_PATH_MISMATCH
expectedSchemaPath=Config.signIn.hashConfig
currentParserPath=body.hashConfig|body.hash_config
```

Esto todavía no prueba por sí solo que el campo sensible haya sido retornado al principal. Antes de un nuevo provider PREWRITE debe validarse read-only/source-only la disponibilidad del permiso `firebaseauth.configs.getHashConfig` de la identidad exacta usada por el PREWRITE. No se realizó esa nueva lectura en este bloque porque la autorización ordenaba STOP_RETRY ante cualquier fallo.

## 7. Fail-close

```text
request=consumed/disabled
allowedExecutions=0
oneShotWorkflow=removed
sourceRepairWorkflow=removed
providerAttempts=1
secondProviderAttempt=false
writeBoundaryEntered=false
AuthExecuted=false
AuthCreates=0
AuthUpdates=0
duplicateDisables=0
providerWriteCalls=0
FirestoreWrites=0
membershipWrites=0
HRWrites=0
visitsWrites=0
certificationsWrites=0
liquidationsWrites=0
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

## 8. Documentación acumulativa

- `app/docs/SOURCE-LOCK-C6-AUTH-PLAN-V4-PREWRITE-HASH-CONFIG-EMPTY-STOP-RETRY-20260810.md`;
- `app/docs/evidence/C6-AUTH-PLAN-V4-PREWRITE-HASH-CONFIG-EMPTY-STOP-RETRY-20260810.json`;
- request v2 consumido: `backend/config/c6-auth-plan-v4-activation-dev-request-v2.json`;
- wrapper source-only: `tools/qa/cxorbia-c6-auth-plan-v4-activation-dev-v2.mjs`.

## 9. Próximo bloque exacto

Solo bajo autorización nueva:

`C6 AUTH V4 HASH CONFIG RESPONSE PATH + PERMISSION READINESS SOURCE-ONLY → SINGLE PREWRITE RETRY`.

Secuencia obligatoria:

1. corregir únicamente la extracción a `Config.signIn.hashConfig`, manteniendo exactamente freeze/digest v4;
2. validar read-only el permiso/disponibilidad de `firebaseauth.configs.getHashConfig` para el principal exacto, sin IAM writes;
3. source gate con cero writes;
4. request nuevo y no superpuesto;
5. máximo un PREWRITE provider;
6. solo con PREWRITE PASS: 8 rollback entries exactas + snapshot cifrado roundtrip antes del write boundary;
7. activación Auth DEV, readback, idempotencia y rollback dry-run;
8. smoke acumulativo Admin/Operaciones, Shopper y Cliente.

Ante cualquier fallo: STOP_RETRY sin segundo provider attempt.

## 10. Phase A preservada

Frontend acumulativo, Login, `CX.data`, HR histórico, shoppers, postulaciones, certificaciones, visitas, liquidaciones/pagos, Finanzas, Portal Cliente, Portal Shopper, Reservas, multi-tenant, multi-proyecto, sincronización HR/plataforma y Academia permanecen preservados.
