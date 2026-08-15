# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-15 15:14 -06:00  
**Estado:** `I1_PASS__I2_PASS__I3_HISTORICAL_PASS_FROZEN__REQUEST07_ADMIN_OVERLAY_STOP_RETRY_BEFORE_CREATE__OVERLAY_AWARE_SOURCE_GATE_PASS__SAME_CANDIDATE`

No nueva candidata/rama/PR. No reconstruir Auth.

Lock actual:
`app/docs/SOURCE-LOCK-ITERATION3-REQUEST07-ADMIN-OVERLAY-STOP-RETRY-OVERLAY-AWARE-SOURCE-GATE-PASS-20260815.md`.

## No tocar / no reprocesar

Auth owner/exact identity, Staff membership, protected HR authority, I1/I2, Mis Visitas ACK, histórico I3 de request06 y su credential reset ya congelado, harness legal-gate-aware. No volver a cargar credencial histórica; `passwordResets=0`.

## Request07

Run `31907732888`, job `95068062981` fue Admin/new-Shopper-only. El fix anterior sí funcionó: `#shNew` llegó visible/enabled/stable después del handoff canónico.

Falló antes de completar el click porque un `.cx-ov` interceptó pointer events:
`I3_ADMIN_NEW_SHOPPER_OVERLAY_POINTER_INTERCEPTION_BEFORE_CREATE`.

No hubo `shopper.create`, Shopper nuevo, update ni readback; nuevos Auth/Firestore writes `0/0`; histórico intacto; password resets `0`.

## Qué NO inferir

El run no congeló suficiente estructura para afirmar si ese `.cx-ov` era NDA, banner u otro modal. No modificar producto/UI basándose en esa suposición.

`.cx-ov` es infraestructura modal legítima. Prohibido `force:true` o deshabilitar pointer events globalmente.

## Fix QA/backend source-only

- El Admin E2E clasifica overlays antes de Alta sin leer/persistir texto sensible.
- Si `CX.confidencialidad.pending('admin')===true`: STOP fail-closed; no aceptar/firmar/guardar/automatizar consentimiento.
- Solo un banner informativo con contrato exacto `#bnOk` puede reconocerse mediante click normal.
- Cualquier overlay desconocido: STOP fail-closed.
- Source patcher/workflow prearman únicamente continuación desde request07, Admin-only, frozen historical checkpoint y `passwordResets=0`.
- Gate independiente `31908665710` / `95070327022`: `SUCCESS` completo y cero provider writes.

## UI / Claude

1. No rediseñar `app/modules/shoppers.js` por request07.
2. No tocar login/NDA/Academia/Certificación para forzar pruebas.
3. El patch ACK-aware de alta/edición Shopper sigue siendo el contrato aprobado; todavía no llegó a ejecutarse porque no ocurrió `shopper.create`.
4. Solo evidencia futura reproducible dentro del producto, después de clasificar el overlay, puede justificar un P0 frontend focal.

## Academia

El histórico permanece `legal-gate-pending` con `acceptanceAutomated=false`; Academia y Certificación diferidas, no PASS. Cualquier consentimiento legal debe ser humano.

## Seguridad

Request07 consumido; cero password reset, cero nuevo Auth/Firestore write, cero otras identidades, cero HR/Rules/Storage/Make/Gemini/pagos/deploy/merge/producción.

## Porcentaje

**35% completado / 65% pendiente. I3 0/25 hasta PASS integral.**

## Siguiente frontera

`PAULA_REVIEW_REQUIRED_FOR_I3_REQUEST08_OVERLAY_AWARE_ADMIN_NEW_SHOPPER_ONLY`.
