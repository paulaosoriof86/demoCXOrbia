# PENDIENTES-PROTOTIPO.md

**Última sincronización:** 2026-08-18 21:11 -06:00  
**SYNC_EPOCH:** `CXORBIA-20260818-I4A-PROVIDER-HOLD-SYNC-20`  
**Estado:** `NO_UI_WORKAROUND__I3_FROZEN__GO_LIVE_60__I4A_PROVIDER_HOLD_CONSUMED__DEDICATED_TEST_IDENTITY_AUTH_NEXT`

## Cerrado / no pendiente

I1 `15/15 PASS`, I2 `20/20 PASS`, I3 `25/25 PASS` integral/frozen. No reabrir Historical Shopper, TARGET_B Admin, identityMap, Rules/Hosting/Staff I3, HR `15/660` ni Finance V2 por este bloque.

I4-A source/readiness ya existe para perfil/histórico/certification-status, membership/roles/scopes y autoridad postulación/asignación. No reauditar sin evidencia contradictoria.

## Pendiente vivo

- I4 `0/25` — en curso/no puntuado.
- I5 `0/15` — no iniciado.
- **40% formal restante**.

### I4-A — identidad de prueba

La búsqueda en evidencia congelada y la clasificación provider/Auth read-only quedaron cerradas. Run `32208829234`: `211` Shopper, `0` candidatos con provenance explícita segura. Resultado `HOLD_I4A_TEST_SHOPPER_IDENTITY_NOT_PROVEN__PROVIDER_READONLY_NO_LOGIN`. No repetir.

Siguiente pendiente: crear una sola identidad DEV dedicada/sintética/no histórica mediante contrato protegido, con provenance explícita y scopes exactos; requiere autorización de writes. El login visible es un gate posterior separado.

### I4-A — evidencia visible aún pendiente

Documentos/instrucciones; visitas disponibles; control/estado de postulación; notificaciones; presentación/estado de certificación nueva. No asumir defecto antes de observarlo.

## No hacer

- No reabrir I3.
- No usar/login/resetear Historical Shopper.
- No escoger identidad existente por nombre/correo/memoria.
- No repetir provider/Auth classification consumida.
- No parche UI para resolver provenance.
- No nueva rama/PR/candidata/metodología.
- No HR/Make/Gemini/pagos/deploy/merge/producción sin gate correspondiente.
- No avanzar si `tools/verify-cxorbia-source-truth-sync.mjs` falla.

## Siguiente acción exacta

`NEW_AUTH_REQUIRED_I4A_CREATE_DEDICATED_NONHISTORICAL_DEV_TEST_SHOPPER__PROTECTED_CONTRACT_NO_LOGIN`.

Después de PASS: `NEW_AUTH_REQUIRED_I4A_SINGLE_VISIBLE_DEV_SHOPPER_LIFECYCLE_SMOKE`.
