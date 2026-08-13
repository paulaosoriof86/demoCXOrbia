# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-13 11:18 -06:00
**Estado:** `DEV_QUALIFIED__OWNER_VISUAL_ACCEPTANCE_PENDING__NO_FRONTEND_PATCH`

M1–M10 completaron la calificación técnica del entorno DEV limpio. **No se ha reemplazado la plataforma/hosting real vigente de TyA.** El cutover real permanece pendiente.

Antes del go-live real se hará aceptación visual en DEV con Paula observando y pruebas E2E con datos sintéticos, más reconciliación read-only de HR viva, shoppers y visitas disponibles.

Para Claude:
- no modificar `/app/modules` ni `/app/core` por esta corrección;
- no crear candidata nueva;
- mantener exactamente `CX.data`;
- mantener Cinépolis como proyecto configurable dentro de tenant TyA;
- cualquier defecto de tenant, módulos, roles, navegación, Academia o flujo que aparezca en la aceptación visual debe documentarse por archivo/módulo y corregirse por el carril frontend correspondiente, no mediante parche backend;
- mantener el consentimiento de confidencialidad como acción humana.

El 100% existente en el tracker debe interpretarse como **100% de calificación técnica DEV**, no como go-live real completado.

Academia: durante la aceptación visual se validará que los accesos/rutas visibles correspondan al rol y configuración TyA; sin cambios de contenido en este bloque documental.
