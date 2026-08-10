# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-10  
**Estado:** ACTIVO Y RECONCILIADO  
**Estado vivo:** `C6_SMOKE_READONLY_STOP_IDENTITY_SCOPE_FINDINGS__AUTH_DEV_228_PRESERVED__ZERO_WRITES__NO_SECOND_SMOKE__NO_PRODUCTION`

## 1. Orden de prevalencia

1. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `app/docs/SOURCE-LOCK-C6-ACCUMULATIVE-MULTIROLE-SMOKE-READONLY-IDENTITY-SCOPE-STOP-RETRY-20260810.md`;
3. `app/docs/evidence/C6-ACCUMULATIVE-MULTIROLE-SMOKE-READONLY-IDENTITY-SCOPE-STOP-RETRY-20260810.json`;
4. `backend/config/c6-accumulative-multirole-smoke-readonly-request-v1.json` — consumido/deshabilitado;
5. `tools/qa/cxorbia-c6-accumulative-multirole-smoke-readonly-v1.mjs` — herramienta source-only actual, sin workflow provider activo;
6. `backend/config/c6-shopper-auth-final-freeze-v4.json` — freeze Auth rector;
7. `backend/config/c6-auth-plan-v4-activation-dev-request-v3.json` — Activation Auth PASS, consumido/deshabilitado;
8. `app/docs/SOURCE-LOCK-C6-AUTH-V4-ACTIVATION-PASS-SMOKE-CREDENTIAL-LIFECYCLE-STOP-RETRY-20260810.md` — histórico inmediato previo;
9. `app/docs/evidence/C6-AUTH-V4-ACTIVATION-PASS-SMOKE-CREDENTIAL-LIFECYCLE-STOP-RETRY-20260810.json`;
10. `backend/config/c6-accumulative-multirole-smoke-matrix-v1.json` — matriz rectora de superficies;
11. `backend/contracts/c6-auth-plan-v4-activation-dev-v1.json`;
12. source locks históricos de HashConfig, update-universe, multi-Auth y direct runner;
13. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
14. addenda vigentes y PR #7.

## 2. Estado rector

```text
DirectRunnerDEV=PASS
AuthPlanV4=FROZEN
AuthPlanV4Digest=c0c31fadb88928f5fc0b8a19248188c8610e13362608f1bae3e267034f893ba4
AuthExecuted=true
AuthUsersAfter=228
Readback=PASS
RollbackDryRun=PASS
Production=false
SKIP13=closed 13/13
MultiAuthAdjudication=closed
TargetLineage(ac93)=closed
HashConfig=closed PASS
SmokeCredentialLifecycle=PASS_SOURCE_ONLY_AND_RUNTIME
SmokeProviderAttempts=1
SmokeProviderReads=1
SecondSmokeProviderAttempt=false
CurrentBlock=STOP_RETRY_IDENTITY_SCOPE_FINDINGS
DuplicateProviderEmailGroups=5
UnknownEnabledRoles=4
AdminTenantScopeOutliers=1
ShopperTargetOrIdentityScopeOutliers=1
PhaseASourceSurfaces=20/20
SmokeRequest=consumed/disabled
```

## 3. Auth baseline protegido

```text
rows=340
CREATE_AUTH=118
UPDATE_AUTH=9
HOLD=0
passwordChanges=8
expectedAuthUsersAfter=228
digest=c0c31fadb88928f5fc0b8a19248188c8610e13362608f1bae3e267034f893ba4
```

No repetir PREWRITE, Activation ni reconstrucción completa de identidad.

## 4. Terminal del smoke actual

```text
sourceGateCommit=51dd4fb37a45caaf949392418dbbbc58a8823ac0
sourceGateRunId=31424489260
requestCommit=b577d8fcefc57c6743cf2dd3689c51a22e691a5b
runId=31424532292
jobId=93572980396
artifactId=9076650610
artifactDigest=sha256:78844e2fd0a0ce6137543f14802a91522377926ab04bb4cb8ce5bd7789f0545c
decision=STOP_RETRY_C6_ACCUMULATIVE_MULTIROLE_SMOKE_READONLY
errorCode=DUPLICATE_PROVIDER_EMAILS
providerReads=1
providerWrites=0
AuthWrites=0
rawPIIExported=false
```

## 5. Hallazgos source-safe

```text
AuthPopulation=228
Enabled=227
Disabled=1
DuplicateProviderEmailGroups=5
UnknownEnabledRoles=4
AdminOperaciones.enabled=11
AdminOperaciones.tenantAllowed=10
Shopper.enabled=209
Shopper.targetScoped=208
Shopper.shopperScopePresent=208
Cliente.enabled=3
Cliente.targetScoped=3
PhaseASourceSurfaces=20/20
```

Estos conjuntos no han sido adjudicados individualmente y pueden solaparse.

## 6. Fail-close

```text
requestSmoke=consumed/disabled
allowedExecutions=0
executionWorkflow=removed
sourceGateWorkflow=removed
secondSmokeProviderAttempt=false
AuthWrites=0
IAMWrites=0
FirestoreWrites=0
HRWrites=0
RulesWrites=0
StorageWrites=0
deploys=0
merge=false
production=false
```

## 7. Siguiente acción exacta

Solo bajo autorización nueva:

`C6 AUTH READ-ONLY SMOKE FINDINGS ADJUDICATION`.

Debe adjudicar exclusivamente los cinco grupos de email duplicado, cuatro roles habilitados fuera de contrato, un Admin/Operaciones fuera de tenant scope y un Shopper con scope objetivo incompleto. Una sola lectura provider, source-safe, sin PII ni writes y sin ejecutar nuevo smoke.

## 8. Phase A preservada

Frontend, Login, `CX.data`, HR histórico, shoppers, postulaciones, certificaciones, visitas, liquidaciones/pagos, Finanzas, Portal Cliente, Portal Shopper, Reservas, multi-tenant, multi-proyecto, sincronización HR/plataforma y Academia permanecen preservados.
