# Auth/Firestore DEV limpio — preactivación focalizada por permisos

Fecha: 2026-07-10  
Repo: `paulaosoriof86/demoCXOrbia`  
Rama: `docs-tya-v6-v71-audit`  
PR: #7 draft/open/no merge  
Runtime source lock: `86e592db3f9f8016080302a852bfd194097b2074`

## Objetivo

Cerrar la matriz real de permisos por ruta y acción antes de configurar Auth DEV, crear usuarios de prueba, escribir custom claims, habilitar lecturas protegidas o desplegar reglas.

Este bloque no usa Firebase ni crea identidades. Reconciliará el comportamiento post-V96 del frontend con los contratos RBAC/backend para impedir que un rol técnico amplio entregue permisos mayores a los que corresponden por persona y alcance.

## Hallazgo principal

El frontend post-V96 ya aplica un patrón seguro:

- `ops`, `coordinador` y `aliado`: categorías `op`, `prj` y `cap`;
- categorías `fin`, `cfg` y `com`: denegadas por defecto;
- módulo desconocido: tratado como `cfg`, no abierto;
- rol custom sin matriz: solamente `cap`;
- navegación, render y selección inicial pasan por `CX.roleCanAccess`;
- proyectos, visitas, postulaciones y shoppers se filtran por `scopeProjectId` o países asignados.

La etiqueta visual `Admin del Proyecto` significa administración de proyecto/país dentro del scope. No significa administración global del tenant, finanzas, consola SaaS ni activación de proveedores.

## Reconciliación de roles

### Coordinador

- Persona: `countryRepresentative`.
- Rol técnico: `projectAdmin`.
- Scope: país/proyectos asignados.
- Permitido por defecto: operación, administración de proyecto y Academia.
- Denegado por defecto: finanzas, configuración global, proveedores, Diagnóstico/Administrabilidad y SaaS.

### Aliado / franquiciado

- Persona: `franchiseOwner`.
- Rol técnico: `tenantAdmin` con scope de país/proyecto.
- Permitido por defecto: operación, administración de proyecto dentro del scope y Academia.
- No debe heredar automáticamente los privilegios del `tenantOwner` aunque comparta rol técnico.
- Finanzas, configuración global, usuarios, integraciones y auditoría tenant requieren bundles/allowlist explícitos.

### Custom

- Sin template de claims por defecto.
- Decisión: `deny`.
- Requiere mapeo explícito de persona, rol técnico, país/proyecto, bundles, versión de permisos, revisión humana y motivo auditable.

### Cliente

- Debe dividirse entre `clientAdmin` y `clientViewer`.
- Ambos quedan limitados al portal y proyectos aprobados.
- No obtienen rutas administrativas internas.

### Shopper

- Scope propio.
- Solo perfil, visitas, postulaciones, agenda, cuestionario, beneficios y certificaciones propias.

## Mismatch detectado antes de claims

El contrato `auth-rbac-phase-a-v1.json` aún enumera `projectAdmin` en:

- `finanzas`;
- `automatizaciones`;
- `diagnostico`.

Ese alcance es más amplio que la matriz frontend post-V96 para coordinador/aliado/ops. Por seguridad, no se crearán claims usando solo `projectAdmin`. La decisión debe usar rol + persona + scope + bundles.

También se detectó que el seed de claims v1 no incluye plantillas completas para `clientAdmin` y `clientViewer`, aunque ya existen en la taxonomía vigente.

## Archivos creados

- `backend/contracts/phase-a-auth-preactivation-route-action-v1.json`;
- `backend/config/phase-a-auth-preactivation-identity.source-safe.json`;
- `tools/release/tya-auth-preactivation-route-action-validate.mjs`;
- `.github/workflows/cxorbia-auth-preactivation-route-action.yml`.

## Configuración DEV preparada

Se documentó como identidad esperada:

- proyecto: `cxorbia-backend-dev`;
- target Hosting: `cxorbia-dev`;
- entorno: DEV separado;
- sin importación de Auth legacy;
- templates opacos para tenant owner, franquiciado, representante, coordinadores, campo, finanzas, certificación, cliente admin/viewer y shopper;
- sin nombres, correos, teléfonos, contraseñas, documentos, banco, NDA, tokens o URLs privadas.

La condición “base nueva y limpia” no se afirmó como verificada externamente. Queda pendiente comprobar, mediante gate read-only separado, que Auth, Firestore, Storage y Functions de negocio continúan vacíos/inactivos.

## Gates

### Completado

- matriz ruta/acción source-safe;
- reconciliación frontend ↔ RBAC;
- templates de identidad sin PII;
- custom fail-closed;
- validator/CI sin llamadas externas.

### Bloqueado

- crear usuarios Auth;
- escribir claims;
- habilitar protected reads;
- desplegar reglas;
- escribir Firestore;
- importar usuarios/datos;
- activar Make/Gemini/Storage/HR writeback;
- deploy/producción.

## Impacto Phase A TyA

Este bloque protege la futura operación real para que:

- coordinadores y representantes solo operen sus países/proyectos;
- franquiciados no escalen a tenant owner por compartir rol técnico;
- shoppers vean solo sus datos;
- clientes vean solo resultados aprobados;
- finanzas y certificaciones tengan roles/bundles separados;
- HR, shoppers históricos, certificaciones carryover y liquidaciones de junio se lean con el scope correcto cuando se active el backend.

No se solicitaron nuevamente HR, reglas, shoppers, certificaciones ni liquidaciones.

## Legacy útil recuperado

Se conserva la lógica comprobada de scopes por país/proyecto y separación de roles operativos. Se descarta el patrón riesgoso de asumir que ver una pantalla o tener un rol genérico autoriza todas las acciones.

No se conectó ni copió la base vieja.

## Clasificación

- **Reusable CXOrbia:** autorización por rol + persona + scope + bundles; custom fail-closed; route visibility no equivale a action authorization.
- **Exclusivo cliente:** asignaciones TyA por país/proyecto y configuración de Cinépolis permanecen en fuentes externas/source-safe.
- **Claude/prototipo:** aclarar `Admin del Proyecto`, separar cliente admin/viewer, estados de acceso denegado y expansión de permisos con motivo.
- **Academia:** rol vs persona vs scope, rutas vs acciones, escalamiento, cambios de permisos y lectura de acceso denegado.
- **Sin impacto Claude:** validator, artifact CI y controles internos provider-off.

## Estado seguro

- sin cambios en `/app/modules`;
- sin cambios en `/app/core`;
- sin Firebase/Auth provider calls;
- sin usuarios;
- sin claims;
- sin Firestore reads/writes;
- sin rules deploy;
- sin import;
- sin deploy;
- sin producción;
- sin datos sensibles.

## Siguiente bloque exacto

`Firebase DEV clean-state + Auth configuration read-only gate`:

1. preparar un verificador read-only separado para Auth/Firestore/Storage/Functions;
2. exigir autorización explícita antes de llamar al proveedor;
3. confirmar proyecto nuevo/limpio sin revelar secretos ni identidades;
4. mantener usuarios, claims, rules y writes bloqueados;
5. solo después preparar dry-run de usuarios de prueba opacos.
