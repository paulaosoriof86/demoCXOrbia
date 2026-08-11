# ACADEMIA — ADDENDUM C6 AUTH DUPLICATE CANONICAL REPAIR PLAN

**Fecha:** 2026-08-10

Este bloque no cambia cursos, rutas, manuales, certificaciones ni UI de Academia.

Patrón reusable a conservar como principio interno de seguridad:

- una identidad canónica debe estar validada antes de retirar identidades históricas;
- un duplicado legacy nunca se promueve por rol, antigüedad u orden;
- el retiro es reversible `DISABLE_ONLY_NO_DELETE`;
- toda mutación sensible exige snapshot, idempotencia, readback y rollback dry-run.

No exponer fingerprints, claims internos ni detalles técnicos a shoppers/clientes en Academia.
