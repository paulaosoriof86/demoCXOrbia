# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-07  
**Estado:** ACTIVO Y RECONCILIADO  
**Estado vivo:** `C6_DIRECT_RUNNER_DEV_PASS__SKIP13_7_UNIQUE_CANONICAL_AUTH__1_DUPLICATE_EFFECTIVE_PAIR_UNRESOLVED_KEEPER__STOP_RETRY__AUTH_FREEZE_UNMODIFIED__NO_WRITES__NO_PRODUCTION`

## 1. Orden de prevalencia

1. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `app/docs/SOURCE-LOCK-C6-SKIP13-ACCESS-RECONCILIATION-SOURCE-ONLY-STOP-RETRY-20260807.md`;
3. `app/docs/evidence/C6-SKIP13-ACCESS-RECONCILIATION-SOURCE-ONLY-STOP-RETRY-20260807.json`;
4. `backend/config/c6-skip13-access-reconciliation-overlay-v1.json`;
5. `tools/qa/cxorbia-c6-skip13-access-reconciliation-source-only.mjs`;
6. `backend/config/c6-skip13-access-reconciliation-source-only-request-v1.json` — consumido/deshabilitado;
7. `app/docs/SOURCE-LOCK-C6-SKIP13-PROVIDER-READONLY-V2-UNPLANNED-ACCESS-HOLD-20260807.md`;
8. `app/docs/evidence/C6-SKIP13-PROVIDER-READONLY-REVALIDATION-V2-HOLD-20260807.json`;
9. `backend/contracts/c6-skip13-auth-access-adjudication-v2.json`;
10. `tools/qa/cxorbia-c6-skip13-auth-access-adjudication-readonly-v2.mjs`;
11. `app/docs/SOURCE-LOCK-C6-SKIP13-SELFTEST-HARNESS-ROOT-FIX-SOURCE-ONLY-PASS-20260807.md`;
12. `app/docs/SOURCE-LOCK-C6-DIRECT-RUNNER-DEV-DEPLOY-PASS-20260807.md`;
13. `backend/config/c6-shopper-auth-final-freeze-v1.json`;
14. `backend/config/c6-shopper-auth-snapshot-rollback-manifest-v1.json`;
15. `backend/config/c6-accumulative-multirole-smoke-matrix-v1.json`;
16. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
17. addenda vigentes y PR #7.

## 2. Direct runner DEV

```text
DirectRunnerDEV=PASS
service=cxorbia-c6-direct-runner-dev
revision=cxorbia-c6-direct-runner-dev-00001-2vz
runtimeIsolation=PASS
providerBoundaryEnabled=false
```

## 3. SKIP13 provider V2 ya cerrado

La lectura provider V2 resolvió 13/13 fingerprints y demostró 8 perfiles / 9 candidatos Auth con acceso efectivo. El request está consumido y no existe segundo provider attempt.

## 4. Reconciliación source-only vigente

```text
requestId=c6-skip13-access-reconciliation-source-only-20260807-01
runId=31197299766
jobId=92928580367
artifactId=9001336549
artifactDigest=sha256:e3aa1169e33b97e34639542fd9a2ca6dfa6f8f72372479e24b784c1106b42480
decision=STOP_RETRY_C6_SKIP13_ACCESS_RECONCILIATION_MULTI_AUTH_KEEPER_UNRESOLVED
```

Resultado:

```text
canonicalCurrentEffectiveAuthUniqueProfiles=7
historicalAliasCandidatesProven=0
duplicateEffectiveProfiles=1
duplicateEffectiveCandidates=2
accessToRetireCandidatesProven=0
unresolvedKeeperProfiles=1
```

Siete perfiles tienen un único Auth efectivo exacto y quedan reconciliados como `IDENTIDAD_CANONICA_VIGENTE` / preservar Auth existente. El perfil `7cc28c78de9bfda01d14` conserva dos candidatos efectivos (`4e6d26551d11db444bd0`, `9b2b7ca1bd72c1301d29`) y las fuentes disponibles no demuestran cuál es keeper ni cuál debe perder acceso. No se permite seleccionar por antigüedad, ordinal, first-returned, enabled o emailVerified.

## 5. Plan y freeze

El freeze original permanece intacto:

```text
rows=340
uniqueRows=340
CREATE_AUTH=81
UPDATE_AUTH=46
NO_OP=73
HOLD=0
PRESERVE_NO_AUTH=140
planDigest=6060f406a33d4ba926c982871513f8e86ba2b10f44c2da00ab43bd2a409f721b
AuthExecuted=false
```

El overlay source-only demuestra una partición provisional no superpuesta, pero activa STOP_RETRY:

```text
rows=340
uniqueRows=340
CREATE_AUTH=81
UPDATE_AUTH=46
NO_OP=80
HOLD=1
PRESERVE_NO_AUTH=132
onePrimaryOperationPerProfile=true
targetHoldZeroSatisfied=false
executable=false
```

No se fabricó un plan final HOLD=0 porque requeriría escoger arbitrariamente uno de los dos Auth efectivos del perfil especial.

## 6. Pendiente real

1. Resolver con evidencia/autorización distinta el keeper vs acceso a retirar para `7cc28c78de9bfda01d14`.
2. Solo después regenerar/congelar un plan Auth final no superpuesto con 340 filas y HOLD=0.
3. Autorizar ejecución Auth con snapshot/rollback.
4. Smoke acumulativo Admin/Operaciones, Shopper y Cliente.
5. Validación humana.
6. Cutover/promoción autorizada.

## 7. Estado seguro

```text
providerReadsThisBlock=0
AuthReads=0
claimsReads=0
membershipReads=0
HRReads=0
providerWrites=0
AuthWrites=0
passwordChanges=0
passwordResets=0
membershipWrites=0
FirestoreWrites=0
RulesWrites=0
StorageWrites=0
HRWrites=0
CloudBuild=0
CloudRunDeploy=0
HostingDeploy=0
merge=false
production=false
```
