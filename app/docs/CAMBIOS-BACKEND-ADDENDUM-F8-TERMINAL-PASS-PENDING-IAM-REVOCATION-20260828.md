# CAMBIOS BACKEND — ADDENDUM F8 TERMINAL PASS / PENDING IAM REVOCATION — 2026-08-28

## Resultado F8

Run `33193514608`, job `98924733768`, trigger exacto `dec6e8b451d6dd42303ff244703c798d22628975`, attempt 1.

Decisión: `PASS_F8_BACKUP_RESTORE_CUTOVER_RECONCILED_NO_REDEPLOY`.
Stage: `TERMINAL_PASS`.
Autorización F8: consumida (`true`), sin retry automático.

## Evidencia provider

- backup/export iniciado y completado;
- backup retenido en bucket GCS existente same-project, `US/STANDARD`;
- base temporal creada;
- import iniciado y completado;
- colecciones top-level origen/restauración: `9/9`, hash de esquema coincidente;
- base temporal eliminada;
- cleanup completo, error `null`;
- Cloud Run exacto y adapter Hosting exacto;
- release congelado reconciliado;
- redeploy requerido: `false`;
- deploy/rebuild/reimport: `0`.

Provider writes totales: `4`, correspondientes al alcance F8 (export, create temp DB, import, delete temp DB). Production business data writes=`0`; production Firestore document writes=`0`; Auth/HR/Rules/pagos/Make/Gemini writes=`0`; legacy DB access=`false`; secrets/credentials expuestos=`false`.

Evidencia persistida: `app/docs/evidence/RC15-F8-BACKUP-RESTORE-CUTOVER-EXECUTION-LATEST.json`.

## IAM temporal

El binding temporal `roles/datastore.owner` autorizado por Paula permitió el capability PASS y la ejecución F8. Ya no es necesario para F8. Su revocación inmediata es obligatoria y todavía no está verificada.

Estado: `F8_TERMINAL_PASS_PENDING_TEMP_IAM_REVOCATION_VERIFICATION`.

No elevar `PRODUCTION_REAL_READINESS` de 95 a 98 hasta demostrar residuo IAM cero.

## Siguiente gate obligatorio

1. retirar `roles/datastore.owner` de la identidad DEV existente;
2. ejecutar capability recheck read-only y demostrar que los cinco privilegios adicionales ya no están concedidos;
3. cerrar F8 y mover `95 → 98`;
4. ejecutar `F8_5_CANONICAL_MODULE_LINEAGE_CERTIFICATION` antes de cualquier invitación a visualización humana.

## F8.5 — garantía de canonicidad

La auditoría debe identificar la última versión **aprobada** por módulo y comparar fuente canónica versus Hosting vivo para `app/modules/**`, `app/core/**` relevante, entrypoints/index, scripts, adapters y rutas. Debe detectar referencias obsoletas, assets stale, módulos huérfanos y regresiones. Cualquier mismatch bloquea visualización.

## Clasificación

- Reusable CXOrbia: backup/restore verificable, restore aislado, reconciliación no-redeploy, revocación IAM obligatoria y gate transversal de linaje.
- Exclusivo TyA: IDs del proyecto/release y dataset operativo.
- Claude/prototipo: sin cambios funcionales; F8.5 será auditoría read-only antes de cualquier owner patch.
- Academia: sin cambio funcional; registrar impacto solo si F8.5 encuentra divergencia.
- Sin impacto Claude: F8 terminal provider en sí mismo.
