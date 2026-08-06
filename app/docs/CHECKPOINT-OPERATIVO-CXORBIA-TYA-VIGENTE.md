# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-05  
**Estado:** `C6_DIAGNOSTIC_V2_PROVIDER_HOLD__12_SURNAME_ZERO_EVIDENCE__1_MULTI_AUTH_EXACT_TIE__GROUP_SET_PLUS1__STOP_RETRY__NO_WRITES__NO_DEPLOY__NO_PRODUCTION`

## 1. Rama y control

- repo: `paulaosoriof86/demoCXOrbia`;
- rama viva: `docs-tya-v6-v71-audit`;
- PR #7: draft/open/no merge;
- source contract commit: `ceb5646400c61631eb2d8d469343360647c45f65`;
- request commit: `206c26f777fadeec2c60cbf8d9c509998967f457`;
- workflow freeze commit: `7ab085fdbc7c37c509d2191490257ca8bb950b5e`;
- provider revalidation executions: `1`;
- second attempt: `0`;
- producción: intacta.

## 2. Evidencia observable

```text
run=31069282511
job=92513630516
artifact=8955017770
artifactDigest=sha256:ffdf8643726d4f8c0c63484790a3b71c2f0a8b4ac04be604e700b829304aff09
providerDecision=HOLD_C6_DETERMINISTIC_SUFFIX_PLAN_STOP_RETRY
validation=PASS_SOURCE_SAFE_OUTPUTS_AND_EXACT_PLAN_CARDINALITY
```

## 3. Población y crosswalk

```text
profiles=340
authUsers=110
memberships=1
credentials=109
credentialsMapped=101
credentialsUnmapped=8
credentialCrosswalkParity=true
hrImportDocs=1
visits=616
certifications=77
liquidations=827
latestPeriod=2026-07
recentFloor=2026-05
```

## 4. Contrato de métricas v2

```text
preConsensusIncompleteActiveProfiles=83
completedByConsensus=71
remainingIncompleteActiveProfiles=12
metricIdentityValid=true
83 = 71 + 12
```

## 5. Doce apellidos residuales

Los 12 fingerprints presentan exactamente:

```text
first.complete=true
first.candidateCount=1
first.basisCount=1
surname.complete=false
surname.explicitCandidateCount=0
surname.technicalLoginCandidateCount=0
surname.consensusCandidateCount=0
surname.basisCount=0
surname.conflict=false
passwordSeed.complete=true
passwordSeed.candidateCount=1
passwordSeed.basisCount=1
```

Conclusión: primer nombre y semilla están disponibles; el apellido no tiene ninguna evidencia permitida. No es un conflicto entre candidatos y no puede inferirse por posición.

## 6. Reconciliación de grupos

```text
namespace=shopper-visible-login-group-v1
referenceCount=64
currentCount=65
added=[ebbcc231fcf415cbaf77]
removed=[]
unchangedCount=64
exactMatch=false
```

Grupo añadido source-safe:

```text
activeCount=2
keeperSelected=true
suffixedCount=1
suffix4=1
suffix6=0
suffix8=0
unresolvedCount=0
```

La procedencia de sus miembros no fue exportada; la diferencia `+1/-0` permanece sin explicación suficiente y bloquea.

## 7. Multi-Auth

```text
profilesWithMultipleCandidates=1
candidateCount=2
topScore=5016
secondScore=5016
scoreMargin=0
candidateSignalsIdentical=true
resolved=0
unresolved=1
```

Ambos candidatos tienen `shopperIdClaim=true`, están habilitados, verificados y con metadata; ninguno tiene exactClaims, coincidencia de correo, credencial ni compatibilidad de contraseña. Se conserva `STOP_RETRY`.

## 8. Plan 340 regenerado

```text
CREATE_AUTH=81
UPDATE_AUTH=46
NO_OP=73
HOLD=13
PRESERVE_NO_AUTH=127
emailChanges=39
passwordChangesPlanned=14
claimsChanges=38
planDigest=74f34e3eb8d07df4d12e2f7ddb7514d3b152371fa901deefc2cd305686bde47f
rows=340
uniqueProfileRows=340
readyForAuthRepair=false
executable=false
partialExecutionAllowed=false
```

No hubo colisiones de sufijo ni login objetivo duplicado.

## 9. Phase A preservada

Frontend canónico, módulos, `CX.data`, HR, histórico, shoppers, postulaciones, certificaciones, visitas, liquidaciones/pagos, multi-tenant, multi-proyecto, sincronización HR/plataforma, Finanzas, Portal Cliente, Portal Shopper, Reservas y Academia permanecen intactos.

## 10. Estado seguro

```text
PROVIDER_REVALIDATION_EXECUTIONS=1
SECOND_ATTEMPT=0
PROVIDER_WRITES=0
AUTH_WRITES=0
PASSWORD_CHANGES/RESETS=0
MEMBERSHIP_WRITES=0
FIRESTORE/RULES/STORAGE/HR_WRITES=0
HOSTING/CLOUD_RUN_DEPLOYS=0
MAKE/GEMINI/PAYMENTS=0
RAW_IDENTITY_EXPORTED=false
MERGE=false
PRODUCTION=false
```

## 11. Siguiente bloque exacto

```text
SOURCE-ONLY GROUP PROVENANCE + RESIDUAL IDENTITY CLASSIFICATION
→ usar únicamente artifacts source-safe del run 31069282511
→ explicar o clasificar el grupo ebbcc231fcf415cbaf77
→ diseñar vector mínimo de miembros/bases pre/post consenso
→ clasificar mecanismo no operativo para los 12 apellidos y el multi-Auth
→ STOP antes de provider read, repair o deploy
```
