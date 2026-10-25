# SOURCE LOCK — C6 AUTH DUPLICATE CANONICAL TARGET INPUT RESOLUTION

**Fecha:** 2026-08-10  
**Repositorio:** `paulaosoriof86/demoCXOrbia`  
**Rama:** `docs-tya-v6-v71-audit`  
**PR:** #7 draft/open/no merge  
**HEAD al inicio:** `2ff9649c7dd91a5cc2f164675aa37a34e4da1ba7`  
**Estado:** `C6_AUTH_DUPLICATE_CANONICAL_TARGET_INPUT_RESOLUTION_COMPLETE__A_OWNER_ANCHOR_AND_PROJECT_ENTITLEMENT_REQUIRED__BC_OWNER_ANCHOR_PROJECT_ENTITLEMENT_CREDENTIAL_INPUT_REQUIRED__D_PRESERVED_REPAIR_READY__ZERO_PROVIDER_READS__ZERO_WRITES__NO_PRODUCTION`

## 1. Universo autorizado

Solo:

```text
1acdcb3782b7cf351056 / super
2c4d19f2b066835473d3 / admin
54225792eeb65f6739c0 / ops
```

`ae2f920fe6d9ce1fdd82` no se reabrió y permanece `REPAIR_PLAN_READY`.

## 2. Resolución A

```text
OWNER_ANCHOR_REQUIRED
PROJECT_ENTITLEMENT_REQUIRED
```

Existe un credential path canónico `super` en la fuente cifrada/importada, pero no puede asociarse a A mediante rol único. Solo una ancla owner-level independiente futura puede habilitar su reutilización; si no coincide, será necesaria credencial nueva efímera.

No existe target claims digest exacto todavía.

## 3. Resolución B

```text
OWNER_ANCHOR_REQUIRED
PROJECT_ENTITLEMENT_REQUIRED
CREDENTIAL_INPUT_REQUIRED
```

No existe principal canónico importado `admin`. La futura credencial será nueva y efímera; no se reutiliza password legacy ni se intenta recuperarlo de Firebase Auth.

No existe target claims digest exacto todavía.

## 4. Resolución C

```text
OWNER_ANCHOR_REQUIRED
PROJECT_ENTITLEMENT_REQUIRED
CREDENTIAL_INPUT_REQUIRED
```

No existe principal canónico importado `ops`. La futura credencial será nueva y efímera; no se reutiliza password legacy ni se intenta recuperarlo de Firebase Auth.

No existe target claims digest exacto todavía.

## 5. Invariantes

- no role uniqueness como owner proof;
- no antigüedad, orden, lastSignIn o timing;
- no raw name/email/UID;
- no scope legacy como entitlement;
- no legacy keeper;
- no asumir `cinepolis` para A–C;
- no generar expected-claims digest mientras project entitlement no sea exacto;
- retiro futuro `DISABLE_ONLY_NO_DELETE`;
- no deshabilitar A–C antes de `CANONICAL_VALIDATED`.

## 6. Seguridad

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
```

## 7. Siguiente bloque exacto

Solo bajo nueva autorización:

`C6 AUTH CANONICAL STAFF MINIMUM OWNER INPUT CONTRACT — SOURCE-SAFE / NO PROVIDER / NO REPAIR`.

Debe convertir los faltantes A–C en un contrato mínimo de negocio source-safe, sin pedir fingerprints legacy: owner reference estable, scope/entitlement exacto y estrategia de credencial. No ejecutar repair.

## 8. Clasificación

- **Reusable CXOrbia:** identidad, scope y credencial como dimensiones independientes.
- **Exclusivo cliente:** tres owners staff TyA aún no anclados.
- **Claude/prototipo:** sin cambio frontend.
- **Academia:** least privilege y no inferencia de identidad.
- **Sin impacto Claude:** source lock y evidencia interna.
