# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-10  
**Estado:** ACTIVO Y RECONCILIADO  
**Estado vivo:** `C6_AUTH_HASHCONFIG_READINESS_STOP_PRE_PROVIDER_SYNTAX__ZERO_PROVIDER_READS__ZERO_AUTH_WRITES__NO_REQUEST_EMITTED__NO_PRODUCTION`

## 1. Orden de prevalencia

1. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `app/docs/SOURCE-LOCK-C6-AUTH-HASHCONFIG-READINESS-PREPROVIDER-SYNTAX-STOP-RETRY-20260810.md`;
3. `app/docs/evidence/C6-AUTH-HASHCONFIG-READINESS-PREPROVIDER-SYNTAX-STOP-RETRY-20260810.json`;
4. `backend/config/c6-shopper-auth-final-freeze-v4.json` — freeze rector actual, sin cambios;
5. `backend/contracts/c6-auth-plan-v4-activation-dev-v1.json`;
6. `app/docs/SOURCE-LOCK-C6-AUTH-PLAN-V4-PREWRITE-HASH-CONFIG-EMPTY-STOP-RETRY-20260810.md` — histórico inmediato;
7. `app/docs/evidence/C6-AUTH-PLAN-V4-PREWRITE-HASH-CONFIG-EMPTY-STOP-RETRY-20260810.json`;
8. `backend/config/c6-auth-plan-v4-activation-dev-request-v2.json` — consumido/deshabilitado;
9. `tools/qa/cxorbia-c6-auth-plan-v4-activation-dev-v2.mjs` — histórico source-only, no ejecutar sin nuevo contrato;
10. `app/docs/SOURCE-LOCK-C6-AUTH-UPDATE-UNIVERSE-BATCH-PLAN-V4-PASS-20260807.md` — histórico que congeló v4;
11. `app/docs/SOURCE-LOCK-C6-MULTI-AUTH-FINAL-DISCRIMINATOR-TENANT-ADJUDICATION-STOP-RETRY-20260807.md` — identidad cerrada;
12. `app/docs/SOURCE-LOCK-C6-DIRECT-RUNNER-DEV-DEPLOY-PASS-20260807.md`;
13. `backend/config/c6-shopper-auth-snapshot-rollback-manifest-v1.json`;
14. `backend/config/c6-accumulative-multirole-smoke-matrix-v1.json`;
15. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
16. addenda vigentes y PR #7.

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
HashConfigGetShapeRepair=PASS_SOURCE_ONLY
HashConfigResponsePathDiagnosis=OPEN_SOURCE_ONLY
CurrentBlock=STOP_RETRY_PRE_PROVIDER_SYNTAX
ProviderReadsCurrentBlock=0
ProviderPrewriteAttemptsCurrentBlock=0
SecondProviderAttempt=false
WriteBoundaryEntered=false
AuthWritesCurrentBlock=0
RequestV3Emitted=false
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

No reabrir plan v3, SKIP13, multi-Auth, lineage `ac93...` ni reconstrucción de identidad.

## 4. Terminal del bloque vigente

```text
sourceGateCommit=4c5d91c34401e8cc239594be7b907966e133b6cb
runId=31415767771
jobId=93544290309
classification=PRE_PROVIDER_WRAPPER_SYNTAX_ERROR
error=SyntaxError: missing ) after argument list
principalLoad=SKIPPED
iamReadiness=SKIPPED
identityToolkitConfigRead=SKIPPED
providerReads=0
providerPrewriteAttempts=0
requestV3Emitted=false
AuthWrites=0
```

El STOP ocurrió en `node --check`, antes de credenciales/proveedor. Por contrato no se corrigió ni reintentó dentro del mismo macrobloque.

## 5. Fail-close

Se retiraron el workflow, el wrapper v3 y el probe readiness creados temporalmente. No existe autorización latente ni request nuevo ejecutable.

```text
workflowRemovalCommit=223677b589cf77607672bb4058c6ea6654ef9183
v3WrapperRemovalCommit=fa1b42bcaa2d2139f2460d7984153bb7d727cace
readinessProbeRemovalCommit=b6afe84cb67e8b207fe724d428a0afe7f403b1c8
```

## 6. Siguiente acción exacta

Solo bajo nueva autorización:

`C6 AUTH V4 HASHCONFIG HARNESS SYNTAX ROOTFIX SOURCE-ONLY → READINESS READ-ONLY → SINGLE PREWRITE`.

Primero debe existir PASS offline de sintaxis y contrato; solo entonces se permite la lectura read-only de permiso/material. Solo con readiness PASS se emite request PREWRITE. Ante cualquier fallo: `STOP_RETRY`, sin segundo provider attempt.

## 7. Phase A preservada

Frontend, Login, `CX.data`, HR histórico, shoppers, postulaciones, certificaciones, visitas, liquidaciones/pagos, Finanzas, Portal Cliente, Portal Shopper, Reservas, multi-tenant, multi-proyecto, sincronización HR/plataforma y Academia permanecen preservados.
