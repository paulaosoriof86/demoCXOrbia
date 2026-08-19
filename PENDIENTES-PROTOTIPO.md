# PENDIENTES-PROTOTIPO.md

**SYNC_EPOCH:** `CXORBIA-20260819-I4C-HR-SYNC-SOURCE-READY-32`

I1/I2/I3/I4-A/I4-B PASS/frozen. Progreso formal canónico: **60% completado / 40% pendiente**.

## I4-C source/readiness — resuelto
- contrato bidireccional creado;
- planner Plataforma→HR y HR→Plataforma creado;
- outbox `hrSync` reutilizado;
- matching estable, no por nombre;
- conflict review fail-closed;
- reflection exacta idempotente;
- HR shopper desconocido bloqueado;
- verifier 8/8 PASS, 0 provider/HR/Make/platform writes.

## Pendiente activo único inmediato
`I4C_MAKE_HR_PROVIDER_BINDING_EXTERNAL_CONFIGURATION_REQUIRED`.

No hay binding live Make/HR verificable en repo, Gmail, Drive ni contexto. No se debe simularlo, inventar webhook/scenario ni activar HR writes por otro canal. Una vez resuelto el binding seguro y gateado se realiza la validación provider-backed de I4-C.

Después: I4-D Finanzas → I4-E multi-proyecto/no-code → I4-F Academia → I5.

No reabrir Auth, Shopper histórico, TARGET_B Admin, I1/I2/I3/I4-A/I4-B ni crear nueva candidata/rama/PR.
