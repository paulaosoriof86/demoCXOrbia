# PENDIENTES PROTOTIPO — C6 AUTH DUPLICATE CANONICAL TARGET INPUT RESOLUTION

**Fecha:** 2026-08-10

## Pendiente backend vivo

```text
1acd... = OWNER_ANCHOR_REQUIRED + PROJECT_ENTITLEMENT_REQUIRED
2c4d... = OWNER_ANCHOR_REQUIRED + PROJECT_ENTITLEMENT_REQUIRED + CREDENTIAL_INPUT_REQUIRED
542...  = OWNER_ANCHOR_REQUIRED + PROJECT_ENTITLEMENT_REQUIRED + CREDENTIAL_INPUT_REQUIRED
ae2f...  = REPAIR_PLAN_READY (preservado, no reabierto)
```

A conserva un posible credential path canónico `super`, pero su reutilización está bloqueada hasta demostrar owner association independiente. B/C requieren credencial nueva efímera en una futura ejecución autorizada.

## No hacer

- no pedir a Paula seleccionar fingerprints legacy;
- no inferir owner por rol, orden o antigüedad;
- no copiar scope de legacy ni asumir `cinepolis`;
- no provider read ni repair;
- no frontend workaround ni relajación RBAC;
- no deletes; retiro futuro `DISABLE_ONLY_NO_DELETE`.

## Ruta corta

Crear únicamente el contrato mínimo source-safe de owner/scope/credencial A–C y resolver esos inputs empresariales sin PII en repo. Después, con targets exactos y digests cerrados, podrá autorizarse el repair focal.
