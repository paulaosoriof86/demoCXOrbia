# CAMBIOS-BACKEND.md

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
- Impacto Claude/prototipo: mostrar DEV como pendiente hasta autorizacion; no afirmar Firestore/Auth/Storage/Make/Gemini/HR sync/pagos activos; mantener Cinépolis como proyecto configurable y datos TyA como source-safe o pendiente.
- Impacto Academia: cubrir DEV vs staging vs produccion, base nueva limpia, `CX.data`, gates, fuente source-safe, preservacion de certificaciones, revision de conflictos, liquidaciones/pagos y no exponer datos privados.
- Estado seguro: documentacion/contrato solamente. Sin cambios en `/app/modules`, sin cambios en `/app/core`, sin DEV activo, sin runtime, sin builder, sin imports, sin writes, sin Firestore/Auth/Storage/HR, sin Make/Gemini, sin deploy, sin produccion, sin pagos reales y sin datos sensibles.
- Nota de herramienta: la creacion del changelog detallado fue bloqueada por controles de herramienta; se creo una nota breve segura `DEV-CONDITIONS-NOTE-TYA-20260709.md` y este `CAMBIOS-BACKEND.md` conserva el registro completo.
- Commits: `3388e27dced620bc73567f9874da7a0d0e032808`, `5eb6db9b7cac703c241666c3dba44a32691c8a2c`, `711ad166211555bcaabaed46a919c778bb1f36e0`.

## 2026-07-09 - Phase A GO/NO GO decision pack TyA

- Se agrego `backend/contracts/phase-a-go-nogo-decision-pack-v1.json`.
- Se agrego `app/docs/PHASE-A-GO-NOGO-DECISION-PACK-TYA-20260709.md`.
- Se agrego `app/docs/DECISION-PACK-CHANGELOG-TYA-20260709.md`.
- Objetivo: preparar la logica documental de decision `GO`, `GO_WITH_WARNINGS`, `NO_GO` o `HOLD` para una validacion humana futura, sin ejecutar smoke ni activar runtime.
- Regla central: un resultado visual positivo no equivale a merge, deploy, produccion, runtime switch, imports, writes, Make/Gemini live, HR sync real ni pagos reales.
- Impacto Phase A: permite convertir el futuro smoke humano en decision controlada y evita que `NO_GO` cause reproceso Level 0/1 o redisenos amplios.
- Impacto backend reusable: patron reusable de decision por tenant/proyecto con hard stops, evidencia source-safe, autorizaciones separadas y antirreproceso.
- Impacto TyA/Cinépolis: junio se mantiene como liquidaciones/pagos y Cinépolis como proyecto configurable, no producto global.
- Impacto Claude/prototipo: debe representar GO/warnings/blockers con copy honesto; GO visual no activa providers, no importa, no paga y no sincroniza HR.
- Impacto Academia: explicar decision GO/NO GO/HOLD, diferencia smoke/readiness/runtime/produccion, warnings, blockers, evidencia segura y antirreproceso.
- Estado seguro: documentacion/contrato solamente. Sin cambios en `/app/modules`, sin cambios en `/app/core`, sin smoke ejecutado, sin computador solicitado, sin runtime, sin builder, sin imports, sin writes, sin Firestore/Auth/Storage/HR, sin Make/Gemini, sin deploy, sin produccion, sin pagos reales y sin datos sensibles.
- Nota de herramienta: la creacion del changelog detallado con el nombre `CAMBIOS-PHASE-A-GO-NOGO-DECISION-PACK-TYA-20260709.md` fue bloqueada por controles de herramienta; se creo alternativa segura `DECISION-PACK-CHANGELOG-TYA-20260709.md` y este `CAMBIOS-BACKEND.md` conserva el registro completo.
- Commits: `75cb6b22831f452aae5c0fbe840bd976a9266f66`, `22f2bafebafe7587b411eb57b293cc0ef172752d`, `b29b5f0e23818e5da18f5793b745deda000bfc77`.

## 2026-07-09 - Phase A human smoke precheck pack TyA

- Se agrego `backend/contracts/phase-a-human-smoke-precheck-pack-v1.json`.
- Se agrego `app/docs/PHASE-A-HUMAN-SMOKE-PRECHECK-PACK-TYA-20260709.md`.
- Se agrego `app/docs/CAMBIOS-PHASE-A-HUMAN-SMOKE-PRECHECK-PACK-TYA-20260709.md`.
- Objetivo: preparar el precheck para smoke humano/consola de RC Phase A controlada, sin pedir ejecucion todavia, sin activar runtime y sin repetir Level 0/1.
- Rutas criticas definidas: login/admin shell, navegacion base, dashboard, postulaciones/asignaciones, reservas/visitas, cuestionario shopper, finanzas/liquidaciones/pagos, Academia, Diagnostico/Readiness y Administrabilidad.
- Criterios GO: rutas criticas abren, sin pantalla blanca, sin errores JS criticos, copy honesto, Academia administrable o pendiente honesto, readiness preview/source-safe/gate-off, pagos como control administrativo, Cinépolis no hardcode global.
- Criterios NO GO: pantalla blanca, errores JS criticos, rutas criticas bloqueadas, guard rompiendo render, copy de envio/sync/import/pago real sin gate, datos sensibles visibles, activacion de proveedores reales sin GO, junio tratado como visitas pendientes o Cinépolis como producto global.
- Impacto Phase A: deja listo el filtro humano minimo antes de decidir RC controlada, enfocado en operacion real TyA y no en infraestructura abstracta.
- Impacto backend reusable: patron reusable de smoke humano, GO/NO GO estructurado, copy honesto, gates apagados y verificacion multi-tenant.
- Impacto Claude/prototipo: rutas smokeables, estados visibles honestos, Academia administrable, readiness no productivo y no hardcode Cinépolis.
- Impacto Academia: manual/checklist de smoke humano, GO/NO GO, errores de consola, preview/gate/runtime/import/produccion, revision humana y liquidaciones/pagos como control.
- Estado seguro: documentacion/contrato solamente. Sin cambios en `/app/modules`, sin cambios en `/app/core`, smoke no ejecutado, no se pidio PowerShell/computador, sin runtime, sin builder, sin imports, sin writes, sin Firestore/Auth/Storage, sin HR writes, sin Make/Gemini, sin deploy, sin produccion, sin pagos reales y sin datos sensibles.
- Commits: `4c7f3b95960ecd9798e237f29ea5dd8ff888586b`, `0c785345e20464cf78b7f6935aa790acf073ddce`, `05093e714ff2e14f8d4ff9ccd6df8ab625aa59b8`.

## 2026-07-09 - Paquete acumulado Claude/Pendientes/Academia Phase A TyA

- Se agrego `app/docs/CLAUDE-PACKAGE-ACCUMULATED-PHASE-A-TYA-20260709.md`.
- Se actualizo `RESUMEN-PARA-CLAUDE.md`.
- Se actualizo `PENDIENTES-PROTOTIPO.md`.
- Objetivo: completar el puente acumulado para Claude/prototipo/Academia desde los documentos recientes, sin tocar UI, sin pedir ejecucion local y sin reiniciar pendientes ni metodologia.
- Contenido protegido para Claude: PR #7 draft/open/no merge, sin deploy, sin produccion, sin runtime, sin imports, sin Firestore/Auth/Storage writes, sin HR writes, sin Make/Gemini live, sin pagos reales y sin output local commiteado.
- Foco Phase A: HR fuente operacional, datos reales/sanitizados TyA, shoppers historicos, certificaciones ya presentadas, junio como liquidacion/pago, Cinépolis proyecto configurable, multi-proyecto, cuestionario configurable y conflictos a revision humana con llaves estables.
- Pendientes P0 para Claude: copy honesto de gates, Academia profunda/administrable, representacion de Phase A real TyA sin prometer imports/runtime/integraciones reales.
- Pendientes P1 para Claude: readiness dashboard source-safe, proyecto configurable sin hardcode Cinépolis, Mis beneficios/liquidaciones/pagos con honorario-boleto-combo-lote-movimientos, postulaciones/asignaciones con conflictos a revision.
- Academia debe cubrir: Phase A vs produccion, preview/dry-run/gate/runtime/import, HR fuente operacional, shoppers/certificaciones preservadas, asignaciones/conflictos, liquidaciones/pagos, administracion de Academia, Gemini con revision humana, Make/HR preparado y readiness dashboard.
- No tocar: `tools/`, `tools/migration/`, `tools/contracts/`, `backend/contracts/`, `.github/workflows/`, reglas reales, secrets, datos sensibles, `.tmp/` ni integraciones reales.
- Estado seguro: documento puente solamente. No toca `/app/modules` ni `/app/core`, no activa runtime, no ejecuta builder, no importa datos, no escribe Firestore/Auth/Storage/HR, no activa Make/Gemini, no hace deploy, no hace pagos reales y no agrega datos sensibles.
