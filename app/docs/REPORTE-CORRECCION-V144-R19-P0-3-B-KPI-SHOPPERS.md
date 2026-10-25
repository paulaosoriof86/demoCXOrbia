# REPORTE DE CORRECCIÓN — V144 (paquete R19 P0-3.B — KPI Shoppers, segmentación completa)

Baseline: `Prototype development request CXOrbia V143.zip`.

## Hallazgo corregido
El paquete exige separar al menos: referencias protegidas, cuentas
activas, cuentas inactivas, perfiles completos, perfiles incompletos.
V135 ya había corregido "activas" (ventana 6 meses) y separado
protegidas, pero faltaban "inactivas" y "perfiles completos" como
tiles explícitos.

## Cambio
`modules/shoppers.js`: se agregan tiles "Inactivas" (perfil real, sin
visita realizada en los 6 meses de referencia) y "Perfiles completos"
(perfil real con `perfilCompleto=true`), con su detalle correspondiente
en `tkMap`. Los 5 conjuntos quedan mutuamente consistentes: activos +
inactivas + protegidas = total; completos + incompletos = total menos
protegidas.

Verificado en runtime: 15 total = 10 activos + 4 inactivas + 1 protegida.

## Gate técnico
- Sintaxis: PASS.
- Runtime: 0 errores, aritmética de segmentos consistente.
- Manifest V144 regenerado, 0 diffs.

## Nota
"Bloqueados/pendientes" no se agrega — la fuente de datos de este
prototipo (mock) no informa ese estado; el paquete lo condiciona
explícitamente a "si la fuente lo informa".
