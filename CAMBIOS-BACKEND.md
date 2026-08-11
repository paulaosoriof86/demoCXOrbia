# CAMBIOS-BACKEND.md

**Última actualización:** 2026-08-11  
**Fuente operativa vigente:** `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`.

## Estado actual

`PASS_C6_M4_STAFF_TYA_COMPLETE_TARGET_DIGESTS__LIVE_USER_ADMIN_EXECUTABLE_SOURCE_PREPARED__STATIC_GATE_EXECUTION_PENDING__NO_PROVIDER__NO_RUNTIME_WRITES__NO_DEPLOY__NO_PRODUCTION`

## Bloque 2026-08-11 — TyA completo para los cuatro

Se recibió y cerró la decisión empresarial:

```text
A Superadministración = TYA_COMPLETE
B Administración      = TYA_COMPLETE
C Operaciones          = TYA_COMPLETE
D Operaciones adicional= TYA_COMPLETE
```

No volver a pedir esos scopes.

El inventario canónico actual se resolvió contra evidencia backend ya materializada: `projects=1`, `currentProjectId=cinepolis`. Por tanto, el scope técnico actual exacto es `[cinepolis]`, sin wildcard. Se generaron owner/role binding digests y expected claims digests source-safe para A/B/C/D, sin nombres, emails, UIDs o credenciales crudas.

Archivos creados:

```text
backend/config/c6-staff-bootstrap-targets-v1.json
app/docs/evidence/C6-STAFF-TYA-COMPLETE-TARGET-DIGESTS-LATEST.json
app/docs/SOURCE-LOCK-C6-STAFF-TYA-COMPLETE-AND-LIVE-USER-ADMIN-SOURCE-20260811.md
```

## Regla de producto añadida — alcance por usuario

El contrato exige que **cada alta de usuario** pregunte de forma obligatoria:

- `TyA completo`;
- `Proyectos específicos`.

El alcance queda editable después del alta. Para `Proyectos específicos`, se usa inventario vivo. Para `TyA completo`, el backend expande a projectIds exactos. Si después aparece un proyecto nuevo, no se otorga acceso silenciosamente: el usuario queda marcado para revisión de scope hasta confirmación autorizada.

`backend/contracts/c6-live-user-admin-v1.json` fue actualizado a v1.1 con esta regla.

## Backend executable source materializado

Se creó:

```text
backend/runtime/hr-live-service/user-admin.mjs
```

El handler implementa source para:

```text
list
create
updateProfile
changeRoleOrProjectScope
disable
reactivate
```

Controles incluidos: Firebase ID token, tenant/authNamespace, caller `super`, projectIds exactos, idempotencia, audit log, readback y compensación/rollback.

Se reutilizó el backend existente. Archivos tocados:

```text
backend/runtime/hr-live-service/server.mjs
backend/runtime/hr-live-service/package.json
backend/runtime/hr-live-service/Dockerfile
firebase.json
```

`firebase.json` prepara source-only `/api/tenants/**` hacia el servicio existente. No hubo deploy.

Gate creado:

```text
tools/qa/cxorbia-c6-live-user-admin-source-gate.mjs
```

El gate está escrito, pero su ejecución terminal contra el checkout vivo todavía no está demostrada. No se declara PASS de ese subgate y no habilita writes.

## UI / Claude

No se modificó `app/modules/configuracion.js` desde backend. La UI existente se conserva. Claude debe hacer únicamente el wiring localizado al adapter vivo y añadir/confirmar el control de alcance de proyectos en alta/edición, sin rediseño.

## HR

M6 continúa COMPLETE: HR viva 2026-08 = 34 GT + 10 HN = 44. No se reabrió ni se volvió a leer en este bloque.

## Métrica estable

```text
M1 35 = COMPLETE
M2 20 = COMPLETE
M3 15 = COMPLETE
M4  5 = COMPLETE
M5  8 = 2/8 COMPLETE
M6  5 = COMPLETE
M7  5 = PENDING
M8  3 = PENDING
M9  3 = PENDING
M10 1 = PENDING
```

**Avance certificado: 82%. Restante: 18%.**

## Siguiente acción exacta

`C6 LIVE USER ADMIN STATIC SOURCE GATE -> STAFF REPAIR/BOOTSTRAP PREWRITE`.

No requiere nueva decisión empresarial. Primero debe demostrarse terminalmente el gate source-only. Solo después se arma el PREWRITE focal con snapshot/rollback. Cualquier provider/Auth/Firestore write, deploy, merge o producción requiere autorización separada.

## Seguridad

```text
providerReadsCurrentBlock=0
providerWrites=0
AuthWrites=0
FirestoreWrites=0
HRWrites=0
RulesWrites=0
StorageWrites=0
deploys=0
merge=false
production=false
```