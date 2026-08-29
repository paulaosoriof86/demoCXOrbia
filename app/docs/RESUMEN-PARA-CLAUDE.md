# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-29  
**Estado:** `PHASE_A_100__PROD_READINESS_100_HISTORY__F10_P1_HR_KPI_FRESHNESS_OPEN__NO_UI_REBUILD`

## Estado canónico

Phase A `100/100`, F8/F8.5/F9 terminales y release `CXORBIA-PHASE-A-RELEASE-100-FROZEN-20260827-01` permanecen preservados. F10 abrió un **P1 reproducible de frescura/read-model/KPI**; no es P0 demostrado y no reabre retroactivamente F9.

## Corrección obligatoria del handoff anterior

El run `33257681796` no demostró que los KPIs estuvieran sincronizados con Google Sheets en el mismo instante. Admin y Shopper sí autenticaron/navegaron sobre Hosting real, pero el test comparó los KPIs contra `periodOperationalSummary` del **mismo snapshot de CX.data**. Eso prueba consistencia interna, no frescura independiente. El workflow global terminó HOLD/failure por follow-up Cliente.

Las cifras del run (44 total; sin agendar 3; realizadas 31; pendientes realizar 13; cuestionario pendiente 0; liquidadas 0) quedan como **snapshot observado por la app**, no como autoridad actual de HR.

Paula aportó capturas actuales de la HR con diferencias: sin agendar GT4/HN1 en crudo (una GT sin agenda ya realizada debe excluirse del bucket); realizadas GT24/HN6; una pendiente de realizar adicional; cuatro cuestionarios pendientes en GT; y visitas con realizada+cuestionario+submitido que deben entrar como candidatas a liquidación, no desaparecer porque el pago/liquidación financiera aún no esté confirmado.

## Causa técnica demostrada

- `backend/runtime/hr-live-service/server.mjs`: el modo normal usa cache y stale-while-revalidate; solo `?fresh=1` espera la nueva lectura provider. No usar lectura normal para certificar frescura operacional.
- `tools/qa/tya-f10-live-admin-shopper-functional-readonly.mjs`: self-parity del mismo snapshot; debe ser sustituida/complementada por provider fresh read independiente y comparación por revision/sourceReadAt.
- `tools/hr-source/tya-canonical-visit-state-r20.mjs`: autoridad canónica separa `liquidationCandidate=submitted` de `liquidationConfirmed`.
- `app/core/tya-phase-a-source-safe-preview.js`: conserva `submittedAt`, pero usa `submit: !!v.submit` y no conserva todos los facets canónicos.
- `app/core/data.js`: `submitted` depende de `v.submit`/`estado=liquidada` y `liquidadas` exige `estado==='liquidada'`; esto no representa el KPI operacional de candidatas submitidas.

## Archivos frontend a revisar — NO hardcodear cifras/meses

1. `app/core/tya-phase-a-source-safe-preview.js`: preservar la semántica canónica ya calculada (`canonicalFacets`, `submitted`, `liquidationCandidate`, estados de ciclo) al materializar CX.data.
2. `app/core/data.js`: los bucket functions deben consumir la autoridad canónica y no reconstruir estados con una semántica más pobre; en particular `liquidadas` debe alinearse con el significado funcional aprobado del KPI y mantenerse separado de pago confirmado.
3. `app/modules/dashboard.js`: mostrar exactamente los buckets canónicos del periodo activo y permitir validación por país/estado; no fijar números actuales.
4. `app/modules/periodos.js` y `app/modules/historico.js`: corregir el rótulo contextual `Cinépolis JUN` sin hardcodear agosto/septiembre.

No restaurar/re-escribir el frontend completo. No tocar módulos no involucrados. Cualquier delta frontend sigue el carril vigente y debe preservar el prototipo aprobado.

## Revalidación requerida después de corrección

Dashboard, HR Source, Periodos, Histórico, Visitas, Postulaciones, Reservas/Asignación, Shoppers, Finanzas/Liquidaciones y superficies Shopper deben reconciliarse contra **la misma lectura provider forzada**, con revision/sourceReadAt comunes y detalle por país/estado. Un PASS de navegación no equivale a PASS de datos.

Shopper: identidad/histórico checkpoint-backed funcionaron, pero el estado actual de sus visitas depende de esta reconciliación; el login humano por contraseña no fue recertificado en el run 33257681796. Cliente continúa como HOLD separado.

## Academia

Sin cambio funcional causado por este incidente. Si cambian definiciones visibles de estados/KPIs, actualizar manuales/cursos por rol después de aprobar el delta.

## Seguridad

No writes en HR/Auth/Firestore/Storage/Rules/pagos; no Make/Gemini; no deploy/reimport/merge. Las cifras observadas son evidencia temporal, nunca seeds ni constantes.

## Siguiente frontera

`F10_FORCE_FRESH_PROVIDER_ROW_LEVEL_RECONCILIATION_THEN_FIX_QA_FRESHNESS_AND_CANONICAL_KPI_BRIDGE_BEFORE_OWNER_VISUAL_ACCEPTANCE`.
