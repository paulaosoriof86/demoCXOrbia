# SOURCE LOCK CXORBIA TyA

**Última sincronización:** 2026-08-19 10:04 -06:00  
**SYNC_EPOCH:** `CXORBIA-20260819-I4A-DEDICATED-TEST-SHOPPER-PASS-21`  
**Estado:** `I3_FROZEN__I4A_DEDICATED_TEST_SHOPPER_PASS__VISIBLE_LIFECYCLE_SMOKE_AUTH_NEXT`

## Lock técnico

Repo `paulaosoriof86/demoCXOrbia`; rama `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge; base `release/cxorbia-tya-rc-20260630`; DEV `cxorbia-backend-dev`.

I1/I2/I3 permanecen PASS/frozen. Historical Shopper, TARGET_B Admin, HR `15/660`, Finance V2/historical y legal V0.4 no se reprocesan.

## I4-A dedicado DEV Shopper — PASS

Gate consumido: `NEW_AUTH_REQUIRED_I4A_CREATE_DEDICATED_NONHISTORICAL_DEV_TEST_SHOPPER__PROTECTED_CONTRACT_NO_LOGIN`.

Evidencia provider-backed final: run `32273818536`, job `96136329240`, artifact `9373197946`, digest `sha256:b30fe02cd8474854b6d6599f92c78ed10712bd7ba1a18125efdbb9df10d6ab81`. Decision `PASS_I4A_DEDICATED_NONHISTORICAL_DEV_TEST_SHOPPER_VERIFIED_READONLY_NO_LOGIN`.

Probado: una identidad DEV dedicada; `tenantId=tya`; proyecto/scope Cinépolis; `role=shopper`; claims exactos; profile exacto; membership exacto; crosswalk exacto; provider ACK; provenance `synthetic/nonHistorical/dev-test` explícita. No login ejecutado. No Shopper histórico. Cero HR/Rules/Storage/Make/Gemini/pagos/deploy/merge/producción. No se exportaron UID/email/credenciales.

El artifact original del push de creación no quedó directamente enumerado por el conector; por ello no se inventan contadores internos no observados. La materialización final y el ACK sí quedaron reproduciblemente verificados.

## Siguiente gate exacto

`NEW_AUTH_REQUIRED_I4A_SINGLE_VISIBLE_DEV_SHOPPER_LIFECYCLE_SMOKE`

Requiere autorización expresa nueva. Solo una prueba visible DEV con la identidad dedicada. No autoriza writes de HR/Make/Gemini/pagos ni producción/merge.

## Anti-loop

No reabrir búsqueda de identidad existente ni repetir creación. El workflow one-shot de creación/verificación queda retirado del HEAD después del cierre; la evidencia y requests consumidos quedan durables. Mismatch documental => STOP.
