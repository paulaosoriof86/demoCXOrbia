# REPORTE DE CORRECCIÓN — V143 (paquete R19 P0-1 — migración a los 7 estados ortogonales)

Baseline: `Prototype development request CXOrbia V142.zip`.

## Cambio (el más grande y de mayor riesgo del paquete R19)
`app/core/data.js`: nueva `CX.data.visitFacets(v)` — deriva 7 facetas
ortogonales por visita (assigned/scheduled/realized/questionnaire/
submitted/outOfRange/cancelled) desde los campos reales de la visita
(`shopperId`, `agendada`, `realizada`, `cuestFecha`, `submit`, `estado`,
`_archived`). `CX.data.visitBucketFns` (fuente única ya creada en V140)
se reescribe para derivar TODOS los buckets desde estas facetas, con
la semántica EXACTA confirmada por Paula en el paquete:

- **Pendientes de realizar** = todas las visitas del periodo activo que
  aún no se han realizado, aunque estén sin shopper o sin agenda — se
  excluyen únicamente canceladas/archivadas (antes solo contaba
  asignada+agendada, subcontando el bucket).
- **Sin asignar** ya no excluye artificialmente `fuera_rango` — puede
  coexistir con `fueraRango` (antes eran mutuamente excluyentes por
  error).
- `fueraRango` puede coexistir con `sinAsignar`/`sinAgendar`/
  `pendRealizar`, sin exclusividad forzada.

Como `dashboard.js`, `visitas.js` y `midia.js` ya consumían
`visitBucketFns` (V140-V141), la nueva semántica se propaga
automáticamente a los 3 módulos sin tocarlos de nuevo.

## Validación del Gate 1 — fixture de 6 casos (A–F) del paquete
Se probaron literalmente los 6 casos de la matriz del Gate 1 (sin
shopper/sin agenda/sin realizar/sin cuest/sin submit/fuera de rango,
en sus combinaciones A–F) contra `CX.data.visitBucketFns`: **los 6
casos coinciden exactamente** con el resultado esperado del paquete,
incluido el caso F (fuera de rango + sin asignar → sinAsignar +
pendRealizar + fueraRango simultáneos).

Verificado además en runtime con datos reales: "Pend. realizar" pasa
de 12 (semántica vieja, solo asignada+agendada) a 29 (semántica nueva,
incluye sin asignar/sin agendar/fuera de rango no realizados) sobre el
mismo proyecto — el número CAMBIA intencionalmente porque la definición
vieja subcontaba.

## Gate técnico
- Sintaxis: PASS (`data.js`).
- Runtime: 0 errores en 48 módulos × 3 roles.
- Fixture Gate 1 (6/6 casos): PASS.
- Manifest V143 regenerado, 0 diffs.

## Pendiente (paquete R19)
- Columna "Periodo de medición" (quincena vía HR) en detalle/listado
  de visitas — no implementada.
- Gate 2 (cambio de periodo propaga a todos los módulos en el mismo
  ciclo) — no re-verificado tras este cambio de semántica.
- Gate 3/4 completos (selector proyecto≠periodo end-to-end en todos los
  submódulos shopper, wizard con HR externa persistida con mapping
  contract) — parcialmente cubiertos en rondas anteriores.
