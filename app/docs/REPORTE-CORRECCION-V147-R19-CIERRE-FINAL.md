# REPORTE DE CORRECCIÓN — V147 (paquete R19 cierre final sobre V146)

Baseline: `Prototype development request CXOrbia V146.zip`.

## 1. PWA — un solo propietario de `beforeinstallprompt` (Crítico 3.A)
`app/app.js` ya NO escucha `beforeinstallprompt` — antes había DOS
propietarios (`app.js` y `core/pwa.js`), riesgo de `prompt()` doble.
`core/pwa.js` queda como único dueño. `app.js` conserva solo la guía
discreta de iOS (Safari nunca expone el evento).

Verificado en runtime: disparando `beforeinstallprompt` + una
interacción, `prompt()` se llama exactamente 1 vez.

## 2. Finanzas protegida (Crítico 3.B)
`core/finanzas-core.js`: `porPais(data)` ahora usa `data.project()` en
vez de `data.period()`, tal como exige la combinación protegida para el
empalme sobre V131+R18D. El adapter de `serieMensual()` conserva
`project:()=>p, period:()=>p, visitas:()=>...` simultáneamente (sin
cambios, ya cumplía desde el hotfix V132).

## 3. Periodo de medición — sin columnas duplicadas (Crítico 1.B)
`core/data.js`: `measurementWindow()` prioriza los campos CANÓNICOS
(`measurementWindowId`/`measurementWindowLabel`) antes de caer a
`v.quincena` (compatibilidad legacy). `modules/visitas.js`: se elimina
la columna `Quincena` duplicada — queda una sola columna reusable
"Periodo de medición".

Verificado en runtime: columna "Periodo de medición" presente, columna
`Quincena` separada ya no existe, 0 errores en 48 módulos × 3 roles.

## Gate técnico
- Sintaxis: PASS (`app.js`, `core/finanzas-core.js`, `core/data.js`,
  `modules/visitas.js`).
- Runtime: 0 errores.
- PWA: 1 solo `prompt()` verificado.
- Manifest V147 regenerado, 0 diffs.

## Pendiente
- Crítico 1.A: gate MAY/JUN/JUL revalidado contra runtime source-safe
  real de Hosting DEV — no ejecutable en este entorno (solo datos
  demo disponibles aquí); Gate 2 con datos demo ya fue confirmado en
  V143.
- Crítico 2: mapping contract/llaves estables de HR + gate de agregar
  Colombia con recarga — no verificado en esta ronda.
