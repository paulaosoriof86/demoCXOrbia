# REPORTE DE CORRECCIÓN — V140 (paquete R19 P0-1 — fuente única de buckets de estado)

Baseline: `Prototype development request CXOrbia V139.zip`.

## Objetivo (impacto priorizado)
El paquete R19 exige "una sola derivación canónica" para KPIs, detalles,
tablas y flujo por fases — prohíbe "calcular el número con una función
y reconstruir el modal con otra". V133 corrigió esto puntualmente en
Dashboard (Gate 1); esta ronda elimina la CAUSA estructural: existían
al menos 3 copias manuales de los mismos filtros de bucket
(`CX.data.kpis()`, `dashboard.js`, `visitas.js`), cada una re-escrita a
mano — el mismo tipo de bug de V133 podía reaparecer en cualquier
módulo nuevo que copiara el patrón (como pasó en `visitas.js`, no
cubierto por el fix puntual anterior).

## Cambio
- `app/core/data.js`: nuevo `CX.data.visitBucketFns` — única fuente de
  las 10 definiciones de bucket (asignadas/sinAsignar/sinAgendar/
  agendadas/realizadas/pendRealizar/cuestPend/sinSubmitir/liquidadas/
  fueraRango). Se preserva la semántica EXACTA ya validada (no se
  cambia ningún número visible, solo se centraliza la definición).
- `CX.data.kpis()` reescrito para consumir `visitBucketFns` en vez de
  lambdas duplicadas inline.
- `modules/dashboard.js`: `k` (tiles) y `F` (filtros del modal de
  detalle) consumen ambos `data.visitBucketFns` — mismo objeto, cero
  posibilidad de divergencia futura.
- `modules/visitas.js`: `vKp` (detalle de KPIs de la tabla operativa)
  consume `data.visitBucketFns` en vez de sus propias lambdas — antes
  usaba `data.kpis()` para los tiles y lambdas propias para el detalle,
  la MISMA clase de bug del Gate 1 que nunca se había verificado en
  este módulo.

Verificado en runtime:
- Dashboard "Pend. realizar": tile 12 = detalle 12 (sin regresión).
- Visitas "Sin asignar": tile 7 = detalle 7 (antes no verificado,
  ahora garantizado estructuralmente por compartir la misma función).

## Gate técnico
- Sintaxis: PASS (`data.js`, `dashboard.js`, `visitas.js`).
- Runtime: 0 errores en 48 módulos × 3 roles.
- Manifest V140 regenerado, 0 diffs.

## Pendiente (paquete R19)
- Migrar `postulaciones.js`/`midia.js` a `visitBucketFns` (mismo
  patrón, menor riesgo visible pendiente de aplicar).
- Adoptar los 7 estados ortogonales NUEVOS del paquete (assigned/
  scheduled/realized/questionnaire/submitted/outOfRange/cancelled)
  como reemplazo semántico de estos buckets — esta ronda preserva la
  semántica actual para no romper KPIs ya validados; el cambio de
  semántica en sí sigue pendiente y es la pieza más grande de P0-1.
- Columna "Periodo de medición" en detalle/listado de visitas.
- P0-2 completo (jerarquía tenant/proyecto configurable end-to-end).
