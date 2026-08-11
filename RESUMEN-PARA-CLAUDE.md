# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-10  
**Estado vivo:** `C6_AUTH_DUPLICATE_CANONICAL_REPLACEMENT_RESOLVED__ABC_CREATE_CANONICAL_REPLACEMENT_REQUIRED__D_KEEP_VALIDATED_EXTERNAL_CANONICAL_RETIRE_BOTH_HISTORICAL__ZERO_PROVIDER_READS__ZERO_WRITES__NO_PRODUCTION`

## 1. Fuente vigente

1. `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`;
2. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
3. `app/docs/SOURCE-LOCK-C6-AUTH-DUPLICATE-CANONICAL-REPLACEMENT-RESOLUTION-SOURCE-SAFE-20260810.md`;
4. `app/docs/evidence/C6-AUTH-DUPLICATE-CANONICAL-REPLACEMENT-RESOLUTION-SOURCE-SAFE-20260810.json`;
5. `app/docs/RESUMEN-PARA-CLAUDE-ADDENDUM-C6-AUTH-DUPLICATE-CANONICAL-REPLACEMENT-RESOLUTION-20260810.md`;
6. PR #7 y HEAD vivo.

## 2. No reabrir

- frontend acumulativo, Login, `/app/modules/*`, `/app/core/*` y `CX.data`;
- SKIP13, multi-Auth, target lineage `ac93...`;
- freeze Auth v4 340/HOLD=0;
- PREWRITE, Activation, readback y rollback dry-run;
- Auth DEV 228;
- `fd891...` cerrado sin acceso TyA efectivo.

## 3. Estado backend

```text
AuthUsersAfter=228
Activation=PASS
Readback=PASS
RollbackDryRun=PASS
1acd=CREATE_CANONICAL_REPLACEMENT_REQUIRED
2c4d=CREATE_CANONICAL_REPLACEMENT_REQUIRED
5422=CREATE_CANONICAL_REPLACEMENT_REQUIRED
ae2f=KEEP_VALIDATED_EXTERNAL_CANONICAL_RETIRE_BOTH_HISTORICAL
ProviderReadsCurrentBlock=0
RepairExecuted=false
Production=false
```

El import canónico histórico creó un `super` y dos `coordinador` bajo namespace `staff`, pero no creó `admin` ni `ops`. Para el grupo `1acd...` no existe mapping source-safe owner-level que permita afirmar que el `super` importado corresponde al owner del par; no se reutiliza por rol. Por tanto A–C requieren replacement canónico limpio. Para Cliente ya existe un principal canónico externo validado.

## 4. Claude/prototipo

No hacer selector de duplicados, fallback a legacy, copy técnico visible ni relajación de RBAC. La canonicalización es backend. Todo retiro futuro será `DISABLE_ONLY_NO_DELETE` después de canonical validation.

## 5. Siguiente bloque backend

`C6 AUTH DUPLICATE CANONICAL REPLACEMENT REPAIR PLAN — SOURCE-ONLY / NO EXECUTE`.

Preparar targets y gates de snapshot/idempotencia/readback/rollback. Sin provider ni repair hasta autorización separada.
