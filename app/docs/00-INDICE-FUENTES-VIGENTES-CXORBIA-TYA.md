# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-07  
**Estado:** ACTIVO Y RECONCILIADO  
**Estado vivo:** `C6_AUTH_UPDATE_UNIVERSE_BATCH_PASS__PLAN_V4_340_HOLD0__36_ZERO_9_UNIQUE__ZERO_AUTH_WRITES__NO_PRODUCTION`

## 1. Orden de prevalencia

1. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `app/docs/SOURCE-LOCK-C6-AUTH-UPDATE-UNIVERSE-BATCH-PLAN-V4-PASS-20260807.md`;
3. `app/docs/evidence/C6-AUTH-UPDATE-UNIVERSE-BATCH-REVALIDATION-PLAN-V4-PASS-20260807.json`;
4. `backend/config/c6-shopper-auth-final-freeze-v4.json` — freeze rector actual;
5. `backend/contracts/c6-auth-update-universe-batch-revalidation-v1.json`;
6. `tools/qa/cxorbia-c6-auth-update-universe-batch-revalidation-v3.mjs` — herramienta terminal del batch;
7. `backend/config/c6-auth-update-universe-batch-revalidation-request-v5.json` — consumido/deshabilitado;
8. `backend/config/c6-shopper-auth-final-freeze-v3.json` — plan v3 histórico, sustituido por v4;
9. `backend/contracts/c6-auth-activation-dev-v2.json` — histórico del PREWRITE v3; no ejecutar contra v4 sin contrato actualizado;
10. `app/docs/SOURCE-LOCK-C6-AUTH-DIGEST-PASS-PHASE2-PREWRITE-SYSTEMIC-UPDATE-RISK-STOP-RETRY-20260807.md` — histórico que originó el batch;
11. `app/docs/evidence/C6-AUTH-ACTIVATION-V2-PREWRITE-SYSTEMIC-SUFFIX-COLLISION-RISK-20260807.json`;
12. `app/docs/SOURCE-LOCK-C6-AUTH-TARGET-ADAPTIVE-LINEAGE-ROOT-CAUSE-CROSS-ROW-PRINCIPAL-ALIAS-STOP-RETRY-20260807.md`;
13. `app/docs/SOURCE-LOCK-C6-MULTI-AUTH-FINAL-DISCRIMINATOR-TENANT-ADJUDICATION-STOP-RETRY-20260807.md`;
14. `app/docs/SOURCE-LOCK-C6-DIRECT-RUNNER-DEV-DEPLOY-PASS-20260807.md`;
15. `backend/config/c6-shopper-auth-snapshot-rollback-manifest-v1.json`;
16. `backend/config/c6-accumulative-multirole-smoke-matrix-v1.json`;
17. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
18. addenda vigentes y PR #7.

## 2. Estado rector

```text
DirectRunnerDEV=PASS
AuthExecuted=false
Production=false
SKIP13=closed 13/13
MultiAuthAdjudication=closed
TargetLineage(ac93)=closed
CrossRowPrincipalAliasRootCause=closed
UpdateUniverseBatch=PASS
ProviderAttemptsCurrentBatch=1
SecondProviderAttempt=false
AuthWritesCurrentBatch=0
```

## 3. Plan v4 congelado

```text
rows=340
uniqueRows=340
CREATE_AUTH=118
UPDATE_AUTH=9
NO_OP=81
HOLD=0
PRESERVE_NO_AUTH=132
emailChanges=2
passwordChanges=8
claimsChanges=1
expectedAuthUsersBefore=110
expectedAuthUsersAfter=228
digest=c0c31fadb88928f5fc0b8a19248188c8610e13362608f1bae3e267034f893ba4
executable=false
reason=BATCH_REVALIDATION_COMPLETE_PENDING_SEPARATE_PREWRITE_AUTH_AUTHORIZATION
```

## 4. Batch terminal

```text
runId=31236820249
jobId=93050768996
artifactId=9015681941
artifactDigest=sha256:6c1d93c58853c01682ce54bafab5f03d116a0586b9658d59323bfae7d3db3263
providerDecision=PASS_C6_AUTH_UPDATE_UNIVERSE_BATCH_REVALIDATION_PLAN_V4
rowsClassified=45
candidateCount0=36
candidateCount1=9
candidateCount>1=0
unresolved=0
crossRow=0
```

El workflow global terminó `failure` solo por `SOURCE_SAFE_VERIFIER_FALSE_POSITIVE_CHANGE_COUNT_EMAIL_KEY`: el regex confundió `subchangeCounts.email=2` con correo crudo. Validación estructural offline del artefacto: raw UID/shopperId/passwordHash/passwordSalt=0; email values sensibles=0. No hubo segundo provider attempt.

## 5. Fail-close

Todos los requests v1..v5 del batch están consumidos/deshabilitados. Todos los workflows one-shot v1..v5 fueron retirados. No hay ejecución latente. Provider/Auth/Firestore/HR/Rules/Storage writes=0; deploys=0; merge=false; production=false.

## 6. Siguiente acción exacta

Solo bajo nueva autorización: `C6 AUTH PLAN V4 PREWRITE + ACTIVATION DEV`.

Debe partir exclusivamente del freeze v4/digest `c0c31fad...93ba4`, validar 118 CREATE y 9 UPDATE, comprobar rollback exacto solo para 8 password updates existentes, generar snapshot cifrado antes del write boundary, exigir principal/candidate uniqueness y población 110->228. Solo con PREWRITE PASS ejecutar Auth DEV. No reabrir las 45 UPDATE del plan v3 ni volver a SKIP13/multi-Auth/lineage.

## 7. Phase A preservada

Frontend, Login, `CX.data`, HR histórico, shoppers, postulaciones, certificaciones, visitas, liquidaciones/pagos, Finanzas, Portal Cliente, Portal Shopper, Reservas, multi-tenant, multi-proyecto, sincronización HR/plataforma y Academia permanecen preservados.
