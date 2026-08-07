# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-07  
**Estado:** `C6_MULTI_AUTH_FINAL_DISCRIMINATOR_NO_UNIQUE_TECHNICAL_ANCHOR__TENANT_ADJUDICATION_REQUIRED__STOP_RETRY__AUTH_FREEZE_UNMODIFIED__NO_WRITES__NO_PRODUCTION`

## 1. Control

- repo: `paulaosoriof86/demoCXOrbia`;
- rama viva: `docs-tya-v6-v71-audit`;
- PR #7: draft/open/no merge;
- source lock vigente: `app/docs/SOURCE-LOCK-C6-MULTI-AUTH-FINAL-DISCRIMINATOR-TENANT-ADJUDICATION-STOP-RETRY-20260807.md`;
- producción: intacta;
- request ejecutable: ninguno;
- Auth ejecutado: no.

## 2. Direct runner DEV

```text
service=cxorbia-c6-direct-runner-dev
revision=cxorbia-c6-direct-runner-dev-00001-2vz
runtimeIsolation=PASS
providerBoundaryEnabled=false
```

## 3. Estado SKIP13 antes del bloque final

La cadena provider/source-only previa quedó en:

```text
SKIP13 profiles resolved=13/13
profiles with effective Auth=8
effective Auth candidates=9
profiles reconciled unique canonical=7
remaining duplicate profile=1
remaining duplicate candidates=2
```

Único perfil restante:

```text
profileFingerprint=7cc28c78de9bfda01d14
candidateA=4e6d26551d11db444bd0
candidateB=9b2b7ca1bd72c1301d29
```

## 4. Multi-Auth Final Discriminator read-only

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

El run terminó técnicamente en success. El STOP_RETRY es el resultado contractual de identidad.

## 5. Resultado terminal

Ambos candidatos continúan equivalentes bajo el scope expresamente autorizado:

```text
candidate 4e6d26551d11db444bd0:
  tenantAllowed=true
  projectAssigned=true
  roleShopper=true
  passwordProvider=true
  shopperIdPresent=true
  shopperIdFingerprint=37eddd3b0db728c2b0b565b3
  allowlistedClaims=projectId,projectIds,role,shopperId,tenantId
  source/batch/migration/import markers=0
  decisiveMatches=0

candidate 9b2b7ca1bd72c1301d29:
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

No existe ancla técnica única. Por tanto:

```text
keeper=null
accessToRetire=null
tenantAdjudicationRequired=true
```

No se usó creationTime, ordinal, first-returned, enabled/disabled ni emailVerified como selector.

## 6. Lecturas consumidas

```text
AuthListPages=1
AuthUsersScannedForFingerprintOnly=110
targetCandidatesInspected=2
nonTargetAttributesInspected=false
FirestoreReads=0
membershipReads=0
HRReads=0
visitsReads=0
certificationsReads=0
liquidationsReads=0
StorageReads=0
legacyCredentialReads=0
```

No se exportaron UID, nombre, correo, contraseña, shopperId crudo ni claims crudos.

## 7. Freeze y overlay

Freeze Auth original preservado e inmutable:

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

Overlay provisional sigue siendo la única reconciliación válida:

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

No se produjo plan final HOLD=0.

## 8. Fail-close

```text
requestConsumeCommit=f587489c0d025ab47085a1bc7074e7345d891f0b
workflowRemovalCommit=55c9777698594815ef18bb380a0f0fad79f6f4b8
requestEnabled=false
requestConsumed=true
allowedExecutions=0
workflowPresent=false
secondAttempt=0
```

Antes de crear el request se corrigió en `f6c18173c028a3f04e08c16b027a211ce8cbc526` un falso positivo del gate estático que confundía la comprobación `legacyCredentials=false` con una lectura legacy. No se consumió provider read antes de esa corrección.

## 9. Phase A preservada

Frontend acumulativo, Login, `CX.data`, HR, shoppers, postulaciones, certificaciones, visitas, liquidaciones, Finanzas, Portal Cliente, Portal Shopper, Reservas, multi-tenant, multi-proyecto y Academia permanecen preservados.

## 10. Siguiente cadena exacta

1. **Adjudicación explícita del tenant**, por candidate fingerprint únicamente, para indicar cuál de los dos candidatos es keeper.
2. Materializar source-only un overlay final `340/340`, no superpuesto, `HOLD=0`; cero write.
3. Con autorización separada: snapshot + retiro del acceso duplicado + ejecución Auth 340 + readback/rollback.
4. Smoke acumulativo Admin/Operaciones, Shopper y Cliente.
5. Validación humana.
6. Cutover/promoción autorizada.

No repetir el provider/Auth read de este discriminador.

## 11. Estado seguro

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
