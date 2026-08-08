# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-07  
**Estado:** ACTIVO Y RECONCILIADO  
**Estado vivo:** `C6_AUTH_PLAN_V4_PREWRITE_STOP_HASH_CONFIG_REQUEST_SHAPE__ZERO_AUTH_WRITES__NO_SECOND_PROVIDER_ATTEMPT__NO_PRODUCTION`

## 1. Orden de prevalencia

1. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `app/docs/SOURCE-LOCK-C6-AUTH-PLAN-V4-PREWRITE-HASH-CONFIG-STOP-RETRY-20260807.md`;
3. `app/docs/evidence/C6-AUTH-PLAN-V4-PREWRITE-HASH-CONFIG-STOP-RETRY-20260807.json`;
4. `backend/config/c6-shopper-auth-final-freeze-v4.json` — freeze rector actual, sin cambios;
5. `backend/contracts/c6-auth-plan-v4-activation-dev-v1.json`;
6. `tools/qa/cxorbia-c6-auth-plan-v4-activation-dev-v1.mjs`;
7. `backend/config/c6-auth-plan-v4-activation-dev-request-v1.json` — consumido/deshabilitado;
8. `app/docs/SOURCE-LOCK-C6-AUTH-UPDATE-UNIVERSE-BATCH-PLAN-V4-PASS-20260807.md` — histórico inmediato que congeló v4;
9. `app/docs/evidence/C6-AUTH-UPDATE-UNIVERSE-BATCH-REVALIDATION-PLAN-V4-PASS-20260807.json`;
10. `backend/contracts/c6-auth-update-universe-batch-revalidation-v1.json`;
11. `tools/qa/cxorbia-c6-auth-update-universe-batch-revalidation-v3.mjs`;
12. `backend/config/c6-shopper-auth-final-freeze-v3.json` — histórico, no ejecutar;
13. `app/docs/SOURCE-LOCK-C6-MULTI-AUTH-FINAL-DISCRIMINATOR-TENANT-ADJUDICATION-STOP-RETRY-20260807.md` — identidad cerrada;
14. `app/docs/SOURCE-LOCK-C6-DIRECT-RUNNER-DEV-DEPLOY-PASS-20260807.md`;
15. `backend/config/c6-shopper-auth-snapshot-rollback-manifest-v1.json`;
16. `backend/config/c6-accumulative-multirole-smoke-matrix-v1.json`;
17. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
18. addenda vigentes y PR #7.

## 2. Estado rector

```text
DirectRunnerDEV=PASS
AuthPlanV4=FROZEN
AuthPlanV4Digest=c0c31fadb88928f5fc0b8a19248188c8610e13362608f1bae3e267034f893ba4
AuthExecuted=false
Production=false
SKIP13=closed 13/13
MultiAuthAdjudication=closed
TargetLineage(ac93)=closed
UpdateUniverseBatch=closed PASS
PlanV4Prewrite=STOP_RETRY_HASH_CONFIG_HTTP_400
ProviderAttemptsCurrentBlock=1
SecondProviderAttempt=false
WriteBoundaryEntered=false
AuthWritesCurrentBlock=0
```

## 3. Plan v4 congelado e inmutable

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
```

No reabrir el universo de 45 UPDATE del plan v3, SKIP13, multi-Auth ni lineage `ac93...`.

## 4. PREWRITE v4 terminal

```text
requestId=c6-auth-plan-v4-activation-dev-20260807-01
requestCommit=d5453fceefdee1bd026e059cdb6187486d75a918
runId=31240353678
jobId=93060168241
artifactId=9016808823
artifactDigest=sha256:1f4a22df9448b873838f3de6480bcaa954916cf148c40c5ec9f2cdd01e9dec4f
decision=STOP_RETRY_C6_AUTH_PLAN_V4_PREWRITE
errorCode=HASH_CONFIG_HTTP_400
errorFingerprint=9a3b817f725d9b53b23e097b
providerAttempts=1
secondProviderAttempt=false
prewritePass=false
writeBoundaryEntered=false
passwordMaterialInspectedRows=0
snapshotProduced=false
AuthCreates=0
AuthUpdates=0
duplicateDisables=0
providerWriteCalls=0
```

El workflow técnico completó sus gates y el STOP controlado; los status contexts quedaron `failure` a propósito porque no hubo PASS de activación.

## 5. Causa raíz y verifier

El fallo se produjo en la lectura administrativa de configuración de hash. La herramienta usó `GET .../config?mask=hashConfig`; la referencia oficial de Identity Platform define `projects.getConfig` como GET del recurso `projects/*/config` con request body vacío y no documenta `mask` en GET. `updateMask` pertenece al PATCH `projects.updateConfig`.

Clasificación source-only:

```text
GET_CONFIG_QUERY_MASK_UNSUPPORTED_OR_MALFORMED_REQUEST_SHAPE
```

No hubo provider re-test. El verificador source-safe estructural corregido sí pasó y dejó de confundir contadores `email` con PII.

## 6. Fail-close

El request quedó consumido/deshabilitado y el workflow one-shot fue retirado. No existe autorización latente.

```text
providerAttempts=1
secondProviderAttempt=false
AuthExecuted=false
AuthWrites=0
FirestoreWrites=0
membershipWrites=0
HRWrites=0
RulesWrites=0
StorageWrites=0
CloudBuild=0
CloudRun=0
Hosting=0
Make=0
Gemini=0
payments=0
merge=false
production=false
```

## 7. Siguiente acción exacta

Solo bajo autorización nueva: `C6 AUTH PLAN V4 HASH-CONFIG GET SHAPE REPAIR + PREWRITE RETRY`.

Debe corregir source-only la forma de `projects.getConfig` sin `mask`, validar que solo lea/extraiga `hashConfig`, conservar exactamente freeze/digest v4 y, mediante request nuevo, ejecutar como máximo un provider PREWRITE. Solo con PREWRITE PASS, rollback exacto para 8 password updates y snapshot cifrado roundtrip podrá cruzarse el Auth write boundary. No reconstruir identidades.

## 8. Phase A preservada

Frontend, Login, `CX.data`, HR histórico, shoppers, postulaciones, certificaciones, visitas, liquidaciones/pagos, Finanzas, Portal Cliente, Portal Shopper, Reservas, multi-tenant, multi-proyecto, sincronización HR/plataforma y Academia permanecen preservados.
