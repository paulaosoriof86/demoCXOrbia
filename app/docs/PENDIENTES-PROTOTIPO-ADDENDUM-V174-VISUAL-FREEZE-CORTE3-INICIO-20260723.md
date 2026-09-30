# PENDIENTES PROTOTIPO — V174 Y CORTE 3

**Fecha:** 2026-07-23

## Pendientes visuales no bloqueantes

| Prioridad | Pendiente | Criterio de cierre |
|---|---|---|
| P1 | Algunas tablas y fichas no son plenamente responsive | Sin ancho rígido, sin overflow involuntario, uso correcto del viewport y prueba móvil/desktop |
| P1 | PDF no imprime gráficas | PDF contiene gráficas visibles, filtros, proyecto, periodo, títulos y fuente |
| P2 | Excel sin formato | Encabezados, anchos, filtros, tipos, fechas, monedas y filas congeladas sin alterar datos |
| P2 | `sourceAccessMode` conserva etiqueta anterior | Identidad técnica coherente con endpoint same-origin y sin copy técnico al usuario |

## Corte 3 — pendientes funcionales

1. Crear snapshot financiero canónico source-safe.
2. Conectar un adapter único manteniendo la interfaz de `CX.data`.
3. Alinear Finanzas y Beneficios con esa única verdad.
4. Separar liquidación de pago confirmado.
5. Mostrar conflictos y review queue sin sobrescritura silenciosa.
6. Probar honorario, boleto, combo/reembolso, total y moneda.
7. Ejecutar gates UI/exportaciones y validación visual en Hosting DEV.

## Reglas protegidas

- `visitId` usa identidad estable R20 por fila canónica.
- Un enlace financiero exacto no significa pago.
- `liquidada`, realizada, cuestionario o submitido no equivalen a `paid`.
- Casos ambiguos no se resuelven por nombre.
- Datos bancarios crudos no se suben al repositorio.

## Estado actual

Conciliación backend Corte 3: PASS técnico revisado con 209 enlaces exactos, 38 filas en revisión y 79 entradas en review queue. Pagos confirmados por este bloque: 0.

Estos pendientes no reabren V174 ni autorizan una nueva candidata general.
