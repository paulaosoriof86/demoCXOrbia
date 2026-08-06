# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-06  
**Estado:** ACTIVO Y RECONCILIADO  
**Estado vivo:** `C6_GITHUB_ACTIONS_OUTAGE_ROOT_CAUSE_PROVEN__WEBHOOK_THROTTLING__CONTROL_PLANE_V2_PREPARED__REQUEST_DISABLED__AUTH_PLAN_FROZEN__NO_PROVIDER__NO_WRITES__NO_DEPLOY__NO_PRODUCTION`

## 1. Orden de prevalencia

1. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `app/docs/SOURCE-LOCK-C6-GITHUB-ACTIONS-OUTAGE-ROOT-CAUSE-AND-FAILOVER-20260806.md`;
3. `backend/contracts/c6-execution-control-plane-v2.json`;
4. `tools/qa/cxorbia-c6-control-plane-preflight.mjs`;
5. `app/docs/SOURCE-LOCK-C6-CONNECTOR-ACTIONS-NO-RUN-DIAGNOSTIC-STOP-RETRY-20260806.md`;
6. `app/docs/SOURCE-LOCK-C6-BASE-CONTROL-PLANE-NO-RUN-FAIL-CLOSED-20260806.md`;
7. `backend/config/c6-skip13-auth-access-adjudication-request.json` — deshabilitado;
8. `backend/contracts/c6-skip13-auth-access-adjudication-v1.json`;
9. `tools/qa/cxorbia-c6-skip13-auth-access-adjudication-readonly.mjs`;
10. `.github/workflows/cxorbia-c6-skip13-auth-access-adjudication-readonly.yml`;
11. `app/docs/SOURCE-LOCK-C6-AUTH-SMOKE-FINAL-PREPARATION-HOLD-20260806.md`;
12. `backend/config/c6-shopper-auth-final-freeze-v1.json`;
13. `backend/config/c6-shopper-auth-snapshot-rollback-manifest-v1.json`;
14. `backend/config/c6-accumulative-multirole-smoke-matrix-v1.json`;
15. `app/docs/SOURCE-LOCK-C6-PRODUCTION-PROMOTION-PASS-20260806.md`;
16. `backend/config/cxorbia-production-promotion-contract.json`;
17. `app/docs/SOURCE-LOCK-C6-LIVE-HR-V4-REQUEST-30M-NO-RUN-EVIDENCE-20260806.md`;
18. `.github/cxorbia-firebase-requests/live-hr-current-reconcile.json`;
19. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
20. addenda vigentes de CAMBIOS, Claude, Pendientes, Academia y tracker;
21. `AGENTS.md`, PR #7 y HEAD vivo.

## 2. Causa raíz demostrada

Incidente oficial:

```text
incidentId=qcvjkzcs7j74
component=GitHub Actions
status=investigating
impact=critical
componentStatus=major_outage
```

GitHub informó que los triggers webhook permanecían limitados y que muchos eventos `push` y `pull_request` no estaban creando runs. Una actualización anterior reportó procesamiento aproximado de 15% de los webhooks.

```text
rootCause=EXTERNAL_GITHUB_ACTIONS_MAJOR_OUTAGE_AND_WEBHOOK_TRIGGER_THROTTLING
repoWorkflowFaultProven=false
branchPathOrderMismatch=false
repositoryWritePermissionMissing=false
tokenSuppressionRequired=false
```

## 3. Recuperación parcial observable

El HEAD `2d4d760b492bd25d6c91b03151ff1be1cbe0d5dc` materializó posteriormente:

```text
runId=31129990397
jobId=92716480291
workflow=CXOrbia C6 SKIP13 Auth Access Adjudication Readonly
conclusion=success
requestOnly=false
executable=false
status=SKIPPED_NON_REQUEST_EVENT
providerReads=0
```

Esto valida el workflow y sus guards, pero no adjudica SKIP13.

## 4. Solución de control plane preparada

```text
primaryLane=github_actions_explicit_dispatch
primaryEvent=workflow_dispatch
commitPushAsProviderSignal=false
preflight=tools/qa/cxorbia-c6-control-plane-preflight.mjs
```

El preflight exige Actions operativo, incidente resuelto, throughput restaurado, `runId`, `jobId`, coincidencia de request/source lock y claim previo a provider.

```text
fallbackLane=direct_trusted_runner
fallbackStatus=DESIGN_ONLY_NOT_DEPLOYED
independentOfGitHubActions=true
```

El carril directo requiere autorización separada de despliegue.

## 5. SKIP13 y Auth

```text
SKIP13 profiles=13
blockingFingerprint=7cc28c78de9bfda01d14
adjudicationCompleted=false
requestExecutable=false
providerReadConsumptionPreviousRequests=UNKNOWN
```

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
```

Auth no ha sido ejecutado.

## 6. Request HR v4

```text
requestCommit=ac2032ec224e6d56bf087788b949691b6690c437
providerReadConsumption=UNKNOWN_NO_RUN_JOB_OR_CHECKPOINT_EVIDENCE
STOP_RETRY=true
segundoTrigger=0
```

## 7. Pendiente real

1. No emitir requests por commit ni usar push como señal provider.
2. Esperar incidente `qcvjkzcs7j74` resuelto y Actions operativo.
3. Ejecutar el preflight del control plane v2.
4. Autorizar una única adjudicación SKIP13 mediante dispatch explícito observable.
5. Autorizar separadamente el carril directo autenticado independiente de Actions.
6. Continuar snapshot, repair Auth, readback, smoke, validación humana y cutover mediante gates separados.

## 8. Estado seguro

```text
provider reads this block=0
provider writes=0
HR reads=0
Auth/password/claims/membership writes=0
Firestore/Rules/Storage/HR writes=0
Hosting/Cloud Run deploys=0
Make/Gemini/payments=0
merge=false
production=false
requestExecutable=false
```
