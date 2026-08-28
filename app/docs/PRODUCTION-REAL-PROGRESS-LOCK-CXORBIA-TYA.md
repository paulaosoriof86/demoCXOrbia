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
- `86 → 90`: F6 release Phase A inmutable PASS.
- `90 → 95`: F7 integral readiness `GO_WITH_WARNINGS`, P0=0.
- F8 read-only: IAM metadata P1 reconciliado no bloqueante y `F7-P1-003` bounded load/failure `CLOSED/PASS` sin cambio porcentual.

## F8 autorizado y mecanismo de invocación reparado

La autorización single-use F8 permanece `AUTHORIZED_NOT_YET_CONSUMED`; ninguna mutación provider inició.

El repair `e95d23a91f26f42e1adf3ac167ccd2f0093dd31a` corrigió lineage y consumo prematuro en el ejecutor. En esta continuación se confirmó que el módulo one-shot no tenía punto de entrada ejecutable y que el control de intento de Actions no impedía invocaciones independientes fuera de Actions.

El commit `13170f4156ad4ab5886b65f923ab5b9e198452b8` añadió `tools/release/tya-f8-backup-restore-cutover-cli.mjs`: invocación explícita fail-closed, entrada de autenticación efímera sin persistencia/salida, bloqueo ante evidencia previa consumida o con mutación y lease local atómica para impedir replay/concurrencia del mismo checkout. Blob `5c399f101a5cd7a7f9a047d5f9fb48c0986543f3`; syntax PASS. Evidencia: `app/docs/evidence/RC15-F8-EXECUTOR-ENTRYPOINT-ANTI-REPLAY-REPAIR-LATEST.json`.

No se añadió una lease global cross-workspace porque requeriría una superficie durable o contrato de transporte adicional no autorizado. La autoridad cross-workspace sigue siendo la autorización canónica single-use, `automaticRetryAllowed=false`, gates dinámicos y reconciliación inmediata posterior.

El bloqueo actual continúa siendo externo: `EXTERNAL_TRANSPORT_OUTAGE_NO_SAFE_PROVIDER_EXECUTOR_IN_CURRENT_SESSION`. No existe en esta sesión un canal GCP/provider autenticado utilizable y el alcance vigente prohíbe crear/revivir workflow, IAM o credenciales.

No hay P0 de producto ni drift probado del release F6. `PRODUCTION_REAL_READINESS` permanece `95/100`; solo mueve `95 → 98` cuando F8 backup/restore/cutover quede terminal y reconciliado.

## Camino restante

1. Ejecutar la autorización F8 vigente cuando exista un canal provider seguro, usando el entrypoint reparado.
2. Backup/export + restore temporal verificable.
3. Reconciliar el release congelado exacto; sin redeploy si el drift check continúa PASS.
4. Provider readbacks/smoke/rollback y cierre F8: `95 → 98`.
5. F9 aceptación postproducción: `98 → 100`.

## Estado seguro

Release F6 intacto. Provider/IAM/data/Auth/Firestore/HR/Storage/Rules/pagos/Make/Gemini writes=`0`; backup/export/restore/cutover attempts=`0`; deploy/rebuild/reimport/merge=`0`; autorización F8 consumida=`false`.

**Siguiente gate:** `F8_EXECUTE_AUTHORIZED_BACKUP_RESTORE_CUTOVER_WHEN_SECURE_PROVIDER_EXECUTION_CHANNEL_IS_AVAILABLE`.
