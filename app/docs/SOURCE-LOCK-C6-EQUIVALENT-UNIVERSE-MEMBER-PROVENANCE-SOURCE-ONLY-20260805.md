# SOURCE LOCK — C6 universo equivalente + procedencia por miembro source-only

**Fecha:** 2026-08-05  
**Rama:** `docs-tya-v6-v71-audit`  
**PR:** `#7` draft/open/no merge  
**HEAD de entrada:** `603373dde7d94990059247f06661b790c33a31ac`  
**Provider source run preservado:** `31069282511`  
**Source/static PASS run:** `31071318363`  
**PASS job:** `92519679056`  
**Source commit:** `8fe5ad6dd185cce5ea3cdac06892f3144e8e5f0f`

## Alcance autorizado y aplicado

Se completó un único bloque source-only para:

1. integrar en planner y clasificador un universo equivalente de población, actividad, linking y completitud;
2. compartir resolución de nombre técnico, actividad y fingerprints mediante un helper puro;
3. emitir para grupos añadidos o eliminados únicamente vectores source-safe por miembro;
4. añadir fingerprints source-safe a candidatos multi-Auth;
5. ejecutar sintaxis, fixtures y gates source/static;
6. detenerse antes de cualquier provider read o acción operativa.

## Universo equivalente integrado

La referencia y el planner usan:

```text
population=same_tenant_shopper_snapshot
activity=equivalentActive_v1
linking=direct_shopper_id_or_exact_unique_technical_anchor
completeness=post_consensus_active_complete
nameResolution=explicit_or_technical + multi_source_full_name_consensus
universeVersion=shopper-equivalent-universe-v1
```

La referencia representa grupos visibles antes de keeper/sufijo y el planner representa esos mismos grupos después. El contrato v2.2 exige universos idénticos antes de clasificar un delta.

## Vector source-safe integrado

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

Para multi-Auth se añadió `candidateFingerprint` estable bajo `shopper-auth-candidate-v1`, además de ordinal, score y señales booleanas. No se permiten nombres, apellidos, logins, correos, UID, contraseñas ni PII.

## Evidencia PASS

```text
decision=PASS_C6_EQUIVALENT_UNIVERSE_MEMBER_PROVENANCE_INTEGRATION_SOURCE_STATIC
requestConsumed=true
contractVersion=v2.2
deltaOnlyMemberProvenance=true
providerReads=0
providerWrites=0
```

Evidencia: `app/docs/evidence/CORTE6-SHOPPER-EQUIVALENT-UNIVERSE-MEMBER-PROVENANCE-SOURCE-STATIC-PASS-LATEST.json`.

## Incidencias de ejecución

- run `31070904888`: falso positivo del checker textual; sin commit, consumo o provider read;
- run `31071180319`: gates y delta PASS; push rechazado exclusivamente por intentar modificar un workflow sin permiso `workflows`; sin commit remoto ni consumo remoto;
- run `31071318363`: transporte corregido, PASS y commit remoto.

El trigger principal quedó congelado y la lane auxiliar no utilizada quedó retirada.

## Seguridad final

```text
providerReads=0
providerWrites=0
Auth/password/membership/Firestore/Rules/Storage/HR writes=0
Hosting/Cloud Run deploys=0
Make/Gemini/payments=0
rawIdentityExported=false
merge=false
production=false
```

No autoriza provider revalidation, adjudicación tenant, repair, aplicación parcial ni deploy. El siguiente bloque requiere autorización expresa nueva.
