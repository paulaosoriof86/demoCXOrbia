# SOURCE LOCK — C6 STAFF PRIVATE EXECUTION HANDOFF SOURCE-ONLY

**Fecha:** 2026-08-11  
**Repositorio:** `paulaosoriof86/demoCXOrbia`  
**Rama:** `docs-tya-v6-v71-audit`  
**PR:** #7 draft/open/no merge  
**Estado:** `PASS_C6_STAFF_PRIVATE_EXECUTION_HANDOFF_SOURCE_ONLY__ABC_ENCRYPTED_EXACT__D_DETERMINISTIC__NO_PROVIDER__NO_WRITES__NO_PRODUCTION`

## 1. Resultado

El handoff privado de ejecución queda materializado source-only sin reabrir decisiones de identidad.

```text
A = exact recovered reference -> encrypted private envelope
B = exact recovered reference -> encrypted private envelope
C = exact recovered reference -> encrypted private envelope
D = deterministic regeneration from D rebase PASS
```

Los valores A/B/C fueron revalidados transient contra sus `technicalLoginDigest` y `ownerTechnicalBindingDigest` congelados antes del cifrado. No se emiten ni se guardan en claro.

## 2. Mecanismo

- contrato: `backend/contracts/c6-staff-private-execution-handoff-v1.json`;
- envelope cifrado: `backend/private-inbox/c6-staff-private-execution-handoff.enc.json`;
- runtime memory-only: `backend/runtime/private-handoff/c6-staff-private-execution-handoff.mjs`;
- source gate: `tools/qa/cxorbia-c6-staff-private-execution-handoff-source-gate.mjs`;
- runtime gate para futuro prewrite autorizado: `tools/qa/cxorbia-c6-staff-private-execution-handoff-runtime-gate.mjs`;
- keypair existente: `corte6-credential-handoff-public.json` + private key cifrada existente;
- AAD: `cxorbia-c6-staff-private-execution-handoff-v1`;
- algoritmo: RSA-OAEP-3072-SHA256 + A256GCM + gzip.

El archivo persistido contiene únicamente ciphertext y metadata source-safe. `rawLoginPersisted=false`; `encryptedCiphertextPersisted=true`.

## 3. Validación

```text
ABC exact digest validation before encryption = PASS
ABC owner technical binding before encryption = PASS
ABC uniqueness = PASS
raw protected values present in serialized envelope = NO
key fingerprint = MATCH existing key metadata
same-key historical decrypt path = previously PASS/READY in CORTE6-CREDENTIAL-HANDOFF-DRYRUN-LATEST.json
D deterministic technical digest = PASS
D owner technical binding = PASS
provider access needed by handoff = NO
```

El runtime futuro debe volver a validar los digests y bindings inmediatamente después de descifrar y **antes del primer write**. Esa verificación no consume ni repite el snapshot `31518927950`.

## 4. Preservado exactamente

```text
A/B/C identities = unchanged
D business identity = unchanged
owner bindings = unchanged
roles = unchanged
entitlementMode = unchanged
projectIds = unchanged
expectedClaimsDigest = unchanged
R4 canonical client = unchanged / no mutation
Auth frozen budget = 14
Firestore frozen budget = 16
deletes = 0
```

## 5. Seguridad

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
raw login/email/UID/password/hash/name emitted=false
raw login/email/UID/password/hash/name persisted=false
```

No se repitieron D rebase, snapshot, Auth340, SKIP13, MultiAuth, HR, M4 ni static gate.

## 6. Causa del boundary anterior

El problema era exclusivamente de transporte privado: los exactos A/B/C existían en contexto transient pero el runtime GitHub no tenía una representación recuperable sin exponerlos. Se resolvió reutilizando el keypair ya probado para persistir solo ciphertext y descifrar en memoria dentro de un runner posteriormente autorizado.

No fue necesario crear GitHub secret nuevo, nueva rama, PR, workflow ni pedir datos de negocio.

## 7. Progreso

```text
M5=4/8
PhaseA=84%
Remaining=16%
```

No se suma peso todavía porque el handoff source-only no ejecutó provider write/readback.

## 8. Siguiente gate exacto

`C6 STAFF REPAIR/BOOTSTRAP EXACT WRITE V2 AUTHORIZATION`.

El v2 deberá:

- consumir A/B/C exclusivamente mediante este handoff cifrado y memory-only;
- regenerar D exclusivamente desde el D rebase PASS;
- revalidar A/B/C/D exactos antes del primer write;
- preservar budget Auth=14 / Firestore=16 / deletes=0;
- mantener create-before-retire y R4 canónico inmutable;
- generar cualquier credencial nueva B/C/D únicamente dentro del boundary privado autorizado, sin repo/artifact/log;
- STOP antes del primer write ante cualquier decrypt/digest/binding/collision mismatch.

## 9. Anti-bucle

- handoff no se rediseña ni se vuelve a recuperar A/B/C;
- D rebase no se repite;
- snapshot `31518927950` no se repite;
- exact-write request consumido no se reutiliza;
- no reabrir Auth340/SKIP13/MultiAuth/HR/M4/static;
- no nueva candidata/rama/PR/workflow;
- no writes hasta autorización explícita v2;
- no deletes/deploy/merge/producción.

## 10. Clasificación

- **Reusable CXOrbia:** encrypted-at-rest / memory-only execution handoff con validación de digest y binding.
- **Exclusivo TyA:** targets A-D y budgets C6 actuales.
- **Claude/prototipo:** sin cambios frontend.
- **Academia:** separación entre identidad visible privada, digest source-safe y transporte cifrado recuperable.
- **Sin impacto Claude:** envelope, runtime helper, gates y evidencia.
