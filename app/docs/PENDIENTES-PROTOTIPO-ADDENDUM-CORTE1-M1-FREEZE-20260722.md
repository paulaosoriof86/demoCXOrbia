# PENDIENTES PROTOTIPO — Addendum Corte 1 / M1 congelado

Fecha: 2026-07-22  
Prioridad: P1/P2 no bloqueantes de M1

## P1 — Operación canónica

1. `app/modules/visitas.js`
   - La columna Estado debe usar facets canónicas, no `v.estado` crudo.
   - Filtros, badges, detalle y exportación deben usar la misma semántica que Dashboard.
   - No mostrar `Q 0` cuando el honorario está ausente de la fuente.

2. `app/core/tya-phase-a-source-safe-preview.js`
   - Preservar `null` para honorario, boleto y combo ausentes.
   - Cero únicamente cuando la fuente confirme cero.

## P1 — Postulaciones

3. `app/modules/postulaciones.js`
   - Reasignar debe incluir fecha/franja vigente y opciones conservar/cambiar/pendiente.
   - Implementar Exportar para el periodo y filtros activos.
   - Reemplazar `undefined` visible por copy source-safe.
   - No afirmar HR sincronizada si el runtime sigue read-only.

## P1 — Reportes multiformato

4. Exportadores Admin/Cliente
   - Excel con branding, anchos legibles, tabla y gráfica.
   - PowerPoint con logo real/autorizado y branding del tenant.
   - PDF/PPT/Excel con representación equivalente de visualizaciones.
   - Resumen ejecutivo: distinguir país/serie en la gráfica; no repetir dos categorías `2026-07` sin contexto.
   - Catálogo de columnas por reporte/fuente, con todas las opciones disponibles y autorizadas.
   - Respetar notas/encabezado y orden de columnas en todos los formatos.

5. Shopper / Mis Reportes
   - Preservar bloqueo fail-closed sin identidad.
   - Validar contenido únicamente con Auth/RBAC e identidad shopper verificable.

## P2

6. Dashboard
   - Eliminar duplicación `GT/HN · GT HN` en subtítulo.

7. Reportes & KPI
   - Definir y mostrar fórmula/fuente del KPI Efectividad.
   - Uniformar fecha/hora y `sourceRevision` en exportaciones.

## Validación esperada

- No cambia la lectura HR ni el build funcional congelado de M1.
- No se introduce recarga completa.
- No se mezclan periodos ni revisiones.
- Ningún dato ausente se convierte en cero.
- Ningún reporte expone información de otro usuario.
- Los pendientes se atienden dentro de Corte 2 y del carril transversal de reportes, sin solicitar nueva candidata por rutina.
