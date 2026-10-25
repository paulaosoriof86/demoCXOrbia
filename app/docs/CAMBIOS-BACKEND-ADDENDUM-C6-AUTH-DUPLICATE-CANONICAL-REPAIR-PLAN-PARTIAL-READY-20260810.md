# CAMBIOS-BACKEND — C6 AUTH DUPLICATE CANONICAL REPLACEMENT REPAIR PLAN

**Fecha:** 2026-08-10  
**Estado:** `C6_AUTH_DUPLICATE_CANONICAL_REPLACEMENT_REPAIR_PLAN_PARTIAL_READY__ABC_CANONICAL_TARGET_INPUT_REQUIRED__D_REPAIR_READY__ZERO_PROVIDER_READS__ZERO_WRITES__NO_PRODUCTION`

## Hecho

- Se revalidaron índice, checkpoint, source lock vigente, evidencia de canonical replacement, reglas Auth/browser, RBAC source-safe y Firestore rules.
- Se preparó un único plan no superpuesto de repair.
- A–C quedaron `CANONICAL_TARGET_INPUT_REQUIRED`: role/namespace/tenant están definidos, pero faltan owner anchor y project entitlement source-safe; no se infirió `cinepolis` ni se promovió un legacy.
- D quedó `REPAIR_PLAN_READY` preservando el Cliente canónico externo validado.
- Se congelaron snapshot, collision, idempotency, readback y rollback dry-run contracts.
- Write budget futuro completo: hard cap 14 Auth writes, 0 deletes y 0 Firestore/IAM/HR/Rules/Storage writes.

## Archivos creados

- `app/docs/C6-AUTH-DUPLICATE-CANONICAL-REPLACEMENT-REPAIR-PLAN-SOURCE-ONLY-20260810.md`;
- `app/docs/evidence/C6-AUTH-DUPLICATE-CANONICAL-REPLACEMENT-REPAIR-PLAN-SOURCE-ONLY-20260810.json`;
- `app/docs/SOURCE-LOCK-C6-AUTH-DUPLICATE-CANONICAL-REPLACEMENT-REPAIR-PLAN-PARTIAL-READY-20260810.md`;
- este addendum;
- addenda Claude, Pendientes, Academia y Phase A tracker del mismo bloque.

## Seguridad

`providerReads=0`, `AuthWrites=0`, `FirestoreWrites=0`, `repair=false`, `deploy=0`, `merge=false`, `production=false`.

## Clasificación

- **Reusable CXOrbia:** create-before-retire, deterministic namespaced identity, bounded/reversible repair.
- **Exclusivo cliente:** cuatro grupos Auth TyA.
- **Claude/prototipo:** sin cambio frontend.
- **Academia:** principio de canonicalización segura.
- **Sin impacto Claude:** gates y budgets internos.
