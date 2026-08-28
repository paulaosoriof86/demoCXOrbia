# CAMBIOS BACKEND — ADDENDUM F8 EXECUTOR ENTRYPOINT Y ANTI-REPLAY

Fecha: 2026-08-28
Fase: F8_CUTOVER
Phase A: 100/100
Production Real Readiness: 95/100

## Trabajo realizado

Se continuó solo F8 desde el transport stop. HEAD previo verificado: `89f6eba11439689d8e92803a6cc7a53a25a16aea`.

Se confirmó un defecto pre-ejecución: `tools/release/tya-f8-backup-restore-cutover-one-shot.mjs` exportaba la función principal pero no tenía un punto de entrada ejecutable. Ejecutar directamente el archivo no iniciaría F8.

Se creó `tools/release/tya-f8-backup-restore-cutover-cli.mjs` en commit `13170f4156ad4ab5886b65f923ab5b9e198452b8`. El entrypoint usa un valor de autenticación efímero suministrado en tiempo de ejecución, no lo persiste ni lo muestra, comprueba evidencia previa de consumo o mutación, y crea una lease local atómica para impedir concurrencia o replay en el mismo checkout. La lease se elimina solo cuando la ejecución retorna sin consumo y con cero mutaciones provider.

Blob publicado: `5c399f101a5cd7a7f9a047d5f9fb48c0986543f3`. El mismo contenido pasó `node --check`.

Evidencia: `app/docs/evidence/RC15-F8-EXECUTOR-ENTRYPOINT-ANTI-REPLAY-REPAIR-LATEST.json`.

No se añadió una lease global entre workspaces porque eso exigiría una nueva superficie durable de escritura o un contrato de transporte adicional no autorizado. La autoridad cross-workspace sigue siendo la autorización single-use canónica, `automaticRetryAllowed=false`, los gates dinámicos y la reconciliación posterior a ejecución.

## Seguridad

Provider writes=0; backup/export=0; restore=0; cutover=0; deploy/rebuild/reimport/merge=0. La autorización F8 sigue no consumida y el release F6 permanece intacto.

## Clasificación

Reusable CXOrbia: entrypoint explícito, anti-replay local y fail-closed.
Exclusivo TyA: IDs de proyecto y release F8.
Claude/prototipo: sin cambios de UI, app/modules o app/core.
Academia: sin cambio funcional.
Sin impacto Claude: sí.

## Siguiente

`F8_EXECUTE_AUTHORIZED_BACKUP_RESTORE_CUTOVER_WHEN_SECURE_PROVIDER_EXECUTION_CHANNEL_IS_AVAILABLE`.
