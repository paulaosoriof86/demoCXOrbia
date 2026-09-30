# CAMBIOS-BACKEND — C6 AUTH DUPLICATE CANONICAL REPLACEMENT RESOLUTION

**Fecha:** 2026-08-10  
**Estado:** `ABC_CREATE_CANONICAL_REPLACEMENT_REQUIRED__D_KEEP_VALIDATED_EXTERNAL_CANONICAL_RETIRE_BOTH_HISTORICAL`

## Hecho

- Se releyeron índice, checkpoint, source lock, matriz humana y PR #7 antes de actuar.
- Se preservó el universo exacto de cuatro grupos/ocho principals.
- Se revisó evidencia source-safe de inventario, import y continuidad de credenciales, más la reconciliación ownership ya congelada.
- Se determinó que el import canónico creó `super=1` y `coordinador=2`, todos `namespace=staff`, pero no creó `admin` ni `ops`.
- Para `1acd...`, aunque existe un `super` canónico importado, no existe asociación source-safe owner-level que demuestre que pertenece al owner del grupo; no se reutiliza por inferencia.
- Para `2c4d...` y `542...`, no existe principal `admin`/`ops` creado por el import canónico y los principals actuales pertenecen al universo pre-import.
- A–C quedan `CREATE_CANONICAL_REPLACEMENT_REQUIRED`.
- Para `ae2f...` queda `KEEP_VALIDATED_EXTERNAL_CANONICAL_RETIRE_BOTH_HISTORICAL` usando el Cliente canónico ya validado.
- Todo retiro futuro queda `DISABLE_ONLY_NO_DELETE` y exige snapshot, idempotencia, readback y rollback dry-run.
- No se ejecutó repair ni provider.

## Archivos creados

- `app/docs/evidence/C6-AUTH-DUPLICATE-CANONICAL-REPLACEMENT-RESOLUTION-SOURCE-SAFE-20260810.json`;
- `app/docs/SOURCE-LOCK-C6-AUTH-DUPLICATE-CANONICAL-REPLACEMENT-RESOLUTION-SOURCE-SAFE-20260810.md`;
- este addendum;
- addenda de Claude, pendientes, Academia y tracker Phase A.

## Seguridad

`providerReads=0`, `Auth/IAM/Firestore/HR/Rules/Storage writes=0`, `PREWRITE=false`, `Activation=false`, `newSmoke=false`, `deploy=0`, `merge=false`, `production=false`.

## Clasificación

- **Reusable CXOrbia:** canonicalización por lineage y no por rol.
- **Exclusivo cliente:** grupos históricos TyA A–D.
- **Claude/prototipo:** sin cambios frontend.
- **Academia:** patrón canonical replacement + disable reversible.
- **Sin impacto Claude:** evidencia/source lock/control interno.
