# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-06  
**Estado:** ACTIVO Y RECONCILIADO  
**Estado vivo:** `C6_SKIP13_ADJUDICATION_REQUEST_EMITTED__20M_NO_RUN_JOB_STATUS_EVIDENCE__CONSUMPTION_UNKNOWN__STOP_RETRY__AUTH_PLAN_FROZEN__PRODUCTION_PROMOTION_PASS__LIVE_HR_V4_UNRESOLVED__NO_WRITES__NO_DEPLOY__NO_PRODUCTION`

## 1. Orden de prevalencia

1. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `app/docs/SOURCE-LOCK-C6-SKIP13-AUTH-ACCESS-ADJUDICATION-20M-NO-RUN-EVIDENCE-20260806.md`;
3. `app/docs/evidence/C6-SKIP13-AUTH-ACCESS-ADJUDICATION-20M-NO-RUN-EVIDENCE-LATEST.json`;
4. `backend/config/c6-skip13-auth-access-adjudication-request.json`;
5. `backend/contracts/c6-skip13-auth-access-adjudication-v1.json`;
6. `tools/qa/cxorbia-c6-skip13-auth-access-adjudication-readonly.mjs`;
7. `.github/workflows/cxorbia-c6-skip13-auth-access-adjudication-readonly.yml`;
8. `app/docs/SOURCE-LOCK-C6-AUTH-SMOKE-FINAL-PREPARATION-HOLD-20260806.md`;
9. `app/docs/evidence/C6-AUTH-SMOKE-FINAL-PREPARATION-LATEST.json`;
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

## 2. Adjudicación SKIP13

```text
requestCommit=2eef8b70f2bd2d8570a7f3cc117e217851dd6964
targetHead=9e7b53f8b468970d8ee174e114693074bfc7a67a
skipProfiles=13
blockingFingerprint=7cc28c78de9bfda01d14
secondTrigger=0
```

Tras 1,227 segundos no se recuperaron runId, jobId, steps, artifact ni status terminal.

```text
workflowRunExistence=UNKNOWN_AFTER_20M_OBSERVATION
providerReadConsumption=UNKNOWN_NO_RUN_JOB_STATUS_OR_CHECKPOINT_EVIDENCE
adjudicationCompleted=false
unplannedEffectiveAccessDetermined=false
STOP_RETRY=true
```

No declarar provider reads cero o consumidos. Cualquier evidencia tardía debe reconciliarse únicamente contra el request commit exacto.

## 3. Plan Auth congelado

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

SKIP13 e historia permanecen preservados. Auth no ha sido ejecutado.

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

No están confirmados `2026-08`, GT/HN, mutación histórica ni `sourceRevision` transversal.

## 6. Pendiente real

1. reconciliar evidencia tardía de la adjudicación SKIP13 exacta;
2. cerrar acceso efectivo residual;
3. reconciliar evidencia terminal HR v4 y confirmar HR viva;
4. autorización separada para snapshot y repair Auth;
5. readback, smoke acumulativo multirol, validación humana y rollback;
6. autorización específica y único cutover.

## 7. Estado seguro

```text
provider read consumption SKIP13=UNKNOWN
provider writes=0
HR reads del bloque=0
Auth/password/membership writes=0
Firestore/Rules/Storage/HR writes=0
Hosting/Cloud Run deploys=0
Make/Gemini/payments=0
merge=false
production=false
```
