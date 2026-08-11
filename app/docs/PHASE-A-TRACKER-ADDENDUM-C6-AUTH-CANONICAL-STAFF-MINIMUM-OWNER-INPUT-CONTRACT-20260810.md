# PHASE A TRACKER — C6 AUTH CANONICAL STAFF MINIMUM OWNER INPUT CONTRACT

**Fecha:** 2026-08-10

## Estado

`C6_AUTH_CANONICAL_STAFF_MINIMUM_OWNER_INPUT_CONTRACT_READY__BUSINESS_OWNER_AND_SCOPE_INPUT_REQUIRED__A_REUSE_CONDITIONAL__BC_NEW_EPHEMERAL_FIXED__D_PRESERVED__DOCS_ONLY__NO_PRODUCTION`

## Avance

- Auth DEV 228 preservado; Activation/readback/rollback dry-run continúan PASS.
- A–C dejaron de ser un problema de selección técnica de duplicados.
- El input pendiente se redujo a seis respuestas empresariales comprensibles: titular y alcance por cada rol staff focal.
- Se definió conversión determinística source-safe a owner anchor, owner-role binding, project entitlement, target claims y expected-claims digest.
- A conserva reutilización condicional del `super` canónico; B/C tienen estrategia de credencial nueva efímera ya fijada.
- D permanece `REPAIR_PLAN_READY` sin reabrirse.
- Frontend y superficies Phase A se preservan.

## Pendiente real

Recibir las seis respuestas empresariales mínimas y cerrar A–C source-safe. Ese cierre no requiere provider ni repair. Después, con targets/digests bloqueados, podrá autorizarse por separado el repair focal reversible.

## Seguridad

Provider reads 0; Auth/IAM/Firestore/HR/Rules/Storage writes 0; PREWRITE/Activation/smoke/repair=false; deploy/merge/production=0/false/false.
