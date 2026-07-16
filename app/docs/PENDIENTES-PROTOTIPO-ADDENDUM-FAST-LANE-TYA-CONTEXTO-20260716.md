# PENDIENTES PROTOTIPO — FAST-LANE Y COHERENCIA TYA

Fecha: 2026-07-16

## Pendiente inmediato

No hay una nueva tarea para Claude antes de promover V156. El siguiente paso es backend/empalme: materializar V156 completa, reaplicar overlays explícitos y ejecutar gates.

## Revisión visual posterior a la promoción

Paula solo debe validar visualmente después de PASS automático. La revisión debe confirmar:

- un solo proyecto Cinépolis con sus periodos, no 14 proyectos duplicados;
- el cambio de periodo modifica Dashboard, Histórico, Hoja de ruta, Visitas, Postulaciones, Finanzas y Liquidaciones;
- MAY/JUN/JUL muestran información correspondiente al periodo seleccionado;
- los KPI no mezclan periodos ni fabrican tendencias;
- junio muestra cero visitas pendientes de ejecutar y mantiene pagos/liquidaciones pendientes;
- país, moneda y banderas siguen la configuración del proyecto/visita;
- no aparece data demo como fuente TyA;
- shoppers históricos y certificaciones conservadas siguen visibles según rol;
- Admin, Shopper y Cliente conservan navegación y permisos.

## Regla para cualquier hallazgo visual

- Un hallazgo real genera una correctiva focalizada sobre la baseline activa.
- No se reabre el mapeo HR completo, contratos, importadores, R11D, R14C, certificaciones ni bloques cerrados que pasaron gates.
- No se pide paquete nuevo por copy P1 o mejoras no bloqueantes antes de la salida Phase A.
- Solo un P0 reproducible puede bloquear producción.

## No corresponde a Claude

- IDs estables de proyecto/periodo.
- Bridge HR source-safe.
- Gates de KPI/histórico.
- Manifests, source locks y promoción atómica.
- Firestore/Auth/Storage/Make/Gemini.
- Importadores o reconciliación financiera.

## Academia

Debe existir contenido por rol sobre selección de proyecto/periodo, impacto en KPI e histórico, y validación de que la vista corresponde al contexto activo.

## Estado seguro

Documento solamente; sin UI modificada, deploy, producción, imports o writes.