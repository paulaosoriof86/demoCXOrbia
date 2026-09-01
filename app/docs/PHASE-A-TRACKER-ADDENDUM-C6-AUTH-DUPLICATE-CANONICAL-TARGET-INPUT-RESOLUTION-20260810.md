# PHASE A TRACKER — C6 AUTH DUPLICATE CANONICAL TARGET INPUT RESOLUTION

**Fecha:** 2026-08-10

## Estado

`C6_AUTH_DUPLICATE_CANONICAL_TARGET_INPUT_RESOLUTION_COMPLETE__A_OWNER_ANCHOR_AND_PROJECT_ENTITLEMENT_REQUIRED__BC_OWNER_ANCHOR_PROJECT_ENTITLEMENT_CREDENTIAL_INPUT_REQUIRED__D_PRESERVED_REPAIR_READY__ZERO_PROVIDER_READS__ZERO_WRITES__NO_PRODUCTION`

## Avance

- Auth DEV 228 y digest v4 preservados.
- A–C dejaron de ser una pregunta técnica sobre duplicates/keeper: la brecha quedó reducida a inputs empresariales exactos de owner/scope y, para B/C, credencial efímera nueva.
- A conserva un posible credential path canónico `super`, pero no se puede asociar por unicidad del rol.
- D sigue listo para repair y no se reabrió.
- No provider read, no repair, no frontend ni producción.

## Pendiente real

Definir un contrato mínimo source-safe para capturar owner anchor + entitlement exacto A–C y estrategia de credencial, sin PII en repo. Solo después se podrán producir expected-claims digests y habilitar un repair focal bajo autorización separada.
