# CAMBIOS-BACKEND.md

**Última actualización:** 2026-08-11  
**Fuente operativa vigente:** `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`.

## Estado actual

`C6_AUTH_CANONICAL_STAFF_OWNER_INPUT_PARTIAL_CAPTURED__PROJECT_ENTITLEMENTS_PENDING__LIVE_USER_ADMIN_BACKEND_GAP_PROVEN__NO_PROVIDER__NO_REPAIR__NO_PRODUCTION`

## Avance del bloque 2026-08-11

- Se recibieron en conversación las referencias empresariales para A/Superadministración, B/Administración, C/Operaciones y un acceso adicional de Operaciones.
- No se vuelven a solicitar esas referencias humanas.
- No se persisten correos ni credenciales en configuración ejecutable.
- Los usuarios staff iniciales se clasifican como bootstrap de datos vivos, no como constantes del frontend/backend.
- Queda obligatorio que usuarios, roles y scopes sean administrables desde la plataforma bajo RBAC.
- El pendiente mínimo para cerrar M4 es el alcance de proyecto de los cuatro accesos: `TYA_COMPLETE` o `SPECIFIC_PROJECTS`.

## Hallazgo reproducible — administración de usuarios todavía no está conectada a backend vivo

`app/modules/configuracion.js` ya tiene la superficie aprobada de **Usuarios & Permisos**: invita usuarios, edita nombre/correo, cambia rol, activa/desactiva, asigna país/proyecto y edita matrices de permisos. Sin embargo, la persistencia actual usa `localStorage` (`cx_users`, `cx_custom_roles`, `cx_perm`) y la invitación se declara como vista previa.

`app/core/backend-firebase.js` persiste actualmente proyectos, shoppers y visitas, pero no expone create/update/disable de usuarios Firebase Auth ni actualización de claims/scope.

Resultado:

```text
LIVE_USER_ADMIN_UI_EXISTS=true
LIVE_USER_ADMIN_BACKEND=false
LOCALSTORAGE_PREVIEW_ONLY=true
PRODUCTION_BLOCKER=true
```

No se rediseña UI ni se reabre Auth V4. El cierre se incorpora dentro de M5 mediante contrato/backend administrable y un ajuste frontend localizado por archivo/módulo, preservando el prototipo.

## Corrección inmediata de higiene source-safe

El primer commit documental de esta sesión (`9013be65f1e06628343aa796b7deeb2746dbb08a`) incluyó transitoriamente referencias humanas en texto del checkpoint. Se corrigió inmediatamente en `b9178b318f97a7e7b8459d4b275e6b0988cb35d2`, eliminándolas del contenido vivo y manteniendo correos/credenciales fuera del repo.

No se afirma borrado de historia Git: el commit anterior sigue formando parte del historial de la rama. No se hará history rewrite/force push sin autorización expresa y porque el lock vigente prohíbe `force`.

## Métrica estable de cierre

```text
M1 Baseline/Phase A preservada                     35 = COMPLETE
M2 Auth V4 activation/readback/rollback            20 = COMPLETE
M3 SKIP13/MultiAuth/HashConfig/direct runner       15 = COMPLETE
M4 Owners + exact project entitlements              5 = PARTIAL
M5 Staff repair/bootstrap + live admin + rollback   8 = PENDING
M6 HR final production evidence                     5 = PENDING
M7 Final accumulative multirole smoke               5 = PENDING
M8 Human validation + rollback ready                3 = PENDING
M9 Explicit cutover + one production promotion      3 = PENDING
M10 Post-cutover smoke + freeze                      1 = PENDING
```

**Avance certificado: 72%. Restante: 28%.** El denominador queda congelado; el gap de usuarios se absorbe dentro de M5 y no crea una nueva fase.

## Siguiente acción exacta

Cerrar los cuatro scopes empresariales y ejecutar:

`C6 STAFF TARGET DIGEST + LIVE USER ADMIN BACKEND CONTRACT — SOURCE-SAFE / NO PROVIDER / NO REPAIR`.

No provider, Auth write, Firestore write, deploy, merge ni producción hasta cerrar scopes exactos y gate source-only.
