# Pendientes frontend addendum V87

Fecha: 2026-07-05

V87 no trae cambios de contenido frente a V86. No cambia baseline viva.

## Prioridad P0

Antes de salida controlada, corregir mensajes visibles que indican envio, sync o movimiento real cuando los gates siguen apagados.

Archivos a revisar:

- `modules/postulaciones.js`
- `modules/dashboard.js`
- `core/topbar.js`
- `modules/correo.js`
- `modules/academia.js`
- `core/automations.js`
- `core/manuales-data.js`
- `core/liquidacion.js`

Usar mensajes de estado honesto:

- pendiente backend
- preview
- requiere revision
- gate apagado
- fallback manual
- copia lista
- pendiente confirmacion manual
- correo preparado
- proveedor pendiente
- registro manual
- liquidacion candidata
- pago pendiente
- movimiento preview
- cuestionario realizado o completado pendiente revision

## P1 acumulado

- Incorporar `availableFrom` en agenda/reservas.
- Incorporar `outboxStatus` en notificaciones.
- Incorporar `mailboxId` en correo por usuario.
- Incorporar `formVersion` en postulaciones dinamicas.
- Incorporar `externalFolderRef` y `crmEntityId` en CRM/documentos.
- Mostrar readiness con estados preview, pending backend, missing input, review required y real gate off.
- Profundizar Academia despues de resolver P0.
- Separar Mis beneficios por honorario, Boleto, Combo, reembolso total, total y estado.

La proxima candidata debe demostrar delta real y se debe reauditar contra baseline inmediata.
