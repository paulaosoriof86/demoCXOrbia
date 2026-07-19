# RESUMEN PARA CLAUDE — CORTE 0B R21

Estado: `R21_TECHNICAL_PASS_FRONTEND_DELTA_REQUIRED`

Backend y contratos R21 pasaron gates en el commit `287cd0729c14ef9dfe63ce566c6bc2ff8604f2a0`, run `29669735189`. No reinterpretar la HR.

## Cambios exclusivos de frontend

1. `app/core/router.js`: separar proyecto y periodo; selectores por proyectos activos/autorizados.
2. `app/modules/visita-detalle.js`: usar `CX.data.postulationEligibility()` y `CX.data.availableVisits()`; nunca mostrar `null`; bloquear fecha anterior, fuera de Q1/Q2 y franja incompatible.
3. `app/app.js`: usar `CX.tenantProfile`; DEV muestra todos los roles con `Accesos de validación`; producción oculta el bloque técnico y usa roles configurados.
4. Cliente: Academia y Capacitación por brechas deben ser rutas distintas.

## Verdad vinculante

Julio: 44 visitas, 39 asignadas, 5 sin asignar, 4 disponibles y 1 bloqueada por `P1Q`.

## Reglas

- Mantener interfaz pública de `CX.data`.
- No agregar llamadas directas a fuentes o proveedores.
- No usar localStorage como fuente operativa.
- No hardcodear TyA, Cinépolis, países, periodos o roles.
- UTF-8 sin BOM y sin PII.
- No rediseñar módulos no relacionados.

Entrega incremental, con lista exacta de archivos y pruebas. No incluir backend.
