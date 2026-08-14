# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-14 13:24 -06:00  
**Estado:** `I1_PASS__I2_PASS__I3_RECOVERY_PASS__DEV_OVERLAY_ROOT_FIXED__HARNESS_DURABILITY_PASS__SAME_CANDIDATE`

## Regla principal

No nueva candidata, rama ni PR. No rediseñar ni reconstruir Auth. Todo continúa sobre `docs-tya-v6-v71-audit` / PR #7.

Últimos locks I3:

- `app/docs/SOURCE-LOCK-ITERATION3-STOP-RETRY-POST-CREDENTIAL-RECOVERY-ADMIN-LOGIN-POINTER-20260814.md`
- `app/docs/SOURCE-LOCK-ITERATION3-HARNESS-DURABILITY-PASS-20260814.md`

## Cerrado / NO TOCAR

- Firebase Auth owner y exact identity.
- I1 contracts.
- I2 command boundary + provider ACK/fail-closed.
- `modules/misvisitas.js` arrays/facets/ACK.
- I3 HTTP transport, membership wiring, command provider, E2E y source patcher.

## Último I3 real

Run `31833696707`, job `94875097700`: recovery/reset exacto PASS, identidad preservada, other identities 0, membership/crosswalk PASS. Después el overlay DEV `#cxBackendPreviewStatus` bloqueó el click Admin antes del alta Shopper nuevo.

## Root fix source-only

`app/core/backend-preview-status.js` ahora es diagnóstico no interactivo: `pointer-events:none`, `aria-hidden=true`, `user-select:none`.

`tools/qa/cxorbia-i3-shopper-persistence-e2e.mjs` valida esa condición y no usa force-click. También separa Admin/new Shopper del password histórico.

No corresponde a Claude reconstruir login ni aplicar otro parche visual.

## Harness durability

El workflow existente quedó reordenado para certificar primero el Shopper histórico inmediatamente después de un recovery autorizado y crear un checkpoint sanitizado antes de entrar a Admin. Si luego falla Admin/new Shopper, ese subgate histórico puede preservarse y no debe repetirse.

No se ejecutó provider al hacer este hardening source-only.

## Credencial histórica

La contraseña temporal del run previo fue eliminada correctamente en cleanup y no existe en repo/logs. Por eso el login histórico sigue pendiente y cualquier nuevo reset requiere gate nuevo expreso.

## Shopper nuevo

Todavía NO creado. El patch ACK-aware sigue preparado por `tools/qa/cxorbia-i3-source-patcher.mjs`; no reconstruir manualmente.

## Reusable CXOrbia

Tenant/project scope, RBAC, idempotencia, expectedVersion, exact identity, provider ACK, protected-data boundary y diagnostic overlays no interactivos se mantienen reutilizables. Cinépolis es configuración, no arquitectura global.

## Academia

No declarar login/alta Shopper real como activo hasta I3 PASS. La ruta histórica Academia/Certificación se certificará dentro del próximo I3 provider run después del recovery.

## Porcentaje

35% completado / 65% pendiente. I3 sumará 25 puntos solo al cerrar completo.

## Siguiente frontera

`PAULA_REVIEW_REQUIRED_FOR_I3_DURABLE_HISTORICAL_LOGIN_AND_ADMIN_NEW_SHOPPER_RESUME`.
