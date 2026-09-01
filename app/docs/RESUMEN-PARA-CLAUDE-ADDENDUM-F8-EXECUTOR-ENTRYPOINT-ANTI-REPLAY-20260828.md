# RESUMEN PARA CLAUDE — ADDENDUM F8 ENTRYPOINT Y ANTI-REPLAY

Fecha: 2026-08-28

Este bloque es exclusivamente backend/control-plane. Se añadió un entrypoint ejecutable y fail-closed para el one-shot F8 y protección local contra replay/concurrencia en el mismo checkout.

No se modificaron `app/modules`, `app/core`, layouts, copy, rutas, componentes, Academia ni comportamiento visual. No hay tarea frontend derivada de este repair.

El release funcional congelado permanece sin rebuild, redeploy ni reimport. Phase A continúa 100/100 y Production Real Readiness 95/100 hasta que F8 se ejecute y cierre en proveedor.

Clasificación: Sin impacto Claude.

Siguiente backend: `F8_EXECUTE_AUTHORIZED_BACKUP_RESTORE_CUTOVER_WHEN_SECURE_PROVIDER_EXECUTION_CHANNEL_IS_AVAILABLE`.
