# RESUMEN PARA CLAUDE — ADDENDUM C6 CANONICAL REPLACEMENT

**Fecha:** 2026-08-10

## Backend resuelto

Los duplicados Auth históricos no deben resolverse desde UI ni escogiendo un legacy por rol. Para tres grupos staff (`1acd...`, `2c4d...`, `542...`) el backend fijó `CREATE_CANONICAL_REPLACEMENT_REQUIRED`: no existe mapping owner-level source-safe para reutilizar un principal canónico existente. Para Cliente `ae2f...`, existe un principal canónico externo ya validado y la disposición futura es `KEEP_VALIDATED_EXTERNAL_CANONICAL_RETIRE_BOTH_HISTORICAL`.

## Claude/prototipo

No agregar selectores de duplicados, prompts técnicos, bypass de RBAC ni fallback a principals legacy. El producto debe continuar mostrando una sola identidad funcional por sesión y mantener fail-close.

## Patrón reusable

- principal canónico requiere lineage/mapping reproducible;
- igualdad de rol no demuestra identidad;
- legacy duplicado no se promociona por conveniencia;
- retiro reversible: `DISABLE_ONLY_NO_DELETE` después de canonical validation;
- repair futuro exige snapshot, idempotencia, readback y rollback dry-run.

## Academia

Documentar la diferencia entre identidad histórica, identidad canónica y retiro reversible. No requiere cambio visual inmediato.
