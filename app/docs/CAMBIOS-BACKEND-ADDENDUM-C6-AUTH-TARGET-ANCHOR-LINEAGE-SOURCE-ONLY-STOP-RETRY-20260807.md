# CAMBIOS BACKEND — C6 AUTH TARGET ANCHOR LINEAGE SOURCE-ONLY

Fecha: 2026-08-07

## Clasificación
- Reusable CXOrbia: lineage source-safe de identidad y gate adaptativo por fingerprints.
- Exclusivo cliente: target TyA/Cinépolis `ac93d90d9e41512acdcd`.
- Claude/prototipo: sin cambio frontend.
- Academia: sin cambio funcional; conservar documentación de Auth/roles cuando se active.
- Sin impacto Claude: este bloque.

## Hecho
- Se revisó el source artifact congelado `31104541809 / 8968941587` y el planner `cxorbia-c6-shopper-deterministic-suffix-readonly.mjs`.
- Se demostró la lineage estructural de `baseLoginFp=493f2b26360648693c37` y `targetLoginFp=bd8d7019d612b4421366`.
- Se demostró que `multi_source_full_name_consensus` exige un único apellido corroborado por al menos dos bases distintas entre profile/hr/visit/certification/liquidation.
- Se confirmó que el target es el miembro suffixado de longitud 4 de un grupo de dos perfiles; el peer `a8dd7db89a02ff180674` conserva el login base por `unique_technical_holder_preserves_unsuffixed_login`.
- Se comprobó que las evidencias source-safe versionadas no conservan el set exacto de bases corroborantes del target; los fingerprints son one-way y el row UPDATE_AUTH tiene `diagnostics=null`.
- Se materializó `backend/contracts/c6-auth-target-anchor-lineage-provider-minimum-v1.json` con el mínimo provider futuro, no autorizado para ejecución.

## Decisión
`STOP_RETRY_C6_AUTH_TARGET_ANCHOR_LINEAGE_ROOT_FIX_SOURCE_ONLY_EXACT_CONSENSUS_BASES_NOT_VERSIONED`

## Seguridad
Provider/Auth/Firestore/HR reads=0. Provider/Auth/Firestore/HR writes=0. Deploy/build/merge/producción=0/false. Plan Auth 340/HOLD0 preservado y no ejecutado.

## Incidencia de herramienta
Un intento de `create_file` sobre la evidencia devolvió HTTP 422 porque el archivo ya existía y GitHub requería SHA; fue no-op y no afectó provider ni estado lógico.
