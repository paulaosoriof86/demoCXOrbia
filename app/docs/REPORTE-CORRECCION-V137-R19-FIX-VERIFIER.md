# REPORTE DE CORRECCIÓN — V137 (fix de regresión reportada por el verificador sobre V136)

Baseline: `Prototype development request CXOrbia V136.zip`.

## Regresión corregida
El fallback `p.periodo||p.name` en V136 mostraba el mismo texto para
proyecto y periodo cuando `p.periodo` es `undefined` (caso de los
seeds), duplicando "Proyecto Retail · periodo Proyecto Retail" —
exactamente el anti-patrón que el paquete R19 prohíbe.

## Cambio
`modules/midia.js` y `modules/cliente.js` (ambas ocurrencias de
"Panorama de"): fallback corregido a `p.periodo||p.ronda||p.name` — usa
el label corto de periodo ya existente en el modelo (`p.ronda`, p.ej.
"JUL 26") en vez de caer directo al nombre del proyecto.

Verificado en runtime: "Resultados de la marca · score ponderado por
programa · periodo JUL 26" (antes duplicaba el nombre del proyecto).
0 errores en shopper/cliente/admin.

## Gate técnico
- Sintaxis: PASS (`cliente.js`, `midia.js`).
- Runtime: 0 errores, periodo y proyecto ya no son el mismo texto.
- Manifest V137 regenerado, 0 diffs.
