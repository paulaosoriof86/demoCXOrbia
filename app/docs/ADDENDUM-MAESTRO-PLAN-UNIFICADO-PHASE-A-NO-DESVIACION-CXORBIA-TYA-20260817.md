# ADDENDUM MAESTRO — PLAN UNIFICADO PHASE A · NO DESVIACIÓN · CXORBIA TyA

**Plan original:** 2026-08-17  
**Última sincronización:** 2026-08-18 12:37 -06:00  
**SYNC_EPOCH:** `CXORBIA-20260818-I3-11C-FOCAL-ADJUDICATION-02`  
**Estado:** `ACTIVO__PREVALENTE__I3_11C_TEMPORAL_RUNTIME_DIVERGENCE_FORENSIC__I4_I5_PRESERVED`

## 0. Regla

Este plan no reinicia metodología ni Phase A. Continúa el mismo camino I1→I5 y conserva source truth machine-readable, Atomic Gate Close, circuit breaker y la separación canonical/history.

## 1. Estado formal

Repo `paulaosoriof86/demoCXOrbia`; rama única `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge; base `release/cxorbia-tya-rc-20260630`; DEV `cxorbia-backend-dev`.

I1 `15/15 PASS`; I2 `20/20 PASS`; I3 `0/25` hasta PASS integral; I4 `0/25`; I5 `0/15` = **35% completado / 65% pendiente**. I3 integral PASS → **60%**.

## 2. Frozen

I1/I2; I3.1→I3.8; I3.9/I3.10; Historical Shopper run `31906391682`; TARGET_B Admin; request08; I3.5B/I3.5C-2/I3.8; Firestore Rules I3.11C run `32163552089`; focal provider identity-link read run `32171812808`; HR 15/660; Finance V2/historical; legal V0.4.

No rerun, recreación, reset, reimport, rebuild ni redeploy de estos bloques salvo regresión nueva reproducible que invalide expresamente su PASS.

## 3. R1 — Source truth duradero — PASS

Vigentes:
- `app/docs/CXORBIA-EXECUTION-STATE.json`;
- índice;
- source lock estable;
- checkpoint;
- este plan;
- CAMBIOS/RESUMEN/PENDIENTES;
- PR #7;
- verifier.

Mismatch → `SOURCE_TRUTH_MISMATCH__STOP_TECHNICAL_EXECUTION`. Gate ejecutado sin sincronización → `EXECUTED_UNSYNCED_DO_NOT_ADVANCE`. Dos repeticiones sin reducción causal → `FORENSIC_STOP`.

## 4. R2 — Focal provider identity-link adjudication — PASS / CONSUMED

Run `32171812808`, job `95824491418`, artifact `9337537655`.

El target link `irl_3ed1b9a65d36c5873c1306bae1621e9d` está **intacto y aplicable**:
- mapping `shp-57d2e3769946 → TYA_GT_0C0BA8856E`;
- `tya/cinepolis/hr`;
- `materialized`;
- authority `tenant_adjudication`;
- periodIndependent;
- field diff `[]`;
- colección actual: 2 trusted normalized links, 0 rejected.

Provider reads `2`; provider writes `0`; restantes writes/deploys/Historical Shopper/merge/production `0`.

Se descartan como causa persistente actual: deleted/deactivated/re-scoped/mutated/structurally-non-applicable. **No provider repair del link.**

El harness HOLD previo run `32171482856` ocurrió antes de provider access por shallow checkout, con reads/writes `0/0`; no consumió el gate.

## 5. R2B — siguiente bloque exacto

`I3_11C_TEMPORAL_WRITE_HISTORY_AND_RUNTIME_STALENESS_FORENSIC_NO_PROVIDER_READS`

Objetivo sin proveedor:
1. cronología entre Staff run `32164134278` y focal provider PASS `32171812808`;
2. identificar si hubo cualquier ejecución que pudiera escribir `shopperIdentityLinks`;
3. comparar evidencia de provider state por timestamp/run;
4. revisar protected runtime identity-link loading, refresh, bus events, caching, filtering y compose order;
5. decidir si la divergencia se explica por provider state posterior o por stale/incomplete runtime observation.

Provider reads/writes, Auth, Firestore-data, Rules, deploys, HR, Storage, Make, Gemini, pagos, Historical Shopper, merge, producción = `0`.

## 6. R3 — cierre I3 después de causa probada

No se define todavía un write gate. Si R2B prueba que el provider ya era correcto y el defecto está en runtime/source, corregir únicamente ese mecanismo bajo el gate correspondiente y validar sobre el mismo estado. Si R2B prueba un write provider posterior que explica la diferencia, no reparar el link: validar el runtime contra el estado ya correcto.

PASS integral I3 requiere:
- `shp-57d2e3769946 → TYA_GT_0C0BA8856E`;
- agosto canonical `2`;
- residual live `0`;
- duplicados `0`;
- invariantes I3 preservadas;
- I3.9/I3.10 reutilizados sin rerun.

Entonces I3 = `25/25` y formal = **60%**.

## 7. I4 — operación visible

### I4-A — Shopper lifecycle
Documentos/instrucciones; certificaciones históricas/nuevas; disponibles; postulación; asignación; perfiles/roles/scopes; notificaciones; histórico.

### I4-B — visita
Agenda; reprogramación; cancelación; ventanas/reglas; ejecución; evidencias; cuestionario; submit; review/auditoría; estados dinámicos.

### I4-C — HR bidireccional
Plataforma→HR y HR→Plataforma; `tenantId`, `projectId`, `visitId/hrRowId`, `shopperId`, `assignmentSource`, `assignmentSyncStatus`, `lastSyncedAt`; no duplicación; conflictos a revisión; Make solo en su bloque con gate.

### I4-D — Finanzas
Histórico preservado; liquidaciones; pagos; junio real; honorarios/reembolsos configurables; trazabilidad tenant/proyecto/visita/shopper.

### I4-E — multi-proyecto/no-code
Country/currency/timezone/locale; HR/roadmap source + mapping; questionnaire provider/link policy; documentos/reglas/certificación; agenda; pagos; roles/notificaciones; integraciones; privacidad/evidencias.

### I4-F — Academia
Cursos/manuales/rutas por rol/notificaciones/instrucciones/certificaciones se actualizan en paralelo al comportamiento operacional.

## 8. I5 — producción

Freeze sin P0 → SHA/manifest/build-lock/verifier → preproducción → rollback → same-build E2E → revisión P0/P1/P2 → autorización expresa de Paula → deploy/cutover → smoke → baseline productivo.

## 9. Post-producción

El go-live no termina el desarrollo. Se mantiene canonical state + Atomic Gate Close + verifier para incidentes, hotfixes, nuevos proyectos y nuevos tenants.

## 10. Producto comercializable/no-code

TyA es primer tenant y Cinépolis primer proyecto normal configurable. Nunca lógica global.

Configuración reusable objetivo: país/moneda/timezone/locale; source adapter/mapping; períodos; cuestionarios; documentos; reglas/certificación; disponibilidad/postulación/asignación; agenda/reprogram/cancel; ejecución/evidencias/revisión; liquidaciones/pagos; roles/scopes/notificaciones; integraciones/gates; privacidad; Academia.

Fuentes objetivo: Google Sheets, Excel, CSV, API, CXOrbia nativo, import manual, plataforma/proveedor externo/link.

Alta objetivo: `crear proyecto → configurar source → mapear → dry-run → validar conflictos/IDs → activar → monitorear sync`.

## 11. Claude/prototipo

Backend no parchea silenciosamente `/app/modules` ni `/app/core`. Toda mejora generalizable hallada en TyA/Cinépolis se promueve a contrato reusable y se entrega a Claude con archivo/módulo, contrato backend, comportamiento y criterios de aceptación.

## 12. Definition of Done

Cada bloque debe cerrar objetivo/HOLD reproducible, efectos provider, safety, evidencia, causalidad `proven/disproven/unknown`, clasificación reusable/tenant/project, impacto Claude/Academia, documentos canónicos/PR al mismo `SYNC_EPOCH`, verifier y un único siguiente bloque exacto.
