# CAMBIOS-BACKEND.md

**Última actualización:** 2026-08-14 12:05 -06:00  
**Estado:** `I1_PASS__I2_PASS__I3_STOP_RETRY_HISTORICAL_SHOPPER_CREDENTIAL_H0_S0__GO_LIVE_35__NO_PRODUCTION`

## Bloque ejecutado

Se consumió una única autorización I3 DEV hasta provider-read sobre la misma candidata `docs-tya-v6-v71-audit` / PR #7. No nueva candidata, rama, PR, deploy ni producción.

La ejecución se detuvo fail-closed antes de toda escritura con `HOLD_SHOPPER_R109_U104_V1_D1_H0_S0_M616_L208_P194`. No hubo segundo intento automático.

## Source I3 creado/preparado — preservar

- `app/adapters/cxorbia-command-http-transport-v1.js`: transporte HTTP autenticado por Firebase ID token detrás del command adapter; no activa writes por sí mismo.
- `app/adapters/cxorbia-shopper-membership-wiring-v1.js`: verifica Shopper principal/claims/membership/shopperId/projectIds/fingerprints de forma exacta y fail-closed.
- `backend/runtime/cxorbia-shopper-command-provider-v1.mjs`: provider DEV para create/update Shopper con actor Staff exacto, idempotencia, expectedVersion, Auth/claims/membership/profile/crosswalk y provider ACK.
- `tools/qa/cxorbia-i3-shopper-persistence-e2e.mjs`: E2E Admin create/update + Shopper nuevo login/reload/new-tab/segundo contexto.
- `tools/qa/cxorbia-i3-source-patcher.mjs`: patch determinista sobre misma candidata para entrypoint + alta/edición Shopper ACK-aware; no rediseño.
- `.github/workflows/cxorbia-c6-staff-repair-bootstrap-exact-write-v2.yml`: workflow existente reutilizado; después del STOP_RETRY quedó PARKED (`workflow_dispatch` read-only), preservando el harness completo en git history.
- `.github/cxorbia-firebase-requests/cxorbia-i3-shopper-persistence-exact-write-v1.json`: autorización congelada como consumida/STOP_RETRY.
- `app/docs/SOURCE-LOCK-ITERATION3-STOP-RETRY-HISTORICAL-SHOPPER-CREDENTIAL-20260814.md`: source lock del blocker real.

## Ejecución real I3

Workflow run `31826443230`, job `94851603411`.

Pasaron gate de autorización, source preflight, patch same-candidate, tooling y service account privada. El selector exacto de credenciales existentes alcanzó provider-read y falló con:

`R109 U104 V1 D1 H0 S0 M616 L208 P194`.

La identidad histórica existe y es exacta: un candidato con claims, perfil e historia. Lo no disponible es el plaintext de password que permita certificar login humano.

## Causa raíz de credencial

El import histórico usó `firebase-admin.auth().importUsers()` con `passwordHashHex` SHA256. Se importó el hash de contraseña, no el plaintext. El selector E2E actual solo puede recuperar password desde `profile.pass/profile.password` o el patrón exacto `FirstName123*`; ninguno coincide con el hash del único Shopper histórico exacto (`H0`).

No se debe tratar esto como Auth perdido ni reconstruir usuarios.

## Reusable CXOrbia

El source I3 mantiene tenant/project scope, exact identity, idempotencia, expectedVersion, provider ACK, separation of protected data y fail-closed. Cinépolis sigue configuración del primer proyecto TyA.

## Exclusivo TyA

El blocker afecta la validación de login de un Shopper histórico exacto TyA/Cinépolis. No cambia el patrón reusable del backend.

## Claude/prototipo

El patch ACK-aware de `modules/shoppers.js` está preparado en el mismo source, pero el run se detuvo antes de commitear el patch aplicado por el runner. **No reconstruirlo**: reutilizar `tools/qa/cxorbia-i3-source-patcher.mjs` cuando I3 sea reautorizada.

Mis Visitas P0 sigue cerrado desde I2 y no se toca.

## Academia

No actualizar como activo el alta/login Shopper real todavía. Documentar únicamente que identidad exacta existe, pero la certificación del login histórico está bloqueada por credential recovery pendiente. Mis Visitas multi-registro permanece cerrado en source.

## Sin impacto Claude

Freeze del request, PARK del workflow, source lock y docs no cambian UX.

## Seguridad

I3 Auth writes `0`; Firestore writes `0`; Auth deletes `0`; password changes/resets `0`; Shopper nuevo `NO`; HR/Rules/Storage/Make/Gemini/pagos writes `0`; deploy `0`; merge=false; production=false.

## Porcentaje

**GO-LIVE: 35% completado / 65% pendiente.** I3 no suma puntos mientras siga STOP_RETRY.

## Siguiente acción exacta

`PAULA_REVIEW_REQUIRED_FOR_I3_HISTORICAL_SHOPPER_CREDENTIAL_RECOVERY`.

Con autorización focalizada se recupera/reset únicamente la contraseña del principal Shopper histórico exacto, preservando uid/claims/shopperId/profile/history, y se reanuda el mismo I3 desde el punto bloqueado.
