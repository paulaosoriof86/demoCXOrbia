# Corte 6 — reconciliación Auth/RBAC read-only source-safe

- Fecha: 2026-07-30T16:55:22.337Z
- Firebase DEV canónico: `cxorbia-backend-dev`
- Tenant: `tya`
- Proyecto canónico: `cinepolis`
- Modo: read-only; provider writes=0; sin identidades ni PII exportadas.
- Semántica evaluada: exactamente la de firestore.rules vigente, no aliases históricos no autorizadores.

## Readiness agregado

- Auth users totales: 17
- Usuarios activos con password provider: 17
- Usuarios autorizables a tenant TyA por reglas actuales: 13
- Usuarios con proyecto canónico por projectIds[] (super cuenta global): 8
- Shopper claims con shopperId que coincide con perfil Firestore: 3
- Shopper con perfil exacto por scopes legacy: {"cinepolis":3}
- Login operador listo bajo reglas actuales: 7
- Login cliente listo bajo reglas actuales: 2
- Login shopper listo bajo reglas actuales: 3
- Familias mínimas listas: sí

## Por rol — solo conteos

| Rol | Users | Password activos | Tenant por reglas | Proyecto por reglas | shopperId | Perfil shopper coincide | Secure read ready |
|---|---:|---:|---:|---:|---:|---:|---:|
| admin | 3 | 3 | 2 | 0 | 0 | 0 | 2 |
| cliente | 2 | 2 | 2 | 2 | 0 | 0 | 2 |
| externo | 1 | 1 | 0 | 0 | 0 | 0 | 0 |
| missing | 2 | 2 | 0 | 0 | 0 | 0 | 0 |
| ops | 2 | 2 | 2 | 0 | 0 | 0 | 2 |
| shopper | 4 | 4 | 4 | 3 | 3 | 3 | 3 |
| super | 3 | 3 | 3 | 3 | 0 | 0 | 3 |

## Distribución de scopes no PII

- admin: projectId={"tya":1}; projectIds={"tya":1,"tya-piloto":2}; tenantId={"tya":2,"otro-tenant":1}; tenants={}; tenantIds={"tya":1}
- cliente: projectId={"cinepolis":2}; projectIds={"cinepolis":2}; tenantId={"tya":2}; tenants={}; tenantIds={"tya":1}
- externo: projectId={"otro":1}; projectIds={"otro":1}; tenantId={"otro":1}; tenants={}; tenantIds={"otro":1}
- missing: projectId={}; projectIds={}; tenantId={}; tenants={}; tenantIds={}
- ops: projectId={"tya":1}; projectIds={"tya":1,"tya-piloto":1}; tenantId={"tya":2}; tenants={}; tenantIds={"tya":1}
- shopper: projectId={"cinepolis":3}; projectIds={"cinepolis":3,"tya-piloto":1}; tenantId={"tya":4}; tenants={}; tenantIds={"tya":1}
- super: projectId={"tya":1}; projectIds={"tya":1,"tya-piloto":2,"r1":1}; tenantId={"tya":3}; tenants={"tya":1}; tenantIds={"tya":1}

## Status canónico de visitas — agregado no PII

- Total: 616; status presente=616; estado presente=0
- status values: {"submitida":545,"cuestionario":61,"agendada":4,"realizada":3,"fuera_rango":3}
- estado values: {}
- 2025-06: total=44; status={"submitida":35,"cuestionario":9}; estado={}
- 2025-07: total=44; status={"submitida":39,"cuestionario":5}; estado={}
- 2025-08: total=44; status={"submitida":42,"cuestionario":1,"agendada":1}; estado={}
- 2025-09: total=44; status={"submitida":42,"cuestionario":2}; estado={}
- 2025-10: total=44; status={"submitida":30,"cuestionario":13,"realizada":1}; estado={}
- 2025-11: total=44; status={"submitida":37,"cuestionario":7}; estado={}
- 2025-12: total=44; status={"submitida":29,"cuestionario":14,"realizada":1}; estado={}
- 2026-01: total=44; status={"submitida":42,"cuestionario":2}; estado={}
- 2026-02: total=44; status={"submitida":43,"cuestionario":1}; estado={}
- 2026-03: total=44; status={"submitida":44}; estado={}
- 2026-04: total=44; status={"submitida":42,"cuestionario":2}; estado={}
- 2026-05: total=44; status={"submitida":44}; estado={}
- 2026-06: total=44; status={"submitida":44}; estado={}
- 2026-07: total=44; status={"submitida":32,"cuestionario":5,"agendada":3,"fuera_rango":3,"realizada":1}; estado={}

## Seguridad

- Auth/Firestore/Rules/Hosting/Storage writes: 0.
- Producción/merge: false.
- Los valores de scope/status son IDs/estados operativos, no identidades de personas.
- No se exportaron email, UID, nombre, teléfono, DPI, banco, contraseña, token ni shopperId.
