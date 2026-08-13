# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-13 12:24 -06:00
**Estado:** `OWNER_VISIBLE_DEV_LAB_HOSTED__OWNER_ACCEPTANCE_PENDING__NO_PRODUCT_FRONTEND_PATCH`

M1–M10 completaron la calificación técnica del entorno DEV limpio. **No se ha reemplazado la plataforma/hosting real vigente de TyA.** El cutover real permanece pendiente.

## Laboratorio DEV visible ya publicado

Se creó y publicó `app/dev-validation/index.html` como superficie independiente de observabilidad para que Paula vea las pruebas ejecutarse en vivo. Run DEV `31730303749`, job `94548821932`: `SUCCESS`.

La superficie muestra PASS/FAIL/BLOCKED y bitácora, consulta HR viva read-only con opción de lectura fresca, presenta períodos/visitas/shoppers/disponibles, comprueba entrypoint/build y módulos críticos, y embebe la aplicación DEV canónica para validación humana de sesión, rol, tenant, proyecto, período, fuente y navegación.

## Contrato para frontend/prototipo

- El laboratorio es DEV-only y no forma parte de la navegación productiva.
- No se tocaron módulos del producto ni el core para implementarlo.
- No se crea candidata nueva por este bloque.
- `CX.data` se conserva.
- Cinépolis continúa como proyecto configurable dentro del tenant TyA.
- Cualquier diferencia visual reproducible que Paula observe se registra por archivo/módulo y se corrige por el carril frontend correspondiente.
- El consentimiento de confidencialidad continúa siendo acción humana.

## Pendiente

La aceptación visual de Paula aún no está otorgada. El E2E con escrituras sintéticas temporales no se ejecutó y queda bloqueado hasta gate separado con cleanup exacto.

El 100% del tracker sigue significando **100% de calificación técnica DEV**, no go-live real completado.

Academia: el laboratorio verifica que la superficie esté publicada; durante la sesión visual se validarán acceso, ruta y contenido por rol/configuración TyA.
