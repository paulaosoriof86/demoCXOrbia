# REPORTE DE CORRECCIÓN — V135 (paquete R19 — Gate 6, KPI Shoppers)

Baseline: `Prototype development request CXOrbia V134.zip`.

## Hallazgo corregido
KPI "Activos" en Shoppers usaba `s.estado!=='Pendiente'` — para una
`protected_reference` (sin campo `estado` en absoluto), la comparación
es `undefined!=='Pendiente'` → `true`, contándola como activa. Evidencia
adjunta: 216/216 shoppers "activos" en un runtime con referencias
protegidas mezcladas.

## Cambio
- `app/core/data.js`: nuevas funciones
  - `activeRefDate()`: fecha de referencia = cierre real del periodo si
    está cerrado/archivado, o fecha del sistema si el periodo está
    activo (nunca un literal fijo).
  - `shopperActivo(s, refDateISO)`: `protected_reference` nunca cuenta
    como activo; el resto requiere al menos 1 visita `realizada` dentro
    de los 6 meses previos a la fecha de referencia.
- `app/modules/shoppers.js`: KPI "Activos" → "Activos (6 meses)" usando
  `data.shopperActivo(s)`; se agrega KPI separado "Referencias
  protegidas" (antes mezcladas dentro de "Activos"); nota visible con
  la definición y la fecha de referencia usada.

Verificado en runtime (datos demo): 19 en el proyecto, 14 activos
(6 meses), 1 referencia protegida — ya no 19/19 "activos".

## Gate técnico
- Sintaxis: PASS (`data.js`, `shoppers.js`).
- Smoke: 48 módulos × 1 rol sin error (admin, donde vive Shoppers).
- Manifest V135 regenerado, 0 diffs.

## Pendiente (paquete R19)
P0-1 (semántica ortogonal completa de estados), P0-2 (jerarquía
tenant/proyecto configurable end-to-end) y P0-3.A (selector
proyecto≠periodo para shopper/cliente) siguen pendientes — alcance
mucho mayor.
