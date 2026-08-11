# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-10  
**Estado:** ACTIVO Y RECONCILIADO  
**Estado vivo:** `C6_AUTH_DUPLICATE_CANONICAL_TARGET_INPUT_RESOLUTION_COMPLETE__A_OWNER_ANCHOR_AND_PROJECT_ENTITLEMENT_REQUIRED__BC_OWNER_ANCHOR_PROJECT_ENTITLEMENT_CREDENTIAL_INPUT_REQUIRED__D_PRESERVED_REPAIR_READY__ZERO_PROVIDER_READS__ZERO_WRITES__NO_PRODUCTION`

## 1. Orden de prevalencia

1. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `app/docs/SOURCE-LOCK-C6-AUTH-DUPLICATE-CANONICAL-TARGET-INPUT-RESOLUTION-REQUIRED-20260810.md`;
3. `app/docs/evidence/C6-AUTH-DUPLICATE-CANONICAL-TARGET-INPUT-RESOLUTION-SOURCE-SAFE-20260810.json`;
4. `app/docs/C6-AUTH-DUPLICATE-CANONICAL-TARGET-INPUT-RESOLUTION-SOURCE-SAFE-20260810.md`;
5. `app/docs/SOURCE-LOCK-C6-AUTH-DUPLICATE-CANONICAL-REPLACEMENT-REPAIR-PLAN-PARTIAL-READY-20260810.md`;
6. `app/docs/C6-AUTH-DUPLICATE-CANONICAL-REPLACEMENT-REPAIR-PLAN-SOURCE-ONLY-20260810.md`;
7. `app/docs/evidence/C6-AUTH-DUPLICATE-CANONICAL-REPLACEMENT-REPAIR-PLAN-SOURCE-ONLY-20260810.json`;
8. `app/docs/SOURCE-LOCK-C6-AUTH-DUPLICATE-CANONICAL-REPLACEMENT-RESOLUTION-SOURCE-SAFE-20260810.md`;
9. `backend/config/c6-shopper-auth-final-freeze-v4.json` — freeze Auth rector;
10. source locks históricos de Activation, HashConfig, update-universe, SKIP13, multi-Auth y direct runner;
11. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
12. addenda maestras vigentes, documentación Claude/Academia/tracker y PR #7.

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
PhaseASourceSurfaces=20/20
TargetInputProviderReads=0
A=OWNER_ANCHOR_REQUIRED+PROJECT_ENTITLEMENT_REQUIRED
B=OWNER_ANCHOR_REQUIRED+PROJECT_ENTITLEMENT_REQUIRED+CREDENTIAL_INPUT_REQUIRED
C=OWNER_ANCHOR_REQUIRED+PROJECT_ENTITLEMENT_REQUIRED+CREDENTIAL_INPUT_REQUIRED
D=REPAIR_PLAN_READY_PRESERVED
RepairExecuted=false
CurrentBlock=CANONICAL_TARGET_INPUT_RESOLUTION_COMPLETE
```

## 3. Auth baseline protegido

```text
rows=340
CREATE_AUTH=118
UPDATE_AUTH=9
NO_OP=81
HOLD=0
PRESERVE_NO_AUTH=132
expectedAuthUsersAfter=228
digest=c0c31fadb88928f5fc0b8a19248188c8610e13362608f1bae3e267034f893ba4
```

No repetir PREWRITE, Activation, smoke ni reconstrucción completa de identidad.

## 4. Resolución vigente A–C

A `1acd...`: existe un credential path canónico `super`, pero no hay owner association independiente; no se reutiliza por rol. Además falta entitlement exacto.

B `2c4d...`: falta owner anchor, entitlement exacto y credencial nueva efímera; el import canónico creó cero `admin`.

C `542...`: falta owner anchor, entitlement exacto y credencial nueva efímera; el import canónico creó cero `ops`.

No hay expected-claims digest para A–C porque ningún target está cerrado. No se infiere `cinepolis`, no se copia scope legacy y no se selecciona keeper.

D `ae2f...` permanece `REPAIR_PLAN_READY` sin reabrirse.

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
repair=false
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

`C6 AUTH CANONICAL STAFF MINIMUM OWNER INPUT CONTRACT — SOURCE-SAFE / NO PROVIDER / NO REPAIR`.

Definir el mínimo input empresarial A–C sin fingerprints legacy ni PII en repo. Luego cerrar targets/digests y pasar, bajo autorización separada, al repair focal.

## 7. Phase A preservada

Frontend, Login, `CX.data`, HR histórico, shoppers, postulaciones, certificaciones, visitas, liquidaciones/pagos, Finanzas, Portal Cliente, Portal Shopper, Reservas, multi-tenant, multi-proyecto, sincronización HR/plataforma y Academia permanecen preservados.
