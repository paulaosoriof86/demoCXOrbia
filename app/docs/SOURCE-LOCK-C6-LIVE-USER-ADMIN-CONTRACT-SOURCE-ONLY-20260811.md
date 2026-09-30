# SOURCE LOCK — C6 LIVE USER ADMIN CONTRACT SOURCE-ONLY

**Fecha:** 2026-08-11  
**Repositorio:** `paulaosoriof86/demoCXOrbia`  
**Rama:** `docs-tya-v6-v71-audit`  
**PR:** #7 draft/open/no merge  
**HEAD verificado después del contrato:** `fb0265c9d8f5f859faa9d8fb0c91910976b2e03d`  
**Estado:** `PASS_C6_LIVE_USER_ADMIN_CONTRACT_SOURCE_ONLY__UI_EXISTS__BACKEND_LIVE_PATH_PENDING__NO_PROVIDER__NO_WRITES__NO_PRODUCTION`

## 1. Hallazgo reproducible

La superficie `app/modules/configuracion.js#usuarios` ya ofrece alta, edición, cambio de rol, activación/desactivación, proyecto y matriz de permisos. No requiere rediseño.

La autoridad actual, sin embargo, sigue siendo local:

```text
cx_users -> localStorage
cx_custom_roles -> localStorage
cx_perm -> localStorage
invite -> preview only
```

`app/core/backend-firebase.js` persiste proyectos, shoppers y visitas, pero no contiene create/update/disable de Firebase Auth ni write de claims/scope.

Por tanto:

```text
LIVE_USER_ADMIN_UI_EXISTS=true
LIVE_USER_ADMIN_BACKEND=false
PRODUCTION_BLOCKER=true
```

## 2. Contrato creado

```text
backend/contracts/c6-live-user-admin-v1.json
```

Define sin PII ni hardcode:

- Firebase Auth como autoridad de autenticación;
- `tenants/{tenantId}/users/{uid}` como documento vivo de usuario/rol/scope;
- `auditLogs` para trazabilidad;
- alta, edición de perfil, cambio de rol/scope, deshabilitación y reactivación;
- hard delete desactivado por defecto;
- derivación del identificador Firebase técnico a partir de login runtime;
- contact email administrable como dato vivo separado del identificador provider;
- projectIds exactos, sin wildcard y sin asumir Cinépolis;
- RBAC de mutación inicial limitado a `super`;
- snapshot, idempotencia, readback y rollback dry-run antes de producción;
- integración con la UI existente sin nuevos campos técnicos visibles.

## 3. Corrección source-only dentro del mismo bloque

La primera materialización del contrato tuvo un error de escape JSON en una cadena descriptiva. Fue corregido inmediatamente en el commit:

```text
fb0265c9d8f5f859faa9d8fb0c91910976b2e03d
```

No hubo provider access, Auth/Firestore writes, workflow, deploy ni runtime afectado. El contrato vivo quedó en sintaxis JSON válida antes de continuar.

## 4. Inputs empresariales

Las referencias humanas de A/B/C y un usuario adicional de Operaciones fueron recibidas transitoriamente en conversación y no se reproducen aquí.

Faltan únicamente los scopes de proyecto de esos cuatro accesos:

```text
TYA_COMPLETE
or
SPECIFIC_PROJECTS
```

No se infieren por rol.

## 5. Progreso

La métrica estable de 100 puntos no cambia.

```text
M1-M3 = 70 pts complete
M4 owner references = 2/5 pts complete
M5a live user-admin contract source-only = 1/8 pts complete
```

**Avance certificado: 73%. Restante: 27%.**

## 6. Siguiente bloque exacto

1. Recibir cuatro scopes empresariales.
2. Cerrar target digests A/B/C + acceso adicional Ops.
3. Implementar source-only el backend executable/admin adapter conforme a `c6-live-user-admin-v1.json`.
4. Gate estático antes de cualquier provider/write.

No repetir Auth V4, SKIP13, MultiAuth, HashConfig, direct runner ni auditorías generales.

## 7. Seguridad

```text
providerReads=0
providerWrites=0
AuthWrites=0
FirestoreWrites=0
HRWrites=0
RulesWrites=0
StorageWrites=0
deploys=0
merge=false
production=false
rawCredentialsStored=false
```
