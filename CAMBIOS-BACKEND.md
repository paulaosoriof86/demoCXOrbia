# CAMBIOS-BACKEND.md

**SYNC_EPOCH:** `CXORBIA-20260819-I4B-READINESS-PROVIDER-SOURCE-READY-26`

## I4-B readiness cerrado
Creado `backend/runtime/cxorbia-visit-lifecycle-command-provider-v1.mjs`: provider reusable source-only para postulación, decisión/asignación, estados de visita, reprogramación, cancelación, cuestionario y revisión. Enforce Auth token + membership + tenant/project/role/shopper scope, idempotencia, expectedVersion, command receipt, audit y ACK.

Creado `backend/contracts/i4b-visit-lifecycle-provider-command-v1.json`: contrato y gate E2E único futuro.

Creado `tools/verify-cxorbia-i4b-visit-provider-source.mjs`: verificador source de command set, writes cerrados y gaps UI conocidos.

Evidencia: `app/docs/evidence/I4B-VISIT-LIFECYCLE-READINESS-LATEST.json`.

No se cargó transport HTTP, no se habilitaron command writes y no se ejecutaron provider/Auth/Firestore/HR/Rules/Storage/Make/Gemini/pagos/deploy/merge/prod writes.

## Handoff Claude
- `app/modules/visita-detalle.js`: conectar envío real de postulación a `application.create` + ACK.
- `app/modules/postulaciones.js`: retirar mutaciones locales de decisión/cancelación y consumir comandos + ACK.
- `app/modules/cuestionario-shopper.js`: no mutar score/submit antes de ACK; usar `submitQuestionnaire`.
- `app/modules/revision-admin.js`: sustituir persistencia local por command/ACK de revisión.

## Avance
Formal 60/40; técnicamente I4-A PASS/frozen e I4-B readiness PASS source-only.

## Siguiente
`NEW_AUTH_REQUIRED_I4B_SINGLE_DEV_VISIT_LIFECYCLE_E2E_WRITE_GATE__SYNTHETIC_VISIT_ONLY`.

Clasificación: Reusable CXOrbia = provider/contract/verifier; Exclusivo TyA = tenant/project y HR 15/660 preservada; Claude/prototipo = 4 handoffs; Academia = sin cambio funcional hasta E2E; Sin impacto Claude = evidence/source truth.
