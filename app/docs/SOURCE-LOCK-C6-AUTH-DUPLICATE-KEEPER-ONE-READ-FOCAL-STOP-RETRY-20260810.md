# SOURCE LOCK — C6 AUTH DUPLICATE KEEPER · ROOTFIX PASS → ONE READ FOCAL → STOP_RETRY

**Fecha:** 2026-08-10  
**Repositorio:** `paulaosoriof86/demoCXOrbia`  
**Rama viva:** `docs-tya-v6-v71-audit`  
**PR:** #7 draft/open/no merge  
**Estado:** `C6_AUTH_DUPLICATE_KEEPER_ONE_READ_STOP_4_ANCHOR_AMBIGUITIES__FD891_POLICY_CLOSED__AUTH_DEV_228_PRESERVED__NO_SECOND_READ__ZERO_WRITES__NO_PRODUCTION`

## 1. Baseline protegido

```text
AuthUsersAfter=228
Activation=PASS
Readback=PASS
RollbackDryRun=PASS
PlanV4Digest=c0c31fadb88928f5fc0b8a19248188c8610e13362608f1bae3e267034f893ba4
PREWRITE repeated=false
Activation repeated=false
reconstructUniverse340=false
```

No se reabrieron las 340 identidades, SKIP13, multi-Auth cerrado, lineage `ac93...`, HashConfig, PREWRITE ni Activation.

## 2. Universo focal inmutable

Se conservaron exactamente cinco grupos y diez candidate fingerprints:

```text
1acdcb3782b7cf351056 -> 6dee7f31c738218ce63a / b561d9c46660715e214f
2c4d19f2b066835473d3 -> aa5cbada6c5388ee1d8b / f8405e17df357c121ccc
54225792eeb65f6739c0 -> ce178298b2df136541d4 / 19937aedc77af3404bdc
ae2f920fe6d9ce1fdd82 -> ca9e2f644334833ab572 / 360af509dcdcd1880f04
fd891812eca020d27ee3 -> e1773a24c98d6bbe26c3 / 50d360f17c1fbdd69770
```

No se amplió población ni se reconstruyó el plan v4.

## 3. Rootfix source-only — PASS

Se restauró el adjudicador focal y se corrigió exclusivamente el falso positivo temporal del gate.

```text
toolRestoreCommit=ed7ba0d61dc2c52594bfdbf6361ed5c3e141d300
sourceGateCommit=72478e582dd917f287f16d6447b3b5f14b8ad26f
sourceGateRunId=31441607796
sourceGateJobId=93627306098
decision=PASS_C6_AUTH_DUPLICATE_KEEPER_TARGET_SCOPE_SOURCE_ROOTFIX_ZERO_WRITES_ONE_READ_NO_PII
```

La comprobación nueva prohíbe únicamente acceso real a:

```text
user.metadata.creationTime
user.metadata.lastSignInTime
```

pero permite que la herramienta declare de forma explícita:

```text
creationTimeUsed=false
lastSignInTimeUsed=false
```

Pasaron `node --check`, self-test, frozen-universe gate, lineage gate, zero-writes y zero-PII. El source gate no realizó provider reads.

## 4. Única lectura provider autorizada

Solo tras el PASS source-only se creó un workflow one-shot y un request nuevo/no superpuesto:

```text
workflowCommit=dd84d2f9bc0eb9fe2689237ec7e24d9f508334a0
requestId=c6-auth-duplicate-keeper-targetscope-one-read-20260810-01
requestCommit=f186b5a440b8c3db5fd2c747daeb7a37c6e0901b
runId=31441779926
jobId=93627815703
artifactId=9083100724
artifactDigest=sha256:8c3a2026027e678deb1aa0dfc828c45cdf1a251b9cee1617eaa9feb10c82eba2
providerReads=1
secondProviderRead=false
```

La lectura confirmó población Auth=228 y los diez candidates exactos. No hubo segunda página ni segunda lectura.

## 5. Resultado terminal

```text
decision=STOP_RETRY_C6_AUTH_DUPLICATE_KEEPER_TARGET_SCOPE_ADJUDICATION
resolvedAccessGroups=0
ambiguousAccessGroups=4
blockedPolicyClosed=1
errorCode=KEEPER_ANCHOR_INSUFFICIENT_4
errorFingerprint=e892496d8de6ed9a2705b24c
```

La regla de la autorización exige STOP_RETRY ante cualquier empate o ancla insuficiente. No se ejecutó una segunda lectura.

## 6. Grupos A–C — Admin/Operaciones, keeper no demostrable

### `1acdcb3782b7cf351056`

Ambos principals son equivalentes bajo todos los discriminadores autorizados relevantes:

```text
enabled=true / true
providerClass=PASSWORD / PASSWORD
addressClass=EXTERNAL_PROVIDER_EMAIL / EXTERNAL_PROVIDER_EMAIL
role=super / super
roleFamily=ADMIN_OPERACIONES / ADMIN_OPERACIONES
authNamespace=NONE / NONE
tenantClass=SUPER_BYPASS / SUPER_BYPASS
projectClass=OTHER_ONLY / OTHER_ONLY
effectiveTyaAccess=true / true
technicalMarkers=0 / 0
canonicalImportedStaffClass=false / false
```

Clasificación: `AMBIGUOUS_STAFF_KEEPER_NO_UNIQUE_ALLOWED_ANCHOR`.

### `2c4d19f2b066835473d3`

Ambos principals son equivalentes:

```text
enabled=true / true
providerClass=PASSWORD / PASSWORD
addressClass=EXTERNAL_PROVIDER_EMAIL / EXTERNAL_PROVIDER_EMAIL
role=admin / admin
authNamespace=NONE / NONE
tenantClass=TYA / TYA
projectClass=OTHER_ONLY / OTHER_ONLY
effectiveTyaAccess=true / true
technicalMarkers=0 / 0
canonicalImportedStaffClass=false / false
```

Clasificación: `AMBIGUOUS_STAFF_KEEPER_NO_UNIQUE_ALLOWED_ANCHOR`.

### `54225792eeb65f6739c0`

Ambos principals son equivalentes:

```text
enabled=true / true
providerClass=PASSWORD / PASSWORD
addressClass=EXTERNAL_PROVIDER_EMAIL / EXTERNAL_PROVIDER_EMAIL
role=ops / ops
authNamespace=NONE / NONE
tenantClass=TYA / TYA
projectClass=OTHER_ONLY / OTHER_ONLY
effectiveTyaAccess=true / true
technicalMarkers=0 / 0
canonicalImportedStaffClass=false / false
```

Clasificación: `AMBIGUOUS_STAFF_KEEPER_NO_UNIQUE_ALLOWED_ANCHOR`.

No se eligió keeper por antigüedad, orden, nombre, email, UID o heurística visual.

## 7. Grupo D — Cliente, lineage no único

```text
groupFp=ae2f920fe6d9ce1fdd82
enabled=2
providerClass=PASSWORD ambos
addressClass=EXTERNAL_PROVIDER_EMAIL ambos
role=cliente ambos
authNamespace=NONE ambos
tenantClass=TYA ambos
projectClass=TARGET_ONLY ambos
targetProjectScoped=true ambos
effectiveTyaAccess=true ambos
technicalMarkers=0 ambos
canonicalClientLineageMatch=false ambos
historicalClientLineageMatch=true ambos
```

La fuente de readback canónico no identifica a ninguno de estos dos candidates como el principal canónico actual, mientras que los dos coinciden con los dos hashes técnicos históricos normalizados de Cliente. Por tanto la lineage disponible es deliberadamente no única.

Clasificación: `AMBIGUOUS_CLIENT_KEEPER_LINEAGE`.

No se eligió keeper.

## 8. Grupo E `fd891...` — política técnica cerrada

Este grupo sí quedó cerrado dentro del alcance autorizado, sin seleccionar keeper ni modificar principals:

```text
e1773a24c98d6bbe26c3 -> OUTSIDE_CONTRACT + OTHER_TENANT + effectiveTyaAccess=false
50d360f17c1fbdd69770 -> ADMIN_OPERACIONES + OTHER_TENANT + effectiveTyaAccess=false
```

Clasificación:

```text
POLICY_CLOSED_NO_TYA_EFFECTIVE_ACCESS
```

Política:

```text
NO_TYA_REPAIR_IN_CURRENT_SCOPE__PRESERVE_BLOCKED_PRINCIPALS_UNCHANGED_PENDING_OWNER_OR_TENANT_POLICY
```

No requiere repair TyA en el alcance actual.

## 9. Seguridad y fail-close

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
rawUidExported=false
rawEmailExported=false
rawShopperIdExported=false
rawNameExported=false
rawClaimsExported=false
rawCredentialExported=false
creationTimeUsed=false
lastSignInTimeUsed=false
resultOrderUsed=false
```

Fail-close consumado:

```text
providerWorkflowRemovalCommit=3c22b00e54191b0a032f4808b20a1fec81f592f1
requestConsumeCommit=0320dfee318fd52aa4cc3b5eb78bb5b71336dc3c
request.enabled=false
request.consumed=true
request.allowedExecutions=0
sourceGateWorkflowRemovalCommit=220067139b3b1540f53a0c38429d56093b832d85
```

No existe segundo provider read autorizado ni workflow one-shot activo de este bloque.

## 10. Causa raíz del bloqueo restante

El problema ya no es el source gate ni falta de lectura provider. La única lectura autorizada demostró que los discriminadores técnicos permitidos **colapsan** para los tres pares staff y son **no únicos** para el par Cliente.

Repetir la misma lectura no agrega información y violaría el contrato one-read. Tampoco corresponde reparar cuatro pares sin keeper reproducible.

## 11. Siguiente bloque exacto

Solo bajo nueva autorización:

`C6 AUTH DUPLICATE OWNERSHIP ANCHOR SOURCE-SAFE EVIDENCE RECONCILIATION — NO PROVIDER`

Debe trabajar únicamente sobre evidencia/source-safe ya existente para buscar una ancla de propiedad o lineage no temporal, no PII y reproducible para los cuatro grupos A–D. Cero provider reads. Si no existe ancla única, debe declarar `HUMAN_OWNERSHIP_DECISION_REQUIRED` para esos grupos; no inferir keeper.

No repair, no Auth/IAM/Firestore/HR/Rules/Storage writes, PREWRITE, Activation, smoke, Make, Gemini, pagos, deploy, merge o producción.

## 12. Clasificación

- **Reusable CXOrbia:** un keeper no puede adjudicarse cuando todos los discriminadores autorizados son equivalentes o no únicos; fail-close antes de repair.
- **Exclusivo cliente:** los cinco grupos TyA; cuatro keeper pendientes y política `fd891...` cerrada.
- **Claude/prototipo:** sin cambio frontend; no compensar duplicados desde UI ni relajar RBAC.
- **Academia:** registrar diferencia entre principal habilitado, acceso efectivo, lineage source-safe y prueba de keeper.
- **Sin impacto Claude:** bloque de Auth read-only, gate y documentación; cero deploy/producción.

## 13. Phase A preservada

Frontend acumulativo, Login, `CX.data`, HR histórico, shoppers, postulaciones, certificaciones, visitas, liquidaciones/pagos, Finanzas, Portal Cliente, Portal Shopper, Reservas, multi-tenant, multi-proyecto, sincronización HR/plataforma, Academia y Auth DEV=228 permanecen preservados. Producción continúa intacta.
