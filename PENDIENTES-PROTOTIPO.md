# PENDIENTES-PROTOTIPO.md

**Última sincronización:** 2026-08-18 19:58 -06:00  
**SYNC_EPOCH:** `CXORBIA-20260818-I4A-TEST-SHOPPER-PROVENANCE-HOLD-19`  
**Estado:** `NO_UI_WORKAROUND__I3_FROZEN__GO_LIVE_60__I4A_TEST_SHOPPER_PROVENANCE_HOLD__AUTH_NEXT`

## Cerrado / no pendiente

I1 `15/15 PASS`, I2 `20/20 PASS`, I3 `25/25 PASS` integral/frozen. No existe pendiente vivo de identityMap, autenticación Staff, Historical Shopper, Rules o Hosting dentro de I3.

Dentro de I4-A ya existe cobertura source/read-only para identidad/perfil/histórico/certification-status, membership/roles/scopes y autoridad postulación/asignación. Esto no se reaudita salvo evidencia nueva contradictoria.

## Pendiente vivo

- I4 `0/25` — en curso/no puntuado.
- I5 `0/15` — no iniciado.
- **40% restante**.

### I4-A — HOLD actual

`HOLD_I4A_TEST_SHOPPER_PROVENANCE__NONHISTORICAL_STATUS_NOT_REPRODUCIBLY_ESTABLISHED`

La evidencia congelada/source-safe no individualiza de manera reproducible un principal DEV ya existente que pueda calificarse como Shopper test/no histórico. No usar IDs recordados, plantillas source-safe ni el Shopper histórico congelado para suplir esa falta de evidencia.

Esto es un pendiente de provenance/selección segura de identidad, no un bug visible demostrado.

### I4-A — comportamiento aún pendiente de evidencia visible

Documentos/instrucciones; visitas disponibles; control/estado de postulación; notificaciones; presentación/estado de certificación nueva. La futura prueba inicial debe ser no mutante; no presentar postulación ni certificación durante la observación read-only.

## No hacer

- No reabrir I3.
- No usar/login/resetear el Historical Shopper.
- No crear otro Shopper/Admin para resolver este HOLD.
- No inferir principal test desde nombres, IDs recordados o templates source-safe.
- No provider/Auth read, login o credenciales sin gate nuevo.
- No parche UI, nueva candidata, rama, PR ni metodología.
- No writes/deploy/merge/producción sin autorización.

## Claude / Academia

Sin pendiente frontend demostrado por este bloque. Academia permanece sin cambio hasta validar un comportamiento operacional visible.

## Siguiente acción exacta

`NEW_AUTH_REQUIRED_I4A_EXISTING_SHOPPER_IDENTITY_CLASSIFICATION_DEV_READONLY_NO_LOGIN`

Una sola clasificación de metadata provider/Auth de principal Shopper existente; sin login, credenciales, perfil/histórico, writes, deploy, merge ni producción. Requiere autorización explícita.
