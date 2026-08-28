# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-28  
**Estado:** `PHASE_A_100__F8_IAM_METADATA_P1_NONBLOCKING__PRECUTOVER_READONLY_NEXT__PROD_READINESS_95__NO_UI_REBUILD`

## Estado canónico

- PHASE_A `100/100`.
- PRODUCTION_REAL_READINESS `95/100`.
- F5/F6 permanecen terminales; F7 permanece `GO_WITH_WARNINGS`, P0=0.
- F8 volvió al camino crítico del master plan; la brecha de metadata Secret Manager permanece P1 no bloqueante.
- Release congelado `CXORBIA-PHASE-A-RELEASE-100-FROZEN-20260827-01`.
- NEXT `F8_BOUNDED_LOAD_FAILURE_READONLY_CHECK`.

## Reconciliación F8

La búsqueda de un puente humano Owner/IAM no debe trasladarse a frontend ni a Claude. Se comprobó que el único readback de seguridad faltante es el listado de metadata Secret Manager por ausencia de `secretmanager.secrets.list`; el runtime congelado tiene `plaintextSensitiveKeyCount=0`, `secretBackedEnvCount=0`, APIs requeridas y cuotas PASS. F7 ya había clasificado esta brecha como `F7-P1-002`, no P0.

Por tanto el Owner humano observado queda como evidencia administrativa, no como dependencia de producto. No crear pantallas, botones, workarounds UI ni nuevas candidatas para IAM.

## Release exacto que Claude debe respetar

Functional SHA `f9802fdd498934a8e7729fa5c7d18341bec1cd71`; runtime SHA `2d0b8e83b32b44f6c3eae80b7630f8cd3295fba2`; Cloud Run `cxorbia-live-hr-dev-00013-rns`; image `sha256:eca8b831c24ef81f09e4addda721d0af89a24c5a0d753aa507989988458227ec`; Hosting release `sites/cxorbia-backend-dev/releases/1787796646738000`.

## Frontend / prototipo

No tocar `/app/modules` ni `/app/core` desde backend. No nueva candidata ni reauditoría frontend por este bloque.

Mantener estados honestos para Auth, HR, shoppers, postulaciones, certificaciones, visitas, pagos, Make/Gemini e integraciones. TyA/Cinépolis no se hardcodean como arquitectura global.

## Academia

Sin cambio funcional. Preservar rutas por rol, cursos/manuales separados, pasos operativos, botones/estados/errores, certificaciones configurables, notificaciones y distinción entre funciones activas/bloqueadas/futuras. La profundización P2 continúa no bloqueante.

## Siguiente frontera

`F8_BOUNDED_LOAD_FAILURE_READONLY_CHECK` es provider/control-plane y read-only. Claude no ejecuta provider gates, IAM, backup/restore, deploy ni cutover y no decide autorizaciones.
