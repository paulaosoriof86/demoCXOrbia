# RESUMEN-PARA-CLAUDE.md

## 2026-07-11 - Importadores source-safe operativos R4

- Backend agregó importadores dry-run separados para pagos/movimientos y certificaciones presentadas, compatibles con JSON, CSV, XLSX y XLSM.
- Reutilizan la HR y los shoppers ya validados; no reconstruyen periodos, visitas ni identidades.
- Pagos: match estable por `visitId`, `paymentItemId` o `hrRowId`; certificaciones: `shopperId` o `shopperCode`.
- No se acepta match por nombre, similitud visual o shopper+monto.
- Producen candidatos, `reviewQueue`, `auditEvents`, envelopes source-safe y reporte, sin escritura ni materialización.
- Validación: 20 checks JSON/XLSX PASS y dry-run sintético contra 616 visitas/213 shoppers PASS.
- Claude no debe crear otro importador. Debe representar dry-run, aceptados, duplicados, conflictos, campos protegidos excluidos y `pending_backend`.
- Finanzas debe usar `paymentState`; Certificación solo habilita con `confirmed/published` o carryover materializado.
- Fuente detallada: `app/docs/RESUMEN-PARA-CLAUDE-ADDENDUM-SOURCE-SAFE-IMPORTERS-R4-20260711.md`.
- Estado seguro: sin deploy, import real, writes, proveedores, pagos ni producción.

## 2026-07-09 - Guardrail anti-regreso y anti-desvio Phase A TyA

- ChatGPT/backend agrego `app/docs/PHASE-A-ANTI-REGRESO-DESVIO-GUARDRAIL-TYA-20260709.md` y `backend/contracts/phase-a-anti-regreso-desvio-guardrail-v1.json`.
- Objetivo: evitar que Claude, ChatGPT o cualquier bloque futuro marque como pendiente desde cero algo ya trabajado, reinicie Phase A, regrese a versiones anteriores o se desvie de TyA.
- Antes de listar pendientes o proponer siguiente bloque se debe revisar: documento maestro/addenda, checkpoint acumulado, auditoria de efectuado/pendiente, CAMBIOS-BACKEND, RESUMEN-PARA-CLAUDE y PR #7 actual.
- Toda actividad debe clasificarse como: hecho/documentado, preparado/no ejecutado, pendiente autorizacion, pendiente Claude/prototipo, pendiente backend real, bloqueado por gate o no corresponde a Phase A.
- No reabrir desde cero: `CX.data` adapter, source-safe domain mapping, readiness pack, builder local, single-command pack, smoke precheck, GO/NO GO, DEV conditions, rollback/auditoria, reviewQueue/conflictos y checkpoints.
- Reporte obligatorio por bloque: que hice, que ya estaba hecho y no se reabrio, avance Phase A, pendiente real por carril, siguiente bloque exacto, estado seguro y bloqueos/fallos.

## 2026-07-09 - Cola de revision humana y conflictos Phase A TyA

- ChatGPT/backend agrego `backend/contracts/phase-a-human-review-conflict-queue-plan-v1.json` y `app/docs/PHASE-A-HUMAN-REVIEW-CONFLICT-QUEUE-TYA-20260709.md`.
- Estado: documento/contrato solamente; no crea registros, no importa, no escribe HR, no activa proveedores, no ejecuta pagos, no deploy y no produccion.
- Claude debe representar conflictos como visibles, accionables y pendientes de revision humana; no debe ocultarlos ni resolverlos por nombre visual.
- Casos clave: shopper asignado en HR y ausente en plataforma, identidad ambigua, asignacion plataforma vs HR, visita duplicada, certificacion ya presentada, liquidacion/pago con estado conflictivo, cuestionario/origen y configuracion de proyecto.
- Foco Phase A: HR fuente operacional, informacion real/source-safe, Cinépolis proyecto configurable, junio liquidaciones/pagos, certificaciones preservadas, shoppers historicos conservados y conflictos a revision humana.
- No tocar desde Claude: backend/contracts, tools, workflows, secrets, reglas reales, `.tmp`, datos sensibles, proveedores reales, imports reales ni pagos reales.
- Academia debe explicar cola de revision, conflictos, llaves estables, asignaciones HR/plataforma, preservacion de certificaciones, junio como liquidaciones/pagos y no datos privados en logs/manuales.

## 2026-07-09 - Rollback y auditoria DEV Phase A TyA

- ChatGPT/backend agrego `backend/contracts/phase-a-dev-rollback-audit-plan-v1.json` y `app/docs/PHASE-A-DEV-ROLLBACK-AUDIT-PLAN-TYA-20260709.md`.
- Estado: documento/contrato solamente; no hay DEV activo, runtime activo, import real, writes, proveedores live, deploy, produccion ni pagos reales.
- Claude debe representar rollback como preparado/no ejecutado y auditoria como requisito previo, no como produccion lista.
- Claude debe mantener estados honestos: bloqueado, degradado, pendiente, revision humana, source-safe o gate apagado cuando aplique.
- Foco Phase A: HR fuente operacional, informacion real/source-safe, Cinépolis proyecto configurable, junio liquidaciones/pagos, certificaciones preservadas y conflictos a revision humana.
- No tocar desde Claude: backend/contracts, tools, workflows, secrets, reglas reales, `.tmp`, datos sensibles, proveedores reales, imports reales ni pagos reales.
- Academia debe cubrir rollback, auditoria, referencias opacas, datos que no van en logs, revision de conflictos, DEV/runtime/produccion y accion ante gate bloqueado.

## 2026-07-09 - Condiciones DEV Phase A TyA

- ChatGPT/backend agrego `backend/contracts/phase-a-dev-conditions-v1.json` y `app/docs/PHASE-A-DEV-CONDITIONS-TYA-20260709.md`.
- Estado: documento/contrato solamente; no hay conexion DEV activa, runtime activo, import real, writes, proveedores live, deploy, produccion ni pagos reales.
- Claude debe mantener el foco Phase A TyA: HR como fuente operacional, informacion real/source-safe, Cinépolis como primer proyecto configurable, junio como liquidaciones/pagos y certificaciones presentadas preservadas.
- Representacion esperada en UI: DEV pendiente hasta autorizacion explicita, Firestore/Auth/Storage pendientes, HR preparada pero no sincronizada live, Make/Gemini pendientes, datos TyA source-safe o pendientes y warnings/blockers visibles.
- No tocar desde Claude: backend/contracts, tools, workflows, secrets, reglas reales, `.tmp`, datos sensibles ni proveedores reales.
- Academia debe cubrir DEV vs staging vs produccion, base nueva limpia, `CX.data`, gates, fuente source-safe, certificaciones preservadas, conflictos, liquidaciones/pagos y no exponer datos privados.

## 2026-07-09 - Paquete acumulado Phase A TyA para Claude/Pendientes/Academia

- ChatGPT/backend agrego `app/docs/CLAUDE-PACKAGE-ACCUMULATED-PHASE-A-TYA-20260709.md`.
- Objetivo: consolidar el paquete acumulado para Claude/prototipo despues de los checkpoints Phase A, sin reiniciar metodologia, sin pedir HR/reglas/shoppers/certificaciones ya documentadas y sin asumir runtime activo.
- Claude debe tomar como estado base: PR #7 draft/open/no merge; sin deploy; sin produccion; sin runtime; sin import real; sin Firestore/Auth/Storage writes; sin HR writes; sin Make/Gemini live; sin pagos reales; sin output local source-safe commiteado.
- Foco Phase A que debe respetar: HR fuente operacional, datos reales/sanitizados TyA, shoppers historicos, certificaciones ya presentadas, junio como liquidacion/pago, Cinépolis proyecto configurable, multi-proyecto, cuestionario configurable y conflictos a revision humana con llaves estables.
- Pendientes P0 para Claude: copy honesto de gates, Academia profunda/administrable, representacion de Phase A real TyA sin prometer imports/runtime/integraciones reales.
- Pendientes P1 para Claude: readiness dashboard source-safe, proyecto configurable sin hardcode Cinépolis, Mis beneficios/liquidaciones/pagos con honorario-boleto-combo-lote-movimientos, postulaciones/asignaciones con conflictos a revision.
- Academia debe cubrir: Phase A vs produccion, preview/dry-run/gate/runtime/import, HR fuente operacional, shoppers/certificaciones preservadas, asignaciones/conflictos, liquidaciones/pagos, administracion de Academia, Gemini con revision humana, Make/HR preparado y readiness dashboard.
- No tocar: `tools/`, `tools/migration/`, `tools/contracts/`, `backend/contracts/`, `.github/workflows/`, reglas reales, secrets, datos sensibles, `.tmp/` ni integraciones reales.
- Estado seguro: documento puente solamente. No toca `/app/modules` ni `/app/core`, no activa runtime, no ejecuta builder, no importa datos, no escribe Firestore/Auth/Storage/HR, no activa Make/Gemini, no hace deploy, no hace pagos reales y no agrega datos sensibles.

## 2026-07-08 - Addendum readiness dashboard bridge runner

- ChatGPT/backend agrego `tools/contracts/cxorbia-readiness-dashboard-bridge-runner.mjs` y documentos `app/docs/READINESS-DASHBOARD-BRIDGE-RUNNER-CXORBIA-20260708.md` / `app/docs/CAMBIOS-READINESS-DASHBOARD-BRIDGE-RUNNER-CXORBIA-20260708.md`.
- El bridge convierte reportes del synthetic input pack runner en manifests de readiness dashboard source-safe y los valida; no toca `/app/modules` ni `/app/core`, no conecta runtime y no activa proveedores reales.
- Claude debe usar este patron si implementa dashboard/panel de readiness: fila por area, estado honesto, sourceRef opaca, gate apagado, revision humana y motivo.
- Copy honesto obligatorio: bridge/readiness no significa produccion lista, import real, sync real, envio real, pago real, provider activo, Storage activo, Firestore conectado, HR sincronizada, Make/Gemini activo ni deploy.
- Hallazgo visual Academia: en la captura de Paula no se ve opcion visible de borrar/archivar/duplicar/versionar cursos. Esto queda como pendiente Claude/prototipo; backend no debe tocar `app/modules/academia.js`.
- Academia debe explicar como un reporte de validadores se convierte en dashboard, source-safe, fixture sintetico, input sanitizado, gates apagados, warnings/fails/blockers y revision humana.
- No tocar backend, contracts, tools, workflows, Firestore/Auth/Storage, Make, Gemini, imports, pagos reales ni datos reales.

## 2026-07-08 - Addendum readiness dashboard source-safe

- ChatGPT/backend agrego `tools/contracts/cxorbia-readiness-dashboard-source-safe-contract.mjs` y documentos `app/docs/READINESS-DASHBOARD-SOURCE-SAFE-CONTRACT-CXORBIA-20260708.md` / `app/docs/CAMBIOS-READINESS-DASHBOARD-SOURCE-SAFE-CONTRACT-CXORBIA-20260708.md`.
- El contrato no toca `/app/modules` ni `/app/core`, no conecta runtime, no activa Firestore/Auth/Storage/HR/Make/Gemini/correo/WhatsApp/import/pagos y no incluye datos sensibles.
- Claude debe usar este patron si implementa dashboard/panel de readiness: area, estado preview, sourceRef opaca, gate apagado, revision humana y motivo.
- Estados permitidos: preview listo, diagnostico ejecutado, fixture sintetico, input sanitizado, warning, fail, pendiente fuente real, pendiente gate real, pendiente revision humana, produccion no autorizada, proveedor no activo, bloqueado por datos sensibles, bloqueado por conflicto, solo documental.
- Copy honesto obligatorio: readiness dashboard no significa produccion lista, import real, sync real, envio real, pago real, provider activo, Storage activo, Firestore conectado, HR sincronizada ni deploy.
- Academia debe explicar readiness dashboard, preview vs real, fixture sintetico, input sanitizado, source-safe report, gates apagados, errores, warnings, blockers y revision humana.
- No tocar backend, contracts, tools, workflows, Firestore/Auth/Storage, Make, Gemini, imports, pagos reales ni datos reales.

## 2026-07-08 - Addendum synthetic input pack expanded coverage

- ChatGPT/backend actualizo `tools/contracts/cxorbia-synthetic-input-pack-runner.mjs` y agrego `app/docs/SYNTHETIC-INPUT-PACK-EXPANDED-COVERAGE-CXORBIA-20260708.md` / `app/docs/CAMBIOS-SYNTHETIC-INPUT-PACK-EXPANDED-COVERAGE-CXORBIA-20260708.md`.
- La cobertura agregada ejecuta fixtures sinteticos existentes para assignment sync conflict preview, notification outbox preview, project/tenant rule versioning preview, rule change changelog notification preview y release readiness snapshot preview.
- Claude debe mostrar esta cobertura solo como diagnostico preview por area/pass-fail/warnings si se refleja en UI.
- Copy honesto obligatorio: coverage/pass de synthetic runner no significa produccion lista, import real, sync aplicado, envio real, pago real, provider activo, Storage activo ni deploy.
- Readiness visual debe separar: contrato probado, fixture sintetico validado, preview listo, warning, fail, pendiente gate real, pendiente fuente real, pendiente revision humana y produccion no autorizada.
- Academia debe explicar cobertura del runner, fixtures sinteticos, inputs sanitizados, pass/fail/warnings, preflight contractual, gates apagados y revision humana.
- No tocar backend, contracts, tools, workflows, Firestore/Auth/Storage, Make, Gemini, imports, pagos reales ni datos reales.

## Cierre V110 empalmada — 2026-07-12

- Los dos P0 de Academia por país y Finanzas fail-closed quedaron cerrados, verificados y empalmados físicamente.
- No se genera otro paquete Claude.
- No reabrir scores finitos, bandas unificadas, lotes multipaís/multimoneda, IDs determinísticos, responsive, Beneficios, certificaciones, cache demo/real ni shell.
- P1/P2 restantes quedan acumulados para un futuro paquete y no bloquean R10.

## R10 source-safe post-V110 — 2026-07-12

- Decisión final: `PASS_WITH_REVIEW_SOURCE_SAFE_VISUAL_SMOKE`.
- Admin, Cliente y Shopper: 13/13 rutas renderizadas, 0 errores de página/consola y sin copy de integración real.
- No reabrir P0 Academia/país ni Finanzas fail-closed.
- No surge paquete crítico nuevo para Claude.
- Diferencia shopper 210/213 pertenece a reconciliación backend/operativa, sin match por nombre.


## R11 shopper references — 2026-07-12

- Decisión backend: `HOLD_REFERENCE_SET_UNAVAILABLE`.
- No es tarea Claude: la diferencia 210/213 se procesa por referencias opacas y revisión humana.
- No reabrir P0 V110 ni R10.


## R11B shopper history recovery — 2026-07-12

- Decisión backend: `HOLD_NO_213_REFERENCE_SET_IN_REACHABLE_GIT_OBJECTS`.
- No es tarea Claude. No reabrir V110 ni R10.


## R11C builder lineage — 2026-07-12

- Decisión backend: `SOURCE_SNAPSHOT_DRIFT_NOT_BUILDER_DRIFT`.
- No es tarea Claude; no reabrir V110/R10.


## R11D shopper gap review — 2026-07-12

- Brecha 210/213 encapsulada en reviewQueue backend a nivel de fuente.
- No es tarea Claude y no reabre V110/R10.


## R12 Firebase DEV read-only readiness — 2026-07-12

- Estado: `READY_FOR_EXPLICIT_AUTHORIZATION_NOT_EXECUTED`.
- No mostrar Firebase conectado o base limpia verificada; solo readiness estático.
- No corresponde paquete Claude inmediato.


## R13 Firebase DEV read-only — 2026-07-12

- Decisión backend: `NONEMPTY_REVIEW_REQUIRED`.
- No implica backend conectado ni producción; no corresponde paquete Claude inmediato.
