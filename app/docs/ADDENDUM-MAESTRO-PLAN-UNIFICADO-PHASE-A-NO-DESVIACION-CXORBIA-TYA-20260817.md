# ADDENDUM MAESTRO — PLAN UNIFICADO PHASE A · NO DESVIACIÓN · CXORBIA TyA

**Plan original:** 2026-08-17  
**Última sincronización:** 2026-08-18 13:20 -06:00  
**SYNC_EPOCH:** `CXORBIA-20260818-I3-11C-RUNTIME-SOURCE-CORRECTION-04`  
**Estado:** `ACTIVO__PREVALENTE__R3A_SOURCE_CORRECTION_APPLIED__R3B_STAFF_READONLY_AUTH_REQUIRED__I4_I5_PRESERVED`

## 1. Estado formal
Repo `paulaosoriof86/demoCXOrbia`; rama `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge; DEV `cxorbia-backend-dev`.

I1 `15/15 PASS`; I2 `20/20 PASS`; I3 `0/25` hasta PASS integral; I4 `0/25`; I5 `0/15` = **35% / 65% pendiente**. I3 PASS → **60%**.

## 2. Frozen
I1/I2; I3.1→I3.10; Historical Shopper; TARGET_B Admin; request08; I3.5B/I3.5C-2/I3.8; Rules I3.11C; focal provider read; R2B root-cause forensic; HR 15/660; Finance V2/historical; legal V0.4. No rerun sin regresión nueva reproducible.

## 3. R1 source truth — PASS
Canonical state, índice, source lock, checkpoint, plan, CAMBIOS/RESUMEN/PENDIENTES, PR y verifier. Mismatch → `SOURCE_TRUTH_MISMATCH__STOP_TECHNICAL_EXECUTION`; ejecución no sincronizada → `EXECUTED_UNSYNCED_DO_NOT_ADVANCE`; dos repeticiones no reductivas → `FORENSIC_STOP`.

## 4. R2 focal provider — PASS/CONSUMED
Run `32171812808`: target provider intacto y authoritative; 2 trusted/0 rejected; provider writes 0. No provider repair.

## 5. R2B runtime forensic — PASS ROOT CAUSE
`PROVEN_RUNTIME_CONTRACT_DRIFT__LEGACY_PROVIDER_IDENTITY_LINK_APPLICABILITY_FILTER`.

El runtime legacy exigía `active + providerAck=true`; el contrato canónico acepta `materialized + tenant_adjudication + authorityRef`. El target está `materialized`, por eso era filtrado determinísticamente.

## 6. R3-A source correction — APLICADA
`I3_11C_UNIFY_PROVIDER_IDENTITY_RUNTIME_WITH_CANONICAL_ROLL_FORWARD_SOURCE_CORRECTION_NO_PROVIDER_IO`.

Cambios:
- `app/adapters/cxorbia-provider-identity-link-runtime-v1.js`: paridad de trust/applicability con `cxorbia-identity-roll-forward-v1`, preservando API, exact identity, tenant/project isolation y cero fuzzy matching;
- `tools/qa/cxorbia-provider-identity-runtime-contract-parity-gate.mjs`: gate reusable de paridad y target materialized.

No `/app/modules`, no `/app/core`, no provider/Auth/data/Rules/HR/Storage/Make/Gemini/pagos I/O, no deploy/merge/producción.

## 7. R3-B siguiente gate exacto
`NEW_AUTH_REQUIRED_I3_11C_STAFF_RUNTIME_CANONICAL_IDENTITY_CLOSE_READONLY_NO_WRITES`.

Requiere autorización exacta nueva. Ejecutar parity gate source antes del runtime; luego una sola validación Staff/Admin canónico DEV read-only. Cero password changes/resets, usuarios nuevos, writes o deploy.

PASS integral I3:
- `shp-57d2e3769946 → TYA_GT_0C0BA8856E`;
- agosto canonical `2`;
- residual live `0`;
- duplicate visit keys `0`;
- duplicate shopper IDs `0`;
- invariantes frozen preservadas.

Entonces formal **60% completado / 40% pendiente**.

## 8. I4 — operación visible
### I4-A Shopper lifecycle
Documentos/instrucciones, certificaciones históricas/nuevas, disponibles, postulación, asignación, perfiles/roles/scopes, notificaciones e histórico.
### I4-B visita
Agenda, reprogramación, cancelación, ventanas/reglas, ejecución, evidencias, cuestionario, submit, review/auditoría, estados dinámicos.
### I4-C HR bidireccional
Plataforma→HR y HR→Plataforma con IDs exactos, `assignmentSource`, `assignmentSyncStatus`, `lastSyncedAt`, no duplicación y conflictos a revisión; Make bajo gate real.
### I4-D Finanzas
Histórico, liquidaciones, pagos, junio real, honorarios/reembolsos configurables, trazabilidad.
### I4-E multi-proyecto/no-code
Country/currency/timezone/locale; source+mapping; cuestionarios; documentos/reglas/certificación; agenda; pagos; roles/notificaciones; integraciones; privacidad/evidencias.
### I4-F Academia
Cursos/manuales/rutas/notificaciones se actualizan en paralelo a cada cambio operacional.

## 9. I5 — producción
Freeze sin P0 → SHA/manifest/build-lock/verifier → preproducción → rollback → same-build E2E → P0/P1/P2 → autorización expresa → cutover → smoke → baseline productivo.

## 10. Producto
TyA primer tenant; Cinépolis primer proyecto normal configurable, nunca global. Fuentes objetivo: Sheets/Excel/CSV/API/CXOrbia/import/proveedor-link. Alta: `crear → configurar source → mapear → dry-run → validar → activar → monitorear`.

## 11. Claude/prototipo
No parche frontend. El fix actual es adapter reusable. Cualquier cambio visible posterior se documenta por archivo/módulo + contrato + criterios de aceptación.

## 12. Definition of Done
Cada bloque debe cerrar evidencia, safety, causalidad, clasificación reusable/tenant/project, impacto Claude/Academia, documentos+PR al mismo epoch, verifier y siguiente bloque exacto.
