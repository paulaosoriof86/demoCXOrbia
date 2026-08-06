# SOURCE LOCK — C6 universo equivalente + procedencia por miembro source-only

**Fecha:** 2026-08-05  
**Rama:** `docs-tya-v6-v71-audit`  
**PR:** `#7` draft/open/no merge  
**HEAD de entrada:** `603373dde7d94990059247f06661b790c33a31ac`  
**Provider source run preservado:** `31069282511`

## Alcance autorizado

Un único bloque source-only para:

1. integrar en planner y clasificador un universo equivalente de población, actividad, linking y completitud;
2. compartir resolución de nombre técnico, actividad y fingerprints mediante un helper puro;
3. emitir para grupos añadidos o eliminados únicamente vectores source-safe por miembro;
4. añadir fingerprints source-safe a candidatos multi-Auth;
5. ejecutar sintaxis, fixtures y gates source/static;
6. detenerse antes de cualquier provider read o acción operativa.

## Universo equivalente

La referencia y el planner deberán usar exactamente:

```text
population=tenant shoppers completos del mismo snapshot
activity=misma función equivalentActive
linking=shopperId directo o ancla técnica exacta única
completeness=post-consensus active complete
nameResolution=explicit/technical + multi-source consensus
```

La referencia representa grupos visibles antes de asignar keeper/sufijo; el planner representa los mismos grupos después de asignarlos. Cualquier delta futuro deberá incluir procedencia por miembro antes de clasificarse.

## Vector source-safe

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

Para multi-Auth se permite únicamente `candidateFingerprint` estable, ordinal, score y señales booleanas. No se permiten nombres, apellidos, logins, correos, UID, contraseñas ni PII.

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

No autoriza provider revalidation, adjudicación tenant, repair, aplicación parcial ni deploy.
