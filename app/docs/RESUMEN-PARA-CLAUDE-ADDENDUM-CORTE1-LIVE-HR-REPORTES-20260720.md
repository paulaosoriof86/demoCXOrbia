# RESUMEN PARA CLAUDE — CORTE 1 LIVE HR Y REPORTES

Fecha: 2026-07-20
Estado: Corte 1 bloqueado por validación visual; no solicitar nueva candidata.

## Qué resolvió backend

- Demostró que V164 mostraba una copia HR congelada de build y no una lectura runtime viva.
- Preparó lectura server-side source-safe, endpoint JSON/JS/meta, revisión/frescura, watcher por foco/sondeo y binding al adapter canónico.
- Los probes read-only y predeploy pasaron sin escrituras ni deploy.
- No se tocó `app/modules/**` ni se cambió la interfaz pública de `CX.data`.

## Ajustes frontend/prototipo localizados

1. Dashboard operativo:
   - KPI y modal de detalle deben consumir exactamente la misma función de facets y la misma revisión de fuente.
   - `Sin submitir` nunca puede rotular filas como `Pend. cuestionario` si tienen cuestionario confirmado.
   - No fijar conteos de julio ni de ningún periodo; son datos vivos.

2. Reportes de administración:
   - Separar catálogo, constructor, renderer y exportador.
   - Editar debe permitir seleccionar/agregar/quitar/reordenar columnas y guardar una versión personalizada.
   - Exportar/Imprimir debe generar el reporte, no imprimir la página completa.

3. Reportes por cualquier rol:
   - Usar branding configurable del tenant: logo, colores y tipografía elegidos.
   - Incluir gráficas cuando la fuente lo permita.
   - Mantener alcance por rol, proyecto, periodo y país.

4. Portal cliente / Panorama:
   - Al cambiar periodo, todas las métricas y bloques deben reproyectarse.
   - Si falta score/cuestionario validado, mostrar bloque pendiente de fuente sin cifras que parezcan resultados reales.

## Reglas que Claude no debe reinterpretar

- HR runtime viva es fuente operacional de lectura.
- Lectura viva no equivale a sincronización bidireccional ni a importación.
- No hardcodear Cinépolis globalmente.
- No deduplicar por nombre.
- No mostrar snapshot vencido como `Listo`.
- No solicitar otra candidata antes de que backend despliegue y Paula revalide este mismo Corte 1.

## Academia

Actualizar manuales/cursos sobre:

- fuente viva vs snapshot;
- frescura y estado degradado;
- diferencia cuestionario/submitido;
- creación y personalización de reportes;
- exportación por rol y branding por tenant;
- lectura viva vs sincronización HR/plataforma.

## Estado seguro

Sin merge, producción, import real, escrituras HR/Firestore/Auth/Storage, Make/Gemini live ni pagos.
