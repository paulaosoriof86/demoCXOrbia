# ADDENDUM MAESTRO — PLAN UNIFICADO PHASE A · NO DESVIACIÓN · CXORBIA TyA

**Plan original:** 2026-08-17  
**Última sincronización:** 2026-08-18 14:20 -06:00  
**SYNC_EPOCH:** `CXORBIA-20260818-I3-11C-R3B-HOLD-DEV-HOSTING-PARITY-05`  
**Estado:** `ACTIVO__PREVALENTE__R3B_HOLD__DEV_HOSTING_MATERIALIZATION_NEXT__I4_I5_PRESERVED`

## 0. Regla

Este plan continúa el mismo camino I1→I5. No reinicia metodología. Canonical state + Atomic Gate Close + circuit breaker siguen prevaleciendo.

## 1. Estado formal

Repo `paulaosoriof86/demoCXOrbia`; rama única `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge; base `release/cxorbia-tya-rc-20260630`; DEV `cxorbia-backend-dev`.

I1 `15/15 PASS`; I2 `20/20 PASS`; I3 `0/25` hasta PASS integral; I4 `0/25`; I5 `0/15` = **35% completado / 65% pendiente**. I3 PASS → **60%**.

## 2. Frozen

I1/I2; I3.1→I3.10; Historical Shopper run `31906391682`; TARGET_B Admin; request08; I3.5B/I3.5C-2/I3.8; Rules I3.11C run `32163552089`; focal provider read run `32171812808`; R3-B Staff run `32181137350`; HR 15/660; Finance V2/historical; legal V0.4.

No rerun, recreación, reset, reimport, rebuild ni redeploy de estos bloques salvo regresión nueva reproducible que invalide expresamente su PASS. R3-B HOLD tampoco se repite automáticamente.

## 3. R1 — Source truth duradero — PASS

Vigentes: execution state, índice, source lock, checkpoint, este plan, CAMBIOS/RESUMEN/PENDIENTES, PR #7 y verifier. Mismatch → `SOURCE_TRUTH_MISMATCH__STOP_TECHNICAL_EXECUTION`. Gate ejecutado sin sincronización → `EXECUTED_UNSYNCED_DO_NOT_ADVANCE`. Dos repeticiones sin reducción causal → `FORENSIC_STOP`.

## 4. R2 — Focal provider identity-link adjudication — PASS / CONSUMED

Run `32171812808`: target `irl_3ed1b9a65d36c5873c1306bae1621e9d` intacto/aplicable, mapping exacto `shp-57d2e3769946 → TYA_GT_0C0BA8856E`, `materialized`, authority `tenant_adjudication`, period-independent, provider writes `0`. No provider repair.

## 5. R2B — root cause — PASS

`PROVEN_RUNTIME_CONTRACT_DRIFT__LEGACY_PROVIDER_IDENTITY_LINK_APPLICABILITY_FILTER`.

El runtime legacy aceptaba solo `active + providerAck`, mientras el contrato canónico acepta estados/authorities authoritative, incluido `materialized + tenant_adjudication`.

## 6. R3-A — source correction — PASS source / no deploy

Se corrigió `app/adapters/cxorbia-provider-identity-link-runtime-v1.js` y se añadió `tools/qa/cxorbia-provider-identity-runtime-contract-parity-gate.mjs`. No `/app/modules`, no `/app/core`, no cambio de interfaz `CX.data`, provider I/O `0`, Hosting deploy `0`.

## 7. R3-B — Staff runtime closure — HOLD / CONSUMED

Run `32181137350`, artifact `9340865585`.

### Lo que pasó
- parity gate del source corregido: PASS;
- Rules previas: reutilizadas, deploy `0`;
- Staff/Admin DEV: una ejecución real read-only;
- runtime base: `AUTH_RUNTIME_TIMEOUT`;
- identidad target: canonical actual `null`, agosto canonical `0`, residual `2`;
- provider links `1`, target links `0`;
- duplicados `0/0`;
- postulation/legal conservados en lastState;
- todos los writes/deploys/producción `0`.

### Causa reducida

`I3_11C_CORRECTED_SOURCE_NOT_EFFECTIVE_IN_REMOTE_DEV__HOSTING_MATERIALIZATION_REQUIRED`.

El source GitHub está corregido, pero R3-A y R3-B no desplegaron Hosting. La validación remota todavía muestra la conducta pre-corrección. El hash exacto del asset servido no fue capturado, por lo que no se vuelve a modificar lógica: primero se materializa el source ya corregido en DEV y se prueba paridad remota.

## 8. R3-C — siguiente gate exacto

`NEW_AUTH_REQUIRED_I3_11C_DEV_HOSTING_MATERIALIZE_CORRECTED_IDENTITY_RUNTIME_NO_PROVIDER_DATA_WRITES`

Solo bajo nueva autorización expresa:
1. máximo `1` deploy Firebase Hosting DEV en `cxorbia-backend-dev`;
2. source exacto desde la rama viva, conservando todos los overlays/backend actuales;
3. verificar remote fingerprint/hash o semántica inequívoca de `cxorbia-provider-identity-link-runtime-v1.js` contra el contrato corregido;
4. provider identity writes `0`;
5. Firestore data/Auth/Rules/HR/Storage/Make/Gemini/payments/CloudRun/Historical Shopper `0`;
6. merge/production `false`;
7. no Staff runtime automático en el mismo gate.

Si R3-C PASS, el siguiente gate será un nuevo Staff/Admin read-only exacto. Solo ese PASS integral cierra I3 y lleva formal a 60%.

## 9. I4 — operación visible

### I4-A — Shopper lifecycle
Documentos/instrucciones; certificaciones históricas/nuevas; disponibles; postulación; asignación; perfiles/roles/scopes; notificaciones; histórico.

### I4-B — visita
Agenda; reprogramación; cancelación; ventanas/reglas; ejecución; evidencias; cuestionario; submit; review/auditoría; estados dinámicos.

### I4-C — HR bidireccional
Plataforma→HR y HR→Plataforma con `tenantId`, `projectId`, `visitId/hrRowId`, `shopperId`, `assignmentSource`, `assignmentSyncStatus`, `lastSyncedAt`; no duplicación; conflictos a revisión; Make solo bajo gate.

### I4-D — Finanzas
Histórico preservado; liquidaciones; pagos; junio real; honorarios/reembolsos configurables; trazabilidad tenant/proyecto/visita/shopper.

### I4-E — multi-proyecto/no-code
País/moneda/timezone/locale; source + mapping; cuestionario/provider/link; documentos/reglas/certificación; agenda; pagos; roles/notificaciones; integraciones; privacidad/evidencias.

### I4-F — Academia
Cursos/manuales/rutas/notificaciones/instrucciones/certificaciones se actualizan junto con cada comportamiento operacional visible.

## 10. I5 — producción

Freeze sin P0 → SHA/manifest/build-lock/verifier → preproducción → rollback → same-build E2E → revisión P0/P1/P2 → autorización expresa de Paula → cutover → smoke → baseline productivo.

## 11. Producto comercializable/no-code

TyA es primer tenant y Cinépolis primer proyecto normal configurable, nunca lógica global. Fuentes objetivo: Google Sheets, Excel, CSV, API, CXOrbia nativo, import manual y plataforma/proveedor/link externo. Alta objetivo: `crear → configurar source → mapear → dry-run → validar → activar → monitorear`.

## 12. Frontend / Claude

Backend no parchea silenciosamente `/app/modules` ni `/app/core`. No se crea workaround UI para el HOLD actual. Solo cambios visibles reales validados generan handoff por archivo/módulo y criterios de aceptación.

## 13. Definition of Done

Cada bloque cierra objetivo/HOLD reproducible, efectos provider, safety, `proven/disproven/unknown`, clasificación reusable/tenant/project, impacto Claude/Academia, documentos canónicos/PR al mismo `SYNC_EPOCH`, verifier y un único siguiente bloque exacto.
