# SOURCE LOCK — C6 STAFF TYA COMPLETE + LIVE USER ADMIN SOURCE

**Fecha:** 2026-08-11  
**Repositorio:** `paulaosoriof86/demoCXOrbia`  
**Rama:** `docs-tya-v6-v71-audit`  
**PR:** #7 draft/open/no merge  
**Estado:** `PASS_C6_M4_STAFF_TYA_COMPLETE_TARGET_DIGESTS__LIVE_USER_ADMIN_EXECUTABLE_SOURCE_PREPARED__STATIC_GATE_EXECUTION_PENDING__NO_PROVIDER__NO_RUNTIME_WRITES__NO_DEPLOY__NO_PRODUCTION`

## 1. Decisión empresarial capturada

Los cuatro accesos iniciales de staff quedan con:

```text
entitlementMode=TYA_COMPLETE
```

La decisión se convirtió a configuración source-safe; no se persisten nombres, correos, UIDs ni credenciales crudas.

## 2. Inventario canónico exacto actual

La evidencia materializada vigente demuestra un único proyecto canónico TyA actualmente publicado en el backend limpio:

```text
canonicalProjectIds=[cinepolis]
count=1
```

Fuente: `app/docs/evidence/R17N-POST-MATERIALIZATION-READONLY-SMOKE-LATEST.json`, donde `cxdataSmoke.projects=1` y `currentProjectId=cinepolis`.

`TYA_COMPLETE` no se implementa con wildcard. En runtime el backend resuelve el inventario vivo `tenants/{tenantId}/projects` y guarda `projectIds` exactos.

## 3. M4 cerrado

Se materializaron targets source-safe A/B/C/D en:

- `backend/config/c6-staff-bootstrap-targets-v1.json`;
- `app/docs/evidence/C6-STAFF-TYA-COMPLETE-TARGET-DIGESTS-LATEST.json`.

Cada target contiene únicamente alias técnico, rol, owner identity anchor, owner-role binding digest, `TYA_COMPLETE`, projectIds exactos y expected claims digest.

```text
M4=5/5 COMPLETE
```

## 4. Regla solicitada para Usuarios & Permisos

Cada alta futura debe preguntar obligatoriamente **Alcance de proyectos**:

```text
TyA completo
Proyectos específicos
```

Si se elige `Proyectos específicos`, la UI debe mostrar selección múltiple tomada del inventario vivo de proyectos. El alcance debe poder editarse posteriormente.

El cambio de alcance no es cosmético: debe recalcular projectIds exactos, actualizar claims, documento vivo de usuario, auditoría y readback.

Para usuarios marcados `TYA_COMPLETE`, la creación de un nuevo proyecto TyA no concede privilegios silenciosamente. La plataforma debe marcar `scopeReviewRequired` hasta que un usuario autorizado confirme la expansión. Así se conserva la intención empresarial y el principio de mínimo privilegio.

## 5. Backend executable source preparado

Se creó directamente en la rama viva:

```text
backend/runtime/hr-live-service/user-admin.mjs
```

Y se integró source-only en el servicio backend existente, sin crear servicio/proyecto/rama/PR nuevo:

- `backend/runtime/hr-live-service/server.mjs` enruta user-admin antes del guard GET de HR;
- `backend/runtime/hr-live-service/package.json` incluye Firebase Admin SDK;
- `backend/runtime/hr-live-service/Dockerfile` empaqueta handler y dependencia;
- `firebase.json` prepara rewrite `/api/tenants/**` al servicio existente;
- `backend/contracts/c6-live-user-admin-v1.json` sube a v1.1 con scope obligatorio y editable.

Operaciones source:

```text
GET    /api/tenants/{tenantId}/users
POST   /api/tenants/{tenantId}/users
PATCH  /api/tenants/{tenantId}/users/{uid}/profile
PATCH  /api/tenants/{tenantId}/users/{uid}/scope
POST   /api/tenants/{tenantId}/users/{uid}:disable
POST   /api/tenants/{tenantId}/users/{uid}:reactivate
```

Mutaciones quedan limitadas inicialmente a caller `super`, con ID token, tenant + authNamespace exactos, idempotencia, audit log, readback y compensación/rollback.

## 6. Gate estático

Se creó:

```text
tools/qa/cxorbia-c6-live-user-admin-source-gate.mjs
```

El gate verifica contract v1.1, cuatro targets, digests, inventario canónico, ausencia de wildcard, source del handler, dependencia Firebase Admin, Docker packaging y rewrite Hosting.

**Importante:** el script está materializado pero su ejecución terminal todavía no está demostrada por una herramienta de ejecución sobre el checkout GitHub vivo. Por tanto no se declara `STATIC_GATE_PASS` ni se autoriza provider/runtime.

## 7. Progreso estable

Subasignación M5 sin cambiar el denominador:

```text
M5a live-user-admin contract source-only = 1/8 COMPLETE
M5b backend executable source materialized = 1/8 COMPLETE
M5c static gate terminal execution = PENDING
remaining M5 provider repair/bootstrap/readback/rollback/wiring = PENDING
```

M4 sube 2/5 -> 5/5 (+3) y M5 sube 1/8 -> 2/8 (+1).

**Avance certificado: 82%. Restante: 18%.**

## 8. Siguiente gate exacto

`C6 LIVE USER ADMIN STATIC SOURCE GATE -> STAFF REPAIR/BOOTSTRAP PREWRITE`.

Primero ejecutar terminalmente el gate source-only. Solo con PASS se prepara el plan exacto de repair/bootstrap y su snapshot/rollback. Cualquier provider/Auth/Firestore write requiere autorización separada.

## 9. Seguridad

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
rawPIICommitted=false
rawCredentialsCommitted=false
```

## 10. Clasificación

- **Reusable CXOrbia:** scope obligatorio/editable, backend tenant-scoped, audit/readback/rollback, future-project scope review.
- **Exclusivo TyA:** targets A/B/C/D y entitlement inicial `TYA_COMPLETE` sobre inventario canónico actual.
- **Claude/prototipo:** wiring localizado de Usuarios & Permisos; no rediseño.
- **Academia:** administración de usuarios, alcance y revisión explícita de permisos.
- **Sin impacto Claude:** HR viva, Finanzas, Visitas, Reservas y demás módulos preservados.
