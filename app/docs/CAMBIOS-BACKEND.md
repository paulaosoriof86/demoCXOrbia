# CAMBIOS-BACKEND.md

**Última actualización:** 2026-08-29  
**Estado:** `F10_CONTINUOUS_POSTPRODUCTION_MONITORING__P1_HR_KPI_FRESHNESS_AND_CANONICAL_BRIDGE_OPEN`

## Estado canónico preservado

F8 está `CLOSED_PASS_ZERO_RESIDUE`; F8.5 está `CLOSED_PASS_CANONICAL_APPROVED_LINEAGE_MATCHES_FROZEN_SOURCE_AND_LIVE_HOSTING_RELEASE`; F9 está `POSTPROD_ACCEPTED_ACCELERATED_SAME_DAY`. Phase A=`100/100` y Production Real Readiness histórico=`100/100` permanecen como estado terminal del release certificado. F10 está activo y un incidente P1 no reescribe retroactivamente F9.

Release preservado: `CXORBIA-PHASE-A-RELEASE-100-FROZEN-20260827-01`, functional source `f9802fdd498934a8e7729fa5c7d18341bec1cd71`. No deploy/rebuild/reimport/merge/provider write se ejecutó en este bloque.

## F10 — CORRECCIÓN de la conclusión de prueba viva del 29/08/2026

El run `33257681796`, artefacto `9716340234`, **no puede seguir tratándose como demostración de frescura exacta de la HR**. El workflow global terminó `failure/HOLD`; Admin y Shopper produjeron evidencia de autenticación, navegación y coherencia interna del snapshot cargado, mientras Cliente quedó en timeout.

La prueba Admin/Shopper comparó los KPIs del Dashboard con `periodOperationalSummary` procedente del **mismo snapshot cargado en la aplicación**. Por tanto demostró auto-consistencia del read model, pero no una reconciliación independiente y forzada contra Google Sheets en ese mismo instante. La conclusión anterior `HR dinámica actual confirmada` queda degradada a `INTERNAL_SNAPSHOT_SELF_CONSISTENCY_ONLY`.

Las capturas operativas de la HR aportadas por Paula el 29/08 muestran discrepancias actuales respecto de ese snapshot: plataforma `Sin agendar=3 (GT2/HN1)` frente a HR cruda `GT4/HN1`, con al menos una fila GT sin agenda pero ya realizada que debe excluirse semánticamente; plataforma `Realizadas=31 (GT25/HN6)` frente a HR `GT24/HN6`; plataforma `Pendientes realizar=13` y HR reportada con una pendiente adicional; plataforma `Cuestionario pendiente=0` frente a HR `GT4`; plataforma `Liquidadas=0` aunque el mismo summary canónico del snapshot tenía `submitted=30` y `liquidationCandidates=30`.

## Causa raíz demostrada hasta ahora

1. **QA mechanism — self parity, no independent freshness.** `tools/qa/tya-f10-live-admin-shopper-functional-readonly.mjs` lee `CX.data`, `CX_PROTECTED_AUTH_HR_AUTHORITY`, `periodOperationalSummary` y los buckets visuales de la misma instancia. No ejecuta una lectura forzada independiente de Google Sheets antes de comparar.
2. **Runtime HR — stale-while-revalidate.** `backend/runtime/hr-live-service/server.mjs` mantiene cache (default ~55 s). Cuando el cache existe y vence, `buildSnapshot()` inicia refresh en background y devuelve el cache existente; solo `?fresh=1` espera la lectura nueva. Esto es válido como optimización general, pero no como prueba de frescura operacional de KPIs que cambian continuamente.
3. **Bridge/KPI semántico — candidato de liquidación vs liquidación confirmada.** El motor canónico R20 define `liquidationCandidate=submitted` y separa `liquidationConfirmed`. `app/core/tya-phase-a-source-safe-preview.js` conserva `submittedAt` pero deriva `submit` de `v.submit` y no conserva todos los facets canónicos; `app/core/data.js` deriva `submitted` de `v.submit`/`estado=liquidada` y el bucket `liquidadas` exige `estado==='liquidada'`. Esto explica que el Dashboard pueda mostrar 0 aunque el read model canónico tenga candidatos submitidos.

La causa exacta de los cuatro cuestionarios pendientes y del delta de una visita realizada todavía requiere lectura provider **forzada y fila a fila** para distinguir `snapshot stale` de `column/state mapping`. No se inventa esa adjudicación.

Evidencia: `app/docs/evidence/RC15-F10-HR-KPI-FRESHNESS-INCIDENT-20260829-01.json`.

## Relectura de módulos aprobados

- Dashboard: `FAIL_CURRENT_HR_KPI_FRESHNESS_AND_SEMANTIC_RECONCILIATION`.
- Fuente HR: renderiza, pero la frescura independiente no quedó demostrada por el run anterior.
- Periodos/Historico: renderizan; además persiste P1 contextual `Cinépolis JUN`; reconciliación fresca pendiente.
- Visitas/Postulaciones/Reservas/Shoppers: navegación PASS solamente; sus cifras/filas actuales deben reconciliarse contra lectura provider fresca.
- Finanzas: conciliación de periodos financieros cerrados permanece separadamente certificada; no usarla para justificar el KPI operacional `Liquidadas` del Dashboard.
- Liquidaciones: ruta renderiza, pero la semántica de candidato operacional está abierta.
- Shopper: identidad/histórico con token checkpoint-backed PASS; estado actual de visitas depende de la misma reconciliación fresca. El login humano por contraseña no fue recertificado en este run.
- Cliente: `HOLD_TIMEOUT` separado.
- Academia/Documentos: render solamente; no constituyen evidencia de frescura HR.

## Seguridad

Provider/business/Auth/Firestore/HR/Storage/Rules/payment writes=0; Make/Gemini=0; deploy/rebuild/reimport/merge=0; legacy DB access=false. No se alteró la HR ni se hardcodearon las cifras observadas.

## Clasificación

- **Reusable CXOrbia:** toda prueba de HR dinámica debe usar lectura provider forzada/identificada por revision+sourceReadAt y reconciliar por estado/sección; self-parity no certifica frescura.
- **Exclusivo cliente:** discrepancias actuales TyA/Cinépolis agosto 2026, que son evidencia temporal y nunca deben convertirse en valores fijos.
- **Claude/prototipo:** revisar `app/core/tya-phase-a-source-safe-preview.js`, `app/core/data.js`, `app/modules/dashboard.js`, además de `app/modules/periodos.js` y `app/modules/historico.js`; no hardcodear agosto ni cifras.
- **Academia:** sin cambio funcional por este incidente.
- **Sin impacto Claude:** reparación del arnés F10 y prueba provider forzada si no altera UI.

## Siguiente bloque exacto

`F10_FORCE_FRESH_PROVIDER_ROW_LEVEL_RECONCILIATION_THEN_FIX_QA_FRESHNESS_AND_CANONICAL_KPI_BRIDGE_BEFORE_OWNER_VISUAL_ACCEPTANCE`.
