# SOURCE LOCK — C6 AUTH TARGET ANCHOR LINEAGE ROOT FIX — SOURCE-ONLY STOP_RETRY

**Fecha:** 2026-08-07  
**Estado:** `C6_AUTH_FINAL_PLAN_340_HOLD0__TARGET_ANCHOR_LINEAGE_SOURCE_ONLY_STOP_RETRY_EXACT_CONSENSUS_BASES_NOT_VERSIONED__PROVIDER_MINIMUM_CLASSIFIED__ZERO_PROVIDER_READS__ZERO_WRITES__NO_PRODUCTION`

## 1. Carril y límites

- repo: `paulaosoriof86/demoCXOrbia`;
- rama viva: `docs-tya-v6-v71-audit`;
- PR #7: abierto, draft, sin merge;
- bloque: exclusivamente source-only;
- target: `ac93d90d9e41512acdcd`;
- provider/Auth/Firestore/HR reads: `0`;
- provider/Auth/Firestore/HR writes: `0`;
- deploy/build/merge/producción: `0/false`.

## 2. Fuentes leídas

Se usaron exclusivamente artefactos/matrices/evidencias ya existentes y código congelado:

- source run `31104541809` / artifact `8968941587`;
- source plan digest `acc93da842d1a5d3244327680f88539f0651cb101bae09dd231fd8b5008bea92`;
- planner congelado en `9d26344f55809d95023a33aeb3111802adb15d26`;
- `tools/qa/cxorbia-c6-shopper-deterministic-suffix-readonly.mjs`;
- `tools/qa/cxorbia-c6-shopper-equivalent-universe.mjs`;
- evidencias versionadas de equivalent universe, member provenance, group provenance, deterministic suffix e identity resolution.

No se consultó Firebase/GCP durante este bloque.

## 3. Vector congelado del target

```text
profileFp=ac93d90d9e41512acdcd
baseLoginFp=493f2b26360648693c37
targetLoginFp=bd8d7019d612b4421366
sourceSafeSurnameBasis=multi_source_full_name_consensus
resolutionBases=deterministic_technical_suffix
suffixApplied=true
suffixLength=4
primary=UPDATE_AUTH
changes.email=true
changes.password=true
changes.claims=true
diagnostics=null
```

Existe exactamente un peer en el plan con el mismo `baseLoginFp`:

```text
profileFp=a8dd7db89a02ff180674
sourceSafeSurnameBasis=explicit_or_technical
resolutionBases=unique_technical_holder_preserves_unsuffixed_login
suffixApplied=false
```

Esto demuestra estructuralmente que el target es el miembro suffixado de un grupo de dos identidades y que el peer conservó el login base no suffixado.

## 4. Lineage demostrada

El planner construye `baseLogin` como `first + '.' + surname`. Para `multi_source_full_name_consensus`:

1. no existe un apellido directo/technical único utilizable;
2. se extrae candidato de nombre completo por cada fuente ligada;
3. un token solo es aceptado si aparece en al menos **dos bases distintas**;
4. debe existir exactamente un candidato corroborado;
5. las bases posibles son `profile`, `hr`, `visit`, `certification`, `liquidation`;
6. los credentials participan en la ruta `credential:technical_login`, no en full-name consensus.

Las fuentes linked se ligan por `direct_shopper_id` o por `exact_technical_anchor` usando las llaves técnicas rectoras.

Luego el grupo de colisión se forma por `baseLogin`; al target se le asignó suffix determinístico de longitud `4`, y de allí se produjo `targetLoginFp=bd8d7019d612b4421366`.

Por tanto:

```text
baseLoginLineageStructurallyDemonstrated=true
targetLoginLineageStructurallyDemonstrated=true
```

## 5. Gap source-only real

No puede reconstruirse el **set exacto de bases corroborantes** del target con las evidencias versionadas actuales:

- el target es `UPDATE_AUTH`, por lo que el planner exportó `diagnostics=null`;
- el `group-matrix-source-safe` conserva forma agregada del grupo pero no los `memberVectors` del target;
- member provenance fue delta-only y el grupo quedó unchanged en la revalidación equivalente;
- `baseLoginFp` y `targetLoginFp` son fingerprints one-way y no pueden invertirse.

Así, source-only puede demostrar **cómo** se obtuvo el login y qué familias pudieron intervenir, pero no puede afirmar sin inventar si el par concreto fue `profile+hr`, `profile+visit`, `visit+liquidation`, etc.

## 6. Decisión

```text
STOP_RETRY_C6_AUTH_TARGET_ANCHOR_LINEAGE_ROOT_FIX_SOURCE_ONLY_EXACT_CONSENSUS_BASES_NOT_VERSIONED
```

No se intenta otra inferencia ni provider read dentro de este bloque.

## 7. Ancla mínima PII-free clasificada

La ancla válida para la siguiente resolución es:

```text
classification=VERIFIED_RECONSTRUCTED_TARGET_LOGIN_FINGERPRINT_WITH_UNIQUE_PLAN_ASSOCIATION
profileFp=ac93d90d9e41512acdcd
baseLoginFp=493f2b26360648693c37
targetLoginFp=bd8d7019d612b4421366
suffixLength=4
targetLoginUniqueInFrozenPlan=true
```

No basta con el fingerprint aislado: en una futura lectura provider debe reconstruirse transitoriamente el login desde las mismas reglas y confirmar ambos fingerprints antes de leer Auth.

## 8. Mínimo provider futuro — no autorizado todavía

El contrato source-only `backend/contracts/c6-auth-target-anchor-lineage-provider-minimum-v1.json` congela la ruta mínima:

1. resolver el target técnico en `tenants/tya/shoppers`;
2. leer adaptativamente solo objetos target-linked de `hrImports`, `visits`, `certifications` y `liquidations`, con short-circuit en cuanto dos bases distintas corroboren exactamente un apellido y se reproduzcan `baseLoginFp` + `targetLoginFp`;
3. **cero Auth reads hasta ese PASS**;
4. solo entonces máximo una página Auth y exigir `candidateCount=1` y cero asociación con otro row;
5. solo después, una lectura hashConfig y snapshot password de ese único target.

No se autoriza ese provider block mediante este source lock.

## 9. Plan Auth y Phase A preservados

```text
rows=340
uniqueRows=340
CREATE_AUTH=81
UPDATE_AUTH=46
NO_OP=81
HOLD=0
PRESERVE_NO_AUTH=132
rowsDigest=68e26a5217957333d256f2cb547faf3e1eef74e2c789bfd85454d42dfd472dc3
AuthExecuted=false
```

SKIP13 y la adjudicación multi-Auth siguen cerrados. Frontend, `CX.data`, HR histórico, shoppers, postulaciones, certificaciones, visitas, liquidaciones/pagos, Finanzas, portales, Reservas, multi-tenant, multi-proyecto y Academia quedan preservados.

## 10. Estado seguro

```text
providerReadsThisBlock=0
AuthReadsThisBlock=0
FirestoreReadsThisBlock=0
HRReadsThisBlock=0
providerWrites=0
AuthWrites=0
FirestoreWrites=0
HRWrites=0
RulesWrites=0
StorageWrites=0
CloudBuild=0
CloudRun=0
Hosting=0
Make=0
Gemini=0
payments=0
merge=false
production=false
```
