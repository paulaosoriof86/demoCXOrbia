# RESUMEN-PARA-CLAUDE.md

**SYNC_EPOCH:** `CXORBIA-20260819-I4A-RETRY2-HARNESS-GLOBAL-GUARD-HOLD-24`

Backend probado mantiene I1/I2/I3 frozen, identidad Shopper dedicada exacta y Auth/membership/app. Retry1 además probó HR 15/660 y Documentos renderizado.

No hay P0 frontend reproducible. Retry2 se detuvo por una referencia JavaScript del **harness**, no por `/app/modules` ni `/app/core`: `CX_PROTECTED_AUTH_HR_AUTHORITY` fue consultado como identificador antes de existir; debe esperarse vía `window.CX_PROTECTED_AUTH_HR_AUTHORITY?.applied`. No modificar frontend por este hallazgo.

Siguiente técnico: `NEW_AUTH_REQUIRED_I4A_VISIBLE_DEV_SHOPPER_LIFECYCLE_SMOKE_RETRY3__SAFE_GLOBAL_GUARDS__STABLE_SURFACES`.

Pendiente visible: viewer de documentos/instrucciones; visitas/postulación; notificaciones provider-backed; certificación nueva. Academia se actualiza al confirmar esas superficies.
