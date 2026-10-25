# C6 AUTH DUPLICATE — CANONICAL TARGET INPUT RESOLUTION

**Fecha:** 2026-08-10  
**Modo:** SOURCE-SAFE / NO PROVIDER / NO REPAIR  
**HEAD de entrada:** `2ff9649c7dd91a5cc2f164675aa37a34e4da1ba7`  
**Estado:** `C6_AUTH_DUPLICATE_CANONICAL_TARGET_INPUT_RESOLUTION_COMPLETE__A_OWNER_ANCHOR_AND_PROJECT_ENTITLEMENT_REQUIRED__BC_OWNER_ANCHOR_PROJECT_ENTITLEMENT_CREDENTIAL_INPUT_REQUIRED__D_PRESERVED_REPAIR_READY__ZERO_PROVIDER_READS__ZERO_WRITES__NO_PRODUCTION`

## 1. Resultado

Ninguno de los tres targets A–C puede cerrarse todavía como identidad canónica exacta usando únicamente las fuentes source-safe existentes. No se encontró una ancla owner-level independiente y reproducible para ninguno de los tres grupos. Los contratos genéricos de rol/scope describen formas permitidas, pero no prueban el entitlement empresarial exacto del owner de cada grupo.

No se usó unicidad de rol, antigüedad, orden, nombre/email/UID crudo, scope legacy ni selección de keeper.

## 2. A · `1acdcb3782b7cf351056` / super

Contrato conocido:

```text
role=super
authNamespace=staff
tenantId=tya
shopperId=absent
```

Bloqueos exactos:

```text
OWNER_ANCHOR_REQUIRED
PROJECT_ENTITLEMENT_REQUIRED
```

Existe en la fuente cifrada/importada un único camino de credencial canónica `super`, pero la evidencia no lo asocia owner-level a este grupo. No puede reutilizarse por unicidad del rol. Por ello la credencial queda condicionada: solo podrá reutilizarse si una ancla independiente futura demuestra la asociación exacta; de lo contrario será `CREDENTIAL_INPUT_REQUIRED` con secreto efímero en ejecución autorizada.

`expectedClaimsDigest=null` porque el target no está resuelto.

## 3. B · `2c4d19f2b066835473d3` / admin

Contrato conocido:

```text
role=admin
authNamespace=staff
tenantId=tya
shopperId=absent
```

Bloqueos exactos:

```text
OWNER_ANCHOR_REQUIRED
PROJECT_ENTITLEMENT_REQUIRED
CREDENTIAL_INPUT_REQUIRED
```

El import canónico creó cero principals `admin`. El password plaintext no es recuperable desde Firebase Auth y no se promueve ningún legacy. La futura credencial debe ser nueva y efímera, nunca persistida en repo/artifact/log.

`expectedClaimsDigest=null` porque el target no está resuelto.

## 4. C · `54225792eeb65f6739c0` / ops

Contrato conocido:

```text
role=ops
authNamespace=staff
tenantId=tya
shopperId=absent
```

Bloqueos exactos:

```text
OWNER_ANCHOR_REQUIRED
PROJECT_ENTITLEMENT_REQUIRED
CREDENTIAL_INPUT_REQUIRED
```

El import canónico creó cero principals `ops`. El password plaintext no es recuperable desde Firebase Auth y no se promueve ningún legacy. La futura credencial debe ser nueva y efímera, nunca persistida en repo/artifact/log.

`expectedClaimsDigest=null` porque el target no está resuelto.

## 5. D preservado

`ae2f920fe6d9ce1fdd82` no se reabrió. Permanece `REPAIR_PLAN_READY` con su Cliente canónico externo ya validado y disposición futura `DISABLE_ONLY_NO_DELETE` para ambos históricos.

## 6. Evidencia determinante

- inventario source-safe: cuatro records staff (`superadmin=1`, `coordinador=2`, `demo=1`);
- dry-run/import: staff elegibles/importados `super=1`, `coordinador=2`; `admin=0`, `ops=0`;
- continuidad: `admin` y `ops` permanecen en población pre-import/namespace-none;
- reconciliación de ownership: cero anclas owner-level únicas para A–C;
- contratos RBAC/taxonomía: definen scope genérico, no entitlement owner-specific;
- normalización de claims ejecutada históricamente solo aporta scope canónico a Cliente/Shopper, no a estos owners staff;
- Firebase Auth no permite recuperar plaintext password para crear un replacement nuevo.

## 7. Consecuencia técnica

No corresponde hacer otra lectura provider ni repetir adjudicación de duplicados: la brecha es de **input empresarial de identidad/scope**, no de capacidad de Auth. El siguiente contrato debe pedir únicamente la mínima ancla owner-level y entitlement de A–C, usando referencias source-safe; para B/C además debe declarar credencial nueva efímera en la ejecución futura. A puede reutilizar la credencial canónica importada solo si el owner anchor prueba la asociación exacta.

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
repair=false
Make=0
Gemini=0
payments=0
deploys=0
merge=false
production=false
rawPIIExported=false
credentialsExported=false
```

Los únicos writes del bloque son documentación source-safe en la rama viva.

## 9. Clasificación

- **Reusable CXOrbia:** separar identidad del owner, entitlement y material de credencial; no inferir identidad por rol.
- **Exclusivo cliente:** los grupos A–C TyA.
- **Claude/prototipo:** sin cambio frontend; no exponer inputs técnicos.
- **Academia:** principio interno de least privilege y canonicalización.
- **Sin impacto Claude:** reconciliación source-safe y bloqueo de ejecución.
