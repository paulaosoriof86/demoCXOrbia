# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-11  
**Estado vivo:** `C6_LIVE_USER_ADMIN_CONTRACT_SOURCE_ONLY_PASS__OWNER_REFERENCES_RECEIVED__PROJECT_ENTITLEMENTS_PENDING__BACKEND_EXECUTABLE_PENDING__NO_PROVIDER__NO_REPAIR__NO_PRODUCTION`

## 1. Cerrado y protegido

- frontend acumulativo y módulos Phase A;
- freeze Auth v4 y Auth DEV 228;
- Activation/readback/rollback dry-run PASS;
- SKIP13, multi-Auth, HashConfig, direct runner y lifecycle de credencial;
- D preservado repair-ready;
- referencias empresariales A/B/C recibidas en conversación;
- acceso adicional de Operaciones recibido en conversación;
- contrato source-only de administración viva de usuarios cerrado PASS.

## 2. Pendiente vivo inmediato

Cerrar exclusivamente los scopes de proyecto de los cuatro accesos iniciales:

```text
A / Superadministración -> TYA_COMPLETE o SPECIFIC_PROJECTS
B / Administración      -> TYA_COMPLETE o SPECIFIC_PROJECTS
C / Operaciones          -> TYA_COMPLETE o SPECIFIC_PROJECTS
additional Ops user      -> TYA_COMPLETE o SPECIFIC_PROJECTS
```

No volver a pedir nombres, correos, UIDs, fingerprints ni cuentas técnicas.

## 3. Gap probado de producción — Usuarios & Permisos

La UI ya existe y es autoadministrable visualmente, pero hoy guarda usuarios/roles/permisos en `localStorage`. No existe todavía en `app/core/backend-firebase.js` el path vivo para crear/editar/deshabilitar Firebase Auth ni cambiar claims/scope.

Contrato ya cerrado:

```text
backend/contracts/c6-live-user-admin-v1.json
PASS_C6_LIVE_USER_ADMIN_CONTRACT_SOURCE_ONLY
```

Pendiente: backend executable/admin adapter y wiring localizado de la UI existente; sin rediseño.

Criterio de cierre:

```text
create user from authorized admin UI -> Auth + scope live
edit user -> live readback
change role/project scope -> live readback + RBAC
set inactive -> disabled/auditable, no default hard delete
reload/new tab -> state survives without localStorage authority
no hardcoded staff or projectIds
```

## 4. Ruta corta restante

1. scopes exactos A/B/C + acceso adicional Ops;
2. target claims/digests source-safe;
3. backend executable/admin adapter + wiring localizado;
4. repair focal A-D con snapshot/readback/rollback;
5. reconciliación HR final de producción;
6. smoke acumulativo multirol final;
7. validación humana/rollback ready;
8. autorización y único cutover;
9. smoke post-cutover/freeze.

Estos pasos permanecen absorbidos en M4-M10; no crean una nueva fase ni cambian el denominador.

## 5. Métrica estable

**Avance certificado: 73%. Restante: 27%.** M5a source-only contract = PASS.

## 6. No hacer

- no hardcodear staff;
- no persistir correos/credenciales;
- no reabrir 340 identidades/SKIP13/MultiAuth;
- no repetir PREWRITE/Activation general;
- no nueva candidata/rama/PR por rutina;
- no provider/repair antes de scopes exactos;
- no rediseñar `configuracion.js` desde backend;
- no deploy/merge/producción sin gate correspondiente.
