# ADDENDUM MAESTRO — PLAN UNIFICADO PHASE A · NO DESVIACIÓN · CXORBIA TyA

**Última sincronización:** 2026-08-19 10:59 -06:00  
**SYNC_EPOCH:** `CXORBIA-20260819-I4A-VISIBLE-SMOKE-MECHANISM-HOLD-22`  
**Estado:** `ACTIVO__PREVALENTE__I3_FROZEN_PASS__I4A_VISIBLE_SMOKE_CONSUMED_HOLD__RETRY_AUTH_NEXT`

## 0. Regla

Continúa el mismo I1→I5. No reinicia metodología. Canonical State + Atomic Gate Close + circuit breaker prevalecen. Un fallo de harness no autoriza reejecución automática de un gate de login/Auth ya consumido.

## 1. Estado formal

I1 `15/15 PASS`; I2 `20/20 PASS`; I3 `25/25 PASS FROZEN`; I4 `0/25 IN_PROGRESS_NOT_SCORED`; I5 `0/15` = **60% / 40%**.

## 2. Frozen/no reprocess

I1/I2/I3 integral; Historical Shopper; TARGET_B Admin; HR 15 periodos/660 visitas; Finance V2/historical; legal V0.4; búsqueda de identidad I4-A; creación de identidad test dedicada; primer visible smoke I4-A consumido.

## 3. I4-A — identidad dedicada — PASS

Permanece válida la identidad DEV dedicada sintética/no histórica provider-verificada. No se crea otra identidad ni se modifica Historical Shopper.

## 4. I4-A — visible smoke #1 — HOLD de mecanismo

Gate `NEW_AUTH_REQUIRED_I4A_SINGLE_VISIBLE_DEV_SHOPPER_LIFECYCLE_SMOKE` consumido una vez. Run `32278013553` / job `96149872897` / artifact `9374808032`.

La prevalidación exacta pasó; se consumieron 1 Auth password update y 1 login. El browser hizo timeout antes de registrar superficies. Cero Firestore writes, postulation/certification/reservation submits, HR/Rules/Storage/Make/Gemini/pagos/deploy/merge/producción. Resultado canónico: `PIPELINE_MECHANISM_FAILURE_PRIMARY__NO_PRODUCT_DEFECT_PROVEN`.

Diferencial técnico prioritario: el E2E I3 PASS crea browser contexts con `serviceWorkers:'block'`; el smoke I4-A no. A la vez, `app.js` registra SW y recarga en `controllerchange`, y `sw.js` usa `skipWaiting()` + `clients.claim()`. El retry debe neutralizar ese factor y capturar fases; no se afirma todavía un P0 de producto.

## 5. Siguiente gate exacto

`NEW_AUTH_REQUIRED_I4A_VISIBLE_DEV_SHOPPER_LIFECYCLE_SMOKE_RETRY__SERVICE_WORKER_STABILIZED_HARNESS`

Requiere autorización expresa nueva. Un solo retry visible DEV, misma identidad dedicada, harness estabilizado, sin submits ni writes operativos. Solo con evidencia visible se adjudica I4-A.

## 6. I4-B — visita

Agenda; reprogramación; cancelación; ventanas/reglas; ejecución; evidencias; cuestionario; submit; review/auditoría; estados dinámicos.

## 7. I4-C — HR bidireccional

Plataforma→HR y HR→Plataforma con `tenantId`, `projectId`, `visitId/hrRowId`, `shopperId`, `assignmentSource`, `assignmentSyncStatus`, `lastSyncedAt`; no duplicación; conflictos a revisión; Make solo bajo gate.

## 8. I4-D — Finanzas

Histórico preservado; liquidaciones; pagos; junio real; honorarios/reembolsos configurables; trazabilidad tenant/proyecto/visita/shopper.

## 9. I4-E — multi-proyecto/no-code

País/moneda/timezone/locale; source + mapping; cuestionario/provider/link; documentos/reglas/certificación; agenda; pagos; roles/notificaciones; integraciones; privacidad/evidencias.

## 10. I4-F — Academia

Cursos/manuales/rutas/notificaciones/instrucciones/certificaciones se actualizan solo con comportamiento visible confirmado. Este HOLD no cambia contenido académico.

## 11. I5 — producción

Freeze sin P0 → SHA/manifest/build-lock/verifier → preproducción → rollback → same-build E2E → revisión P0/P1/P2 → autorización expresa → cutover → smoke → baseline productivo.

## 12. Producto

TyA es primer tenant; Cinépolis proyecto configurable normal, nunca lógica global.

## 13. Frontend / Claude

Backend no parchea `/app/modules` ni `/app/core`. El run no llegó a superficies y no probó defecto UI. Se documenta únicamente un P1 de hardening/observabilidad potencial en `app/app.js` + `app/sw.js`; no se ordena parche de producto sin reproducción visible.

## 14. Definition of Done

Cada bloque cierra objetivo, evidencia, safety, proven/disproven/unknown, clasificación reusable/cliente/Claude/Academia, documentos canónicos/PR al mismo `SYNC_EPOCH`, verifier y un único siguiente bloque.
