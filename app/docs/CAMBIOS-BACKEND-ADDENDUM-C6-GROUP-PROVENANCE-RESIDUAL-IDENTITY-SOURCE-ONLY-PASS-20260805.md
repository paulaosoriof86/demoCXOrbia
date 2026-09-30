# CAMBIOS-BACKEND — C6 group provenance + residual identity source-only PASS

**Fecha:** 2026-08-05  
**Estado:** `PASS_C6_GROUP_PROVENANCE_RESIDUAL_IDENTITY_SOURCE_ONLY_WITH_DIAGNOSTIC_HOLDS`

## Resultado técnico

El delta `64 → 65`, `+1/-0`, quedó clasificado como:

```text
REFERENCE_UNIVERSE_MISMATCH_PROVEN
exact group cause=NOT_PROVEN_MEMBER_PROVENANCE_MISSING
suffix allocation algorithm defect=false
diagnostic comparator defect=true
```

El clasificador de referencia exige nombre verificado mediante apellido explícito o login técnico. El planner incluye además consenso de nombre completo y resolución de fuentes mediante anclas técnicas. Por tanto, los dos conjuntos no usan el mismo universo.

El grupo `ebbcc231fcf415cbaf77` no presenta fallo de sufijo: tiene dos activos, keeper único, un sufijo de cuatro caracteres y cero irresueltos. El artifact no contiene sus miembros, por lo que no se atribuyó el `+1` exclusivamente al consenso.

## Archivos técnicos

- `backend/contracts/c6-shopper-deterministic-suffix-v1.json` → schema `v2.1`;
- `tools/qa/cxorbia-c6-shopper-group-provenance-source-only.mjs`;
- `app/docs/evidence/CORTE6-SHOPPER-GROUP-PROVENANCE-RESIDUAL-IDENTITY-SOURCE-ONLY-LATEST.json`;
- request source-only consumido;
- workflow source-only congelado.

## Contrato de procedencia por miembro

Se añadió un vector sin identidad cruda con:

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

## Clasificación residual

- 12 apellidos: `AUTHORITATIVE_SURNAME_SOURCE_ENRICHMENT_REQUIRED`;
- multi-Auth exacto: `SOURCE_SAFE_ACCOUNT_ADJUDICATION_REQUIRED`;
- selección automática: prohibida.

## Gates

```text
run=31070193278
job=92516351034
status=PASS
providerReads=0
providerWrites=0
```

Intento transitorio `31070119537`: self-test y contrato pasaron, pero un gate textual confundió campos seguros como `rawNamesAllowed=false` con datos crudos. Se corrigió el checker; no hubo provider read ni operación.

## Clasificación documental

- **Reusable CXOrbia:** vector de procedencia, equivalencia de universos y adjudicación source-safe.
- **Exclusivo TyA:** 12 apellidos y un empate multi-Auth.
- **Claude/prototipo:** sin cambios frontend.
- **Academia:** trazabilidad de universo, observabilidad y minimización de datos.
- **Sin impacto Claude:** Auth, datos, deploy y producción intactos.

## Seguridad

Provider reads/writes, Auth/password/membership/Firestore/Rules/Storage/HR writes, Hosting/Cloud Run, Make, Gemini, pagos, merge y producción: `0/false`.
