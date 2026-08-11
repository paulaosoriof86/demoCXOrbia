# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-11  
**Estado vivo:** `C6_HR_LIVE_DIRECT_READ_PASS__LIVE_USER_ADMIN_CONTRACT_SOURCE_ONLY_PASS__PROJECT_ENTITLEMENTS_PENDING__BACKEND_EXECUTABLE_PENDING__NO_REPAIR__NO_PRODUCTION`

## 1. Cerrado y protegido

- frontend acumulativo y módulos Phase A;
- freeze Auth v4 y Auth DEV 228;
- Activation/readback/rollback dry-run PASS;
- SKIP13, multi-Auth, HashConfig, direct runner y lifecycle de credencial;
- D preservado repair-ready;
- referencias empresariales A/B/C recibidas;
- acceso adicional de Operaciones recibido;
- contrato source-only de administración viva de usuarios cerrado PASS;
- **HR viva actual cerrada M6: agosto 2026 = 34 GT + 10 HN = 44**.

## 2. HR ya no es pendiente

La clasificación anterior `reconciliación HR final de producción` fue retirada. El antiguo bloqueo era de observabilidad del workflow, no de mapeo o conexión de la HR.

Fuente compartida leída directamente el 2026-08-11, GT/HN correctos, 44 filas actuales. No pedir otra exportación, enlace ni remapeo.

Pendiente posterior relacionado con HR: únicamente que M7 verifique que el build final multirol consume la misma fuente viva. No crear un bloque HR separado.

## 3. Pendiente vivo inmediato

Cerrar exclusivamente los scopes de proyecto de los cuatro accesos iniciales:

```text
A / Superadministración -> TYA_COMPLETE o SPECIFIC_PROJECTS
B / Administración      -> TYA_COMPLETE o SPECIFIC_PROJECTS
C / Operaciones          -> TYA_COMPLETE o SPECIFIC_PROJECTS
additional Ops user      -> TYA_COMPLETE o SPECIFIC_PROJECTS
```

No volver a pedir nombres, correos, UIDs, fingerprints ni cuentas técnicas.

## 4. Gap probado de producción — Usuarios & Permisos

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

## 5. Ruta corta restante

1. scopes exactos A/B/C + acceso adicional Ops;
2. target claims/digests source-safe;
3. backend executable/admin adapter + wiring localizado;
4. repair focal A-D con snapshot/readback/rollback;
5. smoke acumulativo multirol final M7 contra la HR viva ya cerrada;
6. validación humana/rollback ready;
7. autorización y único cutover;
8. smoke post-cutover/freeze.

## 6. Métrica estable

**Avance certificado: 78%. Restante: 22%.** M6 = COMPLETE 5/5.

## 7. No hacer

- no hardcodear staff;
- no persistir correos/credenciales;
- no reabrir 340 identidades/SKIP13/MultiAuth;
- no repetir PREWRITE/Activation general;
- no volver a mapear HR ni pedir su enlace;
- no nueva candidata/rama/PR por rutina;
- no repair Auth antes de scopes exactos;
- no rediseñar `configuracion.js` desde backend;
- no deploy/merge/producción sin gate correspondiente.