# Visit lifecycle contract - CXOrbia Phase A

Fecha: 2026-07-08

## Bloque completado

Se creo contrato preview-only para ciclo de vida de visita: disponibilidad, reserva, agendamiento, reprogramacion, cancelacion, realizada, cuestionario completado y revision de submitido.

Archivo creado:

- `tools/contracts/cxorbia-visit-lifecycle-contract.mjs`

## Objetivo Phase A

Phase A requiere que el flujo operativo de visitas sea controlado por estados y llaves estables, sin depender de coincidencias visuales ni parches UI.

Este contrato prepara el backend para validar acciones sin escribir aun en HR, Firestore, Storage, Make o proveedores reales.

## Acciones soportadas

- `preview_availability`;
- `request_reservation`;
- `request_schedule`;
- `request_reschedule`;
- `request_cancel`;
- `mark_realized_preview`;
- `mark_questionnaire_completed_preview`;
- `mark_submit_review_preview`;
- `export_visit_lifecycle_report`.

## Estados resultantes

- `availability_preview`;
- `reservation_review_required`;
- `schedule_review_required`;
- `reschedule_review_required`;
- `cancel_review_required`;
- `realized_preview`;
- `questionnaire_completed_preview`;
- `submit_review_preview`;
- `report_ready`;
- `blocked_gate`.

## Que valida

El contrato valida:

- `tenantId`;
- `projectId`;
- `visitId`;
- `shopperId` cuando aplica;
- `assignmentSource` estable;
- `franja`;
- `quincena`;
- `visitDate` en formato ISO cuando aplica;
- `submitDate` para revision de submitido;
- `reason` para cancelacion o reprogramacion;
- bloqueo de `execute: true`;
- bloqueo de escrituras reales HR/base/notificacion.

## Llaves estables

El contrato prioriza:

- `tenantId`;
- `projectId`;
- `visitId`;
- `shopperId`;
- `assignmentSource`.

Estas llaves deben evitar deduplicacion por coincidencia visual simple.

## Reglas de seguridad

El contrato no ejecuta:

- deploy;
- produccion;
- proveedor externo;
- HR writes;
- escrituras de base;
- importaciones;
- notificaciones reales.

## Por que importa

Permite preparar la salida Phase A sin mezclar logica backend dentro de modulos UI.

Tambien separa:

- visita reservada;
- visita agendada;
- visita realizada;
- cuestionario completado;
- cuestionario submitido/revision;
- liquidacion/pago posterior.

## Pendientes Claude/prototipo

Claude debe reflejar este patron sin conectar backend real:

- mostrar estados de visita sin prometer sync real;
- diferenciar reservar/agendar/reprogramar/cancelar;
- mostrar franja y quincena con reglas por proyecto;
- distinguir realizada de cuestionario completado;
- distinguir cuestionario completado de submitido;
- no usar `enviado` para cuestionario si solo esta completado;
- mostrar razon obligatoria para reprogramacion/cancelacion;
- evitar duplicacion visual de visitas por HR/plataforma.

## Academia

Academia debe explicar:

- flujo de visita completo;
- diferencia entre reservar, agendar y realizar;
- reglas de franja WK/WKND o configuracion por proyecto;
- reglas de quincena Q1/Q2 o configuracion por proyecto;
- diferencia entre cuestionario completado y submitido;
- errores frecuentes: fecha fuera de rango, cambio sin razon, duplicacion visual, submitido confundido con completado.

## Clasificacion

### Reusable CXOrbia

Si. Es patron reusable para field operations multi-tenant.

### Exclusivo cliente

No. Franja/quincena pueden venir de TyA pero quedan configurables por proyecto.

### Claude/prototipo

Si. Requiere UI de estados, badges, copy honesto y manejo de razones.

### Academia

Si. Impacta cursos, instructivos, manuales y glosario.

### Sin impacto Claude

No aplica.

## Estado seguro

Sin runtime app, sin deploy, sin produccion, sin proveedores reales, sin HR writes, sin base real, sin imports reales y sin datos sensibles.
