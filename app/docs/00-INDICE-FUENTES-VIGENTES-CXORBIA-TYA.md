# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-06  
**Estado:** ACTIVO Y RECONCILIADO  
**Estado vivo:** `C6_CONNECTOR_ACTIONS_NO_RUN_DIAGNOSTIC__ROOT_CAUSE_NOT_PROVEN__OBSERVABILITY_GAP_PROVEN__STOP_RETRY__AUTH_PLAN_FROZEN__NO_PROVIDER__NO_WRITES__NO_DEPLOY__NO_PRODUCTION`

## 1. Orden de prevalencia

1. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `app/docs/SOURCE-LOCK-C6-CONNECTOR-ACTIONS-NO-RUN-DIAGNOSTIC-STOP-RETRY-20260806.md`;
3. `app/docs/SOURCE-LOCK-C6-BASE-CONTROL-PLANE-NO-RUN-FAIL-CLOSED-20260806.md`;
4. `app/docs/SOURCE-LOCK-C6-PR7-MERGEABILITY-PASS-SKIP13-CONTROL-PLANE-HOLD-20260806.md`;
5. `backend/config/c6-skip13-auth-access-adjudication-request.json` — deshabilitado en la rama viva;
6. `backend/contracts/c6-skip13-auth-access-adjudication-v1.json`;
7. `tools/qa/cxorbia-c6-skip13-auth-access-adjudication-readonly.mjs`;
8. `.github/workflows/cxorbia-c6-skip13-auth-access-adjudication-readonly.yml`;
9. `app/docs/SOURCE-LOCK-C6-AUTH-SMOKE-FINAL-PREPARATION-HOLD-20260806.md`;
10. `backend/config/c6-shopper-auth-final-freeze-v1.json`;
11. `backend/config/c6-shopper-auth-snapshot-rollback-manifest-v1.json`;
12. `backend/config/c6-accumulative-multirole-smoke-matrix-v1.json`;
13. `app/docs/SOURCE-LOCK-C6-PRODUCTION-PROMOTION-PASS-20260806.md`;
14. `backend/config/cxorbia-production-promotion-contract.json`;
15. `app/docs/SOURCE-LOCK-C6-LIVE-HR-V4-REQUEST-30M-NO-RUN-EVIDENCE-20260806.md`;
16. `.github/cxorbia-firebase-requests/live-hr-current-reconcile.json`;
17. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
18. addenda vigentes de CAMBIOS, Claude, Pendientes, Academia y tracker;
19. `AGENTS.md`, PR #7 y HEAD vivo.

## 2. Diagnóstico del control plane

Se compararon:

```text
noRunCommit=d0e5c5527d001587366097dbb7667fc242029e9d
noRunWorkflowInstall=640125d08c76b9f333a02ae78ca538993f200e30
historicalSuccessCommit=457c5810c88427ac775e54626c9936ab094047e2
historicalRunId=29799752544
historicalJobId=88798094500
```

Hallazgos:

```text
branchPathOrderMismatch=false
repositoryWritePermissionMissing=false
historicalActionsRunExists=true
visibleActorSame=true
connectorReceivesPushEvents=false
connectorReceivesWorkflowRunEvents=false
exactWriteTokenTypeExposed=false
currentActionsPolicyExposed=false
workflowEnabledStateExposed=false
auditLogExposed=false
```

Dictamen:

```text
decision=STOP_RETRY_C6_CONNECTOR_ACTIONS_ROOT_CAUSE_NOT_PROVEN
provenBlocker=CONTROL_PLANE_OBSERVABILITY_AND_CREDENTIAL_ATTRIBUTION_INSUFFICIENT
newTrigger=0
newSKIP13Request=0
providerReadsThisBlock=0
```

No se declara supresión por token, workflow deshabilitado ni error del scheduler como causa raíz porque ninguna quedó demostrada.

## 3. SKIP13 y Auth

```text
SKIP13 profiles=13
blockingFingerprint=7cc28c78de9bfda01d14
adjudicationCompleted=false
providerReadConsumptionPreviousRequests=UNKNOWN
requestExecutable=false
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

## 4. Estrategia de producción

```text
strategy=PROMOTE_EXISTING_CLEAN_PROJECT
project=cxorbia-backend-dev
promotionGate=PASS_PRODUCTION_PROMOTION_CONTRACT_EXISTING_CLEAN_PROJECT
writes/deploy/merge/cutover autorizados=false
```

## 5. Request HR v4

```text
requestCommit=ac2032ec224e6d56bf087788b949691b6690c437
providerReadConsumption=UNKNOWN_NO_RUN_JOB_OR_CHECKPOINT_EVIDENCE
STOP_RETRY=true
segundo trigger=0
```

## 6. Pendiente real

1. No reutilizar ni reemitir requests SKIP13.
2. Obtener una superficie administrativa read-only que exponga Actions permissions, workflow state, audit log, identidad exacta del token o listado integral de runs.
3. Solo con causa demostrada, definir un mecanismo nuevo y autorizar por separado la adjudicación.
4. Reconciliar HR v4 y confirmar HR viva.
5. Autorizar por separado snapshot y repair Auth.
6. Ejecutar readback, smoke acumulativo multirol, validación humana y rollback.
7. Autorizar específicamente el único cutover.

## 7. Estado seguro

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
