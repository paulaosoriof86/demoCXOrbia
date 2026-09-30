# Resumen para Claude addendum - Assignment sync conflict preview

Fecha: 2026-07-04

## Que hizo backend

Backend preparo un preview validator de assignment sync/conflicts usando la politica de datos sensibles como gate transversal.

Archivos agregados:

- `app/contracts/assignment-sync-conflict-preview-phase-a.tya.contract.json`
- `tools/migration/tya-assignment-sync-conflict-preview-validator.mjs`
- `app/docs/ASSIGNMENT-SYNC-CONFLICT-PREVIEW-VALIDATOR-PHASE-A-TYA-20260704.md`
- `app/docs/ACADEMIA-IMPACT-ASSIGNMENT-SYNC-CONFLICT-PREVIEW-TYA-20260704.md`
- `app/docs/CAMBIOS-BACKEND-ADDENDUM-ASSIGNMENT-SYNC-CONFLICT-PREVIEW-20260704.md`

No se activo runtime, no se leyeron fuentes reales, no se escribio Firestore/HR y no se llamo Make.

## Regla funcional para prototipo

1. Una asignacion desde plataforma debe salir de disponibles en preview, pero no debe decir HR sincronizada si Make/HR sync esta apagado.
2. Una asignacion detectada desde HR debe salir de disponibles si tiene llave estable.
3. Si plataforma y HR reflejan la misma asignacion por llaves estables, no se duplica.
4. Si HR y plataforma difieren, queda `conflict_review_required`.
5. Si faltan llaves estables, queda `manual_review_required`.
6. No se deduplica por nombre de sucursal, shopper visible, ciudad, fecha o coincidencia visual.

## Estados que Claude debe reflejar

Usar etiquetas visibles equivalentes a:

- pendiente de sincronizacion HR;
- detectada desde HR;
- ya reflejada / no duplicar;
- requiere revision por conflicto;
- requiere revision manual;
- cancelada/no asignable.

Evitar:

- HR sincronizada;
- Make ejecutado;
- asignacion final si no hay gate activo;
- deduplicado automatico por coincidencia visual.

## Pendientes frontend concretos

### Postulaciones

- Cambiar toasts `HR sincronizada` por texto honesto.
- Cuando se aprueba postulacion, mostrar asignacion preparada o pendiente HR sync.
- Si se detecta conflicto, no aprobar/sobrescribir silenciosamente.

### Bandeja de asignaciones

- Mostrar origen de asignacion:
  - plataforma/postulacion;
  - manual admin;
  - detectada HR;
  - historico preview;
  - revision manual.
- Mostrar estado de sync sin prometer integracion real.
- Mostrar conflicto si shopper/proyecto/HR row no coincide.

### Disponibilidad de visitas

- Una visita asignada desde plataforma o HR preview no debe seguir apareciendo como disponible.
- Si ya esta asignada en ambos lados con mismas llaves, no duplicar.
- Si hay conflicto, bloquear como requiere revision.

## Academia que Claude debe actualizar

- Curso Ops: postulacion a asignacion.
- Curso Admin: conflictos HR/plataforma.
- Curso Shopper: postulacion aprobada/asignacion pendiente.
- Manual HR Source: reflejo de asignaciones.
- Checklist antes de aprobar postulacion.
- Checklist antes de aceptar asignacion detectada en HR.
- Checklist antes de resolver conflicto.
- Glosario: `platform_pending_hr_sync`, `hr_detected_new_assignment`, `already_reflected_no_duplicate`, `conflict_review_required`, `manual_review_required`, `sourceVisitRef`, `hrRowId`, `visual dedupe`.

## Lo que Claude no debe tocar

- `tools/migration`.
- `app/contracts`.
- Gates backend.
- Make real.
- HR writes.
- Firestore writes.
- Datos reales o sensibles.

## Estado seguro

Documento/validator backend. No autoriza produccion, deploy, import real, Firestore, HR, Make, Gemini, correo real, WhatsApp real ni pagos.
