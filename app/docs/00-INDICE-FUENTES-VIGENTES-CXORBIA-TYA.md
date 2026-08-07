# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-07  
**Estado:** ACTIVO Y RECONCILIADO  
**Estado vivo:** `C6_DIRECT_RUNNER_DEV_PASS__SKIP13_ROOT_FIX_SOURCE_GATE_HOLD_SELFTEST_OUTPUT_CONTAMINATION__NO_PROVIDER_ATTEMPT__AUTH_PLAN_FROZEN__NO_PRODUCTION`

## 1. Orden de prevalencia

1. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `app/docs/SOURCE-LOCK-C6-SKIP13-ROOT-FIX-SOURCE-GATE-SELFTEST-HARNESS-HOLD-20260807.md`;
3. `backend/contracts/c6-skip13-auth-access-adjudication-v2.json`;
4. `tools/qa/cxorbia-c6-skip13-auth-access-adjudication-readonly-v2.mjs`;
5. `app/docs/SOURCE-LOCK-C6-SKIP13-FINGERPRINT-NAMESPACE-MISMATCH-STOP-RETRY-20260807.md`;
6. `backend/config/c6-skip13-auth-access-adjudication-request.json` — consumido/deshabilitado;
7. `backend/contracts/c6-skip13-auth-access-adjudication-v1.json`;
8. `tools/qa/cxorbia-c6-skip13-auth-access-adjudication-readonly.mjs`;
9. `app/docs/SOURCE-LOCK-C6-DIRECT-RUNNER-DEV-DEPLOY-PASS-20260807.md`;
10. `backend/contracts/c6-direct-trusted-runner-dev-v2.json`;
11. `backend/contracts/c6-execution-control-plane-v2.json`;
12. `backend/contracts/c6-runtime-identity-isolated-final-v2.json`;
13. `backend/runtime/c6-direct-trusted-runner/server.mjs`;
14. `backend/config/c6-shopper-auth-final-freeze-v1.json`;
15. `backend/config/c6-shopper-auth-snapshot-rollback-manifest-v1.json`;
16. `backend/config/c6-accumulative-multirole-smoke-matrix-v1.json`;
17. `tools/qa/cxorbia-c6-shopper-deterministic-suffix-readonly.mjs`;
18. `tools/qa/cxorbia-c6-shopper-equivalent-universe.mjs`;
19. `app/docs/DIAGNOSTICO-CAUSA-RAIZ-C6-RUTA-PRODUCCION-20260807.md`;
20. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
21. addenda vigentes de CAMBIOS, Claude, Pendientes, Academia y tracker;
22. `AGENTS.md`, PR #7 y HEAD vivo.

## 2. Direct trusted runner DEV — PASS preservado

```text
service=cxorbia-c6-direct-runner-dev
revision=cxorbia-c6-direct-runner-dev-00001-2vz
runtimeIsolation=PASS
providerBoundaryEnabled=false
```

## 3. SKIP13 root-fix v2

```text
contractV2=materialized
adjudicatorV2=materialized
profileFingerprintNamespace=deterministic-suffix-plan-profile
authCandidateFingerprintNamespace=shopper-auth-candidate-v1
forbiddenProfileJoin=shopper-collision-member-v1,multi-auth-profile-v1
```

## 4. Source gate HOLD

```text
runId=31190357507
jobId=92905316953
failureClassification=SOURCE_GATE_SELFTEST_OUTPUT_CONTAMINATION_FROM_IMPORTED_MODULE_ARGV
```

Checkout, Node y sintaxis pasaron. El self-test falló antes de provider porque `--self-test` activó también el bloque module-level del módulo importado `cxorbia-c6-shopper-equivalent-universe.mjs`, contaminando la salida JSON.

## 5. STOP_RETRY / fail-close

```text
v2RequestCreated=false
providerAttempt=false
providerReads=0
providerWrites=0
secondProviderAttempt=false
workflowRemovalCommit=e269347c8305c6ff60ad182aa6190c9c94abfe62
workflowPresent=false
```

## 6. Auth congelado

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

## 7. Pendiente real

1. Nueva autorización source-only para corregir exclusivamente el harness de self-test.
2. PASS estático cross-namespace sin provider.
3. Nueva autorización distinta para una única adjudicación SKIP13 read-only.
4. Auth 340 con snapshot/rollback.
5. Smoke multirrol, validación humana y cutover autorizado.

## 8. Estado seguro

```text
DirectRunnerDEV=PASS
SKIP13SourceGate=HOLD
providerAttemptThisBlock=false
providerReadsThisBlock=0
providerWrites=0
AuthWrites=0
FirestoreWrites=0
RulesWrites=0
StorageWrites=0
HRWrites=0
additionalCloudBuilds=0
additionalCloudRunDeploys=0
HostingDeploys=0
merge=false
production=false
```
