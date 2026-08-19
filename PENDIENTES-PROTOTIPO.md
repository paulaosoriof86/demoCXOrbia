# PENDIENTES-PROTOTIPO.md

**SYNC_EPOCH:** `CXORBIA-20260819-I4B-RETRY2-LANE-READY-SOURCE-ONLY-30`

I1/I2/I3 PASS/frozen. I4-A PASS/frozen. Progreso formal canónico: **60% completado / 40% pendiente**.

## Pendiente activo único inmediato
`NEW_AUTH_REQUIRED_I4B_SINGLE_DEV_VISIT_LIFECYCLE_E2E_WRITE_GATE_RETRY2__PROVIDER_TX_READ_ORDER_FIXED__SYNTHETIC_VISIT_ONLY`.

## Ya resuelto antes de pedir autorización
La documentación canónica queda 10/10 sincronizada. Source-truth ya no hard-codea epoch, frontera ni 60/40. El provider verifier cubre las tres ramas transaccionales. El workflow I4-B ya no se reconstruye por retry: es request-driven, no cancela runs activos y preserva autorización si el fallo ocurre antes de entrar al intento de mutación.

Retry2 request ya existe preparado pero deshabilitado: `enabled=false / consumed=false / authorizationRequired=true`. No hubo provider writes, Historical Shopper, HR, Rules, Storage, Make, Gemini, pagos, deploy, merge o producción en esta preparación.

PASS Retry2 → I4-C HR bidireccional → I4-D Finanzas → I4-E multi-proyecto/no-code → I4-F Academia → I5.

No reabrir Auth, Shopper histórico, TARGET_B Admin, I1/I2/I3/I4-A ni crear nueva candidata/rama/PR/workflow.
