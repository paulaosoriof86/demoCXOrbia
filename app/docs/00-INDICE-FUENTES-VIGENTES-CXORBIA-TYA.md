# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-10  
**Estado:** ACTIVO Y RECONCILIADO  
**Estado vivo:** `C6_AUTH_DUPLICATE_OWNERSHIP_RECONCILIATION_HUMAN_DECISION_REQUIRED_4__AUTH_DEV_228_PRESERVED__ZERO_PROVIDER_READS__ZERO_DATA_WRITES__NO_PRODUCTION`

## 1. Orden de prevalencia

1. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `app/docs/SOURCE-LOCK-C6-AUTH-DUPLICATE-OWNERSHIP-ANCHOR-SOURCE-SAFE-HUMAN-DECISION-REQUIRED-20260810.md`;
3. `app/docs/evidence/C6-AUTH-DUPLICATE-OWNERSHIP-ANCHOR-SOURCE-SAFE-RECONCILIATION-20260810.json`;
4. `app/docs/SOURCE-LOCK-C6-AUTH-DUPLICATE-KEEPER-ONE-READ-FOCAL-STOP-RETRY-20260810.md` — provider one-read histórico inmediato;
5. `app/docs/evidence/C6-AUTH-DUPLICATE-KEEPER-ONE-READ-FOCAL-STOP-RETRY-20260810.json`;
6. `backend/config/c6-auth-duplicate-keeper-targetscope-one-read-request-v2.json` — consumido/deshabilitado;
7. `tools/qa/cxorbia-c6-auth-duplicate-keeper-targetscope-adjudication-readonly-v1.mjs` — sin trigger provider activo;
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
DuplicateKeeperPriorProviderReads=1
DuplicateKeeperSecondRead=false
fd891BlockedPolicyClosed=1
OwnershipReconciliationProviderReads=0
OwnershipUniqueKeeperAnchors=0
OwnershipHumanDecisionRequiredGroups=4
CurrentBlock=HUMAN_OWNERSHIP_DECISION_REQUIRED_4
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

## 4. Reconciliación ownership vigente

Universo actual:

```text
1acdcb3782b7cf351056 = HUMAN_OWNERSHIP_DECISION_REQUIRED
2c4d19f2b066835473d3 = HUMAN_OWNERSHIP_DECISION_REQUIRED
54225792eeb65f6739c0 = HUMAN_OWNERSHIP_DECISION_REQUIRED
ae2f920fe6d9ce1fdd82 = HUMAN_OWNERSHIP_DECISION_REQUIRED
```

A–C: ambos members de cada par pertenecen a la clase legacy/pre-import namespace `NONE`; ninguno coincide con el staff canónico importado namespace `staff`. No hay ancla member-level única.

D: ambos members son históricos. El Cliente canónico actual es un principal separado ya materializado/validado, por lo que tampoco existe keeper único demostrable dentro del par histórico.

`fd891812eca020d27ee3` permanece cerrado y fuera del universo actual como `POLICY_CLOSED_NO_TYA_EFFECTIVE_ACCESS`.

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

No se creó request provider ni workflow provider. No se usaron antigüedad, orden, PII cruda o metadatos temporales para desempatar.

## 6. Siguiente acción exacta

Solo bajo nueva autorización:

`C6 AUTH DUPLICATE HUMAN OWNERSHIP DECISION CAPTURE — NO PROVIDER / NO REPAIR`.

Capturar una decisión humana mínima/source-safe de ownership o disposition para los cuatro grupos. No ejecutar repair en el mismo bloque. Si la decisión no produce un keeper inequívoco, conservar HOLD y documentar únicamente la disposición.

## 7. Phase A preservada

Frontend, Login, `CX.data`, HR histórico, shoppers, postulaciones, certificaciones, visitas, liquidaciones/pagos, Finanzas, Portal Cliente, Portal Shopper, Reservas, multi-tenant, multi-proyecto, sincronización HR/plataforma y Academia permanecen preservados.
