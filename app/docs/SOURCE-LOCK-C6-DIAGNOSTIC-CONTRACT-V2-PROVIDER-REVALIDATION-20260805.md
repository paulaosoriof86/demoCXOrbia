# SOURCE LOCK — C6 provider read-only revalidation · diagnostic contract v2

**Fecha:** 2026-08-05  
**Rama:** `docs-tya-v6-v71-audit`  
**PR:** `#7` draft/open/no merge  
**HEAD de entrada:** `3b8047358143adf2d03beb482fe3a68b7eed1e7b`  
**Source contract commit:** `ceb5646400c61631eb2d8d469343360647c45f65`  
**Request commit:** `206c26f777fadeec2c60cbf8d9c509998967f457`  
**Workflow freeze commit:** `7ab085fdbc7c37c509d2191490257ca8bb950b5e`

## Ejecución única

```text
run=31069282511
job=92513630516
artifact=8955017770
artifactDigest=sha256:ffdf8643726d4f8c0c63484790a3b71c2f0a8b4ac04be604e700b829304aff09
providerDecision=HOLD_C6_DETERMINISTIC_SUFFIX_PLAN_STOP_RETRY
validation=PASS_SOURCE_SAFE_OUTPUTS_AND_EXACT_PLAN_CARDINALITY
secondAttempt=0
```

## Resultado

```text
crosswalk=101/8 PASS
preConsensus=83
completedByConsensus=71
remaining=12
metricIdentityValid=true
referenceGroups=64
currentGroups=65
setDelta=+1/-0
multiAuth unresolved=1
planRows=340 unique
HOLD=13
```

### Los 12 residuales

Todos tienen primer nombre y semilla de contraseña completos. El apellido presenta:

```text
complete=false
explicitCandidateCount=0
technicalLoginCandidateCount=0
consensusCandidateCount=0
basisCount=0
conflict=false
```

### Diferencia de grupos

Se añadió únicamente `ebbcc231fcf415cbaf77`; no se eliminó ninguno. El grupo contiene dos identidades activas, un keeper y una identidad con sufijo de cuatro caracteres. El artifact no exporta la procedencia source-safe de sus miembros, por lo que el `+1/-0` queda sin explicación suficiente y bloquea.

### Multi-Auth

Dos candidatos obtuvieron `5016/5016`, margen `0` y vectores idénticos. Se mantiene `STOP_RETRY`.

## Plan regenerado

```text
CREATE_AUTH=81
UPDATE_AUTH=46
NO_OP=73
HOLD=13
PRESERVE_NO_AUTH=127
planDigest=74f34e3eb8d07df4d12e2f7ddb7514d3b152371fa901deefc2cd305686bde47f
readyForAuthRepair=false
partialExecutionAllowed=false
```

## Seguridad

Una ejecución y cero segundo intento. Auth/password/membership/Firestore/Rules/Storage/HR writes, Hosting/Cloud Run, Make, Gemini, pagos, merge y producción: `0/false`. No se exportó identidad cruda.

El request quedó consumido y el trigger congelado. No existe autorización residual para provider read ni repair.
