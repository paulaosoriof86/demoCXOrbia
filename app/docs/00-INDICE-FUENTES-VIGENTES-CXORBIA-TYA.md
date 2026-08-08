# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-07  
**Estado:** ACTIVO Y RECONCILIADO  
**Estado vivo:** `C6_AUTH_PRINCIPAL_UNIQUENESS_ROOTFIX_STATIC_PASS__PHASE1_NEW_DIGEST_STOP_RETRY__ZERO_PROVIDER__ZERO_WRITES__AUTH_NOT_EXECUTED__NO_PRODUCTION`

## 1. Orden de prevalencia

1. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `app/docs/SOURCE-LOCK-C6-AUTH-PRINCIPAL-UNIQUENESS-PHASE1-DIGEST-STOP-RETRY-20260807.md`;
3. `app/docs/evidence/C6-AUTH-PRINCIPAL-UNIQUENESS-ROOTFIX-ACTIVATION-PHASE1-DIGEST-STOP-RETRY-20260807.json`;
4. `app/docs/SOURCE-LOCK-C6-AUTH-TARGET-ADAPTIVE-LINEAGE-ROOT-CAUSE-CROSS-ROW-PRINCIPAL-ALIAS-STOP-RETRY-20260807.md`;
5. `app/docs/evidence/C6-AUTH-TARGET-ADAPTIVE-LINEAGE-ROOT-CAUSE-CROSS-ROW-PRINCIPAL-ALIAS-STOP-RETRY-20260807.json`;
6. `backend/config/c6-shopper-auth-final-freeze-v3.json` — candidato source rootfix, todavía no PASS por digest;
7. `backend/contracts/c6-auth-activation-dev-v2.json` — contrato corregido, no ejecutado;
8. `tools/qa/cxorbia-c6-auth-principal-uniqueness-rootfix-source-only.mjs`;
9. `tools/qa/cxorbia-c6-auth-activation-dev-v2.mjs`;
10. `backend/config/c6-auth-principal-uniqueness-rootfix-activation-dev-request-v1.json` — consumido/deshabilitado;
11. `backend/config/c6-shopper-auth-final-freeze-v2.json` — plan previo preservado, no ejecutable;
12. `backend/contracts/c6-auth-activation-dev-v1.json` — contrato previo obsoleto para ejecución;
13. `app/docs/SOURCE-LOCK-C6-MULTI-AUTH-FINAL-DISCRIMINATOR-TENANT-ADJUDICATION-STOP-RETRY-20260807.md`;
14. `backend/config/c6-skip13-access-reconciliation-overlay-v1.json`;
15. `backend/contracts/c6-skip13-auth-access-adjudication-v2.json`;
16. `app/docs/SOURCE-LOCK-C6-DIRECT-RUNNER-DEV-DEPLOY-PASS-20260807.md`;
17. `backend/config/c6-shopper-auth-snapshot-rollback-manifest-v1.json`;
18. `backend/config/c6-accumulative-multirole-smoke-matrix-v1.json`;
19. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
20. addenda vigentes y PR #7.

## 2. Estado rector

```text
DirectRunnerDEV=PASS
AuthExecuted=false
Production=false
SKIP13=closed 13/13
MultiAuthAdjudication=closed
TargetLineage=PASS profile+visit
CrossRowPrincipalAliasRootCause=true
PrincipalUniquenessRootfixStatic=PASS
PrincipalUniquenessPhase1=STOP_RETRY_NEW_DIGEST
Phase2ProviderStarted=false
ProviderReadsThisMacro=0
ProviderWritesThisMacro=0
AuthWritesThisMacro=0
```

## 3. Plan previo preservado, no ejecutable

```text
rows=340
CREATE_AUTH=81
UPDATE_AUTH=46
NO_OP=81
HOLD=0
PRESERVE_NO_AUTH=132
passwordChanges=14
digest=68e26a5217957333d256f2cb547faf3e1eef74e2c789bfd85454d42dfd472dc3
status=FROZEN_BUT_NOT_EXECUTABLE_PENDING_PRINCIPAL_UNIQUENESS_ROOT_FIX
```

## 4. Rootfix v3 — estado source

FASE 1 intentó materializar exclusivamente desde el plan final previo y la evidencia terminal de causa raíz:

```text
target=ac93d90d9e41512acdcd
from=UPDATE_AUTH
to=CREATE_AUTH
peer=a8dd7db89a02ff180674 preserved
proposed CREATE_AUTH=82
proposed UPDATE_AUTH=45
proposed NO_OP=81
proposed HOLD=0
proposed PRESERVE_NO_AUTH=132
proposed passwordChanges=13
proposed expectedAuthUsersAfter=192
```

Static gates/self-tests PASS, pero el digest fail-closed por diferencia literal del annotation audit-only:

```text
freezeAnnotation=TARGET_SPECIFIC_EXISTING_AUTH_CANDIDATE_COUNT_0_AFTER_LINEAGE_PASS
transformAnnotation=TARGET_SPECIFIC_EXISTING_AUTH_CANDIDATE_COUNT_0_AFTER_EXACT_LINEAGE_PASS
error=NEW_DIGEST
```

Estos counts v3 no son ejecutables todavía hasta FASE 1 PASS.

## 5. Run y fail-close

```text
runId=31228513906
jobId=93027465078
phase1Pass=false
phase2Started=false
credentialPrepared=false
providerAttempts=0
requestEnabled=false
requestConsumed=true
allowedExecutions=0
oneShotWorkflowPresent=false
providerWrites=0
AuthWrites=0
FirestoreWrites=0
HRWrites=0
merge=false
production=false
```

## 6. Siguiente acción exacta

Canonicalizar exclusivamente el annotation/digest source-safe del rootfix y reejecutar FASE 1 source-only. Solo con PASS podrá emitirse un request nuevo/no solapado para FASE 2 PREWRITE + Auth Activation DEV. No reabrir lineage, SKIP13, multi-Auth ni password target bajo el plan viejo.

## 7. Phase A preservada

Frontend, Login, `CX.data`, HR histórico, shoppers, postulaciones, certificaciones, visitas, liquidaciones/pagos, Finanzas, Portal Cliente, Portal Shopper, Reservas, multi-tenant, multi-proyecto, sincronización HR/plataforma y Academia permanecen preservados.
