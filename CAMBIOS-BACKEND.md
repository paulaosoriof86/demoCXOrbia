# CAMBIOS-BACKEND.md

**Última actualización:** 2026-08-14 13:24 -06:00  
**Estado:** `I1_PASS__I2_PASS__I3_RECOVERY_PASS__ADMIN_POINTER_ROOT_FIXED__HARNESS_DURABILITY_PASS__GO_LIVE_35__NO_PRODUCTION`

## Provider run ejecutado

Run `31833696707`, job `94875097700`, sobre la misma candidata `docs-tya-v6-v71-audit` / PR #7.

PASS antes del STOP_RETRY:

- exact historical Shopper candidate;
- one authorized credential recovery/reset;
- UID/claims/shopperId/profile/history preservation;
- other identities modified `0`;
- exact membership/crosswalk reconciliation;
- provider/proxy startup.

El run se detuvo antes del alta Shopper nuevo porque `#cxBackendPreviewStatus` interceptó el click real sobre `#lgSubmit`. No hubo segundo intento automático.

## Root fix source-only posterior

### `app/core/backend-preview-status.js`

Panel diagnóstico DEV corregido a `pointer-events:none`, `aria-hidden=true`, `user-select:none`. El overlay ya no puede bloquear interacción humana.

### `tools/qa/cxorbia-i3-shopper-persistence-e2e.mjs`

- valida que el overlay DEV no intercepte puntero;
- no usa force-click;
- flujo Admin/new Shopper ya no depende de conservar el password histórico.

### `backend/runtime/cxorbia-shopper-command-provider-v1.mjs`

- lineage exacta de continuation/recovery;
- no amplía identidades ni fuzzy matching;
- mantiene budgets y fail-closed.

### `.github/workflows/cxorbia-c6-staff-repair-bootstrap-exact-write-v2.yml`

Harness existente endurecido, no se creó otro workflow:

`recovery exacto → historical login/history E2E → checkpoint sanitizado → Admin create/update → new Shopper login/reload/new-tab/second context`.

Checkout queda fijado al SHA exacto del evento. Si algo posterior falla después de que el histórico pasó, el failure handler puede persistir únicamente evidencia sanitizada del subgate histórico y parkear el request; así una continuación posterior no repite recovery histórico.

### Source locks

- `app/docs/SOURCE-LOCK-ITERATION3-STOP-RETRY-POST-CREDENTIAL-RECOVERY-ADMIN-LOGIN-POINTER-20260814.md`.
- `app/docs/SOURCE-LOCK-ITERATION3-HARNESS-DURABILITY-PASS-20260814.md`.

## Credencial histórica

La contraseña temporal generada en el run ya consumido estuvo solo en `.tmp` privado y cleanup la destruyó. El E2E histórico había quedado programado después de Admin y no llegó a ejecutarse. No existe una vía segura para recuperar esa contraseña.

Por eso un nuevo provider run, si Paula lo autoriza, necesitará exactamente un nuevo reset sobre el mismo UID histórico. La diferencia crítica es que ahora el login histórico se prueba y se checkpointa **antes** de Admin; no se vuelve a perder por un fallo posterior.

## Writes y seguridad

### Run `31833696707`

- historical password update/reset: `1` exacto;
- other identities: `0`;
- membership/crosswalk reconciliation: PASS; posible 0–2 Firestore writes dentro del budget, conteo final no persistido por fallo posterior;
- Shopper nuevo: `NO`;
- HR/Rules/Storage/Make/Gemini/pagos: `0`;
- deploy `0`; merge=false; production=false; retry automático `NO`.

### Hardening posterior

Solo source/docs. **Cero nuevos Auth/Firestore/HR/Rules/Storage/Make/Gemini/pagos writes, deploy, merge o producción.**

## Reusable CXOrbia

Exact identity, provider boundary, tenant/project scope, idempotencia, expectedVersion, ACK, fail-closed, exact event SHA y overlays diagnósticos no interactivos son reutilizables.

## Exclusivo TyA

El recovery ejecutado y cualquier futuro recovery autorizado se limitan al mismo único Shopper histórico exacto TyA/Cinépolis.

## Claude/prototipo

No reconstruir Auth/login. El fix fue en diagnóstico backend DEV. El patch ACK-aware de `modules/shoppers.js` sigue preparado por el patcher y solo se materializará dentro del gate I3 exitoso.

## Academia

No declarar login/alta Shopper real activo hasta I3 PASS. El siguiente run debe certificar también las rutas históricas Academia/Certificación antes de pasar a Admin.

## Porcentaje

**35% completado / 65% pendiente.** Al cerrar I3 completo sube a 60% / 40%.

## Siguiente gate exacto

`PAULA_REVIEW_REQUIRED_FOR_I3_DURABLE_HISTORICAL_LOGIN_AND_ADMIN_NEW_SHOPPER_RESUME`.
