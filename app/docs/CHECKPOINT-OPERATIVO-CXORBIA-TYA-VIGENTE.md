# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-07  
**Estado:** `C6_DIRECT_RUNNER_DEV_PASS__SKIP13_13_OF_13_RESOLVED__8_PROFILES_9_EFFECTIVE_AUTH_CANDIDATES__STOP_RETRY__AUTH_PLAN_FROZEN__NO_WRITES__NO_PRODUCTION`

## 1. Control

- repo: `paulaosoriof86/demoCXOrbia`;
- rama viva: `docs-tya-v6-v71-audit`;
- PR #7: draft/open/no merge;
- source lock vigente: `app/docs/SOURCE-LOCK-C6-SKIP13-PROVIDER-READONLY-V2-UNPLANNED-ACCESS-HOLD-20260807.md`;
- producción: intacta;
- request SKIP13 ejecutable: ninguno;
- Auth ejecutado: no.

## 2. Direct runner DEV

```text
service=cxorbia-c6-direct-runner-dev
revision=cxorbia-c6-direct-runner-dev-00001-2vz
runtimeIsolation=PASS
providerBoundaryEnabled=false
```

## 3. SKIP13 provider read-only V2

```text
requestId=c6-skip13-auth-access-adjudication-v2-20260807-01
requestCommit=5e32b000816303132f1e47dc17a901e4aebf3cab
targetHead=47fcf4992b1d7708c037670e4df0a1ad70aa9f0d
runId=31194614899
jobId=92919661755
artifactId=9000260368
artifactDigest=sha256:05056323adb7a39df129fb3e7b498a331f0ef9ff9e8d9457614ac4294041d051
```

Pasaron:

```text
namespace/harness static gate=PASS
request-only source lock=PASS
claim unique=PASS
credential target=PASS
shopper baseline=340
profile resolution=13/13
blocking candidate set=2/2
```

## 4. Resultado terminal

```text
decision=HOLD_C6_SKIP13_V2_UNPLANNED_EFFECTIVE_ACCESS_FOUND
profilesWithAuthCandidates=8
profilesWithUnplannedEffectiveAccess=8
authCandidates=9
effectiveProjectAccessCandidates=9
effectiveOwnShopperAccessCandidates=9
```

Los nueve candidatos efectivos observados están habilitados, usan password provider, permiten tenant `tya`, proyecto `cinepolis`, rol shopper y `shopperId` exacto bajo el contrato vigente.

El perfil bloqueante:

```text
profileFingerprint=7cc28c78de9bfda01d14
candidateCount=2
expectedCandidateCount=2
observedCandidateCount=2
candidate=4e6d26551d11db444bd0 -> effective own shopper access
candidate=9b2b7ca1bd72c1301d29 -> effective own shopper access
```

No hubo drift de fingerprints. El bloqueo es acceso efectivo real no previsto.

## 5. Lecturas consumidas

```text
profileIdIndexQueries=1
authListPages=1
authUsersScanned=110
membershipPointReads=9
membershipFieldQueries=27
hrReads=0
```

No se exportaron raw UIDs, shopper IDs, emails, claims ni PII.

## 6. STOP_RETRY / fail-close

```text
secondProviderAttempt=false
requestDisableCommit=c6314294315757a971c2d31d31ac72f1dc3bcf13
workflowRemovalCommit=a42008d5e0e9819dbdba7196071ca18a8c998d9c
requestEnabled=false
requestConsumed=true
allowedExecutions=0
workflowPresent=false
```

## 7. Auth congelado

```text
rows=340
uniqueRows=340
CREATE_AUTH=81
UPDATE_AUTH=46
NO_OP=73
HOLD=0
PRESERVE_NO_AUTH=140
planDigest=6060f406a33d4ba926c982871513f8e86ba2b10f44c2da00ab43bd2a409f721b
freezeDecision=PASS_AUTH_PLAN_340_CRYPTOGRAPHIC_FREEZE
AuthExecuted=false
```

La ejecución Auth queda bloqueada hasta reconciliar los ocho perfiles efectivos. El freeze no se altera por este bloque.

## 8. Phase A preservada

Frontend acumulativo, Login, `CX.data`, HR, shoppers, postulaciones, certificaciones, visitas, liquidaciones, Finanzas, Portal Cliente, Portal Shopper, Reservas, multi-tenant, multi-proyecto y Academia permanecen preservados.

## 9. Siguiente cadena exacta

1. Reconciliación source-only de los ocho perfiles efectivos contra freeze/matrices existentes, sin nueva lectura provider.
2. Determinar por fingerprint si cada candidato es identidad canónica vigente, alias histórico, duplicado o acceso a retirar.
3. Resolver el caso `7cc28c78de9bfda01d14` con sus dos candidatos efectivos sin inferencia por nombre.
4. Regenerar, si corresponde, un plan Auth no superpuesto y HOLD=0; no ejecutar writes todavía.
5. Solo con autorización posterior, Auth 340/snapshot/rollback.
6. Smoke multirrol, validación humana y cutover.

## 10. Estado seguro

```text
providerWrites=0
AuthWrites=0
passwordChanges=0
passwordResets=0
membershipWrites=0
FirestoreWrites=0
RulesWrites=0
StorageWrites=0
HRReads=0
HRWrites=0
CloudBuild=0
CloudRunDeploy=0
HostingDeploy=0
merge=false
production=false
```
