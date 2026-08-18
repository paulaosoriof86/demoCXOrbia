# RESUMEN-PARA-CLAUDE.md

**Última sincronización:** 2026-08-18 16:23 -06:00  
**SYNC_EPOCH:** `CXORBIA-20260818-I3-11C-NAV-HARNESS-SOURCE-PASS-08`  
**Estado:** `NO_FRONTEND_PATCH__HOSTING_PASS__NAV_HARNESS_SOURCE_PASS__NEW_STAFF_AUTH_NEXT__GO_LIVE_35`

## Estado Phase A

I1 `15/15 PASS`; I2 `20/20 PASS`; I3 `0/25 formal` hasta cierre integral; I4 `0/25`; I5 `0/15` = **35% / 65%**. I3 integral PASS → **60% / 40%**.

## Preservado

- R3-C Hosting DEV PASS y congelado: run `32185940998`.
- Adapter corregido servido en DEV con byte parity y contrato `materialized + tenant_adjudication`, `fuzzyMatching:false`.
- Rules I3.11C ya verificadas/consumidas.
- Historical Shopper, I3.9 e I3.10 frozen.
- Staff/Admin existente; no crear otro.

## Última ejecución Staff

Run `32188716203`, job `95878165921`, artifact `9343461375` ejecutó la única lectura Staff autorizada y quedó consumido.

Falló antes del login: `page.goto(... waitUntil:'domcontentloaded', timeout:60000)` agotó el tiempo y dejó `lastState=null`. Por eso no observó canonical/agosto; los FAIL derivados I3.4/I3.5/I3.7 no son regresiones adjudicadas. I3.6 Historical Shopper reuse siguió PASS.

Safety: Historical Shopper, writes, deploys, cambios de contraseña/usuarios, merge y producción `0`/false.

## Hardening QA ya aplicado

Commit `9feb5f69a35169eac2931843309ad847d374b1b3` toca únicamente `tools/qa/tya-c6-staff-admin-human-auth-browser-smoke.mjs`.

Se reemplazó la espera de `DOMContentLoaded` por `waitUntil:'commit'` en entrada, reloads y nueva pestaña. El readiness visible (`.role-btn[data-role="admin"]`) y el `waitReady()` funcional siguen siendo obligatorios. No se relajó ningún criterio de identidad, HR, `CX.data`, legal, reload o new-tab.

Source-only checks: Runtime Guard SUCCESS; P0 exact identity source gates SUCCESS; request disabled confirmó Staff/provider execution skipped; R3-C no redeployó.

## No hacer en frontend

- no tocar `/app/modules` ni `/app/core` por este bloqueo;
- no hardcodear `TYA_GT_0C0BA8856E`;
- no remapear identidad desde módulos;
- no esconder visitas;
- no crear Admin/Shopper alterno;
- no compensar el QA harness desde UI.

## Siguiente bloque

Se necesita una nueva autorización exacta para **una** lectura Staff/Admin existente sobre DEV y únicamente observar:
- `shp-57d2e3769946 -> TYA_GT_0C0BA8856E`;
- agosto canonical `2`;
- residual `0`;
- duplicados `0/0`.

Cero Historical Shopper, writes, deploys, password/user changes, merge o producción. No repetir R3-A/R3-B/R3-C.

## Clasificación

- **Reusable CXOrbia:** hardening QA navegación/readiness.
- **Exclusivo TyA/Cinépolis:** IDs y target de agosto.
- **Claude/prototipo:** sin cambio UI.
- **Academia:** sin cambio funcional.
- **Sin impacto Claude:** QA source-only.
