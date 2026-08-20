# GO-LIVE PROGRESS TRACKER — ROOT CAUSE · CXORBIA TyA

**Fecha:** 2026-08-19  
**SYNC_EPOCH:** `CXORBIA-20260819-I5-PREPROD-CREATOR-BLOCKED-39`

| Iteración | Peso | Estado formal | Estado operativo |
|---|---:|---|---|
| I1 | 15 | PASS 15/15 | FROZEN; no reprocesar |
| I2 | 20 | PASS 20/20 | FROZEN; no reprocesar |
| I3 | 25 | PASS 25/25 | FROZEN; Auth/Shopper/persistencia/histórico preservados |
| I4 | 25 | PASS 25/25 | FROZEN; protected runtime + same-build evidence closed |
| I5 | 15 | 0/15 | `I5_2_PREPROD_PROJECT_CREATOR_AUTH_BLOCKED` |

**Avance formal: 85% / 15% pendiente.** No se incrementa por preparación ni por un proyecto PREPROD fallido/no creado.

## Evidencia I5

1. Autorización PREPROD recibida para proyecto Firebase nuevo/limpio + 1 Hosting exacto de `f9802f...` + UAT read-only, sin writes de negocio ni producción.
2. Run `32332125828`, artifact `9393386559`: `HOLD_I5_2_PREPROD`; target no preexistía/accesible, 1 create command intentado, 0 project creates exitosos, 0 deploys, 0 UAT.
3. Run `32332360361`, artifact `9393462199`: root cause read-only; Project Creator capability no demostrada para identidad DEV.
4. Run `32332788919`, artifact `9393599029`: `HOLD_I5_NO_EXISTING_CREATOR_ROUTE_AUTHENTICATES`; dedicated/alternate creator secrets ausentes; DEV SA autentica pero no demuestra create capability.
5. No retry automático: el próximo paso es provider-admin capability, no otro `projects:create`.

## Bloqueo exacto

`NARROW_PROVIDER_ADMIN_PROJECT_CREATOR_AUTH_REQUIRED`

El bloqueo es de **capacidad administrativa de provisión**, no del producto CXOrbia. No hay P0 funcional nuevo y no se reabre I4.

## Qué falta para mover el porcentaje

I5 solo gana avance formal cuando exista un PREPROD nuevo/limpio materializado y UAT suficiente sobre la build congelada. Hasta entonces permanece 85%.

## Seguridad

0 PREPROD project creates exitosos; 0 PREPROD Hosting deploys; 0 PREPROD UAT; 0 Auth/Firestore/Storage/HR/Make/Gemini/payment writes; 0 merge; 0 production.
