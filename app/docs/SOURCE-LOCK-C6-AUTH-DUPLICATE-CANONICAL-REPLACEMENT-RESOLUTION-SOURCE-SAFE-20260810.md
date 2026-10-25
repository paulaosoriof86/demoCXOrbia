# SOURCE LOCK — C6 AUTH DUPLICATE CANONICAL REPLACEMENT RESOLUTION

**Fecha:** 2026-08-10  
**Repositorio:** `paulaosoriof86/demoCXOrbia`  
**Rama:** `docs-tya-v6-v71-audit`  
**PR:** #7 draft/open/no merge  
**HEAD al inicio:** `3d77017f4457ccec9725addeb4d48d82ee4202e9`  
**Estado:** `C6_AUTH_DUPLICATE_CANONICAL_REPLACEMENT_RESOLVED__ABC_CREATE_CANONICAL_REPLACEMENT_REQUIRED__D_KEEP_VALIDATED_EXTERNAL_CANONICAL_RETIRE_BOTH_HISTORICAL__ZERO_PROVIDER_READS__ZERO_WRITES__NO_PRODUCTION`

## 1. Alcance ejecutado

Se resolvió source-only la política de canonicalización para los cuatro grupos congelados, sin seleccionar como keeper a ningún principal legacy por pertenecer al par y sin ejecutar repair.

```text
1acdcb3782b7cf351056 -> 6dee7f31c738218ce63a / b561d9c46660715e214f
2c4d19f2b066835473d3 -> aa5cbada6c5388ee1d8b / f8405e17df357c121ccc
54225792eeb65f6739c0 -> ce178298b2df136541d4 / 19937aedc77af3404bdc
ae2f920fe6d9ce1fdd82 -> ca9e2f644334833ab572 / 360af509dcdcd1880f04
```

## 2. Evidencia source-safe determinante

El inventario de credenciales versionado contiene cuatro registros staff source-side: `superadmin=1`, `coordinador=2`, `demo=1`, todos preparados bajo política namespaced.

El import canónico ejecutado importó exactamente 91 usuarios nuevos: 88 shoppers y tres staff, distribuidos como `super=1` y `coordinador=2`; namespace resultante: `shopper=88`, `staff=3`. No importó ningún `admin` ni `ops`. Su contrato usa identificador Firebase interno determinístico namespaced y política `FAIL_CLOSED_NO_OVERWRITE`.

El read-only de continuidad posterior confirma que Auth pasó de 17 a 108 usuarios y que los tres nuevos staff son precisamente los únicos `namespace=staff` de esa etapa. Los roles agregados por el import fueron un `super` y dos `coordinador`; `admin=3` y `ops=2` continuaron dentro de la población pre-import/namespace-none.

## 3. Resolución A · `1acd...` / super

Existe un principal canónico importado con rol técnico `super`, pero la evidencia source-safe existente no contiene una asociación owner-level reproducible entre ese principal y el owner representado por el par `1acd...`.

La unicidad del rol importado no es prueba de identidad del owner y no puede sustituir lineage/mapping. Por tanto no se reutiliza por inferencia.

```text
legacyPairClass=LEGACY_NONCANONICAL_PENDING_CANONICAL_REPLACEMENT
reusableCanonicalPrincipalResolved=false
disposition=CREATE_CANONICAL_REPLACEMENT_REQUIRED
```

## 4. Resolución B · `2c4d...` / admin

El import canónico no creó principal `admin`. Los tres principals admin observados ya existían en el universo anterior y no existe asociación source-safe owner-level que permita promover uno de ellos como canónico para este grupo.

```text
legacyPairClass=LEGACY_NONCANONICAL_PENDING_CANONICAL_REPLACEMENT
reusableCanonicalPrincipalResolved=false
disposition=CREATE_CANONICAL_REPLACEMENT_REQUIRED
```

## 5. Resolución C · `542...` / ops

El import canónico no creó principal `ops`. Los dos principals ops observados ya existían en el universo anterior y no pueden elevarse a identidad canónica por rol o pertenencia al par.

```text
legacyPairClass=LEGACY_NONCANONICAL_PENDING_CANONICAL_REPLACEMENT
reusableCanonicalPrincipalResolved=false
disposition=CREATE_CANONICAL_REPLACEMENT_REQUIRED
```

## 6. Resolución D · `ae2f...` / Cliente

El principal Cliente canónico externo ya está demostrado y validado fuera del par histórico:

```text
canonicalFp=6a74d2b7c77f7b3f026b9ad0bef86183bc4e028b67f429ee36ab772587e5953c
namespace=staff
scope=tya/cinepolis
signIn=PASS
readback=PASS
idempotency=PASS
membership=PASS
```

Por tanto la recomendación técnica queda fijada:

```text
disposition=KEEP_VALIDATED_EXTERNAL_CANONICAL_RETIRE_BOTH_HISTORICAL
futureRetirementMode=DISABLE_ONLY_NO_DELETE
```

## 7. Contrato para reparación futura

No se ejecutó repair en este bloque. Para A–C, el siguiente repair futuro deberá primero materializar o resolver inequívocamente un principal canónico limpio por owner, validar login, rol, tenant y project scope, y solo después retirar ambos principals legacy. Para D se preservará el Cliente canónico ya validado y se retirarán ambos históricos.

Todo retiro futuro queda bloqueado a:

```text
DISABLE_ONLY_NO_DELETE
SNAPSHOT required
IDEMPOTENCY required
READBACK required
ROLLBACK_DRY_RUN required
```

## 8. Seguridad

```text
providerReads=0
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
rawPIIExported=false
```

No se creó request provider ni workflow provider.

## 9. Siguiente bloque exacto

Solo con nueva autorización:

`C6 AUTH DUPLICATE CANONICAL REPLACEMENT REPAIR PLAN — SOURCE-ONLY / NO EXECUTE`.

Debe preparar un plan exacto no superpuesto para A–C y D: canonical target contract, snapshot shape, idempotency/readback/rollback gates y secuencia `canonical valid -> disable both legacy`. No provider read ni write sin autorización separada.

## 10. Clasificación

- **Reusable CXOrbia:** canonicalización por lineage; nunca promover legacy por rol o coincidencia parcial.
- **Exclusivo cliente:** cuatro grupos históricos TyA.
- **Claude/prototipo:** sin cambio frontend ni relajación RBAC.
- **Academia:** patrón de reemplazo canónico y retiro reversible.
- **Sin impacto Claude:** evidencia, source lock y contratos internos.
