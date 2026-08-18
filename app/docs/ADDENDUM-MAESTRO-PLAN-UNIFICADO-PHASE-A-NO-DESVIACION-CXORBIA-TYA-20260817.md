# ADDENDUM MAESTRO — PLAN UNIFICADO PHASE A · NO DESVIACIÓN · CXORBIA TyA

**Plan original:** 2026-08-17  
**Última sincronización:** 2026-08-18 13:13 -06:00  
**SYNC_EPOCH:** `CXORBIA-20260818-I3-11C-RUNTIME-CONTRACT-DRIFT-03`  
**Estado:** `ACTIVO__PREVALENTE__I3_11C_ROOT_CAUSE_PROVEN__SOURCE_CORRECTION_NEXT__I4_I5_PRESERVED`

## 0. Regla

Este plan no reinicia metodología ni Phase A. Continúa I1→I5 y conserva source truth machine-readable, Atomic Gate Close, circuit breaker y separación canonical/history.

## 1. Estado formal

Repo `paulaosoriof86/demoCXOrbia`; rama única `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge; base `release/cxorbia-tya-rc-20260630`; DEV `cxorbia-backend-dev`.

I1 `15/15 PASS`; I2 `20/20 PASS`; I3 `0/25` hasta PASS integral; I4 `0/25`; I5 `0/15` = **35% completado / 65% pendiente**. I3 integral PASS → **60%**.

## 2. Frozen

I1/I2; I3.1→I3.10; Historical Shopper `31906391682`; TARGET_B Admin; request08; I3.5B/I3.5C-2/I3.8; Firestore Rules I3.11C `32163552089`; focal provider identity-link read `32171812808`; R2B root-cause forensic; HR 15/660; Finance V2/historical; legal V0.4.

No rerun/recreate/reset/reimport/rebuild/redeploy salvo regresión nueva reproducible que invalide expresamente un PASS.

## 3. R1 — Source truth duradero — PASS

Canonical state + índice + source lock + checkpoint + plan + CAMBIOS/RESUMEN/PENDIENTES + PR #7 + verifier. Mismatch → `SOURCE_TRUTH_MISMATCH__STOP_TECHNICAL_EXECUTION`. Ejecución no sincronizada → `EXECUTED_UNSYNCED_DO_NOT_ADVANCE`. Dos repeticiones no reductivas → `FORENSIC_STOP`.

## 4. R2 — Focal provider identity-link adjudication — PASS / CONSUMED

Run `32171812808`. Target `irl_3ed1b9a65d36c5873c1306bae1621e9d` intacto/aplicable; mapping `shp-57d2e3769946 → TYA_GT_0C0BA8856E`; status `materialized`; authority `tenant_adjudication`; field diff `[]`; provider actual `2` trusted / `0` rejected. Provider writes `0`. No provider repair.

## 5. R2B — temporal/runtime forensic — PASS / ROOT CAUSE PROVEN

Perfil: `I3_11C_TEMPORAL_WRITE_HISTORY_AND_RUNTIME_STALENESS_FORENSIC_NO_PROVIDER_READS`.

Resultado:
`PROVEN_RUNTIME_CONTRACT_DRIFT__LEGACY_PROVIDER_IDENTITY_LINK_APPLICABILITY_FILTER`.

Prueba:
- el target authoritative está `materialized`;
- `cxorbia-identity-roll-forward-v1` acepta `materialized` + `tenant_adjudication` + authorityRef;
- `cxorbia-provider-identity-link-runtime-v1` exige `status === active` y `providerAck === true`;
- el target es rechazado determinísticamente por el runtime legacy antes de precompose/enrich;
- `index-backend-dev.html` carga ese runtime legacy y no el adapter roll-forward canónico;
- esto explica el Staff runtime `targetLinkCount=0` sin exigir un provider write temporal ni reparación del link.

Provider reads/writes del forensic: `0/0`. Frontend/core writes: `0`.

Evidencia: `app/docs/evidence/I3-11C-TEMPORAL-RUNTIME-CONTRACT-DRIFT-FORENSIC-LATEST.json`.

## 6. R3-A — siguiente bloque exacto: corrección source reusable

`I3_11C_UNIFY_PROVIDER_IDENTITY_RUNTIME_WITH_CANONICAL_ROLL_FORWARD_SOURCE_CORRECTION_NO_PROVIDER_IO`

Objetivo:
1. modificar únicamente `app/adapters/cxorbia-provider-identity-link-runtime-v1.js` para alinear estados/authority/source-safety/período con el contrato canónico;
2. preservar API/runtime bridge, exact technical identity, tenant/project scope y cero fuzzy/name/email/phone matching;
3. agregar gate source de paridad reusable que detecte futuras divergencias de contract;
4. validar sintaxis/paridad sin provider I/O;
5. documentar Atomic Gate Close.

Límites: `/app/modules` 0; `/app/core` 0; provider/Auth/Firestore-data/Rules/HR/Storage/Make/Gemini/pagos I/O 0; deploy 0; merge/production false.

## 7. R3-B — Staff read-only close después de corrección

La corrección source no prueba por sí sola el runtime real. Después requiere gate exacto read-only, no write, sobre el mismo build/estado.

PASS integral I3:
- `shp-57d2e3769946 → TYA_GT_0C0BA8856E`;
- agosto canonical `2`;
- residual live `0`;
- duplicados `0`;
- invariantes congeladas preservadas;
- I3.9/I3.10 reutilizados sin rerun.

Entonces I3=`25/25`, formal **60% completado / 40% pendiente**.

## 8. I4 — operación visible

### I4-A — Shopper lifecycle
Documentos/instrucciones; certificaciones históricas/nuevas; disponibles; postulación; asignación; perfiles/roles/scopes; notificaciones; histórico.

### I4-B — visita
Agenda; reprogramación; cancelación; ventanas/reglas; ejecución; evidencias; cuestionario; submit; review/auditoría; estados dinámicos.

### I4-C — HR bidireccional
Plataforma→HR y HR→Plataforma; `tenantId`, `projectId`, `visitId/hrRowId`, `shopperId`, `assignmentSource`, `assignmentSyncStatus`, `lastSyncedAt`; no duplicación; conflictos a revisión; Make solo en su gate real.

### I4-D — Finanzas
Histórico; liquidaciones; pagos; junio real; honorarios/reembolsos configurables; trazabilidad tenant/proyecto/visita/shopper.

### I4-E — multi-proyecto/no-code
Country/currency/timezone/locale; HR/roadmap source + mapping; questionnaire provider/link policy; documentos/reglas/certificación; agenda; pagos; roles/notificaciones; integraciones; privacidad/evidencias.

### I4-F — Academia
Cursos/manuales/rutas por rol/notificaciones/instrucciones/certificaciones se actualizan en paralelo al comportamiento operacional.

## 9. I5 — producción

Freeze sin P0 → SHA/manifest/build-lock/verifier → preproducción → rollback → same-build E2E → revisión P0/P1/P2 → autorización expresa de Paula → deploy/cutover → smoke → baseline productivo.

## 10. Post-producción

Canonical state + Atomic Gate Close + verifier continúan para incidentes, hotfixes, nuevos proyectos y tenants.

## 11. Producto comercializable/no-code

TyA es primer tenant y Cinépolis primer proyecto normal configurable. Nunca lógica global. Configuración reusable: país/moneda/timezone/locale; source adapter/mapping; períodos; cuestionarios; documentos; reglas/certificación; disponibilidad/postulación/asignación; agenda/reprogram/cancel; ejecución/evidencias/revisión; liquidaciones/pagos; roles/scopes/notificaciones; integraciones/gates; privacidad; Academia.

Fuentes objetivo: Google Sheets, Excel, CSV, API, CXOrbia nativo, import manual, plataforma/proveedor externo/link. Alta: `crear proyecto → configurar source → mapear → dry-run → validar conflictos/IDs → activar → monitorear sync`.

## 12. Claude/prototipo

Backend no parchea `/app/modules` ni `/app/core`. El hallazgo actual es adapter/runtime reusable; no requiere workaround UI. Si una corrección futura cambia conducta visible, se entrega a Claude por archivo/módulo + contrato + criterios de aceptación.

## 13. Definition of Done

Cada bloque cierra objetivo/HOLD reproducible, efectos provider, safety, evidencia, `proven/disproven/unknown`, clasificación reusable/tenant/project, impacto Claude/Academia, documentos canónicos/PR al mismo `SYNC_EPOCH`, verifier y un único siguiente bloque exacto.
