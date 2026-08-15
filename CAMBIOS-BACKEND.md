# CAMBIOS-BACKEND.md

**Última actualización:** 2026-08-15 15:14 -06:00  
**Estado:** `I1_PASS__I2_PASS__I3_HISTORICAL_PASS_FROZEN__REQUEST07_ADMIN_OVERLAY_STOP_RETRY_BEFORE_CREATE__OVERLAY_AWARE_SOURCE_GATE_PASS__GO_LIVE_35__NO_PRODUCTION`

## Preservado

I1 PASS 15/15 e I2 PASS 20/20. Histórico I3 congelado desde run `31906391682`: exact identity, un único reset, UID/claims/profile/membership/crosswalk/history, login real + HR authority + history E2E PASS. No repetir reset/reconcile ni acceder a credencial histórica; continuaciones `passwordResets=0`.

## Request I3 `...-07`

Misma candidata/PR. Request commit `2ebc85af6c4becee15a93de8a8726cbc295464c3`; run `31907732888`; job `95068062981`.

El bloque anterior `#shNew hidden` quedó superado: en request07 el botón llegó visible/enabled/stable después del handoff Admin.

STOP_RETRY exacto antes del comando:
`I3_ADMIN_NEW_SHOPPER_OVERLAY_POINTER_INTERCEPTION_BEFORE_CREATE`.

Un `.cx-ov` interceptó el click. No se completó `#shNew` y no se emitió `shopper.create`.

Efectos reales:
- Shopper nuevo `NO CREADO`;
- nuevos Auth/Firestore writes `0/0`;
- password resets `0`;
- histórico no accedido;
- otras identidades `0`;
- HR/Rules/Storage/Make/Gemini/pagos `0`;
- deploy `0`, merge=false, production=false.

Request07 consumido/parked en `6fb758130378adef1c14b6a2f1a1b22a8db87ca4`; no rerun.

## Corrección source-only posterior

### `tools/qa/cxorbia-i3-shopper-persistence-e2e.mjs`
Commit `e74169c2228a00828a7333b2d6bb3f66a8939ed2`.

- nuevo `handleBlockingOverlayBeforeAdminCreate()`;
- captura solo estructura source-safe, no texto sensible;
- legal/confidencialidad pending => fail-closed;
- solo banner informativo exacto `#bnOk` puede reconocerse mediante click normal;
- overlay desconocido => fail-closed;
- `forceClickUsed=false`; no deshabilitar `.cx-ov` globalmente.

### `tools/qa/cxorbia-i3-source-patcher.mjs`
Commit `1bcaaa69ab56a5446e6c21436a138dd6bd19119f`.

Prearma lineage request07 + `I3_ADMIN_NEW_SHOPPER_OVERLAY_POINTER_INTERCEPTION_BEFORE_CREATE`, manteniendo Admin-only y `passwordResets=0`.

### Workflow I3 existente
Commit `3f839f988b044d4e73fe364d68c495077873ac17`.

No workflow nuevo. Mantiene frozen checkpoint, cero histórico credential, `passwordResets=0`, overlay policy fail-closed y final evidence sin force-click/consent automation.

### Gate source-only
`.github/workflows/cxorbia-phase-a-live-checkpoint.yml` en HEAD fuente `1e313d6f4d689ac01623f4bce90da5828f25f717`.

Run `31908665710`, job `95070327022`: `SUCCESS` completo. Cero provider credentials/writes/resets/deploy/merge/producción.

## Documentación

Lock prevalente:
`app/docs/SOURCE-LOCK-ITERATION3-REQUEST07-ADMIN-OVERLAY-STOP-RETRY-OVERLAY-AWARE-SOURCE-GATE-PASS-20260815.md`.

Índice, checkpoint, tracker, RESUMEN-PARA-CLAUDE y PENDIENTES actualizados al mismo estado.

## Clasificación

- **Reusable CXOrbia:** modales deben clasificarse por contrato estructural; nunca force-click ni desactivar overlays globalmente; subgate PASS se congela.
- **Exclusivo TyA:** histórico exacto ya congelado; próximo provider gate crea solo un Shopper nuevo TyA/Cinépolis.
- **Claude/prototipo:** no hay evidencia para rediseñar Shoppers; `.cx-ov` es infraestructura modal legítima y no se identificó el modal concreto en request07.
- **Academia:** cualquier gate legal queda humano; cero aceptación automática. Academia/Certificación histórico siguen diferidas.
- **Sin impacto Claude:** workflow, patcher, QA y source lock.

## Porcentaje

**35% completado / 65% pendiente. I3 0/25 hasta PASS integral.**

## Siguiente gate

`PAULA_REVIEW_REQUIRED_FOR_I3_REQUEST08_OVERLAY_AWARE_ADMIN_NEW_SHOPPER_ONLY`.
