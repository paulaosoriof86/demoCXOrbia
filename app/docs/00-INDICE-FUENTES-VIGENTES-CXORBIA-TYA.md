# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-10  
**Estado:** ACTIVO Y RECONCILIADO  
**Estado vivo:** `C6_AUTH_DUPLICATE_CANONICAL_REPLACEMENT_RESOLVED__ABC_CREATE_CANONICAL_REPLACEMENT_REQUIRED__D_KEEP_VALIDATED_EXTERNAL_CANONICAL_RETIRE_BOTH_HISTORICAL__ZERO_PROVIDER_READS__ZERO_WRITES__NO_PRODUCTION`

## 1. Orden de prevalencia

1. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `app/docs/SOURCE-LOCK-C6-AUTH-DUPLICATE-CANONICAL-REPLACEMENT-RESOLUTION-SOURCE-SAFE-20260810.md`;
3. `app/docs/evidence/C6-AUTH-DUPLICATE-CANONICAL-REPLACEMENT-RESOLUTION-SOURCE-SAFE-20260810.json`;
4. `app/docs/SOURCE-LOCK-C6-AUTH-DUPLICATE-HUMAN-OWNERSHIP-DECISION-CAPTURE-PENDING-PAULA-20260810.md` — matriz humana histórica ya superada por resolución técnica;
5. `app/docs/C6-AUTH-DUPLICATE-HUMAN-OWNERSHIP-DECISION-MATRIX-20260810.md`;
6. `app/docs/evidence/C6-AUTH-DUPLICATE-OWNERSHIP-ANCHOR-SOURCE-SAFE-RECONCILIATION-20260810.json`;
7. `app/docs/SOURCE-LOCK-C6-AUTH-DUPLICATE-KEEPER-ONE-READ-FOCAL-STOP-RETRY-20260810.md` — provider one-read histórico;
8. `backend/config/c6-auth-duplicate-keeper-targetscope-one-read-request-v2.json` — consumido/deshabilitado;
9. `backend/config/c6-shopper-auth-final-freeze-v4.json` — freeze Auth rector;
10. `backend/config/c6-auth-plan-v4-activation-dev-request-v3.json` — Activation PASS consumido/deshabilitado;
11. `backend/config/c6-accumulative-multirole-smoke-readonly-request-v1.json` — smoke histórico consumido/deshabilitado;
12. `backend/contracts/c6-auth-plan-v4-activation-dev-v1.json`;
13. source locks históricos de Activation, HashConfig, update-universe, multi-Auth y direct runner;
14. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
15. addenda maestras vigentes, documentación Claude/Academia/tracker y PR #7.

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
CanonicalReplacementProviderReads=0
CanonicalReplacementABC=CREATE_CANONICAL_REPLACEMENT_REQUIRED
CanonicalReplacementD=KEEP_VALIDATED_EXTERNAL_CANONICAL_RETIRE_BOTH_HISTORICAL
RepairExecuted=false
CurrentBlock=CANONICAL_REPLACEMENT_RESOLVED_SOURCE_SAFE
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

## 4. Resolución canónica vigente

```text
1acdcb3782b7cf351056 = CREATE_CANONICAL_REPLACEMENT_REQUIRED
2c4d19f2b066835473d3 = CREATE_CANONICAL_REPLACEMENT_REQUIRED
54225792eeb65f6739c0 = CREATE_CANONICAL_REPLACEMENT_REQUIRED
ae2f920fe6d9ce1fdd82 = KEEP_VALIDATED_EXTERNAL_CANONICAL_RETIRE_BOTH_HISTORICAL
```

A: existe un `super` namespaced importado, pero no hay mapping source-safe owner-level que lo asocie inequívocamente al grupo. No se reutiliza por rol.

B/C: el import canónico agregó cero `admin` y cero `ops`; los principals observados de esos roles pertenecen al universo pre-import. No se promueve ninguno por inferencia.

D: el Cliente canónico externo ya está validado con namespace `staff`, scope `tya/cinepolis`, sign-in/readback/idempotencia/membresía PASS.

Todo retiro futuro será `DISABLE_ONLY_NO_DELETE` y solo tras snapshot, idempotencia, readback y rollback dry-run.

`fd891812eca020d27ee3` permanece cerrado como `POLICY_CLOSED_NO_TYA_EFFECTIVE_ACCESS`.

## 5. Seguridad del bloque vigente

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
Make=0
Gemini=0
payments=0
deploys=0
merge=false
production=false
rawPIIExported=false
```

## 6. Siguiente acción exacta

Solo bajo nueva autorización:

`C6 AUTH DUPLICATE CANONICAL REPLACEMENT REPAIR PLAN — SOURCE-ONLY / NO EXECUTE`.

Preparar el plan exacto de targets/gates para A–D. No provider read, repair, PREWRITE, Activation, smoke, deploy, merge ni producción en ese bloque.

## 7. Phase A preservada

Frontend, Login, `CX.data`, HR histórico, shoppers, postulaciones, certificaciones, visitas, liquidaciones/pagos, Finanzas, Portal Cliente, Portal Shopper, Reservas, multi-tenant, multi-proyecto, sincronización HR/plataforma y Academia permanecen preservados.
