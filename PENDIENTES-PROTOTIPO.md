# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-10  
**Estado vivo:** `C6_AUTH_DUPLICATE_CANONICAL_TARGET_INPUT_RESOLUTION_COMPLETE__A_OWNER_ANCHOR_AND_PROJECT_ENTITLEMENT_REQUIRED__BC_OWNER_ANCHOR_PROJECT_ENTITLEMENT_CREDENTIAL_INPUT_REQUIRED__D_PRESERVED_REPAIR_READY__ZERO_PROVIDER_READS__ZERO_WRITES__NO_PRODUCTION`

## 1. Fuente de verdad

1. `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`;
2. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
3. `app/docs/SOURCE-LOCK-C6-AUTH-DUPLICATE-CANONICAL-TARGET-INPUT-RESOLUTION-REQUIRED-20260810.md`;
4. `app/docs/evidence/C6-AUTH-DUPLICATE-CANONICAL-TARGET-INPUT-RESOLUTION-SOURCE-SAFE-20260810.json`;
5. `app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-C6-AUTH-DUPLICATE-CANONICAL-TARGET-INPUT-RESOLUTION-20260810.md`;
6. PR #7 y HEAD vivo.

## 2. Cerrado y protegido

- frontend acumulativo y módulos Phase A;
- freeze Auth v4 y Auth DEV 228;
- Activation/readback/rollback dry-run PASS;
- SKIP13, multi-Auth, `ac93...`, HashConfig y lifecycle de credencial;
- ownership por fingerprints no se traslada a Paula;
- repair gates/write budget ya definidos;
- D `ae2f...` preservado `REPAIR_PLAN_READY`.

## 3. Pendiente vivo

```text
1acd... = OWNER_ANCHOR_REQUIRED + PROJECT_ENTITLEMENT_REQUIRED
2c4d... = OWNER_ANCHOR_REQUIRED + PROJECT_ENTITLEMENT_REQUIRED + CREDENTIAL_INPUT_REQUIRED
542...  = OWNER_ANCHOR_REQUIRED + PROJECT_ENTITLEMENT_REQUIRED + CREDENTIAL_INPUT_REQUIRED
```

A tiene un posible credential path canónico `super`, pero solo puede reutilizarse si una owner anchor independiente prueba asociación exacta. B/C necesitan credencial nueva efímera. Falta entitlement exacto A–C y por eso no existe expected-claims digest todavía.

## 4. No hacer

- no pedir a Paula escoger fingerprints;
- no promover principals legacy por rol;
- no inferir owner por orden/antigüedad;
- no copiar scope legacy ni asumir `cinepolis`;
- no provider read sin autorización;
- no PREWRITE/Activation/repair;
- no frontend workaround ni relajación RBAC;
- no deletes; retiro futuro `DISABLE_ONLY_NO_DELETE`;
- no deploy, merge ni producción.

## 5. Ruta corta

Crear un contrato mínimo source-safe para capturar owner anchor + entitlement exacto A–C y estrategia de credencial sin PII en repo. Después cerrar targets/digests y, bajo autorización separada, ejecutar repair focal.

## 6. Seguridad

Provider reads 0 y todos los data/provider writes 0; repair=false, deploy0, merge=false, production=false.
