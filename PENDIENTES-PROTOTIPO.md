# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-11  
**Estado vivo:** `C6_AUTH_CANONICAL_STAFF_OWNER_INPUT_PARTIAL_CAPTURED__PROJECT_ENTITLEMENTS_PENDING__NO_PROVIDER__NO_REPAIR__NO_PRODUCTION`

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

## 3. Autoadministrabilidad

Los usuarios iniciales no pueden quedar hardcodeados. Deben existir como datos vivos administrables desde la plataforma bajo RBAC. Se requiere poder crear, editar, cambiar rol/scope y deshabilitar usuarios preservando auditoría. La eliminación física no debe ser la acción normal.

Antes de pedir cambio frontend, verificar la superficie existente de administración de usuarios. Si ya cubre CRUD/disable/role/scope, no tocar UI. Si existe gap reproducible, documentarlo por archivo/módulo para Claude.

## 4. Ruta corta restante

1. scopes exactos A/B/C + acceso adicional Ops;
2. target claims/digests source-safe;
3. repair focal A-D con snapshot/readback/rollback;
4. reconciliación HR final de producción;
5. smoke acumulativo multirol final;
6. validación humana/rollback ready;
7. autorización y único cutover;
8. smoke post-cutover/freeze.

## 5. Métrica estable

**Avance certificado: 72%. Restante: 28%.** No recalcular el denominador en sesiones futuras; solo sumar puntos con evidencia terminal.

## 6. No hacer

- no hardcodear staff;
- no persistir correos/credenciales;
- no reabrir 340 identidades/SKIP13/MultiAuth;
- no repetir PREWRITE/Activation general;
- no nueva candidata/rama/PR;
- no provider/repair antes de scopes exactos;
- no deploy/merge/producción sin gate correspondiente.
