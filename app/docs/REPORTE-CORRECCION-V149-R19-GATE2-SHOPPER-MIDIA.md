# REPORTE DE CORRECCIÓN — V149 (paquete R19 Crítico 1.A — gate MAY/JUN/JUL + fix shopper Mi Día)

Baseline: `Prototype development request CXOrbia V148.zip`.

## Gate 2 ejecutado (equivalente demo de MAY/JUN/JUL)
Usando los 3 proyectos seed (retail=44, banca=30, food=34 visitas —
conteos distintos, igual que exige el fixture) se probó el cambio de
periodo activo y su propagación en el MISMO ciclo a: Dashboard, Mi Día,
Visitas, Postulaciones, Reservas, Shoppers, Finanzas, Movimientos.
`CX.data.ctx().periodId` coincide exactamente con el periodo
seleccionado en los 3 casos, y `CX.data.visitas().length` coincide con
el conteo esperado de cada proyecto (44/30/34) — sin arrastre del
periodo anterior.

## Hallazgo real encontrado y corregido en el proceso
`modules/midia.js` tiene DOS ramas de render para "Mi Día": la de
`role==='admin'` (ya corregida en V136/V137, muestra proyecto+periodo)
y la de **shopper**, que NUNCA mostraba proyecto ni periodo —
contradice directamente P0-3.A ("Shopper: mostrar el nombre real del
proyecto/programa... periodo activo por separado"). Corregido: la
rama shopper ahora usa el mismo patrón (`programBase` + periodo).

Verificado en runtime: shopper ve "Proyecto Banca" en Mi Día tras
cambiar el proyecto activo; 0 errores en 48 módulos × 3 roles.

## Gate técnico
- Sintaxis: PASS.
- Runtime: 0 errores.
- Manifest V149 regenerado, 0 diffs.

## Nota sobre el gate contra runtime source-safe real
Esta verificación usa los 3 proyectos demo del prototipo (sin acceso al
runtime Hosting DEV con datos reales de Cinépolis) — cubre la
propagación de periodo en la misma arquitectura y código que se
desplegaría, pero no sustituye una validación contra el entorno
source-safe real, que solo Paula/el proceso de empalme puede ejecutar.
