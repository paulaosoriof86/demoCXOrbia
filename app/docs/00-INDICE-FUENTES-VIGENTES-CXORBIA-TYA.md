# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-07  
**Estado:** ACTIVO Y RECONCILIADO  
**Estado vivo:** `C6_MULTI_AUTH_FINAL_DISCRIMINATOR_NO_UNIQUE_TECHNICAL_ANCHOR__TENANT_ADJUDICATION_REQUIRED__STOP_RETRY__AUTH_FREEZE_UNMODIFIED__NO_WRITES__NO_PRODUCTION`

## 1. Orden de prevalencia

1. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `app/docs/SOURCE-LOCK-C6-MULTI-AUTH-FINAL-DISCRIMINATOR-TENANT-ADJUDICATION-STOP-RETRY-20260807.md`;
3. `app/docs/evidence/C6-MULTI-AUTH-FINAL-DISCRIMINATOR-READONLY-STOP-RETRY-20260807.json`;
4. `backend/contracts/c6-multi-auth-final-discriminator-readonly-v1.json`;
5. `tools/qa/cxorbia-c6-multi-auth-final-discriminator-readonly-v1.mjs`;
6. `backend/config/c6-multi-auth-final-discriminator-readonly-request-v1.json` — consumido/deshabilitado;
7. `backend/config/c6-skip13-access-reconciliation-overlay-v1.json` — overlay provisional HOLD=1;
8. `app/docs/SOURCE-LOCK-C6-SKIP13-ACCESS-RECONCILIATION-SOURCE-ONLY-STOP-RETRY-20260807.md`;
9. `app/docs/evidence/C6-SKIP13-ACCESS-RECONCILIATION-SOURCE-ONLY-STOP-RETRY-20260807.json`;
10. `app/docs/SOURCE-LOCK-C6-SKIP13-PROVIDER-READONLY-V2-UNPLANNED-ACCESS-HOLD-20260807.md`;
11. `app/docs/evidence/C6-SKIP13-PROVIDER-READONLY-REVALIDATION-V2-HOLD-20260807.json`;
12. `backend/contracts/c6-skip13-auth-access-adjudication-v2.json`;
13. `tools/qa/cxorbia-c6-skip13-auth-access-adjudication-readonly-v2.mjs`;
14. `app/docs/SOURCE-LOCK-C6-DIRECT-RUNNER-DEV-DEPLOY-PASS-20260807.md`;
15. `backend/config/c6-shopper-auth-final-freeze-v1.json`;
16. `backend/config/c6-shopper-auth-snapshot-rollback-manifest-v1.json`;
17. `backend/config/c6-accumulative-multirole-smoke-matrix-v1.json`;
18. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
19. addenda vigentes y PR #7.

## 2. Direct runner DEV

```text
DirectRunnerDEV=PASS
service=cxorbia-c6-direct-runner-dev
revision=cxorbia-c6-direct-runner-dev-00001-2vz
runtimeIsolation=PASS
providerBoundaryEnabled=false
```

## 3. SKIP13 ya reducido a un único caso

La cadena anterior resolvió 13/13 fingerprints y encontró 8 perfiles con 9 candidatos Auth efectivos. Siete perfiles quedaron reconciliados como `IDENTIDAD_CANONICA_VIGENTE` con un único candidato efectivo. Solo permanece el perfil:

```text
profileFingerprint=7cc28c78de9bfda01d14
candidateA=4e6d26551d11db444bd0
candidateB=9b2b7ca1bd72c1301d29
```

## 4. Final discriminator read-only

```text
requestId=c6-multi-auth-final-discriminator-readonly-20260807-01
sourceHead=f6c18173c028a3f04e08c16b027a211ce8cbc526
requestCommit=1a2c2f95334ae1869d8ba8d7f665f31c080ad4e2
runId=31199988897
jobId=92937409808
artifactId=9002409950
artifactDigest=sha256:0387c7323cf16b50f8d0596fff7bb19bec4aba94e830b2d998761041f5d723e5
decision=STOP_RETRY_C6_MULTI_AUTH_FINAL_DISCRIMINATOR_TENANT_ADJUDICATION_REQUIRED
```

Resultado exacto de ambos candidatos:

```text
tenantAllowed=true
projectAssigned=true
roleShopper=true
passwordProvider=true
shopperIdPresent=true
shopperIdFingerprint=37eddd3b0db728c2b0b565b3
allowlistedClaims=projectId,projectIds,role,shopperId,tenantId
source/batch/migration/import markers=0
decisiveMatches=0
```

No existe ancla técnica única. No se permite usar `creationTime`, ordinal, first-returned, enabled/disabled o emailVerified. Por tanto `keeper=null` y `accessToRetire=null`.

## 5. Lectura y fail-close

```text
AuthListPages=1
AuthUsersScannedForFingerprintOnly=110
targetCandidatesInspected=2
nonTargetAttributesInspected=false
FirestoreReads=0
membershipReads=0
HRReads=0
StorageReads=0
legacyCredentialReads=0
requestConsumeCommit=f587489c0d025ab47085a1bc7074e7345d891f0b
workflowRemovalCommit=55c9777698594815ef18bb380a0f0fad79f6f4b8
secondAttempt=0
```

## 6. Auth freeze y reconciliación

Freeze original intacto/no ejecutado:

```text
rows=340
uniqueRows=340
CREATE_AUTH=81
UPDATE_AUTH=46
NO_OP=73
HOLD=0
PRESERVE_NO_AUTH=140
planDigest=6060f406a33d4ba926c982871513f8e86ba2b10f44c2da00ab43bd2a409f721b
AuthExecuted=false
```

Overlay de reconciliación provisional vigente:

```text
rows=340
uniqueRows=340
CREATE_AUTH=81
UPDATE_AUTH=46
NO_OP=80
HOLD=1
PRESERVE_NO_AUTH=132
onePrimaryOperationPerProfile=true
targetHoldZeroSatisfied=false
executable=false
```

No existe overlay final HOLD=0 porque la evidencia técnica autorizada es simétrica.

## 7. Pendiente real

1. Adjudicación explícita del tenant por candidate fingerprint: elegir cuál de `4e6d26551d11db444bd0` o `9b2b7ca1bd72c1301d29` es el keeper.
2. Con esa decisión, materializar source-only el overlay final 340/340 HOLD=0, sin write.
3. Autorizar por separado snapshot + retiro de acceso duplicado + ejecución Auth 340, con readback/rollback.
4. Smoke acumulativo Admin/Operaciones, Shopper y Cliente.
5. Validación humana.
6. Cutover/promoción autorizada.

No repetir provider/Auth reads del discriminador para intentar resolver el mismo empate.

## 8. Estado seguro

```text
providerWrites=0
AuthWrites=0
passwordChanges=0
passwordResets=0
claimsWrites=0
membershipWrites=0
FirestoreWrites=0
RulesWrites=0
StorageWrites=0
HRWrites=0
CloudBuild=0
CloudRunDeploy=0
HostingDeploy=0
merge=false
production=false
```
