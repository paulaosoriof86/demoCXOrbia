# REPORTE DE CORRECCIÓN — V134 (paquete R19 — label admin ≠ shopper para "Visitas")

Baseline: `Prototype development request CXOrbia V133.zip`.

## Hallazgo corregido
El id de módulo `visitas` usaba un único label estático "Visitas
Disponibles" para dos vistas de contenido completamente distinto:
- **Shopper:** sí lista solo oportunidades postulables (correcto).
- **Admin:** es la base operativa completa (todos los estados,
  publica/asigna/edita cada visita) — llamarla "Visitas Disponibles"
  era engañoso, tal como señaló la evidencia (nav decía "Visitas
  Disponibles", el título interno ya decía "Visitas").

## Cambio
- `app/core/config.js`: `label` de `visitas` ahora es
  `(role)=>role==='shopper'?'Visitas Disponibles':'Visitas'`.
- `app/core/router.js`: nav lateral y breadcrumb resuelven `m.label`
  como función cuando aplica (compat total con módulos que siguen
  usando label como string).

Verificado en runtime: admin ve "Visitas" en nav y breadcrumb; shopper
ve "Visitas Disponibles" en ambos. 0 errores en 48 módulos × 3 roles.

## Gate técnico
- Sintaxis: PASS (`config.js`, `router.js`).
- Smoke 48×3: sin error.
- Manifest V134 regenerado, 0 diffs.

## Pendiente (paquete R19, ver V133 para el detalle completo)
Los bloques P0-1 (semántica ortogonal de estados), P0-2 (jerarquía
tenant/proyecto configurable), P0-3.A (selector proyecto≠periodo
shopper/cliente) y P0-3.B (KPI Shoppers ventana 6 meses) siguen
pendientes — alcance mucho mayor, requieren continuar por prioridad.
