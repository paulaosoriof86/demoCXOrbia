# Cambios backend addendum - Email user mailbox preview

Fecha: 2026-07-04

## Bloque completado

Preview validator de email/user mailbox sin conexion real, usando notification outbox y politica de datos sensibles como gates previos.

## Archivos creados

1. `app/contracts/email-user-mailbox-preview-phase-a.tya.contract.json`
   - Tipo: nuevo.
   - Que cambia: define contrato source-safe para configuracion de buzones por usuario, drafts, manual logs y provider pending.
   - Por que: el tracker marcaba como siguiente bloque crear preview validator de email/user mailbox sin conexion real.

2. `tools/migration/tya-email-user-mailbox-preview-validator.mjs`
   - Tipo: nuevo.
   - Que cambia: agrega validador Node que revisa contratos y opcionalmente un JSON local sintetico/sanitizado con mailboxes y mailActions.
   - Por que: permite clasificar mailbox listo, provider pendiente, manual-only, placeholder bloqueado, draft preview, manual log y payload sensible bloqueado sin correo real.

3. `app/docs/EMAIL-USER-MAILBOX-PREVIEW-VALIDATOR-PHASE-A-TYA-20260704.md`
   - Tipo: nuevo.
   - Que cambia: documenta objetivo, entrada segura, outcomes, reglas, pendientes backend, pendientes Claude, impacto Academia y estado seguro.

4. `app/docs/ACADEMIA-IMPACT-EMAIL-USER-MAILBOX-PREVIEW-TYA-20260704.md`
   - Tipo: nuevo.
   - Que cambia: documenta rutas por rol, manuales, lecciones, checklists y glosario para Academia.

## Estado seguro

- Sin cambios frontend.
- Sin runtime.
- Sin deploy.
- Sin produccion.
- Sin import real.
- Sin Firestore writes.
- Sin lectura de correo real.
- Sin envio de correo real.
- Sin OAuth.
- Sin SMTP.
- Sin Make real.
- Sin Gemini real.
- Sin datos sensibles.

## Phase A que avanza

- El correo queda configurado por usuario, no global unico.
- `emailAddressRef` queda como alias/referencia opaca en preview.
- Placeholder no puede leer ni enviar.
- Manual-only solo registra trazabilidad.
- Draft preview no es correo enviado.
- Se bloquean tokens, secretos, cuerpos crudos y adjuntos.

## Pendientes backend derivados

1. Preparar input local sintetico/sanitizado para buzones y acciones de correo.
2. Integrar este validator en una secuencia local segura.
3. Crear preview validator de CRM external folder refs.
4. Relacionar notification outbox con draft/manual log sin activar proveedor.
5. Preparar payload draft de proveedor sin activar OAuth/SMTP.

## Pendientes prototipo/Claude derivados

1. Email UI no debe decir conectado, leido o enviado si gate esta apagado.
2. Mostrar estados: no configurado, manual only, placeholder no send, connection requested, provider pending.
3. Separar draft, log manual y enviado real.
4. No exponer correo personal crudo, cuerpo de mensaje ni adjuntos privados.
5. Acciones de email deben vincularse a entidad sin prometer sync real.

## Impacto Academia

Se creo documento especifico para Academia sobre email por usuario, provider agnostic email, manual-only traceability, drafts, privacidad de correo, provider gates, checklists y glosario.

## Siguiente bloque recomendado

Preview validator de CRM external folder refs, usando email/mailbox, notification outbox y politica de datos sensibles como gates previos.
