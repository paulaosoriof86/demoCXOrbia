# Corte 6 — reconciliación Auth/RBAC read-only source-safe

- Fecha: 2026-07-30T16:01:34.268Z
- Firebase DEV canónico: `cxorbia-backend-dev`
- Tenant: `tya`
- Proyecto canónico: `cinepolis`
- Modo: read-only; provider writes=0; sin identidades ni PII exportadas.
- Semántica evaluada: exactamente la de firestore.rules vigente, no aliases históricos no autorizadores.

## Readiness agregado

- Auth users totales: 17
- Usuarios activos con password provider: 17
- Usuarios autorizables a tenant TyA por reglas actuales: 13
- Usuarios con proyecto canónico por projectIds[] (super cuenta global): 3
- Shopper claims con shopperId que coincide con perfil Firestore: 3
- Gaps tenantIds[] sin tenantId/tenants[]: 0
- Gaps projectId sin projectIds[]: 0
- Login operador listo bajo reglas actuales: 7
- Login cliente listo bajo reglas actuales: 0
- Login shopper listo bajo reglas actuales: 0
- Familias mínimas listas: no
- Claims legacy suficientes para visual DEV sin mutarlos: no

## Por rol — solo conteos

| Rol | Users | Password activos | Tenant por reglas | Proyecto por reglas | shopperId | Perfil shopper coincide | Gap tenant alias | Gap project alias | Secure read ready |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| admin | 3 | 3 | 2 | 0 | 0 | 0 | 0 | 0 | 2 |
| cliente | 2 | 2 | 2 | 0 | 0 | 0 | 0 | 0 | 0 |
| externo | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| missing | 2 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| ops | 2 | 2 | 2 | 0 | 0 | 0 | 0 | 0 | 2 |
| shopper | 4 | 4 | 4 | 0 | 3 | 3 | 0 | 0 | 0 |
| super | 3 | 3 | 3 | 3 | 0 | 0 | 0 | 0 | 3 |

## Distribución de scopes no PII

- admin: projectId={"tya":1}; projectIds={"tya":1,"tya-piloto":2}; tenantId={"tya":2,"otro-tenant":1}; tenants={}; tenantIds={"tya":1}
- cliente: projectId={"tya":1}; projectIds={"tya":1,"tya-piloto":1}; tenantId={"tya":2}; tenants={}; tenantIds={"tya":1}
- externo: projectId={"otro":1}; projectIds={"otro":1}; tenantId={"otro":1}; tenants={}; tenantIds={"otro":1}
- missing: projectId={}; projectIds={}; tenantId={}; tenants={}; tenantIds={}
- ops: projectId={"tya":1}; projectIds={"tya":1,"tya-piloto":1}; tenantId={"tya":2}; tenants={}; tenantIds={"tya":1}
- shopper: projectId={"tya":1}; projectIds={"tya":1,"tya-piloto":3}; tenantId={"tya":4}; tenants={}; tenantIds={"tya":1}
- super: projectId={"tya":1}; projectIds={"tya":1,"tya-piloto":2,"r1":1}; tenantId={"tya":3}; tenants={"tya":1}; tenantIds={"tya":1}

## Seguridad

- Auth/Firestore/Rules/Hosting/Storage writes: 0.
- Producción/merge: false.
- Los valores de scope aquí son IDs técnicos de tenant/proyecto, no identidades de personas.
- No se exportaron email, UID, nombre, teléfono, DPI, banco, contraseña, token ni shopperId.
