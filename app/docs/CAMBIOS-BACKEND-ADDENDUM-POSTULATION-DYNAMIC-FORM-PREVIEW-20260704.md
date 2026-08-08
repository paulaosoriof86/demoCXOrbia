# Cambios backend addendum - Postulation dynamic form preview

Fecha: 2026-07-04

## Bloque completado

Preview validator de ficha de postulacion dinamica usando politica de datos sensibles, assignment sync/conflicts y visit lifecycle/reservas como gates previos.

## Archivos creados

1. `app/contracts/postulation-dynamic-form-preview-phase-a.tya.contract.json`
   - Tipo: nuevo.
   - Que cambia: define contrato source-safe para formularios dinamicos de postulacion por tenant, proyecto, formId y formVersion.
   - Por que: el tracker marcaba como siguiente bloque crear preview validator de ficha postulacion dinamica.

2. `tools/migration/tya-postulation-dynamic-form-preview-validator.mjs`
   - Tipo: nuevo.
   - Que cambia: agrega validador Node que revisa contratos y opcionalmente un JSON local sintetico/sanitizado con formularios y postulaciones.
   - Por que: permite clasificar formulario listo, postulacion lista para revision, campos faltantes, datos protegidos, revision manual y conflicto sin datos reales.

3. `app/docs/POSTULATION-DYNAMIC-FORM-PREVIEW-VALIDATOR-PHASE-A-TYA-20260704.md`
   - Tipo: nuevo.
   - Que cambia: documenta objetivo, entrada segura, outcomes, reglas, pendientes backend, pendientes Claude, impacto Academia y estado seguro.

4. `app/docs/ACADEMIA-IMPACT-POSTULATION-DYNAMIC-FORM-PREVIEW-TYA-20260704.md`
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
- Sin correo real.
- Sin datos sensibles.

## Phase A que avanza

- La ficha de postulacion pasa a contrato dinamico por proyecto/version.
- Los campos requieren `fieldId`, tipo, required, sensibilidad y visibilidad.
- Campos privados quedan como referencias o pendientes de backend, no como raw.
- Postulacion valida queda para revision, no asignacion ni HR sync.
- Si apunta a visita, debe tener `visitId`, `hrRowId` o `sourceVisitRef`.

## Pendientes backend derivados

1. Preparar input local sintetico/sanitizado para escenarios de formularios dinamicos.
2. Integrar este validator en una secuencia local segura.
3. Crear preview validator de notification outbox.
4. Relacionar aprobacion de postulacion con assignment sync sin activar Make.
5. Mantener Storage privado pendiente hasta reglas y autorizacion.

## Pendientes prototipo/Claude derivados

1. Ficha de postulacion debe ser dinamica por proyecto/version.
2. Soportar campos requeridos, opcionales, referencia privada y computed read-only.
3. Mostrar estados honestos: protegido, pendiente backend, privado y requiere autorizacion.
4. No mostrar archivo privado/raw al shopper.
5. Separar postulacion, aprobacion, asignacion, HR sync y agenda.
6. Documentar si ficha frontal/dorso queda cubierta por configuracion dinamica o sigue pendiente.

## Impacto Academia

Se creo documento especifico para Academia sobre fichas dinamicas, postulacion shopper, revision ops/admin, configuracion por proyecto, sensibilidad de campos, versionado, checklists y glosario.

## Siguiente bloque recomendado

Preview validator de notification outbox, usando gates de datos sensibles, postulaciones, assignment sync y visit lifecycle/reservas.
