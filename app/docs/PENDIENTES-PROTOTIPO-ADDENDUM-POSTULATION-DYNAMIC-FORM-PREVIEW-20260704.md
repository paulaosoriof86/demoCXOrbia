# Pendientes prototipo addendum - Postulation dynamic form preview

Fecha: 2026-07-04

## Origen

Backend agrego contrato y validador preview para ficha de postulacion dinamica. Este documento lista pendientes frontend/prototipo para Claude.

## Pendientes ficha de postulacion

1. Ficha configurable por proyecto y version.
2. No hard-codear Cinepolis como unica estructura.
3. Campos con identificador estable.
4. Campos requeridos y opcionales.
5. Campos privados como referencia protegida o pendiente backend.
6. Mensajes claros si faltan campos.
7. Version de formulario conservada para auditoria.
8. Si existe ficha frontal/dorso, documentar si queda cubierta por la configuracion dinamica o si sigue pendiente.

## Pendientes revision admin/ops

1. Mostrar postulacion lista para revision.
2. Mostrar campos faltantes.
3. Mostrar revision manual si falta `visitId`, `hrRowId` o `sourceVisitRef`.
4. No aprobar silenciosamente si hay referencia ambigua.
5. No decir `HR sincronizada` al aprobar.
6. Al aprobar, mover a estado preparado/pendiente de assignment sync.

## Pendientes datos protegidos

1. No mostrar archivo privado/raw al shopper.
2. Usar estados: protegido, privado, pendiente backend, requiere autorizacion.
3. No pedir ni mostrar datos sensibles si no hay regla/gate aprobado.
4. No prometer Storage real si gate esta apagado.

## Pendientes Academia

1. Curso Shopper: como postularse.
2. Curso Ops: revision de postulaciones.
3. Curso Admin: configuracion de formulario.
4. Curso Superadmin: versionado y sensibilidad de campos.
5. Manual de fichas dinamicas.
6. Checklist antes de publicar formulario.
7. Checklist antes de aprobar postulacion.
8. Checklist antes de pedir dato privado.
9. Glosario: formId, formVersion, fieldId, sensitivityLevel, source_safe_ref_only, file_ref_pending_storage, postulation_ready_for_review.

## No corresponde a Claude

- Implementar validator backend.
- Activar Make real.
- Escribir HR.
- Escribir Firestore.
- Subir Storage real.
- Procesar datos reales.
- Modificar `tools/migration` o `app/contracts`.

## Prioridad

P0: ficha dinamica, estados honestos y separacion postulacion/aprobacion/asignacion/HR sync/agenda.

P1: revision admin/ops y referencias estables.

P2: Academia profunda con manuales, checklists y glosario.
