# REPORTE DE CORRECCIÓN — V142 (paquete R19 P0-2 — frecuencia/medición en el wizard)

Baseline: `Prototype development request CXOrbia V141.zip`.

## Hallazgo corregido
El wizard de creación de proyecto (`proyecto-wizard.js`) no capturaba
frecuencia del programa ni periodo de medición — la ficha del proyecto
(`proyectos.js`) ya tenía estos campos (`periodicidad`/`periodoCumpl`,
editables post-creación) pero un proyecto recién creado por wizard
siempre arrancaba sin ellos definidos.

## Cambio
`modules/proyecto-wizard.js` (paso 4): se agregan selects de
"Frecuencia del programa" (mensual/bimensual/trimestral/semestral/
anual/campaña) y "Periodo de medición" (igual a la frecuencia/semanal/
quincenal/mensual/personalizado) + campo opcional de ventanas de
medición. `create()` mapea estos valores a los campos YA existentes que
lee la ficha (`periodicidad`, `periodoCumpl`) — sin duplicar
vocabulario ni crear una fuente paralela.

Verificado en runtime: creado un proyecto con frecuencia=trimestral,
medición=mensual → `periodicidad:"Trimestral"`,
`periodoCumpl:"Mensual"` en el proyecto persistido, visibles y editables
después en la ficha (Configuración del proyecto).

## Gate técnico
- Sintaxis: PASS.
- Runtime: creación de proyecto end-to-end sin error, campos
  persistidos correctamente.
- Manifest V142 regenerado, 0 diffs.

## Pendiente (paquete R19)
- Gate 4 completo: falta URL general de HR externa + mapping contract
  + modo de sincronización explícitos en el wizard (hoy solo el
  origen/etiqueta, ya presentes en la ficha vía Fuente de HR).
- Adopción de los 7 estados ortogonales nuevos como reemplazo semántico
  (P0-1, pieza más grande restante).
- Ruta admin de tenant/países completamente separada de Configuración
  → países (ya existe parcialmente, revisar si necesita ruta propia).
