# Resumen para Claude addendum - Auditoria V86

Fecha: 2026-07-04

## Decision

V86 si trae cambios reales frente a V85/V84, pero no cierra los P0. No queda como source lock final. Se usara como candidata auditada de continuidad backend mientras Claude genera V87 correctiva.

## Que debe conservar Claude de V86

1. `modules/misvisitas.js`: texto de preview/pendiente backend y completar cuestionario.
2. `modules/dashboard.js`: toasts ya corregidos a preparado/borrador/pendiente.
3. `modules/academia.js`: frase corregida de notificacion preparada/pendiente backend.
4. `modules/revision-admin.js` de V84: `status`, `projectId`, `hrRowId`, realizado/completado.

## P0 que debe corregir V87

1. `modules/cuestionario-shopper.js`: cambiar `marca la visita como cuestionario enviado` por `marca el cuestionario como realizado/completado`.
2. `modules/postulaciones.js`: eliminar toasts `HR sincronizada`.
3. `modules/postulaciones.js`: eliminar toasts `WhatsApp enviado`.
4. `modules/dashboard.js`: eliminar `WhatsApp enviado (Make)` restante.
5. `modules/dashboard.js`: eliminar `Correo enviado a n shopper(s) (Make/Outlook)` restante.
6. `modules/academia.js`: corregir `Sincronia/Sincronía automatica`, `sincroniza la HR externa` y `mueve la liquidacion/liquidación`.
7. `docs/ADDENDUM-V87-PHASE-A.md`: revisar versionado residual o coherencia de base.

## Bloques backend recientes que debe incorporar

- Notification outbox: `notificationId`, `templateId`, `templateVersion`, `recipientRef`, `outboxStatus`, `manualFallbackStatus`.
- Email/user mailbox: `mailboxId`, `providerType`, `connectionStatus`, `canDraft`, `canLogManual`, `draft_ready_preview`, `manual_log_only`.
- Ficha dinamica: `formId`, `formVersion`, `fieldId`, sensibilidad y versionado.
- CRM external folder refs: `crmEntityId`, `externalFolderRefId`, `externalProviderType`, `visibilityScope`, `accessStatus`.
- Assignment sync/conflicts: no dedupe visual, no duplicar, conflicto/revision manual.
- Visit lifecycle/reservas: `availableFrom`, franja, quincena, override, realizada, cuestionario completado.

## Validacion esperada V87

- JS OK.
- `index.html` sin scripts faltantes ni duplicados.
- 0 toasts visibles que digan enviado/sincronizado si gate esta apagado.
- 0 `cuestionario enviado` en flujo shopper visible actual.
- Academia con rutas por rol, manuales, glosario, checklists y errores frecuentes.
- Sin activar Firestore, HR, Storage, Make, Gemini, WhatsApp, correo, pagos ni datos reales.

## No tocar

- `tools/migration`.
- `app/contracts`.
- Gates backend.
- Firestore/Auth/Storage/Make/Gemini/WhatsApp/correo/pagos reales.
- Datos reales o sensibles.
