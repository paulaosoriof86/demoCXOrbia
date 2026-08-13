# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-13 12:38 -06:00
**Estado:** `HUMAN_SHOPPER_P0_FOUND__OWNER_ACCEPTANCE_REJECTED__NO_PRODUCT_PATCH_YET`

M1–M10 siguen siendo calificación técnica DEV. No equivalen a aprobación funcional ni al go-live real de TyA.

## Hallazgo humano vigente

Durante la aceptación visible en DEV, Paula ingresó con un perfil Shopper real. El menú Shopper se mostró, pero `Mi Perfil` quedó bloqueado con el mensaje `La identidad de esta sesión no está vinculada al read model canónico.` La vista autenticada no presentó el contexto operacional esperado de HR viva.

Evidencia: `app/docs/evidence/p0-human-shopper-canonical-binding-failure-20260813.json`.

## Para Claude/prototipo

No rediseñar ni generar candidata nueva. No corregir por apariencia. El hallazgo debe tratarse como P0 focal de enlace entre la sesión Shopper y el read model canónico. Mantener `CX.data`, tenant TyA, Cinépolis configurable y la autoridad operacional de HR. Cualquier cambio frontend posterior debe limitarse al archivo/adaptador causal demostrado.

Academia tampoco queda aprobada para Shopper hasta que el contexto de sesión sea correcto. La plataforma real vigente de TyA no ha recibido cutover.
