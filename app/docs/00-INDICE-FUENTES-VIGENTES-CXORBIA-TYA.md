# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-06  
**Estado:** ACTIVO Y RECONCILIADO  
**Estado vivo:** `C6_AUTH_PLAN_340_FREEZE_PASS__IDEMPOTENCY_PASS__SMOKE_MATRIX_PREPARED__SKIPPED_ACCESS_RISK_HOLD__PRODUCTION_PROMOTION_PASS__LIVE_HR_V4_UNRESOLVED__NO_WRITES__NO_DEPLOY__NO_PRODUCTION`

## 1. Orden de prevalencia

1. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `app/docs/SOURCE-LOCK-C6-AUTH-SMOKE-FINAL-PREPARATION-HOLD-20260806.md`;
3. `app/docs/evidence/C6-AUTH-SMOKE-FINAL-PREPARATION-LATEST.json`;
4. `backend/config/c6-shopper-auth-final-freeze-v1.json`;
5. `backend/config/c6-shopper-auth-snapshot-rollback-manifest-v1.json`;
6. `backend/config/c6-accumulative-multirole-smoke-matrix-v1.json`;
7. `tools/qa/cxorbia-c6-auth-smoke-final-preparation-source-only.mjs`;
8. `app/docs/SOURCE-LOCK-C6-PRODUCTION-PROMOTION-PASS-20260806.md`;
9. `app/docs/evidence/C6-PRODUCTION-TARGET-PREFLIGHT-LATEST.json`;
10. `backend/config/cxorbia-production-promotion-contract.json`;
11. `app/docs/SOURCE-LOCK-C6-LIVE-HR-V4-REQUEST-30M-NO-RUN-EVIDENCE-20260806.md`;
12. `.github/cxorbia-firebase-requests/live-hr-current-reconcile.json`;
13. `app/docs/SOURCE-LOCK-C6-SKIP13-AUTH-DISPOSITION-20260806.md`;
14. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
15. addenda vigentes de CAMBIOS, Claude, Pendientes, Academia y tracker;
16. `AGENTS.md`, PR #7 y HEAD vivo.

## 2. Plan Auth congelado

```text
sourceHead=df65bb45629588b7906b957551108a3a5c71b763
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

No se copiaron filas crudas ni PII al repositorio.

## 3. Gate pre-write

```text
nodeCheck=PASS
exitCode=2 esperado fail-closed
failedChecks=0
idempotency=PASS_PREWRITE_IDEMPOTENCY_CONTRACT
smokeMatrix=PREPARED_NOT_EXECUTED
overall=HOLD_C6_AUTH_PREWRITE_SKIPPED_ACCESS_RISK_UNRESOLVED
```

Bloqueo exacto:

```text
skippedProfiles=13
blockingFingerprint=7cc28c78de9bfda01d14
providerCandidates=2
enabledCandidates=2
emailVerifiedCandidates=2
unplannedEffectiveAccessProvenAbsent=false
```

Auth no puede ejecutarse hasta una adjudicación read-only de memberships/claims limitada al conjunto SKIP13.

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

1. adjudicación read-only Auth/membership/claims de SKIP13;
2. evidencia terminal HR v4 y PASS HR viva;
3. autorización separada para snapshot y repair Auth;
4. readback y smoke acumulativo multirol;
5. validación humana, rollback y autorización específica de cutover.

## 7. Estado seguro

```text
providerReads=0
provider/HR/Firestore/Auth/Rules/Storage writes=0
Hosting/Cloud Run deploys=0
Make/Gemini/payments=0
merge=false
production=false
```
