# Pendientes prototipo addendum - Email user mailbox preview

Fecha: 2026-07-04

## Origen

Backend agrego contrato y validador preview para email/user mailbox sin conexion real. Este documento lista pendientes frontend/prototipo para Claude.

## Pendientes Email UI

1. No decir conectado si el provider no esta conectado.
2. No decir leido si no hay lectura real.
3. No decir enviado si solo existe draft o manual log.
4. Mostrar estados:
   - no configurado;
   - manual only;
   - placeholder no send;
   - connection requested;
   - provider pending;
   - draft preview;
   - manual log.
5. Separar draft, log manual, provider pending y enviado real.

## Pendientes usuarios/configuracion

1. Mostrar mailbox por usuario.
2. Mostrar tipo de ownership.
3. Mostrar provider de forma entendible.
4. No pedir ni guardar credenciales reales desde prototipo si gate esta apagado.
5. No mostrar OAuth/SMTP como conectado.

## Pendientes privacidad

1. No exponer correo personal crudo en vistas shopper.
2. No exponer cuerpo de mensaje crudo.
3. No exponer adjuntos privados.
4. No guardar tokens, secretos ni credenciales.
5. Usar referencias opacas y estados protegidos.

## Pendientes integracion con notificaciones

1. Notification outbox puede crear draft o log manual, pero no email real.
2. Accion de email debe vincularse a postulacion, visita, asignacion, liquidacion o Academia.
3. No prometer sync real.
4. No mezclar email real con fallback manual.

## Pendientes Academia

1. Curso Superadmin: configuracion provider agnostic.
2. Curso Admin: usuario con mailbox manual/placeholder/provider pending.
3. Curso Ops: trazabilidad manual y drafts.
4. Manual email por usuario.
5. Manual privacidad de correo.
6. Checklist antes de crear draft.
7. Checklist antes de log manual.
8. Glosario de mailbox y estados.

## No corresponde a Claude

- Implementar validator backend.
- Activar OAuth.
- Activar SMTP.
- Enviar correo real.
- Leer correo real.
- Escribir Firestore/HR/Storage.
- Procesar datos reales.
- Modificar `tools/migration` o `app/contracts`.

## Prioridad

P0: textos honestos de email y separacion draft/log/manual/provider pending/enviado real.

P1: configuracion de mailbox por usuario y privacidad.

P2: Academia profunda con manuales, checklists y glosario.
