# CAMBIOS-BACKEND.md

**Última actualización:** 2026-08-11  
**Fuente operativa vigente:** `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`.

## Estado actual

`C6_LIVE_USER_ADMIN_CONTRACT_SOURCE_ONLY_PASS__OWNER_REFERENCES_RECEIVED__PROJECT_ENTITLEMENTS_PENDING__BACKEND_EXECUTABLE_PENDING__NO_PROVIDER__NO_REPAIR__NO_PRODUCTION`

## Avance del bloque 2026-08-11

- Se recibieron en conversación las referencias empresariales para A/Superadministración, B/Administración, C/Operaciones y un acceso adicional de Operaciones.
- No se vuelven a solicitar esas referencias humanas.
- No se persisten correos ni credenciales en configuración ejecutable.
- Los usuarios staff iniciales se clasifican como bootstrap de datos vivos, no como constantes del frontend/backend.
- Queda obligatorio que usuarios, roles y scopes sean administrables desde la plataforma bajo RBAC.
- El pendiente mínimo para cerrar M4 es el alcance de proyecto de los cuatro accesos: `TYA_COMPLETE` o `SPECIFIC_PROJECTS`.

## Hallazgo reproducible — administración de usuarios

`app/modules/configuracion.js` ya tiene la superficie aprobada de **Usuarios & Permisos**: invita usuarios, edita, cambia rol, activa/desactiva, asigna país/proyecto y edita matrices. La persistencia actual usa `localStorage` (`cx_users`, `cx_custom_roles`, `cx_perm`) y la invitación es vista previa.

`app/core/backend-firebase.js` persiste proyectos, shoppers y visitas, pero no expone create/update/disable de Firebase Auth ni actualización de claims/scope.

```text
LIVE_USER_ADMIN_UI_EXISTS=true
LIVE_USER_ADMIN_BACKEND=false
LOCALSTORAGE_PREVIEW_ONLY=true
PRODUCTION_BLOCKER=true
```

## Contrato source-only cerrado PASS

Se creó y corrigió sintácticamente dentro del mismo bloque:

```text
backend/contracts/c6-live-user-admin-v1.json
app/docs/SOURCE-LOCK-C6-LIVE-USER-ADMIN-CONTRACT-SOURCE-ONLY-20260811.md
PASS_C6_LIVE_USER_ADMIN_CONTRACT_SOURCE_ONLY
```

El contrato fija Firebase Auth + `tenants/{tenantId}/users/{uid}` + audit trail, operaciones list/create/update/changeRoleScope/disable/reactivate, RBAC, cero hard delete por defecto, idempotencia, readback y rollback. No contiene nombres, emails o credenciales reales.

El primer commit de ese JSON tuvo un error de escape en una cadena descriptiva y fue corregido inmediatamente en `fb0265c9d8f5f859faa9d8fb0c91910976b2e03d`, antes de cualquier provider/write/deploy; sin impacto runtime.

## Corrección de higiene source-safe

El primer commit documental de esta sesión (`9013be65f1e06628343aa796b7deeb2746dbb08a`) incluyó transitoriamente referencias humanas en texto del checkpoint. Se corrigió inmediatamente en `b9178b318f97a7e7b8459d4b275e6b0988cb35d2`, eliminándolas del contenido vivo y manteniendo correos/credenciales fuera del repo. No se afirma borrado de historia Git y no se hará `force` sin autorización expresa.

## Métrica estable de cierre

```text
M1 Baseline/Phase A preservada                     35 = COMPLETE
M2 Auth V4 activation/readback/rollback            20 = COMPLETE
M3 SKIP13/MultiAuth/HashConfig/direct runner       15 = COMPLETE
M4 Owners + exact project entitlements              5 = 2/5 COMPLETE
M5 Staff repair/bootstrap + live admin + rollback   8 = 1/8 COMPLETE
M6 HR final production evidence                     5 = PENDING
M7 Final accumulative multirole smoke               5 = PENDING
M8 Human validation + rollback ready                3 = PENDING
M9 Explicit cutover + one production promotion      3 = PENDING
M10 Post-cutover smoke + freeze                      1 = PENDING
```

**Avance certificado: 73%. Restante: 27%.** El denominador queda congelado.

## Siguiente acción exacta

Cerrar los cuatro scopes empresariales y ejecutar:

`C6 STAFF TARGET DIGEST + LIVE USER ADMIN BACKEND EXECUTABLE SOURCE-ONLY`.

No provider, Auth write, Firestore write, deploy, merge ni producción hasta cerrar scopes exactos y gate source-only.
