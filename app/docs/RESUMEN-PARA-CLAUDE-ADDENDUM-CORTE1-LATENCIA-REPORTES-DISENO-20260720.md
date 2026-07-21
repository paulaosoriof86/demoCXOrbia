# Resumen para Claude — Corte 1: latencia HR, reportes y diseño

Fecha: 2026-07-20

## Evidencia visual confirmada por Paula

1. La HR sí es la fuente viva: al agregar fecha de cuestionario cambia el KPI y al asignar shopper la visita desaparece de disponibles.
2. La actualización no ocurre al recargar manualmente; aparece después del refresco automático y puede tardar varios minutos.
3. Reportes Cliente volvió a habilitar PDF, Excel y PPT.
4. Reportes Admin sigue fallando: PDF imprime la página/catálogo completo y no el reporte seleccionado.
5. Panorama cambia la etiqueta del periodo, pero mantiene la misma información aparente cuando no existe fuente de scores.
6. Las solicitudes de diseño de reportes todavía no están implementadas.

## Causa frontend localizada

### Reportes Admin — app/modules/operacion-extra.js

- El botón PDF cierra el modal y ejecuta `window.print()`, por lo que imprime la página completa.
- La edición guarda notas y nombre de columna en localStorage, pero no aplica esos cambios al reporte exportado.
- El botón Excel genera CSV, aunque la UI lo presenta como Excel.
- Velocidad, calidad, hallazgos y score no pueden mostrarse con constantes o porcentajes fabricados cuando la fuente real no los entrega.

### Reportes Cliente — app/modules/cliente-extra.js

- La exportación básica volvió a funcionar.
- El PDF todavía usa una plantilla genérica y no la identidad configurada del tenant.
- Excel y PPT requieren la misma fuente, alcance y revisión que la pantalla.

### Panorama — app/core/cliente-data.js y app/modules/cliente.js

- Separar métricas operativas por periodo de score/NPS/secciones.
- Cuando falta fuente de cuestionario validado, mostrar pendiente de fuente sin KPIs numéricos aparentes como cero.
- Invalidar cache por `periodKey` y revisión live.

## Criterios de aceptación obligatorios para reportes

- Exportar solo el reporte seleccionado, nunca la página completa.
- Permitir elegir, ordenar, renombrar, ocultar y agregar columnas reales; notas y encabezado deben aparecer en la exportación.
- PDF, Excel y PPT deben contener las mismas filas y alcance de la vista activa.
- Aplicar logo del tenant, paleta, tipografía, encabezado, proyecto, periodo, país/sucursal, fecha de generación, fuente, pie y paginación.
- Incluir gráficas cuando correspondan: cumplimiento, cobertura, tendencia, distribución y comparativo.
- Usar una plantilla reusable configurable por tenant y proyecto; Cinépolis no se hardcodea.
- Aplicar el mismo estándar a Admin, Cliente, Shopper y demás roles según permisos.
- No inventar velocidad, calidad, hallazgos, scores, NPS ni liquidaciones si no existe fuente confirmada.

## Clasificación

- P0: Reportes Admin no exporta el reporte seleccionado y la edición no modifica el entregable.
- P0: no mostrar métricas fabricadas como reales.
- P1 bloqueante para aprobación visual: branding, tipografía, gráficas y consistencia multiformato.
- Backend: reducir el tiempo entre cambio HR y reproyección, sin escrituras ni producción.
- Academia: actualizar manuales después del cierre visual con flujo de exportación, personalización y estados de fuente.

## Estado seguro

Sin merge, producción, escrituras HR/Firestore/Auth/Storage, importaciones, pagos, Make o Gemini live.
