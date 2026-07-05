# Pendientes Claude addendum - Rule change changelog/notification preview

Fecha: 2026-07-04

## Origen

Backend agrego contrato y validador preview para changelog/centro de actualizaciones y borradores de notificacion derivados de cambios de reglas. Este documento lista pendientes frontend/prototipo para Claude.

## Pendientes changelog UI

1. Mostrar changelog/centro de actualizaciones con estados draft/review/approved preview.
2. No decir publicado real si no hay gate activo.
3. Mostrar regla relacionada y version.
4. Mostrar tipo de cambio.
5. Mostrar impacto por rol.
6. Mostrar si requiere Academia update.
7. Mostrar si requiere migration/rollback context.
8. Mostrar si requiere human review/approval.

## Pendientes notificaciones

1. Borrador de notificacion no equivale a envio.
2. No mostrar email/WhatsApp/Make enviado si gates estan apagados.
3. Mostrar provider pending o manual send required.
4. Usar audiencia por rol/segmento.
5. No mostrar destinatarios crudos.
6. No marcar roles como informados sin confirmacion futura.

## Pendientes Academia

1. Curso Admin: changelog de reglas y revision de alto impacto.
2. Curso Ops: cambios operativos requeridos.
3. Curso Finanzas: cambios de pago/pais/moneda.
4. Curso Shopper: cambios de flujo futuro.
5. Curso Cliente: resumen visible de cambios permitidos.
6. Curso Superadmin: release governance.
7. Manual changelog and product updates.
8. Manual rule change notifications.
9. Manual Academia update workflow.
10. Checklist antes de publicar changelog.
11. Checklist antes de preparar notificacion.
12. Glosario de changelog/notificaciones de cambios.

## No corresponde a Claude

- Implementar validator backend.
- Activar envio real.
- Publicar changelog real.
- Escribir Firestore.
- Ejecutar Make/Gemini.
- Procesar destinatarios crudos.
- Modificar `tools/migration` o `app/contracts`.

## Prioridad

P0: no prometer publicado/enviado/informado con gates apagados y no exponer destinatarios crudos.

P1: centro de actualizaciones con estados y audiencia por rol.

P2: Academia profunda con manuales, checklists y glosario.
