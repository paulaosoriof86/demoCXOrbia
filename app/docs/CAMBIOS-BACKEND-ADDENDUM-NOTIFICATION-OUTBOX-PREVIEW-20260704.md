# Cambios backend addendum - Notification outbox preview

Fecha: 2026-07-04

## Bloque completado

Preview validator de notification outbox usando gates de datos sensibles, ficha postulacion dinamica, assignment sync/conflicts y visit lifecycle/reservas.

## Archivos creados

1. `app/contracts/notification-outbox-preview-phase-a.tya.contract.json`
   - Tipo: nuevo.
   - Que cambia: define contrato source-safe para eventos de notificacion, plantillas, destinatarios seguros, canales preview y fallback manual.
   - Por que: el tracker marcaba como siguiente bloque crear preview validator de notification outbox.

2. `tools/migration/tya-notification-outbox-preview-validator.mjs`
   - Tipo: nuevo.
   - Que cambia: agrega validador Node que revisa contratos y opcionalmente un JSON local sintetico/sanitizado con notificaciones.
   - Por que: permite clasificar outbox listo, accion manual requerida, proveedor pendiente, payload sensible bloqueado, destinatario faltante y revision de plantilla sin envios reales.

3. `app/docs/NOTIFICATION-OUTBOX-PREVIEW-VALIDATOR-PHASE-A-TYA-20260704.md`
   - Tipo: nuevo.
   - Que cambia: documenta objetivo, entrada segura, outcomes, reglas, pendientes backend, pendientes Claude, impacto Academia y estado seguro.

4. `app/docs/ACADEMIA-IMPACT-NOTIFICATION-OUTBOX-PREVIEW-TYA-20260704.md`
   - Tipo: nuevo.
   - Que cambia: documenta rutas por rol, manuales, lecciones, checklists, glosario y notificaciones para Academia.

## Estado seguro

- Sin cambios frontend.
- Sin runtime.
- Sin deploy.
- Sin produccion.
- Sin import real.
- Sin Firestore writes.
- Sin Storage writes.
- Sin HR writes.
- Sin Make real.
- Sin Gemini real.
- Sin proveedor de email real.
- Sin WhatsApp real.
- Sin push real.
- Sin datos sensibles.

## Phase A que avanza

- Notification outbox queda definido como preview/fallback, no envio real.
- Plantillas requieren `templateId` y `templateVersion`.
- Destinatarios se representan por `recipientRef`, no por telefono/correo crudo.
- Estados honestos separan preview, borrador, accion manual, provider pendiente y confirmacion manual.
- Payloads con datos sensibles quedan bloqueados para revision.

## Pendientes backend derivados

1. Preparar input local sintetico/sanitizado para notificaciones.
2. Integrar este validator en una secuencia local segura.
3. Crear preview validator de email/user mailbox sin conexion real.
4. Relacionar outbox con postulaciones, assignment sync, agenda, cuestionario y liquidaciones sin activar proveedores.
5. Preparar Make/email payload draft sin activar.

## Pendientes prototipo/Claude derivados

1. Toasters no deben decir enviado/sincronizado si solo hay preview.
2. WhatsApp Web debe mostrarse como copiar/manual/confirmar, no envio automatico.
3. Email debe mostrarse como borrador/provider pendiente si no hay proveedor real.
4. In-app notifications deben separarse de envios externos.
5. Plantillas deben ser configurables por tenant/proyecto/evento/version.
6. No exponer datos privados en notificaciones shopper.

## Impacto Academia

Se creo documento especifico para Academia sobre notification outbox, fallback manual, plantillas seguras, estados honestos, checklists y glosario.

## Siguiente bloque recomendado

Preview validator de email/user mailbox sin conexion real, usando notification outbox como gate previo.
