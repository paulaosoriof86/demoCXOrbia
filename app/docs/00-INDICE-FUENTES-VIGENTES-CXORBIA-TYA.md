# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-07  
**Estado:** ACTIVO Y RECONCILIADO  
**Estado vivo:** `C6_DIRECT_RUNNER_DEV_PASS__SKIP13_HOLD_FINGERPRINT_NAMESPACE_MISMATCH__ZERO_AUTH_MEMBERSHIP_READS__AUTH_PLAN_FROZEN__NO_PRODUCTION`

## 1. Orden de prevalencia

1. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `app/docs/SOURCE-LOCK-C6-SKIP13-FINGERPRINT-NAMESPACE-MISMATCH-STOP-RETRY-20260807.md`;
3. `app/docs/DIAGNOSTICO-CAUSA-RAIZ-C6-RUTA-PRODUCCION-20260807.md`;
4. `backend/config/c6-skip13-auth-access-adjudication-request.json` — consumido/deshabilitado;
5. `backend/contracts/c6-skip13-auth-access-adjudication-v1.json`;
6. `tools/qa/cxorbia-c6-skip13-auth-access-adjudication-readonly.mjs`;
7. `.github/workflows/cxorbia-c6-skip13-auth-access-adjudication-readonly.yml`;
8. `app/docs/SOURCE-LOCK-C6-DIRECT-RUNNER-DEV-DEPLOY-PASS-20260807.md`;
9. `backend/contracts/c6-direct-trusted-runner-dev-v2.json`;
10. `backend/contracts/c6-execution-control-plane-v2.json`;
11. `backend/contracts/c6-runtime-identity-isolated-final-v2.json`;
12. `backend/runtime/c6-direct-trusted-runner/server.mjs`;
13. `tools/qa/cxorbia-c6-direct-runner-source-gate-v2.mjs`;
14. `backend/config/c6-shopper-auth-final-freeze-v1.json`;
15. `backend/config/c6-shopper-auth-snapshot-rollback-manifest-v1.json`;
16. `backend/config/c6-accumulative-multirole-smoke-matrix-v1.json`;
17. `tools/qa/cxorbia-c6-shopper-deterministic-suffix-readonly.mjs`;
18. `tools/qa/cxorbia-c6-shopper-equivalent-universe.mjs`;
19. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
20. addenda vigentes de CAMBIOS, Claude, Pendientes, Academia y tracker;
21. `AGENTS.md`, PR #7 y HEAD vivo.

## 2. Direct trusted runner DEV — PASS preservado

```text
service=cxorbia-c6-direct-runner-dev
region=us-central1
runtime=cxorbia-c6-runner-dev@cxorbia-backend-dev.iam.gserviceaccount.com
runtimeUniqueId=112507526829412676643
runtimeFingerprint=ed8f84baa824b89305a8e6ab16af43c51ff555c72e3c940aeb0ef1339e5c2460
sourceLock=5c467be8d7359e66b6362a07dd3908ada3cf1c17
decision=PASS_C6_DIRECT_RUNNER_DEV_DEPLOY_V3
revision=cxorbia-c6-direct-runner-dev-00001-2vz
private=true
providerBoundaryEnabled=false
```

Evidencia terminal:

```text
runId=31186229092
jobId=92891340577
cloudBuildId=2ae79aa7-574b-483f-90c1-25e6ee3161b0
artifactId=8996863935
artifactDigest=sha256:d1c5b954bc69c2874aeb1e77136b53bf2b3d1699e1e1b03efddf198d8c0d8a0d
cloudBuildsExecuted=1
cloudRunDeploysExecuted=1
```

## 3. SKIP13 — STOP_RETRY por namespace

```text
requestId=c6-skip13-auth-access-adjudication-20260807-06
requestCommit=313597f561315ff9f8c75c5a7be741a8cbac5d70
runId=31188368926
jobId=92898589212
artifactId=8997714548
artifactDigest=sha256:9dd0cee0aa205071fa82afb22f69d0cdf29b54d9d8d4b2f6462c58c22fd1e30d
decision=HOLD_C6_SKIP13_ADJUDICATION_TECHNICAL_ERROR
error=all_skip13_profile_ids_resolved:0
```

Lecturas consumidas:

```text
shopperIdIndexBaseline=340
profileIdIndexQueries=1
resolvedSkip13Profiles=0
authListPages=0
membershipPointReads=0
membershipFieldQueries=0
hrReads=0
```

No se alcanzaron Auth, claims ni memberships.

## 4. Causa raíz SKIP13

El plan Auth genera el `profileFp` mediante:

```text
fp('deterministic-suffix-plan-profile', profile.id)
```

El adjudicador intentó resolver ese set con:

```text
stableMemberFingerprint(profileId)
namespace=shopper-collision-member-v1
```

Son namespaces distintos. El namespace `shopper-collision-member-v1` corresponde a member provenance de grupos del universo equivalente, no al profile fingerprint del plan de Auth.

El contrato de adjudicación tampoco declara explícitamente el namespace de `profileFingerprint`, lo que permitió el cruce semántico.

## 5. Fail-close SKIP13

```text
failCloseCommit=3966dac8a42404f35245c474f975f696c9cb9f0e
requestEnabled=false
requestConsumed=true
allowedExecutions=0
secondProviderAttempt=false
```

El run posterior `31188638266`, provocado por el commit de fail-close, saltó claim, credential preparation y adjudication; no hubo segunda lectura provider.

## 6. Auth congelado

```text
rows=340
CREATE_AUTH=81
UPDATE_AUTH=46
NO_OP=73
HOLD=0
PRESERVE_NO_AUTH=140
planDigest=6060f406a33d4ba926c982871513f8e86ba2b10f44c2da00ab43bd2a409f721b
freezeDecision=PASS_AUTH_PLAN_340_CRYPTOGRAPHIC_FREEZE
AuthExecuted=false
```

## 7. Pendiente real

1. Root-fix source-only del namespace SKIP13: `deterministic-suffix-plan-profile`.
2. Declarar namespaces explícitos en el contrato y agregar self-test cross-namespace.
3. Solo con source gate PASS y autorización nueva, una única adjudicación SKIP13 read-only corregida.
4. Con SKIP13 cerrado, ejecutar Auth sobre las 340 filas con snapshot/rollback.
5. Smoke acumulativo Admin/Operaciones, Shopper y Cliente.
6. Validación humana.
7. Cutover/promoción autorizada a producción.

## 8. Estado seguro

```text
DirectRunnerDEV=PASS
SKIP13 shopper-id index queries=1
SKIP13 Auth reads=0
SKIP13 claims reads=0
SKIP13 membership reads=0
HR reads=0
provider writes=0
Auth writes=0
Firestore writes=0
Rules writes=0
Storage writes=0
HR writes=0
Hosting deploys=0
additional Cloud Builds=0
additional Cloud Run deploys=0
merge=false
production=false
providerBoundaryEnabled=false
```
