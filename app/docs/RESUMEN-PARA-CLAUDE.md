# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-29  
**STATE_SYNC_EPOCH:** `CXORBIA-20260829-F10-HR-KPI-P1-CONTROL-PLANE-SYNC-11`  
**Estado:** `PHASE_A_100__F10_CONTROL_PLANE_SYNCHRONIZED__P1_HR_KPI_FRESHNESS_OPEN__NO_UI_REBUILD`

## Estado canónico

Release `CXORBIA-PHASE-A-RELEASE-100-FROZEN-20260827-01`, functional source `f9802fdd498934a8e7729fa5c7d18341bec1cd71`, F8.5 lineage PASS y F9 `POSTPROD_ACCEPTED` permanecen preservados.

El incidente F10 `F10-HR-KPI-FRESHNESS-20260829-01` es P1, no P0, y no demuestra que se haya servido una versión frontend antigua. No restaurar V182 ni reconstruir módulos cerrados.

## Reparación transversal ya aplicada

Se corrigió el cursor de continuidad para impedir regresiones metodológicas:

- overlay postproducción actualizado a F10 y al incidente activo;
- índice, checkpoint, execution state y source lock canónicos alineados al mismo epoch;
- M2/M3/F8/readiness 69/95 quedan históricos y no pueden dirigir una sesión nueva;
- F8.5 sigue definiendo el linaje aprobado de módulos.

Pendiente del mismo bloque técnico: terminar mirrors raíz + validador genérico para que esa regla quede ejecutable y no solo documental.

## Corrección obligatoria de la prueba anterior

El run `33257681796` no demostró sincronización instantánea con Google Sheets. Admin y Shopper sí autenticaron/navegaron en Hosting real, pero el test comparó UI y `periodOperationalSummary` del mismo snapshot de `CX.data`. Eso prueba consistencia interna, no frescura independiente.

La validación nueva debe ser:

`provider fresh=1 → revision/sourceReadAt → cálculo canónico independiente → UI/Hosting contra la misma revisión`.

## Causa técnica demostrada

- `backend/runtime/hr-live-service/server.mjs`: lectura normal puede devolver cache mientras refresca; `fresh=1` espera la nueva lectura.
- `tools/qa/tya-f10-live-admin-shopper-functional-readonly.mjs`: self-parity; debe dejar de certificar frescura por comparación interna.
- motor R20: `liquidationCandidate=submitted` y se separa de liquidación/pago confirmado.
- `app/core/tya-phase-a-source-safe-preview.js`: pierde parte de la semántica canónica al materializar CX.data.
- `app/core/data.js`: reconstruye submitted/liquidadas con semántica más pobre que la autoridad canónica.

## Archivos frontend focales — no hardcodear cifras/meses

1. `app/core/tya-phase-a-source-safe-preview.js`: preservar `canonicalFacets`, submitted y `liquidationCandidate`.
2. `app/core/data.js`: consumir la autoridad canónica en vez de reconstruir estados con reglas empobrecidas.
3. `app/modules/dashboard.js`: mostrar buckets canónicos del periodo activo.
4. `app/modules/periodos.js` y `app/modules/historico.js`: corregir `Cinépolis JUN` sin hardcodear agosto/septiembre.

No tocar otros módulos sin evidencia. No reescribir frontend completo. No crear nueva candidata por rutina.

## Módulos a revalidar sobre una sola revisión fresca

Dashboard, HR Source, Periodos, Histórico, Visitas, Postulaciones, Reservas/Asignación, Shoppers, Finanzas/Liquidaciones y superficies Shopper.

Shopper: identidad/histórico checkpoint-backed permanecen válidos, pero visitas actuales y login humano por contraseña requieren recertificación fresca.

Cliente/Cliente 360: HOLD separado. No tratar su timeout como consecuencia de HR sin evidencia.

## Academia

Sin cambio funcional todavía. Si el delta aprobado modifica definiciones visibles de estados/KPIs, actualizar después manuales, cursos, errores frecuentes, rutas por rol y glosario. No convertir evidencia técnica de cache/QA en contenido de usuario final.

## Seguridad

Sin HR/Auth/Firestore/Storage/Rules/payment writes; sin Make/Gemini; sin deploy/rebuild/reimport/merge. Las cifras actuales son evidencia temporal y nunca datos fijos.

## Siguiente frontera

`F10_FORCE_FRESH_PROVIDER_ROW_LEVEL_RECONCILIATION_THEN_FIX_QA_FRESHNESS_AND_CANONICAL_KPI_BRIDGE_BEFORE_OWNER_VISUAL_ACCEPTANCE`.
