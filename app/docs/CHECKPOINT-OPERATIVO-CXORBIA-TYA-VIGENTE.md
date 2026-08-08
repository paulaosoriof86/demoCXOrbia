# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-07  
**Estado:** `C6_AUTH_PRINCIPAL_UNIQUENESS_ROOTFIX_STATIC_PASS__PHASE1_NEW_DIGEST_STOP_RETRY__ZERO_PROVIDER__ZERO_WRITES__AUTH_NOT_EXECUTED__NO_PRODUCTION`

## 1. Control

- repo: `paulaosoriof86/demoCXOrbia`;
- rama viva: `docs-tya-v6-v71-audit`;
- PR #7: draft/open/no merge;
- source lock vigente: `app/docs/SOURCE-LOCK-C6-AUTH-PRINCIPAL-UNIQUENESS-PHASE1-DIGEST-STOP-RETRY-20260807.md`;
- request ejecutable: ninguno;
- workflow one-shot macro: eliminado;
- producción: intacta;
- Auth ejecutado: no;
- write boundary alcanzado: no.

## 2. Identidad cerrada

```text
SKIP13=closed 13/13
multiAuthProfile=7cc28c78de9bfda01d14
keeper=4e6d26551d11db444bd0
duplicateAccessToRetire=9b2b7ca1bd72c1301d29
retirementMode=DISABLE_ONLY_NO_DELETE
targetLineage=PASS profile+visit
crossRowPrincipalAliasRootCause=true
```

No reabrir SKIP13, multi-Auth ni lineage.

## 3. Plan previo preservado y no ejecutable

```text
rows=340
uniqueRows=340
CREATE_AUTH=81
UPDATE_AUTH=46
NO_OP=81
HOLD=0
PRESERVE_NO_AUTH=132
emailChanges=39
passwordChanges=14
claimsChanges=38
rowsDigest=68e26a5217957333d256f2cb547faf3e1eef74e2c789bfd85454d42dfd472dc3
AuthExecuted=false
status=FROZEN_BUT_NOT_EXECUTABLE_PENDING_PRINCIPAL_UNIQUENESS_ROOT_FIX
```

## 4. Rootfix materializado en source

Archivos vigentes:

- `backend/config/c6-shopper-auth-final-freeze-v3.json`;
- `backend/contracts/c6-auth-activation-dev-v2.json`;
- `tools/qa/cxorbia-c6-auth-principal-uniqueness-rootfix-source-only.mjs`;
- `tools/qa/cxorbia-c6-auth-activation-dev-v2.mjs`.

Correcciones estructurales:

1. principal Auth existente no puede pertenecer a dos profile rows;
2. candidate fingerprint tampoco puede reutilizarse entre profiles;
3. selector de Auth usa solo claims exactos, credentials mapeados target-specific y targetLogin único; `baseLogin` compartido queda fuera como selector independiente;
4. `ac93...` solo puede pasar a CREATE_AUTH por evidencia terminal candidateCount=0 + targetLogin único;
5. `a8dd...` se preserva como peer dueño del login base;
6. rollback exacto distingue `PROVIDER_HASH_CONFIG_EXACT` de `LEGACY_SHA256_ROUNDS1_SALTLESS_EXACT`.

## 5. FASE 1 terminal

```text
requestId=c6-auth-principal-uniqueness-rootfix-activation-dev-20260807-01
requestCommit=18c988ff3aa8cc59aa2fa0476b0647fd051ed30c
runId=31228513906
jobId=93027465078
requestValidation=PASS
rootfixSyntax=PASS
activationV2Syntax=PASS
rootfixSelfTest=PASS
activationV2SelfTest=PASS
staticNoLoopGate=PASS
oldFinalPlanArtifactDownload=PASS
materialization=FAIL_NEW_DIGEST
phase1Pass=false
```

Causa:

```text
freezeAnnotation=TARGET_SPECIFIC_EXISTING_AUTH_CANDIDATE_COUNT_0_AFTER_LINEAGE_PASS
transformAnnotation=TARGET_SPECIFIC_EXISTING_AUTH_CANDIDATE_COUNT_0_AFTER_EXACT_LINEAGE_PASS
classification=SOURCE_SAFE_DIGEST_ANNOTATION_STRING_MISMATCH
```

No es drift provider ni nuevo problema de identidad. El digest incluye ese campo audit-only y el guard cerró correctamente.

## 6. FASE 2 no inició

```text
credentialPrepared=false
providerAttempts=0
providerReads=0
AuthReads=0
FirestoreReads=0
HRReads=0
writeBoundaryEntered=false
AuthCreates=0
AuthUpdates=0
duplicateDisables=0
providerWrites=0
```

Se obedeció `FASE 1 no PASS => STOP_RETRY con cero provider`.

## 7. Fail-close

```text
requestEnabled=false
requestConsumed=true
allowedExecutions=0
requestConsumeCommit=781b5a0be084178cc0caf093715723b964a6be7c
oneShotWorkflowPresent=false
workflowRemovalCommit=3ec94117525a3cc1285cbf459805411937f0d5be
secondProviderAttempt=false
```

## 8. Valores v3 propuestos, todavía no ejecutables

```text
rows=340
CREATE_AUTH=82
UPDATE_AUTH=45
NO_OP=81
HOLD=0
PRESERVE_NO_AUTH=132
emailChanges=38
passwordChanges=13
claimsChanges=37
expectedAuthUsersBefore=110
expectedAuthUsersAfter=192
```

No usar estos counts para ejecutar hasta que FASE 1 cierre PASS con digest canónico.

## 9. Próximo bloque exacto

Canonicalización source-only del annotation/digest y reejecución de FASE 1. Solo con PASS emitir un request nuevo/no solapado para FASE 2 PREWRITE + Auth Activation DEV. No repetir lectura de lineage ni password target.

## 10. Phase A preservada y seguridad

Frontend acumulativo, Login, `CX.data`, HR histórico, shoppers, postulaciones, certificaciones, visitas, liquidaciones/pagos, Finanzas, Portal Cliente, Portal Shopper, Reservas, multi-tenant, multi-proyecto, sincronización HR/plataforma y Academia permanecen preservados.

```text
providerWrites=0
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
