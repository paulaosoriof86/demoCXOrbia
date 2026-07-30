# Corte 6 — reconciliación Auth/RBAC read-only source-safe

- Fecha: 2026-07-30T15:48:07.021Z
- Firebase DEV canónico: `cxorbia-backend-dev`
- Tenant: `tya`
- Proyecto canónico: `cinepolis`
- Modo: read-only; provider writes=0; sin identidades ni PII exportadas.

## Readiness agregado

- Auth users totales: 17
- Usuarios activos con password provider: 17
- Usuarios con alcance tenant TyA: 13
- Usuarios con alcance proyecto canónico (super cuenta como alcance global): 3
- Shopper claims con shopperId que coincide con perfil Firestore: 3
- Login operador listo bajo reglas actuales: 7
- Login cliente listo bajo reglas actuales: 0
- Login shopper listo bajo reglas actuales: 0
- Familias mínimas listas: no
- Claims legacy suficientes para visual DEV sin mutarlos: no

## Por rol — solo conteos

| Rol | Users | Password activos | Tenant TyA | Proyecto canónico | shopperId | Perfil shopper coincide | Secure read ready |
|---|---:|---:|---:|---:|---:|---:|---:|
| admin | 3 | 3 | 2 | 0 | 0 | 0 | 2 |
| cliente | 2 | 2 | 2 | 0 | 0 | 0 | 0 |
| externo | 1 | 1 | 0 | 0 | 0 | 0 | 0 |
| missing | 2 | 2 | 0 | 0 | 0 | 0 | 0 |
| ops | 2 | 2 | 2 | 0 | 0 | 0 | 2 |
| shopper | 4 | 4 | 4 | 0 | 3 | 3 | 0 |
| super | 3 | 3 | 3 | 3 | 0 | 0 | 3 |

## Seguridad

- Auth/Firestore/Rules/Hosting/Storage writes: 0.
- Producción/merge: false.
- No se exportaron email, UID, nombre, teléfono, DPI, banco, contraseña, token ni shopperId.
