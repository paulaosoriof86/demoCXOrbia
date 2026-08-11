# CAMBIOS-BACKEND — C6 AUTH CANONICAL STAFF MINIMUM OWNER INPUT CONTRACT

**Fecha:** 2026-08-10  
**Estado:** `C6_AUTH_CANONICAL_STAFF_MINIMUM_OWNER_INPUT_CONTRACT_READY__BUSINESS_OWNER_AND_SCOPE_INPUT_REQUIRED__A_REUSE_CONDITIONAL__BC_NEW_EPHEMERAL_FIXED__D_PRESERVED__DOCS_ONLY__NO_PRODUCTION`

## Hecho

- Se congeló A–C exactamente desde el bloque previo, sin reabrir identidad ni provider.
- Se eliminó la necesidad de que Paula decida fingerprints, UIDs, keepers o criterios técnicos.
- Se redujo el input humano a seis respuestas de negocio: titular + alcance para Superadministración, Administración y Operaciones.
- Se definió conversión source-safe de la designación humana a `ownerIdentityAnchor` y `ownerRoleBindingDigest`, sin persistir la referencia cruda.
- Se definió entitlement `TYA_COMPLETE` o `SPECIFIC_PROJECTS` con expansión a `projectIds` exactos, sin wildcard, sin scope legacy y sin default Cinépolis.
- Se definió serialización determinística de claims y fórmula de `expectedClaimsDigest`.
- A conserva reutilización del `super` canónico solo si un owner binding independiente coincide; B/C conservan credencial nueva efímera obligatoria.
- D no se reabrió y permanece `REPAIR_PLAN_READY`.

## Archivos creados

- `backend/config/c6-auth-canonical-staff-minimum-owner-input-contract-v1.json`;
- `app/docs/C6-AUTH-CANONICAL-STAFF-MINIMUM-OWNER-INPUT-CONTRACT-20260810.md`;
- `app/docs/evidence/C6-AUTH-CANONICAL-STAFF-MINIMUM-OWNER-INPUT-CONTRACT-SOURCE-SAFE-20260810.json`;
- `app/docs/SOURCE-LOCK-C6-AUTH-CANONICAL-STAFF-MINIMUM-OWNER-INPUT-CONTRACT-READY-20260810.md`;
- este addendum;
- addenda Claude, Pendientes, Academia y Phase A tracker del mismo bloque.

## Seguridad

`providerReads=0`, `Auth/IAM/Firestore/HR/Rules/Storage writes=0`, PREWRITE/Activation/smoke/repair=false, deploy=0, merge=false, production=false. Solo commits documentales/contractuales source-safe.

## Clasificación

- **Reusable CXOrbia:** business attestation → owner anchor → entitlement → claims digest.
- **Exclusivo cliente:** roles/owners TyA A–C.
- **Claude/prototipo:** sin cambio frontend.
- **Academia:** least privilege e identidad canónica.
- **Sin impacto Claude:** fórmulas de digest, gates y credenciales efímeras.
