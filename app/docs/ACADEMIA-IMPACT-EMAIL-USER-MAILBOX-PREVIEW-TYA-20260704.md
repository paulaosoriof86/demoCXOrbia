# Academia impact - Email user mailbox preview TyA

Fecha: 2026-07-04

## Bloque relacionado

- `app/contracts/email-user-mailbox-preview-phase-a.tya.contract.json`
- `tools/migration/tya-email-user-mailbox-preview-validator.mjs`
- `app/docs/EMAIL-USER-MAILBOX-PREVIEW-VALIDATOR-PHASE-A-TYA-20260704.md`

## Objetivo Academia

Convertir la configuracion de email por usuario en aprendizaje operativo por rol, explicando proveedor agnostico, buzones manuales, placeholders, drafts, trazabilidad y privacidad.

## Rutas por rol

### Shopper

Debe aprender:

- que mensajes puede recibir desde plataforma;
- que un correo puede estar en borrador o pendiente;
- que no debe ver correos o adjuntos privados de otros usuarios;
- como reportar un contacto incorrecto.

### Ops

Debe aprender:

- como registrar contacto manual;
- como usar una plantilla sin afirmar envio real;
- como vincular correo/manual log a visita, postulacion o liquidacion;
- como escalar si falta proveedor.

### Admin

Debe aprender:

- como configurar usuario con mailbox manual, placeholder o proveedor pendiente;
- como revisar permisos canDraft/canLogManual;
- como evitar guardar cuerpos crudos;
- como separar draft, manual log y enviado real.

### Superadmin / consultora / aliado

Debe aprender:

- como elegir politica de proveedor por tenant;
- por que no se conecta OAuth/SMTP sin gate;
- como se audita provider agnostic email;
- como se prepara integracion futura sin secretos en repo.

## Manuales a crear o actualizar

1. Manual user mailbox setup.
2. Manual provider agnostic email.
3. Manual manual-only traceability.
4. Manual email drafts.
5. Manual email privacy.
6. Manual provider gates.

## Lecciones requeridas

### Leccion 1 - Buzon por usuario

Debe explicar que el correo se configura por usuario y no solo globalmente por tenant.

### Leccion 2 - Estados de conexion

Debe explicar not_configured, manual_only, placeholder_no_send, connection_requested, provider pending y connected_future.

### Leccion 3 - Draft no es enviado

Debe explicar que draft preview solo prepara contenido, no ejecuta envio real.

### Leccion 4 - Manual log

Debe explicar como registrar trazabilidad manual sin prometer prueba de proveedor.

### Leccion 5 - Privacidad de correo

Debe explicar que cuerpos crudos, adjuntos, tokens y secretos no se guardan en preview ni repo.

## Checklists interactivos

### Antes de asignar mailbox

- Usuario correcto.
- Tenant/proyecto correcto si aplica.
- Tipo de ownership definido.
- Provider definido.
- Estado de conexion honesto.
- Permisos canRead/canSend/canDraft/canLogManual coherentes.

### Antes de crear draft

- Mailbox permite draft.
- Existe recipientRef.
- Existe entidad relacionada.
- Plantilla segura.
- No incluye datos privados crudos.

### Antes de log manual

- Contacto fue manual.
- Canal correcto.
- Entidad relacionada.
- No se marca como proveedor enviado.

## Glosario requerido

- mailboxId
- mailboxOwnershipType
- providerType
- connectionStatus
- canRead
- canSend
- canDraft
- canLogManual
- draft_ready_preview
- manual_log_only
- placeholder_no_send
- provider_configuration_required

## Estado seguro

Documento academico. No activa runtime, no lee ni envia correo, no conecta OAuth/SMTP, no llama Make y no cambia frontend.
