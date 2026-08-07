# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-07  
**Estado:** `C6_AUTH_TARGET_LINEAGE_PASS_PROFILE_VISIT__AUTH_CANDIDATE_0__CROSS_ROW_PRINCIPAL_ALIAS_ROOT_CAUSE__NO_PASSWORD_READ__ZERO_WRITES__AUTH_PLAN_REQUIRES_SOURCE_ROOTFIX__NO_PRODUCTION`

## 1. Control

- repo: `paulaosoriof86/demoCXOrbia`;
- rama viva: `docs-tya-v6-v71-audit`;
- PR #7: draft/open/no merge;
- source lock vigente: `app/docs/SOURCE-LOCK-C6-AUTH-TARGET-ADAPTIVE-LINEAGE-ROOT-CAUSE-CROSS-ROW-PRINCIPAL-ALIAS-STOP-RETRY-20260807.md`;
- request ejecutable: ninguno;
- workflow one-shot adaptive: eliminado;
- producción: intacta;
- Auth ejecutado: no;
- write boundary alcanzado: no.

## 2. Estado de identidad ya cerrado

```text
SKIP13=closed 13/13
multiAuthProfile=7cc28c78de9bfda01d14
keeper=4e6d26551d11db444bd0
duplicateAccessToRetire=9b2b7ca1bd72c1301d29
retirementMode=DISABLE_ONLY_NO_DELETE
```

No reabrir SKIP13 ni la adjudicación multi-Auth.

## 3. Plan Auth previo preservado, pero no ejecutable

```text
rows=340
uniqueRows=340
CREATE_AUTH=81
UPDATE_AUTH=46
NO_OP=81
HOLD=0
PRESERVE_NO_AUTH=132
emailChanges=39
passwordChanges=14
claimsChanges=38
rowsDigest=68e26a5217957333d256f2cb547faf3e1eef74e2c789bfd85454d42dfd472dc3
AuthExecuted=false
status=FROZEN_BUT_NOT_EXECUTABLE_PENDING_PRINCIPAL_UNIQUENESS_ROOT_FIX
```

No cambiar counts manualmente; deben salir de la reconstrucción source-only siguiente.

## 4. Target y peer

```text
targetProfileFp=ac93d90d9e41512acdcd
baseLoginFp=493f2b26360648693c37
targetLoginFp=bd8d7019d612b4421366
suffixLength=4
frozenPlanClass=UPDATE_AUTH
collisionPeerFp=a8dd7db89a02ff180674
peerPreservesUnsuffixedBaseLogin=true
```

## 5. Revisión antibucles y causa raíz

La cadena de STOP_RETRY fue revisada antes del único provider attempt de este bloque. Los intentos anteriores habían usado anclas incompletas distintas:

- claims actuales, aunque el row requiere `claims=true`;
- technical/profile + credential login, sin reproducir primero la propagación de llaves desde linked sources;
- lineage source-safe, pero sin bases concretas persistidas.

El nuevo circuit breaker prohibió repetir esas rutas y reconstruyó primero el flujo original completo.

Además, al leer el PREWRITE viejo se encontró que `gatherCandidates()` juntaba candidatos por claim, credentials, `baseLogin` y `targetLogin`, pero solo exigía cardinalidad por row; no existía invariant global de que un mismo Auth principal no pudiera ser seleccionado por dos profiles.

## 6. Incidencia source-only previa

```text
runId=31226987446
jobId=93023181327
failure=STATIC_GATE_FALSE_POSITIVE_MAP_SET
providerReads=0
providerWrites=0
credentialPrepared=false
providerExecutionStarted=false
```

El gate confundió `Map.set()` local con Firestore `.set()`. Se corrigió antes de provider. Este run no cuenta como provider attempt.

## 7. Único provider attempt terminal

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

## 8. Lineage resuelta definitivamente

```text
lineagePass=true
corroboratingBases=profile,visit
corroboratingBasisCount=2
directTokenCount=0
baseLoginFingerprintMatch=true
targetLoginFingerprintMatch=true
suffixLength=4
targetLoginUniqueInFrozenPlan=true
```

Ya no existe un pendiente de lineage para este target.

## 9. Causa raíz demostrada

Después del PASS de lineage, se abrió máximo una página Auth. El resolver correcto usó anclas target-specific y trató el `baseLogin` compartido del peer únicamente como señal de colisión.

```text
targetSpecificExistingAuthCandidateCount=0
credentialAnchorPresent=false
hashConfigReads=0
passwordHashInspected=false
passwordSaltInspected=false
snapshotCreated=false
```

Esto, unido al comportamiento del PREWRITE anterior, demuestra:

```text
CROSS_ROW_EXISTING_AUTH_PRINCIPAL_ALIAS_IN_OLD_PREWRITE=true
```

El antiguo `UPDATE_AUTH` del target no es seguro: el principal existente que permitió al PREWRITE avanzar puede explicarse por reutilización del Auth del peer a través del `baseLogin` compartido. El blocker password de `ac93...` era downstream de ese defecto de plan.

No repetir password snapshot ni Auth Activation bajo el plan viejo.

## 10. Lecturas terminales

```text
shopperIndexQueries=1
shopperDocumentsRead=340
targetLinkedQueries=12
targetLinkedDocumentsRead=5
queryErrors=0
authDirectoryPages=1
hashConfigReads=0
```

## 11. Fail-close

```text
requestV1Enabled=false
requestV1Consumed=true
requestV2Enabled=false
requestV2Consumed=true
allowedExecutions=0
oneShotWorkflowPresent=false
providerAttempts=1
secondProviderAttempt=false
```

## 12. Próximo bloque exacto

`C6 AUTH PLAN PRINCIPAL-UNIQUENESS ROOT FIX + PREWRITE REBUILD source-only`.

Debe:

1. añadir invariant global de existing Auth principal único por profile row;
2. reconstruir la asignación de principals de las 340 filas en simulación source-safe;
3. re-evaluar `ac93...` target-specific y, si sigue sin existing principal y su targetLogin es único, materializar su operación correcta;
4. preservar al peer como su propio existing principal;
5. recalcular counts, digest, expectedAuthUsersAfter y password update cardinality;
6. corregir `PASSWORD_HASH_AND_SALT_PRESENT` para distinguir `salt vacío legítimo probado` de `salt no disponible`, sin relajar rollback exacto;
7. ejecutar self-tests/static gates y PREWRITE simulation sin provider.

Cero provider reads/writes en ese próximo bloque.

## 13. Phase A preservada y seguridad

Frontend acumulativo, Login, `CX.data`, HR histórico, shoppers, postulaciones, certificaciones, visitas, liquidaciones/pagos, Finanzas, Portal Cliente, Portal Shopper, Reservas, multi-tenant, multi-proyecto, sincronización HR/plataforma y Academia permanecen preservados.

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
```
