# Paquete Claude — Corte 1B: Reportes y Panorama

Estado: `P0_PROVEN_FRONTEND_FIX_REQUIRED`

## Alcance protegido

Corregir únicamente `app/modules/operacion-extra.js`, `app/modules/cliente-extra.js`, `app/core/cliente-data.js`, `app/modules/cliente.js` y `app/modules/cliente-insights.js` si aplica. Preservar V164, lectura HR viva, adapters, contratos, `CX.data`, Cloud Run y Hosting.

## 1. Reportes Admin

- PDF debe exportar solo el reporte seleccionado; queda prohibido usar `window.print()` sobre la página completa.
- La edición debe permitir elegir, ocultar, ordenar y renombrar columnas reales; notas y encabezado deben aparecer en la vista previa y exportaciones.
- Excel debe ser `.xlsx` real, no CSV renombrado.
- PPT debe contener portada, resumen, gráfica aplicable, tabla y nota de fuente.
- Velocidad, calidad, hallazgos, scores, NPS y liquidaciones quedan `Pendiente de fuente` cuando no exista fuente confirmada.

## 2. Diseño reusable

Aplicar a Admin, Cliente, Shopper y demás roles según permisos:

- logo, colores y tipografía configurados por tenant;
- proyecto, periodo, país/sucursal, alcance, fecha y fuente;
- encabezado, pie y paginación;
- gráficas de cumplimiento, cobertura, tendencia, distribución o comparativo cuando correspondan;
- misma identidad y mismas filas en PDF, Excel y PPT;
- cero hardcode de Cinépolis.

## 3. Panorama por periodo

- Cache mínima: `tenantId + projectId + periodKey + sourceRevision + mode`.
- Invalidar al cambiar periodo o revisión HR.
- Separar **Operación del periodo** de **Resultados de evaluación**.
- Mostrar visitas, realizadas, cuestionarios, submitidas y cobertura desde la proyección live.
- Sin fuente de score/NPS/secciones, mostrar un único estado `Pendiente de fuente`; no mostrar ceros aparentes como resultados.

## Gates

1. PDF sin sidebar, topbar, catálogo ni botones.
2. Excel `.xlsx` con Resumen y Datos.
3. Edición reflejada en PDF, Excel y PPT.
4. Cero métricas fabricadas.
5. MAY/JUN/JUL cambian datos operativos según `periodKey`.
6. Panorama, Dashboard y Reportes usan la misma revisión.
7. Cero cambios backend, adapters live, contratos, IAM o Hosting.

## Flujo de cierre

`DELTA CLAUDE → AUDITORÍA FOCALIZADA → APPLY_DELTA_DIRECTLY → GATES → HOSTING DEV → VALIDACIÓN VISUAL → FREEZE CORTE 1`
