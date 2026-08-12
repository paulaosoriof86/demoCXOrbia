# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-12 13:42 -06:00  
**Estado:** `C6_LIVE_USER_ADMIN_FRONTEND_WIRING_SOURCE_IMPLEMENTED__RUNTIME_PROOF_PENDING__PHASE_A_88`

## Pendiente vivo único de continuidad

```text
C6_LIVE_USER_ADMIN_FRONTEND_WIRING_RUNTIME_READONLY_PROOF
→ M7
→ M8
→ M9
→ M10
```

## Wiring C6 ya implementado en source

- `app/adapters/tya-c6-live-user-admin-membership-wiring-v1.js` agregado.
- `app/index-backend-dev.html` carga el adapter en el orden correcto: Auth bridge → membership wiring → Firebase backend.
- Staff queda fail-closed contra la membresía canónica `tenants/tya/users/{uid}` antes del consumo backend.
- Validaciones: active, tenant, namespace, role, entitlement, projectIds, claimsDigest y providerUidFingerprint.
- Cero módulos UI tocados.
- Cero provider/Firestore writes nuevos y cero deploy.

## Ya no está pendiente

- C6 STAFF REPAIR/BOOTSTRAP EXACT WRITE V2: PASS, consumido, no segundo intento.
- Canonical/cumulative readback: PASS.
- Rollback verificable: preparado y no requerido.
- D technical-login rebase: PASS.
- Private execution handoff: PASS.
- Provider snapshot `31518927950`: PASS, no repetir por rutina.
- Auth340, SKIP13, MultiAuth, HR, M4/static: no reabrir sin drift reproducible.
- Diseño source del wiring claims→membership→RBAC: implementado.

## Pendiente frontend heredado, separado de C6

El gate R18A mantiene tres faltantes en `app/modules/cliente-extra.js`: PDF print, export XLSX y export PPTX. Se clasifica Claude/prototipo y no es causa del wiring ni motivo para reabrir Staff.

## Progreso

`M1=35/35 | M2=20/20 | M3=15/15 | M4=5/5 | M5=8/8 | M6=5/5 | M7=0/5 | M8=0/3 | M9=0/3 | M10=0/1`

**88% certificado | 12% restante. Delta certificado de esta iteración: +0%.**

El source avanzó materialmente, pero el porcentaje se mantiene hasta certificar en runtime DEV `Auth → membership → RBAC → frontend`.

## Claude / Academia

No pedir nueva candidata. No tocar el frontend desde backend. Academia se actualiza al certificar que el wiring cambia comportamiento visible de roles/administración; entonces revisar rutas, manuales, cursos, permisos y errores frecuentes.