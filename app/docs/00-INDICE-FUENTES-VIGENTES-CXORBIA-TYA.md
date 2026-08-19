# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Última sincronización:** 2026-08-19 11:23 -06:00  
**SYNC_EPOCH:** `CXORBIA-20260819-I4A-VISIBLE-SMOKE-RETRY1-DOCUMENT-SELECTOR-HOLD-23`  
**Estado:** `SOURCE_TRUTH_SYNCHRONIZED__I3_FROZEN__60_40__I4A_AUTH_MEMBERSHIP_APP_HR_PASS__DOCUMENT_SELECTOR_HOLD__RETRY2_AUTHORIZED`

## Orden obligatorio
1. `app/docs/CXORBIA-EXECUTION-STATE.json`
2. `app/docs/SOURCE-LOCK-CXORBIA-TYA.md`
3. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`
4. Plan Unificado activo
5. Plan Lock
6. `CAMBIOS-BACKEND.md`, `RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md`
7. evidencia activa
8. PR #7 + HEAD + delta desde último HEAD canónico.

Permanecen activas reglas maestras, Academia, patrones reutilizables, antidesvío y addendum canónico de ejecución directa/empalme.

## CONTINUITY_FAST_PATH
No reconstruir miles de commits, Actions o históricos. Un objetivo real por iteración; evidencia; una reconciliación atómica. Un HOLD de harness no se convierte en P0 de producto sin evidencia reproducible.

## Estado formal
I1 `15/15`; I2 `20/20`; I3 `25/25 FROZEN`; I4 `0/25`; I5 `0/15` = **60% / 40%**.

## I4-A — verdad viva
Retry estabilizado run `32280348780`: Service Worker bloqueado; `page_ready`, Firebase user, Shopper auth context, membership, entrada de app y autoridad HR PASS; HR `15/660`; cero page/console errors y cero backend write attempts. Esto elimina el timeout previo de Auth bajo el harness estabilizado.

El HOLD ocurrió después, en Documentos: la ruta `Recursos del proyecto` ya estaba renderizada y Playwright resolvió `div[data-doc=d1]`, pero el selector genérico eligió el contenedor antes del botón visible y agotó el click por estabilidad. Clasificación: `PIPELINE_MECHANISM_FAILURE__DOCUMENT_SELECTOR_TARGET__NO_PRODUCT_DEFECT_PROVEN`.

Evidencia: `app/docs/evidence/I4A-VISIBLE-DEV-SHOPPER-LIFECYCLE-SMOKE-RETRY1-HOLD-LATEST.json`.

## Siguiente frontera exacta
`NEW_AUTH_REQUIRED_I4A_VISIBLE_DEV_SHOPPER_LIFECYCLE_SMOKE_RETRY2__STABLE_SURFACE_SELECTORS__NO_SW`

Autorizada por la instrucción expresa del turno actual de proceder y aplicar correctivos, bajo el mismo perímetro: misma Shopper sintética, máximo 1 login + 1 password update efímero, cero Auth creates/claims/deletes, cero Firestore/HR/Make/Gemini/pagos writes, cero deploy/merge/producción.

## Circuit breaker
Retry1 consumido no se repite. Retry2 es un gate nuevo y acotado. Mismatch documental => `SOURCE_TRUTH_MISMATCH__STOP_TECHNICAL_EXECUTION`.
