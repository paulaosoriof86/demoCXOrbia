# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-27  
**Estado:** `PHASE_A_100__F8_HUMAN_OWNER_ROUTE_OBSERVED__SECURE_BRIDGE_HOLD__PROD_READINESS_95__NO_UI_REBUILD`

## Estado canónico

- PHASE_A `100/100`.
- PRODUCTION_REAL_READINESS `95/100`.
- F5/F6 permanecen terminales; F7 permanece `GO_WITH_WARNINGS`, P0=0.
- F8 está antes de cualquier mutación provider.
- Release congelado `CXORBIA-PHASE-A-RELEASE-100-FROZEN-20260827-01`.
- NEXT `F8_REQUIRE_SECURE_OWNER_EXECUTION_BRIDGE`.

## Nuevo dato F8

Existe una identidad humana `roles/owner` observada en el proyecto exacto `cxorbia-backend-dev`. La identidad no se persiste en repo.

El principal automatizado DEV sigue sin capacidad `resourcemanager.projects.setIamPolicy`; su intento anterior está consumido. Tampoco existe actualmente un puente GitHub OIDC/WIF ni conector GCP/IAM demostrado para utilizar de forma segura la sesión Owner.

Esto es provider/control-plane, no frontend. No convertirlo en botón, pantalla, candidata, rebuild UI ni instrucción para Claude.

## Release exacto que Claude debe respetar

Functional SHA `f9802fdd498934a8e7729fa5c7d18341bec1cd71`; runtime SHA `2d0b8e83b32b44f6c3eae80b7630f8cd3295fba2`; Cloud Run `cxorbia-live-hr-dev-00013-rns`; image `sha256:eca8b831c24ef81f09e4addda721d0af89a24c5a0d753aa507989988458227ec`; Hosting release `sites/cxorbia-backend-dev/releases/1787796646738000`.

## Frontend / prototipo

No tocar `/app/modules` ni `/app/core` desde backend. No nueva candidata ni reauditoría frontend por este bloqueo.

Mantener estados honestos para Auth, HR, shoppers, postulaciones, certificaciones, visitas, pagos, Make/Gemini e integraciones. TyA/Cinépolis no se hardcodean como arquitectura global.

## Academia

Sin cambio funcional. Preservar rutas por rol, cursos/manuales separados, pasos operativos, botones/estados/errores, certificaciones configurables, notificaciones y distinción entre funciones activas/bloqueadas/futuras. La profundización P2 continúa sin bloquear F8.

## Siguiente frontera

`F8_REQUIRE_SECURE_OWNER_EXECUTION_BRIDGE`.

Claude no ejecuta IAM, grant, deploy ni cutover y no decide autorizaciones.
