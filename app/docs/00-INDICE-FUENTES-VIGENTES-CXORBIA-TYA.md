# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-05  
**Estado:** ACTIVO  
**Estado vivo:** `C6_GROUP_PROVENANCE_SOURCE_ONLY_PASS__REFERENCE_UNIVERSE_MISMATCH_PROVEN__12_SURNAME_ENRICHMENT_REQUIRED__1_MULTI_AUTH_ADJUDICATION_REQUIRED__NO_PROVIDER_READS__NO_WRITES__NO_DEPLOY__NO_PRODUCTION`

## 1. Fuentes activas y orden de prevalencia

1. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `app/docs/evidence/CORTE6-SHOPPER-GROUP-PROVENANCE-RESIDUAL-IDENTITY-SOURCE-ONLY-LATEST.json`;
3. `app/docs/SOURCE-LOCK-C6-GROUP-PROVENANCE-RESIDUAL-IDENTITY-SOURCE-ONLY-20260805.md`;
4. `backend/contracts/c6-shopper-deterministic-suffix-v1.json` — schema `v2.1`;
5. `tools/qa/cxorbia-c6-shopper-group-provenance-source-only.mjs`;
6. `backend/config/corte6-shopper-group-provenance-source-only-request.json` — consumido;
7. `app/docs/CAMBIOS-BACKEND-ADDENDUM-C6-GROUP-PROVENANCE-RESIDUAL-IDENTITY-SOURCE-ONLY-PASS-20260805.md`;
8. `app/docs/RESUMEN-PARA-CLAUDE-ADDENDUM-C6-GROUP-PROVENANCE-RESIDUAL-IDENTITY-SOURCE-ONLY-PASS-20260805.md`;
9. `app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-C6-GROUP-PROVENANCE-RESIDUAL-IDENTITY-SOURCE-ONLY-PASS-20260805.md`;
10. `app/docs/ACADEMIA-IMPACTO-C6-GROUP-PROVENANCE-RESIDUAL-IDENTITY-SOURCE-ONLY-PASS-20260805.md`;
11. `app/docs/PHASE-A-BLOCK-PROGRESS-TRACKER-ADDENDUM-C6-GROUP-PROVENANCE-RESIDUAL-IDENTITY-SOURCE-ONLY-PASS-20260805.md`;
12. `app/docs/evidence/CORTE6-SHOPPER-DIAGNOSTIC-CONTRACT-V2-PROVIDER-REVALIDATION-HOLD-LATEST.json`;
13. `app/docs/SOURCE-LOCK-C6-DIAGNOSTIC-CONTRACT-V2-PROVIDER-REVALIDATION-20260805.md`;
14. `tools/qa/cxorbia-c6-shopper-deterministic-suffix-readonly.mjs`;
15. `tools/qa/cxorbia-c6-shopper-login-collision-classification.mjs`;
16. `backend/config/corte6-shopper-deterministic-suffix-readonly-request.json` — provider request consumido;
17. `backend/contracts/c6-shopper-identity-canonicalization-v1.json`;
18. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
19. `app/docs/ADDENDUM-MAESTRO-EMPALME-DIRECTO-Y-CARRIL-FILE-AWARE-CXORBIA-TYA-VIGENTE.md`;
20. `AGENTS.md`, PR #7 y HEAD vivo.

## 2. Clasificación vigente del `+1/-0`

```text
addedGroup=ebbcc231fcf415cbaf77
referenceCount=64
plannerCount=65
primary=REFERENCE_UNIVERSE_MISMATCH_PROVEN
exactGroupCause=NOT_PROVEN_MEMBER_PROVENANCE_MISSING
legitimateConsensusChangeForExactGroup=POSSIBLE_NOT_PROVEN
suffixAllocationAlgorithmDefect=false
diagnosticComparatorDefect=true
```

La referencia usa apellido explícito/login técnico; el planner incluye consenso y linking por anclas técnicas. No se compararon universos equivalentes.

## 3. Contrato de procedencia por miembro

```text
memberFingerprint
active
preConsensusComplete
postConsensusComplete
completedByConsensus
sourceSafeSurnameBasis
surnameBasisCount
keeper
suffixApplied
suffixLength
inReferenceSet
inPlannerSet
referenceEligibility
plannerEligibility
linkedSourceResolutionMode
```

Todos los valores son fingerprints, booleanos, números o enums; no se permite identidad cruda.

## 4. Residuales

```text
12 surnames=AUTHORITATIVE_SURNAME_SOURCE_ENRICHMENT_REQUIRED
1 multiAuth=SOURCE_SAFE_ACCOUNT_ADJUDICATION_REQUIRED
automatic inference/selection=false
```

## 5. Plan vigente

```text
CREATE_AUTH=81
UPDATE_AUTH=46
NO_OP=73
HOLD=13
PRESERVE_NO_AUTH=127
rows=340 unique
readyForAuthRepair=false
partialExecutionAllowed=false
```

## 6. Gates source/static

```text
PASS run=31070193278
PASS job=92516351034
providerReads=0
requestConsumed=true
triggerFrozen=true
```

## 7. Estado seguro

```text
PROVIDER_READS/WRITES=0
AUTH/PASSWORD/MEMBERSHIP/FIRESTORE/RULES/STORAGE/HR_WRITES=0
HOSTING/CLOUD_RUN_DEPLOYS=0
MAKE/GEMINI/PAYMENTS=0
MERGE=false
PRODUCTION=false
```

## 8. Carril operativo vigente

No existe autorización residual. Próximo bloque solo con autorización expresa:

```text
A) integrar source-only member provenance y universo equivalente en planner/clasificador
B) preparar evidencia/adjudicación tenant no operativa para 12 apellidos y multi-Auth
```

## 9. Prohibiciones

- nueva lectura provider o segundo provider attempt;
- inferir apellidos o seleccionar Auth por orden/antigüedad;
- aplicar parcialmente el plan 340;
- writes, deploy, Make, Gemini, pagos, merge o producción.
