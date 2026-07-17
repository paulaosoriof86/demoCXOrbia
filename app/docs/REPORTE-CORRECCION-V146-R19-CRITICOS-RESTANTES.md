# REPORTE DE CORRECCIÓN — V146 (paquete R19 críticos restantes)

Baseline: `Prototype development request CXOrbia V145.zip`.

## 1. Periodo de medición por visita (Crítico 1.A)
`app/core/data.js`: nueva `CX.data.measurementWindow(v, ctx)` — prioriza
`v.quincena` (asignación explícita de la HR) sobre cualquier derivación
por fecha, nunca asume 50/50. Columna "Periodo de medición" agregada en:
- tabla operativa de Visitas (`modules/visitas.js`);
- modal de detalle de KPIs del Dashboard (`modules/dashboard.js`, `drill()`).

Verificado en runtime: columna presente y con valor real (quincena)
en ambos lugares, 0 errores.

## 2. Regresión de Finanzas (Crítico 3.B) — revisado, NO aplica
Se releyó `core/finanzas-core.js` línea por línea: `porPais(data)` usa
`data.period()` de forma genérica (recibe tanto el `CX.data` real como
el adapter local de `serieMensual()`) — es el diseño correcto, no una
regresión. El adapter de `serieMensual()` ya conserva simultáneamente
`project:()=>p, period:()=>p, visitas:()=>...` desde el hotfix V132.
No se requería ningún cambio; se confirma que la combinación protegida
sigue intacta.

## 3. PWA — prompt nativo en la primera interacción (Crítico 3.A)
`app/core/pwa.js`: se arma un listener de una sola vez
(`pointerdown`/`click`/`keydown`) apenas llega `beforeinstallprompt` —
antes `prompt()` solo se disparaba si el usuario encontraba y pulsaba
el botón de instalación explícito. Si el usuario rechaza, se guarda en
`localStorage` y no se vuelve a insistir en próximas cargas. Se
mantiene el botón discreto del topbar (V145) para reintentar.

Verificado en runtime: con `deferredPrompt` simulado, un solo
`pointerdown` dispara `prompt()` automáticamente.

## Gate técnico
- Sintaxis: PASS (`data.js`, `visitas.js`, `dashboard.js`, `pwa.js`).
- Runtime: 0 errores en 48 módulos × 3 roles.
- Manifest V146 regenerado, 0 diffs.

## Pendiente
- Crítico 1.B (Gate 2 revalidado contra fixture MAY/JUN/JUL con export
  rows incluido) — no ejecutado en esta ronda por alcance de tiempo.
- Crítico 2 (HR: mapping contract/llaves estables persistidos; gate de
  agregar Colombia con recarga) — no verificado en esta ronda.
