# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-14 12:05 -06:00  
**Estado:** `I2_PASS__MISVISITAS_CLOSED__I3_SOURCE_PREPARED__I3_STOP_RETRY_CREDENTIAL_H0_S0__SAME_CANDIDATE`

## Regla principal

No nueva candidata, rama ni PR. No rediseñar ni reconstruir Auth. Todo continúa sobre `docs-tya-v6-v71-audit` / PR #7.

Plan rector: `app/docs/ADDENDUM-MAESTRO-PLAN-CORRECCION-RAIZ-GO-LIVE-Y-DURABILIDAD-CXORBIA-TYA-VIGENTE.md`.

I3 lock: `app/docs/SOURCE-LOCK-ITERATION3-STOP-RETRY-HISTORICAL-SHOPPER-CREDENTIAL-20260814.md`.

## Cerrado / NO TOCAR

- Firebase Auth owner `core/backend-browser-auth.js`.
- exact identity / no fuzzy.
- I2 command boundary + provider ACK/fail-closed.
- `app/modules/misvisitas.js` P0 arrays/facets/ACK ya cerrado.
- localStorage no vuelve a ser verdad productiva.

## I3 source ya preparado — NO RECONSTRUIR

- `app/adapters/cxorbia-command-http-transport-v1.js`
- `app/adapters/cxorbia-shopper-membership-wiring-v1.js`
- `backend/runtime/cxorbia-shopper-command-provider-v1.mjs`
- `tools/qa/cxorbia-i3-shopper-persistence-e2e.mjs`
- `tools/qa/cxorbia-i3-source-patcher.mjs`

El patcher aplica exactamente, sobre esta candidata y sin rediseño:

1. scripts canónicos de transport/membership al entrypoint;
2. alta Shopper de `modules/shoppers.js` como async/ACK-aware;
3. edición Shopper como async/ACK-aware;
4. refresh solo después de provider ACK;
5. cero toast de éxito sin persistencia confirmada.

El runner se detuvo antes de commitear ese patch aplicado; **reutilizar el patcher**, no rehacer manualmente.

## I3 STOP_RETRY

Run real `31826443230` / job `94851603411` llegó a provider-read y detuvo el flujo en selección exacta de credencial histórica:

`HOLD_SHOPPER_R109_U104_V1_D1_H0_S0_M616_L208_P194`.

Existe una identidad Shopper histórica exacta con claims, perfil e historia. El bloqueo es credential plaintext unavailable: el Auth histórico fue importado con hash SHA256, mientras el selector solo puede reconstruir password desde `pass/password` protegido o `FirstName123*`; no hay coincidencia para el candidato exacto.

No usar identidad por nombre/email/teléfono ni inventar otra cuenta para sortearlo.

## Seguridad

I3 Auth/Firestore writes `0/0`; password changes/resets `0`; identidades modificadas `0`; Shopper nuevo `NO`; HR/Rules/Storage/Make/Gemini/pagos/deploy/merge/producción sin cambios.

El workflow provider está PARKED. No ejecutar de nuevo sin nueva autorización Paula.

## Reusable / no-code

El transport/provider preparado sigue reusable por tenant/project, RBAC, idempotencia, expectedVersion, ACK y exact identity. No hardcodear Cinépolis en contracts reusables.

## Academia

Todavía no declarar alta/login Shopper real como activo. Mantener distinción: Mis Visitas multi-registro = source cerrado; credential/login histórico = pendiente de recovery; provider writes = no ejecutados.

## Porcentaje

**35% completado / 65% pendiente.** I3 permanece 0/25 hasta PASS completo.

## Siguiente frontera

`PAULA_REVIEW_REQUIRED_FOR_I3_HISTORICAL_SHOPPER_CREDENTIAL_RECOVERY`.

Después del gate focalizado, reanudar la MISMA I3 desde el blocker y reutilizar el source preparado; no iniciar otra iteración ni reauditar módulos cerrados.
