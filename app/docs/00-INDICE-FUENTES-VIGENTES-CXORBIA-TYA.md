# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-10  
**Estado:** ACTIVO Y RECONCILIADO  
**Estado vivo:** `C6_AUTH_FINDINGS_ADJUDICATION_STOP_ONE_AMBIGUOUS_DUPLICATE__AUTH_DEV_228_PRESERVED__ZERO_WRITES__NO_SECOND_READ__NO_PRODUCTION`

## 1. Orden de prevalencia

1. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `app/docs/SOURCE-LOCK-C6-AUTH-SMOKE-FINDINGS-ADJUDICATION-AMBIGUITY-STOP-RETRY-20260810.md`;
3. `app/docs/evidence/C6-AUTH-SMOKE-FINDINGS-ADJUDICATION-AMBIGUITY-STOP-RETRY-20260810.json`;
4. `backend/config/c6-auth-smoke-findings-adjudication-readonly-request-v1.json` — consumido/deshabilitado;
5. `tools/qa/cxorbia-c6-auth-smoke-findings-adjudication-readonly-v1.mjs` — adjudicador source-safe; no workflow provider activo;
6. `app/docs/SOURCE-LOCK-C6-ACCUMULATIVE-MULTIROLE-SMOKE-READONLY-IDENTITY-SCOPE-STOP-RETRY-20260810.md` — histórico inmediato previo;
7. `app/docs/evidence/C6-ACCUMULATIVE-MULTIROLE-SMOKE-READONLY-IDENTITY-SCOPE-STOP-RETRY-20260810.json`;
8. `backend/config/c6-accumulative-multirole-smoke-readonly-request-v1.json` — smoke consumido/deshabilitado;
9. `backend/config/c6-shopper-auth-final-freeze-v4.json` — freeze Auth rector;
10. `backend/config/c6-auth-plan-v4-activation-dev-request-v3.json` — Activation Auth PASS, consumido/deshabilitado;
11. `backend/config/c6-accumulative-multirole-smoke-matrix-v1.json`;
12. `backend/contracts/c6-auth-plan-v4-activation-dev-v1.json`;
13. source locks históricos de Activation, HashConfig, update-universe, multi-Auth y direct runner;
14. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
15. addenda vigentes y PR #7.

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
CurrentBlock=STOP_RETRY_AUTH_FINDINGS_ADJUDICATION_ONE_AMBIGUOUS_DUPLICATE
AdjudicationProviderReads=1
SecondProviderRead=false
DuplicateProviderEmailGroups=5
ClaimScopeDuplicateDefects=4
AmbiguousDuplicateGroups=1
UnknownRoleNoEffectiveAccess=4
AdminCrossTenantNoTyaAccess=1
ShopperMissingScopeNoEffectiveAccess=1
AdjudicationRequest=consumed/disabled
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

## 4. Adjudicación terminal

```text
sourceGateRunId=31432971654
sourceGate=PASS_C6_AUTH_SMOKE_FINDINGS_ADJUDICATION_SOURCE_ZERO_WRITES_ONE_READ_NO_PII
requestCommit=ed081e79b3207692cb8b90b22c08feb3a241ba7b
runId=31433085997
jobId=93600894310
artifactId=9079893971
artifactDigest=sha256:1e300e105f29fa1d85385d495ad794633a0628127366221c6597e3ff97e454d0
providerReads=1
secondProviderRead=false
decision=STOP_RETRY_C6_AUTH_SMOKE_FINDINGS_ADJUDICATION
errorCode=AMBIGUOUS_ADJUDICATION_1
```

## 5. Hallazgos vigentes

Cuatro grupos de provider email duplicado tienen dos principals habilitados con claims/scope habilitantes: tres Admin/Operaciones y uno Cliente. Esta clasificación es a nivel de seguridad/claims, no prueba de login canónico de ambas cuentas.

El quinto grupo contiene dos principals habilitados sin acceso TyA efectivo: uno fuera del contrato de roles y otro cross-tenant. El keeper/histórico/técnico de ese grupo no quedó demostrado y es la única ambigüedad.

Los cuatro roles fuera de contrato no tienen acceso efectivo; el Admin cross-tenant solapa con el grupo ambiguo; el Shopper outlier carece de shopperId/target scope, no tiene relación con plan v4 y no tiene acceso efectivo.

## 6. Fail-close

```text
request=consumed/disabled
allowedExecutions=0
oneShotWorkflow=removed
sourceGateWorkflow=removed
providerWrites=0
AuthWrites=0
IAMWrites=0
FirestoreWrites=0
HRWrites=0
RulesWrites=0
StorageWrites=0
PREWRITE=false
Activation=false
newSmoke=false
deploys=0
merge=false
production=false
rawPIIExported=false
```

## 7. Siguiente acción exacta

Solo bajo autorización nueva:

`C6 AUTH DUPLICATE KEEPER + TARGET-SCOPE ADJUDICATION READ-ONLY FOCAL`.

Debe limitarse a los diez candidate fingerprints de los cinco grupos ya identificados. Resolver keeper vs histórico/técnico/retirable para los cuatro grupos con claims habilitantes y cerrar la política del grupo ambiguo, sin repair, nuevo smoke, writes, PREWRITE/Activation ni reconstrucción de las 340 identidades. Ante empate: `STOP_RETRY` sin segundo provider read.

## 8. Phase A preservada

Frontend, Login, `CX.data`, HR histórico, shoppers, postulaciones, certificaciones, visitas, liquidaciones/pagos, Finanzas, Portal Cliente, Portal Shopper, Reservas, multi-tenant, multi-proyecto, sincronización HR/plataforma y Academia permanecen preservados.
