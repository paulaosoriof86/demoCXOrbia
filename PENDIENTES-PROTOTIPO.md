# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-11  
**Estado vivo:** `C6_AUTH_CANONICAL_STAFF_OWNER_INPUT_PARTIAL_CAPTURED__PROJECT_ENTITLEMENTS_PENDING__LIVE_USER_ADMIN_BACKEND_GAP_PROVEN__NO_PROVIDER__NO_REPAIR__NO_PRODUCTION`

## 1. Cerrado y protegido

- frontend acumulativo y módulos Phase A;
- freeze Auth v4 y Auth DEV 228;
- Activation/readback/rollback dry-run PASS;
- SKIP13, multi-Auth, HashConfig, direct runner y lifecycle de credencial;
- D preservado repair-ready;
- referencias empresariales A/B/C recibidas en conversación;
- acceso adicional de Operaciones recibido en conversación.

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

Este gap bloquea producción porque el requisito vigente exige datos vivos administrables. No requiere rediseño: debe resolverse con backend/contrato y un ajuste localizado del módulo existente.

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
3. contrato/backend de administración viva + wiring localizado del módulo existente;
4. repair focal A-D con snapshot/readback/rollback;
5. reconciliación HR final de producción;
6. smoke acumulativo multirol final;
7. validación humana/rollback ready;
8. autorización y único cutover;
9. smoke post-cutover/freeze.

Estos pasos permanecen absorbidos en M4-M10; no crean una nueva fase ni cambian el denominador.

## 5. Métrica estable

**Avance certificado: 72%. Restante: 28%.** No recalcular el denominador en sesiones futuras; solo sumar puntos con evidencia terminal.

## 6. No hacer

- no hardcodear staff;
- no persistir correos/credenciales;
- no reabrir 340 identidades/SKIP13/MultiAuth;
- no repetir PREWRITE/Activation general;
- no nueva candidata/rama/PR por rutina;
- no provider/repair antes de scopes exactos;
- no rediseñar `configuracion.js` desde backend;
- no deploy/merge/producción sin gate correspondiente.
