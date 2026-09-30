# C6 AUTH — CANONICAL STAFF MINIMUM OWNER INPUT CONTRACT

**Fecha:** 2026-08-10  
**Modo:** SOURCE-SAFE / NO PROVIDER / NO REPAIR  
**HEAD de entrada:** `0f0ced120b3554bc97bbcffdca667176438db809`  
**Estado:** `C6_AUTH_CANONICAL_STAFF_MINIMUM_OWNER_INPUT_CONTRACT_READY__BUSINESS_OWNER_AND_SCOPE_INPUT_REQUIRED__A_REUSE_CONDITIONAL__BC_NEW_EPHEMERAL_FIXED__D_PRESERVED__DOCS_ONLY__NO_PRODUCTION`

## 1. Objetivo

Reducir los faltantes A–C a decisiones empresariales comprensibles, sin pedir a Paula fingerprints legacy, UIDs, emails, selección de keeper ni interpretación técnica.

Los únicos datos humanos pendientes son:

1. quién debe ser titular del rol;
2. si ese titular opera TyA completo o solo proyectos específicos.

La estrategia de credencial no requiere una decisión adicional ahora: A intenta reutilizar el `super` canónico existente solo si una ancla owner-level independiente prueba asociación exacta; B y C usarán credencial nueva efímera durante una ejecución futura separadamente autorizada.

## 2. Estado congelado de entrada

```text
A / 1acdcb3782b7cf351056 / super
= OWNER_ANCHOR_REQUIRED
+ PROJECT_ENTITLEMENT_REQUIRED

B / 2c4d19f2b066835473d3 / admin
= OWNER_ANCHOR_REQUIRED
+ PROJECT_ENTITLEMENT_REQUIRED
+ CREDENTIAL_INPUT_REQUIRED

C / 54225792eeb65f6739c0 / ops
= OWNER_ANCHOR_REQUIRED
+ PROJECT_ENTITLEMENT_REQUIRED
+ CREDENTIAL_INPUT_REQUIRED
```

D `ae2f920fe6d9ce1fdd82` no se reabre y permanece `REPAIR_PLAN_READY`.

## 3. Preguntas humanas mínimas

### A — Superadministración

1. ¿Quién debe ser el titular de **Superadministración de TyA**?
2. ¿Debe tener acceso a **TyA completo** o únicamente a **proyectos específicos**? Si son específicos, indicar cuáles.

### B — Administración

3. ¿Quién debe ser el titular de **Administración de TyA**?
4. ¿Debe tener acceso a **TyA completo** o únicamente a **proyectos específicos**? Si son específicos, indicar cuáles.

### C — Operaciones

5. ¿Quién debe ser el titular de **Operaciones de TyA**?
6. ¿Debe tener acceso a **TyA completo** o únicamente a **proyectos específicos**? Si son específicos, indicar cuáles.

No se pide email, UID, fingerprint, contraseña, documento, teléfono ni selección de una cuenta histórica. Si existieran homónimos, basta una referencia humana empresarial corta que los distinga, por ejemplo nombre + área/función.

## 4. Conversión source-safe de identidad empresarial

La respuesta humana se usa de forma transitoria y no se persiste cruda.

Normalización:

```text
NFKC
-> trim
-> colapsar espacios internos
-> lowercase
```

Ancla de identidad:

```text
ownerIdentityAnchor = sha256(
  "cxorbia-owner-v1\0tya\0" + normalizedHumanOwnerReference
)
```

Binding owner↔rol:

```text
ownerRoleBindingDigest = sha256(
  "cxorbia-owner-role-v1\0tya\0" + role + "\0" + ownerIdentityAnchor
)
```

Solo se persisten fingerprints/digests y metadata de la atestación. La referencia humana cruda se descarta y no entra a repo/artifact/log.

## 5. Conversión source-safe del alcance

Las únicas respuestas de negocio admitidas son:

```text
TYA_COMPLETE
SPECIFIC_PROJECTS
```

### TYA_COMPLETE

Significa autorización empresarial sobre todos los proyectos TyA. No se genera un wildcard silencioso en claims. Antes de cerrar el target se debe expandir a la lista exacta de `projectIds` canónicos TyA disponible en fuente source-safe, ordenar y deduplicar.

Si la lista exacta no puede resolverse source-safe, el target conserva `PROJECT_ENTITLEMENT_REQUIRED`.

Un proyecto futuro nuevo no se hereda silenciosamente: exige expansión explícita del entitlement.

### SPECIFIC_PROJECTS

Cada nombre humano de proyecto debe resolver a un único `projectId` canónico source-safe. Cualquier nombre ausente o ambiguo detiene solo ese target.

Está prohibido:

- copiar scope legacy;
- asumir `cinepolis` por defecto;
- inferir alcance por rol;
- usar un wildcard técnico no auditado.

## 6. Target claims contract

Claims fijos para A–C:

```text
authNamespace=staff
tenantId=tya
shopperId=absent
```

Rol exacto:

```text
A role=super
B role=admin
C role=ops
```

`projectIds` debe ser el array exacto, ordenado y sin duplicados del entitlement aprobado.

No se agregan claims de país u otros alcances en este bloque. Solo se incorporarían con fuente owner-level separada y autorización correspondiente.

## 7. Expected-claims digest

No se genera ningún digest mientras falte owner o entitlement exacto.

Una vez resueltos, la serialización canónica será un JSON compacto con claves en este orden exacto:

```text
authNamespace
projectIds
role
tenantId
```

Luego:

```text
expectedClaimsDigest = sha256(UTF8(canonicalCompactJson))
```

Esto evita que el digest dependa del orden accidental de claves o proyectos.

## 8. Estrategia de credencial

### A / super

Primera opción:

```text
REUSE_EXISTING_CANONICAL_SUPER
```

solo si una asociación owner-level independiente demuestra que ese principal canónico corresponde exactamente al owner designado.

No es válida la prueba “es el único `super`”.

Si no se puede probar la asociación:

```text
NEW_EPHEMERAL_CREDENTIAL_REQUIRED
```

### B / admin

```text
NEW_EPHEMERAL_CREDENTIAL
```

El import canónico creó cero `admin`.

### C / ops

```text
NEW_EPHEMERAL_CREDENTIAL
```

El import canónico creó cero `ops`.

La futura ejecución recibirá login visible + contraseña nueva solo en memoria. El secreto nunca se escribe en repo, artifact o log.

El identificador Firebase interno conserva el contrato vigente:

```text
sha256("tya\0staff\0" + normalizedVisibleLogin)[0:48]
+ "@auth.cxorbia.invalid"
```

## 9. Máquina de cierre por target

```text
WAIT_BUSINESS_OWNER_AND_SCOPE_INPUT
-> CONVERT_OWNER_TO_SOURCE_SAFE_ANCHOR
-> RESOLVE_EXACT_PROJECT_ENTITLEMENT_SOURCE_SAFE
-> BUILD_CANONICAL_TARGET_CLAIMS
-> GENERATE_EXPECTED_CLAIMS_DIGEST
-> A_ONLY: EVALUATE_EXISTING_CANONICAL_SUPER_REUSE_BY_OWNER_BINDING
-> LOCK_TARGET_CONTRACT
-> STOP_NO_REPAIR
```

Salida source-safe esperada por target:

- `ownerIdentityAnchor`;
- `ownerRoleBindingDigest`;
- `entitlementMode`;
- `exactProjectIds`;
- `targetClaims`;
- `expectedClaimsDigest`;
- `credentialStrategy`;
- `targetContractDigest`.

## 10. Qué no se decide con estas respuestas

Estas respuestas no autorizan:

- provider read;
- PREWRITE;
- create/update/disable Auth;
- Firestore/IAM/HR/Rules/Storage writes;
- smoke;
- repair;
- deploy;
- merge;
- producción.

Tampoco seleccionan ningún legacy como keeper.

## 11. Seguridad del bloque

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
smoke=false
repair=false
Make=0
Gemini=0
payments=0
deploys=0
merge=false
production=false
rawPIIStored=false
credentialsStored=false
```

Los únicos cambios son documentación/contratos source-safe en la rama viva.

## 12. Clasificación

- **Reusable CXOrbia:** patrón de business attestation → owner anchor → entitlement exacto → claims digest.
- **Exclusivo cliente:** roles/owners staff TyA A–C.
- **Claude/prototipo:** sin cambio frontend; no exponer preguntas técnicas ni fingerprints.
- **Academia:** principio interno de identidad, least privilege y separación owner/rol/scope.
- **Sin impacto Claude:** fórmulas de digest, gates y estrategia de credencial.

## 13. Siguiente paso

Capturar las seis respuestas empresariales mínimas y convertirlas inmediatamente a source-safe. Ese siguiente bloque seguirá siendo **NO PROVIDER / NO REPAIR** y solo cerrará owner anchors, exact entitlement, target claims y expected-claims digests.
