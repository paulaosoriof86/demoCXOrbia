# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-14 18:18 -06:00  
**Estado:** `I1_PASS__I2_PASS__I3_REQUEST04_PREPROVIDER_STOP_RETRY__ZERO_PROVIDER_WRITES__SELFTEST_IMPORT_ORDER_FIXED__LINEAGE_PREWIRED__SAME_CANDIDATE__GO_LIVE_35`

## Decisión vigente

No nueva candidata, rama ni PR. I1/I2 cerradas. I3 se termina en la misma candidata.

Tracker: `app/docs/GO-LIVE-PROGRESS-TRACKER-ROOT-CAUSE-20260814.md`.

Lock I3 más reciente:

`app/docs/SOURCE-LOCK-ITERATION3-PREPROVIDER-SELFTEST-FAIL-CLOSED-20260814.md`.

**35% completado / 65% pendiente.**

## Cerrado y NO REPROCESAR

- Auth owner / exact identity / Staff membership.
- I1.
- I2: command boundary, provider ACK, no local fallback, Mis Visitas arrays/facets/ACK.
- overlay DEV no interactivo.
- harness histórico legal-gate-aware: Auth/identity/HR/history antes de rutas y sin autoaceptación legal.

## Último intento I3 — request `...-04`

Run `31852717413` / job `94931417141`.

Gate inicial PASS. STOP_RETRY en source preflight porque el harness histórico importaba Playwright antes del paso que instala Playwright.

El fallo ocurrió antes de service account/provider access. Por tanto:

- reset histórico: 0;
- Auth writes: 0;
- Firestore writes: 0;
- otras identidades: 0;
- Admin/new Shopper: no ejecutado;
- HR/Rules/Storage/Make/Gemini/pagos: 0;
- deploy/merge/producción: 0/false/false.

Request `...-04` quedó consumido/parked y no se rerun.

## Causa corregida source-only

1. Playwright ahora se importa dinámicamente solo en `--execute-real`.
2. El self-test default queda independiente de Playwright instalado y verifica `playwrightDeferredToRealExecution`.
3. Workflow existente ya prearma lineage exacta desde `...-04` con `I3_PREPROVIDER_SOURCE_SELFTEST_PLAYWRIGHT_IMPORT_ORDER`.
4. Source patcher materializa/verifica esa misma lineage en el command provider antes del primer provider use de una futura ejecución.
5. No se ha ejecutado provider después de este hardening.

## Pendiente I3 real

Se necesita un nuevo gate expreso porque el request quedó consumido aunque no gastó su reset provider.

Una futura request `...-05` debe cerrar, en este orden:

1. un único reset del mismo Shopper histórico exacto;
2. Auth/identity/HR/history PASS con harness legal-gate-aware;
3. checkpoint sanitizado inmediato;
4. Admin create/update de un único Shopper nuevo con provider ACK/readback;
5. nuevo Shopper login + reload/new-tab/segundo contexto;
6. cero fuzzy, otras identidades, false success o consentimiento legal automatizado.

Si el checkpoint histórico llega a PASS y un paso posterior falla, no repetir histórico/reset; continuar desde el checkpoint preservado mediante gate focal posterior.

## Reusable CXOrbia / no-code

Mantener tenant/project config, exact identity, RBAC, idempotencia, expectedVersion, audit, ACK, providers detrás de adapters y gate legal separado del Auth.

## Academia

No declarar rutas Academia/Certificación PASS si están bloqueadas por NDA pendiente. No suprimir ni simular consentimiento.

## Pendiente heredado no bloqueante

`app/modules/cliente-extra.js`: PDF/XLSX/PPTX, fuera del blocker actual salvo evidencia nueva.

## Siguiente gate

`PAULA_REVIEW_REQUIRED_FOR_I3_REQUEST05_AFTER_PREPROVIDER_MECHANISM_FAILURE`.
