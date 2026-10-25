# RESUMEN PARA CLAUDE — Addendum Corte 1 / M1 congelado

Fecha: 2026-07-22

## Estado que Claude debe preservar

- Corte 1 / M1 quedó aprobado con P1/P2 documentados.
- Build funcional HR viva validado: `67c0943260f076f5686284ac509458ed5fd34dbd`.
- No reinterpretar HR, no regresar a snapshot congelado, no introducir recarga completa y no solicitar nueva candidata por rutina.
- Dashboard Admin, Panorama Cliente y reportes coinciden para julio 2026.
- El portal shopper retira visitas cuando HR asigna shopper.
- El bloqueo de Mis Reportes sin identidad verificable es correcto y debe preservarse.

## Tareas frontend localizadas

### 1. Visitas Admin — estado canónico

Archivo: `app/modules/visitas.js`.

Problema: la tabla usa `v.estado` directamente, mientras los KPI usan facets/buckets canónicos. Debe mostrar estados ortogonales coherentes con HR y Dashboard.

Validación esperada: para la misma visita y revisión, Dashboard, tabla, detalle, filtros y reportes muestran la misma semántica de asignación, agenda, ejecución, cuestionario y submitido.

### 2. Valores financieros ausentes

Archivos relacionados:

- `app/core/tya-phase-a-source-safe-preview.js`;
- `app/modules/visitas.js`.

Problema: un honorario ausente aparece como `Q 0`. No convertir ausencia en cero confirmado. Mostrar pendiente de fuente/no disponible.

### 3. Reasignar con fecha/franja

Archivo: `app/modules/postulaciones.js`.

El modal Reasignar debe mostrar fecha/franja vigentes y permitir conservarlas, cambiarlas o dejar pendiente de agendamiento. No borrar ni modificar fecha silenciosamente.

### 4. Exportar Postulaciones

Archivo: `app/modules/postulaciones.js`.

El botón existe sin listener. Debe exportar el periodo y alcance filtrado con revisión/fuente, sin datos protegidos no autorizados.

### 5. Eliminar `undefined`

Archivo: `app/modules/postulaciones.js`.

El teléfono ausente no puede mostrar el literal técnico. Usar copy source-safe según rol.

### 6. Reportes multiformato

Archivos/módulos:

- `app/modules/operacion-extra.js`;
- `app/modules/cliente-extra.js`;
- report kit/exportadores compartidos;
- `app/adapters/tya-corte1-report-projection-live.js` solo como fuente/proyección, sin reinterpretar datos.

Requisitos:

- Excel con diseño del tenant, anchos legibles, tablas y gráficas cuando correspondan.
- PowerPoint con logo real/autorizado, branding y etiquetas no ambiguas.
- PDF/Excel/PPT deben conservar una representación equivalente de la gráfica del preview.
- En Resumen ejecutivo, no usar dos categorías idénticas `2026-07`; distinguir país/serie.
- Catálogo de columnas completo por tipo de reporte y campos realmente disponibles.
- Mantener estados honestos `Pendiente de fuente` cuando no haya datos.

## No bloquear Corte 2

Estas tareas son P1/P2. No existe P0 nuevo ni se reabre M1. Se trabajan sobre la baseline vigente, por paquetes pequeños y localizados, mientras backend preserva el lock anti-regresión.

## Academia

Actualizar manuales/cursos para explicar:

- lectura HR viva y `sourceRevision`;
- cambio de periodo;
- refresco in-place;
- estados ortogonales;
- ausencia distinta de cero;
- personalización y alcance de reportes;
- reportes protegidos por identidad/rol.

## No tocar

No modificar mapper HR, contratos R20, runtime Cloud Run, workflows de deploy, gates backend, fuentes reales, secretos, datos sensibles, writes, Make/Gemini ni pagos.
