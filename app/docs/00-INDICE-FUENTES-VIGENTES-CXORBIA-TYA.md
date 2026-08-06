# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-05  
**Estado:** ACTIVO  
**Estado vivo:** `C6_EQUIVALENT_UNIVERSE_MEMBER_PROVENANCE_SOURCE_STATIC_PASS__CONTRACT_V2_2__PROVIDER_REVALIDATION_NOT_AUTHORIZED__12_SURNAME_AND_1_MULTI_AUTH_HOLDS_PRESERVED__NO_WRITES__NO_DEPLOY__NO_PRODUCTION`

## 1. Fuentes activas y orden de prevalencia

1. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `app/docs/evidence/CORTE6-SHOPPER-EQUIVALENT-UNIVERSE-MEMBER-PROVENANCE-SOURCE-STATIC-PASS-LATEST.json`;
3. `app/docs/SOURCE-LOCK-C6-EQUIVALENT-UNIVERSE-MEMBER-PROVENANCE-SOURCE-ONLY-20260805.md`;
4. `backend/contracts/c6-shopper-deterministic-suffix-v1.json` — schema `v2.2`;
5. `tools/qa/cxorbia-c6-shopper-equivalent-universe.mjs`;
6. `tools/qa/cxorbia-c6-shopper-deterministic-suffix-readonly.mjs`;
7. `tools/qa/cxorbia-c6-shopper-login-collision-classification.mjs`;
8. `backend/config/corte6-shopper-equivalent-universe-source-only-request.json` — consumido PASS;
9. `app/docs/CAMBIOS-BACKEND-ADDENDUM-C6-EQUIVALENT-UNIVERSE-MEMBER-PROVENANCE-SOURCE-STATIC-PASS-20260805.md`;
10. `app/docs/RESUMEN-PARA-CLAUDE-ADDENDUM-C6-EQUIVALENT-UNIVERSE-MEMBER-PROVENANCE-SOURCE-STATIC-PASS-20260805.md`;
11. `app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-C6-EQUIVALENT-UNIVERSE-MEMBER-PROVENANCE-SOURCE-STATIC-PASS-20260805.md`;
12. `app/docs/ACADEMIA-IMPACTO-C6-EQUIVALENT-UNIVERSE-MEMBER-PROVENANCE-SOURCE-STATIC-PASS-20260805.md`;
13. `app/docs/PHASE-A-BLOCK-PROGRESS-TRACKER-ADDENDUM-C6-EQUIVALENT-UNIVERSE-MEMBER-PROVENANCE-SOURCE-STATIC-PASS-20260805.md`;
14. `app/docs/evidence/CORTE6-SHOPPER-GROUP-PROVENANCE-RESIDUAL-IDENTITY-SOURCE-ONLY-LATEST.json` — clasificación previa;
15. `app/docs/evidence/CORTE6-SHOPPER-DIAGNOSTIC-CONTRACT-V2-PROVIDER-REVALIDATION-HOLD-LATEST.json` — último snapshot provider;
16. `backend/config/corte6-shopper-deterministic-suffix-readonly-request.json` — provider request consumido;
17. `backend/contracts/c6-shopper-identity-canonicalization-v1.json`;
18. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
19. `app/docs/ADDENDUM-MAESTRO-EMPALME-DIRECTO-Y-CARRIL-FILE-AWARE-CXORBIA-TYA-VIGENTE.md`;
20. `AGENTS.md`, PR #7 y HEAD vivo.

## 2. Integración equivalente vigente

```text
run=31071318363
job=92519679056
sourceCommit=8fe5ad6dd185cce5ea3cdac06892f3144e8e5f0f
decision=PASS_C6_EQUIVALENT_UNIVERSE_MEMBER_PROVENANCE_INTEGRATION_SOURCE_STATIC
contract=v2.2
universe=shopper-equivalent-universe-v1
providerReads=0
providerWrites=0
```

Planner y clasificador comparten ahora:

```text
population=same_tenant_shopper_snapshot
activity=equivalentActive_v1
linking=direct_shopper_id_or_exact_unique_technical_anchor
completeness=post_consensus_active_complete
nameResolution=explicit_or_technical + multi_source_full_name_consensus
```

## 3. Procedencia source-safe

Para cada grupo añadido o eliminado, una futura revalidación podrá exportar únicamente:

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

Los candidatos multi-Auth incorporan `candidateFingerprint` bajo `shopper-auth-candidate-v1`. No se admite identidad cruda.

## 4. Estado del `+1/-0`

El defecto comparativo de universos quedó corregido en source. La causa exacta del antiguo grupo `ebbcc231fcf415cbaf77` queda:

```text
PENDING_EQUIVALENT_UNIVERSE_PROVIDER_REVALIDATION
```

No se afirma que el delta desapareció ni que sea defecto algorítmico porque este bloque no realizó provider read.

## 5. Residuales preservados

```text
12 surnames=AUTHORITATIVE_SURNAME_SOURCE_ENRICHMENT_REQUIRED
1 multiAuth=SOURCE_SAFE_ACCOUNT_ADJUDICATION_REQUIRED
automatic inference/selection=false
```

## 6. Plan provider histórico vigente

```text
CREATE_AUTH=81
UPDATE_AUTH=46
NO_OP=73
HOLD=13
PRESERVE_NO_AUTH=127
rows=340 unique
readyForAuthRepair=false
executable=false
partialExecutionAllowed=false
```

## 7. Estado seguro

```text
REQUEST_CONSUMED=true
SOURCE_ONLY_TRIGGER_FROZEN=true
UNUSED_TOOLING_LANE_RETIRED=true
PROVIDER_READS/WRITES=0
AUTH/PASSWORD/MEMBERSHIP/FIRESTORE/RULES/STORAGE/HR_WRITES=0
HOSTING/CLOUD_RUN_DEPLOYS=0
MAKE/GEMINI/PAYMENTS=0
MERGE=false
PRODUCTION=false
```

## 8. Carril operativo vigente

No existe autorización residual. El siguiente bloque requiere autorización expresa para una de estas rutas:

```text
A) ONE-SHOT PROVIDER READ-ONLY REVALIDATION AGAINST CONTRACT v2.2
B) NON-OPERATIONAL TENANT EVIDENCE/ADJUDICATION PREPARATION FOR 12 SURNAMES AND MULTI-AUTH
```

## 9. Prohibiciones

- nueva lectura provider sin autorización expresa;
- inferir apellidos o seleccionar Auth por orden, antigüedad o señal débil;
- aplicar parcialmente el plan 340;
- Auth/data/HR writes, deploy, Make, Gemini, pagos, merge o producción.
