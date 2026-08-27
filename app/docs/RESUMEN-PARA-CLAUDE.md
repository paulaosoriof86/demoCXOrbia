# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-27  
**Estado:** `PHASE_A_100__F7_GO_WITH_WARNINGS__PROD_READINESS_95__WAIT_F8_AUTH__NO_UI_REBUILD`

## Estado canónico

- PHASE_A `100/100`.
- PRODUCTION_REAL_READINESS `95/100`.
- F5/F6 permanecen terminales.
- F7 `GO_WITH_WARNINGS`, P0=0.
- Release congelado `CXORBIA-PHASE-A-RELEASE-100-FROZEN-20260827-01`.
- NEXT `WAIT_FOR_F8_EXPLICIT_AUTHORIZATION`.

## Release exacto que Claude debe respetar

Functional SHA `f9802fdd498934a8e7729fa5c7d18341bec1cd71`; runtime SHA `2d0b8e83b32b44f6c3eae80b7630f8cd3295fba2`; Cloud Run `cxorbia-live-hr-dev-00013-rns`; image `sha256:eca8b831c24ef81f09e4addda721d0af89a24c5a0d753aa507989988458227ec`; Hosting release `sites/cxorbia-backend-dev/releases/1787796646738000`.

## Frontend / prototipo

F7 no demostró P0 de UI y no autoriza rediseño ni nueva candidata. No tocar `/app/modules` o `/app/core` desde backend. Cualquier defecto futuro debe localizarse por archivo/módulo y seguir el carril de empalme vigente.

Mantener estados honestos para Auth, HR, shoppers, postulaciones, certificaciones, visitas, pagos, Make/Gemini e integraciones. TyA/Cinépolis no se hardcodean como arquitectura global.

## Warnings F7 relevantes para Claude

- No convertir warnings de infraestructura/readiness en cambios visuales artificiales.
- Alertas/runbooks son backend/operación, no UI salvo que exista superficie visible real.
- Academia sigue siendo funcionalmente visible; profundidad de cursos/manuales permanece P2 y debe tratarse como contenido profundo por rol/módulo, no como texto superficial.

## Academia

Preservar rutas por rol, cursos/manuales separados, pasos operativos, botones/estados/errores, certificaciones configurables, notificaciones y distinción entre funciones activas/bloqueadas/futuras. No publicar contenido IA sin revisión humana.

## Siguiente frontera

`WAIT_FOR_F8_EXPLICIT_AUTHORIZATION`. Claude no ejecuta cutover ni decide autorización.
