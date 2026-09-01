# Academia impact - Assignment sync conflict preview TyA

Fecha: 2026-07-04

## Bloque relacionado

- `app/contracts/assignment-sync-conflict-preview-phase-a.tya.contract.json`
- `tools/migration/tya-assignment-sync-conflict-preview-validator.mjs`
- `app/docs/ASSIGNMENT-SYNC-CONFLICT-PREVIEW-VALIDATOR-PHASE-A-TYA-20260704.md`

## Objetivo Academia

Convertir el bloque tecnico de sincronizacion plataforma ↔ HR en aprendizaje operativo por rol, con enfoque en prevencion de duplicados, conflictos, revision manual, estados honestos y proteccion de datos.

## Rutas por rol

### Shopper

Debe aprender:

- que significa postulacion pendiente;
- que significa postulacion aprobada;
- que significa asignacion preparada;
- que significa pendiente de sincronizacion HR;
- por que una visita puede dejar de estar disponible;
- que hacer si ve una inconsistencia.

### Ops / coordinador

Debe aprender:

- como una postulacion se vuelve asignacion;
- como HR puede reflejar una asignacion;
- como identificar duplicados;
- por que no se deduplica por nombre o coincidencia visual;
- como escalar conflicto;
- como explicar estados honestos al shopper.

### Admin

Debe aprender:

- como revisar asignaciones de plataforma;
- como revisar asignaciones detectadas en HR;
- como resolver conflictos sin sobrescribir;
- como revisar llaves estables;
- como conservar auditoria.

### Superadmin / consultora / aliado

Debe aprender:

- como se configura sync por proyecto;
- por que Make permanece apagado hasta autorizacion;
- como se evita duplicidad multi-proyecto;
- como se audita conflicto por tenant/proyecto.

## Manuales a crear o actualizar

1. Manual Postulaciones.
2. Manual Asignaciones.
3. Manual HR Source.
4. Manual Sync HR/plataforma.
5. Manual Revision de conflictos.
6. Manual Datos sensibles en sync preview.

## Lecciones requeridas

### Leccion 1 - De postulacion a asignacion

Debe explicar:

1. shopper postula;
2. admin aprueba;
3. plataforma crea asignacion preparada;
4. HR sync queda pendiente si Make esta apagado;
5. visita sale de disponibles;
6. si HR refleja lo mismo, no se duplica.

### Leccion 2 - Asignacion detectada desde HR

Debe explicar:

1. HR trae una asignacion;
2. plataforma la detecta por llave estable;
3. si no existe en plataforma, se marca HR-detected;
4. visita sale de disponibles;
5. si coincide con plataforma, no duplica.

### Leccion 3 - Conflictos

Debe explicar casos:

- shopper diferente;
- proyecto diferente;
- HR row diferente;
- falta visitId/hrRowId/sourceVisitRef;
- cancelacion;
- duplicado HR;
- duplicado plataforma;
- dato sensible detectado.

### Leccion 4 - Por que no se usa coincidencia visual

Debe explicar que sucursal, ciudad, fecha o nombre de shopper pueden parecer iguales pero no son llave suficiente. La decision debe usar tenant, proyecto, visita/HR row, shopper y fuente.

### Leccion 5 - Estados honestos

Debe explicar etiquetas:

- `platform_pending_hr_sync`;
- `hr_detected_new_assignment`;
- `already_reflected_no_duplicate`;
- `conflict_review_required`;
- `manual_review_required`;
- `cancelled_or_unassignable`.

## Checklists interactivos

### Antes de aprobar postulacion

- Existe tenant/proyecto.
- Existe visita.
- Existe shopper.
- La visita sigue disponible.
- No hay asignacion previa.
- No hay conflicto HR.
- El texto visible no promete HR sync real si gate esta apagado.

### Antes de aceptar asignacion detectada en HR

- Existe llave estable.
- El shopper existe o se envia a revision.
- No hay asignacion plataforma equivalente.
- Si hay coincidencia, se confirma no duplicar.
- No hay datos sensibles en preview.

### Antes de resolver conflicto

- Revisar tenant.
- Revisar proyecto.
- Revisar visitId/hrRowId/sourceVisitRef.
- Revisar shopperId.
- Revisar fuente.
- Registrar decision.
- No sobrescribir silenciosamente.

## Glosario requerido

- assignmentSource
- assignmentSyncStatus
- platform_postulation
- platform_manual_admin
- hr_detected
- platform_pending_hr_sync
- hr_detected_new_assignment
- already_reflected_no_duplicate
- conflict_review_required
- manual_review_required
- sourceVisitRef
- hrRowId
- visual dedupe

## Notificaciones Academia

Cuando este flujo pase a UI, Academia debe notificar:

- nuevo curso de postulaciones/asignaciones;
- manual actualizado de HR Source;
- checklist nuevo de conflictos;
- glosario actualizado;
- contenido pendiente de revision humana si Gemini ayuda a redactar.

## Estado seguro

Documento academico. No activa runtime, no escribe Firestore/HR, no llama Make y no cambia frontend.
