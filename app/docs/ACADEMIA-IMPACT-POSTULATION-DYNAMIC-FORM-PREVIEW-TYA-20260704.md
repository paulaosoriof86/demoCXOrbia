# Academia impact - Postulation dynamic form preview TyA

Fecha: 2026-07-04

## Bloque relacionado

- `app/contracts/postulation-dynamic-form-preview-phase-a.tya.contract.json`
- `tools/migration/tya-postulation-dynamic-form-preview-validator.mjs`
- `app/docs/POSTULATION-DYNAMIC-FORM-PREVIEW-VALIDATOR-PHASE-A-TYA-20260704.md`

## Objetivo Academia

Convertir la ficha de postulacion dinamica en aprendizaje operativo por rol, explicando configuracion por proyecto, campos requeridos, referencias privadas, versionado, revision admin y relacion con assignment sync y agenda.

## Rutas por rol

### Shopper

Debe aprender:

- como encontrar una visita disponible;
- como completar una ficha de postulacion;
- que significa campo requerido;
- que significa referencia protegida o pendiente backend;
- que pasa despues de enviar postulacion;
- por que postularse no equivale a quedar asignado.

### Ops

Debe aprender:

- como revisar postulaciones incompletas;
- como detectar campos faltantes;
- como escalar postulaciones con referencia ambigua;
- como evitar prometer HR sync real;
- como enviar a revision manual.

### Admin

Debe aprender:

- como configurar campos por proyecto;
- como publicar una version de formulario;
- como revisar postulaciones;
- como aprobar sin duplicar asignaciones;
- como pasar al gate de assignment sync.

### Superadmin / consultora / aliado

Debe aprender:

- como crear formularios reutilizables por tenant/proyecto;
- como versionar fichas;
- como clasificar sensibilidad de campos;
- como configurar ficha sin hard-codear un proyecto unico.

## Manuales a crear o actualizar

1. Manual de fichas dinamicas.
2. Manual de postulacion shopper.
3. Manual de revision ops/admin.
4. Manual de configuracion por proyecto.
5. Manual de sensibilidad y visibilidad de campos.
6. Manual de versionado de formulario.

## Lecciones requeridas

### Leccion 1 - Que es una ficha dinamica

Debe explicar que cada proyecto puede pedir campos distintos y que la ficha se controla por `formId` y `formVersion`.

### Leccion 2 - Que ve el shopper

Debe explicar campos visibles, campos requeridos, campos opcionales, errores de validacion y estados posteriores al envio.

### Leccion 3 - Datos privados y referencias

Debe explicar que los datos protegidos no deben exponerse en vistas shopper y que ciertos campos quedan como referencia privada o pendiente backend.

### Leccion 4 - Revision admin/ops

Debe explicar como revisar campos faltantes, referencias ambiguas, estados de revision manual y preparacion para aprobacion.

### Leccion 5 - Postulacion no es asignacion

Debe explicar que postularse no asigna automaticamente visita y que la aprobacion pasa por assignment sync/conflicts antes de HR real.

### Leccion 6 - Relacion con agenda

Debe explicar que fechas propuestas se validan despues contra availableFrom, franja y quincena.

## Checklists interactivos

### Antes de publicar formulario

- Tiene tenant y proyecto.
- Tiene formId y formVersion.
- Cada campo tiene fieldId.
- Cada campo declara tipo.
- Cada campo declara requerido/opcional.
- Cada campo declara sensibilidad.
- Campos privados no quedan visibles indebidamente.
- El formulario no esta hard-codeado para un solo proyecto.

### Antes de aprobar postulacion

- Shopper existe.
- Visita o referencia estable existe si aplica.
- Campos requeridos completos.
- No hay referencia privada ambigua.
- No hay conflicto de disponibilidad.
- No se promete HR sync real.

### Antes de pedir dato privado

- Existe justificacion operacional.
- Existe estado protegido.
- No se expone al shopper despues del envio si no corresponde.
- Storage/reglas siguen apagados o pendientes si no estan autorizados.

## Glosario requerido

- formId
- formVersion
- fieldId
- fieldType
- sensitivityLevel
- shopperVisible
- adminVisible
- file_ref_pending_storage
- private_file_ref
- source_safe_ref_only
- postulation_ready_for_review
- missing_required_fields
- sensitive_field_review_required

## Notificaciones Academia

Cuando pase a UI, Academia debe notificar:

- nuevo formulario publicado;
- version de formulario actualizada;
- manual de postulacion actualizado;
- checklist de revision disponible;
- contenido pendiente de revision humana si IA ayuda a redactar.

## Estado seguro

Documento academico. No activa runtime, no escribe Firestore/Storage/HR, no llama Make y no cambia frontend.
