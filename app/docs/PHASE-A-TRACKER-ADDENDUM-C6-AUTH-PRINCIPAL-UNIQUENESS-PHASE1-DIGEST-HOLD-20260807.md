# PHASE A TRACKER — C6 AUTH PRINCIPAL-UNIQUENESS PHASE 1 DIGEST HOLD

## Estado

- Direct runner DEV: PASS.
- SKIP13: cerrado 13/13.
- Multi-Auth: adjudicado y cerrado.
- Target lineage `ac93...`: PASS `profile + visit`.
- Causa raíz old PREWRITE: `CROSS_ROW_EXISTING_AUTH_PRINCIPAL_ALIAS_IN_OLD_PREWRITE` demostrada.
- Rootfix source: sintaxis/self-tests/static no-loop PASS.
- FASE 1 materialización: STOP_RETRY `NEW_DIGEST` por annotation source-safe inconsistente.
- FASE 2 provider/Activation: no iniciada.
- Auth ejecutado: no.
- Producción: no.

## Siguiente bloque

Canonicalización source-only de digest/annotation y reejecución de FASE 1. Solo con PASS, rearmar FASE 2 provider con un request nuevo y único.
