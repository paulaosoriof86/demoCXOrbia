# AUDITORÍA VISUAL R18E — NO-GO FUNCIONAL

Fecha: 2026-07-15

## Decisión

`NO_GO_R18E_VISUAL_BUSINESS_SEMANTICS`

Hosting DEV y smoke técnico R18D permanecen PASS, pero la revisión visual de Paula confirmó errores funcionales que no fueron cubiertos por el smoke anterior.

## Reglas confirmadas por Paula

- `Pendientes de realizar`: todas las visitas no realizadas del periodo activo, aunque estén sin shopper o sin agenda; excluir canceladas/archivadas.
- `Shopper activo`: cuenta activa con al menos una visita realizada dentro de los seis meses anteriores a la fecha de referencia del periodo activo.
- `Visitas disponibles/postulables`: visitas del periodo activo sin shopper asignado y no realizadas.
- País nuevo: debe habilitar bandera, moneda, alcance, filtros, shoppers, HR y operación.
- Cinépolis: frecuencia mensual; periodo de medición quincenal; la HR define la quincena de cada visita.

## Hallazgos visuales confirmados

1. KPI `Pend. realizar` muestra 25 y su modal muestra 0.
2. `Sin asignar` y `Sin agendar` no separan correctamente ausencia de shopper vs ausencia de fecha.
3. JUL 2026 seleccionado convive con títulos/filas de mayo o junio.
4. Cambiar periodo no actualiza todos los módulos.
5. Visitas Disponibles muestra visitas asignadas/realizadas en lugar de solo postulables.
6. Postulaciones conserva datos de otro periodo.
7. Los detalles de KPI no muestran periodo de medición/quincena.
8. Shoppers muestra 216 referencias protegidas como 216 activos y perfiles completos.
9. Shopper y cliente muestran el periodo como si fuera el proyecto; el shopper no puede seleccionar proyecto múltiple.
10. Dashboard Financiero mezcla análisis con creación de rubros y presenta series/narrativas sin fuente confirmada.
11. La configuración de tenant/proyecto/países no es localizable ni verificable operativamente.
12. PWA Windows muestra instrucciones manuales en vez del prompt nativo disponible mediante `beforeinstallprompt`.

## Diagnóstico de proceso

El smoke R18D comprobó render, consola y conteos generales de tres módulos. No verificó:

- paridad tarjeta/modal/tabla;
- clasificación ortogonal de estados;
- cambio real de periodo en todos los módulos;
- proyecto distinto de periodo por rol;
- reglas de visitas postulables;
- shoppers activos por ventana semestral;
- separación análisis/creación financiera;
- flujo nativo PWA.

Estos casos sí pueden y deben detectarse automáticamente mediante fixtures semánticos y pruebas cross-module. La revisión visual humana sigue siendo obligatoria para cierre de UX y navegación.

## Alcance Claude

Paquete: `cxorbia-claude-r19-cierre-operativo-visual-20260715`.

Cinco bloques P0:

1. estados/KPIs/detalles/periodo;
2. proyecto configurable, frecuencia, medición, HR y tenant;
3. shopper/cliente multiproyecto;
4. finanzas análisis vs creación;
5. PWA con prompt nativo y gates automáticos/visuales.

## Seguridad

Sin cambios runtime/backend en este registro. Sin producción, imports, Firestore/Auth/Storage/HR writes, Make, Gemini ni pagos.
