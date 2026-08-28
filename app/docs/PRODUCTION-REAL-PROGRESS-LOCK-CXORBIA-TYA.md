# CXOrbia TyA — Progreso hacia producción real

**Fecha de baseline vigente:** 2026-08-28  
**Métrica canónica:** `PRODUCTION_REAL_READINESS`  
**Estado actual:** `95/100`  
**PHASE_A:** `100/100`  
**MASTER_PLAN_VERSION:** `1.1.0`  
**PLAN_CHANGE_REQUEST:** `PCR-20260826-PRODUCTION-ACCELERATION-01`

## Gates cerrados

- `69 → 74`: M3 terminal PASS.
- `74 → 76`: F3 mecanismo provider + recovery lane PASS.
- `76 → 81`: F4 recovery PASS.
- `81 → 86`: F5 live synthetic acceptance + cleanup + residuo cero PASS.
- `86 → 90`: F6 release Phase A inmutable PASS; fingerprint Hosting corregido posteriormente solo mediante errata overlay, sin cambio de release.
- `90 → 95`: F7 integral readiness `GO_WITH_WARNINGS`, P0=0.
- F8 read-only: IAM metadata P1 no bloqueante, bounded load/failure PASS y capability preflight completo PASS tras grant temporal autorizado; sin cambio porcentual todavía.

## F8 — listo para ejecución single-use

La autorización F8 permanece `AUTHORIZED_NOT_YET_CONSUMED`. El primer intento real autenticó contra GCP pero se detuvo antes de mutación por un fingerprint F6 incorrecto. Ese defecto de evidencia se corrigió mediante errata overlay; el asset vivo coincide con functional source congelado, runtime congelado y rama actual.

Se corrigió también la selección de Storage: el default Firebase anunciado no existe; el executor v6 solo utiliza bucket GCS realmente listado en el mismo proyecto, con metadata, ubicación compatible y permisos de objeto verificados.

Paula autorizó y aplicó excepcionalmente `roles/datastore.owner` temporal/condicionado a la identidad DEV existente. El recheck read-only del run `33187198967`, attempt 3, job `98923457703`, sobre HEAD `e9875eb278316396aaf58fe7b31423228fb0940f`, cerró `PASS_F8_CUTOVER_CAPABILITY_READONLY`: `missingPermissions=[]`, `verifiedExistingBucket=true`, `issues=[]`.

El job F8 de ese recheck quedó `skipped` por ausencia de successor marker. Provider writes=0, backup/export=0, restore=0, cutover=0, deploy=0 y autorización consumida=false hasta este punto.

## Camino restante

1. Emitir successor marker exacto como único archivo del commit trigger, ligado al HEAD vivo inmediatamente anterior.
2. Ejecutar una sola vez backup/export + restore en base aislada + verificación de colecciones + cleanup de base temporal.
3. Reconciliar release exacto; sin redeploy si Cloud Run/Hosting siguen exactos.
4. Revocar/verificar el binding temporal `roles/datastore.owner`.
5. Si F8 queda terminal PASS: `95 → 98`.
6. Ejecutar `F8_5_CANONICAL_MODULE_LINEAGE_CERTIFICATION`: última versión aprobada de cada módulo versus canónica y Hosting vivo. No invitar a visualización humana antes de PASS.
7. F9 aceptación postproducción: `98 → 100`.

## Estado seguro

Release F6 intacto. Antes del successor marker: provider/data/Auth/Firestore/HR/Storage/Rules/pagos/Make/Gemini writes=0; backup/export/restore/cutover=0; deploy/rebuild/reimport/merge=0; autorización F8 consumida=false.

**Siguiente gate:** `F8_EMIT_EXACT_SUCCESSOR_MARKER_AND_EXECUTE_SINGLE_USE_BACKUP_RESTORE_CUTOVER`.