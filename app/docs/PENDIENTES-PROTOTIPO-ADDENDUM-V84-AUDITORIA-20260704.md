# Pendientes prototipo addendum - Auditoria V84

Fecha: 2026-07-04

## Estado general

V84 es avance parcial sobre V83. Modifica `modules/academia.js`, `modules/postulaciones.js` y `modules/revision-admin.js`, y agrega `docs/ADDENDUM-V87-PHASE-A.md`. No queda como source lock final.

## Resuelto o parcialmente resuelto

1. `modules/revision-admin.js`: resuelto parcialmente.
   - Agrega `status=estado`.
   - Pasa `projectId:p.id`.
   - Guarda `hrRowId`.
   - Cambia etiqueta de cuestionario a `realizado/completado`.
2. `modules/academia.js`: resuelto parcialmente.
   - Corrige liquidacion candidata para que nazca despues de revision + submitido.
   - Agrega ruta Shopper.
   - Agrega ruta Cliente.
3. `modules/postulaciones.js`: resuelto parcialmente.
   - Agrega handler honesto al boton `syncHR`.

## Pendientes P0 vivos

### Cuestionario shopper

- Archivo: `modules/cuestionario-shopper.js`.
- Pendiente: sigue `marca la visita como cuestionario enviado`.
- Accion: cambiar a `marca el cuestionario como realizado/completado`.

### Postulaciones

- Archivo: `modules/postulaciones.js`.
- Pendiente: siguen toasts `HR sincronizada` en autorizar fecha y editar asignacion.
- Accion: cambiar por `pendiente HR sync`, `pendiente backend` o `se reflejara en HR cuando el gate este activo`.

### Mis visitas

- Archivo: `modules/misvisitas.js`.
- Pendiente: no fue tocado; sigue prometiendo sincronizacion de hoja de ruta y liquidacion.
- Accion: usar preview/preparado/pendiente backend y separar realizada, cuestionario, revision, submitido, liquidacion y pago.

### WhatsApp / Make / email

- Archivos: `modules/dashboard.js`, `modules/postulaciones.js`, `core/automations.js`.
- Pendiente: siguen textos de envio real como `WhatsApp enviado`.
- Accion: usar fallback manual, draft, provider pendiente o pendiente backend.

### Academia

- Archivo: `modules/academia.js`.
- Pendiente: conserva textos de `Sincronia automatica`, `sincroniza la HR externa` y `mueve la liquidacion`.
- Accion: convertir a estados honestos.

### Versionado residual

- Archivo: `docs/ADDENDUM-V87-PHASE-A.md`.
- Pendiente: V84 trae addendum V87 con `Base: V86`.
- Accion: corregir nombre/contenido al numero real de candidata o explicar secuencia.

## Pendientes P1 de bloques backend recientes

1. Notification outbox: `notificationId`, `templateId`, `templateVersion`, `recipientRef`, `outboxStatus`, `manualFallbackStatus`.
2. Email/user mailbox: `mailboxId`, `providerType`, `connectionStatus`, `canDraft`, `canLogManual`, `draft_ready_preview`, `manual_log_only`.
3. Ficha dinamica: `formId`, `formVersion`, `fieldId`, sensibilidad, versionado.
4. Assignment sync/conflicts: no dedupe visual, no duplicar, conflicto/revision manual.
5. Visit lifecycle/reservas: `availableFrom`, franja, quincena, override, realizada, cuestionario completado.

## Pendientes Academia

1. Rutas completas para Ops, Superadmin/aliado y Finanzas frente a los bloques nuevos.
2. Checklists interactivos/persistentes o dejar pendiente explicito.
3. Manuales y glosario de bloques recientes.
4. Notificaciones propias de Academia.
5. Acceso persistente a Academia/topbar si aplica.

## Decision

Pedir V85 correctiva sobre V84. No aceptar V84 como source lock final.
