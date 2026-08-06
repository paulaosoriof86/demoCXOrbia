# PENDIENTES PROTOTIPO — C6 autoridad HR viva

**Fecha:** 2026-08-06  
**Estado:** `STOP_RETRY_PROVIDER_EXECUTION_NOT_OBSERVED`

## P0 vigente

1. Determinar mediante control-plane read-only si el request `4e404f2d...` creó un run.
2. Recuperar run/job/log/artifact si la lectura provider ocurrió.
3. Solo con prueba de `providerReads=0`, emitir un trigger corregido para una única lectura viva.
4. Confirmar desde provider vivo el periodo calendario `2026-08`, tabs GT/HN y conteos reales sin expectativas fijas.
5. Validar que una modificación histórica cambia `sourceRevision` y se refleja transversalmente.

## P0 posteriores

- Materializar la revisión HR viva y reconciliar por `visitId/hrRowId`, no por recarga histórica ciega.
- Preparar repair Auth de las 327 identidades elegibles con overlay SKIP13, snapshot, idempotencia, readback y rollback.
- Validación acumulativa DEV y cutover con autorizaciones separadas.

## Cerrado y no reabrir

- 13 perfiles omitidos de Auth: `HOLD=0`.
- Universo equivalente 65/65.
- Frontend acumulativo y módulos protegidos.
- No repetir import histórico por conteo fijo.
- No inferir tabs, periodos o conteos HR.

## P1/P2

PDF/Excel y otras mejoras visuales permanecen documentadas y no sustituyen el P0 de autoridad HR viva.
