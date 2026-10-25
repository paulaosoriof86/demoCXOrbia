# SOURCE LOCK — C6 AUTH TARGET ADAPTIVE LINEAGE — CROSS-ROW PRINCIPAL ALIAS ROOT CAUSE

**Fecha:** 2026-08-07  
**Estado:** `C6_AUTH_TARGET_LINEAGE_PASS_PROFILE_VISIT__AUTH_CANDIDATE_0__CROSS_ROW_PRINCIPAL_ALIAS_ROOT_CAUSE__NO_PASSWORD_READ__ZERO_WRITES__AUTH_PLAN_REQUIRES_SOURCE_ROOTFIX__NO_PRODUCTION`

## 1. Carril

- repo: `paulaosoriof86/demoCXOrbia`;
- rama: `docs-tya-v6-v71-audit`;
- PR #7: abierto, draft, sin merge;
- provider target: `cxorbia-backend-dev`;
- producción: intacta;
- Auth ejecutado: no.

## 2. Por qué este bloque no repitió el bucle

Antes de provider se revisó la cadena completa de STOP_RETRY. Se identificó que los resolvers anteriores habían ido estrechando anclas distintas sin reproducir toda la lógica del PREWRITE original. El circuito de causa raíz exigió:

1. reconstruir primero la lineage multi-source real;
2. propagar llaves técnicas de fuentes linked antes de mapear credentials;
3. no usar claims actuales como único selector;
4. no usar el `baseLogin` compartido como selector suficiente del target;
5. rechazar candidatos asociados al peer u otro row;
6. registrar que el PREWRITE Auth vigente todavía tiene una regla de `salt` no vacío incompatible con el hallazgo source-only SHA256/1 saltless.

## 3. Incidencia source antes de provider

El primer request del bloque disparó:

```text
runId=31226987446
jobId=93023181327
failure=STATIC_GATE_FALSE_POSITIVE_MAP_SET
providerReads=0
providerWrites=0
credentialPrepared=false
providerExecutionStarted=false
```

El gate confundió `Map.set()` local con una escritura Firestore. Se corrigió el regex para detectar únicamente patrones `.doc(...).set/update/delete`. Ese run no cruzó provider y quedó consumido.

## 4. Único provider attempt

```text
requestId=c6-auth-target-adaptive-lineage-password-snapshot-readonly-20260807-02
requestCommit=2da4eeb7336c8b3d68cb3c4e787ae0abdabd3b3e
runId=31227139583
jobId=93023626036
artifactId=9012489547
artifactDigest=sha256:82fc0f55becf62fbec5380652d5cd9f535d592da866fd921b51b0eeba9d32c05
workflowConclusion=success
decision=STOP_RETRY_C6_AUTH_TARGET_ADAPTIVE_LINEAGE_PASSWORD_SNAPSHOT_READONLY_TECHNICAL
blocker=TARGET_AUTH_CANDIDATE_COUNT_0
secondProviderAttempt=false
```

## 5. Lineage finalmente demostrada

El target `ac93d90d9e41512acdcd` reprodujo exactamente la regla congelada:

```text
lineagePass=true
corroboratingBases=profile,visit
corroboratingBasisCount=2
directTokenCount=0
baseLoginFp=493f2b26360648693c37 MATCH
targetLoginFp=bd8d7019d612b4421366 MATCH
suffixLength=4
targetLoginUniqueInFrozenPlan=true
```

Por primera vez se conoce el set concreto de bases: `profile + visit`. Ya no existe un problema pendiente de lineage para este target.

## 6. Hallazgo de causa raíz

Con la lineage exacta reconstruida, el resolver abrió una sola página Auth y usó únicamente anclas target-specific. El resultado fue:

```text
targetSpecificCandidateCount=0
credentialAnchorPresent=false
hashConfigReads=0
passwordHashInspected=false
passwordSaltInspected=false
snapshotCreated=false
```

Al contrastarlo con `tools/qa/cxorbia-c6-auth-activation-dev.mjs` se demuestra el defecto rector del plan/PREWRITE anterior:

- target `ac93...` y peer `a8dd...` comparten el mismo `baseLoginFp`;
- el peer conserva el login base no suffixado;
- el PREWRITE antiguo agregaba candidatos por `shopperId claim`, credentials, `baseLogin` y `targetLogin`;
- luego exigía solo `candidates.length === 1` **por row**;
- no existía un invariant global que impidiera seleccionar el mismo Auth UID/principal para dos perfiles diferentes;
- el PREWRITE antiguo llegó hasta la fase de password rollback, por lo que ese candidato había pasado cardinalidad y change flags;
- al excluir correctamente el `baseLogin` compartido como selector del target, el target tiene `0` Auth principals existentes elegibles.

Clasificación:

```text
CROSS_ROW_EXISTING_AUTH_PRINCIPAL_ALIAS_IN_OLD_PREWRITE=true
```

La lectura correcta es que el blocker `PASSWORD_ROLLBACK_HASH_SALT_UNAVAILABLE:ac93...` era downstream de un defecto de selección/clasificación del principal, no evidencia de que el password del target fuera el problema raíz.

## 7. Consecuencia sobre el plan Auth

El plan previo sigue preservado como evidencia, pero **ya no es ejecutable** hasta un root fix source-only:

```text
rows=340
CREATE_AUTH=81
UPDATE_AUTH=46
NO_OP=81
HOLD=0
PRESERVE_NO_AUTH=132
passwordChanges=14
digest=68e26a5217957333d256f2cb547faf3e1eef74e2c789bfd85454d42dfd472dc3
AuthExecuted=false
status=FROZEN_BUT_NOT_EXECUTABLE_PENDING_PRINCIPAL_UNIQUENESS_ROOT_FIX
```

No se cambia todavía `ac93...` a CREATE_AUTH por declaración manual. El siguiente root fix debe materializar esa re-clasificación mediante simulación source-only y recalcular counts/digest.

## 8. Root fix obligatorio siguiente

Debe agregar:

1. invariant global: un Auth principal existente no puede ser seleccionado por más de un profile row;
2. simulación del target con selector target-specific;
3. si candidateCount=0 y targetLogin sigue único, reclasificar el target a `CREATE_AUTH`;
4. preservar al peer como su propio `UPDATE_AUTH`;
5. reconstruir 340 filas, counts, digest y expected Auth population;
6. recalcular password updates existentes;
7. corregir semántica rollback: `salt` vacío demostrado como legítimo no equivale a `salt` no disponible;
8. mantener rollback exacto, no compensatorio.

No se requiere provider para este root fix.

## 9. Lecturas consumidas

```text
shopperIndexQueries=1
shopperDocumentsRead=340
targetLinkedQueries=12
targetLinkedDocumentsRead=5
queryErrors=0
authDirectoryPages=1
hashConfigReads=0
```

## 10. Seguridad

```text
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
PIIExported=false
```

El workflow one-shot fue retirado y ambos requests quedaron consumidos. No existe autorización latente ni segundo provider attempt.
