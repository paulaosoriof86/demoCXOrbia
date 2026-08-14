# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-14 14:00 -06:00  
**Estado:** `I1_PASS__I2_PASS__I3_RESET2_CONSUMED__HISTORICAL_AUTH_REACHED__LEGAL_GATE_AWARE_HARNESS_PASS__SAME_CANDIDATE`

## Regla principal

No nueva candidata, rama ni PR. No rediseñar ni reconstruir Auth. Todo continúa sobre `docs-tya-v6-v71-audit` / PR #7.

Locks I3 vigentes:

- `app/docs/SOURCE-LOCK-ITERATION3-STOP-RETRY-POST-CREDENTIAL-RECOVERY-ADMIN-LOGIN-POINTER-20260814.md`
- `app/docs/SOURCE-LOCK-ITERATION3-HARNESS-DURABILITY-PASS-20260814.md`
- `app/docs/SOURCE-LOCK-ITERATION3-HISTORICAL-LEGAL-GATE-AWARE-HARNESS-PASS-20260814.md`

## Cerrado / NO TOCAR

- Firebase Auth owner y exact identity.
- I1 contracts.
- I2 command boundary + provider ACK/fail-closed.
- `modules/misvisitas.js` arrays/facets/ACK.
- I3 HTTP transport, membership wiring, command provider, source patcher.
- overlay DEV no interactivo.

## Último I3 real

Run `31835742956`, job `94881540163`.

Se ejecutó un nuevo reset exacto sobre el mismo Shopper histórico y se preservaron UID/claims/shopperId/profile/history; other identities `0`; membership/crosswalk reconciliation PASS. El browser alcanzó contexto Shopper Firebase exacto y `CX_PROTECTED_AUTH_HR_AUTHORITY.applied===true`.

Después el E2E agotó el timeout esperando `#nav-aprendizaje`. Admin/new Shopper no arrancó y no se materializó el historical checkpoint.

## Root correction del harness

No corresponde corregir ni rediseñar Academia, Certificación, NDA o login por este hallazgo.

La causa source estaba en el test: exigía que las rutas de workspace ya estuvieran visibles antes de cerrar identidad/HR/historia, aunque `CX.app.enter()` puede diferir `CX.router.mount()` mientras `CX.confidencialidad.pending(...)` esté activo.

`tools/qa/cxorbia-p0-shopper-real-auth-e2e.mjs` ahora:

- valida primero identidad/Auth/HR/historia exacta;
- reconoce el gate legal canónico;
- si el NDA está pendiente, exige diálogo legal visible y preserva el principal, pero difiere rutas;
- si no está pendiente, sigue exigiendo Academia/Certificación;
- nunca automatiza aceptación legal;
- no usa force-click ni write APIs.

Gate source: `PASS_I3_HISTORICAL_LEGAL_GATE_AWARE_SOURCE`.

## Shopper nuevo

Todavía NO creado. El patch ACK-aware sigue preparado por `tools/qa/cxorbia-i3-source-patcher.mjs`; no reconstruir manualmente.

## Reusable CXOrbia

El patrón correcto es: Auth/identity/authority/history primero; gate legal humano separado; workspace después. Esto preserva multi-tenant/project, exact identity y cumplimiento legal sin convertir NDA en falso fallo de Auth.

## Academia

Una ruta diferida por NDA pendiente no equivale a PASS de Academia. Debe validarse después de aceptación humana real. Claude no debe ocultar, autoaceptar ni simular el NDA para que una prueba pase.

## Seguridad

La autorización `...-03` quedó consumida. No hubo retry. Después del run todos los cambios fueron source/docs only; cero nuevos provider writes/deploy/merge/producción.

## Porcentaje

35% completado / 65% pendiente. I3 sumará 25 puntos solo al cerrar completo.

## Siguiente frontera

`PAULA_REVIEW_REQUIRED_FOR_I3_LEGAL_GATE_AWARE_HISTORICAL_CHECKPOINT_AND_ADMIN_NEW_SHOPPER_RESUME`.
