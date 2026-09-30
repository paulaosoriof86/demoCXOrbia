# SOURCE LOCK — ITERATION 3 STOP_RETRY POST CREDENTIAL RECOVERY / ADMIN LOGIN POINTER — 2026-08-14

**Estado:** `HISTORICAL__POINTER_BLOCKER_CLOSED__SEE_HARNESS_DURABILITY_AND_LEGAL_GATE_AWARE_LOCKS`

## Evidencia histórica preservada

Run `31833696707`, job `94875097700`, request `cxorbia-i3-shopper-persistence-20260814-02`:

- mismo único Shopper histórico exacto resuelto;
- one exact credential recovery/reset PASS;
- UID/claims/shopperId/profile/history preservados;
- other identities modified `0`;
- membership/crosswalk reconciliation PASS;
- Admin/new Shopper se detuvo antes de alta porque `#cxBackendPreviewStatus` interceptó pointer events sobre `#lgSubmit`.

La contraseña temporal se eliminó en cleanup y no se expuso/persistió.

## Causa cerrada

`app/core/backend-preview-status.js` fue corregido a overlay diagnóstico no interactivo (`pointer-events:none`, `aria-hidden=true`, `user-select:none`). El E2E posterior valida esta propiedad y no usa force-click.

Este blocker no debe reabrirse salvo drift reproducible.

## Continuidad

El cierre durable del harness quedó documentado en:

- `app/docs/SOURCE-LOCK-ITERATION3-HARNESS-DURABILITY-PASS-20260814.md`;
- `app/docs/SOURCE-LOCK-ITERATION3-HISTORICAL-LEGAL-GATE-AWARE-HARNESS-PASS-20260814.md`.

El segundo run `31835742956` ya no falló por pointer interception: alcanzó contexto Auth Shopper y autoridad HR protegida, y reveló un blocker distinto del contrato del harness alrededor del workspace/gate legal. No mezclar ambos hallazgos.

## Seguridad

No nueva candidata, Auth rebuild, HR/Rules/Storage/Make/Gemini/pagos, deploy, merge o producción.

## Porcentaje

Este lock es histórico y no altera el tracker: GO-LIVE sigue 35% hasta cerrar I3 completo.
