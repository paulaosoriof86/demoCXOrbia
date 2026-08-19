# PENDIENTES-PROTOTIPO.md

**Última sincronización:** 2026-08-19 10:59 -06:00  
**SYNC_EPOCH:** `CXORBIA-20260819-I4A-VISIBLE-SMOKE-MECHANISM-HOLD-22`  
**Estado:** `I4A_TEST_IDENTITY_READY__VISIBLE_SMOKE_1_CONSUMED_HOLD__RETRY_AUTH_REQUIRED`

## Pendiente activo único

`NEW_AUTH_REQUIRED_I4A_VISIBLE_DEV_SHOPPER_LIFECYCLE_SMOKE_RETRY__SERVICE_WORKER_STABILIZED_HARNESS`

El visible smoke #1 ya fue consumido y NO se repite automáticamente. Run `32278013553` quedó en HOLD antes de superficies, con prelogin exacto PASS, 1 Auth password update, 1 login y cero writes operativos.

El retry debe usar exclusivamente la misma identidad DEV dedicada y:
- bloquear/estabilizar Service Worker como en el E2E I3 PASS;
- registrar checkpoints de Auth, membership y entrada a app antes de navegar;
- observar documentos/instrucciones;
- observar visitas disponibles y control/estado de postulación sin enviar;
- observar notificaciones;
- observar presentación de certificación nueva sin enviar.

## No reabrir

Identidad existente, Historical Shopper, nueva identidad dedicada, I3, HR 15/660, Admin TARGET_B, Finance histórico.

## Hallazgo P1 no bloqueante

`app/app.js` + `app/sw.js`: posible carrera de primer control SW/auto-reload en harness nuevo. No es P0 de producto demostrado; no parchear UI desde backend. Confirmar primero con retry estabilizado.

## Después

I4-B visita → I4-C HR bidireccional → I4-D Finanzas → I4-E multi-proyecto/no-code → I4-F Academia → I5 producción.
