# ADDENDUM MAESTRO — PLAN DE CORRECCIÓN RAÍZ, GO-LIVE Y DURABILIDAD CXORBIA TyA

**Fecha:** 2026-08-14 10:08 -06:00  
**Estado:** `ACTIVO__PREVALENTE_PARA_CORRECCION_RAIZ_Y_GO_LIVE__NO_REPROCESO__MISMA_CANDIDATA`

## 0. Propósito y lock

Este addendum convierte la auditoría forense integral del 14-ago en un plan de ejecución durable. No crea una candidata nueva ni sustituye el prototipo. Toda corrección se hace sobre la misma rama/candidata canónica viva:

- repo: `paulaosoriof86/demoCXOrbia`;
- rama: `docs-tya-v6-v71-audit`;
- PR existente: `#7` draft/open/no merge;
- base: `release/cxorbia-tya-rc-20260630`;
- HEAD al iniciar este plan: `cd02fcba934db84004c5b6e5d2f1855e1c4fadb4`.

Prohibido crear nueva candidata, rama, PR, composite paralelo o reconstrucción para resolver estas causas raíz. Si un cambio frontend P0 es indispensable, se corrige quirúrgicamente sobre esta misma candidata/source lock y se documenta por archivo/módulo; no se inicia otro ciclo de empalme.

La auditoría general queda cerrada. Solo un drift o P0 nuevo reproducible permite ampliar el diagnóstico.

## 1. Alcance de salida y horizonte de producto

La salida inmediata es Phase A TyA/Cinépolis. No significa que toda CXOrbia esté terminada. Los módulos que no forman parte de esta salida permanecen pendientes/preview/bloqueados de manera honesta, pero la arquitectura corregida debe servirles después sin reescritura.

Cinépolis es el primer proyecto real del tenant TyA, no una lógica global. Todo patrón reusable debe admitir nuevos proyectos TyA y futuros tenants mediante configuración, sin hardcodear cliente, país, moneda, HR, cuestionario, pagos, roles o integraciones.

Objetivo de producto: plataforma no-code/configurable por tenant/proyecto.

## 2. Regla NO REPROCESO — Auth y trabajo previo que se preserva

No se reconstruye Auth desde cero. Se preserva y reutiliza lo ya implementado y probado:

1. `core/backend-browser-auth.js`: Firebase Auth como autoridad, login visible único, namespace `staff/shopper`, validación de role/tenant/project/shopper scope y sesión sin password/token/UID en localStorage.
2. `adapters/tya-c6-live-user-admin-membership-wiring-v1.js`: principal Staff + claims + membership `tenants/tya/users/{uid}` + RBAC + handoff frontend fail-closed.
3. Principal Admin canónico/Exact Write V2 ya probado anteriormente, incluyendo membership persistida después de `CX.app.enter()` y reload/new-tab.
4. `adapters/cxorbia-exact-identity-contract-v1.js`: contrato reusable de identidad por llaves técnicas exactas; prohibido matching por nombre, email, teléfono, WhatsApp, username/login o similitud.
5. `adapters/tya-protected-auth-hr-authority-bridge-v2.js`: HR live como autoridad operacional y Firestore como overlay exacto de identidad/perfil/certificación.
6. `adapters/tya-cumulative-read-model-v2.js` y portal Shopper canónico que consumen el contrato de identidad exacta.
7. Reparación source-only de la cadena Shopper ya registrada como PASS; permanece pendiente de deploy/E2E real del mismo source lock.
8. Manifests, build-locks, rollback, source locks, reviewQueue y gates previos no se reinician.

### Lo que sí se corrige en Auth

No es un rediseño de Auth. Es consolidación de integración:

- un solo propietario efectivo del ingreso humano protegido;
- `pickShopperDev()` queda excluido de la ruta humana protegida;
- los guards/interceptores transitorios dejan de ser arquitectura permanente cuando el controlador único quede probado;
- Auth + claims + membership + shopper/profile + crosswalk deben resolver una única identidad atómica;
- la reparación source-only debe quedar en el mismo build que se despliega y prueba.

## 3. Arquitectura durable/no-code obligatoria

### 3.1 `CX.data` permanece estable

La interfaz pública de `CX.data` no cambia. El cambio durable ocurre detrás de esa interfaz.

Lecturas:

`CX.data -> read adapter -> fuente operacional configurada + overlays protegidos`

Mutaciones:

`CX.data -> command adapter -> validación RBAC/scope -> provider write -> ACK -> refresh`

Con write gate cerrado: resultado `blocked`, cero mutación local, cero localStorage como verdad y cero toast de éxito.

### 3.2 Configuración por tenant/proyecto

Todo comando/lectura reusable debe recibir como mínimo:

- `tenantId`;
- `projectId`;
- `actorId/role`;
- `country` cuando aplique;
- `sourceType/sourceRef`;
- `expectedVersion` o equivalente;
- `idempotencyKey` en writes;
- llave de entidad (`visitId/hrRowId`, `shopperId`, etc.).

Configurables por proyecto: HR/origen/mapping, países, monedas, cuestionario/origen/link, certificación, documentos, agendamiento, reprogramación/cancelación, pagos/liquidaciones, evidencias e integraciones.

### 3.3 Proveedores por adapter

HR TyA/Google Sheets es una implementación de fuente externa, no la arquitectura completa. El mismo contrato debe admitir Sheets, API, archivo, CRM u otra fuente. Make, Gemini, Storage y otros proveedores no se llaman desde módulos UI y permanecen detrás de adapters/gates.

### 3.4 Persistencia Shopper

Alta/edición administrativa reusable:

`Admin -> command create/update shopper -> validación exacta -> Auth -> claims -> membership -> profile/shopper -> crosswalk -> ACK -> refresh`

Nunca almacenar password/token en navegador. Nunca considerar localStorage persistencia productiva.

### 3.5 Sincronización HR/plataforma

Llaves mínimas: `tenantId`, `projectId`, `visitId/hrRowId`, `shopperId`, `assignmentSource`, `assignmentSyncStatus`, `lastSyncedAt`.

Conflictos van a review; no overwrite silencioso. La UI solo confirma éxito después de ACK real.

## 4. Plan de ejecución — cinco iteraciones base

La ruta normal desde este corte queda cerrada en **5 iteraciones de ejecución**. Una sexta iteración no se abre por rutina: solo puede existir por un P0 nuevo reproducible o por un gate externo realmente bloqueado, y debe quedar documentado con evidencia.

### ITERACIÓN 1 — Consolidación source-only y no-reproceso

Objetivo: corregir la arquitectura fuente sin tocar proveedores.

- congelar inventario de Auth reutilizable y marcar explícitamente `PRESERVE/DO_NOT_REBUILD`;
- consolidar controlador humano protegido y excluir bypass DEV de la ruta canónica;
- eliminar dependencia funcional de hostname para Finance v2 y activar por runtime contract;
- definir command adapter canónico de `CX.data` con fail-closed y sin mutación local;
- preparar contrato reusable de creación/edición Shopper;
- preparar writer HR real como interfaz gated, sin ejecutarlo;
- registrar los únicos P0 frontend quirúrgicos en Claude/prototipo sobre la MISMA candidata: `app.js` (bypass DEV protegido) y `modules/misvisitas.js` (listas completas/facets canónicas en vez de `find()`/estados literales).

Cierre: source/static/unit gates y cero proveedor write.

### ITERACIÓN 2 — Persistencia canónica preparada y regresión transversal

Objetivo: eliminar split-brain y false-success antes de activar writes.

- todas las mutaciones Phase A de `CX.data` resuelven al command adapter;
- `addShopper/updateShopper/setVisitState/assignVisit/postulaciones/reprogramación/cancelación` quedan sin fallback local productivo;
- idempotencia, RBAC, tenant/project scope, expectedVersion, audit y ACK contract;
- pruebas de reload/new-tab con writes bloqueados demuestran cero falsa persistencia;
- gates de multi-tenant/multi-proyecto demuestran que no existe condición reusable exclusiva `cinepolis` salvo configuración/dato del proyecto actual;
- regresión de Dashboard, HR, Shopper, Finanzas, Certificación y Academia sobre read path.

Cierre: `SOURCE_READY_FOR_DEV_WRITE_GATES`.

### ITERACIÓN 3 — Activación DEV Auth/Firestore y Shopper administrativo

Requiere gate explícito de writes DEV.

- reconciliación efectiva de Auth/claims/membership/profile/crosswalk;
- validar universo histórico sin adjudicar por similitud;
- crear/editar un Shopper de prueba por el flujo Admin real;
- comprobar login del Shopper creado, persistencia en segundo contexto, reload/new-tab y lectura de su perfil;
- comprobar Shopper histórico real con identidad exacta;
- reparar solo casos exactos/review necesarios; no regenerar todo Auth.

Cierre: Admin + Shopper histórico + Shopper nuevo PASS en DEV con persistencia provider real.

### ITERACIÓN 4 — HR bidireccional, operación Phase A y Finanzas

Requiere gate específico HR/Make DEV cuando llegue el write real.

- HR->plataforma conserva lectura viva actual;
- plataforma->HR usa writer real idempotente, nunca `CX.hr._ext`;
- asignación, agenda, reprogramación/cancelación y estados sobreviven reload y se reflejan según autoridad;
- no duplicación plataforma/HR y conflictos a review;
- Finance v2 activo por runtime contract; liquidación != pago; pago solo por fuente exacta;
- E2E de módulos Phase A: Dashboard, histórico, visitas, disponibles, postulaciones, Shopper, Certificación, Academia, Finanzas y liquidaciones;
- prueba de configurabilidad con un segundo projectId/fixture source-safe/config-only para demostrar patrón multi-proyecto sin inventar datos reales de otro cliente.

Cierre: `PHASE_A_DEV_E2E_READY_FOR_EXACT_DEPLOY`.

### ITERACIÓN 5 — Build exacto, preproducción y go-live

Requiere gates de deploy/producción correspondientes.

- congelar SHA/source lock;
- manifest + build-lock + verificador;
- desplegar exactamente ese SHA;
- verificar paridad remota;
- E2E real automatizado del MISMO build: Admin, Ops/Coordinación, Shopper histórico, Shopper nuevo y Cliente;
- validar HR viva, histórico, disponibles, persistencia, Finanzas, Certificación, Academia, reload/new-tab y rechazo de scopes incorrectos;
- cero false-success;
- rollback listo;
- solo con PASS final solicitar/consumir autorización productiva y ejecutar cutover;
- smoke postproducción sobre el mismo build.

Cierre válido: `ACTIVE_BASELINE_PHASE_A_PRODUCTION`.

## 5. Circuit breakers contra el bucle

1. No volver a auditoría general.
2. Cada iteración debe terminar en commit/HEAD documentado o bloqueo exacto; una conversación sin cambio de estado no cuenta como avance.
3. Un gate fallido no reinicia el plan: produce corrección focalizada dentro de la misma iteración.
4. No repetir un gate PASS salvo drift reproducible.
5. No pedir a Paula visualizar un build cuyo SHA no coincide con la reparación.
6. No porcentaje productivo por contratos estáticos. El 100% solo existe después de E2E remoto del mismo SHA y persistencia real.
7. No nueva candidata para aplicar estas correcciones.
8. No parche acumulativo como arquitectura: los guards transitorios deben desaparecer o quedar explícitamente aislados a DEV cuando el owner canónico pase.
9. No hardcodear Cinépolis en componentes reutilizables.
10. No éxito UI antes de ACK real.

## 6. Gate de durabilidad para futuros proyectos/tenants

Antes de congelar Phase A, los contratos nuevos deben pasar una matriz reusable:

- cambiar `tenantId/projectId` no rompe rutas ni scopes;
- país/moneda vienen de configuración;
- fuente HR es intercambiable por adapter;
- cuestionario es configurable;
- Auth/RBAC no depende de nombres TyA/Cinépolis;
- command adapter no depende de localStorage;
- módulos reciben estados/facets canónicos;
- conflictos son trazables/reviewable;
- providers permanecen gated;
- Academia/manuales/rutas por rol pueden asociarse a tenant/proyecto;
- ningún secreto/PII sensible queda en repo/browser storage.

Esto es el puente directo al prototipo comercializable/no-code y al siguiente tenant.

## 7. Phase A vs postproducción

### Sale ahora en Phase A

Operación TyA/Cinépolis necesaria para ingreso por roles, HR/histórico, shoppers, ciclo de visitas, postulaciones/asignaciones, certificación, liquidaciones/Finanzas requeridas, Academia y sincronización necesaria para operar.

### Permanece para postproducción/Phase B

Módulos no indispensables para la operación inicial, proveedores no activados, mejoras P1/P2, hardening adicional y expansión comercial. Deben reutilizar los mismos contratos/command adapters/configuración; no se crea una segunda arquitectura.

## 8. Documentación por iteración

Cada iteración actualiza obligatoriamente:

- `CAMBIOS-BACKEND.md`;
- `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
- `RESUMEN-PARA-CLAUDE.md`;
- `PENDIENTES-PROTOTIPO.md`;
- tracker/source lock/build-lock según corresponda;
- impacto Academia/manuales/cursos/rutas/notificaciones.

Clasificación obligatoria de cada cambio: `Reusable CXOrbia`, `Exclusivo cliente`, `Claude/prototipo`, `Academia`, `Sin impacto Claude`.

## 9. Estado seguro actual

Este addendum solo fija el plan. No autoriza merge, producción, deploy, Auth/Firestore/HR/Storage/Make/Gemini/pagos writes ni cambios de credenciales.

**Siguiente acción exacta:** `ITERACION_1_SOURCE_ONLY_ROOT_CAUSE_CONSOLIDATION`.
