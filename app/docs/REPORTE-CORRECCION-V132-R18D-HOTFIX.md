# REPORTE DE CORRECCIÓN — V132 (R18D P0 hotfix focalizado)

Baseline: `Prototype development request CXOrbia V131.zip` (commit runtime `d5c04054d445723dd0bc9e48acbab75953a4b08b`).

## Único cambio funcional

`app/core/finanzas-core.js` — función `serieMensual(p,c)`: el adapter
local pasado a `porPais()` omitía `project()`. Agregado
`project: () => p` junto al `period()` ya existente, sin cambiar
ninguna otra semántica.

Ningún otro archivo funcional fue modificado.

## Validaciones ejecutadas
1. `node --check` equivalente (parseo de función) sobre
   `finanzas-core.js`: PASS.
2. Administración → Financiero renderiza sin
   `TypeError: data.period is not a function` (verificado en runtime,
   `#view` con contenido, 0 errores de consola).
3. No se tocó `liquidacion.js`, `modules/finanzas.js` ni ningún otro
   core/módulo.
4. Manifest V132 regenerado (delta de 1 archivo sobre V131), 0 diffs
   fuera del delta declarado.

## Archivos modificados
- `app/core/finanzas-core.js` (único cambio funcional)
- `app/core/build-lock.js` (regenerado, automático)
- `app/docs/MANIFEST-V132.json` (nuevo)
- `app/docs/REPORTE-CORRECCION-V132-R18D-HOTFIX.md` (nuevo, este archivo)
