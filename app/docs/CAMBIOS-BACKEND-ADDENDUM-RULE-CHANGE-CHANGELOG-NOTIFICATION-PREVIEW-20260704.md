# Cambios backend addendum - Rule change changelog/notification preview

Fecha: 2026-07-04

## Bloque completado

Contrato y preview validator de changelog/notificaciones de cambios de reglas por tenant/proyecto, trabajando sobre la ultima baseline auditada de continuidad backend.

## Archivos creados

1. `app/contracts/rule-change-changelog-notification-preview-phase-a.tya.contract.json`
   - Tipo: nuevo.
   - Que cambia: define contrato source-safe para changelog y borradores de notificacion derivados de cambios de reglas.
   - Por que: tras completar versionamiento de reglas, el tracker recomendaba crear contrato/payload preview de changelog/notificaciones de cambios de reglas sin activar runtime.

2. `tools/migration/tya-rule-change-changelog-notification-preview-validator.mjs`
   - Tipo: nuevo.
   - Que cambia: agrega validador Node que revisa contratos y opcionalmente un JSON local sintetico/sanitizado con changeEvents.
   - Por que: permite clasificar changelog listo, notification draft listo, academia update requerido, revision humana, payload sensible bloqueado, envio real bloqueado, migration/rollback context requerido y conflicto.

3. `app/docs/RULE-CHANGE-CHANGELOG-NOTIFICATION-PREVIEW-VALIDATOR-PHASE-A-TYA-20260704.md`
   - Tipo: nuevo.
   - Que cambia: documenta objetivo, entrada segura, outcomes, reglas, pendientes backend, pendientes Claude, impacto Academia y estado seguro.

4. `app/docs/ACADEMIA-IMPACT-RULE-CHANGE-CHANGELOG-NOTIFICATION-PREVIEW-TYA-20260704.md`
   - Tipo: nuevo.
   - Que cambia: documenta rutas por rol, manuales, lecciones, checklists y glosario para Academia.

## Estado seguro

- Sin cambios frontend.
- Sin runtime.
- Sin deploy.
- Sin produccion.
- Sin import real.
- Sin Firestore writes.
- Sin Make real.
- Sin Gemini real.
- Sin email/WhatsApp real.
- Sin publicacion real.
- Sin destinatarios crudos.
- Sin datos sensibles.

## Phase A que avanza

- Cambios de reglas pueden generar changelog preview.
- Cambios de reglas pueden generar borrador de notificacion sin envio.
- Audiencias se expresan por rol/segmento, no por destinatarios crudos.
- Cambios de alto impacto requieren review/aprobacion.
- Cambios que impactan Academia quedan marcados como update requerido.
- No se marca enviado, publicado, sincronizado o informado con gates apagados.

## Pendientes backend derivados

1. Preparar input local sintetico/sanitizado de changeEvents.
2. Integrar este validator en una secuencia local segura.
3. Relacionar rule versioning con notification outbox sin activar envio.
4. Preparar payload futuro para UI de changelog/centro de actualizaciones.
5. Relacionar cambios de reglas con Academia y notificaciones por rol.

## Pendientes prototipo/Claude derivados

1. Changelog/centro de actualizaciones debe mostrar draft/review/approved preview, no publicado real.
2. No decir email/WhatsApp enviado para cambios de reglas si gates estan apagados.
3. Mostrar audiencia por rol/segmento, no destinatarios crudos.
4. Mostrar Academia update required cuando una regla cambia un flujo.
5. Mostrar human review/approval para cambios de alto impacto.
6. Mostrar migration/rollback context required cuando aplica.

## Impacto Academia

Se creo documento especifico para Academia sobre changelog y notificaciones de cambios de reglas, borrador vs enviado, roles afectados, Academia update required, alto impacto, checklists y glosario.

## Siguiente bloque recomendado

Preparar input sintetico/sanitizado para ejecutar validators previos o crear contrato transversal de release/readiness snapshot para agrupar validaciones antes de cualquier activacion real.
