# PENDIENTES-PROTOTIPO.md

**Última sincronización:** 2026-08-18 13:20 -06:00  
**SYNC_EPOCH:** `CXORBIA-20260818-I3-11C-RUNTIME-SOURCE-CORRECTION-04`  
**Estado:** `I3_11C_SOURCE_CORRECTED__STAFF_READONLY_CLOSE_AUTH_REQUIRED__NO_UI_WORKAROUND__GO_LIVE_35`

## Pendiente vivo único antes de cerrar I3
`NEW_AUTH_REQUIRED_I3_11C_STAFF_RUNTIME_CANONICAL_IDENTITY_CLOSE_READONLY_NO_WRITES`.

La corrección source ya está preparada/aplicada para el adapter reusable de identidad runtime; no se requiere provider repair ni UI workaround.

El próximo gate debe ejecutar primero `tools/qa/cxorbia-provider-identity-runtime-contract-parity-gate.mjs` y luego una única validación Staff/Admin DEV read-only sobre el runtime corregido.

PASS requerido:
- `shp-57d2e3769946 → TYA_GT_0C0BA8856E`;
- agosto canonical `2`;
- residual live `0`;
- duplicateVisitKeys `0`;
- duplicateShopperIds `0`;
- cero writes/password changes/deploy/producción.

## Frozen / no reprocesar
I1/I2/I3.1→I3.10; Historical Shopper; TARGET_B Admin; request08; I3.5B/I3.5C-2/I3.8; Rules I3.11C; focal provider read; root-cause forensic; HR 15/660; Finance V2/historical; legal V0.4.

## I4 — pendientes visibles después de I3
### A. Shopper lifecycle
Documentos/instrucciones, certificaciones históricas/nuevas, disponibles, postulación, asignación, perfil/roles/scopes, notificaciones e histórico.
### B. Agenda/visita
Agendar, reprogramar, cancelar, reglas/ventanas, ejecución, evidencias, cuestionario, submit y review/auditoría.
### C. HR/sync
Plataforma→HR y HR→Plataforma con IDs exactos, `assignmentSource`, `assignmentSyncStatus`, `lastSyncedAt`, no duplicación y conflictos a revisión.
### D. Finanzas
Liquidaciones, pagos, junio real, histórico, honorarios/reembolsos configurables y trazabilidad.
### E. Multi-proyecto/no-code
Project Builder/config: source, mapping, cuestionario/provider/link, documentos/reglas/certificación, agenda, pagos, roles/notificaciones, país/moneda/timezone/locale, integraciones, privacidad/evidencias.

## Claude/prototipo
TyA = primer tenant; Cinépolis = primer proyecto. El fix actual es reusable backend. No hardcode global ni parche UI. Cualquier conducta visible confirmada por R3-B se documentará por archivo/módulo y criterio de aceptación.

## Academia
Cursos/manuales/rutas/notificaciones/certificación se actualizan en paralelo a cada slice funcional. R3-A por sí solo no cambia aún una acción de usuario validada.

## I5
Freeze sin P0 → SHA/manifest/build-lock/verifier → preproducción → rollback → same-build E2E → gate producción → cutover/smoke → baseline.

## Avance
**Formal 35% / 65% pendiente.** R3-A source correction queda completada operacionalmente. Con R3-B PASS integral, I3 cierra y formal pasa a **60% / 40% pendiente**.
