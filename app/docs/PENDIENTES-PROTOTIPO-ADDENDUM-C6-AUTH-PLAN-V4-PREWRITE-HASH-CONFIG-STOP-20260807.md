# PENDIENTES PROTOTIPO — ADDENDUM C6 AUTH PLAN V4 PREWRITE HASH-CONFIG STOP

**Fecha:** 2026-08-07

## Pendiente vivo

1. Corregir source-only `fetchHashConfig` para usar el contrato oficial de `projects.getConfig` sin query `mask`.
2. Validar que el fix solo lea la respuesta y extraiga `hashConfig`; cero writes.
3. Bajo autorización nueva y request nuevo, ejecutar un único PREWRITE v4 sobre el mismo digest.
4. Solo si PREWRITE logra rollback exacto de las 8 password updates y snapshot cifrado roundtrip, entrar al write boundary Auth DEV.

## No pendientes / circuit breaker

- no reabrir las 45 UPDATE del plan v3;
- no reabrir SKIP13;
- no reabrir multi-Auth;
- no reabrir lineage `ac93...`;
- no rediseñar frontend;
- no modificar `CX.data` por este hallazgo.

## Estado seguro

`HASH_CONFIG_HTTP_400` detuvo el bloque antes de Auth writes. Freeze v4 intacto y producción intacta.
