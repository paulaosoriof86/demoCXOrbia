# SOURCE LOCK CXORBIA TyA

**SYNC_EPOCH:** `CXORBIA-20260819-I4B-RETRY2-LANE-READY-SOURCE-ONLY-30`

Repo `paulaosoriof86/demoCXOrbia`; rama `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge; base `release/cxorbia-tya-rc-20260630`; DEV `cxorbia-backend-dev`.

## Progreso formal canónico
I1 `15/15 PASS`; I2 `20/20 PASS`; I3 `25/25 PASS FROZEN`; I4 `0/25 IN_PROGRESS_NOT_SCORED`; I5 `0/15 NOT_STARTED` = **60% completado / 40% pendiente**. El plan vigente no asigna subpesos I4-A..F.

## Frozen / preservado
I1/I2/I3; I4-A visible lifecycle; Historical Shopper; TARGET_B Admin — no recrear; HR `15 periodos / 660 visitas`; Finance V2/historical; legal v0.4. No reprocesar.

## I4-B — causa técnica cerrada en fuente
Retry1 run `32297736022` llegó al provider: `application.create` PASS, replay idempotente PASS y `application.status.update` HOLD por read-after-write Firestore. Retry1 quedó consumido; datos reales invariantes. Fix source-only `1bde86e5e5b6c2084fe5c711b7a8c06d089f12f4`.

## Causa metodológica cerrada mecánicamente
Los 10 documentos canónicos quedan sincronizados. `tools/verify-cxorbia-source-truth-sync.mjs` deriva epoch, frontera y progreso del Execution State, valida que progreso+pendiente=100 y exige esos valores dinámicos en todos los Markdown canónicos. Se elimina el hard-code 60/40 que habría vuelto a bloquear al pasar a 85/15.

El provider verifier cubre las ramas transaccionales `application.create`, `application.status.update` y `visit.*` para detectar read-after-write antes de ejecutar.

## Carril estable
El workflow I4-B existente queda request-driven. Gate deshabilitado = source-only/no provider. Gate habilitado solo ejecuta si coincide con la frontera, está sin consumir y tiene autorización Paula. `cancel-in-progress=false`; fallos antes de entrar al intento de mutación no consumen la autorización. Executor/finalizer genéricos evitan recrear un workflow por retry.

## Frontera exacta
`NEW_AUTH_REQUIRED_I4B_SINGLE_DEV_VISIT_LIFECYCLE_E2E_WRITE_GATE_RETRY2__PROVIDER_TX_READ_ORDER_FIXED__SYNTHETIC_VISIT_ONLY`.

Retry2 queda preparado source-only, `enabled=false`, `consumed=false`, `authorizedBy=null`. Mismo scope sintético, Historical Shopper=false, HR real=false, producción=false. PASS → I4-C HR bidireccional.
