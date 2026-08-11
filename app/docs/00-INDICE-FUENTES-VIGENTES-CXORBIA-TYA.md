# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-10  
**Estado:** ACTIVO Y RECONCILIADO  
**Estado vivo:** `C6_AUTH_DUPLICATE_CANONICAL_REPLACEMENT_REPAIR_PLAN_PARTIAL_READY__ABC_CANONICAL_TARGET_INPUT_REQUIRED__D_REPAIR_READY__ZERO_PROVIDER_READS__ZERO_WRITES__NO_PRODUCTION`

## 1. Orden de prevalencia

1. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `app/docs/SOURCE-LOCK-C6-AUTH-DUPLICATE-CANONICAL-REPLACEMENT-REPAIR-PLAN-PARTIAL-READY-20260810.md`;
3. `app/docs/C6-AUTH-DUPLICATE-CANONICAL-REPLACEMENT-REPAIR-PLAN-SOURCE-ONLY-20260810.md`;
4. `app/docs/evidence/C6-AUTH-DUPLICATE-CANONICAL-REPLACEMENT-REPAIR-PLAN-SOURCE-ONLY-20260810.json`;
5. `app/docs/SOURCE-LOCK-C6-AUTH-DUPLICATE-CANONICAL-REPLACEMENT-RESOLUTION-SOURCE-SAFE-20260810.md`;
6. `app/docs/evidence/C6-AUTH-DUPLICATE-CANONICAL-REPLACEMENT-RESOLUTION-SOURCE-SAFE-20260810.json`;
7. `app/docs/SOURCE-LOCK-C6-AUTH-DUPLICATE-HUMAN-OWNERSHIP-DECISION-CAPTURE-PENDING-PAULA-20260810.md` — histórico, superado por resolución técnica;
8. `app/docs/SOURCE-LOCK-C6-AUTH-DUPLICATE-KEEPER-ONE-READ-FOCAL-STOP-RETRY-20260810.md` — provider one-read histórico;
9. `backend/config/c6-auth-duplicate-keeper-targetscope-one-read-request-v2.json` — consumido/deshabilitado;
10. `backend/config/c6-shopper-auth-final-freeze-v4.json` — freeze Auth rector;
11. `backend/config/c6-auth-plan-v4-activation-dev-request-v3.json` — Activation PASS consumido/deshabilitado;
12. `backend/config/c6-accumulative-multirole-smoke-readonly-request-v1.json` — smoke histórico consumido/deshabilitado;
13. `backend/contracts/c6-auth-plan-v4-activation-dev-v1.json`;
14. source locks históricos de Activation, HashConfig, update-universe, multi-Auth y direct runner;
15. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
16. addenda maestras vigentes, documentación Claude/Academia/tracker y PR #7.

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
fd891BlockedPolicyClosed=1
RepairPlanProviderReads=0
RepairPlanABC=CANONICAL_TARGET_INPUT_REQUIRED
RepairPlanD=REPAIR_PLAN_READY
FutureAuthWritesHardCap=14
RepairExecuted=false
CurrentBlock=CANONICAL_REPLACEMENT_REPAIR_PLAN_PARTIAL_READY
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

## 4. Repair plan vigente

```text
1acdcb3782b7cf351056 = CANONICAL_TARGET_INPUT_REQUIRED
2c4d19f2b066835473d3 = CANONICAL_TARGET_INPUT_REQUIRED
54225792eeb65f6739c0 = CANONICAL_TARGET_INPUT_REQUIRED
ae2f920fe6d9ce1fdd82 = REPAIR_PLAN_READY
```

A–C: role, namespace y tenant están fijados (`super/admin/ops`, `staff`, `tya`), pero owner anchor y project entitlement no están demostrados source-safe. No se infiere `cinepolis`, no se copia scope legacy y no se selecciona keeper.

D: se preserva el Cliente canónico externo validado con scope `tya/cinepolis`; el plan solo contempla `DISABLE_ONLY_NO_DELETE` de ambos históricos.

Gates vigentes: snapshot, collision proof, idempotency, readback y rollback dry-run. Secuencia A–C: `CANONICAL_VALIDATED -> DISABLE_BOTH_LEGACY`.

## 5. Write budget futuro

```text
A=4 Auth writes
B=4 Auth writes
C=4 Auth writes
D=2 Auth writes
TOTAL HARD CAP=14
Auth deletes=0
Firestore/IAM/HR/Rules/Storage writes=0
```

No constituye autorización de ejecución.

## 6. Seguridad del bloque vigente

```text
providerReads=0
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
repair=false
Make=0
Gemini=0
payments=0
deploys=0
merge=false
production=false
rawPIIExported=false
```

## 7. Siguiente acción exacta

Solo bajo nueva autorización:

`C6 AUTH DUPLICATE CANONICAL TARGET INPUT RESOLUTION — SOURCE-SAFE / NO PROVIDER / NO REPAIR`.

Resolver únicamente inputs canónicos A–C. D no se reabre. Sin provider read, repair, PREWRITE, Activation, smoke, deploy, merge ni producción.

## 8. Phase A preservada

Frontend, Login, `CX.data`, HR histórico, shoppers, postulaciones, certificaciones, visitas, liquidaciones/pagos, Finanzas, Portal Cliente, Portal Shopper, Reservas, multi-tenant, multi-proyecto, sincronización HR/plataforma y Academia permanecen preservados.
