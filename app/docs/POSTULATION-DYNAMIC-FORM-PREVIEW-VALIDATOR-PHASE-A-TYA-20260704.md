# Postulation dynamic form preview validator Phase A TyA

Fecha: 2026-07-04

## Objetivo

Cerrar el siguiente bloque largo backend: preview validator de ficha de postulacion dinamica, usando como gates previos la politica de datos sensibles, assignment sync/conflicts y visit lifecycle/reservas.

Este bloque valida formularios dinamicos de postulacion por tenant/proyecto/version y postulaciones shopper usando solo datos sinteticos o sanitizados. No escribe Firestore, no sube Storage, no escribe HR, no llama Make y no usa datos reales.

## Archivos creados

- `app/contracts/postulation-dynamic-form-preview-phase-a.tya.contract.json`
- `tools/migration/tya-postulation-dynamic-form-preview-validator.mjs`

## Dependencias documentales

- `app/contracts/sensitive-data-policy-phase-a.tya.contract.json`
- `app/contracts/assignment-sync-conflict-preview-phase-a.tya.contract.json`
- `app/contracts/visit-lifecycle-reservation-preview-phase-a.tya.contract.json`
- `app/contracts/project-wizard-phase-a.tya.contract.json`

## Que valida

1. Gates apagados: runtime, produccion, Firestore, Storage, HR, Make e import real.
2. Input source-safe: `sourceSafe=true`, `containsRawSensitiveData=false`, `isSyntheticOrSanitized=true`.
3. Ausencia de campos privados crudos o archivos raw.
4. Configuracion de formulario por `tenantId`, `projectId`, `formId`, `formVersion`.
5. Campos con `fieldId`, tipo, requerido, sensibilidad y visibilidad.
6. Campos privados como referencias, no como contenido crudo.
7. Postulacion con shopper, formulario, version y referencia estable de visita cuando aplique.
8. Postulacion valida queda para revision, no como asignacion ni HR sync.

## Entrada segura esperada

```json
{
  "sourceSafe": true,
  "containsRawSensitiveData": false,
  "isSyntheticOrSanitized": true,
  "forms": [
    {
      "tenantId": "tya",
      "projectId": "cinepolis_gt",
      "formId": "postulation_form_cinepolis_v1",
      "formVersion": "1.0.0",
      "title": "Postulacion Cinepolis",
      "status": "preview_ready",
      "fields": [
        {
          "fieldId": "proposedDate",
          "label": "Fecha propuesta",
          "type": "date",
          "required": true,
          "sensitivityLevel": "public_operational",
          "shopperVisible": true,
          "adminVisible": true
        },
        {
          "fieldId": "privateDocumentRef",
          "label": "Referencia privada pendiente",
          "type": "file_ref_pending_storage",
          "required": false,
          "sensitivityLevel": "source_safe_ref_only",
          "shopperVisible": false,
          "adminVisible": true
        }
      ]
    }
  ],
  "postulations": [
    {
      "tenantId": "tya",
      "projectId": "cinepolis_gt",
      "formId": "postulation_form_cinepolis_v1",
      "formVersion": "1.0.0",
      "postulationId": "postulation_ref_001",
      "shopperId": "shopper_ref_001",
      "visitScoped": true,
      "visitId": "visit_ref_001",
      "hrRowId": "hr_row_ref_001",
      "answers": {
        "proposedDate": "2026-06-18",
        "privateDocumentRef": "pending_storage:document_ref_001"
      }
    }
  ]
}
```

## Uso futuro local seguro

```bash
node tools/migration/tya-postulation-dynamic-form-preview-validator.mjs
node tools/migration/tya-postulation-dynamic-form-preview-validator.mjs --input path/to/postulation-dynamic-form-preview.json
```

Si se ejecuta sin `--input`, el script solo revisa contratos.

## Outcomes de preview

- `form_config_ready`
- `form_config_review_required`
- `postulation_ready_for_review`
- `missing_required_fields`
- `sensitive_field_review_required`
- `manual_review_required`
- `conflict_review_required`

## Reglas clave

- El formulario debe ser configurable por tenant/proyecto/formVersion.
- No debe estar hard-codeado solo para Cinepolis.
- Cada campo debe tener `fieldId` estable.
- Campos privados deben quedar como referencias o pendientes de backend.
- Postulacion no es asignacion.
- Postulacion aprobada entra despues al gate de assignment sync.
- Postulacion no significa HR sincronizada.
- Si apunta a una visita, debe tener `visitId`, `hrRowId` o `sourceVisitRef`.
- Fechas propuestas pasan despues por el validator de visit lifecycle/reservas.

## Pendientes backend derivados

1. Preparar input sintetico/sanitizado para escenarios de formularios dinamicos.
2. Integrar este validator a una secuencia local segura cuando exista runner consolidado.
3. Crear preview validator de notification outbox.
4. Relacionar aprobacion de postulacion con assignment sync sin activar Make.
5. Mantener Storage privado pendiente hasta reglas y autorizacion.

## Pendientes prototipo / Claude derivados

1. Ficha de postulacion debe ser dinamica por proyecto/version.
2. Debe soportar campos requeridos, opcionales, de referencia privada y computed read-only.
3. Debe mostrar estados honestos: protegido, pendiente backend, privado, requiere autorizacion.
4. No debe mostrar archivo privado/raw al shopper.
5. Debe separar postulacion, aprobacion, asignacion, HR sync y agenda.
6. Debe documentar si ficha frontal/dorso sigue pendiente o queda cubierta por configuracion dinamica.

## Impacto Academia

Academia debe crear/profundizar curso Shopper de postulacion, curso Ops de revision, curso Admin de configuracion de formulario, curso Superadmin de versionado/sensibilidad, manual de fichas dinamicas, checklists antes de publicar/aprobar/pedir dato privado y glosario de `formId`, `formVersion`, `fieldId`, `sensitivityLevel`, `source_safe_ref_only`, `file_ref_pending_storage`.

## Estado seguro

Sin cambios frontend, sin runtime, sin deploy, sin produccion, sin import real, sin Firestore writes, sin Storage writes, sin HR writes, sin Make/Gemini/correo real y sin datos sensibles.
