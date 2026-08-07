# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-07  
**Estado:** ACTIVO Y RECONCILIADO  
**Estado vivo:** `C6_DIRECT_RUNNER_DEV_PASS__SKIP13_13_OF_13_RESOLVED__8_PROFILES_9_EFFECTIVE_AUTH_CANDIDATES__STOP_RETRY__AUTH_PLAN_FROZEN__NO_WRITES__NO_PRODUCTION`

## 1. Orden de prevalencia

1. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `app/docs/SOURCE-LOCK-C6-SKIP13-PROVIDER-READONLY-V2-UNPLANNED-ACCESS-HOLD-20260807.md`;
3. `app/docs/evidence/C6-SKIP13-PROVIDER-READONLY-REVALIDATION-V2-HOLD-20260807.json`;
4. `backend/config/c6-skip13-auth-access-adjudication-request-v2.json` — consumido/deshabilitado;
5. `backend/contracts/c6-skip13-auth-access-adjudication-v2.json`;
6. `tools/qa/cxorbia-c6-skip13-auth-access-adjudication-readonly-v2.mjs`;
7. `tools/qa/cxorbia-c6-shopper-equivalent-universe.mjs`;
8. `app/docs/SOURCE-LOCK-C6-SKIP13-SELFTEST-HARNESS-ROOT-FIX-SOURCE-ONLY-PASS-20260807.md`;
9. `app/docs/SOURCE-LOCK-C6-DIRECT-RUNNER-DEV-DEPLOY-PASS-20260807.md`;
10. `backend/config/c6-shopper-auth-final-freeze-v1.json`;
11. `backend/config/c6-shopper-auth-snapshot-rollback-manifest-v1.json`;
12. `backend/config/c6-accumulative-multirole-smoke-matrix-v1.json`;
13. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
14. addenda vigentes y PR #7.

## 2. Direct runner DEV

```text
DirectRunnerDEV=PASS
service=cxorbia-c6-direct-runner-dev
revision=cxorbia-c6-direct-runner-dev-00001-2vz
runtimeIsolation=PASS
providerBoundaryEnabled=false
```

## 3. SKIP13 V2 — terminal HOLD por acceso efectivo

```text
requestId=c6-skip13-auth-access-adjudication-v2-20260807-01
requestCommit=5e32b000816303132f1e47dc17a901e4aebf3cab
runId=31194614899
jobId=92919661755
artifactId=9000260368
artifactDigest=sha256:05056323adb7a39df129fb3e7b498a331f0ef9ff9e8d9457614ac4294041d051
decision=HOLD_C6_SKIP13_V2_UNPLANNED_EFFECTIVE_ACCESS_FOUND
```

Source/root gates pasaron y la resolución criptográfica quedó corregida:

```text
profileFingerprintNamespace=deterministic-suffix-plan-profile
authCandidateFingerprintNamespace=shopper-auth-candidate-v1
resolvedProfiles=13/13
shopperProfileBaseline=340
```

Resultado:

```text
profilesWithAuthCandidates=8
profilesWithUnplannedEffectiveAccess=8
authCandidates=9
effectiveProjectAccessCandidates=9
effectiveOwnShopperAccessCandidates=9
blockingProfile=7cc28c78de9bfda01d14
blockingCandidateExpected=2
blockingCandidateObserved=2
```

Los nueve candidatos efectivos están habilitados, tienen provider password, tenant/proyecto/rol shopper permitidos y `shopperId` exacto bajo el contrato de reglas vigente. Membership no es requisito para project read y no se observó membership válido/presente para esos candidatos.

## 4. Lecturas consumidas y fail-close

```text
profileIdIndexQueries=1
authListPages=1
authUsersScanned=110
membershipPointReads=9
membershipFieldQueries=27
hrReads=0
secondProviderAttempt=false
```

```text
requestDisableCommit=c6314294315757a971c2d31d31ac72f1dc3bcf13
workflowRemovalCommit=a42008d5e0e9819dbdba7196071ca18a8c998d9c
requestEnabled=false
requestConsumed=true
allowedExecutions=0
workflowPresent=false
```

## 5. Auth congelado

```text
rows=340
CREATE_AUTH=81
UPDATE_AUTH=46
NO_OP=73
HOLD=0
PRESERVE_NO_AUTH=140
planDigest=6060f406a33d4ba926c982871513f8e86ba2b10f44c2da00ab43bd2a409f721b
AuthExecuted=false
```

El plan continúa criptográficamente congelado, pero su ejecución queda bloqueada por el HOLD SKIP13: ocho perfiles que el flujo debía preservar requieren reconciliación de identidad antes de cualquier write.

## 6. Pendiente real

1. Reconciliación source-only de los ocho perfiles efectivos contra el freeze de 340 filas y las matrices técnicas ya existentes.
2. Clasificar cada uno entre identidad canónica vigente, alias histórico, duplicado o acceso que debe retirarse; resolver especialmente los dos candidatos efectivos de `7cc28c78de9bfda01d14`.
3. Solo con un plan no ambiguo y HOLD=0, autorizar el bloque Auth 340 con snapshot/rollback.
4. Smoke acumulativo Admin/Operaciones, Shopper y Cliente.
5. Validación humana.
6. Cutover/promoción autorizada.

## 7. Estado seguro

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
