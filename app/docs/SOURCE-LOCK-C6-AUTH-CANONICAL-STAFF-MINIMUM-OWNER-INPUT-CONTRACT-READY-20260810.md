# SOURCE LOCK — C6 AUTH CANONICAL STAFF MINIMUM OWNER INPUT CONTRACT

**Fecha:** 2026-08-10  
**Repositorio:** `paulaosoriof86/demoCXOrbia`  
**Rama:** `docs-tya-v6-v71-audit`  
**PR:** #7 draft/open/no merge  
**HEAD al inicio:** `0f0ced120b3554bc97bbcffdca667176438db809`  
**Estado:** `C6_AUTH_CANONICAL_STAFF_MINIMUM_OWNER_INPUT_CONTRACT_READY__BUSINESS_OWNER_AND_SCOPE_INPUT_REQUIRED__A_REUSE_CONDITIONAL__BC_NEW_EPHEMERAL_FIXED__D_PRESERVED__DOCS_ONLY__NO_PRODUCTION`

## 1. Estado congelado

```text
A 1acd... / super
= OWNER_ANCHOR_REQUIRED
+ PROJECT_ENTITLEMENT_REQUIRED

B 2c4d... / admin
= OWNER_ANCHOR_REQUIRED
+ PROJECT_ENTITLEMENT_REQUIRED
+ CREDENTIAL_INPUT_REQUIRED

C 542... / ops
= OWNER_ANCHOR_REQUIRED
+ PROJECT_ENTITLEMENT_REQUIRED
+ CREDENTIAL_INPUT_REQUIRED
```

D `ae2f...` permanece `REPAIR_PLAN_READY` y no fue reabierto.

## 2. Superficie humana mínima

Paula no debe elegir fingerprints, UIDs, cuentas legacy ni detalles técnicos.

Solo se requieren seis respuestas:

1. titular Superadministración;
2. scope Superadministración: TyA completo o proyectos específicos;
3. titular Administración;
4. scope Administración: TyA completo o proyectos específicos;
5. titular Operaciones;
6. scope Operaciones: TyA completo o proyectos específicos.

Si hay homónimos, se permite una referencia empresarial humana corta para desambiguar. No se pide email, documento, UID ni fingerprint.

## 3. Conversión source-safe obligatoria

La referencia humana cruda se usa solo de forma transitoria.

```text
ownerIdentityAnchor = sha256("cxorbia-owner-v1\0tya\0" + normalizedOwnerReference)
ownerRoleBindingDigest = sha256("cxorbia-owner-role-v1\0tya\0" + role + "\0" + ownerIdentityAnchor)
```

Persistir solo digests/metadata de atestación. No persistir la respuesta cruda.

## 4. Entitlement

Respuestas admitidas:

```text
TYA_COMPLETE
SPECIFIC_PROJECTS
```

`TYA_COMPLETE` no crea wildcard. Debe expandirse a la lista exacta source-safe de `projectIds` canónicos TyA antes de cerrar el target.

`SPECIFIC_PROJECTS` exige resolución 1:1 de cada proyecto humano a un `projectId` canónico source-safe.

No copiar scope legacy, no asumir `cinepolis` y no inferir por rol.

## 5. Claims y digest

Claims objetivo A–C:

```text
authNamespace=staff
tenantId=tya
role=A:super | B:admin | C:ops
projectIds=exact sorted unique owner entitlement
shopperId=absent
```

Serialización canónica compacta con orden de claves:

```text
authNamespace, projectIds, role, tenantId
```

```text
expectedClaimsDigest = sha256(UTF8(canonicalCompactJson))
```

No se genera digest hasta tener owner + entitlement exactos.

## 6. Credenciales

A:

```text
REUSE_EXISTING_CANONICAL_SUPER_ONLY_IF_INDEPENDENT_OWNER_BINDING_MATCHES
ELSE NEW_EPHEMERAL_CREDENTIAL
```

No se permite reutilización por unicidad de rol.

B/C:

```text
NEW_EPHEMERAL_CREDENTIAL_AT_SEPARATELY_AUTHORIZED_EXECUTION
```

Login/secret futuros: memoria efímera, nunca repo/artifact/log.

## 7. Invariantes

- no legacy keeper;
- no role uniqueness;
- no antigüedad, orden o lastSignIn;
- no raw email/UID/documento;
- no scope legacy como entitlement;
- no default Cinépolis;
- no wildcard silencioso;
- no expected-claims digest sin entitlement exacto;
- no repair en este bloque;
- no reabrir D.

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

## 9. Siguiente bloque exacto

Después de recibir las seis respuestas empresariales mínimas:

`C6 AUTH CANONICAL STAFF OWNER INPUT CAPTURE AND TARGET DIGEST — SOURCE-SAFE / NO PROVIDER / NO REPAIR`.

Debe convertir inmediatamente las respuestas a owner anchors, entitlement exacto, target claims y expected-claims digests; A además evalúa reutilización del `super` canónico solo por owner binding independiente. Sin provider ni repair.

## 10. Clasificación

- **Reusable CXOrbia:** atestación empresarial source-safe y claims digest determinístico.
- **Exclusivo cliente:** owners y scopes TyA A–C.
- **Claude/prototipo:** sin cambio frontend.
- **Academia:** least privilege y separación identidad/rol/scope.
- **Sin impacto Claude:** hashes, digest y gates internos.
