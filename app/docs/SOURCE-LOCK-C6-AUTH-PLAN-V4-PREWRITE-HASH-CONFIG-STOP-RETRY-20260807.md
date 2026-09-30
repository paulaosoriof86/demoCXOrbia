# SOURCE LOCK — C6 AUTH PLAN V4 PREWRITE HASH-CONFIG STOP_RETRY

**Fecha:** 2026-08-07  
**Estado:** `C6_AUTH_PLAN_V4_PREWRITE_STOP_HASH_CONFIG_REQUEST_SHAPE__ZERO_AUTH_WRITES__NO_SECOND_PROVIDER_ATTEMPT__NO_PRODUCTION`

## 1. Carril

- repo: `paulaosoriof86/demoCXOrbia`;
- rama viva: `docs-tya-v6-v71-audit`;
- PR #7: abierto, draft, sin merge;
- provider DEV: `cxorbia-backend-dev`;
- freeze rector: `backend/config/c6-shopper-auth-final-freeze-v4.json`;
- digest rector: `c0c31fadb88928f5fc0b8a19248188c8610e13362608f1bae3e267034f893ba4`;
- producción: intacta.

## 2. Autorización consumida

Se autorizó un único macrobloque `C6 AUTH PLAN V4 PREWRITE + ACTIVATION DEV` con máximo un provider attempt. El request ejecutado fue:

```text
requestId=c6-auth-plan-v4-activation-dev-20260807-01
requestCommit=d5453fceefdee1bd026e059cdb6187486d75a918
runId=31240353678
jobId=93060168241
artifactId=9016808823
artifactDigest=sha256:1f4a22df9448b873838f3de6480bcaa954916cf148c40c5ec9f2cdd01e9dec4f
```

El request quedó consumido/deshabilitado y su workflow one-shot fue retirado. No queda autorización latente.

## 3. Freeze v4 preservado

El bloque consumió exclusivamente el universo v4:

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

No se reabrieron las 45 `UPDATE_AUTH` del plan v3, SKIP13, multi-Auth ni lineage `ac93...`.

## 4. PREWRITE terminal

La ejecución pasó request gate, one-shot claim, self-test, circuit-breaker y artifact gate. Cruzó provider una sola vez y terminó antes del write boundary con:

```text
decision=STOP_RETRY_C6_AUTH_PLAN_V4_PREWRITE
errorCode=HASH_CONFIG_HTTP_400
errorFingerprint=9a3b817f725d9b53b23e097b
providerAttempts=1
secondProviderAttempt=false
prewritePass=false
writeBoundaryEntered=false
```

El error ocurrió en la lectura administrativa de configuración de hash, antes de inspeccionar material `passwordHash/passwordSalt`, antes de crear snapshot cifrado y antes de cualquier Auth write.

Por tanto:

```text
passwordMaterialInspectedRows=0
passwordHashReads=0
passwordSaltReads=0
encryptedSnapshotProduced=false
AuthCreates=0
AuthUpdates=0
duplicateDisables=0
providerWriteCalls=0
```

## 5. Gates de control-flow alcanzados antes del error

La posición terminal `HASH_CONFIG_HTTP_400` en la herramienta ocurre únicamente después de completar los gates previos del control-flow. Esto es evidencia de orden de ejecución, no contadores runtime exportados de forma independiente:

- freeze/plan v4 y digest exactos;
- población Auth inicial 110;
- 340 shoppers;
- crosswalk de credenciales 101/8;
- universo de 127 targets CREATE/UPDATE procesado antes de `fetchHashConfig`;
- CREATE exige candidateCount=0 y cero target-email collision;
- UPDATE exige candidateCount=1;
- global UID/candidate uniqueness para principals seleccionados;
- target-email uniqueness y collision checks;
- flags email/claims recalculados;
- cardinalidad final 118 CREATE / 9 UPDATE / 8 password-change;
- probes de compatibilidad de contraseña de las 9 UPDATE consistentes con sus flags;
- par multi-Auth adjudicado resuelto como keeper + retire, ambos habilitados antes del write.

Esto no autoriza inferir un PASS PREWRITE: el PREWRITE quedó formalmente `pass=false` porque faltó la prueba obligatoria de rollback de contraseña y snapshot.

## 6. Causa raíz técnica del STOP

La herramienta solicitó configuración administrativa con esta forma:

```text
GET /admin/v2/projects/{projectId}/config?mask=hashConfig
```

La referencia oficial de Identity Platform define `projects.getConfig` como:

```text
GET /admin/v2/{name=projects/*/config}
```

sin query `mask` documentado y con body vacío. `updateMask` corresponde al método PATCH `projects.updateConfig`, no al GET.

Clasificación source-only:

```text
GET_CONFIG_QUERY_MASK_UNSUPPORTED_OR_MALFORMED_REQUEST_SHAPE
```

El HTTP 400 es consistente con ese defecto de forma del request. No se hizo provider re-test, por lo que esta clasificación se registra como diagnóstico de causa raíz source-only y no como PASS runtime del fix.

## 7. Verificador source-safe corregido

El nuevo verifier estructural pasó en el mismo run y ya no confunde llaves numéricas o booleanas como `emailChanges`/`subchangeCounts.email` con PII. Confirmó en la evidencia source-safe:

```text
rawUidExported=false
rawEmailExported=false
rawShopperIdExported=false
rawClaimsExported=false
rawPasswordExported=false
rawPasswordHashExported=false
rawPasswordSaltExported=false
```

## 8. Fail-close

```text
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

## 9. Phase A preservada

Se preservan frontend acumulativo, Login, `CX.data`, HR histórico, shoppers, postulaciones, certificaciones, visitas, liquidaciones/pagos, Finanzas, Portal Cliente, Portal Shopper, Reservas, multi-tenant, multi-proyecto, sincronización HR/plataforma y Academia.

## 10. Siguiente bloque exacto

Se requiere autorización nueva. El siguiente bloque no debe revalidar identidades ni reconstruir el plan v4. Debe:

1. corregir source-only `fetchHashConfig` para consumir el GET oficial sin `mask`;
2. validar estáticamente que solo se extraiga `hashConfig` de la respuesta y que la corrección no habilite writes;
3. crear un request nuevo, no superpuesto, para un único provider PREWRITE v4;
4. mantener el mismo freeze/digest y los gates 118 CREATE / 9 UPDATE / 8 password rollback;
5. solo con PREWRITE PASS y snapshot cifrado roundtrip entrar al Auth write boundary;
6. si vuelve a fallar PREWRITE, STOP_RETRY sin Auth writes ni segundo intento.

No reabrir plan v3, SKIP13, multi-Auth ni lineage `ac93...`.
