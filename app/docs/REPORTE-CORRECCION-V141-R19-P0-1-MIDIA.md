# REPORTE DE CORRECCIÓN — V141 (paquete R19 P0-1 — Mi Día migrado a fuente única)

Baseline: `Prototype development request CXOrbia V140.zip`.

## Cambio
`modules/midia.js`: el detalle de los KPIs (Agendadas/Realizadas/Sin
asignar) usaba lambdas inline duplicadas frente a los tiles (que ya
venían de `data.kpis()`, unificado en V140). Ahora usa
`data.visitBucketFns` — mismo objeto que Dashboard y Visitas, cierra la
migración de los 3 módulos que consumían buckets de visita.

Verificado: sintaxis PASS, 0 errores en 48 módulos × 3 roles.

## Gate 5 (revisado, sin cambio de código)
Visitas Disponibles (shopper) ya filtra correctamente por
`v.estado==='disponible'` (equivalente a assigned=false, realized=false,
cancelled=false del paquete) — el diseño de mostrar TODOS los proyectos
a la vez es intencional y documentado (marketplace cruzado), no una
fuga de datos de otro periodo.

## Gate técnico
- Sintaxis: PASS.
- Runtime: 0 errores.
- Manifest V141 regenerado, 0 diffs.

## Pendiente (paquete R19)
Adopción de los 7 estados ortogonales nuevos (reemplazo semántico) y
P0-2 completo (jerarquía tenant/proyecto configurable end-to-end) — las
piezas más grandes, sin abordar.
