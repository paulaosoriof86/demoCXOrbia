# REPORTE DE CORRECCIÓN — V138 (paquete R19 P0-1 — Postulaciones por periodo activo)

Baseline: `Prototype development request CXOrbia V137.zip`.

## Hallazgo corregido
`modules/postulaciones.js` listaba y contaba SIEMPRE `data._posts` de
TODOS los proyectos/periodos (solo acotado por país), violando "Postulaciones
solo debe mostrar el periodo activo". El checkbox "Ver históricas" ya
existía en el markup pero nunca estaba conectado a ningún filtro — no
hacía nada.

## Cambio
- KPIs superiores (Pendientes/Reprogramaciones/Aprobadas/Todas) y su
  detalle (`poKp`) ahora se calculan sobre `activePosts` (posts del
  `currentPeriodId`), no sobre todos los periodos — mismo criterio de
  paridad tile↔detalle del Gate 1.
- `search()` oculta, desde el primer render, cualquier postulación de
  un periodo distinto al activo; "Ver históricas" (ahora conectado)
  las revela explícitamente.

Verificado en runtime: KPI "Todas" = 17 (posts del periodo activo
`retail`), no 48 (17+15+16, suma de los 3 proyectos demo).

## Gate técnico
- Sintaxis: PASS.
- Runtime: 0 errores.
- Manifest V138 regenerado, 0 diffs.

## Pendiente (paquete R19)
P0-1 completo (función única `CX.data.visitFacets` con los 7 estados
ortogonales, columna "Periodo de medición") y P0-2 (jerarquía tenant/
proyecto configurable end-to-end) — alcance grande, no abordado.
