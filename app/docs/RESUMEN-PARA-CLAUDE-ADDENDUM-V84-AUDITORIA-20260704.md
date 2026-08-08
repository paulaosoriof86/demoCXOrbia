# Resumen para Claude addendum - Auditoria V84

Fecha: 2026-07-04

## Decision

V84 no queda aceptada como source lock final. Es avance parcial sobre V83, pero requiere V85 correctiva sobre V84. No hacer rediseño libre.

## Que debe conservar Claude de V84

1. `modules/revision-admin.js` con `status=estado`, `projectId:p.id`, `hrRowId` y texto `realizado/completado`.
2. Mejoras de Academia sobre liquidacion candidata despues de revision + submitido.
3. Ruta Shopper nueva.
4. Ruta Cliente nueva.
5. Handler honesto de boton `syncHR` en Postulaciones.
6. Estilos de Academia que ya venian de V83.

## P0 que debe corregir V85

1. En `modules/cuestionario-shopper.js`, reemplazar `marca la visita como cuestionario enviado` por `marca el cuestionario como realizado/completado`.
2. En `modules/postulaciones.js`, eliminar toasts `HR sincronizada` en autorizar fecha y editar asignacion. Usar `pendiente HR sync`, `pendiente backend` o `se reflejara en HR cuando el gate este activo`.
3. En `modules/misvisitas.js`, eliminar textos que prometen sincronizacion HR/liquidacion automatica. Usar preview/preparado/pendiente backend.
4. Corregir textos de WhatsApp/Make/email reales: no decir enviado/ejecutado si el gate esta apagado.
5. En `modules/academia.js`, corregir textos de `Sincronia automatica`, `sincroniza la HR externa` y `mueve la liquidacion`.
6. Corregir el archivo residual `docs/ADDENDUM-V87-PHASE-A.md`: si la candidata es V85, el addendum debe decir V85 y no `Base: V86/V87`, salvo que explique explicitamente una secuencia real.

## Bloques backend recientes que debe incorporar

- Notification outbox: `notificationId`, `templateId`, `templateVersion`, `recipientRef`, `outboxStatus`, `manualFallbackStatus`, fallback manual, provider pendiente.
- Email/user mailbox: `mailboxId`, `providerType`, `connectionStatus`, `canDraft`, `canLogManual`, `draft_ready_preview`, `manual_log_only`.
- Ficha dinamica: `formId`, `formVersion`, `fieldId`, sensibilidad, campos requeridos/opcionales, referencias privadas.
- Assignment sync/conflicts: no dedupe visual, no duplicar, conflicto/revision manual.
- Visit lifecycle/reservas: `availableFrom`, franja, quincena, override, realizada, cuestionario completado, revision, submitido, liquidacion y pago separados.

## Validacion esperada V85

- 0 `HR sincronizada` en toasts de flujo visible.
- 0 `cuestionario enviado` en flujo visible actual.
- No prometer Make/WhatsApp/email/HR reales si gate esta apagado.
- JS OK con `node --check`.
- `index.html` sin scripts faltantes ni duplicados.
- Academia conserva lo bueno de V84 y cubre bloques nuevos con rutas por rol, manuales, glosario y checklists.

## No tocar

- `tools/migration`.
- `app/contracts`.
- Gates backend.
- Firestore/Auth/Storage/Make/Gemini/correo/WhatsApp reales.
- Datos reales o sensibles.
