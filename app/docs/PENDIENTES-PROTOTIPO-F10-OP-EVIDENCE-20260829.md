# PENDIENTES PROTOTIPO — ADDENDUM F10 OPERATIONAL EVIDENCE — 2026-08-29

**STATE_SYNC_EPOCH:** `CXORBIA-20260829-F10-OP-EVIDENCE-SOURCE-PASS-12`  
**Incidente:** `F10-HR-KPI-FRESHNESS-20260829-01`  
**Estado:** `OPEN_P1_SOURCE_REPAIRED_PENDING_PREDEPLOY_AND_DEPLOY`  
**NEXT:** `F10_PREDEPLOY_EXACT_SOURCE_BROWSER_AND_MODULE_MATRIX_GATE_THEN_REQUIRE_EXPLICIT_DEPLOY_AUTHORIZATION`

Este addendum prevalece para F10 sobre pendientes históricos que todavía indiquen como abiertos la lectura provider fresca, la adjudicación fila a fila, la búsqueda de causa raíz o la duda sobre si se cargan módulos antiguos.

## Cerrado — no volver a diagnosticar

- **Versión de módulos:** cerrada como causa del incidente. Matriz exacta posterior al patch: 26 módulos Phase A + 10 soporte + 5 post-Phase-A cargados, `0` mismatches; entrypoint y `app.js` exactos.
- **Frescura independiente:** cerrada para la revisión que adjudicó el incidente. Run `33281688280`, revision `b7bc89176161a8a1b83e3d33098634ae77a5a8bc3f6f44ee7c749e2d11da598d`, `sourceReadAt=2026-08-29T23:44:58.827Z`.
- **Reconciliación fila a fila:** cerrada; las filas `AGOSTO 26!13/16/18/22/24/35` explican el delta observado.
- **Causa raíz:** cerrada: `BACKWARD_LIFECYCLE_PROMOTION_USED_AS_VISIBLE_OPERATIONAL_EVIDENCE`.
- **Patch source:** aplicado y verificado. Atomic run `33283725070`, commit funcional `6392736070dcf34d24f9b27b8bb1d0ecbcf116b0`, adapter blob `941051c96a26017363acfc72f7e88edbe70c68ba`.
- **Hipótesis de parchear core:** descartada para este incidente; `app/core/tya-phase-a-source-safe-preview.js` y `app/core/data.js` no se reabren.
- **Semántica financiera:** cerrada: `submitted = liquidationCandidate`; candidata, liquidación confirmada y pago confirmado son tres estados distintos.

## Pendiente real y finito

1. **Predeploy exact-source/browser + module matrix gate.** Debe comprobar el adapter sucesor exacto y la fachada operacional en browser, manteniendo los blobs aprobados sin cambios.
2. **Autorización explícita de deploy.** El patch F10 está source-only; no está servido todavía por Hosting.
3. **Deploy focal del sucesor F10**, únicamente después del gate anterior y autorización de Paula; sin rebuild/restauración global de módulos.
4. **Revalidación live same-revision.** Después del deploy, forzar una nueva lectura HR fresca con `revision/sourceReadAt` y contrastar Dashboard/HR Source/Periodos/Historico/Visitas/Postulaciones/Reservas/Shoppers contra esa misma revisión.
5. **Owner visual acceptance.** Solo después de la revalidación anterior.
6. **Cliente/Cliente 360:** HOLD separado; resolver sin mezclarlo con HR/KPI ni reabrir módulos ya certificados.
7. **Mejora visual no bloqueante:** si Paula la aprueba, exponer `Candidatas a liquidación` separado de `Liquidadas`. No cambiar el significado de `Liquidadas`.
8. **Academia/manuales:** revisar las definiciones visibles de hitos únicamente después del deploy y aceptación visual.

## Valores de control de la revisión fresca adjudicada

Agosto 2026, solo como evidencia de control — **no hardcodear**:

- total 44;
- realizadas 30 (`GT24/HN6`);
- pendientes de realizar 14;
- cuestionario pendiente 4 (`GT4`);
- sin agendar operativas 4 (`GT3/HN1`);
- submitidas/candidatas a liquidación 30;
- liquidaciones confirmadas 0;
- pagos confirmados 0.

## Regla anti-bucle

No volver a proponer: nueva candidata, restore V182, nueva rama, nuevo PR, nuevo workflow, reimport, rebuild, parche masivo de módulos/core, reauditoría general de frontend ni nueva investigación de causa raíz de este incidente.

Un nuevo diagnóstico solo se justifica si el siguiente gate presenta una evidencia reproducible distinta. Un KPI incorrecto por sí solo no reabre el linaje de módulos: primero debe existir drift exacto de blob/asset.

## Clasificación

- **Reusable CXOrbia:** cierre finito por planos: module lineage / source authority / read-model semantics / deployed asset / browser same-revision.
- **Exclusivo cliente TyA:** revisión y conteos Cinépolis agosto 2026.
- **Claude/prototipo:** únicamente la posible visualización separada de candidatas a liquidación; módulos aprobados HARD PRESERVE.
- **Academia:** pendiente solo tras aceptación visible.
- **Sin impacto Claude:** predeploy gate, hashes, control plane y autorización/deploy mechanics.
