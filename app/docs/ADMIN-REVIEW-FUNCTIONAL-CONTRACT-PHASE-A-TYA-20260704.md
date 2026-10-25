# Admin review functional contract Phase A TyA

Fecha: 2026-07-04

## Objetivo

Avanzar el pendiente vivo **Revision admin funcional** sin tocar frontend, sin conectar runtime real y sin ejecutar escrituras.

Este bloque define el contrato funcional para que una visita pase desde **cuestionario realizado** hacia **revision admin**, **submitido registrado** y futura **liquidacion**, manteniendo separados los estados operativos.

## Archivos creados

- `app/contracts/admin-review-phase-a.tya.contract.json`
- `tools/migration/tya-admin-review-contract-validator.mjs`

## Principio Phase A

En Phase A, **cuestionario realizado no equivale a submitido**.

La revision admin debe funcionar como una etapa separada entre:

1. visita realizada;
2. cuestionario realizado;
3. revision admin;
4. submitido HR-driven o admin-confirmado desde HR;
5. liquidacion elegible.

## Estados canonicos propuestos

| Estado | Uso |
|---|---|
| `pending_review` | Cuestionario realizado o visita lista para revisar. |
| `in_review` | Admin/ops abrio revision. |
| `needs_correction` | Requiere correccion o seguimiento. |
| `approved_for_submitido` | Revision aprobada, pendiente confirmar submitido. |
| `submitido_registered` | Submitido registrado desde HR o confirmado contra HR. |
| `rejected` | Revision rechazada. |
| `hr_conflict` | Hay conflicto HR/plataforma y no se debe sobrescribir. |
| `cancelled` | Flujo cancelado. |

## Acciones canonicas

- `open_review`
- `request_correction`
- `approve_for_submitido`
- `register_submitido_from_hr`
- `mark_hr_conflict`
- `reject_review`
- `reopen_review`

Todas quedan marcadas en contrato con `writesAllowedNow:false`.

## Campos minimos del registro de revision

- `tenantId`
- `projectId`
- `reviewId`
- `visitId`
- `assignmentId`
- `shopperId`
- `status`
- `source`
- `createdAt`
- `updatedAt`

Campos recomendados para Phase A:

- `hrRowId`
- `hrSourceId`
- `questionnaireMode`
- `questionnaireCompletedAt`
- `questionnaireLink`
- `evidenceStatus`
- `adminReviewerId`
- `adminReviewedAt`
- `reviewNotes`
- `correctionReason`
- `submitidoSource`
- `submitidoAt`
- `hrSubmitidoAt`
- `assignmentSyncStatus`
- `syncConflict`
- `liquidationEligibility`
- `lastSyncedAt`
- `auditTrail`

## Reglas funcionales

- Shopper marca cuestionario realizado, pero eso no debe cerrar submitido.
- Submitido debe venir de HR o de confirmacion admin basada en HR.
- Liquidacion solo debe quedar elegible con `submitido_registered` o excepcion admin documentada.
- Conflictos HR/plataforma no se sobrescriben silenciosamente.
- Cada accion de revision debe anexar auditoria, no reemplazar historial.
- Make queda como gate preparado, no como llamada real.

## Conflictos que deben ir a revision

- `visitId` o `hrRowId` pertenece a otro proyecto.
- Shopper asignado en plataforma difiere del shopper en HR.
- `questionnaireCompletedAt` es posterior a `submitidoAt` sin nota humana.
- HR tiene submitido pero plataforma no tiene cuestionario realizado.
- Plataforma tiene cuestionario realizado pero HR no tiene fila legible.
- Visita cancelada con actividad de revision o submitido.
- Revision duplicada para la misma visita sin marca de superseded.

## Validador seguro

`tools/migration/tya-admin-review-contract-validator.mjs` revisa:

- campos minimos;
- estados terminales;
- transiciones;
- roles actores;
- que las acciones sigan bloqueadas para escritura;
- regla que separa cuestionario realizado de submitido;
- hard stop de Make.

Comando futuro de lectura local:

```bash
node tools/migration/tya-admin-review-contract-validator.mjs
```

No conecta Firebase, no importa datos, no escribe Firestore y no llama Make.

## Impacto para Claude / prototipo comercializable

No se modifico frontend en este bloque.

Pero el prototipo comercializable debe incorporar esta separacion conceptual:

- mostrar cuestionario realizado, revision, submitido y liquidacion como pasos separados;
- no presentar submitido como sinonimo de cuestionario realizado;
- permitir que cada proyecto configure origen de submitido: HR, plataforma, sistema externo o confirmacion manual;
- mantener estados honestos de Make/HR mientras los gates esten apagados;
- usar etiquetas visibles por tenant/proyecto, pero mantener estados canonicos internos.

## Estado seguro

- Sin deploy.
- Sin produccion.
- Sin Firestore writes reales.
- Sin Auth real activado.
- Sin Make/Gemini/WhatsApp API real.
- Sin runtime backend conectado.
- Sin cambios frontend.
