# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Última sincronización:** 2026-08-18 19:31 -06:00  
**SYNC_EPOCH:** `CXORBIA-20260818-I4-SCOPE-MATERIALIZED-17`  
**Estado:** `SOURCE_TRUTH_SYNCHRONIZED__I3_FROZEN_PASS__GO_LIVE_60__I4_SCOPE_MATERIALIZED__I4A_NEXT__NO_PRODUCTION`

## Orden de lectura obligatorio

1. `app/docs/CXORBIA-EXECUTION-STATE.json`
2. `app/docs/SOURCE-LOCK-CXORBIA-TYA.md`
3. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`
4. `app/docs/ADDENDUM-MAESTRO-PLAN-UNIFICADO-PHASE-A-NO-DESVIACION-CXORBIA-TYA-20260817.md`
5. `CAMBIOS-BACKEND.md`, `RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md`
6. evidencia activa indicada por `CXORBIA-EXECUTION-STATE.json`
7. PR #7 vivo

Permanecen vigentes las reglas maestras, Academia, patrones reutilizables, antidesvío y ejecución directa/empalmes del proyecto. Los documentos históricos no sustituyen esta capa canónica.

## Carril único

Repo `paulaosoriof86/demoCXOrbia`; rama `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge; base `release/cxorbia-tya-rc-20260630`; DEV `cxorbia-backend-dev`.

## Estado formal

I1 `15/15 PASS`; I2 `20/20 PASS`; I3 `25/25 PASS` frozen; I4 `0/25`; I5 `0/15` = **60% completado / 40% pendiente**.

## Fuente aprobada que define I4

`app/docs/ADDENDUM-MAESTRO-PLAN-UNIFICADO-PHASE-A-NO-DESVIACION-CXORBIA-TYA-20260817.md`, sección `9. I4 — operación visible`.

I4 canónico:
- **I4-A — Shopper lifecycle:** documentos/instrucciones; certificaciones históricas/nuevas; disponibles; postulación; asignación; perfiles/roles/scopes; notificaciones; histórico.
- **I4-B — visita:** agenda; reprogramación; cancelación; ventanas/reglas; ejecución; evidencias; cuestionario; submit; review/auditoría; estados dinámicos.
- **I4-C — HR bidireccional:** Plataforma→HR y HR→Plataforma con IDs/sync exactos, no duplicación y conflictos a revisión; Make solo bajo gate.
- **I4-D — Finanzas:** histórico preservado; liquidaciones; pagos; junio real; honorarios/reembolsos configurables; trazabilidad tenant/proyecto/visita/shopper.
- **I4-E — multi-proyecto/no-code:** país/moneda/timezone/locale; source+mapping; cuestionario/provider/link; documentos/reglas/certificación; agenda; pagos; roles/notificaciones; integraciones; privacidad/evidencias.
- **I4-F — Academia:** cursos/manuales/rutas/notificaciones/instrucciones/certificaciones se actualizan junto con cada comportamiento operacional visible.

La brecha `ACTIVE_SOURCE_GAP__I1_I5_PERCENT_WEIGHTS_PRESENT_BUT_I4_SEMANTIC_SCOPE_NOT_MATERIALIZED` queda **resuelta**. No se mapea `CORTE 4` a I4; la autoridad es el addendum explícito I1→I5.

## Frozen / no reprocesar

I1/I2/I3 completo; Historical Shopper; TARGET_B Admin; Rules I3.11C; provider focal; Hosting identityMap; Staff final; HR `15/660`; Finance V2/historical; legal V0.4. No repetir I3.

## Siguiente frontera exacta

`I4-A — SHOPPER LIFECYCLE`

Primer bloque I4 únicamente dentro del alcance canónico listado arriba. Antes de cualquier provider write/deploy/producción se mantiene gate explícito. No reabrir I3.

## Anti-loop

Mismatch documental → `SOURCE_TRUTH_MISMATCH__STOP_TECHNICAL_EXECUTION`. Gate ejecutado sin sincronizar → `EXECUTED_UNSYNCED_DO_NOT_ADVANCE`. Dos repeticiones sin reducción causal → `FORENSIC_STOP`. Verificador: `tools/verify-cxorbia-source-truth-sync.mjs`.
