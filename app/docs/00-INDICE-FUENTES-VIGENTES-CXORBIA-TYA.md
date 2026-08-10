# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-10  
**Estado:** ACTIVO Y RECONCILIADO  
**Estado vivo:** `C6_AUTH_DUPLICATE_HUMAN_OWNERSHIP_DECISION_CAPTURE_READY__PAULA_DECISION_REQUIRED__ZERO_PROVIDER_READS__ZERO_REPAIR__NO_PRODUCTION`

## 1. Orden de prevalencia

1. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `app/docs/SOURCE-LOCK-C6-AUTH-DUPLICATE-HUMAN-OWNERSHIP-DECISION-CAPTURE-PENDING-PAULA-20260810.md`;
3. `app/docs/C6-AUTH-DUPLICATE-HUMAN-OWNERSHIP-DECISION-MATRIX-20260810.md`;
4. `app/docs/evidence/C6-AUTH-DUPLICATE-HUMAN-OWNERSHIP-DECISION-MATRIX-20260810.json`;
5. `app/docs/SOURCE-LOCK-C6-AUTH-DUPLICATE-OWNERSHIP-ANCHOR-SOURCE-SAFE-HUMAN-DECISION-REQUIRED-20260810.md` — reconciliación source-safe anterior;
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
OwnershipSourceSafeReconciliation=HUMAN_DECISION_REQUIRED_4
HumanOwnershipDecisionMatrix=READY
HumanOwnershipCapturedDecisions=0/4
HumanOwnershipProviderReads=0
HumanOwnershipRepairExecuted=false
CurrentBlock=PAULA_MINIMUM_OWNERSHIP_DECISION_REQUIRED
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

## 4. Matriz de decisión humana vigente

```text
1acdcb3782b7cf351056 = PAULA_DECISION_REQUIRED
2c4d19f2b066835473d3 = PAULA_DECISION_REQUIRED
54225792eeb65f6739c0 = PAULA_DECISION_REQUIRED
ae2f920fe6d9ce1fdd82 = PAULA_DECISION_REQUIRED
```

Opciones formalizadas: `KEEP_ONE_MEMBER`, `RETIRE_BOTH_IF_CANONICAL_EXTERNAL_EXISTS`, `PRESERVE_BOTH_PENDING_OWNER_MAPPING` y, para Cliente, `CANONICAL_EXTERNAL_KEEP_HISTORICAL_PAIR_NONCANONICAL_PENDING_RETIRE`.

A–C: cualquier `KEEP_ONE_MEMBER` exige selección humana del fingerprint; `RETIRE_BOTH...` exige confirmación del principal canónico externo correcto. La evidencia no puede seleccionar automáticamente.

D `ae2f...`: existe un Cliente canónico externo ya validado con fingerprint `6a74d2b7c77f7b3f026b9ad0bef86183bc4e028b67f429ee36ab772587e5953c`, fuera del par histórico. Puede aprobarse como único canónico sin elegir entre los dos históricos; la disposición técnica se ejecutaría solo en un repair posterior autorizado.

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

No se creó request provider ni workflow provider. No se usaron antigüedad, orden, PII cruda, metadatos temporales ni inferencia visual.

## 6. Siguiente acción exacta

Esperar una decisión humana mínima de Paula para cada uno de los cuatro grupos, usando únicamente la matriz vigente. Si una decisión produce una acción Auth inequívoca, preparar después un repair focal separado con snapshot/readback/rollback y autorización expresa.

No ejecutar repair, PREWRITE, Activation, smoke, deploy, merge ni producción dentro de la autorización actual.

## 7. Phase A preservada

Frontend, Login, `CX.data`, HR histórico, shoppers, postulaciones, certificaciones, visitas, liquidaciones/pagos, Finanzas, Portal Cliente, Portal Shopper, Reservas, multi-tenant, multi-proyecto, sincronización HR/plataforma y Academia permanecen preservados.
