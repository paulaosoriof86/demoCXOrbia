# SOURCE LOCK — C6 group provenance + residual identity source-only

**Fecha:** 2026-08-05  
**Rama:** `docs-tya-v6-v71-audit`  
**PR:** `#7` draft/open/no merge  
**HEAD de entrada:** `ffa0e47ebb1d6049caf547133d444bb0b758bb5c`  
**Provider source run:** `31069282511`  
**Artifact digest:** `sha256:ffdf8643726d4f8c0c63484790a3b71c2f0a8b4ac04be604e700b829304aff09`

## Ejecución source/static

```text
PASS run=31070193278
PASS job=92516351034
requestCommit=9f4a9840bc4aabe3e8a3e8fa04b02064ed22582f
workflowFreezeCommit=e0844292783ef9e516e0028ef5f93fa8574309e9
requestConsumedCommit=52412f5b71c7e504fd8352f19458ad1382edf8df
providerReads=0
```

Intento transitorio:

```text
run=31070119537
job=92516119841
helperSelfTest=PASS
contractChecks=PASS
failure=privacy checker matched safe field names ending in Allowed=false
providerReads=0
```

## Clasificación final

```text
addedGroup=ebbcc231fcf415cbaf77
primary=REFERENCE_UNIVERSE_MISMATCH_PROVEN
exactGroupCause=NOT_PROVEN_MEMBER_PROVENANCE_MISSING
legitimateConsensusChangeForExactGroup=POSSIBLE_NOT_PROVEN
suffixAllocationAlgorithmDefect=false
diagnosticComparatorDefect=true
```

La referencia y el planner no usan el mismo universo:

- referencia: apellido explícito o login técnico verificado;
- planner: completo post-consenso y linking adicional por anclas técnicas.

Por ello, el `+1/-0` no prueba drift de datos ni defecto del algoritmo de sufijo. El grupo añadido es técnicamente asignable —keeper, un sufijo de cuatro caracteres, cero irresueltos—, pero no puede atribuirse exclusivamente al consenso porque los artifacts no exportan miembros.

## Vector aplicado al contrato v2.1

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

No se permiten nombres, apellidos, logins, correos, UID, contraseñas ni PII.

## Identidades residuales

- 12 apellidos: `AUTHORITATIVE_SURNAME_SOURCE_ENRICHMENT_REQUIRED`;
- multi-Auth exacto: `SOURCE_SAFE_ACCOUNT_ADJUDICATION_REQUIRED`;
- selección o inferencia automática: prohibida.

## Seguridad

```text
providerReads=0
providerWrites=0
Auth/password/membership/Firestore/Rules/Storage/HR writes=0
Hosting/Cloud Run deploys=0
Make/Gemini/payments=0
merge=false
production=false
```

El request quedó consumido y el trigger congelado. No existe autorización residual para provider read, repair ni aplicación parcial.
