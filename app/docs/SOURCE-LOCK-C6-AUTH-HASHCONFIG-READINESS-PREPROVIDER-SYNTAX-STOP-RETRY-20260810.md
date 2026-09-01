# SOURCE LOCK — C6 AUTH V4 HASHCONFIG READINESS PRE-PROVIDER SYNTAX STOP_RETRY

**Fecha:** 2026-08-10  
**Repositorio:** `paulaosoriof86/demoCXOrbia`  
**Rama viva:** `docs-tya-v6-v71-audit`  
**PR:** #7 draft/open/no merge  
**Estado:** `C6_AUTH_HASHCONFIG_READINESS_STOP_PRE_PROVIDER_SYNTAX__ZERO_PROVIDER_READS__ZERO_AUTH_WRITES__NO_REQUEST_EMITTED__NO_PRODUCTION`

## 1. Autorización y alcance

Autorización vigente consumida para un único macrobloque C6 AUTH V4 de cierre de `HASH_CONFIG_EMPTY`, con secuencia obligatoria:

1. corrección source-only de extracción a `Config.signIn.hashConfig`;
2. validación read-only de `firebaseauth.configs.getHashConfig` y material de hash para el principal exacto;
3. solo con ambos gates PASS, request nuevo y máximo un PREWRITE provider;
4. solo con PREWRITE PASS, 8 rollback entries exactas + snapshot cifrado roundtrip antes del write boundary;
5. activación Auth DEV, readback, idempotencia, rollback dry-run y smoke acumulativo Admin/Operaciones, Shopper y Cliente;
6. ante cualquier fallo: `STOP_RETRY` sin segundo provider attempt.

## 2. Freeze rector preservado

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

No se reabrió plan v3, SKIP13, multi-Auth, lineage `ac93...` ni reconstrucción de identidad.

## 3. Preparación source-only creada

Se prepararon temporalmente:

- `tools/qa/cxorbia-c6-auth-plan-v4-activation-dev-v3.mjs`;
- `tools/qa/cxorbia-c6-auth-hashconfig-readiness-v1.mjs`;
- `.github/workflows/cxorbia-c6-auth-hashconfig-readiness-v1.yml`.

Objetivo técnico:

- preservar el GET sin `mask`;
- reemplazar exclusivamente la extracción heredada `body.hashConfig || body.hash_config` por `body.signIn.hashConfig`;
- verificar estáticamente cero writes antes del write boundary;
- después, y solo después, cargar el principal exacto y hacer las lecturas read-only autorizadas.

## 4. Ejecución observable y fallo

```text
sourceGateCommit=4c5d91c34401e8cc239594be7b907966e133b6cb
runId=31415767771
jobId=93544290309
step=Static response-path repair and zero-write gate
```

El gate falló en `node --check` antes de cargar credenciales o tocar proveedor:

```text
classification=PRE_PROVIDER_WRAPPER_SYNTAX_ERROR
error=SyntaxError: missing ) after argument list
location=tools/qa/cxorbia-c6-auth-plan-v4-activation-dev-v3.mjs
cause=quote/backtick mismatch in static marker assertion for the Identity Toolkit config resource string
```

El error está limitado al harness v3 recién creado. No contradice el diagnóstico rector de `HASH_CONFIG_RESPONSE_PATH_MISMATCH`, no invalida el freeze v4 y no aporta evidencia para reabrir identidades.

## 5. STOP_RETRY efectivo

Por contrato se detuvo el macrobloque inmediatamente. Los pasos siguientes quedaron `skipped`:

```text
Load exact PREWRITE DEV principal privately=SKIPPED
Read-only effective permission and material readiness=SKIPPED
Verify source-safe readiness evidence=SKIPPED
```

Por tanto:

```text
providerReads=0
iamPermissionReads=0
identityToolkitConfigReads=0
providerPrewriteAttempts=0
secondProviderAttempt=false
requestV3Emitted=false
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

## 6. Fail-close y rollback del harness

Se retiró toda la preparación temporal para impedir ejecución latente o reintento accidental:

```text
workflowRemovalCommit=223677b589cf77607672bb4058c6ea6654ef9183
v3WrapperRemovalCommit=fa1b42bcaa2d2139f2460d7984153bb7d727cace
readinessProbeRemovalCommit=b6afe84cb67e8b207fe724d428a0afe7f403b1c8
```

No existe request nuevo emitido ni workflow ejecutable de este bloque.

## 7. Causa raíz del bucle en este intento

La causa del STOP no fue proveedor, permisos, datos ni Auth. Fue un defecto sintáctico introducido en el harness de validación source-only antes de cualquier acceso externo. La prevención para el próximo bloque debe ser explícita:

1. construir la corrección source-only;
2. ejecutar primero un gate de sintaxis/offline sin credenciales ni provider;
3. solo con ese PASS habilitar la lectura IAM/config;
4. solo con readiness PASS emitir el request PREWRITE.

## 8. Próximo bloque exacto

Solo bajo nueva autorización:

`C6 AUTH V4 HASHCONFIG HARNESS SYNTAX ROOTFIX SOURCE-ONLY → READINESS READ-ONLY → SINGLE PREWRITE`.

Debe corregir únicamente el harness sintáctico, validar offline la sustitución exacta a `Config.signIn.hashConfig`, mantener el digest v4 intacto y conservar el mismo circuito de seguridad. Si el source gate vuelve a fallar, `STOP_RETRY` antes de credenciales/proveedor.

## 9. Clasificación

- **Reusable CXOrbia:** patrón de gate offline previo a cualquier provider read/write y fail-close sin autorización latente.
- **Exclusivo cliente:** freeze Auth TyA v4 de 340 perfiles y digest rector.
- **Claude/prototipo:** sin impacto frontend; no modificar `/app/modules` ni `/app/core`.
- **Academia:** documentar la diferencia entre fallo de harness pre-provider y fallo real de proveedor.
- **Sin impacto Claude:** HR histórico, visitas, certificaciones, liquidaciones, Finanzas, Portal Cliente, Portal Shopper, Reservas y sincronización permanecen preservados.
