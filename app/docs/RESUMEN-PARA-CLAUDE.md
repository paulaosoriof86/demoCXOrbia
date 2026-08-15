# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-15 14:17 -06:00  
**Estado:** `I1_PASS__I2_PASS__I3_REQUEST06_HISTORICAL_PASS_FROZEN__ADMIN_NEW_SHOPPER_STOP_RETRY_BEFORE_COMMAND__ADMIN_RESUME_SOURCE_GATE_PASS__SAME_CANDIDATE`

No nueva candidata/rama/PR. No reconstruir Auth.

Lock actual:
`app/docs/SOURCE-LOCK-ITERATION3-HISTORICAL-PASS-ADMIN-RESUME-SOURCE-GATE-PASS-20260815.md`.

## No tocar / no reprocesar

- Auth owner y exact identity;
- Staff membership;
- protected HR authority;
- I1 e I2 provider ACK/fail-closed;
- Mis Visitas arrays/facets/ACK;
- overlay DEV;
- historical Shopper exact identity;
- **credential reset histórico de request06 y checkpoint histórico ya congelado**;
- harness legal-gate-aware.

## Request `...-06`

Run `31906391682`, job `95064802332` sí llegó a provider.

### Cerrado

El mismo Shopper histórico exacto pasó:

- un único credential reset del mismo UID;
- UID preservado;
- claims/profile/membership/crosswalk/history exactos;
- login real;
- HR authority;
- history E2E.

Checkpoint:
`app/docs/evidence/ITERATION3-HISTORICAL-SHOPPER-LOGIN-CHECKPOINT-LATEST.json`.

**No repetir reset, Auth recovery, reconciliación histórica ni acceso a su credencial en continuaciones futuras.**

## NDA / Academia / Certificación

El checkpoint histórico quedó `legal-gate-pending` con diálogo visible y `acceptanceAutomated=false`.

Academia y Certificación están diferidas por ese gate; no se declaran PASS. Claude no debe simular, aceptar ni guardar NDA para desbloquear rutas.

## Admin/new Shopper — qué falló

El E2E Admin llegó a la pantalla con `#shNew` existente pero oculto y agotó 20 s antes de hacer click.

Clasificación:
`I3_ADMIN_NEW_SHOPPER_BUTTON_HIDDEN_BEFORE_COMMAND`.

No hubo `shopper.create`, Shopper nuevo, update ni readback; nuevos Auth/Firestore writes = `0/0`.

## Causa focal

El frontend Staff termina su entrada de forma asíncrona mediante `finalizeStaffFrontend() -> CX.app.enter() -> app visible -> frontend handoff=entered`.

El test esperaba membership, pero navegaba a Shoppers antes de esperar ese handoff completo. Por eso el botón podía existir dentro de una app todavía oculta.

**No existe evidencia suficiente para cambiar el producto/UI.** Este incidente se corrigió en el harness, no en el diseño de Shoppers.

## Fix QA/backend source-only

- `tools/qa/cxorbia-i3-shopper-persistence-e2e.mjs`: espera handoff canónico `entered`, HR authority, app visible y `session.view='shoppers'` antes de `#shNew`.
- `tools/qa/cxorbia-i3-source-patcher.mjs`: prearma solo Admin resume desde request06.
- workflow I3 existente: futuro gate Admin/new-Shopper-only, `passwordResets=0`, reutiliza frozen checkpoint y no carga credencial histórica.
- source-only gate `31906801917` / `95065826139` sobre `5971413f13ca5d6fbdd878e5c1d379f2ab5a22c9`: `SUCCESS`.

## UI / Claude

1. **No rediseñar `app/modules/shoppers.js` por este fallo.**
2. No crear nueva candidata por request06.
3. No tocar login/NDA/Academia/Certificación para forzar el test.
4. El patch ACK-aware de alta/edición Shopper sigue siendo el contrato aprobado para la ejecución provider; el siguiente gate debe demostrarlo antes de declararlo resuelto.
5. Si un request Admin-only futuro vuelve a mostrar `#shNew` oculto después de `frontend handoff=entered` y `session.view='shoppers'`, entonces sí será nueva evidencia reproducible para evaluar un P0 frontend puntual.

## Seguridad

Request06 consumido/parked. Efecto histórico real: `1` password reset/Auth password update, `0` Firestore historical reconciliation, `0` otras identidades. Después del checkpoint, Admin/new Shopper produjo `0` Auth/Firestore writes. Cero HR/Rules/Storage/Make/Gemini/pagos, deploy, merge o producción.

## Porcentaje

**35% completado / 65% pendiente. I3 0/25 hasta PASS integral.**

## Siguiente frontera

`PAULA_REVIEW_REQUIRED_FOR_I3_REQUEST07_ADMIN_NEW_SHOPPER_ONLY_AFTER_FROZEN_HISTORICAL_PASS`.

El eventual request07 no puede repetir reset histórico: solo Admin create/update de un Shopper nuevo + ACK/readback/login/reload/new-tab/segundo contexto.