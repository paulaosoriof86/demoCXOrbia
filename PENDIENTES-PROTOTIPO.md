# PENDIENTES-PROTOTIPO.md

**Última sincronización:** 2026-08-18 13:13 -06:00  
**SYNC_EPOCH:** `CXORBIA-20260818-I3-11C-RUNTIME-CONTRACT-DRIFT-03`  
**Estado:** `I3_11C_ROOT_CAUSE_PROVEN__ADAPTER_SOURCE_CORRECTION_NEXT__NO_UI_WORKAROUND__GO_LIVE_35`

## Pendiente vivo único I3

`I3_11C_UNIFY_PROVIDER_IDENTITY_RUNTIME_WITH_CANONICAL_ROLL_FORWARD_SOURCE_CORRECTION_NO_PROVIDER_IO`.

Causa probada:
`PROVEN_RUNTIME_CONTRACT_DRIFT__LEGACY_PROVIDER_IDENTITY_LINK_APPLICABILITY_FILTER`.

No es provider state ni UI:
- target provider intacto `materialized` + `tenant_adjudication`;
- contrato canónico lo acepta;
- runtime legacy solo acepta `active` + `providerAck=true`;
- target se filtra determinísticamente;
- backend-dev carga ese runtime legacy.

## Corrección requerida

- `app/adapters/cxorbia-provider-identity-link-runtime-v1.js`: alinear trust/applicability con contrato roll-forward reusable, preservando API y exact matching;
- agregar QA contract parity para evitar nueva divergencia;
- no `/app/modules`, no `/app/core`, no provider I/O/deploy.

Después, gate Staff read-only exacto para confirmar `shp-57d2e3769946 → TYA_GT_0C0BA8856E`, agosto `2` canonical / `0` residual y duplicados `0`. Solo ese PASS cierra I3 y mueve formal a 60%.

## Frozen / no reprocesar

I1/I2/I3.1→I3.10; Historical Shopper; TARGET_B Admin; request08; I3.5B/I3.5C-2/I3.8; Rules I3.11C; focal provider read; R2B forensic; HR 15/660; Finance V2/historical; legal V0.4.

No Admin/Shopper workaround, password/reset histórico, HR reimport, Finance rebuild, Rules redeploy ni provider identity-link repair.

## I4 — pendientes visibles

### A. Shopper lifecycle
Documentos/instrucciones, certificaciones históricas/nuevas, disponibles, postulación, asignación, perfil/roles/scopes, notificaciones e histórico.

### B. Agenda/visita
Agendar, reprogramar, cancelar, ventanas/reglas, ejecución, evidencias, cuestionario, submit, review/auditoría, estados dinámicos.

### C. HR/sync
Plataforma→HR y HR→Plataforma con IDs exactos, `assignmentSource`, `assignmentSyncStatus`, `lastSyncedAt`, no duplicación y conflictos a revisión.

### D. Finanzas
Liquidaciones, pagos, junio real, histórico, honorarios/reembolsos configurables y trazabilidad.

### E. Multi-proyecto/no-code
Project Builder/config: source, mapping, cuestionario/provider/link, documentos/reglas/certificación, agenda, pagos, roles/notificaciones, país/moneda/timezone/locale, integraciones, privacidad/evidencias.

## Backlog reusable Claude/prototipo

TyA = primer tenant. Cinépolis = primer proyecto. Cualquier hallazgo generalizable pasa a contrato reusable; no hardcode global. Fuentes objetivo: Sheets, Excel, CSV, API, plataforma nativa, import manual, proveedor/link externo. Alta objetivo: `crear → configurar source → mapear → dry-run → validar → activar → monitorear`.

## Academia

Cursos/manuales/rutas/notificaciones/certificación se actualizan en paralelo a cada slice funcional. R2B no cambia todavía una acción visible del usuario.

## I5

Freeze sin P0 → SHA/manifest/build-lock/verifier → preproducción → rollback → same-build E2E → gate producción → cutover/smoke → baseline → continuidad post-go-live.

## Avance

**Formal 35% / 65% pendiente.** R2B root-cause forensic cerrado; R3-A source correction es el siguiente bloque. No se suman puntos formales hasta I3 integral PASS.
