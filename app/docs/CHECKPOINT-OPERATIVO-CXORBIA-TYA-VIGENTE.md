# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-10  
**Estado:** `C6_AUTH_DUPLICATE_KEEPER_ONE_READ_STOP_4_ANCHOR_AMBIGUITIES__FD891_POLICY_CLOSED__AUTH_DEV_228_PRESERVED__NO_SECOND_READ__ZERO_WRITES__NO_PRODUCTION`

## 1. Control

- repo: `paulaosoriof86/demoCXOrbia`;
- rama viva: `docs-tya-v6-v71-audit`;
- PR #7: draft/open/no merge;
- source lock vigente: `app/docs/SOURCE-LOCK-C6-AUTH-DUPLICATE-KEEPER-ONE-READ-FOCAL-STOP-RETRY-20260810.md`;
- evidencia vigente: `app/docs/evidence/C6-AUTH-DUPLICATE-KEEPER-ONE-READ-FOCAL-STOP-RETRY-20260810.json`;
- request terminal: `backend/config/c6-auth-duplicate-keeper-targetscope-one-read-request-v2.json` consumido/deshabilitado;
- freeze rector: `backend/config/c6-shopper-auth-final-freeze-v4.json`;
- digest rector: `c0c31fadb88928f5fc0b8a19248188c8610e13362608f1bae3e267034f893ba4`;
- producción: intacta.

## 2. Baseline Auth protegido — no reabrir

```text
rows=340
CREATE_AUTH=118
UPDATE_AUTH=9
NO_OP=81
HOLD=0
PRESERVE_NO_AUTH=132
AuthUsersAfter=228
Activation=PASS
Readback=PASS
RollbackDryRun=PASS
PREWRITE repeated=false
Activation repeated=false
```

```text
SKIP13=closed 13/13
multiAuthProfile=7cc28c78de9bfda01d14
keeper=4e6d26551d11db444bd0
duplicateAccessRetired=9b2b7ca1bd72c1301d29
targetLineage(ac93)=closed
HashConfig=closed PASS
SmokeCredentialLifecycle=closed PASS
```

No reconstruir las 340 identidades.

## 3. Rootfix source-only cerrado PASS

El falso positivo anterior fue corregido sin provider:

```text
toolRestoreCommit=ed7ba0d61dc2c52594bfdbf6361ed5c3e141d300
sourceGateCommit=72478e582dd917f287f16d6447b3b5f14b8ad26f
sourceGateRunId=31441607796
sourceGateJobId=93627306098
sourceGate=PASS_C6_AUTH_DUPLICATE_KEEPER_TARGET_SCOPE_SOURCE_ROOTFIX_ZERO_WRITES_ONE_READ_NO_PII
```

La aserción ahora bloquea uso real de `user.metadata.creationTime` o `user.metadata.lastSignInTime`, pero admite los flags negativos de seguridad. `node --check`, self-test, frozen-universe, lineage, zero-writes y zero-PII pasaron.

## 4. Única lectura focal ejecutada

```text
requestId=c6-auth-duplicate-keeper-targetscope-one-read-20260810-01
requestCommit=f186b5a440b8c3db5fd2c747daeb7a37c6e0901b
runId=31441779926
jobId=93627815703
artifactId=9083100724
artifactDigest=sha256:8c3a2026027e678deb1aa0dfc828c45cdf1a251b9cee1617eaa9feb10c82eba2
providerReads=1
secondProviderRead=false
AuthPopulation=228
```

Universo exacto preservado:

```text
1acdcb3782b7cf351056 -> 6dee7f31c738218ce63a / b561d9c46660715e214f
2c4d19f2b066835473d3 -> aa5cbada6c5388ee1d8b / f8405e17df357c121ccc
54225792eeb65f6739c0 -> ce178298b2df136541d4 / 19937aedc77af3404bdc
ae2f920fe6d9ce1fdd82 -> ca9e2f644334833ab572 / 360af509dcdcd1880f04
fd891812eca020d27ee3 -> e1773a24c98d6bbe26c3 / 50d360f17c1fbdd69770
```

## 5. Resultado terminal — STOP_RETRY

```text
decision=STOP_RETRY_C6_AUTH_DUPLICATE_KEEPER_TARGET_SCOPE_ADJUDICATION
resolvedAccessGroups=0
ambiguousAccessGroups=4
blockedPolicyClosed=1
errorCode=KEEPER_ANCHOR_INSUFFICIENT_4
errorFingerprint=e892496d8de6ed9a2705b24c
```

### Tres grupos Admin/Operaciones

`1acd...`, `2c4d...` y `542...` contienen pares que resultaron equivalentes bajo los discriminadores autorizados: habilitación, provider PASSWORD, clase de dirección externa, mismo rol/familia, mismo namespace, tenant/project class, acceso efectivo, cero marcadores técnicos y ninguna coincidencia con `canonicalImportedStaffClass`.

Clasificación en los tres: `AMBIGUOUS_STAFF_KEEPER_NO_UNIQUE_ALLOWED_ANCHOR`.

### Grupo Cliente `ae2f...`

Ambos principals están habilitados, son PASSWORD/external, rol Cliente, tenant TyA, target project y acceso efectivo. Ninguno coincide con la lineage canónica de readback y ambos coinciden con los dos hashes históricos normalizados.

Clasificación: `AMBIGUOUS_CLIENT_KEEPER_LINEAGE`.

### Grupo `fd891...`

Política técnica cerrada sin seleccionar keeper:

```text
e1773a24c98d6bbe26c3 = OUTSIDE_CONTRACT + OTHER_TENANT + effectiveTyaAccess=false
50d360f17c1fbdd69770 = ADMIN_OPERACIONES + OTHER_TENANT + effectiveTyaAccess=false
classification=POLICY_CLOSED_NO_TYA_EFFECTIVE_ACCESS
policy=NO_TYA_REPAIR_IN_CURRENT_SCOPE__PRESERVE_BLOCKED_PRINCIPALS_UNCHANGED_PENDING_OWNER_OR_TENANT_POLICY
```

No requiere repair TyA dentro del alcance actual.

## 6. Fail-close y seguridad

```text
providerReads=1
secondProviderRead=false
providerWrites=0
AuthWrites=0
IAMWrites=0
FirestoreReads/Writes=0/0
HRReads/Writes=0/0
RulesWrites=0
StorageWrites=0
PREWRITE=false
Activation=false
newSmoke=false
Make=0
Gemini=0
payments=0
deploys=0
merge=false
production=false
PII/credentials exported=false
creationTimeUsed=false
lastSignInTimeUsed=false
resultOrderUsed=false
```

```text
providerWorkflowRemoved=3c22b00e54191b0a032f4808b20a1fec81f592f1
requestConsumed=0320dfee318fd52aa4cc3b5eb78bb5b71336dc3c
request.enabled=false
request.consumed=true
request.allowedExecutions=0
sourceGateWorkflowRemoved=220067139b3b1540f53a0c38429d56093b832d85
```

La autorización one-read está consumida. No ejecutar segunda lectura ni repair.

## 7. Causa raíz pendiente

Ya no existe un fallo de harness ni falta una observación provider. Los discriminadores técnicos permitidos son iguales para los tres pares staff y no únicos para Cliente. Repetir la lectura no agrega evidencia.

## 8. Próximo bloque exacto

Solo bajo nueva autorización:

`C6 AUTH DUPLICATE OWNERSHIP ANCHOR SOURCE-SAFE EVIDENCE RECONCILIATION — NO PROVIDER`

Usar exclusivamente evidencia/source-safe existente para buscar una ancla de propiedad/lineage no temporal, no PII y reproducible para los cuatro grupos A–D. Cero provider reads. Si no existe una ancla única, declarar `HUMAN_OWNERSHIP_DECISION_REQUIRED`; no inferir keeper.

Cero repair, PREWRITE, Activation, nuevo smoke, Auth/IAM/Firestore/HR/Rules/Storage writes, Make, Gemini, pagos, deploy, merge o producción.

## 9. Phase A preservada

Frontend acumulativo, Login, `CX.data`, HR histórico, shoppers, postulaciones, certificaciones, visitas, liquidaciones/pagos, Finanzas, Portal Cliente, Portal Shopper, Reservas, multi-tenant, multi-proyecto, sincronización HR/plataforma, Academia y Auth DEV=228 permanecen preservados.

## 10. Cierre obligatorio

- **Qué se hizo:** rootfix source-only PASS y una lectura focal one-shot.
- **Avance Phase A:** `fd891...` cerrado para TyA; cuatro casos reducidos a problema de ownership anchor.
- **Qué se preservó:** Auth 228, digest v4, frontend y operación Phase A.
- **Claude/prototipo:** sin cambio frontend ni relajación RBAC.
- **Academia:** patrón fail-close/keeper proof documentado.
- **Pendiente real:** ancla de ownership para cuatro grupos.
- **Estado seguro:** request consumido, workflows temporales retirados, cero writes/producción.
- **Bloqueo comprobado:** `KEEPER_ANCHOR_INSUFFICIENT_4`.
