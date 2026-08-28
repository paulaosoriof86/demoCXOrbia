# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-28  
**Estado:** `PHASE_A_100__F8_BOUNDED_PASS__BACKUP_RESTORE_AUTH_GATE__PROD_READINESS_95__NO_UI_REBUILD`

## Estado canónico

- PHASE_A `100/100`.
- PRODUCTION_REAL_READINESS `95/100`.
- F5/F6 terminales; F7 `GO_WITH_WARNINGS`, P0=0.
- F8: `F7-P1-002` continúa P1 no bloqueante y `F7-P1-003` bounded load/failure está `CLOSED/PASS`.
- Release congelado `CXORBIA-PHASE-A-RELEASE-100-FROZEN-20260827-01` intacto.
- NEXT `F8_BACKUP_RESTORE_AND_CUTOVER_EXPLICIT_AUTHORIZATION_GATE`.

## F8 bounded load/failure

Run `33131739261`: 24/24 GET correctos, concurrencia 4, 0 5xx, 0 fallos de contrato, p95 181.87 ms, una revisión, 15 períodos y 660 visitas. Pruebas acotadas de token operacional inválido/ausente y Origin no confiable fallaron cerrado. El run `33131536618` fue falso negativo del harness, no P0 de producto.

No hay evidencia actual de drift del release F6; no corresponde redeploy por rutina.

## Frontend / prototipo

No tocar `/app/modules` ni `/app/core` desde backend. No nueva candidata ni reauditoría frontend por este bloque. No trasladar backup/restore, IAM o cutover a UI.

Mantener estados honestos para Auth, HR, shoppers, postulaciones, certificaciones, visitas, pagos, Make/Gemini e integraciones. Cinépolis sigue siendo proyecto configurable, no arquitectura global.

## Academia

Sin cambio funcional. Preservar rutas por rol, cursos/manuales separados, pasos operativos, certificaciones configurables, notificaciones y distinción entre funciones activas/bloqueadas/futuras. La profundización P2 continúa no bloqueante.

## Siguiente frontera

`F8_BACKUP_RESTORE_AND_CUTOVER_EXPLICIT_AUTHORIZATION_GATE` es provider/control-plane. Claude no ejecuta ni decide backup/restore, deploy/cutover, IAM ni autorizaciones.
