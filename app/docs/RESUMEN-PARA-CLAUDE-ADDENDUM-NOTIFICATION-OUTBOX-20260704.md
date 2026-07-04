# Resumen para Claude - Notification outbox Phase A

Fecha: 2026-07-04

## Bloque backend completado

Se documento el modulo transversal de notificaciones, outbox, WhatsApp Web fallback, plantillas y Make/mensajeria futura.

## Archivos creados

- `app/contracts/notification-outbox-phase-a.tya.contract.json`
- `tools/migration/tya-notification-outbox-contract-validator.mjs`
- `app/docs/NOTIFICATION-OUTBOX-WHATSAPP-WEB-FALLBACK-PHASE-A-TYA-20260704.md`
- `app/docs/ACADEMIA-IMPACT-NOTIFICATIONS-OUTBOX-TYA-20260704.md`

## Para prototipo

Cuando Claude vuelva:

- No mostrar Make o WhatsApp API como activos si siguen apagados.
- Diferenciar mensaje preparado, envio manual requerido, envio manual confirmado, bloqueado por gate y contacto faltante.
- Permitir preparar WhatsApp Web.
- Permitir confirmar envio manual.
- Mantener plantillas editables por tenant/proyecto cuando aplique.
- Notificar cursos/manuales de Academia con estados propios.

## Estado seguro

Sin cambios frontend, sin runtime, sin Firestore real, sin WhatsApp API real, sin Make real, sin email real, sin deploy y sin produccion.
