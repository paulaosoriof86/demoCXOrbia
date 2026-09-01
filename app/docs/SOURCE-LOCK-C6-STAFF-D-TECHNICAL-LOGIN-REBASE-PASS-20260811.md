# SOURCE LOCK — C6 STAFF D TECHNICAL LOGIN REBASE SOURCE-ONLY

**Fecha:** 2026-08-11  
**Repositorio:** `paulaosoriof86/demoCXOrbia`  
**Rama:** `docs-tya-v6-v71-audit`  
**PR:** #7 draft/open/no merge  
**Estado:** `PASS_C6_STAFF_D_TECHNICAL_LOGIN_REBASE_SOURCE_ONLY__ZERO_SOURCE_COLLISION__PRIVATE_EXECUTION_HANDOFF_PENDING__NO_PROVIDER__NO_WRITES__NO_PRODUCTION`

## 1. Decisión ejecutada

El visible-login histórico de D queda declarado técnicamente no recuperable. Se reemplazó su identidad técnica de login por un identificador canónico determinístico, regenerable sin depender de la referencia histórica y sin persistir ni emitir el visible-login crudo.

Se preservaron sin cambios:

```text
ownerIdentityAnchor
ownerRoleBindingDigest
role
entitlementMode
projectIds
expectedClaimsDigest
A/B/C
R4 canonical client
```

Los únicos campos de identidad técnica rebasados son `technicalLoginDigest` y `ownerTechnicalBindingDigest`. El `providerEmailSha256` se recalculó mecánicamente porque el contrato existente deriva el provider internal email desde `technicalLoginDigest[0:48]`; no constituye una tercera decisión de identidad.

## 2. Derivación canónica

Contrato: `backend/contracts/c6-staff-d-technical-login-rebase-v1.json`.

La derivación usa exclusivamente inputs source-safe ya congelados: tenant, auth namespace, alias D, owner anchor, owner-role binding y rol. El visible-login resultante solo existe de forma transitoria en runtime; no se guarda, no se imprime y no se envía a artifacts.

```text
derivationVersion=cxorbia-canonical-visible-login-v1
regenerableWithoutHistoricalReference=true
rawVisibleLoginPersisted=false
rawVisibleLoginLogged=false
rawVisibleLoginArtifact=false
```

## 3. Validación source-safe de colisión

```text
new D technicalLoginDigest vs A/B/C = 0 collisions
new D technicalLoginDigest vs superseded D = no collision
new D provider collision fingerprint vs A/B/C = 0 collisions
new D provider collision fingerprint vs superseded D = no collision
new D ownerTechnicalBindingDigest vs A/B/C = 0 collisions
new D ownerTechnicalBindingDigest vs superseded D = no collision
decision=PASS_SOURCE_SAFE_ZERO_COLLISION
```

No se realizó provider read para esta validación y no se repitió snapshot `31518927950`.

## 4. Prewrite focal

Contrato: `backend/contracts/c6-staff-d-rebase-prewrite-v1.json`.

```text
D deterministic rebase=PASS
provider snapshot repeat=false
Auth frozen budget=14
Firestore frozen budget=16
deletes=0
D historical visible-login dependency=false
D credential strategy=NEW_EPHEMERAL_AT_SEPARATELY_AUTHORIZED_EXECUTION
```

El rebase **no cambia** el presupuesto congelado.

## 5. Boundary privado restante detectado antes de write

El rebase D está cerrado, pero el exact-write todavía no debe autorizarse directamente: A/B/C fueron recuperados exactamente en contexto source-only transient y, por política, sus visible-login crudos no se persistieron. El carril GitHub actual no tiene un canal autorizado para inyectar esos valores privados al runtime sin ponerlos en repo/artifact/log.

Por tanto:

```text
A private transient execution handoff=REQUIRED
B private transient execution handoff=REQUIRED
C private transient execution handoff=REQUIRED
D private transient execution handoff=NOT REQUIRED; deterministic regeneration ready
exactWriteReadyNow=false
```

Esto no reabre A/B/C como identidades ni decisiones; solo identifica un boundary de transporte privado antes del write.

## 6. Seguridad

```text
providerReads=0
providerWrites=0
AuthWrites=0
FirestoreWrites=0
HRWrites=0
RulesWrites=0
StorageWrites=0
Make=0
Gemini=0
Payments=0
Deletes=0
Deploy=0
Merge=false
Production=false
rawLoginPersisted=false
contactEmailPersisted=false
UIDPersisted=false
passwordPersisted=false
passwordHashPersisted=false
rawNamePersisted=false
```

## 7. Progreso

```text
M5=4/8
PhaseA=84%
Remaining=16%
```

No se acredita peso nuevo: el rebase source-only resolvió el bloqueo D, pero todavía no existe write/readback efectivo.

## 8. Siguiente bloque exacto

`C6 STAFF PRIVATE EXECUTION HANDOFF SOURCE-ONLY`.

Objetivo: diseñar y validar un canal transitorio que permita al runtime consumir A/B/C exactos sin persistirlos ni emitirlos y sin provider access. No cambiar identidades, digests, roles, scopes, projectIds ni D rebasado. Solo con handoff PASS se habilita pedir autorización de exact-write v2.

## 9. Anti-bucle

- D technical rebase no se repite;
- no reabrir A/B/C como identidades;
- no repetir snapshot `31518927950`;
- no reusar request exact-write consumido;
- no reabrir Auth340, SKIP13, MultiAuth, HR, M4 o static gate;
- no nueva candidata/rama/PR/workflow;
- no provider/Auth/Firestore writes;
- no deletes/deploy/merge/producción.

## 10. Clasificación

- **Reusable CXOrbia:** deterministic technical login derivation + source-safe collision gate + explicit private runtime handoff boundary.
- **Exclusivo TyA:** target D rebase and current frozen budgets.
- **Claude/prototipo:** no frontend changes.
- **Academia:** deterministic identifier + one-way/private handoff lesson.
- **Sin impacto Claude:** contracts, digests, prewrite and source-safe evidence.
