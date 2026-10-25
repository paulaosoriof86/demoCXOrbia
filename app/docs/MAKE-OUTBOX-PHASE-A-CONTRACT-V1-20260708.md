# Make Outbox Phase A Contract v1

Fecha: 2026-07-08  
Bloque: Make/outbox/notificaciones/sync/pagos/IA con gates  
Estado: creado, no conectado, seguro.

## 1. Objetivo

Avanzar el backend real de Phase A definiendo una capa outbox para preparar mensajes, sincronizaciones HR, pagos operativos y borradores IA sin ejecutar providers reales.

Este bloque evita promesas falsas como enviado, sincronizado o pagado cuando Make/WhatsApp/Outlook/HR/Gemini/pagos no estan activos.

## 2. Archivos creados

- `backend/contracts/make-outbox-phase-a-v1.json`
- `backend/adapters/make-outbox-adapter.preview.mjs`
- `tools/contracts/tya-make-outbox-contract-validate.mjs`
- `app/docs/MAKE-OUTBOX-PHASE-A-CONTRACT-V1-20260708.md`

## 3. Canales definidos

- whatsapp;
- email;
- platformNotification;
- hrSync;
- paymentOps;
- geminiReview.

Todos quedan en estado preparado/borrador pendiente hasta gate real.

## 4. Tipos de mensaje Phase A

- applicationApproved;
- visitAssigned;
- visitRescheduleRequested;
- visitOutOfRange;
- questionnairePending;
- certificationAssigned;
- paymentBatchPrepared;
- hrAssignmentSyncPrepared;
- geminiQuestionBankDraft.

## 5. Estados outbox

- prepared_pending_gate;
- blocked_missing_gate;
- blocked_conflict_review;
- draft_pending_human_review;
- ready_for_dispatch;
- dispatch_requested;
- dispatch_confirmed;
- dispatch_failed;
- cancelled.

## 6. Dedupe y conflictos

La deduplicacion solo puede usar llaves estables:

- tenantId;
- projectId;
- entityType;
- entityId;
- messageType;
- recipientRef;
- periodKey.

No se permite dedupe por coincidencia visual simple.
No se permite dispatch duplicado.
Los conflictos deben ir a conflictReviews.

## 7. Datos prohibidos en repo

No deben quedar en repo:

- makeWebhookUrl;
- whatsappProviderToken;
- outlookRefreshToken;
- gmailToken;
- privateRecipientRawList;
- rawPhone;
- rawEmail;
- paymentInstructionRaw;
- providerSecret;
- geminiApiKey.

## 8. Reglas de copy honesto

- No usar enviado hasta dispatch_confirmed.
- No usar HR sincronizada hasta dispatch_confirmed.
- No usar pagado hasta auditoria real de estado de pago.
- No usar IA publicada/final hasta revision humana.

## 9. Gates

- devPrepareOnly: permitido, sin llamadas reales.
- devProviderDispatch: bloqueado.
- stagingProviderDispatch: bloqueado.
- productionProviderDispatch: bloqueado.

## 10. Impacto Phase A

Este bloque cubre necesidades operativas confirmadas:

- postulaciones aprobadas;
- asignaciones de visita;
- reprogramaciones;
- fuera de rango;
- cuestionario pendiente;
- certificaciones;
- liquidaciones/pagos;
- sincronizacion plataforma -> HR;
- sincronizacion HR -> plataforma;
- borradores Gemini para Academia/certificaciones.

## 11. Clasificacion obligatoria

- Reusable CXOrbia: si. Patron outbox/gates/proveedores reusable para otros tenants.
- Exclusivo cliente: parcial. Tipos Phase A nacen de TyA, pero son patrones generalizables.
- Claude/prototipo: si. Claude debe mantener copy honesto y no prometer envio/sync/pago real.
- Academia: si. geminiReview y geminiQuestionBankDraft quedan ligados a revision humana.
- Sin impacto Claude: no.

## 12. Estado final del bloque

- Sin deploy.
- Sin produccion.
- Sin merge final.
- Sin Make real.
- Sin WhatsApp real.
- Sin Outlook real.
- Sin HR writes.
- Sin pagos reales.
- Sin Gemini real.
- Sin imports reales.
- Sin provider real.
- Sin Firestore/Auth/Storage real.
- Sin datos sensibles.
