# Academia impact - Release readiness bridge TyA

Fecha: 2026-07-05

## Objetivo

Documentar impacto de Academia del bloque release readiness bridge sin ampliar cursos ahora ni desviar la correccion P0 pendiente de Claude.

## Conceptos que Academia debe cubrir despues del P0

1. Preview no es produccion.
2. Backend preview ready no significa source lock.
3. Gate apagado no es error: es control de salida segura.
4. Prototipo pendiente puede bloquear release aunque validadores backend pasen.
5. Missing input no es defecto del sistema si aun no existe fuente sanitizada.
6. Manual review required implica decision humana antes de avanzar.
7. Blockers deben resolverse por area, no ocultarse con textos comerciales.

## Roles impactados

- Super/admin: lectura de readiness, decisiones de salida, gates y aprobaciones futuras.
- Ops: entender si HR/source/lifecycle estan en preview, revision o bloqueados.
- Finanzas: entender liquidaciones como preview/revision/pago pendiente, no pago real.
- Shoppers: no deben ver mensajes que prometan envios o sync reales si son fallback/manual.
- Soporte: debe poder explicar blockers sin indicar que la plataforma fallo.

## Manuales a actualizar despues del P0

- Release readiness.
- Gate statuses.
- Preview vs produccion.
- Revision manual.
- Inputs faltantes.
- Bloqueos de prototipo.
- Diferencia entre backend preview y source lock.

## Interactividad futura

Academia debe incluir checklists cortos:

1. Antes de marcar un area como lista.
2. Antes de pedir activacion real.
3. Antes de indicar a usuarios que una accion fue enviada/sincronizada.
4. Antes de cerrar un blocker de prototipo.
5. Antes de pasar de preview a source lock.

## Prioridad

Este impacto queda acumulado. No debe ejecutarse antes de la correccion P0 de V87, porque Paula necesita acercarse a produccion controlada y Claude tiene capacidad limitada.
