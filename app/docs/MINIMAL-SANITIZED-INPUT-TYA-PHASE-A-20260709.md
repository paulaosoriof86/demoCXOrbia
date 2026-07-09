# Minimal sanitized input TyA Phase A

Fecha: 2026-07-09  
Bloque: input sanitizado minimo para DEV real-data preview  
Estado: contrato creado, no conectado, seguro.

## 1. Objetivo

Definir los campos minimos que se necesitan para que Paula pueda visualizar TyA/Cinepolis en DEV preview con datos reales/sanitizados, sin PII, sin import real, sin Firestore writes y sin tocar modulos UI.

Este bloque mantiene el foco correcto: produccion real Phase A con informacion real/sanitizada TyA, usando lo ya trabajado y sin pedir HR de nuevo.

## 2. Archivos creados

- `backend/contracts/tya-minimal-sanitized-input-phase-a-v1.json`
- `tools/contracts/tya-minimal-sanitized-input-validate.mjs`
- `app/docs/MINIMAL-SANITIZED-INPUT-TYA-PHASE-A-20260709.md`

## 3. Payload minimo requerido

### 3.1 projectConfig

Debe incluir:

- tenantId;
- projectId;
- projectName;
- clientName;
- countries;
- currencies;
- periods;
- hrSourceRef;
- questionnaireRouting;
- paymentRulesRef;
- certificationRulesRef.

Objetivo: representar Cinepolis como proyecto normal configurable.

### 3.2 periods

Debe incluir:

- periodId;
- sourceTab;
- country;
- periodKey;
- quincenas;
- status;
- expectedVisitCount;
- reviewRequired.

Objetivo: mapear tabs/periodos/pais/quincenas desde HR source-safe.

### 3.3 visits

Debe incluir, para preview visual util:

- visitId;
- hrRowId;
- projectId;
- periodId;
- country;
- cityRef;
- branchRef;
- quincena;
- timeBand;
- availableFrom;
- scheduledDate;
- completedDate;
- questionnaireCompletedDate;
- submittedAt;
- status;
- shopperRef;
- assignmentSource;
- assignmentSyncStatus;
- reviewRequired.

Estados permitidos:

- pending_assignment;
- pending_schedule;
- scheduled;
- completed_pending_questionnaire;
- questionnaire_pending_submit;
- submitted_liquidation_candidate;
- liquidation_payment_control;
- review_required;
- preparation_not_closed.

### 3.4 shoppers

Opcional para primer preview, porque `SHOPPER_REVIEW` sigue bloqueado. Si se incluye debe tener:

- shopperId;
- shopperCode;
- country;
- cityRef;
- status;
- certificationStatus;
- sourceConfidence;
- reviewRequired.

No debe contener DPI, telefono, email, banco ni nombre crudo.

### 3.5 certificationPreservation

Debe incluir:

- shopperRef;
- projectId;
- certificationId;
- status;
- presentedAtRef;
- sourceRef;
- reviewRequired.

Objetivo: no pedir de nuevo certificaciones ya presentadas.

### 3.6 liquidationCandidates

Debe incluir:

- liquidationCandidateId;
- visitId;
- shopperRef;
- projectId;
- periodId;
- country;
- currency;
- honorariumAmount;
- reimbursementAmount;
- totalAmount;
- status;
- requiresFinanceCrosscheck.

Objetivo: representar junio como control de pagos/liquidaciones, no visitas pendientes.

### 3.7 issues

Debe incluir bloqueantes conocidos:

- sensitive_shopper_data_policy;
- questionnaire_marks_duplicate_postulations;
- shopper_canonical_mismatch;
- junio_26_hn_review_required;
- liquidations_require_finance_crosscheck.

## 4. Datos prohibidos

No puede aparecer en ningun payload:

- rawDpi / dpi;
- rawBankAccount / bankAccount;
- rawPhone / phone / telefono;
- rawEmail / email / mail;
- rawShopperName / shopperName / nombreShopper;
- rawHrWorkbook;
- rawCsv;
- privateHrUrl;
- spreadsheetFileId;
- serviceAccountJson;
- signedNdaFile;
- rawEvidence;
- base64Evidence;
- paymentReceiptBinary;
- paymentProviderToken;
- makeWebhookUrl;
- geminiApiKey.

## 5. Niveles de preview

### Level 0 - manifestOnly

Permite renderizar proyecto/periodos readiness. No visitas/shoppers vivos.

### Level 1 - sanitizedVisits

Permite renderizar visitas sanitizadas. Shoppers pueden ser referencias opacas.

### Level 2 - sanitizedOperationalPreview

Permite renderizar proyecto, periodos, visitas, shoppers sanitizados, certificaciones preservadas y liquidaciones candidatas.

Ningun nivel autoriza produccion por si solo.

## 6. Validador creado

`tools/contracts/tya-minimal-sanitized-input-validate.mjs`

Valida:

- contrato seguro;
- projectConfig TyA/Cinepolis;
- periods;
- visits;
- shoppers si existen;
- certificationPreservation;
- liquidationCandidates;
- issues obligatorios;
- ausencia de marcadores PII/proveedores/secrets.

Sin input, funciona como validacion de contrato y queda en manifest-only/contract-only.

## 7. Impacto real en Phase A / produccion

Este bloque define exactamente que debe existir para que la plataforma deje de estar en demo y empiece a mostrar TyA/Cinepolis de forma segura en DEV preview.

No conecta todavia, pero deja el criterio listo para no improvisar.

## 8. Trabajo previo recuperado

Recupera:

- HR viva multi-tab;
- staging canonico source-safe;
- runtime switch gate;
- bridge real-data preview;
- Cinépolis como proyecto normal configurable;
- reglas HR/Q1/Q2;
- certificaciones preservadas;
- liquidaciones junio;
- legacy util como trazabilidad.

## 9. Claude/prototipo

Pendientes derivados:

- UI debe soportar estados de preview por nivel.
- UI no debe mostrar datos reales si solo hay manifest-only.
- Cinépolis no debe hardcodearse.
- Academia debe explicar input sanitizado, review_required y niveles de preview.

## 10. Estado seguro

- Sin deploy.
- Sin produccion.
- Sin runtime switch.
- Sin modulos modificados.
- Sin import real.
- Sin Firestore writes.
- Sin HR writes.
- Sin base vieja conectada.
- Sin datos sensibles.
- Sin Make/Gemini real.
