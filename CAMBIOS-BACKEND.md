# CAMBIOS-BACKEND.md

**Última actualización:** 2026-08-10  
**Fuente operativa vigente:** `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`.

## Estado actual

`C6_AUTH_DUPLICATE_CANONICAL_TARGET_INPUT_RESOLUTION_COMPLETE__A_OWNER_ANCHOR_AND_PROJECT_ENTITLEMENT_REQUIRED__BC_OWNER_ANCHOR_PROJECT_ENTITLEMENT_CREDENTIAL_INPUT_REQUIRED__D_PRESERVED_REPAIR_READY__ZERO_PROVIDER_READS__ZERO_WRITES__NO_PRODUCTION`

El detalle del bloque está en:

- `app/docs/CAMBIOS-BACKEND-ADDENDUM-C6-AUTH-DUPLICATE-CANONICAL-TARGET-INPUT-RESOLUTION-20260810.md`;
- `app/docs/SOURCE-LOCK-C6-AUTH-DUPLICATE-CANONICAL-TARGET-INPUT-RESOLUTION-REQUIRED-20260810.md`;
- `app/docs/C6-AUTH-DUPLICATE-CANONICAL-TARGET-INPUT-RESOLUTION-SOURCE-SAFE-20260810.md`;
- `app/docs/evidence/C6-AUTH-DUPLICATE-CANONICAL-TARGET-INPUT-RESOLUTION-SOURCE-SAFE-20260810.json`.

## Resumen vigente

Auth DEV permanece en 228 con Activation/readback/rollback dry-run PASS. Se agotó la evidencia source-safe de A–C sin provider. A requiere `OWNER_ANCHOR_REQUIRED` y `PROJECT_ENTITLEMENT_REQUIRED`; existe un credential path canónico `super`, pero no puede asociarse por unicidad del rol. B/C requieren además `CREDENTIAL_INPUT_REQUIRED`, porque el import canónico creó cero `admin` y cero `ops` y el plaintext password no es recuperable de Firebase Auth.

No se generaron expected-claims digests porque ningún target A–C quedó cerrado. D permanece `REPAIR_PLAN_READY` y no se reabrió. Provider/data writes=0, repair=false, deploy0, merge=false, production=false.

## Siguiente acción exacta

`C6 AUTH CANONICAL STAFF MINIMUM OWNER INPUT CONTRACT — SOURCE-SAFE / NO PROVIDER / NO REPAIR`.

Definir el mínimo input empresarial source-safe A–C sin fingerprints legacy ni PII en repo. No ejecutar provider ni repair sin autorización separada.
