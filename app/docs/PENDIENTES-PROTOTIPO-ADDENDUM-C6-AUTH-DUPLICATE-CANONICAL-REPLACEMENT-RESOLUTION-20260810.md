# PENDIENTES PROTOTIPO — ADDENDUM C6 CANONICAL REPLACEMENT

**Fecha:** 2026-08-10

## Pendiente vivo backend

El conflicto de ownership ya no requiere que Paula escoja fingerprints legacy.

```text
1acd... = CREATE_CANONICAL_REPLACEMENT_REQUIRED
2c4d... = CREATE_CANONICAL_REPLACEMENT_REQUIRED
542...  = CREATE_CANONICAL_REPLACEMENT_REQUIRED
ae2f...  = KEEP_VALIDATED_EXTERNAL_CANONICAL_RETIRE_BOTH_HISTORICAL
```

Para A–C se debe preparar un principal canónico limpio por owner antes de retirar cualquier legacy. Para D se preserva el Cliente canónico externo ya validado.

## No hacer

- no promover un legacy por rol, orden o similitud;
- no provider read sin autorización específica;
- no ejecutar repair dentro del bloque source-safe;
- no frontend workaround;
- no delete: retiro futuro únicamente `DISABLE_ONLY_NO_DELETE`.

## Siguiente bloque

Preparar `C6 AUTH DUPLICATE CANONICAL REPLACEMENT REPAIR PLAN — SOURCE-ONLY / NO EXECUTE`, con target contract y gates de snapshot/idempotencia/readback/rollback.
