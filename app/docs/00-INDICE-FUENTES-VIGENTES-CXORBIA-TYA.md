# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-07  
**Estado:** ACTIVO Y RECONCILIADO  
**Estado vivo:** `C6_DIRECT_RUNNER_DEV_PASS__SKIP13_NAMESPACE_ROOT_FIX_PASS__SELFTEST_HARNESS_PASS__NO_PROVIDER_ATTEMPT__AUTH_PLAN_FROZEN__NO_PRODUCTION`

## 1. Orden de prevalencia

1. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `app/docs/SOURCE-LOCK-C6-SKIP13-SELFTEST-HARNESS-ROOT-FIX-SOURCE-ONLY-PASS-20260807.md`;
3. `app/docs/evidence/C6-SKIP13-SELFTEST-HARNESS-ROOT-FIX-SOURCE-ONLY-PASS-20260807.json`;
4. `backend/contracts/c6-skip13-auth-access-adjudication-v2.json`;
5. `tools/qa/cxorbia-c6-skip13-auth-access-adjudication-readonly-v2.mjs`;
6. `tools/qa/cxorbia-c6-shopper-equivalent-universe.mjs`;
7. `app/docs/SOURCE-LOCK-C6-SKIP13-ROOT-FIX-SOURCE-GATE-SELFTEST-HARNESS-HOLD-20260807.md`;
8. `app/docs/SOURCE-LOCK-C6-SKIP13-FINGERPRINT-NAMESPACE-MISMATCH-STOP-RETRY-20260807.md`;
9. `backend/config/c6-skip13-auth-access-adjudication-request.json` — consumido/deshabilitado;
10. `app/docs/SOURCE-LOCK-C6-DIRECT-RUNNER-DEV-DEPLOY-PASS-20260807.md`;
11. `backend/config/c6-shopper-auth-final-freeze-v1.json`;
12. `backend/config/c6-shopper-auth-snapshot-rollback-manifest-v1.json`;
13. `backend/config/c6-accumulative-multirole-smoke-matrix-v1.json`;
14. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
15. addenda vigentes y PR #7.

## 2. Direct runner DEV

```text
DirectRunnerDEV=PASS
service=cxorbia-c6-direct-runner-dev
revision=cxorbia-c6-direct-runner-dev-00001-2vz
runtimeIsolation=PASS
providerBoundaryEnabled=false
```

## 3. SKIP13 namespace + harness

El contrato v2 permanece:

```text
profileFingerprintNamespace=deterministic-suffix-plan-profile
authCandidateFingerprintNamespace=shopper-auth-candidate-v1
memberProvenanceFingerprintNamespace=shopper-collision-member-v1
multiAuthProfileFingerprintNamespace=multi-auth-profile-v1
crossNamespaceEqualityAllowed=false
```

Root-fix aplicado:

```text
file=tools/qa/cxorbia-c6-shopper-equivalent-universe.mjs
commit=02bbca9371c2736a7ed993be6361eb1b84bfd0bf
blobSha=2055ed250c9fe1058759f582089fe112b84b9a06
```

Gates source-only:

```text
equivalentUniverseSyntax=PASS
directSelfTest=PASS_C6_EQUIVALENT_UNIVERSE_SOURCE_STATIC
foreignSelfTestArgvImportOutputBytes=0
crossNamespaceSelfTest=PASS_C6_SKIP13_FINGERPRINT_NAMESPACE_SELF_TEST
providerAttempt=false
```

No existe request provider v2 autorizado.

## 4. Auth congelado

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

## 5. Pendiente real

1. Nueva autorización para una única revalidación SKIP13 provider read-only usando contrato/adjudicador v2 corregidos.
2. Con SKIP13 cerrado, Auth 340 con snapshot/rollback.
3. Smoke multirrol.
4. Validación humana.
5. Cutover autorizado.

## 6. Estado seguro

```text
providerReadsThisBlock=0
AuthReads=0
claimsReads=0
membershipReads=0
HRReads=0
providerWrites=0
AuthWrites=0
FirestoreWrites=0
RulesWrites=0
StorageWrites=0
deploys=0
merge=false
production=false
```
