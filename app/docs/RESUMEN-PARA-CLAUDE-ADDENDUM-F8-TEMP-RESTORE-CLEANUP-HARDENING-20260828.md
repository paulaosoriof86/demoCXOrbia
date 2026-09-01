# RESUMEN PARA CLAUDE — ADDENDUM F8 TEMP RESTORE / CLEANUP HARDENING

Fecha: 2026-08-28

Este bloque es exclusivamente backend/control-plane F8. No existe tarea frontend derivada.

Se endureció `tools/release/tya-f8-backup-restore-cutover-one-shot.mjs` para que la base temporal de restore se genere solo después del backup exitoso, use un identificador collision-resistant y solo pueda limpiarse si la creación de esa base fue aceptada. Los DELETE de cleanup quedan single-attempt y fail-closed, sin retry automático.

No tocar `/app/modules`, `/app/core`, login, navegación, vistas, roles, Academia ni el release funcional congelado por este cambio. No hay ajuste visual pendiente generado por este bloque.

Phase A permanece 100/100 y Production Real Readiness 95/100. F8 aún no se ejecutó contra provider; la autorización single-use continúa no consumida.

Siguiente bloque backend: `F8_EXECUTE_AUTHORIZED_BACKUP_RESTORE_CUTOVER_WHEN_SECURE_PROVIDER_EXECUTION_CHANNEL_IS_AVAILABLE`.
