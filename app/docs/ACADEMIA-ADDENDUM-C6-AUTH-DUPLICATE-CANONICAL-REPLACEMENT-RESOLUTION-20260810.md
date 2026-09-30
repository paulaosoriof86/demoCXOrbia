# ACADEMIA — ADDENDUM C6 CANONICAL REPLACEMENT

**Fecha:** 2026-08-10

## Patrón incorporado

Una identidad histórica o duplicada no se convierte en identidad canónica por tener el mismo rol. La canonicalización exige una ancla de lineage/mapping reproducible. Si falta, se crea/reemplaza de forma controlada y solo después se deshabilitan los legacy.

## Secuencia formativa reusable

1. identificar principals históricos;
2. comprobar si existe principal canónico con mapping inequívoco;
3. si no existe, preparar canonical replacement;
4. validar login, rol, tenant y proyecto;
5. snapshot;
6. retiro reversible `DISABLE_ONLY_NO_DELETE`;
7. idempotencia, readback y rollback dry-run.

## Impacto

Sin cambio de curso/UI inmediato. Debe reflejarse en futuros manuales de Auth, RBAC, troubleshooting y administración de identidades.
