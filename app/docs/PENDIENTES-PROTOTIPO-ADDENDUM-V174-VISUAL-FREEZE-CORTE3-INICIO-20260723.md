# PENDIENTES PROTOTIPO — V174 VISUAL FREEZE E INICIO CORTE 3

**Fecha:** 2026-07-23

## No bloqueantes aceptados

| Prioridad | Pendiente | Criterio de cierre |
|---|---|---|
| P1 | Algunas tablas y fichas no son plenamente responsive | Sin ancho rígido, sin overflow lateral involuntario, uso completo del viewport y prueba móvil/desktop |
| P1 | PDF no imprime gráficas | PDF contiene las gráficas visibles, filtros, proyecto, periodo, títulos y fuente |
| P2 | Excel sin formato | Encabezados, anchos, filtros, tipos, fechas, monedas y filas congeladas sin alterar datos |
| P2 | Telemetría `sourceAccessMode` conserva etiqueta anterior | Mostrar identidad técnica coherente con el endpoint same-origin y sin copy técnico al usuario |

## Regla

Estos pendientes no reabren V174, no bloquean el freeze de Corte 2A y no autorizan cambios frontend durante Corte 3. Se resolverán mediante delta incremental auditado.

## Corte 3 abierto

Pendiente real inmediato: reconciliar fuente financiera por llaves estables, separar liquidación/pago y producir review queue sanitizada. No marcar pagos por inferencia.
