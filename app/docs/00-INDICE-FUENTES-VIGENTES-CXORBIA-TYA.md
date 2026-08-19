# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Última sincronización:** 2026-08-19 10:59 -06:00  
**SYNC_EPOCH:** `CXORBIA-20260819-I4A-VISIBLE-SMOKE-MECHANISM-HOLD-22`  
**Estado:** `SOURCE_TRUTH_SYNCHRONIZED__I3_FROZEN_PASS__GO_LIVE_60__I4A_VISIBLE_SMOKE_CONSUMED_HOLD__NO_PRODUCT_DEFECT_PROVEN__RETRY_AUTH_REQUIRED__NO_PRODUCTION`

## Orden obligatorio

1. `app/docs/CXORBIA-EXECUTION-STATE.json`
2. `app/docs/SOURCE-LOCK-CXORBIA-TYA.md`
3. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`
4. `app/docs/ADDENDUM-MAESTRO-PLAN-UNIFICADO-PHASE-A-NO-DESVIACION-CXORBIA-TYA-20260817.md`
5. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`
6. `CAMBIOS-BACKEND.md`, `RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md`
7. evidencia activa indicada por Execution State
8. PR #7 vivo + HEAD remoto + delta desde el último HEAD canónico

Permanecen vigentes reglas maestras, addendum canónico de empalme/carril, Academia, patrones reutilizables y antidesvío. Históricos no sustituyen esta capa.

## CONTINUITY_FAST_PATH

No reconstruir PR #7 completo, miles de commits/Actions ni documentos históricos cuando la capa canónica esté consistente. Un objetivo técnico real por iteración; un artifact/decisión; una reconciliación atómica; sin cadenas `finalize/close/seal`. Un gate consumido no se reejecuta automáticamente, incluso si el fallo fue de mecanismo.

## Carril único

Repo `paulaosoriof86/demoCXOrbia`; rama `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge; base `release/cxorbia-tya-rc-20260630`; DEV `cxorbia-backend-dev`.

## Estado formal

I1 `15/15 PASS`; I2 `20/20 PASS`; I3 `25/25 PASS` frozen; I4 `0/25` en curso/no puntuado; I5 `0/15` = **60% completado / 40% pendiente**.

## I4-A — verdad viva

La identidad DEV dedicada sintética/no histórica permanece provider-verificada y congelada como habilitador. El gate visible `NEW_AUTH_REQUIRED_I4A_SINGLE_VISIBLE_DEV_SHOPPER_LIFECYCLE_SMOKE` fue autorizado y consumido exactamente una vez.

Resultado del visible smoke: run `32278013553`, job `96149872897`, artifact `9374808032`, digest `sha256:b91f3bd3b1ce05303e426a45e98bd13372e6933499fc2548a98db8daa9a47437`. La prevalidación de identidad pasó exacta; hubo 1 Auth password update efímero y 1 intento de login. El navegador quedó en timeout antes de producir evidencia de superficies; `surfaces={}`, `pageErrors=[]`, Firestore writes/postulación/certificación/reserva/HR/Make/Gemini/pagos/deploy/merge/producción = 0/false.

Adjudicación: `PIPELINE_MECHANISM_FAILURE_PRIMARY__NO_PRODUCT_DEFECT_PROVEN`. El diferencial de fuente más fuerte es que el E2E I3 congelado bloqueaba Service Workers, mientras este smoke no lo hizo; además `app.js` recarga en `controllerchange` y `sw.js` toma control con `skipWaiting/clients.claim`. Esto identifica un mecanismo de harness prioritario, pero no se afirma como evento capturado porque el run no instrumentó `controllerchange`.

Evidencia durable: `app/docs/evidence/I4A-VISIBLE-DEV-SHOPPER-LIFECYCLE-SMOKE-HOLD-LATEST.json`.

## Siguiente frontera exacta

`NEW_AUTH_REQUIRED_I4A_VISIBLE_DEV_SHOPPER_LIFECYCLE_SMOKE_RETRY__SERVICE_WORKER_STABILIZED_HARNESS`

No está autorizada. Solo puede ejecutar una nueva prueba visible DEV con la misma identidad dedicada, estabilizando el harness contra el primer control del Service Worker y registrando checkpoints de Auth/membership antes de observar las cinco superficies.

## Circuit breaker

El gate anterior está consumido y su one-shot workflow debe quedar retirado. No retry automático, no Historical Shopper, no reapertura de I3, no nueva identidad. Mismatch documental => `SOURCE_TRUTH_MISMATCH__STOP_TECHNICAL_EXECUTION`.
