# REPORTE DE CORRECCIÓN — V136 (paquete R19 — Gate 3 parcial, proyecto≠periodo en shopper/cliente)

Baseline: `Prototype development request CXOrbia V135.zip`.

## Hallazgo corregido
`modules/cliente.js` (Panorama) y `modules/midia.js` (Mi Día) mostraban
`p.name` — el campo crudo del PERIODO (`data.period()`) — como si fuera
el nombre del proyecto/programa. Con periodos nombrados por mes (p.ej.
"Julio 2026"), el título mostraría "Panorama de Julio 2026" en vez del
proyecto real, exactamente el anti-patrón señalado en el paquete.

## Cambio
- `cliente.js`: "Panorama de {proyecto}" ahora usa
  `CX.data.programBase(p)` (nombre real del programa, sin tokens de
  mes/país/quincena) y agrega "· periodo {p.periodo||p.name}" aparte.
- `midia.js`: el saludo de Mi Día usa `data.programBase(p)` + periodo
  separado, en vez de `p.name` crudo.
- El selector de proyecto/periodo en el riel lateral (`router.js`) ya
  distinguía programa vs periodo y ya ofrecía selector de proyecto a
  shopper/cliente con más de un programa — se confirmó sin regresión.

Verificado en runtime: "Panorama de Proyecto Retail" (antes mostraría
el nombre crudo del periodo si difiriera del proyecto). 0 errores en
shopper/cliente/admin.

## Gate técnico
- Sintaxis: PASS (`cliente.js`, `midia.js`).
- Smoke: sin error en los 3 roles.
- Manifest V136 regenerado, 0 diffs.

## Pendiente (paquete R19)
P0-1 (semántica ortogonal completa de estados con
`CX.data.visitFacets`), P0-2 (jerarquía tenant/proyecto/frecuencia/
medición/HR configurable end-to-end + ruta admin de tenant/países) —
alcance grande, no abordado en esta sesión.
