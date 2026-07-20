# ACADEMIA IMPACT - V161C Y POST-GATES R21

Fecha: 2026-07-19

## Impacto funcional confirmado

V161C y el build canónico R21 quedaron técnicamente validados para comprobar visualmente:

- login por perfil tenant;
- separación proyecto/periodo;
- elegibilidad canónica de postulación;
- visitas y visita detalle sin estados `null`;
- cuatro oportunidades publicables y una bloqueada en julio;
- Academia Cliente separada de Capacitación;
- rutas por rol.

## Contenido que debe mantenerse alineado

Los manuales, cursos, lecciones, checklists y errores frecuentes deben explicar por rol:

- cómo identificar Proyecto y Periodo como controles distintos;
- por qué una visita sin shopper no siempre está disponible;
- cómo operan `Disponible desde`, franja y ventana de medición;
- por qué P1Q o una dependencia de periodo anterior bloquea la postulación;
- qué significa una advertencia en revisión frente a un error bloqueante;
- que una liquidación candidata no equivale a pago confirmado.

## Hallazgo de continuidad

La HR viva ya contiene agosto de 2026, pero Corte 0B está congelado técnicamente hasta julio. Academia no debe enseñar agosto como periodo activo de este corte antes de incorporarlo mediante un bloque controlado posterior al freeze.

## Estado

- No se requiere nueva candidata Claude ni nuevo contenido visual antes del Hosting DEV.
- La actualización final de capturas, botones y pasos se realiza después de la validación visual del build DEV aprobado.
- Advertencia shopper `209/216`: asunto de revisión operativa, no contenido para inferir identidades.

## Estado seguro

Sin Hosting DEV nuevo, sin producción, sin proveedores live, sin writes, sin imports y sin pagos.
