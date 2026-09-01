# Settlements admin contract - CXOrbia

Fecha: 2026-07-07

## Bloque completado

Se agrego contrato reusable para administracion operativa de beneficios/liquidaciones desde plataforma.

Archivo creado:

- `tools/contracts/cxorbia-settlements-admin-actions-contract.mjs`

## Necesidad cubierta

El modulo de Beneficios / Liquidaciones debe permitir resolver casos operativos sin depender de correcciones externas ni de manipulacion manual fuera de la plataforma.

Debe permitir:

- buscar por proyecto, periodo, shopper, visita, estado y estado de monto;
- revisar montos calculados;
- aprobar una liquidacion para ciclo;
- programar liquidacion;
- confirmar liquidacion;
- reprogramar liquidacion;
- trasladar a periodo posterior;
- bloquear por revision;
- resolver vinculo faltante con visita cuando aplique.

## Acciones permitidas

- `search_settlements`
- `review_amounts`
- `approve_for_settlement`
- `schedule_settlement`
- `confirm_settlement`
- `reschedule_settlement`
- `carry_forward`
- `block_for_review`
- `resolve_visit_link`

## Estados requeridos

- `draft`
- `pending_review`
- `approved_for_settlement`
- `scheduled`
- `settled`
- `rescheduled`
- `carried_forward`
- `blocked_review`
- `cancelled`

## Estados de monto

- `not_calculated`
- `calculated`
- `manual_review`
- `approved`
- `blocked`

## Reglas clave

- Toda accion debe estar limitada por tenant, proyecto, periodo, shopper y liquidacion cuando aplique.
- No se permiten acciones globales sobre todos los shoppers o todos los periodos.
- Toda revision de monto requiere razon y auditoria.
- Confirmar liquidacion requiere rol finance o superadmin.
- Trasladar a otro periodo requiere razon y auditoria.
- Si falta vinculo con visita, debe resolverse antes de confirmar.
- Casos con conflicto deben ir a revision humana.
- No debe mezclarse visita ejecutada con liquidacion confirmada.

## Pendiente para Claude

Claude debe incorporar en Beneficios / Liquidaciones:

- buscador por periodo, shopper, visita, proyecto y estado;
- filtros por estado de monto;
- accion para revisar monto;
- accion para aprobar para ciclo;
- accion para programar, confirmar, reprogramar o trasladar;
- accion para bloquear por revision;
- accion para resolver vinculo con visita;
- razon obligatoria;
- historial/auditoria visible;
- copy claro separando visita realizada, cuestionario, submitido y liquidacion.

## Relacion con Phase A

Este bloque protege:

- corte inicial de junio;
- visitas ya ejecutadas;
- cuestionarios ya realizados;
- submitidos;
- beneficios visibles para shopper;
- control por periodo;
- no duplicar ni perder saldos al mover periodos.

## Clasificacion del bloque

### Reusable CXOrbia

Reusable para todos los clientes con beneficios o liquidaciones por visita/proyecto.

### Exclusivo cliente

No contiene reglas exclusivas del cliente actual.

### Claude/prototipo

Impacto directo en UI de Beneficios, Liquidaciones, Shopper y Admin.

### Academia

Impacto directo en manuales, rutas por rol y notificaciones sobre beneficios/liquidaciones.

### Sin impacto Claude

No aplica. Este bloque genera pendiente Claude.

## Estado seguro

Sin deploy, sin produccion real, sin merge final, sin Auth real, sin Firestore real, sin imports, sin sincronizacion real y sin datos sensibles.
