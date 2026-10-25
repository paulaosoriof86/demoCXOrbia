# PHASE A TRACKER — Addendum C6 one-target password rollback snapshot

**Fecha:** 2026-08-07  
**Corte:** 6 — Auth/RBAC

## Estado acumulado

```text
DirectRunnerDEV=PASS
SKIP13=13/13 CLOSED
MultiAuthAdjudication=CLOSED
FinalAuthPlan=340/340 HOLD0
AuthExecuted=false
PasswordRollbackSourceOnly=STOP_RETRY_TARGET_PRIOR_PASSWORD_NOT_PROVEN
OneTargetRollbackReadOnly=STOP_RETRY_TARGET_AUTH_RESOLUTION_COUNT_0
providerWrites=0
AuthWrites=0
production=false
```

## Avance real

El bloque redujo el bloqueo: ya no se trata genéricamente de hash/salt desconocido. La lectura focal comprobó que antes de evaluar esos campos falta una vinculación exacta entre el profile congelado y un único Auth record; el claim actual no sirve como único ancla porque está marcado para cambio.

## Preservado

Phase A funcional, histórico, HR, shoppers, certificaciones, visitas, liquidaciones/pagos, multi-proyecto, Portales, Finanzas, Reservas, `CX.data` y frontend permanecen intactos.

## Siguiente gate exacto

Bajo autorización separada: replay read-only focal de las anclas técnicas mínimas del resolver PREWRITE anterior para obtener exactamente un Auth candidate. Solo con `candidateCount=1` continuar a hash/salt/hashConfig y snapshot cifrado. Cero writes.

Auth Activation, smoke acumulativo y promoción continúan bloqueados hasta cerrar rollback exacto.
