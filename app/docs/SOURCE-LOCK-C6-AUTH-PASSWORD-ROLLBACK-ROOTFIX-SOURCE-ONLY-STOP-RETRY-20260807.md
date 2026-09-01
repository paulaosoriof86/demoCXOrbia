# SOURCE LOCK — C6 AUTH PASSWORD ROLLBACK ROOT FIX SOURCE-ONLY — STOP_RETRY

**Fecha:** 2026-08-07  
**Estado:** `C6_AUTH_FINAL_PLAN_340_HOLD0__PASSWORD_ROLLBACK_ROOTFIX_SOURCE_ONLY_STOP_RETRY_TARGET_PRIOR_PASSWORD_NOT_PROVEN__ZERO_PROVIDER_READS_WRITES__NO_PRODUCTION`

## 1. Control de carril

- repo: `paulaosoriof86/demoCXOrbia`;
- rama viva: `docs-tya-v6-v71-audit`;
- PR #7: abierto, draft, sin merge;
- target Firebase: `cxorbia-backend-dev`;
- profile fingerprint único del bloque: `ac93d90d9e41512acdcd`;
- provider/Auth/Firestore/HR reads del bloque: `0`;
- provider/Auth/Firestore/HR writes del bloque: `0`;
- deploys: `0`;
- producción: intacta.

## 2. Autorización aplicada

El bloque estuvo limitado a fuentes técnicas cifradas/versionadas ya existentes y lineage congelada. Solo podía modificarse el contrato PREWRITE si se demostraba reversibilidad exacta del password previo. Al no demostrarse, el contrato permaneció sin cambios.

## 3. Plan Auth que se preserva

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
AuthExecuted=false
```

No se reabrió SKIP13 ni la adjudicación multi-Auth.

## 4. Fuentes técnicas verificadas

El gate source-only verificó:

```text
encryptedCredentialBundlePresent=true
encryptedPrivateKeyEnvelopePresent=true
keyFingerprintMatch=true
legacyImportAlgorithm=SHA256
legacyImportRounds=1
legacyImportPerUserSaltField=false
saltlessLegacyImportIsValidSourceContract=true
profileExtraEncryptedEnvelopePresent=false
```

El importador histórico de credenciales usa `passwordHash` SHA256/1 sin campo per-user `passwordSalt`. Por tanto, la ausencia de salt **puede ser válida para ese lineage histórico** y no debe confundirse automáticamente con ausencia de hash.

Sin embargo, esa propiedad global no demuestra que el password **actual y previo al write** del target `ac93d90d9e41512acdcd` sea exactamente ese hash legacy.

## 5. Lineage específica del target

El source artifact rector `31104541809 / 8968941587` confirmó:

```text
target profile=ac93d90d9e41512acdcd
primary=UPDATE_AUTH
changes.email=true
changes.password=true
changes.claims=true
sourceSafeSurnameBasis=multi_source_full_name_consensus
suffixApplied=true
sameVisibleBaseLoginProfiles=2
peerUniqueTechnicalHolderProven=true
priorRollbackClassification=restore_email_disabled_and_claims_snapshot_password_compensation_only
```

La fuente cifrada legacy no contiene, dentro de la evidencia source-safe disponible, una vinculación demostrada entre el estado password actual de este target y un hash recuperable exacto. Tampoco existe snapshot PREWRITE previo: el intento Auth anterior se detuvo antes del write boundary.

## 6. Self-test hermético

```text
PASS_HERMETIC_SELFTEST
SHA256 rounds=1
saltlessSyntheticImport=true
AES-256-GCM roundtrip=true
```

Esto valida la mecánica criptográfica y la semántica source-contract, pero no inventa una vinculación target↔hash que las fuentes no contienen.

## 7. Resultado terminal

```text
requestId=c6-auth-password-rollback-rootfix-source-only-20260807-02
requestCommit=6253ae7a3473146af3d26962abf03d79954408dd
runId=31217732890
jobId=92995079565
artifactId=9009157363
artifactDigest=sha256:ef121dafbd716b6d9e074a285e0845499313d4b52e5521864cf5a89b4b94505b
decision=STOP_RETRY_C6_AUTH_PASSWORD_ROLLBACK_ROOT_FIX_SOURCE_ONLY_TARGET_PRIOR_PASSWORD_NOT_PROVEN
contractMutationAllowed=false
exactRollbackReconstructible=false
```

El run terminó técnicamente `success`; `STOP_RETRY` es la decisión contractual correcta de la evaluación source-only.

## 8. Incidencia de harness dentro del mismo bloque

El primer intento source-only:

```text
runId=31217471430
jobId=92994249732
result=SOURCE_REFERENCE_ERROR_BEFORE_DECISION
error=ReferenceError: currentPriorPasswordStateProven is not defined
```

Se detuvo por un error de referencia del harness antes de producir decisión o artifact. Se comprobó `providerReads=0`, `providerWrites=0`, `authWrites=0` y `contractMutation=false`. El request v1 quedó consumido; se corrigió el typo y se ejecutó un request v2 nuevo, trazable, dentro del mismo bloque source-only autorizado.

## 9. Contrato PREWRITE preservado

`backend/contracts/c6-auth-activation-dev-v1.json` permanece sin modificación funcional, blob SHA:

```text
2e4457cfc8e847143bbebab879dbed2d816fa43a
```

Sigue vigente el hard stop de rollback completo. No se relajó el requisito ni se habilitó compensación silenciosa.

## 10. Fail-close

```text
workflowRemovalCommit=8adb6837efc18af6ab7564d75e222e0d66d2a5b7
requestV1Consumed=true
requestV1AllowedExecutions=0
requestV2Consumed=true
requestV2AllowedExecutions=0
workflowPresent=false
```

No queda request ejecutable ni workflow one-shot latente.

## 11. Alternativa mínima clasificada

El siguiente bloque, si Paula lo autoriza, debe ser **un único provider read-only focal** para este profile fingerprint, sin writes:

```text
ONE_TARGET_PROVIDER_READONLY_PASSWORD_ROLLBACK_SNAPSHOT_REQUIRED
```

Debe distinguir explícitamente:

1. `passwordHash` actual disponible o no;
2. `passwordSalt` vacío/nulo válido versus campo no expuesto;
3. algoritmo/configuración efectiva necesaria para restaurar ese hash exacto;
4. capacidad de cifrar el snapshot antes de cualquier futuro Auth write.

Si aun con permiso de exportación/hash config el hash actual no puede obtenerse, no se permite inferirlo: se requerirá una decisión explícita separada del tenant para relajar el rollback exacto de **ese único target**.

## 12. Estado seguro

```text
FinalAuthPlan=340/340 HOLD0
AuthExecuted=false
providerReadsThisBlock=0
AuthReadsThisBlock=0
FirestoreReadsThisBlock=0
HRReadsThisBlock=0
providerWrites=0
AuthWrites=0
FirestoreWrites=0
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

## 13. Clasificación

- **Reusable CXOrbia:** gate de reversibilidad exacta y distinción `salt vacío` vs `salt no disponible`.
- **Exclusivo cliente:** fingerprint target y lineage TyA.
- **Claude/prototipo:** sin cambios frontend.
- **Academia:** documentar el patrón de fail-close y reversibilidad verificable.
- **Sin impacto Claude:** ejecución provider y Auth continúan bloqueadas.
