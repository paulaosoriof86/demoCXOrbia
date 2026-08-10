# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-10  
**Estado:** ACTIVO Y RECONCILIADO  
**Estado vivo:** `C6_AUTH_DUPLICATE_KEEPER_ONE_READ_STOP_4_ANCHOR_AMBIGUITIES__FD891_POLICY_CLOSED__AUTH_DEV_228_PRESERVED__NO_SECOND_READ__ZERO_WRITES__NO_PRODUCTION`

## 1. Orden de prevalencia

1. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `app/docs/SOURCE-LOCK-C6-AUTH-DUPLICATE-KEEPER-ONE-READ-FOCAL-STOP-RETRY-20260810.md`;
3. `app/docs/evidence/C6-AUTH-DUPLICATE-KEEPER-ONE-READ-FOCAL-STOP-RETRY-20260810.json`;
4. `backend/config/c6-auth-duplicate-keeper-targetscope-one-read-request-v2.json` — consumido/deshabilitado;
5. `tools/qa/cxorbia-c6-auth-duplicate-keeper-targetscope-adjudication-readonly-v1.mjs` — herramienta source-safe sin trigger provider activo;
6. `app/docs/SOURCE-LOCK-C6-AUTH-DUPLICATE-KEEPER-SOURCE-GATE-PREPROVIDER-STOP-RETRY-20260810.md` — histórico del falso positivo ya corregido;
7. `app/docs/SOURCE-LOCK-C6-AUTH-SMOKE-FINDINGS-ADJUDICATION-AMBIGUITY-STOP-RETRY-20260810.md` — hallazgos previos de los cinco pares;
8. `backend/config/c6-shopper-auth-final-freeze-v4.json` — freeze Auth rector;
9. `backend/config/c6-auth-plan-v4-activation-dev-request-v3.json` — Activation Auth PASS, consumido/deshabilitado;
10. `backend/config/c6-accumulative-multirole-smoke-readonly-request-v1.json` — smoke histórico consumido/deshabilitado;
11. `backend/config/c6-accumulative-multirole-smoke-matrix-v1.json`;
12. `backend/contracts/c6-auth-plan-v4-activation-dev-v1.json`;
13. source locks históricos de Activation, HashConfig, update-universe, multi-Auth y direct runner;
14. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
15. addenda vigentes, documentación Claude/Academia/tracker y PR #7.

## 2. Estado rector

```text
DirectRunnerDEV=PASS
AuthPlanV4=FROZEN
AuthPlanV4Digest=c0c31fadb88928f5fc0b8a19248188c8610e13362608f1bae3e267034f893ba4
AuthExecuted=true
AuthUsersAfter=228
Readback=PASS
RollbackDryRun=PASS
Production=false
SKIP13=closed 13/13
MultiAuthAdjudication=closed
targetLineage(ac93)=closed
HashConfig=closed PASS
SmokeCredentialLifecycle=closed PASS
PhaseASourceSurfaces=20/20
DuplicateKeeperSourceRootfix=PASS
DuplicateKeeperProviderReads=1
DuplicateKeeperSecondRead=false
DuplicateKeeperResolvedAccessGroups=0
DuplicateKeeperAmbiguousAccessGroups=4
fd891BlockedPolicyClosed=1
CurrentBlock=STOP_RETRY_KEEPER_ANCHOR_INSUFFICIENT_4
```

## 3. Auth baseline protegido

```text
rows=340
CREATE_AUTH=118
UPDATE_AUTH=9
NO_OP=81
HOLD=0
PRESERVE_NO_AUTH=132
passwordChanges=8
expectedAuthUsersAfter=228
digest=c0c31fadb88928f5fc0b8a19248188c8610e13362608f1bae3e267034f893ba4
```

No repetir PREWRITE, Activation ni reconstrucción completa de identidad.

## 4. Rootfix y lectura focal

Source-only:

```text
sourceGateCommit=72478e582dd917f287f16d6447b3b5f14b8ad26f
sourceGateRunId=31441607796
sourceGate=PASS_C6_AUTH_DUPLICATE_KEEPER_TARGET_SCOPE_SOURCE_ROOTFIX_ZERO_WRITES_ONE_READ_NO_PII
```

Provider one-shot:

```text
requestId=c6-auth-duplicate-keeper-targetscope-one-read-20260810-01
runId=31441779926
jobId=93627815703
artifactId=9083100724
artifactDigest=sha256:8c3a2026027e678deb1aa0dfc828c45cdf1a251b9cee1617eaa9feb10c82eba2
providerReads=1
secondProviderRead=false
decision=STOP_RETRY_C6_AUTH_DUPLICATE_KEEPER_TARGET_SCOPE_ADJUDICATION
errorCode=KEEPER_ANCHOR_INSUFFICIENT_4
```

## 5. Resultado de los cinco grupos

```text
1acdcb3782b7cf351056 = AMBIGUOUS_STAFF_KEEPER_NO_UNIQUE_ALLOWED_ANCHOR
2c4d19f2b066835473d3 = AMBIGUOUS_STAFF_KEEPER_NO_UNIQUE_ALLOWED_ANCHOR
54225792eeb65f6739c0 = AMBIGUOUS_STAFF_KEEPER_NO_UNIQUE_ALLOWED_ANCHOR
ae2f920fe6d9ce1fdd82 = AMBIGUOUS_CLIENT_KEEPER_LINEAGE
fd891812eca020d27ee3 = POLICY_CLOSED_NO_TYA_EFFECTIVE_ACCESS
```

Los tres pares staff son equivalentes bajo los discriminadores autorizados y ninguno coincide con `canonicalImportedStaffClass`. En Cliente, ninguno coincide con la lineage canónica y ambos coinciden con los dos hashes históricos. No existe keeper reproducible para A–D.

`fd891...` queda sin repair TyA: uno de sus principals está fuera del contrato de rol y el otro está scopeado a otro tenant; ambos tienen `effectiveTyaAccess=false`.

## 6. Fail-close

```text
request.enabled=false
request.consumed=true
request.allowedExecutions=0
providerWorkflowActive=false
sourceGateWorkflowActive=false
providerReads=1
secondProviderRead=false
providerWrites=0
AuthWrites=0
IAMWrites=0
FirestoreReads/Writes=0/0
HRReads/Writes=0/0
RulesWrites=0
StorageWrites=0
PREWRITE=false
Activation=false
newSmoke=false
deploys=0
merge=false
production=false
PII/credentials exported=false
creationTimeUsed=false
lastSignInTimeUsed=false
resultOrderUsed=false
```

## 7. Siguiente acción exacta

Solo bajo nueva autorización:

`C6 AUTH DUPLICATE OWNERSHIP ANCHOR SOURCE-SAFE EVIDENCE RECONCILIATION — NO PROVIDER`.

Usar únicamente evidencia/source-safe ya existente para intentar encontrar una ancla no temporal, no PII y reproducible de propiedad/lineage para los cuatro grupos A–D. Cero provider reads. Si no existe ancla única, declarar `HUMAN_OWNERSHIP_DECISION_REQUIRED`; no inferir keeper.

No repair, PREWRITE, Activation, nuevo smoke, Auth/IAM/Firestore/HR/Rules/Storage writes, Make, Gemini, pagos, deploy, merge ni producción.

## 8. Phase A preservada

Frontend, Login, `CX.data`, HR histórico, shoppers, postulaciones, certificaciones, visitas, liquidaciones/pagos, Finanzas, Portal Cliente, Portal Shopper, Reservas, multi-tenant, multi-proyecto, sincronización HR/plataforma y Academia permanecen preservados.
