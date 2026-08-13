# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-13 12:24 -06:00
**Estado:** `OWNER_VISIBLE_DEV_LAB_HOSTED__VISUAL_ACCEPTANCE_PENDING`

La calificación técnica DEV M1–M10 está completa y el laboratorio visible pre-go-live ya está publicado en Hosting DEV. El go-live real TyA todavía no está completado.

## Ya no pendiente

- Crear la superficie visible de pruebas: completado.
- Publicarla en `cxorbia-backend-dev`: completado.
- Run de Hosting DEV `31730303749`: `SUCCESS`.
- Bitácora visible PASS/FAIL/BLOCKED: disponible.
- Lectura HR viva read-only y lectura fresca desde la superficie: disponible.
- Comprobación de entrypoint/build y módulos críticos: disponible.
- Aplicación DEV canónica embebida para login y comprobación de sesión/módulos: disponible.

## Pendiente inmediato pre-go-live

- Paula debe abrir `/dev-validation/index.html` en Hosting DEV y observar la ejecución real.
- Tras login, comprobar desde la misma superficie rol, tenant TyA, proyecto, período, fuente y módulos visibles.
- Confirmar que períodos, shoppers, visitas y disponibles representados coincidan con la HR viva observada.
- Registrar `APROBADO` o una diferencia reproducible.
- Ejecutar el E2E funcional con datos sintéticos que requiera escrituras solo después de un gate separado de escrituras temporales + cleanup exacto.
- Validar consistencia cruzada/reload/new-tab dentro de ese E2E cuando sea autorizado.
- Documentar cualquier hallazgo frontend por archivo/módulo sin parche backend.

Solo después de PASS visual + funcional se prepara un gate separado para reemplazar la plataforma/hosting real vigente de TyA.

No crear candidata nueva ni reabrir frontend sin un hallazgo reproducible de la aceptación visual.
