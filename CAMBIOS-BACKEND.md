# CAMBIOS-BACKEND.md

**Última actualización:** 2026-08-14 13:24 -06:00  
**Estado:** `I1_PASS__I2_PASS__I3_RECOVERY_PASS__ADMIN_LOGIN_POINTER_STOP_RETRY__GO_LIVE_35__NO_PRODUCTION`

## Bloque ejecutado

Se consumió una única autorización focalizada de continuidad I3 DEV sobre la misma candidata `docs-tya-v6-v71-audit` / PR #7. Run `31833696707`, job `94875097700`. No nueva candidata, rama, PR, deploy, merge ni producción.

## Cambios source realizados antes del gate

- `tools/qa/cxorbia-c6-existing-users-e2e-credentials-v6.mjs`: permite entregar al boundary privado el único candidato historical Shopper exacto para recovery cuando existe exactamente uno y H0/S0; cero fuzzy matching.
- `backend/runtime/cxorbia-shopper-command-provider-v1.mjs`: añade continuación exacta de credential recovery, preservación post-reset y budgets focalizados; create/update Shopper existente se conserva.
- `.github/workflows/cxorbia-c6-staff-repair-bootstrap-exact-write-v2.yml`: reutiliza el workflow existente para una única continuación, fail-closed y park automático ante cualquier fallo.
- `.github/cxorbia-firebase-requests/cxorbia-i3-shopper-persistence-exact-write-v1.json`: request único de Paula, después consumido/parked.

## Resultado real del provider run

PASS:

1. gate exacto;
2. source preflight / same-candidate patch;
3. service account DEV privada;
4. exact historical Shopper recovery candidate;
5. **un único credential recovery/reset ejecutado**;
6. preservación de uid/claims/shopperId/profile/historia y otras identidades modificadas `0`;
7. exact membership/crosswalk reconciliation;
8. provider y source proxy local.

STOP_RETRY posterior:

`Execute Admin create update and new Shopper real Auth E2E` falló al intentar pulsar `#lgSubmit`. Playwright comprobó que el botón era visible/habilitado/estable, pero `#cxBackendPreviewStatus` interceptó pointer events durante 30 s. El Shopper nuevo no se creó.

El failure handler consumió/parked el request y no hubo segundo intento automático.

## Causa raíz nueva y corrección focalizada source-only

`app/core/backend-preview-status.js` creaba el panel diagnóstico DEV como fixed/z-index 99999 sin neutralizar eventos de puntero. Era capaz de bloquear interacción humana real en Preview DEV.

Corrección aplicada:

- `pointer-events:none`;
- `aria-hidden=true`;
- `user-select:none`.

También se actualizó `tools/qa/cxorbia-i3-shopper-persistence-e2e.mjs` para exigir que `#cxBackendPreviewStatus` sea no interactivo antes de pulsar Ingresar. No se usa `force click`, porque ocultaría el bug real.

## Credencial histórica después del STOP_RETRY

La contraseña generada en el recovery existió únicamente en archivo privado `.tmp` del runner. Cleanup la eliminó y nunca se expuso o persistió. Como el E2E histórico estaba después del paso Admin, quedó SKIPPED.

Resultado correcto:

- password reset exacto: PASS;
- identidad histórica preservada: PASS;
- login histórico posterior: todavía NO certificado;
- password temporal: no recuperable desde repo/evidencia;
- cualquier nuevo reset requiere gate expreso de Paula.

El harness siguiente debe validar el login histórico inmediatamente después de un recovery autorizado y preservar evidencia sanitizada antes de continuar a Admin/new Shopper.

## Writes y seguridad reales

- Auth password update/reset sobre principal histórico exacto: `1`;
- otras identidades modificadas: `0`;
- membership/crosswalk reconciliation: PASS; el run no persistió el conteo final, posible `0–2` Firestore writes dentro del budget;
- Shopper nuevo creado: `NO`;
- HR/Rules/Storage/Make/Gemini/pagos: `0`;
- deploy: `0`;
- merge: `false`;
- producción: `false`;
- retry automático: `NO`.

## Reusable CXOrbia

Exact identity, provider boundary, tenant/project scope, idempotencia, expectedVersion, ACK, fail-closed y overlays de diagnóstico no interactivos son patrones reutilizables. Cinépolis sigue como configuración del primer proyecto TyA.

## Exclusivo cliente TyA

El reset se ejecutó exclusivamente sobre el único Shopper histórico exacto resuelto para TyA/Cinépolis. Ninguna otra identidad fue modificada.

## Claude/prototipo

No reconstruir Auth ni login. El fix fue en overlay backend DEV, no un rediseño de UI. El patch ACK-aware de `modules/shoppers.js` sigue preparado por `tools/qa/cxorbia-i3-source-patcher.mjs`; el último run no lo dejó commiteado porque se restauró al fallar.

## Academia

No declarar todavía login/alta Shopper real como activo. La ruta histórica Academia/Certificación quedó SKIPPED y debe certificarse dentro del cierre I3. Mis Visitas multi-registro permanece cerrado desde I2.

## Sin impacto Claude

Source locks, tracker, parked request y disciplina de evidencia no cambian UX del producto.

## Porcentaje

**GO-LIVE: 35% completado / 65% pendiente.** I3 no suma sus 25 puntos hasta PASS completo.

## Siguiente bloque exacto

`I3_SOURCE_ONLY_HARNESS_DURABILITY_AFTER_RECOVERY_FAILURE`, seguido únicamente de un nuevo gate focalizado de Paula para terminar I3 sin repetir I1/I2 ni reauditar.
