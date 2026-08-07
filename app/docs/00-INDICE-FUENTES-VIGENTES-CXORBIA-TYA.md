# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-07  
**Estado:** ACTIVO Y RECONCILIADO  
**Estado vivo:** `C6_AUTH_FINAL_PLAN_340_HOLD0__ONE_TARGET_PASSWORD_ROLLBACK_SNAPSHOT_STOP_RETRY_TARGET_AUTH_UNRESOLVED_BY_FROZEN_CLAIMS__ONE_PROVIDER_READ__ZERO_WRITES__NO_PRODUCTION`

## 1. Orden de prevalencia

1. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `app/docs/SOURCE-LOCK-C6-AUTH-ONE-TARGET-PASSWORD-ROLLBACK-SNAPSHOT-READONLY-STOP-RETRY-20260807.md`;
3. `app/docs/evidence/C6-AUTH-ONE-TARGET-PASSWORD-ROLLBACK-SNAPSHOT-READONLY-STOP-RETRY-20260807.json`;
4. `backend/config/c6-auth-one-target-password-rollback-snapshot-readonly-request-v1.json` — consumido/deshabilitado;
5. `tools/qa/cxorbia-c6-auth-one-target-password-rollback-snapshot-readonly.mjs`;
6. `app/docs/SOURCE-LOCK-C6-AUTH-PASSWORD-ROLLBACK-ROOTFIX-SOURCE-ONLY-STOP-RETRY-20260807.md`;
7. `app/docs/evidence/C6-AUTH-PASSWORD-ROLLBACK-ROOTFIX-SOURCE-ONLY-STOP-RETRY-20260807.json`;
8. `tools/qa/cxorbia-c6-auth-password-rollback-rootfix-source-only.mjs`;
9. `backend/config/c6-auth-password-rollback-rootfix-source-only-request-v2.json` — consumido/deshabilitado;
10. `backend/config/c6-auth-password-rollback-rootfix-source-only-request-v1.json` — consumido tras error source-only, cero provider;
11. `app/docs/SOURCE-LOCK-C6-AUTH-ACTIVATION-DEV-PREWRITE-PASSWORD-ROLLBACK-STOP-RETRY-20260807.md`;
12. `app/docs/evidence/C6-AUTH-ACTIVATION-DEV-PREWRITE-STOP-RETRY-20260807.json`;
13. `backend/config/c6-shopper-auth-final-freeze-v2.json`;
14. `backend/contracts/c6-auth-activation-dev-v1.json` — preservado, no relajado;
15. `tools/qa/cxorbia-c6-auth-activation-dev.mjs`;
16. `backend/config/c6-auth-activation-dev-request-v1.json` — consumido/deshabilitado;
17. `app/docs/SOURCE-LOCK-C6-MULTI-AUTH-FINAL-DISCRIMINATOR-TENANT-ADJUDICATION-STOP-RETRY-20260807.md`;
18. `backend/config/c6-skip13-access-reconciliation-overlay-v1.json`;
19. `backend/contracts/c6-skip13-auth-access-adjudication-v2.json`;
20. `app/docs/SOURCE-LOCK-C6-DIRECT-RUNNER-DEV-DEPLOY-PASS-20260807.md`;
21. `backend/config/c6-shopper-auth-final-freeze-v1.json` — lineage anterior;
22. `backend/config/c6-shopper-auth-snapshot-rollback-manifest-v1.json`;
23. `backend/config/c6-accumulative-multirole-smoke-matrix-v1.json`;
24. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
25. addenda vigentes y PR #7.

## 2. Direct runner DEV

```text
DirectRunnerDEV=PASS
service=cxorbia-c6-direct-runner-dev
revision=cxorbia-c6-direct-runner-dev-00001-2vz
runtimeIsolation=PASS
providerBoundaryEnabled=false
```

## 3. Identidad Shopper y plan Auth cerrados

SKIP13 quedó resuelto `13/13`. El par multi-Auth simétrico permanece adjudicado por decisión del tenant:

```text
profileFingerprint=7cc28c78de9bfda01d14
keeper=4e6d26551d11db444bd0
duplicateAccessToRetire=9b2b7ca1bd72c1301d29
retirementMode=DISABLE_ONLY_NO_DELETE
```

Plan Auth final preservado:

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

## 4. PREWRITE Auth anterior

```text
runId=31213274602
artifactId=9007517428
decision=STOP_RETRY_C6_AUTH_ACTIVATION_DEV_PREWRITE
blocker=PASSWORD_ROLLBACK_HASH_SALT_UNAVAILABLE:ac93d90d9e41512acdcd
writeBoundaryEntered=false
providerWriteCalls=0
```

## 5. Password rollback root fix source-only

El bloque source-only estableció:

```text
legacyImportAlgorithm=SHA256
legacyImportRounds=1
legacyImportPerUserSaltField=false
saltlessLegacyImportIsValidSourceContract=true
PASS_HERMETIC_SELFTEST
sourceSafeTargetCredentialBindingProven=false
currentPriorPasswordStateProven=false
exactRollbackReconstructible=false
contractMutationAllowed=false
```

Un `passwordSalt` vacío puede ser legítimo en el lineage histórico SHA256/1; aun así, la fuente source-only no podía demostrar el password actual del target.

Ejecución terminal:

```text
runId=31217732890
jobId=92995079565
artifactId=9009157363
artifactDigest=sha256:ef121dafbd716b6d9e074a285e0845499313d4b52e5521864cf5a89b4b94505b
decision=STOP_RETRY_C6_AUTH_PASSWORD_ROLLBACK_ROOT_FIX_SOURCE_ONLY_TARGET_PRIOR_PASSWORD_NOT_PROVEN
```

## 6. One-target password rollback snapshot read-only

Se ejecutó la autorización focal vigente con un presupuesto máximo de una página Auth y una lectura de hash config. La resolución debía ocurrir antes de inspeccionar hash/salt.

Resultado:

```text
requestId=c6-auth-one-target-password-rollback-snapshot-readonly-20260807-01
requestCommit=7c020b03b2ed113ac05c0ed1a626af85d6840f96
runId=31219919183
jobId=93001987641
artifactId=9009957173
artifactDigest=sha256:22711a12987af5be8731ed82f70c96b1f78fa539c82196f8cd3ea72113168352
decision=STOP_RETRY_C6_AUTH_ONE_TARGET_PASSWORD_ROLLBACK_SNAPSHOT_READONLY_TECHNICAL
blocker=TARGET_AUTH_RESOLUTION_COUNT_0
```

Lecturas realmente consumidas:

```text
authDirectoryPagesRead=1
providerReadCalls=1
targetRecordsRetained=0
hashConfigReads=0
FirestoreReads=0
HRReads=0
```

El resolver focal usó `customClaims.shopperId` actual para recomponer el fingerprint de profile y obtuvo cero candidatos. Esto no demuestra ausencia de hash/salt. Demuestra que los claims actuales no son ancla suficiente para ese target, lo cual es coherente con su row congelado `UPDATE_AUTH` con `changes.claims=true`.

Por ello:

```text
passwordHashAvailabilityDetermined=false
passwordSaltStateDetermined=false
hashAlgorithmDetermined=false
encryptedSnapshotCreated=false
exactRollbackReconstructible=false
```

No hubo segundo provider attempt.

## 7. Fail-close actual

```text
workflowRemovalCommit=132ec6cdf6451fe0b4dfc62c794d9001482874b1
requestConsumeCommit=1a3119c681c4323dbff0730208db4680938b1f10
requestEnabled=false
requestConsumed=true
allowedExecutions=0
workflowPresent=false
secondProviderAttempt=0
```

El contrato PREWRITE permanece sin relajación.

## 8. Pendiente real

1. Bajo autorización separada, ejecutar un **resolver read-only focal** que reproduzca únicamente las anclas técnicas mínimas ya usadas por el PREWRITE anterior para ligar `ac93d90d9e41512acdcd` a exactamente un Auth candidate. No usar claims actuales como único ancla.
2. Solo con `candidateCount=1`, leer ese único Auth target para distinguir hash disponible, salt vacío/nulo vs no expuesto y hash config; crear snapshot cifrado reversible.
3. Solo con PASS de reversibilidad exacta: nuevo PREWRITE + Auth Activation DEV one-shot.
4. Readback integral y rollback dry-run.
5. Smoke acumulativo Admin/Operaciones, Shopper y Cliente.
6. Validación humana.
7. Cutover/promoción con autorización expresa.

No reabrir SKIP13, adjudicación multi-Auth ni el plan final 340/HOLD0.

## 9. Estado seguro

```text
FinalAuthPlan=340/340 HOLD0
AuthExecuted=false
providerReadCallsThisBlock=1
hashConfigReadsThisBlock=0
providerWrites=0
AuthWrites=0
FirestoreReads=0
FirestoreWrites=0
HRReads=0
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
