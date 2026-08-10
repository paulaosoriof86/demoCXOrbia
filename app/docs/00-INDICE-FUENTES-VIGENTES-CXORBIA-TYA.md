# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-10  
**Estado:** ACTIVO Y RECONCILIADO  
**Estado vivo:** `C6_AUTH_DUPLICATE_KEEPER_SOURCE_GATE_STOP_PRE_PROVIDER_FALSE_POSITIVE__AUTH_DEV_228_PRESERVED__ZERO_PROVIDER_READS__NO_REQUEST__NO_PRODUCTION`

## 1. Orden de prevalencia

1. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `app/docs/SOURCE-LOCK-C6-AUTH-DUPLICATE-KEEPER-SOURCE-GATE-PREPROVIDER-STOP-RETRY-20260810.md`;
3. `app/docs/evidence/C6-AUTH-DUPLICATE-KEEPER-SOURCE-GATE-PREPROVIDER-STOP-RETRY-20260810.json`;
4. `app/docs/SOURCE-LOCK-C6-AUTH-SMOKE-FINDINGS-ADJUDICATION-AMBIGUITY-STOP-RETRY-20260810.md` — hallazgos de los cinco pares, histórico inmediato;
5. `app/docs/evidence/C6-AUTH-SMOKE-FINDINGS-ADJUDICATION-AMBIGUITY-STOP-RETRY-20260810.json`;
6. `backend/config/c6-auth-smoke-findings-adjudication-readonly-request-v1.json` — consumido/deshabilitado;
7. `backend/config/c6-shopper-auth-final-freeze-v4.json` — freeze Auth rector;
8. `backend/config/c6-auth-plan-v4-activation-dev-request-v3.json` — Activation Auth PASS, consumido/deshabilitado;
9. `backend/config/c6-accumulative-multirole-smoke-readonly-request-v1.json` — smoke histórico consumido/deshabilitado;
10. `backend/config/c6-accumulative-multirole-smoke-matrix-v1.json`;
11. `backend/contracts/c6-auth-plan-v4-activation-dev-v1.json`;
12. source locks históricos de Activation, HashConfig, update-universe, multi-Auth y direct runner;
13. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
14. addenda vigentes y PR #7.

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
CurrentBlock=STOP_RETRY_PRE_PROVIDER_SOURCE_GATE_FALSE_POSITIVE
CurrentProviderReads=0
ProviderRequestEmitted=false
ProviderWorkflowCreated=false
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

## 4. Hallazgo focal todavía vigente

```text
DuplicateProviderEmailGroups=5
ClaimScopeDuplicateDefects=4
AmbiguousDuplicateGroups=1
```

Los cinco pares exactos permanecen congelados en el source lock previo. El bloque actual no llegó a provider y por tanto no adjudicó keeper nuevo alguno.

## 5. Bloqueo actual

La preparación source-only detectó una aserción estática defectuosa: el gate buscaba los substrings `creationTime` y `lastSignInTime`, pero esos textos aparecían únicamente en flags negativos de seguridad (`creationTimeUsed:false`, `lastSignInTimeUsed:false`). Se aplicó `STOP_RETRY` antes de emitir request provider.

```text
classification=PRE_PROVIDER_SOURCE_GATE_FALSE_POSITIVE_TEMPORAL_SAFETY_FLAG_MATCH
toolCommit=57e610901e524cf4e551bea031b9aba9c0634b6c
sourceGateCommit=b6e562fa548bb69bf11d1638f5f1dd48315fc318
sourceGateRemovalCommit=b4c2840759b8fe8258ec7d8d071afbc0ae647803
toolRemovalCommit=0850e078d8d9e6eea47eb2ac096b79c22a3b61f4
providerReads=0
```

## 6. Fail-close

```text
providerRequestEmitted=false
providerWorkflowCreated=false
providerReads=0
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
rawPIIExported=false
```

## 7. Siguiente acción exacta

Solo bajo nueva autorización:

`C6 AUTH DUPLICATE KEEPER SOURCE-GATE FALSE-POSITIVE ROOTFIX → ONE READ FOCAL`.

Corregir solo la aserción temporal del source gate; validar offline/source-only. Únicamente con PASS emitir request nuevo/no superpuesto y ejecutar máximo una lectura provider limitada a los mismos diez candidate fingerprints. Ante empate o fallo: `STOP_RETRY`, sin segundo provider read. No repair, PREWRITE, Activation, nuevo smoke, writes, deploy, merge ni producción.

## 8. Phase A preservada

Frontend, Login, `CX.data`, HR histórico, shoppers, postulaciones, certificaciones, visitas, liquidaciones/pagos, Finanzas, Portal Cliente, Portal Shopper, Reservas, multi-tenant, multi-proyecto, sincronización HR/plataforma y Academia permanecen preservados.
