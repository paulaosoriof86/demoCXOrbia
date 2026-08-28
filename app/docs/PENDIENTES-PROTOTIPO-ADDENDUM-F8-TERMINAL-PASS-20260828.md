# PENDIENTES PROTOTIPO — ADDENDUM F8 TERMINAL PASS — 2026-08-28

## No existe pendiente frontend nuevo derivado de F8

El provider F8 terminó PASS sin redeploy ni cambios funcionales de frontend.

## Pendiente inmediato bloqueante de cierre F8

`F8_TEMP_IAM_REVOCATION_ZERO_RESIDUE`: retirar `roles/datastore.owner` temporal de la identidad DEV existente y demostrar por recheck read-only que ya no posee `datastore.databases.export`, `import`, `create`, `delete` ni `datastore.operations.get` por ese binding temporal. `datastore.databases.getMetadata` puede permanecer por su rol base.

Hasta ese PASS, Production Real Readiness permanece `95/100`.

## Pendiente obligatorio antes de visualización

`F8_5_CANONICAL_MODULE_LINEAGE_CERTIFICATION`: identificar última versión aprobada de cada módulo y comparar canónica/Hosting vivo para `app/modules/**`, `app/core/**` relevante, index/entrypoints, scripts/adapters/rutas; detectar referencias/versiones obsoletas, assets stale, módulos huérfanos y regresiones.

Cualquier mismatch bloquea invitación a visualización humana. Si todo coincide, F8.5 certifica que la plataforma a visualizar corresponde transversalmente a la canónica aprobada.
