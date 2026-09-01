# PENDIENTES PROTOTIPO — Addendum C6 preparación final Auth y smoke

**Fecha:** 2026-08-06

## Cerrado

- freeze criptográfico del plan Auth de 340 filas;
- `HOLD=0` y SKIP13 preservado;
- contrato idempotente pre-write;
- manifest de snapshot/rollback;
- matriz acumulativa de smoke Admin/Operaciones, Shopper y Cliente;
- vinculación con `PROMOTE_EXISTING_CLEAN_PROJECT`.

## P0 vigente de Auth

```text
decision=HOLD_C6_AUTH_PREWRITE_SKIPPED_ACCESS_RISK_UNRESOLVED
blockingFingerprint=7cc28c78de9bfda01d14
Auth candidates=2
enabled=2
emailVerified=2
```

Siguiente evidencia exacta: lectura Auth/membership/claims limitada únicamente a los 13 fingerprints omitidos. No autoriza cambios ni ejecución del repair.

## P0 HR separado

El request `ac2032ec...` permanece sin evidencia terminal. No emitir segundo trigger.

## Después de ambos cierres

1. autorización separada para snapshot y repair Auth;
2. readback e idempotencia;
3. smoke acumulativo;
4. validación humana y rollback listo;
5. autorización específica de cutover.

## Seguridad

Cero provider/HR/Firestore/Auth/Rules/Storage writes, deploy, merge o producción.
