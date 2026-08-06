# SOURCE LOCK — C6 group provenance + residual identity source-only

**Fecha:** 2026-08-05  
**Rama:** `docs-tya-v6-v71-audit`  
**PR:** `#7` draft/open/no merge  
**HEAD de entrada:** `ffa0e47ebb1d6049caf547133d444bb0b758bb5c`  
**Provider source run:** `31069282511`  
**Artifact digest:** `sha256:ffdf8643726d4f8c0c63484790a3b71c2f0a8b4ac04be604e700b829304aff09`

## Alcance autorizado

Usar únicamente el source vigente y los artifacts source-safe del run `31069282511` para:

1. clasificar el delta `+1/-0` del grupo `ebbcc231fcf415cbaf77`;
2. diseñar y aplicar al contrato diagnóstico un vector source-safe por miembro;
3. clasificar el mecanismo mínimo no operativo para los 12 apellidos sin evidencia;
4. clasificar el mecanismo mínimo no operativo para el empate multi-Auth;
5. ejecutar únicamente gates source/static.

## Vector mínimo por miembro

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

## Límites de clasificación

Los artifacts actuales no incluyen miembros dentro de `groupMatrix`; por tanto, el bloque puede clasificar la causa contractual/comparativa y la observabilidad faltante, pero no atribuir el fingerprint añadido a personas específicas ni reconstruir identidad.

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

El bloque termina después de source/static. No autoriza una nueva lectura provider, repair ni aplicación parcial.
