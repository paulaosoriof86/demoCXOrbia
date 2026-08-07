# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-07  
**Estado:** ACTIVO Y RECONCILIADO  
**Estado vivo:** `C6_AUTH_FINAL_PLAN_340_HOLD0__ONE_TARGET_RESOLVER_STOP_RETRY_CREDENTIAL_LOGIN_ANCHOR_MISSING__340_SHOPPER_DOC_READS__ZERO_AUTH_READS__ZERO_WRITES__NO_PRODUCTION`

## 1. Orden de prevalencia

1. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `app/docs/SOURCE-LOCK-C6-AUTH-ONE-TARGET-RESOLVER-PASSWORD-SNAPSHOT-READONLY-STOP-RETRY-20260807.md`;
3. `app/docs/evidence/C6-AUTH-ONE-TARGET-RESOLVER-PASSWORD-SNAPSHOT-READONLY-STOP-RETRY-20260807.json`;
4. `backend/config/c6-auth-one-target-resolver-password-snapshot-readonly-request-v3.json` — consumido/deshabilitado;
5. `tools/qa/cxorbia-c6-auth-one-target-resolver-password-snapshot-readonly.mjs`;
6. `backend/config/c6-auth-one-target-resolver-password-snapshot-readonly-request-v2.json` — consumido tras mismatch source, cero provider reads;
7. `backend/config/c6-auth-one-target-resolver-password-snapshot-readonly-request-v1.json` — consumido tras falso positivo source, cero provider reads;
8. `app/docs/SOURCE-LOCK-C6-AUTH-ONE-TARGET-PASSWORD-ROLLBACK-SNAPSHOT-READONLY-STOP-RETRY-20260807.md`;
9. `app/docs/evidence/C6-AUTH-ONE-TARGET-PASSWORD-ROLLBACK-SNAPSHOT-READONLY-STOP-RETRY-20260807.json`;
10. `backend/config/c6-auth-one-target-password-rollback-snapshot-readonly-request-v1.json` — consumido/deshabilitado;
11. `tools/qa/cxorbia-c6-auth-one-target-password-rollback-snapshot-readonly.mjs`;
12. `app/docs/SOURCE-LOCK-C6-AUTH-PASSWORD-ROLLBACK-ROOTFIX-SOURCE-ONLY-STOP-RETRY-20260807.md`;
13. `app/docs/evidence/C6-AUTH-PASSWORD-ROLLBACK-ROOTFIX-SOURCE-ONLY-STOP-RETRY-20260807.json`;
14. `tools/qa/cxorbia-c6-auth-password-rollback-rootfix-source-only.mjs`;
15. `app/docs/SOURCE-LOCK-C6-AUTH-ACTIVATION-DEV-PREWRITE-PASSWORD-ROLLBACK-STOP-RETRY-20260807.md`;
16. `app/docs/evidence/C6-AUTH-ACTIVATION-DEV-PREWRITE-STOP-RETRY-20260807.json`;
17. `backend/config/c6-shopper-auth-final-freeze-v2.json`;
18. `backend/contracts/c6-auth-activation-dev-v1.json` — preservado, no relajado;
19. `tools/qa/cxorbia-c6-auth-activation-dev.mjs`;
20. `app/docs/SOURCE-LOCK-C6-MULTI-AUTH-FINAL-DISCRIMINATOR-TENANT-ADJUDICATION-STOP-RETRY-20260807.md`;
21. `backend/config/c6-skip13-access-reconciliation-overlay-v1.json`;
22. `backend/contracts/c6-skip13-auth-access-adjudication-v2.json`;
23. `app/docs/SOURCE-LOCK-C6-DIRECT-RUNNER-DEV-DEPLOY-PASS-20260807.md`;
24. `backend/config/c6-shopper-auth-final-freeze-v1.json` — lineage anterior;
25. `backend/config/c6-shopper-auth-snapshot-rollback-manifest-v1.json`;
26. `backend/config/c6-accumulative-multirole-smoke-matrix-v1.json`;
27. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
28. addenda vigentes y PR #7.

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

## 6. One-target password rollback snapshot read-only anterior

```text
requestId=c6-auth-one-target-password-rollback-snapshot-readonly-20260807-01
runId=31219919183
jobId=93001987641
artifactId=9009957173
artifactDigest=sha256:22711a12987af5be8731ed82f70c96b1f78fa539c82196f8cd3ea72113168352
decision=STOP_RETRY_C6_AUTH_ONE_TARGET_PASSWORD_ROLLBACK_SNAPSHOT_READONLY_TECHNICAL
blocker=TARGET_AUTH_RESOLUTION_COUNT_0
```

Ese resolver usó claims actuales como ancla y se detuvo antes de hash/salt. No demostró ausencia de hash/salt.

## 7. One-target resolver + password snapshot read-only actual

Se autorizó reproducir las anclas técnicas mínimas del PREWRITE sin usar claims actuales como único selector.

Dos incidencias source-only se cerraron antes de provider:

```text
31221442188: STATIC_GATE_FALSE_POSITIVE_MAP_SET, providerReads=0
31221635160: REQUEST_SCHEMA_MISMATCH_BEFORE_PROVIDER_READ, providerReads=0
```

Ejecución terminal:

```text
requestId=c6-auth-one-target-resolver-password-snapshot-readonly-20260807-03
requestCommit=e8ae0e7cf55c1e74da0550ce4fe00ee54d7cdac8
runId=31221947755
jobId=93008217242
artifactId=9010690763
artifactDigest=sha256:9d875485492c403500e8345d73e3d6f864a4aaf458e2bc702da92404f47a40e1
workflowConclusion=success
decision=STOP_RETRY_C6_AUTH_ONE_TARGET_RESOLVER_PASSWORD_SNAPSHOT_READONLY_TECHNICAL
blocker=TARGET_CREDENTIAL_LOGIN_ANCHOR_MISSING
```

Lecturas consumidas:

```text
shopperIndexQueries=1
shopperDocumentsRead=340
authDirectoryPages=0
hashConfigReads=0
HRReads=0
```

El profile fingerprint objetivo sí resolvió exactamente dentro de los 340 shoppers. Sin embargo, sus technical/legacy keys y campos de login allowlisted no enlazaron un credential login en el bundle cifrado. Por contrato el flujo se detuvo antes de `Auth.listUsers`, hash, salt y hashConfig.

Por tanto:

```text
credentialLoginAnchorFound=false
authCandidateCountDetermined=false
passwordHashAvailabilityDetermined=false
passwordSaltStateDetermined=false
providerHashAlgorithmDetermined=false
encryptedSnapshotCreated=false
exactRollbackReconstructible=false
```

Esto no demuestra ausencia de Auth/hash/salt; demuestra que el subset mínimo de anclas no alcanza.

## 8. Fail-close actual

```text
workflowRemovalCommit=358c0bc3f363b5081daaf6e04e6e4a7f582146df
requestConsumeCommit=6019659a61668dfdcf08f31d0da8ecca60bfce3f
requestEnabled=false
requestConsumed=true
allowedExecutions=0
workflowPresent=false
secondProviderAttempt=false
```

El contrato PREWRITE permanece sin relajación.

## 9. Pendiente real

1. **Source-only primero:** extraer de las matrices/evidencias ya versionadas y del resolver PREWRITE exactamente qué fuentes técnicas sustentaron `multi_source_full_name_consensus` para `ac93d90d9e41512acdcd`, y qué ancla permite reconstruir `baseLoginFp=493f2b26360648693c37` sin PII.
2. Solo si esa lineage requiere provider, pedir una autorización nueva para un read-only focal de esas fuentes mínimas; este bloque ya consumió su único provider attempt.
3. Exigir `candidateCount=1` y cero asociación con otro row.
4. Solo entonces inspeccionar hash/salt/hashConfig y construir snapshot cifrado reversible.
5. Con PASS de reversibilidad exacta, volver directamente a PREWRITE + Auth Activation DEV one-shot.
6. Readback integral + rollback dry-run.
7. Smoke acumulativo Admin/Operaciones, Shopper y Cliente.
8. Validación humana y cutover/promoción autorizada.

No reabrir SKIP13, adjudicación multi-Auth ni el plan final 340/HOLD0.

## 10. Estado seguro

```text
FinalAuthPlan=340/340 HOLD0
AuthExecuted=false
shopperIndexQueriesThisBlock=1
shopperDocumentsReadThisBlock=340
AuthDirectoryPagesThisBlock=0
hashConfigReadsThisBlock=0
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
