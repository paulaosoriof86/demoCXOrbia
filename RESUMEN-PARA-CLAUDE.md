# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-10  
**Estado vivo:** `C6_AUTH_DUPLICATE_CANONICAL_REPLACEMENT_REPAIR_PLAN_PARTIAL_READY__ABC_CANONICAL_TARGET_INPUT_REQUIRED__D_REPAIR_READY__ZERO_PROVIDER_READS__ZERO_WRITES__NO_PRODUCTION`

## 1. Fuente vigente

1. `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`;
2. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
3. `app/docs/SOURCE-LOCK-C6-AUTH-DUPLICATE-CANONICAL-REPLACEMENT-REPAIR-PLAN-PARTIAL-READY-20260810.md`;
4. `app/docs/C6-AUTH-DUPLICATE-CANONICAL-REPLACEMENT-REPAIR-PLAN-SOURCE-ONLY-20260810.md`;
5. `app/docs/RESUMEN-PARA-CLAUDE-ADDENDUM-C6-AUTH-DUPLICATE-CANONICAL-REPAIR-PLAN-PARTIAL-READY-20260810.md`;
6. PR #7 y HEAD vivo.

## 2. No reabrir

- frontend acumulativo, Login, `/app/modules/*`, `/app/core/*` y `CX.data`;
- SKIP13, multi-Auth, target lineage `ac93...`;
- freeze Auth v4 340/HOLD=0;
- PREWRITE, Activation, readback y rollback dry-run históricos;
- Auth DEV 228;
- `fd891...` cerrado sin acceso TyA efectivo.

## 3. Estado backend

```text
AuthUsersAfter=228
1acd=CANONICAL_TARGET_INPUT_REQUIRED
2c4d=CANONICAL_TARGET_INPUT_REQUIRED
5422=CANONICAL_TARGET_INPUT_REQUIRED
ae2f=REPAIR_PLAN_READY
FutureAuthWritesHardCap=14
ProviderReadsCurrentBlock=0
RepairExecuted=false
Production=false
```

A–C ya tienen contrato técnico (`role` exacto, `authNamespace=staff`, `tenantId=tya`) pero falta owner anchor y project entitlement source-safe. No asumir `cinepolis`, no copiar scope legacy y no seleccionar keeper. D conserva el Cliente canónico externo validado; solo queda retiro reversible de históricos bajo futura autorización.

## 4. Claude/prototipo

No hacer selector de duplicados, fallback a legacy, copy técnico visible, pantalla adicional ni relajación de RBAC. La canonicalización es backend. No exponer fingerprints, claims o estados internos.

## 5. Siguiente bloque backend

`C6 AUTH DUPLICATE CANONICAL TARGET INPUT RESOLUTION — SOURCE-SAFE / NO PROVIDER / NO REPAIR`.

Resolver únicamente inputs A–C desde fuentes source-safe. D no se reabre. Sin frontend changes.
