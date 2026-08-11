# PENDIENTES PROTOTIPO — ADDENDUM C6 AUTH DUPLICATE CANONICAL REPAIR PLAN

**Fecha:** 2026-08-10

## Pendiente backend vivo

```text
1acd... = CANONICAL_TARGET_INPUT_REQUIRED
2c4d... = CANONICAL_TARGET_INPUT_REQUIRED
542...  = CANONICAL_TARGET_INPUT_REQUIRED
ae2f... = REPAIR_PLAN_READY
```

A–C requieren source-safe owner anchor + project entitlement + input de credencial efímero antes de cualquier create. D ya tiene canónico validado y solo requiere retiro reversible posterior de ambos históricos.

## No hacer

- no seleccionar un legacy como keeper;
- no asumir `cinepolis` como scope de A–C;
- no provider read en el bloque actual;
- no Auth/Firestore/HR/IAM/Rules/Storage writes;
- no repair, smoke, deploy, merge o producción;
- no parche frontend ni relajación RBAC.

## Ruta corta

Resolver source-safe únicamente los inputs canónicos A–C. Después preparar/autorizAR una sola ejecución focal con hard cap de 14 Auth writes y `DISABLE_ONLY_NO_DELETE`.
