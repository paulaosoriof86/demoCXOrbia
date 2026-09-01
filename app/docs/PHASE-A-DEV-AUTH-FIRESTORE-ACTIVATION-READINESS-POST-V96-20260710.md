# Phase A — DEV Auth/Firestore activation readiness desde source lock post-V96

Fecha: 2026-07-10  
Repo: `paulaosoriof86/demoCXOrbia`  
Rama: `docs-tya-v6-v71-audit`  
PR: #7 draft/open/no merge  
Source lock: `Prototype development request.zip` post-V96

## Objetivo del bloque

Preparar la activación DEV controlada de una base Firebase nueva y limpia, con Auth y Firestore todavía apagados, alineada con el source lock post-V96 y con la operación real Phase A TyA.

Este bloque no crea el proyecto Firebase, no configura proveedores, no crea usuarios, no escribe claims, no despliega reglas, no lee ni escribe Firestore, no activa `CX.data`, no importa datos y no toca producción.

## Revisión previa utilizada

Se continuó desde el source lock post-V96 y se revisaron los contratos recientes de:

- roles, personas y scopes;
- claims DEV source-safe;
- esquema Firestore protegido;
- reglas DEV draft;
- lecturas protegidas;
- HR source-safe → protected candidates;
- module readiness;
- readiness buckets;
- real connection gate;
- reviewQueue, auditEvents y rollback;
- configuración source-safe TyA/Cinépolis.

No se reabrieron desde cero HR, reglas Q1/Q2, shoppers, certificaciones, liquidaciones, CX.data, protected reads ni los gates ya preparados.

## Hallazgo de readiness que debía cerrarse antes de Auth DEV

Existía una inconsistencia entre fuentes backend:

1. `phase-a-auth-dev-claims-taxonomy-seed-v2` y su configuración source-safe asignaban `countryRepresentative` a `projectAdmin`.
2. `phase-a-role-taxonomy-org-scope-v1` y su plantilla de personas asignaban `countryRepresentative` a `tenantAdmin`.
3. `auth-rbac-phase-a-v1` todavía usaba el modelo anterior: no incluía `clientAdmin`, mantenía `clientViewer` fuera de Phase A y no exigía `personaType`, `scope` ni `permissionsVersion`.

Activar Auth con esas diferencias habría permitido claims, scopes y reglas interpretados de forma desigual. Se resolvió por mínimo privilegio y fail-closed:

- `countryRepresentative` queda como `projectAdmin` limitado por `projectIds`/`countryIds`;
- `clientAdmin` y `clientViewer` quedan representados para el portal cliente y reportes aprobados, no para datos operativos protegidos;
- claims Phase A requieren `tenantId`, `userId`, `role`, `personaType`, `scope` y `permissionsVersion`;
- rol, persona, scope, ruta o módulo desconocido quedan denegados salvo allowlist explícita;
- `custom` y `aliado` requieren mapeo explícito, no acceso heredado.

## Archivos de backend preparados

### Nuevos

- `backend/contracts/phase-a-dev-auth-firestore-activation-readiness-post-v96-v1.json`
- `backend/config/phase-a-dev-auth-firestore-activation-readiness-post-v96.source-safe.json`
- `tools/release/tya-dev-auth-firestore-activation-readiness-post-v96-validate.mjs`

### Alineados

- `backend/contracts/auth-rbac-phase-a-v1.json`
- `backend/contracts/phase-a-role-taxonomy-org-scope-v1.json`
- `backend/config/phase-a-role-taxonomy-personas.source-safe.json`
- `tools/release/tya-auth-rbac-contract-validate.mjs`

No se modificó ningún archivo en `/app/modules` ni `/app/core`.

## Qué valida el nuevo gate

El validador comprueba, sin llamadas externas:

- source lock post-V96 y ausencia de GO de producción;
- todos los flags Auth/Firestore/runtime/import/proveedores en `false`;
- modelo de claims v2 y roles técnicos Phase A;
- coherencia persona → rol entre RBAC, taxonomía y seeds;
- `countryRepresentative` con mínimo privilegio;
- roles cliente presentes, pero sin acceso a datos operativos protegidos;
- fail-closed para rol/persona/scope/ruta/módulo desconocidos;
- tenant `tya` y proyecto `cinepolis` como seed configurable;
- proyecto separado de periodo/quincena;
- shoppers históricos como candidatos source-safe/protegidos;
- carryover de certificaciones ya presentadas;
- junio como liquidaciones/pagos, no visitas pendientes;
- `reviewQueue` y `auditEvents` antes de cualquier import;
- reglas Firestore draft con escrituras negadas;
- Make, Gemini, Storage, HR writeback, pagos y producción apagados.

Veredictos posibles:

- `NO_GO_DEV_AUTH_FIRESTORE_ACTIVATION_READINESS`
- `READINESS_PREPARED_WITH_WARNINGS_NOT_ACTIVATED`
- `READINESS_PREPARED_NOT_ACTIVATED`

Un veredicto de readiness no activa Firebase ni equivale a producción.

## Impacto Phase A real TyA

### Dato/fuente operacional que preserva

- HR source-safe como fuente operacional de visitas, shoppers y estados.
- Configuración source-safe del tenant TyA y proyecto Cinépolis.
- Candidatos protegidos para shoppers, certificaciones, liquidaciones, lotes, reviewQueue y auditoría.

### Flujos que desbloquea para el siguiente gate

- Preparación de usuarios DEV por persona/rol/scope sin datos personales en repo.
- Revisión estática o emulador futuro de reglas Firestore.
- Lecturas protegidas futuras por rol.
- Dry-run de claims con referencias opacas.
- Preparación posterior del único switch `CX.data`, todavía apagado.

### Trabajo previo/legacy útil recuperado

- Roles operativos y flujos reales TyA ya documentados.
- Coordinación por país/proyecto sin convertir al representante en administrador global.
- Certificaciones presentadas conservadas.
- Junio tratado como control de pago.
- Asignaciones/conflictos con llaves estables y revisión humana.

No se copió código ni arquitectura de la plataforma vieja y no se conectó su base.

## Estado por carril

### Conectado

Nada nuevo se conectó a Firebase/Auth/Firestore/runtime.

### Preparado / preview

- contrato de activación readiness;
- configuración source-safe sin identificadores reales;
- taxonomía/RBAC coherentes;
- validator safe-only;
- esquema, reglas draft, protected reads y candidates referenciados.

### Bloqueado

- creación/configuración del proyecto Firebase DEV;
- proveedor Auth;
- usuarios y claims;
- deploy de reglas;
- lecturas y escrituras Firestore;
- import real;
- switch `CX.data`;
- HR writeback;
- Make, Gemini, Storage, outbox real y pagos;
- producción.

## Clasificación obligatoria

### Reusable CXOrbia

- orquestador de readiness Auth/Firestore por tenant/proyecto;
- claims pequeños con persona/rol/scope/version;
- mínimo privilegio y fail-closed;
- separación entre portal cliente y datos operativos protegidos;
- base nueva limpia y proveedores apagados;
- protected candidates → reviewQueue → audit antes de writes.

### Exclusivo cliente

- seed `tenantId=tya`;
- seed `projectId=cinepolis`;
- países GT/HN y monedas por configuración;
- junio como corte inicial de liquidaciones/pagos;
- HR Cinépolis como fuente del primer proyecto.

Nada de lo anterior queda hardcodeado como lógica global.

### Claude/prototipo

No se solicita rehacer P0 ya cerrado. Permanecen únicamente los P1 documentados:

- categorizar `cli_*` o usar allowlist cliente explícita;
- módulo desconocido `false` salvo allowlist;
- copy menor en Soporte, Mis Visitas y HR Source;
- smoke visual por roles.

### Academia

Debe explicar:

- persona visible vs rol técnico;
- tenant/project/country/own scope;
- mínimo privilegio y fail-closed;
- portal cliente vs datos protegidos;
- Auth/Firestore preparado vs activo;
- claims dry-run vs claims escritos;
- certificación carryover;
- junio como liquidación/pago;
- reviewQueue, auditEvents y estados bloqueados.

### Sin impacto Claude

- contratos internos;
- configuración source-safe;
- validadores;
- gates y hard stops;
- documentación de seguridad.

## Validaciones realizadas

- JSON de archivos nuevos y alineados: válido.
- Sintaxis Node de los dos validadores: válida con `node --check`.
- Revisión semántica cruzada de RBAC, taxonomía, claims v2, esquema protegido, reglas draft, candidates y proyecto source-safe.

No se ejecutó Firebase Emulator ni una llamada a Firebase porque todavía no existe autorización para configurar el entorno DEV real.

## Estado seguro al cierre

- sin merge;
- sin deploy;
- sin producción;
- sin Auth real;
- sin usuarios Auth;
- sin claims escritos;
- sin Firestore conectado;
- sin rules deploy;
- sin lecturas ni writes reales;
- sin import real;
- sin HR writeback;
- sin Make/Gemini/Storage;
- sin pagos;
- sin frontend modificado;
- sin datos sensibles crudos.

## Siguiente bloque exacto

Ejecutar el gate documental/estático acumulado sobre la rama y preparar el paquete de identidad del entorno Firebase DEV nuevo y vacío, todavía sin crear/configurar el proyecto ni activar proveedores. El paquete debe separar:

1. requisitos que pueden verificarse en repo;
2. valores que deben existir solo fuera del repo;
3. autorización explícita requerida para crear/configurar DEV;
4. plan de emulador/reglas read-only antes de cualquier lectura protegida;
5. rollback y evidencia de auditoría.

## Requerimiento de Paula

Ninguno para cerrar este bloque. La creación/configuración del proyecto Firebase DEV requerirá autorización explícita separada cuando el gate previo esté listo.
