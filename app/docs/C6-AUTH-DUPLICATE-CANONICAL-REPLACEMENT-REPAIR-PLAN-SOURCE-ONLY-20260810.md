# C6 AUTH DUPLICATE — CANONICAL REPLACEMENT REPAIR PLAN

**Fecha:** 2026-08-10  
**Modo:** SOURCE-ONLY / NO EXECUTE  
**Repositorio:** `paulaosoriof86/demoCXOrbia`  
**Rama:** `docs-tya-v6-v71-audit`  
**PR:** #7 draft/open/no merge  
**HEAD de entrada:** `b40e2e241bba41d1569560a40af0c8412f2e20cb`  
**Estado:** `C6_AUTH_DUPLICATE_CANONICAL_REPLACEMENT_REPAIR_PLAN_PARTIAL_READY__ABC_CANONICAL_TARGET_INPUT_REQUIRED__D_REPAIR_READY__ZERO_PROVIDER_READS__ZERO_WRITES__NO_PRODUCTION`

## 1. Decisiones rectoras congeladas

```text
1acdcb3782b7cf351056 = CREATE_CANONICAL_REPLACEMENT_REQUIRED
2c4d19f2b066835473d3 = CREATE_CANONICAL_REPLACEMENT_REQUIRED
54225792eeb65f6739c0 = CREATE_CANONICAL_REPLACEMENT_REQUIRED
ae2f920fe6d9ce1fdd82 = KEEP_VALIDATED_EXTERNAL_CANONICAL_RETIRE_BOTH_HISTORICAL
```

No se seleccionará como keeper a ninguno de los principals legacy de A–C. Todo retiro futuro será `DISABLE_ONLY_NO_DELETE`.

## 2. Contrato canónico común para A–C

Un replacement staff solo podrá considerarse `CANONICAL_VALIDATED` si cumple simultáneamente:

- Firebase Auth principal nuevo, no reutilización de uno de los dos legacy del par;
- `authNamespace=staff`;
- `role` exacto por grupo: A=`super`, B=`admin`, C=`ops`;
- `tenantId=tya` explícito, incluso para `super`, para mantener contrato canónico consistente y auditable;
- `projectIds` explícito y derivado del entitlement real del owner; no se permite inferir `cinepolis`, copiar el scope de un legacy ni dejar un scope accidental;
- sin `shopperId`;
- cualquier claim adicional de país o alcance solo si existe fuente owner-level autorizada;
- identificador Firebase interno determinístico derivado del login normalizado y namespace `staff`, conforme al contrato de `app/core/backend-browser-auth.js`;
- password/secret únicamente como material efímero de ejecución; nunca repo, artifact, log o documento;
- ausencia de colisión del identificador técnico antes del create;
- source-safe owner anchor inequívoca antes de generar el target.

### Estrategia de credencial

```text
visibleLogin -> normalize(lowercase/trim)
internalEmail = SHA256("tya\0staff\0" + normalizedLogin)[0:48] + "@auth.cxorbia.invalid"
password = EPHEMERAL_SECRET_ONLY
rawLoginExported = false
rawPasswordExported = false
```

El plan no almacena login, email, password, UID o nombre real.

## 3. A · `1acd...` / super

Legacy pair:

```text
6dee7f31c738218ce63a
b561d9c46660715e214f
```

Contrato de claims objetivo conocido:

```text
role=super
authNamespace=staff
tenantId=tya
projectIds=<OWNER_ENTITLEMENT_REQUIRED>
shopperId=absent
```

La evidencia source-safe prueba que existe un `super` canónico importado en el universo general, pero no contiene una asociación owner-level reproducible entre ese principal y este grupo. Tampoco contiene un owner anchor suficiente para construir sin inferencia el replacement de este grupo.

```text
classification=CANONICAL_TARGET_INPUT_REQUIRED
missing.ownerAnchor=true
missing.projectEntitlement=true
missing.executionCredentialInput=true
repairExecutable=false
```

No se infiere target y esta parte se detiene.

## 4. B · `2c4d...` / admin

Legacy pair:

```text
aa5cbada6c5388ee1d8b
f8405e17df357c121ccc
```

Contrato de claims objetivo conocido:

```text
role=admin
authNamespace=staff
tenantId=tya
projectIds=<OWNER_ENTITLEMENT_REQUIRED>
shopperId=absent
```

El import canónico previo creó cero principals `admin`; los principals existentes son pre-import. No existe owner anchor source-safe suficiente para generar un replacement inequívoco.

```text
classification=CANONICAL_TARGET_INPUT_REQUIRED
missing.ownerAnchor=true
missing.projectEntitlement=true
missing.executionCredentialInput=true
repairExecutable=false
```

No se infiere target y esta parte se detiene.

## 5. C · `542...` / ops

Legacy pair:

```text
ce178298b2df136541d4
19937aedc77af3404bdc
```

Contrato de claims objetivo conocido:

```text
role=ops
authNamespace=staff
tenantId=tya
projectIds=<OWNER_ENTITLEMENT_REQUIRED>
shopperId=absent
```

El import canónico previo creó cero principals `ops`; los principals existentes son pre-import. No existe owner anchor source-safe suficiente para generar un replacement inequívoco.

```text
classification=CANONICAL_TARGET_INPUT_REQUIRED
missing.ownerAnchor=true
missing.projectEntitlement=true
missing.executionCredentialInput=true
repairExecutable=false
```

No se infiere target y esta parte se detiene.

## 6. D · `ae2f...` / Cliente

Historical pair:

```text
ca9e2f644334833ab572
360af509dcdcd1880f04
```

Canónico a preservar:

```text
canonicalFp=6a74d2b7c77f7b3f026b9ad0bef86183bc4e028b67f429ee36ab772587e5953c
role=cliente
authNamespace=staff
tenantId=tya
projectIds=[cinepolis]
signIn=PASS
readback=PASS
idempotency=PASS
membership=PASS
```

Plan:

```text
VERIFY_CANONICAL_UNCHANGED
-> DISABLE historical ca9e...
-> DISABLE historical 360a...
-> READBACK canonical unchanged + both historical disabled
```

```text
classification=REPAIR_PLAN_READY
futureDisposition=KEEP_VALIDATED_EXTERNAL_CANONICAL_RETIRE_BOTH_HISTORICAL
retirementMode=DISABLE_ONLY_NO_DELETE
```

## 7. Snapshot contract obligatorio

Antes de cualquier write futuro, una sola observación provider autorizada deberá producir un snapshot source-safe con:

- población Auth total esperada;
- fingerprint de cada uno de los ocho legacy/históricos focales;
- `disabled` por principal;
- provider class sin credenciales;
- claims digest y campos estructurales `role`, `authNamespace`, tenant/project scope;
- para D, fingerprint y claims digest del canónico externo validado;
- para A–C, target owner-anchor fingerprint, target technical-identifier digest y expected-claims digest;
- prueba de no colisión del identificador técnico;
- cero raw login/email/UID/password/name/shopperId.

Snapshot gate:

```text
allExpectedPrincipalsPresent=true
legacyPairMembersEnabledAsExpected=true
DCanonicalPresentAndExact=true
ABCOwnerAnchorsResolved=true
ABCTechnicalIdentifiersCollisionFree=true
claimsTargetsExact=true
=> SNAPSHOT_PASS
```

Si A, B o C conserva `CANONICAL_TARGET_INPUT_REQUIRED`, ese grupo queda `NO_EXECUTE`.

## 8. Idempotency gate

Operation key futura por grupo:

```text
sha256(groupFp + ownerAnchorFp + expectedClaimsDigest + retirementMode)
```

Reglas:

1. Nunca crear un segundo canonical replacement para el mismo operation key.
2. Si el principal canónico ya existe por reintento y coincide exactamente con target digest/claims, `CREATE` se convierte en `NO_OP`; no cambiar password.
3. Si existe el identificador técnico pero no coincide con owner anchor/claims esperados: `STOP_RETRY_COLLISION`.
4. Un legacy ya disabled es `NO_OP`; nunca delete.
5. D nunca crea ni modifica el canónico; solo verifica que siga exacto antes de retirar históricos.

## 9. Readback matrix futura

Por A–C, PASS exige:

```text
canonicalExists=true
canonicalDisabled=false
role=expected
authNamespace=staff
tenantId=tya
projectIds=exactOwnerEntitlement
legacyMember1.disabled=true
legacyMember2.disabled=true
legacyDeletes=0
```

Por D, PASS exige:

```text
canonicalFp=6a74d2...
canonicalDisabled=false
canonicalClaimsDigest=preSnapshotDigest
canonicalMembership=unchanged/exact
ca9e....disabled=true
360a....disabled=true
legacyDeletes=0
```

## 10. Rollback dry-run contract

El rollback real no se ejecuta en este plan. Debe quedar calculable antes del primer write.

Inverse plan por A–C:

```text
if legacy was enabled pre-snapshot and was disabled by this run -> re-enable that legacy
if canonical was created by this run -> disable canonical, DO NOT DELETE
claims/password rollback -> no mutation unless separately snapshotted and authorized
```

Inverse plan D:

```text
if historical was enabled pre-snapshot and disabled by this run -> re-enable historical
canonical -> no mutation
```

Rollback dry-run PASS exige que cada mutación tenga inverse action unívoca y que ningún inverse action requiera delete.

## 11. Límites exactos de writes para futura ejecución completa

Solo si A–C resuelven antes sus inputs y todos los gates PASS:

| Grupo | createUser | setCustomUserClaims | disable legacy/historical | Total Auth writes |
|---|---:|---:|---:|---:|
| A `1acd...` | 1 | 1 | 2 | 4 |
| B `2c4d...` | 1 | 1 | 2 | 4 |
| C `542...` | 1 | 1 | 2 | 4 |
| D `ae2f...` | 0 | 0 | 2 | 2 |
| **TOTAL HARD CAP** | **3** | **3** | **8** | **14** |

Otros límites futuros:

```text
Auth deletes=0
Firestore writes=0
IAM writes=0
HR writes=0
Rules writes=0
Storage writes=0
Make writes=0
Gemini calls=0
payments writes=0
deploys=0
```

La membresía Cliente D ya validada se preserva sin write. Para staff A–C, el contrato de acceso actual se resuelve por custom claims; no se introduce un membership Firestore nuevo en este repair.

## 12. Secuencia no superpuesta futura

```text
PRE-SNAPSHOT
-> GLOBAL GATE
-> A: CREATE_CANONICAL -> CLAIMS -> CANONICAL_READBACK -> DISABLE_BOTH_LEGACY -> READBACK
-> B: same
-> C: same
-> D: VERIFY_EXISTING_CANONICAL -> DISABLE_BOTH_HISTORICAL -> READBACK
-> CUMULATIVE READBACK
-> ROLLBACK_DRY_RUN
-> STOP
```

Nunca se deshabilita un par A–C antes de demostrar su replacement canónico.

## 13. Resultado terminal de este bloque

```text
A=CANONICAL_TARGET_INPUT_REQUIRED
B=CANONICAL_TARGET_INPUT_REQUIRED
C=CANONICAL_TARGET_INPUT_REQUIRED
D=REPAIR_PLAN_READY
providerReads=0
providerWrites=0
AuthWrites=0
FirestoreReads/Writes=0/0
HRReads/Writes=0/0
repairExecuted=false
production=false
```

El plan queda completo como contrato, pero **no es ejecutable globalmente** hasta resolver source-safe los tres inputs canónicos A–C.

## 14. Clasificación

- **Reusable CXOrbia:** create-before-retire, deterministic namespaced identity, bounded writes, reversible disable-only retirement.
- **Exclusivo cliente:** cuatro grupos Auth históricos TyA y sus roles/scope.
- **Claude/prototipo:** sin cambios frontend; no exponer fingerprints ni estados técnicos en UI.
- **Academia:** documentar como principio de seguridad de identidad, sin convertirlo en flujo visible al usuario final.
- **Sin impacto Claude:** snapshot/idempotency/readback/rollback/write budgets.
