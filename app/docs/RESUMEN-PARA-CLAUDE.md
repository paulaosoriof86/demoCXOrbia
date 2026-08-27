# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-27  
**Estado:** `PHASE_A_100__F8_EXTERNAL_OWNER_ROUTE_IDENTIFIED__EFFECTIVE_TEST_PENDING__PROD_READINESS_95__NO_UI_REBUILD`

## Estado canónico

- PHASE_A `100/100`.
- PRODUCTION_REAL_READINESS `95/100`.
- F5/F6 permanecen terminales; F7 permanece `GO_WITH_WARNINGS`, P0=0.
- F8 sigue detenido antes de cualquier mutación provider.
- Release congelado `CXORBIA-PHASE-A-RELEASE-100-FROZEN-20260827-01`.

## Nuevo dato F8

La evidencia visual de Google Cloud Console muestra que una identidad humana del proyecto exacto `cxorbia-backend-dev` tiene rol `Propietario` / `Owner`. Esto identifica una ruta administrativa externa candidata que no estaba disponible para el principal DEV automatizado.

Antes de declarar capacidad IAM efectiva, debe pasar un `projects.testIamPermissions` read-only para `resourcemanager.projects.setIamPolicy`. No se ha concedido ningún rol ni existe autorización vigente de grant, deploy o cutover.

## Release exacto que Claude debe respetar

Functional SHA `f9802fdd498934a8e7729fa5c7d18341bec1cd71`; runtime SHA `2d0b8e83b32b44f6c3eae80b7630f8cd3295fba2`; Cloud Run `cxorbia-live-hr-dev-00013-rns`; image `sha256:eca8b831c24ef81f09e4addda721d0af89a24c5a0d753aa507989988458227ec`; Hosting release `sites/cxorbia-backend-dev/releases/1787796646738000`.

## Frontend / prototipo

El bloqueo actual es exclusivamente provider/IAM. No es un P0 de UI ni autoriza rediseño, nueva candidata, reconstrucción de módulos o reauditoría frontend.

No tocar `/app/modules` ni `/app/core` desde backend. Cualquier defecto visual futuro debe quedar localizado por archivo/módulo y seguir el carril vigente.

Mantener estados honestos para Auth, HR, shoppers, postulaciones, certificaciones, visitas, pagos, Make/Gemini e integraciones. TyA/Cinépolis no se hardcodean como arquitectura global.

## F8 y lo que NO debe trasladarse a Claude

- `resourcemanager.projects.setIamPolicy` es una capacidad administrativa Google Cloud, no una funcionalidad de interfaz.
- La comprobación pendiente es provider-side y read-only.
- El intento temporal IAM anterior está consumido; no debe recrearse desde frontend.
- Secret Manager metadata readback sigue bloqueado hasta cerrar el gate IAM; no acceder a payloads de secretos.

## Academia

Sin cambio funcional por este bloque. Preservar rutas por rol, cursos/manuales separados, pasos operativos, botones/estados/errores, certificaciones configurables, notificaciones y distinción entre funciones activas/bloqueadas/futuras. La profundización P2 continúa sin bloquear F8.

## Siguiente frontera

`F8_VERIFY_EXTERNAL_OWNER_EFFECTIVE_SET_IAM_CAPABILITY`. Claude no ejecuta IAM, grant, deploy ni cutover y no decide autorizaciones.
