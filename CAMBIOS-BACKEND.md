# CAMBIOS-BACKEND.md

## 2026-07-20 — Corte 1A lectura HR viva runtime y eliminación de snapshot como verdad operativa

- La validación visual de Paula bloqueó el freeze de Corte 1 por inconsistencias entre KPI, detalle, reportes y cambio de periodo.
- Se demostró la causa raíz: `tools/release/tya-r21-build-and-gates.sh` reutilizaba por defecto un `FROZEN_SOURCE_URL`, validaba conteos fijos del snapshot aprobado y el adapter declaraba `runtimeSyncActive:false`.
- Se creó `backend/contracts/phase-a-live-hr-runtime-read-v1.json`: lectura server-side, source-safe, sin workbook crudo en navegador, sin conteos fijos y con una sola revisión para KPI/detalle/reportes.
- Se creó `tools/qa/tya-live-hr-read-probe-gate.mjs` y `.github/workflows/cxorbia-phase-a-live-hr-read-probe.yml`.
- El probe read-only pasó en el commit `de508a8b60f63b60fae0aacf4a8fc464e164c4d9` con estado `cxorbia/live-hr-read-probe: success`.
- Se creó el servicio source-safe `backend/runtime/hr-live-service/` con endpoint JSON/JS/meta, cache corto, no-store, revisión SHA-256 y cero escrituras.
- Se creó `app/adapters/tya-live-source-refresh-watch.js`: refresco por foco/visibilidad y sondeo; si cambia la revisión recarga el contexto, y si falla muestra estado degradado, sin fallback silencioso.
- Se creó `tools/release/tya-source-safe-live-binding-build-r22.mjs`: reutiliza el adapter canónico y sustituye únicamente en el build el payload local congelado por el endpoint live same-origin.
- Se creó `.github/workflows/cxorbia-phase-a-live-hr-runtime-predeploy.yml`; pasó en `4db471e8852f85444843862bb0c8fd453873af30` con `cxorbia/live-hr-runtime-predeploy: success`, sin deploy.
- Se preparó `.github/workflows/cxorbia-phase-a-live-hr-runtime-deploy-dev.yml`, bloqueado por `backend/config/phase-a-live-hr-runtime-deploy-request-v1.json` hasta autorización expresa de Paula.
- Se actualizó el checkpoint a `CORTE_1_VISUAL_FAIL_LIVE_HR_RUNTIME_REQUIRED`.
- No se modificó ningún archivo de `app/modules/**` ni la lógica UI del prototipo.
- Estado seguro: sin merge, producción, import real, HR/Firestore/Auth/Storage writes, Make/Gemini live ni pagos. El deploy Cloud Run DEV y Hosting DEV no se ejecutó.

### Clasificación

- **Reusable CXOrbia:** endpoint live source-safe, revisión/frescura, un solo adapter canónico, watcher por revisión y gates sin conteos fijos.
- **Exclusivo cliente:** configuración HR TyA/Cinépolis y su mapeo de pestañas/columnas.
- **Claude/prototipo:** constructor y branding de reportes por tenant; exportación del reporte en vez de imprimir la página; copy de fuente vencida.
- **Academia:** diferencia entre lectura viva, snapshot, sincronización y estado degradado; uso de reportes por rol.
- **Sin impacto Claude:** servicio runtime, probe, predeploy, deploy gate y contratos.

## 2026-07-16 — Fast-lane atómico y corrección proyecto/periodo TyA

- Se diagnosticó la causa raíz del reproceso recurrente de empalmes: una promoción podía aplicar parcialmente una candidata y conservar archivos runtime anteriores mediante exclusiones silenciosas.
- Se eliminó `.github/workflows/finalize-unique-baseline.yml`, porque excluía archivos runtime y podía producir una baseline híbrida.
- Se creó `app/docs/ADDENDUM-MAESTRO-FAST-LANE-EMPALME-ATOMICO-TYA-20260716.md` con la metodología obligatoria para futuras candidatas: árbol completo primero, overlays explícitos después, una sola identidad/manifest/source lock y gates fail-closed.
- Se corrigió `app/core/tya-phase-a-source-safe-preview.js` para separar correctamente:
  - proyecto padre `cinepolis`;
  - periodo mensual con ID estable `cinepolis::<YYYY-MM>`;
  - visitas y postulaciones vinculadas al periodo activo;
  - `currentProjectId` y `currentPeriodId` independientes.
- Causa funcional corregida: el bridge anterior asignaba el mismo ID `cinepolis` a los 14 periodos y a todas las visitas, impidiendo que el cambio de periodo cambiara el histórico y permitiendo que KPI/Finanzas mezclaran periodos.
- Se creó `tools/qa/tya-project-period-kpi-history-gate.mjs` para comprobar automáticamente proyecto/periodo/contexto, 14 periodos, 616 visitas, 44 visitas por periodo, MAY/JUN/JUL distintos, KPI por periodo y junio ejecutado con control de pagos pendiente.
- Se creó `tools/qa/verify-fast-lane-promotion-policy.mjs` para bloquear workflows que excluyan silenciosamente rutas runtime de candidatas.
- Se actualizó `.github/workflows/cxorbia-phase-a-source-safe-visual-smoke-tya.yml` para ejecutar el gate nuevo de forma fail-closed junto con los smokes Admin/Shopper/Cliente.
- Se actualizó `backend/contracts/prototype-baseline-registry-v1.json`: V131+R18D sigue como rollback físico actual y V156 queda `pending_audit`, no aceptada ni empalmada, hasta promoción atómica y PASS de gates.
- No se tocó ningún archivo en `app/modules/**` desde backend.
- Estado seguro: sin deploy, producción, imports reales, Firestore/Auth/Storage/HR writes, Make/Gemini live ni pagos.

### Clasificación

- **Reusable CXOrbia:** fast-lane atómico, política de propiedad de archivos, gate proyecto/periodo/contexto/KPI y bloqueo de exclusiones runtime.
- **Exclusivo cliente:** 14 periodos TyA/Cinépolis, 44 visitas por periodo, 616 visitas y tratamiento operativo de junio.
- **Claude/prototipo:** V156 continúa como única candidata frontend; no se solicita otra candidata por este incidente.
- **Academia:** debe explicar proyecto vs periodo, cambio de contexto, histórico, KPI y estados honestos.
- **Sin impacto Claude:** validadores, workflows, registro de baseline y controles de promoción.

## 2026-07-11 - Importadores source-safe operativos R4

- Se agregaron importadores separados para pagos/movimientos y certificaciones presentadas.
- Soportan JSON, CSV, XLSX y XLSM.
- Reutilizan el índice HR source-safe ya validado; no reconstruyen periodos, visitas ni shoppers.
- Pagos: match estable por `visitId`, `paymentItemId` o `hrRowId`; certificaciones: `shopperId` o `shopperCode`.
- No deduplican ni enlazan por nombre, semejanza visual o shopper+monto.
- Producen candidatos, `reviewQueue`, `auditEvents`, envelopes source-safe y reporte sin materialización.
- Se agregaron contratos, plantillas CSV, fixtures sanitizados, validador JSON/XLSX y workflow CI.
- Validación: 20 checks PASS; workflow `CXOrbia Phase A Source Safe Importers` success.
- La documentación detallada está en `app/docs/CAMBIOS-BACKEND-ADDENDUM-SOURCE-SAFE-IMPORTERS-R4-20260711.md`.
- Estado seguro: dry-run; sin import real, writes, deploy, proveedores, pagos ni producción.

## 2026-07-09 - Phase A human review and conflict queue TyA

- Se agrego `backend/contracts/phase-a-human-review-conflict-queue-plan-v1.json`.
- Se agrego `app/docs/PHASE-A-HUMAN-REVIEW-CONFLICT-QUEUE-TYA-20260709.md`.
- Se agrego `app/docs/HUMAN-REVIEW-CONFLICT-NOTE-TYA-20260709.md`.
- Objetivo: preparar el plan documental de cola de revision humana y conflictos para Phase A TyA antes de cualquier DEV, import, escritura o sincronizacion real.
- Confirmacion de foco: seguimos en Phase A TyA con HR como fuente operacional, informacion real/source-safe, Cinépolis como primer proyecto configurable, junio como liquidaciones/pagos, certificaciones preservadas, shoppers historicos conservados y conflictos a revision humana.
- Conflictos cubiertos: shopper asignado en HR y ausente en plataforma, identidad ambigua, plataforma vs HR, duplicados, certificaciones ya presentadas, liquidaciones/pagos, cuestionario/origen y configuracion de proyecto.
- Llaves estables: tenantId, projectId, visitId/hrRowId, shopperId/referencia provisional, assignmentSource, assignmentSyncStatus y lastSyncedAt/sourceSnapshotAt.
- Impacto backend reusable: patron por tenant/proyecto de reviewQueue, tipos de conflicto, acciones permitidas/bloqueadas, referencias opacas, auditoria y no resolucion silenciosa.
- Impacto Claude/prototipo: mostrar conflicto visible, revision humana requerida, shopper HR asignado como pendiente de creacion/revision, certificacion preservada y liquidacion/pago como control, no pago real.
- Impacto Academia: explicar cola de revision, conflictos, llaves estables, asignaciones HR/plataforma, certificaciones preservadas, junio liquidaciones/pagos y no datos privados en logs/manuales.
- Estado seguro: documentacion/contrato solamente. Sin cambios en `/app/modules`, sin cambios en `/app/core`, sin DEV activo, sin runtime, sin builder, sin imports, sin writes, sin Firestore/Auth/Storage/HR, sin Make/Gemini, sin deploy, sin produccion, sin pagos reales y sin datos sensibles.
- Commits: `5da0d027669bfb246c66e96d48719932ceb33286`, `a7db9f8ccea68b44e1b4be26dd638208473d069c`, `c4ba8d435f4f0d4d5f550db5db4dae31dfd4b4eb`.

## 2026-07-09 - Phase A DEV rollback and audit plan TyA

- Se agrego `backend/contracts/phase-a-dev-rollback-audit-plan-v1.json`.
- Se agrego `app/docs/PHASE-A-DEV-ROLLBACK-AUDIT-PLAN-TYA-20260709.md`.
- Se agrego `app/docs/ROLLBACK-AUDIT-NOTE-TYA-20260709.md`.
- Se agrego `app/docs/PENDIENTES-ADDENDUM-ROLLBACK-AUDIT-TYA-20260709.md`.
- Objetivo: preparar plan documental de rollback y auditoria antes de cualquier paso DEV futuro de Phase A TyA, sin activar DEV, sin ejecutar rollback y sin escribir datos.
- Confirmacion de foco: seguimos en Phase A TyA, con HR como fuente operacional, informacion real/source-safe, Cinépolis como primer proyecto configurable, junio como liquidaciones/pagos, certificaciones preservadas y conflictos a revision humana.
- Requisitos antes de futuro DEV: flag unico de desactivacion, retorno a fuente local o estado previo de `CX.data`, gates apagados, dry-run antes de import, lotes detenibles antes de commit, evento de auditoria, cola de revision humana, logs sin datos privados, recuperacion manual para admins, copy honesto y manual Academia.
- Impacto backend reusable: patron por tenant/proyecto para rollback antes de activacion, auditoria antes de escritura, referencias opacas, cola de revision humana, gates apagados, dry-run y estado degradado honesto.
- Impacto Claude/prototipo: mostrar rollback preparado/no ejecutado, auditoria requerida, estados bloqueado/degradado/pendiente y revision humana; no afirmar sync/import/pago/proveedor real sin gate.
- Impacto Academia: explicar rollback, auditoria, referencias opacas, datos que no van en logs, revision de conflictos, DEV/runtime/produccion y actuacion ante gate bloqueado.
- Estado seguro: documentacion/contrato solamente. Sin cambios en `/app/modules`, sin cambios en `/app/core`, sin DEV activo, sin runtime, sin builder, sin imports, sin writes, sin Firestore/Auth/Storage/HR, sin Make/Gemini, sin deploy, sin produccion, sin pagos reales y sin datos sensibles.
- Commits: `8e9cba435b8e4051be258eed6d01b1101fd3c36c`, `6de2292c8918bbcb6a060c4ffb2bbcaa89a3c01d`, `57a5f52c326a129a658ca071b5584caee5056c1d`, `a8055a1494600509ebf4d761f04a4809db49053d`.

## 2026-07-09 - Phase A DEV conditions TyA

- Se agrego `backend/contracts/phase-a-dev-conditions-v1.json`.
- Se agrego `app/docs/PHASE-A-DEV-CONDITIONS-TYA-20260709.md`.
- Se agrego `app/docs/DEV-CONDITIONS-NOTE-TYA-20260709.md`.
- Objetivo: preparar condiciones documentales para un paso DEV futuro de Phase A TyA, empezando por Cinépolis como proyecto configurable, sin activar conexion, runtime, imports, writes, proveedores, deploy ni produccion.
- Confirmacion de foco: seguimos en Phase A TyA, con HR como fuente operacional, informacion real/source-safe para implementacion controlada, junio como liquidaciones/pagos y certificaciones ya presentadas preservadas.
- Condiciones antes de futuro DEV: decision de smoke aceptable, autorizacion explicita de Paula, base nueva limpia, secrets fuera del repo, punto unico `CX.data`, no reescritura de UI/core desde backend, fuente TyA source-safe, Cinépolis configurado por proyecto, rollback, auditoria, impacto Claude y Academia documentados.
- Impacto backend reusable: patron por tenant/proyecto para separar smoke, DEV, runtime, import, proveedores y produccion; mantiene gates, rollback, auditoria y estados honestos.
