# SOURCE LOCK CXORBIA TyA

**Última sincronización:** 2026-08-19 10:59 -06:00  
**SYNC_EPOCH:** `CXORBIA-20260819-I4A-VISIBLE-SMOKE-MECHANISM-HOLD-22`  
**Estado:** `I3_FROZEN__I4A_VISIBLE_SMOKE_CONSUMED_HOLD__PIPELINE_MECHANISM_PRIMARY__RETRY_AUTH_NEXT`

## Lock técnico

Repo `paulaosoriof86/demoCXOrbia`; rama `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge; base `release/cxorbia-tya-rc-20260630`; DEV `cxorbia-backend-dev`.

I1/I2/I3 permanecen PASS/frozen. Historical Shopper, TARGET_B Admin, HR `15/660`, Finance V2/historical y legal V0.4 no se reprocesan. La única Shopper I4-A autorizada sigue siendo la identidad DEV dedicada sintética/no histórica ya provider-verificada.

## I4-A visible smoke — HOLD consumido

Gate consumido: `NEW_AUTH_REQUIRED_I4A_SINGLE_VISIBLE_DEV_SHOPPER_LIFECYCLE_SMOKE`.

Run `32278013553`, job `96149872897`, artifact `9374808032`, digest `sha256:b91f3bd3b1ce05303e426a45e98bd13372e6933499fc2548a98db8daa9a47437`. La prevalidación provider-backed pasó (`PASS_I4A_DEDICATED_IDENTITY_PRELOGIN_EXACT`): claims/profile/membership/crosswalk/provider ACK/provenance exactos. Se consumieron 1 Auth password update y 1 intento visible de login. Luego el browser timeout ocurrió antes de cualquier superficie I4-A observable.

Safety: Historical Shopper no accedido; otras identidades modificadas 0; Auth create/claims/delete 0; Firestore writes 0; postulation/certification/reservation submits 0; HR/Rules/Storage/Make/Gemini/pagos/deploy/merge/producción 0/false; no se exportaron credenciales.

Adjudicación canónica: `PIPELINE_MECHANISM_FAILURE_PRIMARY__NO_PRODUCT_DEFECT_PROVEN`. El posible Service Worker first-controller reload está respaldado por diferencia de harness y fuente, pero no fue capturado directamente en el run; por ello no se eleva a P0 de producto.

## Siguiente gate exacto

`NEW_AUTH_REQUIRED_I4A_VISIBLE_DEV_SHOPPER_LIFECYCLE_SMOKE_RETRY__SERVICE_WORKER_STABILIZED_HARNESS`

Requiere autorización expresa nueva. Un solo retry visible DEV; misma identidad dedicada; `serviceWorkers:'block'` o estabilización equivalente del harness; checkpoints Auth/membership; luego documentos/instrucciones, disponibles, postulación/estado, notificaciones y certificación. No autoriza writes operativos, deploy, merge ni producción.

## Anti-loop

No rerun del gate consumido, no nueva identidad, no Historical Shopper, no I3. El workflow one-shot consumido se retira del HEAD. Evidencia y request quedan durables. Mismatch documental => STOP.
