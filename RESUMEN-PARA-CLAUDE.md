# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-10  
**Estado vivo:** `C6_AUTH_DUPLICATE_CANONICAL_TARGET_INPUT_RESOLUTION_COMPLETE__A_OWNER_ANCHOR_AND_PROJECT_ENTITLEMENT_REQUIRED__BC_OWNER_ANCHOR_PROJECT_ENTITLEMENT_CREDENTIAL_INPUT_REQUIRED__D_PRESERVED_REPAIR_READY__ZERO_PROVIDER_READS__ZERO_WRITES__NO_PRODUCTION`

## 1. Fuente vigente

1. `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`;
2. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
3. `app/docs/SOURCE-LOCK-C6-AUTH-DUPLICATE-CANONICAL-TARGET-INPUT-RESOLUTION-REQUIRED-20260810.md`;
4. `app/docs/evidence/C6-AUTH-DUPLICATE-CANONICAL-TARGET-INPUT-RESOLUTION-SOURCE-SAFE-20260810.json`;
5. `app/docs/RESUMEN-PARA-CLAUDE-ADDENDUM-C6-AUTH-DUPLICATE-CANONICAL-TARGET-INPUT-RESOLUTION-20260810.md`;
6. PR #7 y HEAD vivo.

## 2. No reabrir

- frontend acumulativo, Login, `/app/modules/*`, `/app/core/*` y `CX.data`;
- SKIP13, multi-Auth, target lineage `ac93...`;
- freeze Auth v4 y Auth DEV 228;
- PREWRITE/Activation/smoke históricos;
- D `ae2f...` ya `REPAIR_PLAN_READY`;
- `fd891...` cerrado sin acceso TyA efectivo.

## 3. Estado backend

```text
AuthUsersAfter=228
1acd=OWNER_ANCHOR_REQUIRED+PROJECT_ENTITLEMENT_REQUIRED
2c4d=OWNER_ANCHOR_REQUIRED+PROJECT_ENTITLEMENT_REQUIRED+CREDENTIAL_INPUT_REQUIRED
5422=OWNER_ANCHOR_REQUIRED+PROJECT_ENTITLEMENT_REQUIRED+CREDENTIAL_INPUT_REQUIRED
ae2f=REPAIR_PLAN_READY_PRESERVED
ProviderReadsCurrentBlock=0
RepairExecuted=false
Production=false
```

A conserva un posible credential path canónico `super`, pero no puede asociarse a su owner por unicidad de rol. B/C no tienen principal canónico importado de sus roles y necesitarán credencial nueva efímera. Ningún target A–C tiene expected-claims digest todavía porque falta entitlement owner-specific.

## 4. Claude/prototipo

No hacer selector de duplicados, fallback legacy, copy técnico visible, pantalla adicional ni relajación de RBAC. No exponer fingerprints, claims o inputs internos y no asumir `cinepolis` para staff.

## 5. Siguiente bloque backend

`C6 AUTH CANONICAL STAFF MINIMUM OWNER INPUT CONTRACT — SOURCE-SAFE / NO PROVIDER / NO REPAIR`.

Definir inputs mínimos A–C sin PII en repo. Sin frontend changes.
