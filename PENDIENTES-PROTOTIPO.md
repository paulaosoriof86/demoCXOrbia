# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-10  
**Estado vivo:** `C6_AUTH_DUPLICATE_CANONICAL_REPLACEMENT_RESOLVED__ABC_CREATE_CANONICAL_REPLACEMENT_REQUIRED__D_KEEP_VALIDATED_EXTERNAL_CANONICAL_RETIRE_BOTH_HISTORICAL__ZERO_PROVIDER_READS__ZERO_WRITES__NO_PRODUCTION`

## 1. Fuente de verdad

1. `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`;
2. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
3. `app/docs/SOURCE-LOCK-C6-AUTH-DUPLICATE-CANONICAL-REPLACEMENT-RESOLUTION-SOURCE-SAFE-20260810.md`;
4. `app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-C6-AUTH-DUPLICATE-CANONICAL-REPLACEMENT-RESOLUTION-20260810.md`;
5. PR #7 y HEAD vivo.

## 2. Cerrado y protegido

- frontend acumulativo y módulos Phase A;
- freeze Auth v4 340/HOLD=0;
- Auth DEV 228, Activation/readback/rollback dry-run PASS;
- SKIP13, multi-Auth, `ac93...`, HashConfig y lifecycle de credencial;
- provider one-read anterior consumido;
- `fd891...` cerrado sin acceso TyA efectivo;
- ownership por fingerprints ya no se traslada a Paula;
- 20/20 superficies Phase A source-side.

## 3. Pendiente vivo

```text
1acdcb3782b7cf351056 = CREATE_CANONICAL_REPLACEMENT_REQUIRED
2c4d19f2b066835473d3 = CREATE_CANONICAL_REPLACEMENT_REQUIRED
54225792eeb65f6739c0 = CREATE_CANONICAL_REPLACEMENT_REQUIRED
ae2f920fe6d9ce1fdd82 = KEEP_VALIDATED_EXTERNAL_CANONICAL_RETIRE_BOTH_HISTORICAL
```

A–C necesitan un principal canónico limpio por owner antes de cualquier retiro. D ya tiene principal canónico externo validado.

## 4. No hacer

- no pedir a Paula escoger fingerprints;
- no promover principals legacy por rol;
- no provider read sin autorización;
- no PREWRITE/Activation ni repair todavía;
- no frontend workaround ni relajación RBAC;
- no deletes: retiro futuro `DISABLE_ONLY_NO_DELETE`;
- no deploy, merge ni producción.

## 5. Ruta corta

Preparar `C6 AUTH DUPLICATE CANONICAL REPLACEMENT REPAIR PLAN — SOURCE-ONLY / NO EXECUTE` con targets y gates exactos. Después, solo bajo autorización expresa, ejecutar un repair focal con snapshot, idempotencia, readback y rollback dry-run.

## 6. Seguridad

Bloque actual: providerReads0, Auth/IAM/Firestore/HR/Rules/Storage writes0, repair=false, deploy0, merge=false, production=false.
