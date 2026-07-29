# CAMBIOS-BACKEND.md

## 2026-07-29 — Corte 3 congelado y Corte 4 read-only bloqueado por IAM

- Corte 3 quedó `FROZEN_ACTIVE_BASELINE` con baseline `CXORBIA-TYA-CORTE3-V182-20260729`.
- V182 está empalmada; no existe ni se requiere V183/R33.
- R26–R32: 135/135 PASS; HR remota, Hosting DEV y smoke de pagos: PASS.
- Mayo 2026: 44 pagadas, 0 pendientes, 42 vínculos exactos, 2 reviews, CxP GT Q0/HN L0.
- Junio 2026: 2 pagadas, 42 pendientes, GT pagado Q451/HN L0.
- Se inició Corte 4 con objetivo `FIREBASE NUEVO Y VACÍO → CX.data READ-ONLY → MISMA INTERFAZ → CERO WRITES`.
- Se prepararon contrato/guard read-only, backend desactivado por defecto, fail-closed sin fallback mock/localStorage y Rules candidate no desplegado.
- Gate estático Corte 4: `PASS_READONLY_POST_GATES` con providerReads=0, providerWrites=0 y dataWrites=0.
- `cxorbia-backend-dev` quedó excluido por no ser nuevo/vacío; no se conecta, copia ni reutiliza.
- Candidato: `cxorbia-tya-dev-260729-c4`.
- Se corrigió el preflight para seleccionar una service account estructuralmente válida entre las rutas disponibles.
- Probe read-only: `TARGET_PROJECT_PERMISSION_DENIED_C4`.
- Creación atómica: `BLOCKED_PROJECT_CREATION_PERMISSION_OR_POLICY`.
- Resultado: projectCreated=false, firebaseAdded=false, existingDatabaseReused=false, Firestore/Auth/Storage/Rules/Hosting writes=0.
- Causa raíz comprobada: IAM/proveedor. La service account válida disponible no tiene permiso para crear/verificar el proyecto nuevo.
- Siguiente bloque: resolver IAM Project Creator, crear/verificar Firebase nuevo/vacío, config web DEV, Rules read-only, activar solo lectura, smoke `CX.data`, validación visual y freeze Corte 4.
- Clasificación: **Reusable CXOrbia:** base nueva obligatoria, fail-closed, read-only, IAM separado de credencial; **Exclusivo TyA:** projectId candidato y datos HR/financieros; **Claude/prototipo:** sin cambio funcional requerido por Corte 4; **Academia:** diferenciar credencial, IAM, proyecto, Firebase, Rules, lectura y escritura; **Sin impacto Claude:** runner/provider/gates internos.
- Estado seguro: PR #7 draft/open/no merge; sin producción, provider activation, Rules deploy, imports ni writes reales.

## Histórico previo

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
- Se corrigió `app/core/tya-phase-a-source-safe-preview.js` para separar correctamente proyecto padre `cinepolis`, periodo mensual con ID estable `cinepolis::<YYYY-MM>`, visitas/postulaciones del periodo activo y `currentProjectId`/`currentPeriodId` independientes.
- Se creó `tools/qa/tya-project-period-kpi-history-gate.mjs` y `tools/qa/verify-fast-lane-promotion-policy.mjs`.
- No se tocó ningún archivo en `app/modules/**` desde backend.
- Estado seguro: sin deploy, producción, imports reales, Firestore/Auth/Storage/HR writes, Make/Gemini live ni pagos.

## 2026-07-11 - Importadores source-safe operativos R4

- Se agregaron importadores separados para pagos/movimientos y certificaciones presentadas.
- Soportan JSON, CSV, XLSX y XLSM.
- Reutilizan el índice HR source-safe ya validado; no reconstruyen periodos, visitas ni shoppers.
- Pagos: match estable por `visitId`, `paymentItemId` o `hrRowId`; certificaciones: `shopperId` o `shopperCode`.
- No deduplican ni enlazan por nombre, semejanza visual o shopper+monto.
- Producen candidatos, `reviewQueue`, `auditEvents`, envelopes source-safe y reporte sin materialización.
- Se agregaron contratos, plantillas CSV, fixtures sanitizados, validador JSON/XLSX y workflow CI.
- Validación: 20 checks PASS; workflow `CXOrbia Phase A Source Safe Importers` success.
- Estado seguro: dry-run; sin import real, writes, deploy, proveedores, pagos ni producción.

## 2026-07-09 - Phase A human review and conflict queue TyA

- Se agrego `backend/contracts/phase-a-human-review-conflict-queue-plan-v1.json` y documentación asociada.
- Objetivo: preparar cola de revisión humana y conflictos antes de cualquier DEV, import, escritura o sincronización real.
- Conflictos cubiertos: shopper asignado en HR y ausente en plataforma, identidad ambigua, plataforma vs HR, duplicados, certificaciones, liquidaciones/pagos, cuestionario/origen y configuración de proyecto.
- Estado seguro: documentación/contrato solamente; sin runtime, imports, writes, proveedores, deploy, producción ni pagos reales.

## 2026-07-09 - Phase A DEV rollback and audit plan TyA

- Se agregaron contrato y documentación de rollback/auditoría DEV.
- Requisitos: flag de desactivación, retorno a fuente previa de `CX.data`, gates apagados, dry-run, lotes detenibles, auditoría, reviewQueue, logs sin datos privados y copy honesto.
- Estado seguro: documentación/contrato solamente; sin runtime, imports, writes, proveedores, deploy, producción ni pagos reales.

## 2026-07-09 - Phase A DEV conditions TyA

- Se agregaron contrato y documentación de condiciones DEV.
- Condiciones: autorización explícita, base nueva limpia, secrets fuera del repo, punto único `CX.data`, fuente TyA source-safe, Cinépolis configurable, rollback, auditoría, impacto Claude/Academia documentados.
- Estado seguro: documentación/contrato solamente; sin activación, imports, writes, proveedores, deploy ni producción.
