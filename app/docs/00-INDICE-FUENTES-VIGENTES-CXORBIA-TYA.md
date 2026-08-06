# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-06  
**Estado:** ACTIVO Y RECONCILIADO  
**Estado vivo:** `C6_BASE_CONTROL_PLANE_NO_RUN__TEMP_FILES_REMOVED__CONSUMPTION_UNKNOWN__STOP_RETRY__AUTH_PLAN_FROZEN__PRODUCTION_PROMOTION_PASS__LIVE_HR_V4_UNRESOLVED__NO_WRITES__NO_DEPLOY__NO_PRODUCTION`

## 1. Orden de prevalencia

1. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `app/docs/SOURCE-LOCK-C6-BASE-CONTROL-PLANE-NO-RUN-FAIL-CLOSED-20260806.md`;
3. `app/docs/SOURCE-LOCK-C6-PR7-MERGEABILITY-PASS-SKIP13-CONTROL-PLANE-HOLD-20260806.md`;
4. `app/docs/SOURCE-LOCK-C6-SKIP13-AUTH-ACCESS-ADJUDICATION-20M-NO-RUN-EVIDENCE-20260806.md`;
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

## 2. Último intento autorizado de adjudicación SKIP13

```text
controlPlaneBranch=release/cxorbia-tya-rc-20260630
sourceLockHead=c694b75288873b1e3c1b0e70ed5bd86bc225d33e
workflowInstallCommit=640125d08c76b9f333a02ae78ca538993f200e30
requestId=c6-skip13-control-plane-20260806-01
requestCommit=d0e5c5527d001587366097dbb7667fc242029e9d
profiles=13
blockingFingerprint=7cc28c78de9bfda01d14
```

No se recuperaron runId, jobId, steps, artifact, claim status, overall status ni comentario terminal.

```text
workflowRunExistence=NOT_OBSERVED
providerBoundaryProvenReached=false
providerReadConsumption=UNKNOWN_NO_RUN_JOB_STATUS_OR_ARTIFACT_EVIDENCE
adjudicationCompleted=false
unplannedEffectiveAccessDetermined=false
secondAttempt=0
STOP_RETRY=true
```

El workflow y el request temporales fueron retirados en `baf7231b8df7b621c62c57ac1cd966b4a17763e6` y `4a85e7e4d0eb31691d7b77e3551ed7cafabb5984`. No queda request ejecutable en la rama base.

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

1. No reutilizar ninguno de los requests SKIP13 emitidos.
2. Diagnosticar por un carril source-control read-only distinto por qué los commits del conector no materializan un run observable.
3. Solo después, solicitar autorización separada para un mecanismo nuevo de adjudicación.
4. Reconciliar HR v4 y confirmar HR viva.
5. Autorizar por separado snapshot y repair Auth.
6. Ejecutar readback, smoke acumulativo multirol, validación humana y rollback.
7. Autorizar específicamente el único cutover.

## 7. Estado seguro

```text
provider read consumption SKIP13=UNKNOWN
provider writes=0
HR reads del bloque=0
Auth/password/claims/membership writes=0
Firestore/Rules/Storage/HR writes=0
Hosting/Cloud Run deploys=0
Make/Gemini/payments=0
merge=false
production=false
baseTemporaryWorkflow=false
baseTemporaryRequest=false
```
