# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-14 13:24 -06:00  
**Estado:** `I1_PASS__I2_PASS__I3_RECOVERY_PASS__ADMIN_LOGIN_POINTER_FIXED_SOURCE_ONLY__I3_NOT_CLOSED__SAME_CANDIDATE`

## Regla principal

No nueva candidata, rama ni PR. No rediseñar ni reconstruir Auth. Todo continúa sobre `docs-tya-v6-v71-audit` / PR #7.

Plan rector: `app/docs/ADDENDUM-MAESTRO-PLAN-CORRECCION-RAIZ-GO-LIVE-Y-DURABILIDAD-CXORBIA-TYA-VIGENTE.md`.

Último I3 lock: `app/docs/SOURCE-LOCK-ITERATION3-STOP-RETRY-POST-CREDENTIAL-RECOVERY-ADMIN-LOGIN-POINTER-20260814.md`.

## Cerrado / NO TOCAR

- Firebase Auth owner `core/backend-browser-auth.js`.
- exact identity / no fuzzy.
- I1 contracts.
- I2 command boundary + provider ACK/fail-closed.
- `modules/misvisitas.js` arrays/facets/ACK P0 cerrado.
- source I3 transport/membership/provider/E2E/patcher; no reconstruir.

## I3 latest real execution

Run `31833696707`, job `94875097700`.

El único recovery/reset de credencial autorizado para el Shopper histórico exacto PASS. También PASS la preservación de identidad y la reconciliación exacta membership/crosswalk. No se modificó otra identidad.

El run se detuvo después, antes de entrar a Administración, porque el panel diagnóstico DEV `#cxBackendPreviewStatus` interceptó el click sobre `#lgSubmit`.

## Corrección localizada, sin rediseño

Archivo backend DEV: `app/core/backend-preview-status.js`.

El panel ahora es no interactivo (`pointer-events:none`, `aria-hidden=true`, `user-select:none`). Esto corrige una interferencia real del overlay diagnóstico sin alterar layout, módulos ni producto. El E2E I3 ahora verifica esta condición y no usa `force click`.

No corresponde a Claude reconstruir login ni aplicar otro parche de UI.

## Importante sobre la credencial histórica

El password temporal generado estuvo únicamente en `.tmp` privado del runner y fue eliminado por cleanup. Como el E2E histórico estaba programado después del paso Admin, quedó SKIPPED. No declarar login histórico PASS.

El próximo harness debe ejecutar login histórico inmediatamente después de una nueva credencial autorizada y conservar evidencia sanitizada aunque falle un paso posterior.

## Shopper nuevo

No fue creado: el fallo ocurrió en login Admin antes del alta. El patch ACK-aware de `modules/shoppers.js` sigue preparado por `tools/qa/cxorbia-i3-source-patcher.mjs`; no rehacerlo manualmente.

## Reusable CXOrbia

Se mantiene tenant/project scope, RBAC, idempotencia, expectedVersion, exact identity, provider ACK, protected-data boundary y fail-closed. Cinépolis sigue siendo configuración del proyecto TyA, no arquitectura global.

## Academia

No declarar todavía login/alta Shopper real como activo. Mis Visitas multi-registro sigue cerrado en source. La validación histórica Academia/Certificación del principal Shopper quedó SKIPPED en el último run y se retomará dentro de I3.

## Porcentaje

**35% completado / 65% pendiente.** I3 no suma puntos hasta PASS completo.

## Siguiente frontera

`I3_SOURCE_ONLY_HARNESS_DURABILITY_AFTER_RECOVERY_FAILURE`; después gate nuevo focalizado para terminar I3, no otra auditoría ni candidata.
