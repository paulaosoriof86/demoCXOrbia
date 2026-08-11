# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-10  
**Estado vivo:** `C6_AUTH_DUPLICATE_CANONICAL_REPLACEMENT_REPAIR_PLAN_PARTIAL_READY__ABC_CANONICAL_TARGET_INPUT_REQUIRED__D_REPAIR_READY__ZERO_PROVIDER_READS__ZERO_WRITES__NO_PRODUCTION`

## 1. Fuente de verdad

1. `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`;
2. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
3. `app/docs/SOURCE-LOCK-C6-AUTH-DUPLICATE-CANONICAL-REPLACEMENT-REPAIR-PLAN-PARTIAL-READY-20260810.md`;
4. `app/docs/C6-AUTH-DUPLICATE-CANONICAL-REPLACEMENT-REPAIR-PLAN-SOURCE-ONLY-20260810.md`;
5. `app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-C6-AUTH-DUPLICATE-CANONICAL-REPAIR-PLAN-PARTIAL-READY-20260810.md`;
6. PR #7 y HEAD vivo.

## 2. Cerrado y protegido

- frontend acumulativo y módulos Phase A;
- freeze Auth v4 340/HOLD=0;
- Auth DEV 228, Activation/readback/rollback dry-run PASS;
- SKIP13, multi-Auth, `ac93...`, HashConfig y lifecycle de credencial;
- provider one-read anterior consumido;
- `fd891...` cerrado sin acceso TyA efectivo;
- ownership por fingerprints no se traslada a Paula;
- canonical replacement policy A–D cerrada;
- repair gates y write budget ya definidos.

## 3. Pendiente vivo

```text
1acdcb3782b7cf351056 = CANONICAL_TARGET_INPUT_REQUIRED
2c4d19f2b066835473d3 = CANONICAL_TARGET_INPUT_REQUIRED
54225792eeb65f6739c0 = CANONICAL_TARGET_INPUT_REQUIRED
ae2f920fe6d9ce1fdd82 = REPAIR_PLAN_READY
```

A–C: falta owner anchor y project entitlement source-safe; el credential input será efímero al ejecutar y nunca repo/log. D: Cliente canónico externo validado, listo para plan de retiro reversible de históricos.

## 4. No hacer

- no pedir a Paula escoger fingerprints;
- no promover principals legacy por rol;
- no asumir `cinepolis` para A–C;
- no provider read sin autorización;
- no PREWRITE/Activation ni repair todavía;
- no frontend workaround ni relajación RBAC;
- no deletes: retiro futuro `DISABLE_ONLY_NO_DELETE`;
- no deploy, merge ni producción.

## 5. Ruta corta

Resolver source-safe únicamente los inputs canónicos A–C. Después, si todos quedan exactos, una futura ejecución completa tendrá hard cap de 14 Auth writes, 0 deletes y 0 Firestore/IAM/HR/Rules/Storage writes.

## 6. Seguridad

Bloque actual: providerReads0, Auth/IAM/Firestore/HR/Rules/Storage writes0, repair=false, deploy0, merge=false, production=false.
