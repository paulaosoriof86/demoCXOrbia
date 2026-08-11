# CAMBIOS-BACKEND.md

**Última actualización:** 2026-08-10  
**Fuente operativa vigente:** `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`.

## Estado actual

`C6_AUTH_DUPLICATE_CANONICAL_REPLACEMENT_RESOLVED__ABC_CREATE_CANONICAL_REPLACEMENT_REQUIRED__D_KEEP_VALIDATED_EXTERNAL_CANONICAL_RETIRE_BOTH_HISTORICAL__ZERO_PROVIDER_READS__ZERO_WRITES__NO_PRODUCTION`

El detalle acumulativo del bloque actual está en:

- `app/docs/CAMBIOS-BACKEND-ADDENDUM-C6-AUTH-DUPLICATE-CANONICAL-REPLACEMENT-RESOLUTION-20260810.md`;
- `app/docs/SOURCE-LOCK-C6-AUTH-DUPLICATE-CANONICAL-REPLACEMENT-RESOLUTION-SOURCE-SAFE-20260810.md`;
- `app/docs/evidence/C6-AUTH-DUPLICATE-CANONICAL-REPLACEMENT-RESOLUTION-SOURCE-SAFE-20260810.json`.

## Resumen vigente

Auth DEV permanece en 228 usuarios con Activation/readback/rollback dry-run PASS. A–C ya no requieren decisión humana de fingerprints: la evidencia source-safe determina `CREATE_CANONICAL_REPLACEMENT_REQUIRED`. El import canónico creó un `super` y dos `coordinador`, pero ninguna evidencia owner-level asocia el `super` al grupo A y no se crearon principals `admin` ni `ops`; por tanto no se promueve ningún legacy por inferencia. D `ae2f...` queda con `KEEP_VALIDATED_EXTERNAL_CANONICAL_RETIRE_BOTH_HISTORICAL`.

Todo retiro futuro será `DISABLE_ONLY_NO_DELETE` con snapshot, idempotencia, readback y rollback dry-run. En este bloque: providerReads0, writes0, repair=false, deploy0, merge=false, production=false.

## Siguiente acción exacta

`C6 AUTH DUPLICATE CANONICAL REPLACEMENT REPAIR PLAN — SOURCE-ONLY / NO EXECUTE`.

No ejecutar provider ni repair sin autorización separada.
