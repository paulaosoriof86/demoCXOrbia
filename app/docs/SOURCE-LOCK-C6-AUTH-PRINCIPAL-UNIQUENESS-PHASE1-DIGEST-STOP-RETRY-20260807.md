# SOURCE LOCK — C6 AUTH PRINCIPAL-UNIQUENESS ROOT FIX — PHASE 1 DIGEST STOP_RETRY

**Fecha:** 2026-08-07  
**Estado:** `C6_AUTH_PRINCIPAL_UNIQUENESS_ROOTFIX_STATIC_PASS__PHASE1_NEW_DIGEST_STOP_RETRY__ZERO_PROVIDER__ZERO_WRITES__AUTH_NOT_EXECUTED__NO_PRODUCTION`

## 1. Carril

- repo: `paulaosoriof86/demoCXOrbia`;
- rama viva: `docs-tya-v6-v71-audit`;
- PR #7: abierto, draft, sin merge;
- target provider: `cxorbia-backend-dev`;
- producción: intacta;
- Auth ejecutado: no.

## 2. Autorización

Macrobloque `C6 AUTH PRINCIPAL-UNIQUENESS ROOT FIX + ACTIVATION DEV` con FASE 1 obligatoriamente source-only y FASE 2 autorizada únicamente si FASE 1 obtenía PASS. Ante FASE 1 no PASS: `STOP_RETRY` con cero provider.

## 3. Materialización source previa

Se crearon sin tocar provider:

- `backend/config/c6-shopper-auth-final-freeze-v3.json`;
- `backend/contracts/c6-auth-activation-dev-v2.json`;
- `tools/qa/cxorbia-c6-auth-principal-uniqueness-rootfix-source-only.mjs`;
- `tools/qa/cxorbia-c6-auth-activation-dev-v2.mjs`.

El contrato v2 introduce:

- invariant global de existing Auth principal/UID y candidate fingerprint por profile row;
- selector target-specific sin `baseLogin` compartido como ancla independiente;
- target `ac93d90d9e41512acdcd` como candidato de re-clasificación `UPDATE_AUTH -> CREATE_AUTH` únicamente por la evidencia terminal `candidateCount=0` y targetLogin único;
- peer `a8dd7db89a02ff180674` preservado;
- rollback exacto con dos modos: `PROVIDER_HASH_CONFIG_EXACT` y `LEGACY_SHA256_ROUNDS1_SALTLESS_EXACT`;
- salt vacío/null no se interpreta como ausencia si existe match exacto de hash legacy del mismo profile.

## 4. Run FASE 1

```text
requestId=c6-auth-principal-uniqueness-rootfix-activation-dev-20260807-01
requestCommit=18c988ff3aa8cc59aa2fa0476b0647fd051ed30c
runId=31228513906
jobId=93027465078
workflowConclusion=failure
```

Pasaron:

```text
requestValidation=PASS
rootfixSyntax=PASS
activationV2Syntax=PASS
rootfixSelfTest=PASS_C6_AUTH_PRINCIPAL_UNIQUENESS_ROOTFIX_SELFTEST
activationV2SelfTest=PASS_C6_AUTH_ACTIVATION_V2_SELFTEST
staticNoLoopGate=PASS_C6_AUTH_PRINCIPAL_UNIQUENESS_STATIC_NO_LOOP_GATE
priorFrozenPlanArtifactDownload=PASS
```

Falló exclusivamente la materialización source-safe:

```text
error=NEW_DIGEST
phase1PassMarkerReached=false
```

## 5. Causa exacta del `NEW_DIGEST`

No se demostró drift de identidad ni provider. El mismatch es source-only y determinístico: el digest congelado v3 fue calculado con el valor audit-only:

```text
TARGET_SPECIFIC_EXISTING_AUTH_CANDIDATE_COUNT_0_AFTER_LINEAGE_PASS
```

mientras el transformador versionado materializa:

```text
TARGET_SPECIFIC_EXISTING_AUTH_CANDIDATE_COUNT_0_AFTER_EXACT_LINEAGE_PASS
```

Ese campo forma parte del row compacto digest-bearing; por eso el guard `NEW_DIGEST` cerró antes de declarar FASE 1 PASS.

Clasificación:

```text
SOURCE_SAFE_DIGEST_ANNOTATION_STRING_MISMATCH
```

La causa raíz operacional sigue siendo:

```text
CROSS_ROW_EXISTING_AUTH_PRINCIPAL_ALIAS_IN_OLD_PREWRITE=true
```

No reabrir lineage, SKIP13, multi-Auth ni password snapshot bajo el plan viejo.

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
```

Se obedeció literalmente `Si FASE 1 no queda PASS, STOP_RETRY con cero provider`.

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

## 8. Plan y Phase A preservados

El plan previo sigue como evidencia y sigue no ejecutable:

```text
rows=340
CREATE_AUTH=81
UPDATE_AUTH=46
NO_OP=81
HOLD=0
PRESERVE_NO_AUTH=132
passwordChanges=14
digest=68e26a5217957333d256f2cb547faf3e1eef74e2c789bfd85454d42dfd472dc3
AuthExecuted=false
```

La FASE 1 pretendía producir, pero no congeló en PASS todavía:

```text
CREATE_AUTH=82
UPDATE_AUTH=45
NO_OP=81
HOLD=0
PRESERVE_NO_AUTH=132
passwordChanges=13
expectedAuthUsersAfter=192
```

Esos valores no deben tratarse como plan ejecutable hasta corregir el digest y volver a pasar FASE 1 source-only.

Frontend, `CX.data`, HR histórico, shoppers, postulaciones, certificaciones, visitas, liquidaciones/pagos, Finanzas, portales, Reservas, multi-tenant, multi-proyecto, sincronización HR/plataforma y Academia permanecen preservados.

## 9. Próximo bloque exacto

Corregir exclusivamente la canonicalización del annotation/digest source-safe y ejecutar FASE 1 nuevamente. Solo con PASS source-only podrá armarse un request nuevo y no solapado para FASE 2 provider/Activation DEV. No repetir ninguna lectura de lineage ni password target.

## 10. Seguridad

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
