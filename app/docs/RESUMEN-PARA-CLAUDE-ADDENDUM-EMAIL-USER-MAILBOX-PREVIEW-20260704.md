# Resumen para Claude addendum - Email user mailbox preview

Fecha: 2026-07-04

## Que hizo backend

Backend preparo contrato y validator preview para email/user mailbox sin conexion real.

Archivos agregados:

- `app/contracts/email-user-mailbox-preview-phase-a.tya.contract.json`
- `tools/migration/tya-email-user-mailbox-preview-validator.mjs`
- `app/docs/EMAIL-USER-MAILBOX-PREVIEW-VALIDATOR-PHASE-A-TYA-20260704.md`
- `app/docs/ACADEMIA-IMPACT-EMAIL-USER-MAILBOX-PREVIEW-TYA-20260704.md`
- `app/docs/CAMBIOS-BACKEND-ADDENDUM-EMAIL-USER-MAILBOX-PREVIEW-20260704.md`

No se activo runtime, email real, OAuth, SMTP ni integraciones reales.

## Reglas que debe reflejar el prototipo

1. El correo se configura por usuario.
2. No hay proveedor real conectado en Phase A preview.
3. Draft no es correo enviado.
4. Manual log no es prueba de proveedor.
5. Placeholder no puede enviar ni recibir.
6. No mostrar conectado/leido/enviado si gate esta apagado.
7. No exponer correo personal crudo, cuerpos, adjuntos, tokens ni secretos.
8. Las acciones de email deben vincularse a entidad segura sin prometer sync real.

## Pendientes frontend concretos

### Email UI

- Mostrar estados: no configurado, manual only, placeholder no send, connection requested, provider pending.
- Separar draft, manual log, provider pending y enviado real.
- No decir enviado si solo hay draft o log manual.

### Usuarios / configuración

- Mostrar mailbox por usuario.
- Mostrar tipo de ownership y provider de forma entendible.
- No pedir credenciales reales desde prototipo si gate esta apagado.

### Notificaciones / comunicaciones

- Notification outbox puede crear draft/manual log, pero no enviar email real.
- Vincular acciones a postulacion, visita, asignacion, liquidacion o Academia.

## Academia que Claude debe actualizar

- Curso Superadmin: configuracion de email provider agnostic.
- Curso Admin: crear usuario con mailbox manual/placeholder/provider pending.
- Curso Ops: trazabilidad manual y drafts.
- Manual email por usuario.
- Manual privacidad de correo.
- Checklist antes de crear draft.
- Checklist antes de log manual.
- Glosario: mailboxId, providerType, connectionStatus, canDraft, canLogManual, draft_ready_preview, manual_log_only.

## No tocar

- `tools/migration`.
- `app/contracts`.
- Gates backend.
- OAuth/SMTP/email real.
- Firestore/HR/Storage reales.
- Datos reales o sensibles.

## Estado seguro

Documento/validator backend. No autoriza produccion, deploy, import real, escrituras reales ni envios reales.
