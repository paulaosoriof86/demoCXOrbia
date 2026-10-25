# Visits admin actions contract - CXOrbia

Fecha: 2026-07-07

## Bloque completado

Se agrego contrato reusable para administracion operativa de visitas desde plataforma.

Archivo creado:

- `tools/contracts/cxorbia-visits-admin-actions-contract.mjs`

## Necesidad cubierta

El modulo de Visitas debe permitir resolver casos operativos sin depender de correcciones externas, sin manipular datos fuera de plataforma y sin usar el dashboard como lugar de parches.

Debe permitir:

- buscar visitas por proyecto, pais, franja, estado, shopper y fuente;
- corregir estado puntual con razon;
- bloquear disponibilidad con razon;
- desbloquear disponibilidad con razon;
- marcar revision requerida;
- ajustar ventana solo bajo regla configurable;
- restaurar visita disponible cuando corresponda.

## Acciones permitidas

- `search_visits`
- `correct_status`
- `block_availability`
- `unblock_availability`
- `mark_review_required`
- `adjust_window_by_rule`
- `restore_available`

## Estados requeridos

- `available`
- `assigned`
- `scheduled`
- `rescheduled`
- `completed`
- `questionnaire_done`
- `submitted`
- `blocked`
- `review_required`
- `cancelled`

## Reglas clave

- Toda accion debe estar limitada por tenant, proyecto y visita.
- No se permiten acciones globales sobre todas las visitas.
- Toda correccion de estado requiere razon y auditoria.
- Bloquear o desbloquear disponibilidad requiere razon y auditoria.
- Ajustar ventanas debe estar atado a regla configurable, no a criterio visual.
- Conflictos entre fuentes deben ir a revision humana.
- El dashboard solo debe dar drilldown al modulo correspondiente.
- Cambios reales a fuente externa quedan apagados hasta gate.

## Pendiente para Claude

Claude debe incorporar en Visitas:

- buscador por proyecto, pais, franja, estado, shopper y fuente;
- acciones puntuales con razon obligatoria;
- accion para bloquear/desbloquear disponibilidad;
- accion para marcar revision requerida;
- vista de conflicto o sync pendiente;
- historial/auditoria visible;
- copy claro para accion simulada, bloqueada, pendiente, revisada o confirmada;
- no prometer actualizacion real de fuente externa sin gate activo.

## Relacion con Phase A

Este bloque protege:

- visitas disponibles;
- salida de disponibilidad cuando ya existe asignacion;
- control de fechas y ventanas;
- visitas realizadas;
- cuestionario realizado;
- submitido;
- casos que requieren revision antes de afectar beneficios/liquidaciones.

## Clasificacion del bloque

### Reusable CXOrbia

Reusable para todos los clientes con visitas, agendas, estados y fuentes externas.

### Exclusivo cliente

No contiene reglas exclusivas del cliente actual.

### Claude/prototipo

Impacto directo en UI de Visitas, Admin, Shopper y Dashboard drilldown.

### Academia

Impacto indirecto en manuales operativos, rutas por rol y notificaciones asociadas a visitas.

### Sin impacto Claude

No aplica. Este bloque genera pendiente Claude.

## Estado seguro

Sin deploy, sin produccion real, sin merge final, sin Auth real, sin Firestore real, sin imports, sin sincronizacion real y sin datos sensibles.
