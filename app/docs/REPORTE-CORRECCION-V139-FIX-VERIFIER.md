# REPORTE DE CORRECCIÓN — V139 (fix de regresión reportada por el verificador sobre V138)

Baseline: `Prototype development request CXOrbia V138.zip`.

## Regresión corregida
`modules/postulaciones.js` tenía un cap `.slice(0,8)` sobre los grupos
de sucursal, independiente del periodo/filtro/"Ver históricas" — con
17 postulaciones en el periodo activo, solo 8 quedaban en el DOM; las
otras 9 (incluidas 'pendiente') eran inalcanzables aunque el KPI
"Todas" ya mostrara 17 correctamente (divergencia tile↔lista real).

## Cambio
Se quita el cap `.slice(0,8)`: se renderizan TODOS los grupos de
sucursal (de todos los periodos); `search()` (ya corregido en V138)
sigue ocultando por defecto los de periodos distintos al activo y
revelándolos con "Ver históricas".

Verificado en runtime: 48 tarjetas totales en el DOM (todos los
periodos), 17 visibles por defecto (coincide con el periodo activo y
con el KPI "Todas").

## Gate técnico
- Sintaxis: PASS.
- Runtime: 0 errores.
- Manifest V139 regenerado, 0 diffs.
