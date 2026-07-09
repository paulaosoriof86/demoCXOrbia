# Auditoria forense - Avance backend Phase A CXOrbia TyA

Fecha: 2026-07-09  
Repo: `paulaosoriof86/demoCXOrbia`  
Rama: `docs-tya-v6-v71-audit`  
PR: #7 draft/open/no merged  
Baseline viva: V91 incremental  
Estado: auditoria de avance, no produccion.

## 1. Objetivo de esta auditoria

Dejar trazabilidad clara de todo lo avanzado en backend, distinguir avances reales de bloqueos, identificar reprocesos, ubicar el estado frente al plan Phase A y definir que falta por fase.

Esta auditoria no activa backend real, no hace deploy, no importa datos, no toca proveedores y no reemplaza el smoke humano pendiente.

## 2. Reglas metodologicas usadas

- El prototipo manda.
- No se deben reescribir modulos UI desde backend.
- Los cambios backend deben vivir en contratos, adapters, tools, gates y docs.
- La conexion futura de `CX.data` debe respetar la interfaz actual.
- No se conecta base vieja.
- No se suben datos sensibles.
- Todo bloque debe quedar documentado.
- Todo bloque debe clasificar impacto reusable, cliente, Claude/prototipo y Academia.

## 3. Avance por macro-bloques

### 3.1 Auditoria y empalme V91

Estado: avanzado para RC controlada, pendiente smoke humano real.

Avanzado:

- Auditoria forense de candidata V91.
- Source lock documental/controlado V91.
- Baseline V91 incremental.
- Empalme controlado por batches.
- `app/index.html` preserva `core/production-copy-guard.js`.
- `app/sw.js` actualizado con cache `cxorbia-v2`, purge y network-first.
- Modulos V91 agregados: `diagnostico.js`, `administrabilidad.js`.
- Registro controlado V91 via `app/core/v91-modules.js` sin reemplazar `config.js`.
- Patches seguros para Academia: `academia-admin-actions.js` y `academia-create-ai-stable.js`.
- RC smoke gate ampliado para cobertura V91/Academia.

Pendiente:

- Smoke humano real en URL validable.
- Consolidar patches de Academia dentro de `academia.js` solo si Claude/prototipo lo hace sin romper.
- Limpieza fuente permanente de copy P0 modulo por modulo.

Riesgo:

- Empalme visual consume mucha capacidad. Debe reservarse Claude solo para 3-5 cambios frontend concretos.

### 3.2 Gates, deploy DEV y hosting

Estado: gates tecnicos avanzados; deploy DEV root bloqueado por secret/configuracion.

Avanzado:

- Predeploy Gate.
- Drift Gate.
- RC Smoke Gate.
- Visual Smoke automatizado.
- Workflow DEV root con verificacion de URL.
- Readiness de hosting documentado.

Bloqueo real:

- `FIREBASE_SERVICE_ACCOUNT_CXORBIA_BACKEND_DEV` falta o no esta disponible para el workflow.
- Cuando Drift paso, el deploy fallo en `Secret availability check`; deploy y verify quedaron skipped.

Pendiente:

- Configurar secret correcto o definir deploy alternativo controlado.
- No pedir visualizacion hasta URL verificada.
- Luego pedir smoke humano focalizado.

Reproceso detectado:

- Se perdio tiempo con URLs no verificadas. Se corrigio metodologia: no dar URL sin evidencia real de deploy.

### 3.3 Contrato CX.data -> Firestore

Estado: creado, no conectado, seguro.

Archivos:

- `backend/contracts/cxdata-firestore-phase-a-v1.json`.
- `backend/adapters/firebase-cxdata-adapter.preview.mjs`.
- `tools/release/tya-cxdata-firestore-contract-validate.mjs`.
- `app/docs/CXDATA-FIRESTORE-PHASE-A-CONTRACT-V1-20260708.md`.

Avanzado:

- Define interfaz minima `get`, `set`, `remove`, `list`, `upsert`, `seed`, `export`.
- Define colecciones base: tenants, projects, visits, assignments, shoppers, applications, certifications, liquidations, hrImports, conflictReviews, outbox, auditLog.
- Define llaves estables para sync HR/plataforma.
- Bloquea writes por defecto.

Pendiente:

- Implementar adapter real cuando existan reglas y proyecto backend limpio configurado.
- Conectar en unico punto futuro de `CX.data`, no en modulos UI.
- Agregar pruebas de compatibilidad con llamadas actuales de `CX.data`.

### 3.4 Auth/RBAC

Estado: contrato creado, no conectado, seguro.

Archivos:

- `backend/contracts/auth-rbac-phase-a-v1.json`.
- `tools/release/tya-auth-rbac-contract-validate.mjs`.
- `app/docs/AUTH-RBAC-PHASE-A-CONTRACT-V1-20260708.md`.

Avanzado:

- Roles Phase A: tenantAdmin, projectAdmin, financeAdmin, certificationAdmin, shopper.
- Rutas protegidas: dashboard, postulaciones, reservas, automatizaciones, cuestionarioShopper, finanzas, academia, diagnostico, administrabilidad.
- Gates Auth definidos.
- Politica de datos prohibidos en repo.

Pendiente:

- Firebase Auth real o proveedor decidido.
- Custom claims y reglas solo bajo gate.
- Usuarios test sanitizados.
- Smoke de rutas por rol.

### 3.5 Storage/evidencias/documentos sensibles/NDA

Estado: contrato y adapter preview creados, no conectados, seguros.

Archivos:

- `backend/contracts/storage-evidence-phase-a-v1.json`.
- `backend/adapters/firebase-storage-evidence-adapter.preview.mjs`.
- `tools/contracts/tya-storage-evidence-contract-validate.mjs`.
- `app/docs/STORAGE-EVIDENCE-PHASE-A-CONTRACT-V1-20260708.md`.

Avanzado:

- Scopes: visitEvidence, shopperDocuments, hrImports, liquidationSupports, academyAssets.
- Sensibilidad: publicProduct, internalRestricted, operationalRestricted, sensitiveRestricted, financialRestricted.
- Adapter bloquea uploads/downloads/signed URLs por defecto.
- Politica contra DPI, banco, NDA firmado, URLs privadas, base64 y binarios.

Pendiente:

- Reglas Storage reales.
- Manifiesto de metadata y retencion.
- Subida real solo con archivos test y gate.
- UI futura con copy honesto: evidencia preparada/subida pendiente.

### 3.6 Make/outbox/notificaciones/HR sync/pagos/Gemini

Estado: contrato y adapter preview creados, no conectados, seguros.

Archivos:

- `backend/contracts/make-outbox-phase-a-v1.json`.
- `backend/adapters/make-outbox-adapter.preview.mjs`.
- `tools/contracts/tya-make-outbox-contract-validate.mjs`.
- `app/docs/MAKE-OUTBOX-PHASE-A-CONTRACT-V1-20260708.md`.

Avanzado:

- Canales: whatsapp, email, platformNotification, hrSync, paymentOps, geminiReview.
- Tipos: applicationApproved, visitAssigned, visitRescheduleRequested, visitOutOfRange, questionnairePending, certificationAssigned, paymentBatchPrepared, hrAssignmentSyncPrepared, geminiQuestionBankDraft.
- Estados: prepared_pending_gate, blocked_missing_gate, blocked_conflict_review, draft_pending_human_review, ready_for_dispatch, dispatch_requested, dispatch_confirmed, dispatch_failed, cancelled.
- Dedupe por llaves estables, no visual.
- Copy honesto definido para enviado/sync/pagado/IA.

Pendiente:

- Make real con webhook secreto fuera del repo.
- Outbox persistence real.
- Provider confirmations.
- Rate limit/retry policy.
- HR writeback real solo despues de conflict review.

### 3.7 Liquidaciones/pagos Phase A

Estado: contrato y adapter preview creados, no conectados, seguros.

Archivos:

- `backend/contracts/liquidations-payments-phase-a-v1.json`.
- `backend/adapters/liquidations-payment-state-adapter.preview.mjs`.
- `tools/contracts/tya-liquidations-payments-contract-validate.mjs`.
- `app/docs/LIQUIDATIONS-PAYMENTS-PHASE-A-CONTRACT-V1-20260708.md`.

Avanzado:

- Reconoce que visitas hasta junio estan ejecutadas y junio pendiente es pagos/liquidaciones.
- Colecciones: liquidations, paymentBatches, paymentStateAudit, paymentConflicts.
- Estados de liquidacion y lote.
- Validacion HR/cuestionario/submitido para pago final.
- Separacion honorario, reembolso y total.
- Bloqueo de datos bancarios/recibos/base64.
- No ejecuta pagos reales.

Pendiente:

- Calculo real desde HR/proyecto.
- Dry-run con datos sanitizados.
- Estado junio inicial.
- Reglas por pais/moneda/proyecto.
- Vista shopper/admin futura con estados honestos.

### 3.8 HR import/control historico

Estado: contrato y adapter preview creados, no conectados, seguros.

Archivos:

- `backend/contracts/hr-import-control-phase-a-v1.json`.
- `backend/adapters/hr-import-control-adapter.preview.mjs`.
- `tools/contracts/tya-hr-import-control-contract-validate.mjs`.
- `app/docs/HR-IMPORT-CONTROL-PHASE-A-CONTRACT-V1-20260709.md`.

Avanzado:

- Colecciones: hrSources, hrImportRuns, hrRowsStaging, visitSourceMap, shopperSourceMap, certificationSourceMap, importConflicts.
- Modos: dry_run, staging_sanitized, promote_reviewed, rollback.
- Preserva HR como fuente operacional.
- Protege shoppers historicos y certificaciones ya presentadas.
- Evita tratar junio como visitas pendientes cuando son pagos.
- Bloquea base vieja, payload HR crudo y HR writes.

Pendiente:

- Implementar dry-run real sobre export HR sanitizado.
- Manifiesto de source lock HR.
- Reglas de mapping por proyecto.
- Revision de conflictos y promocion controlada.

## 4. Estado frente al plan Phase A

### Fase A0 - Baseline/prototipo/source lock

Estado: avanzado.

Hecho:

- V91 auditada y empalmada de forma controlada.
- Docs y gates principales creados.

Falta:

- Smoke humano en URL real.
- Decision de RC controlada.

### Fase A1 - Contrato de datos/base limpia

Estado: parcialmente avanzado.

Hecho:

- Contrato CX.data Firestore.
- Adapter preview no conectado.
- Colecciones base multi-tenant.

Falta:

- Proyecto backend limpio operativo.
- Reglas Firestore.
- Adapter real read-only.
- Conectar un unico punto `CX.data` cuando pase gate.

### Fase A2 - Auth/RBAC

Estado: contrato avanzado, implementacion pendiente.

Hecho:

- Roles, rutas, permisos y gates.

Falta:

- Auth real.
- Claims.
- Usuarios test.
- Reglas por rol.

### Fase A3 - Storage/evidencias/NDA

Estado: contrato avanzado, implementacion pendiente.

Hecho:

- Politica Storage/evidencias/documentos sensibles.

Falta:

- Rules Storage.
- Uploads test.
- Metadata real.

### Fase A4 - HR import historico

Estado: contrato avanzado, dry-run pendiente.

Hecho:

- Contrato HR import/control.
- Mapeos source y conflictos.

Falta:

- Script dry-run sobre export real sanitizado.
- Reporte de filas/visitas/shoppers/certificaciones/liquidaciones.
- Promocion revisada.

### Fase A5 - Sincronizacion HR/plataforma y outbox

Estado: contrato avanzado, provider pendiente.

Hecho:

- Make/outbox con gates y dedupe.

Falta:

- Make real.
- Webhooks/secrets fuera de repo.
- Confirmaciones provider.
- HR writeback.

### Fase A6 - Liquidaciones/pagos

Estado: contrato avanzado, calculo real pendiente.

Hecho:

- Estados, lote, auditoria, datos prohibidos.

Falta:

- Dry-run real de junio.
- Estado de pago inicial por shopper/visita.
- Regla final por proyecto/pais/moneda.

### Fase A7 - Academia/Gemini

Estado: empalme UI parcial y contrato outbox IA avanzado.

Hecho:

- Acciones admin visibles como patch.
- Crear con IA preview estable.
- Gemini queda como borrador/revision humana por outbox.

Falta:

- Consolidar en prototipo con Claude si conviene.
- Contrato Gemini especifico completo.
- Bancos por proyecto con revision humana y versionado.

### Fase A8 - Deploy/RC/cutover

Estado: bloqueado por secret.

Hecho:

- Workflows, gates, readiness.

Falta:

- `FIREBASE_SERVICE_ACCOUNT_CXORBIA_BACKEND_DEV`.
- Deploy DEV verificado.
- Smoke humano.
- Cutover a `tya-plataforma.web.app` con GO explicito.

## 5. Reprocesos o desvio detectado

### Reproceso 1: URL DEV/preview

Se perdio tiempo intentando validar una URL sin evidencia real de deploy. Correccion aplicada: no pedir visualizacion sin deploy verificado.

### Reproceso 2: Drift gate permitia menos tipos de backend preview de los necesarios

Se corrigio allowlist para contratos/adapters/validators backend preview. No se abrio runtime app.

### Reproceso 3: Empalme frontend consume demasiado

Se debe reservar Claude para cambios frontend compactos y de alto impacto, no para criterios dispersos.

## 6. Pendientes Claude/prototipo acumulados, pero todavia no enviados

Se debe enviar paquete Claude solo cuando sea corto y accionable. Pendientes acumulados:

1. Copy honesto outbox: preparado/pendiente, no enviado.
2. Copy honesto HR: sync preparada/pendiente, no sincronizada.
3. Copy honesto pagos: preparado/programado no significa pagado.
4. Pagado solo con auditoria/evidencia.
5. Separar honorario, reembolso, total, pais, moneda, periodo y quincena.
6. Mostrar `review_required` cuando falte HR, submitido, evidencia o haya conflicto.
7. UI debe distinguir dry-run, staging sanitizado y promocion revisada.
8. No tratar junio como visitas pendientes si corresponde a pagos/liquidaciones.
9. Mantener Gemini como borrador/revision humana, no final/publicado.
10. Consolidar patches de Academia si Claude puede hacerlo sin romper.

Decision actual: aun no enviar a Claude salvo que Paula pida paquete o que aparezcan 3-5 fixes frontend bloqueantes verificados.

## 7. Proximo bloque recomendado

Prioridad tecnica inmediata:

1. Crear contrato Gemini/certificaciones con revision humana, porque falta aislar provider IA de Academia y certificaciones.
2. Luego crear contrato Firestore rules/indexes preview.
3. Luego crear dry-run real de HR import usando export sanitizado cuando la fuente este disponible.
4. En paralelo, resolver secret DEV deploy solo cuando Paula pueda/quiera revisar configuracion.

## 8. Estado seguro global

- Sin produccion.
- Sin merge final.
- Sin base vieja conectada.
- Sin Firestore real conectado.
- Sin Auth real conectado.
- Sin Storage real conectado.
- Sin imports reales.
- Sin HR writes.
- Sin Make real.
- Sin Gemini real.
- Sin pagos reales.
- Sin datos sensibles crudos en repo.
