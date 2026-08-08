# Email traceability and configuration Phase A TyA

Fecha: 2026-07-04

## Objetivo

Incorporar correo a Phase A como canal configurable de trazabilidad, sin conectar cuentas reales ni leer/enviar correos en este bloque.

Aunque TyA use poco correo para operacion diaria, internamente puede usarse para seguimiento, soporte, clientes, pagos, capacitacion o solicitudes. Por eso debe quedar preparado para trazabilidad.

## Contrato creado

- `app/contracts/email-traceability-phase-a.tya.contract.json`

## Validador creado

- `tools/migration/tya-email-traceability-contract-validator.mjs`

## Decision

El correo debe manejarse como trazabilidad auditable, no como mensajes aislados ni como integracion activa sin autorizacion.

La plataforma debe permitir, en fases futuras:

- vincular cuenta de correo por tenant, proyecto o equipo;
- registrar correos manualmente cuando no haya integracion;
- asociar hilos/correos a postulaciones, visitas, shoppers, clientes, soporte, capacitacion, liquidaciones o pagos;
- preparar borradores o plantillas;
- conservar metadata y trazabilidad;
- proteger datos sensibles;
- diferenciar correo manual, proveedor conectado futuro y gate bloqueado.

## Alcance Phase A

En Phase A queda preparado/documentado:

- configuracion de cuenta de correo;
- proveedor futuro: Gmail, Outlook, IMAP/SMTP o log manual;
- estados de cuenta;
- estados de trazabilidad;
- relacion con entidades operativas;
- politicas de almacenamiento de cuerpo y adjuntos;
- impacto Academia/manuales.

No queda autorizado:

- OAuth real;
- lectura real de correos;
- envio real de correos;
- almacenamiento de cuerpos completos;
- almacenamiento de adjuntos;
- escritura Firestore real.

## Estados de cuenta

- `not_connected`
- `configured_manual_only`
- `connection_requested`
- `oauth_pending_future`
- `connected_future`
- `connection_error_future`
- `disabled`
- `revoked`

## Estados de trazabilidad

- `draft_log`
- `manual_logged`
- `linked_to_entity`
- `needs_classification`
- `requires_contact_review`
- `requires_privacy_review`
- `ignored_or_archived`
- `future_synced_from_provider`
- `future_sent_from_provider`
- `blocked_by_gate`

## Entidades relacionadas

Un correo puede asociarse en el futuro a:

- postulacion;
- asignacion;
- visita;
- shopper;
- cliente;
- proyecto;
- soporte;
- solicitud de capacitacion;
- liquidacion;
- pago;
- curso/manual Academia;
- gestion general del tenant.

## Politicas de cuerpo y adjuntos

Para proteger informacion sensible, el contrato define politicas:

### Cuerpo del correo

- `metadata_only`
- `snippet_only`
- `redacted_body_future`
- `full_body_requires_policy_future`
- `external_reference_only`

### Adjuntos

- `do_not_store`
- `metadata_only`
- `storage_requires_review_future`
- `external_reference_only`

No se deben almacenar cuerpos completos ni adjuntos sin politica de privacidad y seguridad aprobada.

## Relacion con notification outbox

Correo y notification outbox son modulos relacionados, pero separados.

- Notification outbox: notificaciones in-app, WhatsApp Web, Make/mensajeria futura.
- Email traceability: correos/hilos/borradores/logs asociados a gestiones.

Pueden compartir evento y entidad relacionada, pero no deben mezclarse como si fueran el mismo canal.

## Gaps detectados

- Correo no estaba explicitamente incorporado a Phase A.
- Falta decidir si el primer paso sera log manual o connector futuro.
- Falta politica de privacidad para cuerpo/adjuntos.
- Falta definir visibilidad por rol de correos asociados a clientes/shoppers/proyectos.
- Falta manual Academia de trazabilidad por correo.

## Pendientes backend

- Definir schema final de email account por tenant.
- Preparar manual email log sin integracion real.
- Preparar futuro connector Gmail/Outlook sin activar.
- Definir politica de almacenamiento y redaccion.
- Integrar emailTraceLinks con soporte, clientes, visitas, postulaciones, liquidaciones y Academia.

## Pendientes prototipo

- Configuracion de correo por tenant/proyecto/equipo.
- Vista de trazabilidad por correo en gestiones relevantes.
- Log manual de correo.
- Estados honestos: no conectado, manual, futuro OAuth, bloqueado por gate.
- No mostrar lectura/envio real si no esta autorizado.

## Impacto Academia

Academia debe explicar:

### Admin / superadmin

- Como configurar correo.
- Que significa log manual vs integracion futura.
- Que datos se pueden guardar.
- Como asociar un correo a una gestion.
- Como proteger privacidad.

### Operativo

- Como registrar seguimiento por correo.
- Como vincular correo a visita, shopper, cliente o soporte.
- Como saber si un correo esta pendiente de clasificacion.

### Cliente / consultora / aliado

- Como la trazabilidad por correo mejora seguimiento y auditoria.

## Estado seguro

- Sin cambios frontend.
- Sin runtime.
- Sin Firestore writes.
- Sin OAuth real.
- Sin lectura de correos.
- Sin envio de correos.
- Sin Storage real.
- Sin deploy.
- Sin produccion.
