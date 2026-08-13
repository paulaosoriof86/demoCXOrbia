# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-13 12:38 -06:00
**Estado:** `HUMAN_SHOPPER_P0__OWNER_ACCEPTANCE_REJECTED`

La calificación técnica DEV permanece preservada, pero la aceptación funcional humana fue rechazada.

## Pendiente P0 inmediato

Paula ingresó con un perfil Shopper real. La navegación Shopper aparece, pero `Mi Perfil` informa que la identidad de la sesión no está vinculada al read model canónico y la vista autenticada no presenta el contexto operacional esperado de HR viva.

Evidencia: `app/docs/evidence/p0-human-shopper-canonical-binding-failure-20260813.json`.

Resolver primero este enlace post-login y repetir la validación humana Shopper. El resultado verde previo del laboratorio no sustituye esta prueba porque comprobaba Hosting, lectura HR y assets, no el comportamiento funcional completo del principal humano autenticado.

El `0` de visitas disponibles mostrado por el laboratorio queda sin certificar hasta evaluarlo con la semántica canónica de estados.

Después del P0: validar Admin/Operaciones, ejecutar el E2E sintético bajo su gate separado y solo entonces evaluar el cutover real TyA.

No crear candidata nueva ni rediseñar frontend. Corregir únicamente la causa reproducible por el carril autorizado.
