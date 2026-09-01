# Level 2 sanitized operational TyA Phase A

Fecha: 2026-07-09  
Bloque: Level 2 operacional sanitizado  
Estado: contrato y validador creados, no conectado, seguro.

## 1. Objetivo

Definir el payload Level 2 para preparar una vista operacional DEV preview de TyA/Cinepolis con:

- shoppers sanitizados;
- preservacion de certificaciones ya presentadas;
- liquidaciones candidatas/control de pago;
- issues obligatorios;
- sin PII;
- sin base vieja;
- sin imports;
- sin writes;
- sin runtime switch.

Este bloque mantiene el foco en produccion real Phase A porque cubre los tres puntos que quedaban despues de Level 1: shoppers, certificaciones y liquidaciones/pagos.

## 2. Archivos creados

- `backend/contracts/tya-level2-sanitized-operational-phase-a-v1.json`
- `tools/contracts/tya-level2-sanitized-operational-validate.mjs`
- `app/docs/LEVEL2-SANITIZED-OPERATIONAL-TYA-PHASE-A-20260709.md`

## 3. Que cubre Level 2

Level 2 permite preparar preview con:

- proyecto;
- periodos;
- visitas sanitizadas;
- shoppers sanitizados;
- certificaciones preservadas;
- liquidaciones candidatas;
- bloqueos conocidos.

No autoriza produccion.

## 4. Shoppers sanitizados

Campos requeridos:

- shopperId;
- shopperCode;
- country;
- cityRef;
- status;
- certificationStatus;
- sourceConfidence;
- reviewRequired;
- sourceRefs.

Estados permitidos:

- active_preview;
- certified_preview;
- pending_review;
- inactive_preview;
- duplicate_review_required;
- access_pending.

Reglas:

- no DPI;
- no banco;
- no telefono;
- no email;
- no nombre crudo;
- no dedupe por nombre visual;
- `SHOPPER_REVIEW` sigue en review_required si no hay llave estable.

## 5. Certificaciones preservadas

Campos requeridos:

- shopperRef;
- projectId;
- certificationId;
- status;
- presentedAtRef;
- sourceRef;
- reviewRequired;
- preserveWithoutRetake.

Estados permitidos:

- presented_preserved_preview;
- approved_preserved_preview;
- pending_mapping_review;
- not_presented;
- rule_requires_retake_review.

Regla principal: certificaciones ya presentadas/aprobadas no deben pedirse de nuevo salvo regla explicita del proyecto.

## 6. Liquidaciones candidatas

Campos requeridos:

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
- requiresFinanceCrosscheck;
- auditRef.

Estados permitidos:

- payment_control_preview;
- submitted_liquidation_candidate;
- pending_submit_review;
- review_required;
- excluded_preparation_period;
- paid_requires_audit_evidence.

Reglas:

- junio pendiente es control de pagos/liquidaciones, no visitas pendientes;
- pagado no se acepta sin auditoria/evidencia;
- honorario, reembolso y total deben separarse;
- montos pueden existir solo como totales operativos, sin banco.

## 7. Issues obligatorios

Todo payload Level 2 debe incluir:

- sensitive_shopper_data_policy;
- questionnaire_marks_duplicate_postulations;
- shopper_canonical_mismatch;
- junio_26_hn_review_required;
- liquidations_require_finance_crosscheck;
- certification_preservation_mapping_required.

## 8. Validador creado

`tools/contracts/tya-level2-sanitized-operational-validate.mjs`

Valida:

- contrato seguro;
- top-level keys;
- shoppers;
- certificaciones;
- liquidaciones;
- issues obligatorios;
- ausencia de PII/secrets/base vieja;
- que no haya pago final sin auditoria.

## 9. Impacto real en Phase A / produccion

Este bloque prepara el control operacional completo para DEV preview:

- no solo visitas;
- tambien shoppers historicos;
- certificaciones que no deben repetirse;
- pagos/liquidaciones de junio;
- bloqueos de import.

## 10. Trabajo previo recuperado

Recupera:

- shoppers historicos desde HR/plataforma actual;
- accesos/postulaciones como trazabilidad;
- certificaciones ya presentadas;
- liquidaciones/pagos de junio;
- RTDB/legacy solo como fuente de aprendizaje/trazabilidad, no como base a copiar;
- reglas de no PII y no old DB.

## 11. Claude/prototipo

Pendientes derivados:

- UI debe diferenciar Level 2 preview de import real.
- Shoppers pueden aparecer como perfiles sanitizados/opacos si no hay datos completos seguros.
- Certificaciones preservadas deben verse como conservadas/no repetir.
- Liquidaciones deben verse como control de pago, no pagado final.
- Academia debe explicar preservacion de certificaciones, pagos y PII.

## 12. Siguiente bloque

Crear generador Level 2 desde payload Level 1 + outputs sanitizados de shoppers/certificaciones/liquidaciones cuando existan. Si no existen, preparar el mapeo minimo para extraerlos localmente sin PII.

## 13. Estado seguro

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
