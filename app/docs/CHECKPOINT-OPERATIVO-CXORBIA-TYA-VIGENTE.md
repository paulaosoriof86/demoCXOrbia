# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-07  
**Estado:** `C6_AUTH_PLAN_V4_PREWRITE_STOP_HASH_CONFIG_REQUEST_SHAPE__ZERO_AUTH_WRITES__NO_SECOND_PROVIDER_ATTEMPT__NO_PRODUCTION`

## 1. Control

- repo: `paulaosoriof86/demoCXOrbia`;
- rama viva: `docs-tya-v6-v71-audit`;
- PR #7: draft/open/no merge;
- source lock vigente: `app/docs/SOURCE-LOCK-C6-AUTH-PLAN-V4-PREWRITE-HASH-CONFIG-STOP-RETRY-20260807.md`;
- evidencia terminal: `app/docs/evidence/C6-AUTH-PLAN-V4-PREWRITE-HASH-CONFIG-STOP-RETRY-20260807.json`;
- freeze rector: `backend/config/c6-shopper-auth-final-freeze-v4.json`;
- digest rector: `c0c31fadb88928f5fc0b8a19248188c8610e13362608f1bae3e267034f893ba4`;
- request ejecutable: ninguno;
- workflow one-shot del bloque: retirado;
- producción: intacta;
- Auth ejecutado: no;
- write boundary alcanzado: no.

## 2. Identidad cerrada — no reabrir

```text
SKIP13=closed 13/13
multiAuthProfile=7cc28c78de9bfda01d14
keeper=4e6d26551d11db444bd0
duplicateAccessToRetire=9b2b7ca1bd72c1301d29
retirementMode=DISABLE_ONLY_NO_DELETE
targetLineage(ac93)=closed
updateUniversePlanV3=closed
```

El error actual es de forma de request de configuración administrativa. No invalida ni autoriza reabrir la reconciliación de identidad.

## 3. Freeze v4 rector

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
rowsDigest=c0c31fadb88928f5fc0b8a19248188c8610e13362608f1bae3e267034f893ba4
AuthExecuted=false
```

## 4. Macrobloque PREWRITE + ACTIVATION DEV — terminal

Autorización consumida:

```text
requestId=c6-auth-plan-v4-activation-dev-20260807-01
requestCommit=d5453fceefdee1bd026e059cdb6187486d75a918
runId=31240353678
jobId=93060168241
artifactId=9016808823
artifactDigest=sha256:1f4a22df9448b873838f3de6480bcaa954916cf148c40c5ec9f2cdd01e9dec4f
providerAttempts=1
secondProviderAttempt=false
```

Pasaron request-only gate, one-shot claim, self-test, circuit-breaker, descarga/digest del plan v4 y verifier source-safe estructural. El proveedor se cruzó una sola vez.

Terminal:

```text
decision=STOP_RETRY_C6_AUTH_PLAN_V4_PREWRITE
errorCode=HASH_CONFIG_HTTP_400
errorFingerprint=9a3b817f725d9b53b23e097b
prewritePass=false
writeBoundaryEntered=false
passwordMaterialInspectedRows=0
passwordHashReads=0
passwordSaltReads=0
snapshotProduced=false
AuthCreates=0
AuthUpdates=0
duplicateDisables=0
providerWriteCalls=0
```

No hubo ACTIVATION DEV porque la condición `PREWRITE PASS` no se cumplió.

## 5. Evidencia de control-flow previa al fallo

La herramienta llama `fetchHashConfig` únicamente después de completar su clasificación/gating de targets. Por orden de control-flow, antes del HTTP 400 se alcanzaron los gates de freeze/digest, población 110, shoppers 340, crosswalk 101/8, universo 127 CREATE/UPDATE, candidateCount 0/1 por operación, unicidad UID/candidate, colisiones target-email, flags email/claims, cardinalidad 118/9/8, probes de compatibilidad de las 9 UPDATE y par multi-Auth adjudicado.

Esta observación no convierte el PREWRITE en PASS porque faltó el gate obligatorio de rollback exacto y snapshot.

## 6. Causa raíz técnica

La implementación consultó:

```text
GET /admin/v2/projects/{projectId}/config?mask=hashConfig
```

La documentación oficial de Identity Platform define `projects.getConfig` como GET de `projects/*/config` con body vacío y sin query `mask`. El `updateMask` documentado pertenece al PATCH de `projects.updateConfig`.

Clasificación:

```text
GET_CONFIG_QUERY_MASK_UNSUPPORTED_OR_MALFORMED_REQUEST_SHAPE
```

Es diagnóstico source-only sustentado por contrato oficial; no hubo re-test provider.

## 7. Verifier source-safe corregido

El verifier estructural pasó y ya no interpreta contadores como `emailChanges` o `subchangeCounts.email` como PII. La evidencia terminal confirma cero raw UID/email/shopperId/claims/password/hash/salt exportados.

## 8. Fail-close

```text
request=consumed/disabled
workflowOneShot=removed
providerAttempts=1
secondProviderAttempt=false
writeBoundaryEntered=false
AuthExecuted=false
AuthCreates=0
AuthUpdates=0
duplicateDisables=0
providerWriteCalls=0
FirestoreWrites=0
membershipWrites=0
HRWrites=0
visitsWrites=0
certificationsWrites=0
liquidationsWrites=0
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

## 9. Documentación acumulativa

- `app/docs/SOURCE-LOCK-C6-AUTH-PLAN-V4-PREWRITE-HASH-CONFIG-STOP-RETRY-20260807.md`;
- `app/docs/evidence/C6-AUTH-PLAN-V4-PREWRITE-HASH-CONFIG-STOP-RETRY-20260807.json`;
- `app/docs/CAMBIOS-BACKEND-ADDENDUM-C6-AUTH-PLAN-V4-PREWRITE-HASH-CONFIG-STOP-20260807.md`;
- `app/docs/RESUMEN-PARA-CLAUDE-ADDENDUM-C6-AUTH-PLAN-V4-PREWRITE-HASH-CONFIG-STOP-20260807.md`;
- `app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-C6-AUTH-PLAN-V4-PREWRITE-HASH-CONFIG-STOP-20260807.md`;
- `app/docs/ACADEMIA-ADDENDUM-C6-AUTH-PLAN-V4-PREWRITE-HASH-CONFIG-STOP-20260807.md`;
- `app/docs/PHASE-A-TRACKER-ADDENDUM-C6-AUTH-PLAN-V4-PREWRITE-HASH-CONFIG-STOP-20260807.md`.

## 10. Próximo bloque exacto

`C6 AUTH PLAN V4 HASH-CONFIG GET SHAPE REPAIR + PREWRITE RETRY`, solo bajo nueva autorización.

Debe corregir primero source-only el GET de configuración sin `mask`, mantener el freeze/digest v4 y validar estáticamente cero writes. Luego, mediante request nuevo y no superpuesto, podrá consumir un único provider PREWRITE. Solo con PREWRITE PASS, 8 rollback entries exactas y snapshot cifrado roundtrip se permitirá la ACTIVATION DEV ya autorizada en un bloque futuro. Si PREWRITE falla, STOP_RETRY sin Auth writes.

No volver a reconstruir identidades.

## 11. Phase A preservada

Frontend acumulativo, Login, `CX.data`, HR histórico, shoppers, postulaciones, certificaciones, visitas, liquidaciones/pagos, Finanzas, Portal Cliente, Portal Shopper, Reservas, multi-tenant, multi-proyecto, sincronización HR/plataforma y Academia permanecen preservados.
