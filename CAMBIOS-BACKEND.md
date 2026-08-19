# CAMBIOS-BACKEND.md

**Última sincronización:** 2026-08-18 19:31 -06:00  
**SYNC_EPOCH:** `CXORBIA-20260818-I4-SCOPE-MATERIALIZED-17`  
**Estado:** `I3_FROZEN__GO_LIVE_60__I4_SCOPE_MATERIALIZED__I4A_NEXT__NO_EXECUTION`

## Bloque ejecutado

`MATERIALIZE_CANONICAL_I4_SCOPE_FROM_APPROVED_SOURCE__NO_EXECUTION`

Tipo: documental/read-only. Cero cambios de producto/provider/datos; cero Auth/Firestore/Rules/HR/Storage/Make/Gemini/pagos; cero Hosting/Cloud Run; cero cambios de usuario/contraseña; cero merge/producción.

## Hallazgo y resolución

La fuente aprobada sí estaba en el orden obligatorio del índice: `app/docs/ADDENDUM-MAESTRO-PLAN-UNIFICADO-PHASE-A-NO-DESVIACION-CXORBIA-TYA-20260817.md`.

Su sección `9. I4 — operación visible` define explícitamente:
- I4-A Shopper lifecycle: documentos/instrucciones; certificaciones históricas/nuevas; disponibles; postulación; asignación; perfiles/roles/scopes; notificaciones; histórico.
- I4-B visita: agenda; reprogramación; cancelación; ventanas/reglas; ejecución; evidencias; cuestionario; submit; review/auditoría; estados dinámicos.
- I4-C HR bidireccional: Plataforma→HR y HR→Plataforma con IDs/sync exactos, no duplicación y conflictos a revisión; Make solo bajo gate.
- I4-D Finanzas: histórico preservado; liquidaciones; pagos; junio real; honorarios/reembolsos configurables; trazabilidad tenant/proyecto/visita/shopper.
- I4-E multi-proyecto/no-code: país/moneda/timezone/locale; source+mapping; cuestionario/provider/link; documentos/reglas/certificación; agenda; pagos; roles/notificaciones; integraciones; privacidad/evidencias.
- I4-F Academia: cursos/manuales/rutas/notificaciones/instrucciones/certificaciones junto con cada comportamiento operacional visible.

`ACTIVE_SOURCE_GAP__I1_I5_PERCENT_WEIGHTS_PRESENT_BUT_I4_SEMANTIC_SCOPE_NOT_MATERIALIZED` queda **RESOLVED**. No se promociona `CORTE 4` legado a I4.

## Preservado

I1 `15/15 PASS`, I2 `20/20 PASS`, I3 `25/25 PASS` integral/frozen. Staff final run `32196648462`; identityMap canonical; agosto `2/0`; duplicados `0/0`; safety cero. No se reejecutó I3.

## Archivos tocados

- `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md` — sincronizado a 60/40 e I4 materializado.
- `app/docs/CXORBIA-EXECUTION-STATE.json` — estado vivo actualizado.
- `app/docs/SOURCE-LOCK-CXORBIA-TYA.md` — source gap resuelto, I4-A→F fijado.
- `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md` — I4-A siguiente.
- `CAMBIOS-BACKEND.md`, `RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md` — continuidad sincronizada.
- PR #7 — sincronización del bloque.

## Clasificación

- **Reusable CXOrbia:** alcance operacional visible I4-A→F.
- **Exclusivo TyA:** primer tenant/proyectos y evidencia real, sin hardcode global.
- **Claude/prototipo:** sin parche UI en este bloque.
- **Academia:** I4-F confirmado como parte canónica del alcance.
- **Sin impacto Claude inmediato:** materialización documental/read-only.

## Avance Phase A

I1 `15/15`; I2 `20/20`; I3 `25/25`; I4 `0/25`; I5 `0/15` = **60% completado / 40% pendiente**.

## Siguiente bloque exacto

`I4-A — SHOPPER LIFECYCLE`

No se ejecutó I4 todavía. Primer alcance: documentos/instrucciones; certificaciones históricas/nuevas; disponibles; postulación; asignación; perfiles/roles/scopes; notificaciones; histórico. Provider writes/deploy/merge/producción no autorizados.
