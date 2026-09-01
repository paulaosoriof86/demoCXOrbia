# ACADEMIA — IMPACTO R18D PREVIEW VISIBLE V131

Fecha: 2026-07-15

## Impacto funcional

R18D no modifica cursos, manuales, rutas por rol, bancos de preguntas ni notificaciones.

## Conocimiento operativo preservado

- un enlace financiero exacto es un control conciliado, no un pago confirmado;
- los 92 casos abiertos permanecen en revisión humana;
- una certificación presentada no debe volver a solicitarse automáticamente mientras su carryover está pendiente de fuente estable;
- el preview source-safe no equivale a importación, materialización, runtime live o producción;
- los errores de contrato entre componentes deben bloquear el flujo visible y corregirse en la fuente frontend, no ocultarse desde backend.

## P0 técnico

La corrección `period: () => p` en el adapter local de `serieMensual()` no cambia la lógica pedagógica ni requiere actualizar contenido de Academia.

Clasificación: **Academia sin cambio de contenido; conocimiento operativo ya documentado se mantiene**.