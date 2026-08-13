# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-13 13:29 -06:00
**Estado:** `HUMAN_SHOPPER_P0_OPEN__READONLY_DIAGNOSTIC_FAILED__NO_PRODUCT_PATCH`

M1–M10 continúan como calificación técnica DEV. No equivalen a aprobación funcional ni al go-live real de TyA.

## Hallazgo humano vigente

Paula ingresó con un perfil Shopper real. La navegación Shopper apareció, pero `Mi Perfil` mostró `La identidad de esta sesión no está vinculada al read model canónico.` La vista autenticada permaneció sin el contexto operacional esperado de HR viva.

Evidencia primaria: `app/docs/evidence/p0-human-shopper-canonical-binding-failure-20260813.json`.

## Diagnóstico P0 posterior

El único gate read-only autorizado ejecutó run `31735473752`, pero la inspección falló antes de persistir diagnóstico/artifact. Se aplicó `STOP_RETRY`; no hubo segundo intento. Evidencia de cierre seguro: `app/docs/evidence/p0-human-shopper-readonly-run-failure-31735473752.json`.

Por tanto, no asumir ni implementar todavía una causa frontend específica. No existe evidencia persistida suficiente para afirmar si falla claims, shopperId, membership, crosswalk HR o activación del bridge.

## Para Claude/prototipo

- No rediseñar ni generar candidata nueva.
- No parchear por apariencia ni por nombre de Shopper.
- Mantener `CX.data`, tenant TyA, Cinépolis configurable y HR como autoridad operacional.
- Esperar causa reproducible antes de tocar un adaptador funcional.
- Academia para Shopper continúa no aprobada mientras el principal no resuelva al contexto canónico.

La plataforma real vigente de TyA no ha recibido cutover.
