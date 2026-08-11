# CAMBIOS-BACKEND.md

**Última actualización:** 2026-08-10  
**Fuente operativa vigente:** `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`.

## Estado actual

`C6_AUTH_DUPLICATE_CANONICAL_REPLACEMENT_REPAIR_PLAN_PARTIAL_READY__ABC_CANONICAL_TARGET_INPUT_REQUIRED__D_REPAIR_READY__ZERO_PROVIDER_READS__ZERO_WRITES__NO_PRODUCTION`

El detalle acumulativo está en:

- `app/docs/CAMBIOS-BACKEND-ADDENDUM-C6-AUTH-DUPLICATE-CANONICAL-REPAIR-PLAN-PARTIAL-READY-20260810.md`;
- `app/docs/SOURCE-LOCK-C6-AUTH-DUPLICATE-CANONICAL-REPLACEMENT-REPAIR-PLAN-PARTIAL-READY-20260810.md`;
- `app/docs/C6-AUTH-DUPLICATE-CANONICAL-REPLACEMENT-REPAIR-PLAN-SOURCE-ONLY-20260810.md`;
- `app/docs/evidence/C6-AUTH-DUPLICATE-CANONICAL-REPLACEMENT-REPAIR-PLAN-SOURCE-ONLY-20260810.json`.

## Resumen vigente

Auth DEV permanece en 228 usuarios con Activation/readback/rollback dry-run PASS. El repair plan ya define contrato canónico, credencial efímera, collision gate, snapshot, idempotencia, readback, rollback dry-run y write budget. A–C quedan `CANONICAL_TARGET_INPUT_REQUIRED` porque la evidencia source-safe no contiene owner anchor ni project entitlement exacto; no se infiere `cinepolis` ni se promueve ningún legacy. D queda `REPAIR_PLAN_READY` sobre el Cliente canónico externo validado.

Hard cap futuro completo: 14 Auth writes, 0 deletes y 0 Firestore/IAM/HR/Rules/Storage writes. En el bloque actual: providerReads0, writes0, repair=false, deploy0, merge=false, production=false.

## Siguiente acción exacta

`C6 AUTH DUPLICATE CANONICAL TARGET INPUT RESOLUTION — SOURCE-SAFE / NO PROVIDER / NO REPAIR`.

Resolver únicamente los inputs canónicos A–C; D no se reabre. No ejecutar provider ni repair sin autorización separada.
