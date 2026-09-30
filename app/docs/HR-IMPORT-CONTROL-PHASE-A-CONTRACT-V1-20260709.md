# HR Import Control Phase A Contract v1

Fecha: 2026-07-09  
Bloque: HR import/control historico Phase A  
Estado: creado, no conectado, seguro.

## 1. Objetivo

Avanzar Phase A en el puente entre HR, visitas, shoppers historicos, certificaciones ya presentadas y liquidaciones sin conectar una base vieja ni subir datos crudos al repo.

El bloque protege una regla operacional critica: HR es fuente operacional, pero el import debe ser sanitizado, auditable y con conflictos visibles.

## 2. Archivos creados

- `backend/contracts/hr-import-control-phase-a-v1.json`
- `backend/adapters/hr-import-control-adapter.preview.mjs`
- `tools/contracts/tya-hr-import-control-contract-validate.mjs`
- `app/docs/HR-IMPORT-CONTROL-PHASE-A-CONTRACT-V1-20260709.md`

## 3. Colecciones definidas

- hrSources;
- hrImportRuns;
- hrRowsStaging;
- visitSourceMap;
- shopperSourceMap;
- certificationSourceMap;
- importConflicts.

## 4. Modos de import

- dry_run: validar y reportar sin writes;
- staging_sanitized: staging sanitizado bajo gate;
- promote_reviewed: promocion revisada bajo gate;
- rollback: rollback controlado sin delete destructivo por defecto.

## 5. Estados

- pending_source_review;
- sanitized_preview;
- ready_for_review;
- review_required;
- approved_for_staging;
- staged_sanitized;
- approved_for_promote;
- promoted_audited;
- rejected_with_audit;
- rolled_back_audited.

## 6. Llaves estables

No se deduplica por nombre visual. El contrato usa:

- tenantId;
- projectId;
- hrSourceId;
- importRunId;
- hrRowId;
- visitId;
- visitSourceKey;
- shopperId;
- shopperSourceKey;
- assignmentId;
- certificationSourceId;
- country;
- periodKey;
- quincena.

## 7. Reglas Phase A protegidas

- HR es fuente operacional.
- El import historico completo es base de control.
- Shoppers historicos deben salir de HR o mapas revisados.
- Certificaciones ya presentadas deben conservarse para no pedirlas otra vez.
- Visitas hasta junio ya estan ejecutadas.
- Junio pendiente es pago/liquidacion, no visita.
- Cuestionario puede ser CXOrbia, TyAOnline, externo, link general o link por visita desde HR.
- Asignaciones HR/plataforma requieren tracking de source/sync y conflictos.

## 8. Datos prohibidos en repo

- rawHrWorkbook;
- rawHrCsv;
- rawDpi;
- rawPassport;
- rawBankAccount;
- rawPhone;
- rawEmail;
- signedNdaFile;
- privateHrUrl;
- hrCredential;
- serviceAccountJson;
- rawEvidenceBinary;
- base64Evidence.

## 9. Gates

- devDryRun: permitido sin writes.
- devStagingWrite: bloqueado.
- stagingPromote: bloqueado.
- productionPromote: bloqueado.
- hrWriteBack: bloqueado hasta Make/outbox gate.

## 10. Impacto Phase A

Este bloque cierra el puente entre:

- HR fuente;
- visitas operativas;
- shoppers historicos;
- certificaciones presentadas;
- liquidaciones/pagos;
- conflictos de asignacion;
- cuestionario por proyecto/visita;
- multi-proyecto, pais, quincena y periodo.

## 11. Clasificacion obligatoria

- Reusable CXOrbia: si. Patron reusable para imports historicos limpios por tenant/proyecto.
- Exclusivo cliente: parcial. HR TyA y junio/pagos son reglas del cliente actual.
- Claude/prototipo: si. Claude debe evitar UI que sugiera import real si solo hay dry-run/staging.
- Academia: si. Preserva certificaciones ya presentadas y rutas por rol.
- Sin impacto Claude: no.

## 12. Estado final del bloque

- Sin deploy.
- Sin produccion.
- Sin merge final.
- Sin base vieja conectada.
- Sin import real.
- Sin staging write real.
- Sin HR writes.
- Sin datos sensibles.
- Sin Firestore/Auth/Storage real.
- Sin Make/Gemini real.
