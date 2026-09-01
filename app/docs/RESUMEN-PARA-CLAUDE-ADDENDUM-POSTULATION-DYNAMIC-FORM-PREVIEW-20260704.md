# Resumen para Claude addendum - Postulation dynamic form preview

Fecha: 2026-07-04

## Que hizo backend

Backend preparo un contrato y validator preview para ficha de postulacion dinamica por tenant/proyecto/version.

Archivos agregados:

- `app/contracts/postulation-dynamic-form-preview-phase-a.tya.contract.json`
- `tools/migration/tya-postulation-dynamic-form-preview-validator.mjs`
- `app/docs/POSTULATION-DYNAMIC-FORM-PREVIEW-VALIDATOR-PHASE-A-TYA-20260704.md`
- `app/docs/ACADEMIA-IMPACT-POSTULATION-DYNAMIC-FORM-PREVIEW-TYA-20260704.md`
- `app/docs/CAMBIOS-BACKEND-ADDENDUM-POSTULATION-DYNAMIC-FORM-PREVIEW-20260704.md`

No se activo runtime ni integraciones reales.

## Reglas que debe reflejar el prototipo

1. Ficha de postulacion debe ser dinamica por proyecto y version.
2. No debe estar hard-codeada solo para Cinepolis.
3. Cada campo debe tener identificador estable.
4. Campos privados deben mostrarse como protegidos, referencia privada o pendiente backend.
5. Postulacion no es asignacion.
6. Aprobacion de postulacion entra despues al gate de assignment sync.
7. Postulacion no significa HR sincronizada.
8. Si apunta a visita, debe conservar `visitId`, `hrRowId` o `sourceVisitRef`.
9. Fecha propuesta se valida despues con availableFrom, franja y quincena.

## Pendientes frontend concretos

### Ficha de postulacion

- Soportar campos por configuracion.
- Soportar campos requeridos/opcionales.
- Soportar campos de referencia privada sin exponer raw.
- Mostrar errores por campos faltantes.
- Mostrar version de ficha o al menos conservarla internamente.

### Postulaciones admin/ops

- Mostrar postulacion lista para revision.
- Mostrar campos faltantes.
- Mostrar revision manual si falta referencia estable.
- No prometer HR sync real al aprobar.
- Pasar aprobacion a assignment sync como pendiente/preparada.

### Academia

- Agregar curso shopper de postulacion.
- Agregar curso ops de revision.
- Agregar curso admin/superadmin de configuracion y versionado.
- Agregar checklist antes de publicar formulario.
- Agregar checklist antes de aprobar postulacion.
- Agregar glosario de formId, formVersion, fieldId, sensitivityLevel y postulation_ready_for_review.

## No tocar

- `tools/migration`.
- `app/contracts`.
- Gates backend.
- Make/HR/Firestore/Storage reales.
- Datos reales o sensibles.

## Estado seguro

Documento/validator backend. No autoriza produccion, deploy, import real ni escrituras reales.
