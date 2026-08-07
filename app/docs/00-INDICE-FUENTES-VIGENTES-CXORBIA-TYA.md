# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-07  
**Estado:** ACTIVO Y RECONCILIADO  
**Estado vivo:** `C6_AUTH_FINAL_PLAN_340_HOLD0__PASSWORD_ROLLBACK_ROOTFIX_SOURCE_ONLY_STOP_RETRY_TARGET_PRIOR_PASSWORD_NOT_PROVEN__ZERO_PROVIDER_READS_WRITES__NO_PRODUCTION`

## 1. Orden de prevalencia

1. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `app/docs/SOURCE-LOCK-C6-AUTH-PASSWORD-ROLLBACK-ROOTFIX-SOURCE-ONLY-STOP-RETRY-20260807.md`;
3. `app/docs/evidence/C6-AUTH-PASSWORD-ROLLBACK-ROOTFIX-SOURCE-ONLY-STOP-RETRY-20260807.json`;
4. `tools/qa/cxorbia-c6-auth-password-rollback-rootfix-source-only.mjs`;
5. `backend/config/c6-auth-password-rollback-rootfix-source-only-request-v2.json` — consumido/deshabilitado;
6. `backend/config/c6-auth-password-rollback-rootfix-source-only-request-v1.json` — consumido tras error source-only, cero provider;
7. `app/docs/SOURCE-LOCK-C6-AUTH-ACTIVATION-DEV-PREWRITE-PASSWORD-ROLLBACK-STOP-RETRY-20260807.md`;
8. `app/docs/evidence/C6-AUTH-ACTIVATION-DEV-PREWRITE-STOP-RETRY-20260807.json`;
9. `backend/config/c6-shopper-auth-final-freeze-v2.json`;
10. `backend/contracts/c6-auth-activation-dev-v1.json` — preservado, no relajado;
11. `tools/qa/cxorbia-c6-auth-activation-dev.mjs`;
12. `backend/config/c6-auth-activation-dev-request-v1.json` — consumido/deshabilitado;
13. `app/docs/SOURCE-LOCK-C6-MULTI-AUTH-FINAL-DISCRIMINATOR-TENANT-ADJUDICATION-STOP-RETRY-20260807.md`;
14. `app/docs/evidence/C6-MULTI-AUTH-FINAL-DISCRIMINATOR-READONLY-STOP-RETRY-20260807.json`;
15. `backend/config/c6-skip13-access-reconciliation-overlay-v1.json`;
16. `app/docs/SOURCE-LOCK-C6-SKIP13-ACCESS-RECONCILIATION-SOURCE-ONLY-STOP-RETRY-20260807.md`;
17. `app/docs/evidence/C6-SKIP13-PROVIDER-READONLY-REVALIDATION-V2-HOLD-20260807.json`;
18. `backend/contracts/c6-skip13-auth-access-adjudication-v2.json`;
19. `app/docs/SOURCE-LOCK-C6-DIRECT-RUNNER-DEV-DEPLOY-PASS-20260807.md`;
20. `backend/config/c6-shopper-auth-final-freeze-v1.json` — lineage anterior;
21. `backend/config/c6-shopper-auth-snapshot-rollback-manifest-v1.json`;
22. `backend/config/c6-accumulative-multirole-smoke-matrix-v1.json`;
23. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
24. addenda vigentes y PR #7.

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

## 4. Auth Activation DEV anterior

```text
runId=31213274602
artifactId=9007517428
decision=STOP_RETRY_C6_AUTH_ACTIVATION_DEV_PREWRITE
blocker=PASSWORD_ROLLBACK_HASH_SALT_UNAVAILABLE:ac93d90d9e41512acdcd
writeBoundaryEntered=false
providerWriteCalls=0
```

## 5. Password rollback root fix source-only

El bloque autorizado validó únicamente fuentes técnicas cifradas/versionadas y lineage congelada, sin provider/Auth/Firestore/HR reads.

Resultado técnico:

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

El punto importante es que **salt vacío puede ser válido** para el lineage SHA256/1. Sin embargo, no existe evidencia source-only suficiente para afirmar que el password actual del target `ac93d90d9e41512acdcd` sea exactamente un hash legacy recuperable.

Ejecución terminal:

```text
requestId=c6-auth-password-rollback-rootfix-source-only-20260807-02
requestCommit=6253ae7a3473146af3d26962abf03d79954408dd
runId=31217732890
jobId=92995079565
artifactId=9009157363
artifactDigest=sha256:ef121dafbd716b6d9e074a285e0845499313d4b52e5521864cf5a89b4b94505b
decision=STOP_RETRY_C6_AUTH_PASSWORD_ROLLBACK_ROOT_FIX_SOURCE_ONLY_TARGET_PRIOR_PASSWORD_NOT_PROVEN
```

El run concluyó técnicamente `success`; STOP_RETRY es la decisión contractual.

## 6. Harness y fail-close

Primer intento source-only:

```text
runId=31217471430
jobId=92994249732
failure=SOURCE_REFERENCE_ERROR_BEFORE_DECISION
providerReads=0
providerWrites=0
contractMutation=false
```

Fue corregido dentro del mismo bloque sin cruzar provider. Luego:

```text
workflowRemovalCommit=8adb6837efc18af6ab7564d75e222e0d66d2a5b7
requestV1Consumed=true
requestV2Consumed=true
allowedExecutions=0
workflowPresent=false
```

`backend/contracts/c6-auth-activation-dev-v1.json` sigue sin cambio funcional; blob SHA `2e4457cfc8e847143bbebab879dbed2d816fa43a`.

## 7. Pendiente real

1. **Autorización separada para un único provider/Auth read-only focal** del target `ac93d90d9e41512acdcd`, a fin de determinar `passwordHash`, distinguir salt vacío vs no expuesto, leer la configuración efectiva requerida para restauración exacta y preparar la capacidad de snapshot cifrado; cero writes.
2. Solo si ese read-only demuestra rollback exacto: nuevo PREWRITE + Auth Activation DEV one-shot.
3. Readback integral y rollback dry-run.
4. Smoke acumulativo Admin/Operaciones, Shopper y Cliente.
5. Validación humana.
6. Cutover/promoción con autorización expresa.

No volver a abrir SKIP13, la adjudicación multi-Auth ni el plan final 340/HOLD0.

## 8. Estado seguro

```text
FinalAuthPlan=340/340 HOLD0
AuthExecuted=false
providerReadsThisRootFix=0
AuthReadsThisRootFix=0
FirestoreReadsThisRootFix=0
HRReadsThisRootFix=0
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
