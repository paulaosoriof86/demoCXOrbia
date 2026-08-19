# ADDENDUM MAESTRO — PLAN UNIFICADO PHASE A · NO DESVIACIÓN · CXORBIA TyA

**Última sincronización:** 2026-08-19 10:04 -06:00  
**SYNC_EPOCH:** `CXORBIA-20260819-I4A-DEDICATED-TEST-SHOPPER-PASS-21`  
**Estado:** `ACTIVO__PREVALENTE__I3_FROZEN_PASS__I4A_TEST_IDENTITY_PASS__VISIBLE_SMOKE_NEXT`

## 0. Regla

Continúa el mismo I1→I5. No reinicia metodología. Canonical State + Atomic Gate Close + circuit breaker prevalecen.

## 1. Estado formal

I1 `15/15 PASS`; I2 `20/20 PASS`; I3 `25/25 PASS FROZEN`; I4 `0/25 IN_PROGRESS_NOT_SCORED`; I5 `0/15` = **60% / 40%**.

## 2. Frozen/no reprocess

I1/I2/I3 integral; Historical Shopper; TARGET_B Admin; HR 15 periodos/660 visitas; Finance V2/historical; legal V0.4; búsquedas de identidad I4-A consumidas.

## 3. I4-A — habilitador de identidad visible — PASS

La búsqueda de una identidad existente segura terminó en HOLD consumido. Luego Paula autorizó una identidad DEV dedicada. La materialización quedó provider-verificada en run `32273818536`, artifact `9373197946`:

- identidad final dedicada = 1;
- claims/profile/membership/crosswalk/provider ACK = exactos;
- provenance `synthetic/nonHistorical/dev-test` explícita;
- login = 0;
- Historical Shopper = 0;
- HR/Rules/Storage/Make/Gemini/pagos/deploy/merge/producción = 0/false.

No se repite creación ni clasificación.

## 4. Siguiente gate exacto

`NEW_AUTH_REQUIRED_I4A_SINGLE_VISIBLE_DEV_SHOPPER_LIFECYCLE_SMOKE`

Una sola prueba visible DEV usando únicamente la identidad dedicada. Debe observar documentos/instrucciones, disponibles, control/estado de postulación, notificaciones y presentación de certificación nueva. Requiere autorización expresa separada.

## 5. I4-B — visita

Agenda; reprogramación; cancelación; ventanas/reglas; ejecución; evidencias; cuestionario; submit; review/auditoría; estados dinámicos.

## 6. I4-C — HR bidireccional

Plataforma→HR y HR→Plataforma con `tenantId`, `projectId`, `visitId/hrRowId`, `shopperId`, `assignmentSource`, `assignmentSyncStatus`, `lastSyncedAt`; no duplicación; conflictos a revisión; Make solo bajo gate.

## 7. I4-D — Finanzas

Histórico preservado; liquidaciones; pagos; junio real; honorarios/reembolsos configurables; trazabilidad tenant/proyecto/visita/shopper.

## 8. I4-E — multi-proyecto/no-code

País/moneda/timezone/locale; source + mapping; cuestionario/provider/link; documentos/reglas/certificación; agenda; pagos; roles/notificaciones; integraciones; privacidad/evidencias.

## 9. I4-F — Academia

Cursos/manuales/rutas/notificaciones/instrucciones/certificaciones se actualizan con cada comportamiento visible confirmado.

## 10. I5 — producción

Freeze sin P0 → SHA/manifest/build-lock/verifier → preproducción → rollback → same-build E2E → revisión P0/P1/P2 → autorización expresa → cutover → smoke → baseline productivo.

## 11. Producto

TyA es primer tenant; Cinépolis proyecto configurable normal, nunca lógica global.

## 12. Frontend / Claude

Backend no parchea `/app/modules` ni `/app/core`. Solo defecto reproducible visible genera handoff por archivo/módulo.

## 13. Definition of Done

Cada bloque cierra objetivo, evidencia, safety, proven/disproven/unknown, clasificación reusable/cliente/Claude/Academia, documentos canónicos/PR al mismo `SYNC_EPOCH`, verifier y un único siguiente bloque.
