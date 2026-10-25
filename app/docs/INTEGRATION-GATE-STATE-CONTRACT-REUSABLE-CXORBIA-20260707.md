# Integration gate state contract reusable - CXOrbia

Fecha: 2026-07-07

## Bloque completado

Se agrego contrato reusable de estados de gates para integraciones y proveedores CXOrbia.

Archivo creado:

- `tools/contracts/cxorbia-integration-gate-state-contract.mjs`

## Objetivo

Evitar que el prototipo muestre acciones reales o integraciones activas sin que exista autorizacion, configuracion y evidencia backend.

Este contrato ayuda a estandarizar los estados que Claude debe representar visualmente y que backend debe respetar antes de activar cualquier proveedor.

## Proveedores contemplados como patron reusable

- Firestore
- Auth
- Storage
- Make
- Gemini
- mensajeria
- email
- pagos
- fuente externa

## Estados permitidos

- `off`: proveedor apagado.
- `preview`: modo vista previa/simulacion controlada.
- `blocked_missing_config`: bloqueado por configuracion incompleta.
- `blocked_review_required`: bloqueado por revision humana pendiente.
- `ready_for_gate`: listo para autorizacion/gate.
- `active_controlled`: activo de forma controlada y documentada.
- `paused`: pausado sin perder configuracion.
- `failed`: fallo que requiere revision.

## Reglas clave

- Ningun proveedor debe pasar a `active_controlled` sin `authorizedBy`.
- Ningun proveedor debe pasar a `active_controlled` sin `evidenceRef`.
- Los estados bloqueados deben tener evidencia o reporte asociado cuando aplique.
- La UI debe mostrar estados honestos, no promesas de ejecucion real.
- Las transiciones deben ser explicitas y auditables.

## Clasificacion del bloque

### Reusable CXOrbia

Este contrato es reusable para todos los clientes y proveedores.

Aplica a cualquier tenant/proyecto que use Firestore, Auth, Storage, Make, Gemini, mensajeria, email, pagos o fuente externa.

### Exclusivo cliente

No contiene reglas exclusivas del cliente actual.

### Claude/prototipo

Claude debe incorporar estos estados como lenguaje visual reusable:

- apagado;
- preview/simulado;
- bloqueado por configuracion;
- bloqueado por revision;
- listo para gate;
- activo controlado;
- pausado;
- fallo/revision.

Debe evitar botones o mensajes que digan enviado, sincronizado, pagado o importado real si el estado no es `active_controlled` con evidencia backend.

### Academia

Academia debe explicar estos estados en cursos/manuales cuando afecten al usuario:

- por que una integracion aparece apagada;
- que significa preview;
- que debe revisar un admin;
- cuando una accion es real;
- que hacer si aparece bloqueado o fallo.

### Sin impacto Claude

No cambia UI directamente, pero genera pendiente para paquete Claude porque define estados visuales reutilizables.

## Estado seguro

La herramienta usa cambios sinteticos.

No hace deploy, no llama proveedores, no escribe base, no importa datos y no toca produccion.
