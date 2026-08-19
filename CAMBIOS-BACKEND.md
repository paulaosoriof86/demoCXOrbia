# CAMBIOS-BACKEND.md

**SYNC_EPOCH:** `CXORBIA-20260819-I4A-VISIBLE-SMOKE-RETRY1-DOCUMENT-SELECTOR-HOLD-23`

## Bloque ejecutado
Se ejecutó el gate autorizado `NEW_AUTH_REQUIRED_I4A_VISIBLE_DEV_SHOPPER_LIFECYCLE_SMOKE_RETRY__SERVICE_WORKER_STABILIZED_HARNESS` con la misma Shopper sintética/no histórica.

Run `32280348780`: Service Workers bloqueados como en I3. PASS secuencial: página/login visible → Firebase currentUser → contexto Shopper TyA/Cinépolis → membership verified → app entered → HR authority completa 15/660. Page errors `0`, console errors `0`, backend write attempts `0`.

El HOLD ocurrió al iniciar Documentos: la ruta `Recursos del proyecto` ya estaba visible y el locator resolvió `div[data-doc=d1]`; Playwright agotó el click esperando estabilidad porque el selector genérico eligió el contenedor antes del control explícito. Clasificación: `PIPELINE_MECHANISM_FAILURE__DOCUMENT_SELECTOR_TARGET__NO_PRODUCT_DEFECT_PROVEN`.

## Seguridad
1 provider read + 4 Firestore verification reads + 1 password update efímero + 1 login. Historical Shopper `false`; otras identidades `0`; Auth create/claims/delete `0`; Firestore/postulación/certificación/reserva/HR/Rules/Storage/Make/Gemini/pagos/deploy/merge/prod `0/false`; credenciales no exportadas.

## Correctivos de mecanismo
- El bloqueo de Service Worker eliminó el timeout anterior de Auth y permitió llegar hasta HR 15/660.
- Retry2 usará exclusivamente controles visibles estables, sin click sobre contenedores genéricos.
- El one-shot retry1 y los observers temporales se retiran en este cierre.
- Se conserva evidencia raw `I4A-VISIBLE-SMOKE-RETRY-RUNTIME-OBSERVED.json` y adjudicada `I4A-VISIBLE-DEV-SHOPPER-LIFECYCLE-SMOKE-RETRY1-HOLD-LATEST.json`.

## Incidente de ejecución sin impacto de producto
Durante la preparación, una llamada Contents API creó el request commit `a744817d...` con mensaje `noop` antes del workflow commit. No tocó producto, provider, datos, frontend ni producción. Se continuó por Git Tree/commit y no se usa ese patrón para el cierre canónico.

Para superar la limitación del conector que no enumera push-runs, se usó un observer read-only/Actions-read que solo copió el artifact sanitizado al repo; no tuvo acceso provider y se retira en este cierre.

## Avance Phase A
Formal permanece **60/40**: el retry1 corrige/diagnostica mecanismo y prueba Auth+HR, pero todavía no completa las cinco superficies de I4-A.

## Siguiente bloque
`NEW_AUTH_REQUIRED_I4A_VISIBLE_DEV_SHOPPER_LIFECYCLE_SMOKE_RETRY2__STABLE_SURFACE_SELECTORS__NO_SW`, autorizado por la instrucción expresa del turno actual.

## Clasificación
- Reusable CXOrbia: harness visible con SW bloqueado + checkpoints + selectores explícitos.
- Exclusivo TyA: scope TyA/Cinépolis y HR 15/660.
- Claude/prototipo: sin parche; no P0 frontend probado.
- Academia: sin cambio hasta cierre visible I4-A.
- Sin impacto Claude: observer y cierre source-truth.
