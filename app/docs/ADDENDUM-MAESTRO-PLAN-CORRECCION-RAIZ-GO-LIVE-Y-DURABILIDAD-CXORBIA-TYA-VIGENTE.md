# ADDENDUM MAESTRO — PLAN DE CORRECCIÓN RAÍZ, GO-LIVE Y DURABILIDAD CXORBIA TyA

**Fecha:** 2026-08-15 13:14 -06:00  
**Estado:** `ACTIVO__PREVALENTE_PARA_CORRECCION_RAIZ_Y_GO_LIVE__NO_REPROCESO__MISMA_CANDIDATA__I3_REQUEST05_PREPROVIDER_SOURCE_FIX_PASS`

## 0. Propósito y lock

Este addendum convierte la auditoría forense integral del 14-ago en un plan de ejecución durable. No crea una candidata nueva ni sustituye el prototipo. Toda corrección se hace sobre la misma rama/candidata canónica viva:

- repo: `paulaosoriof86/demoCXOrbia`;
- rama: `docs-tya-v6-v71-audit`;
- PR existente: `#7` draft/open/no merge;
- base: `release/cxorbia-tya-rc-20260630`.

Prohibido crear nueva candidata, rama, PR, composite paralelo o reconstrucción para resolver estas causas raíz. Si un cambio frontend P0 es indispensable, se corrige quirúrgicamente sobre esta misma candidata/source lock y se documenta por archivo/módulo; no se inicia otro ciclo de empalme.

La auditoría general queda cerrada. Solo un drift o P0 nuevo reproducible permite ampliar el diagnóstico.

## 1. Alcance de salida y horizonte de producto

La salida inmediata es Phase A TyA/Cinépolis. No significa que toda CXOrbia esté terminada. Los módulos que no forman parte de esta salida permanecen pendientes/preview/bloqueados de manera honesta, pero la arquitectura corregida debe servirles después sin reescritura.

Cinépolis es el primer proyecto real del tenant TyA, no una lógica global. Todo patrón reusable debe admitir nuevos proyectos TyA y futuros tenants mediante configuración, sin hardcodear cliente, país, moneda, HR, cuestionario, pagos, roles o integraciones.

Objetivo de producto: plataforma no-code/configurable por tenant/proyecto.

## 2. Regla NO REPROCESO — Auth y trabajo previo que se preserva

No se reconstruye Auth desde cero. Se preserva y reutiliza lo ya implementado y probado:

1. `core/backend-browser-auth.js`: Firebase Auth como autoridad, login visible único, namespaces `staff/shopper`, validación role/tenant/project/shopper scope y sesión sin password/token/UID en localStorage.
2. `adapters/tya-c6-live-user-admin-membership-wiring-v1.js`: principal Staff + claims + membership + RBAC + handoff frontend fail-closed.
3. Principal Admin canónico/Exact Write V2 y membership persistida después de `CX.app.enter()` y reload/new-tab.
4. `adapters/cxorbia-exact-identity-contract-v1.js`: identidad exclusivamente por llaves técnicas exactas; prohibido matching por nombre, email, teléfono, WhatsApp, username/login o similitud.
5. `adapters/tya-protected-auth-hr-authority-bridge-v2.js`: HR live como autoridad operacional y Firestore como overlay exacto de identidad/perfil/certificación.
6. `adapters/tya-cumulative-read-model-v2.js` y portal Shopper canónico.
7. Reparación source-only de cadena Shopper, command HTTP transport, Shopper membership wiring, Shopper command provider y source patcher I3.
8. Manifests, build-locks, rollback, source locks, reviewQueue y gates previos.
9. I1/I2 PASS: `CX.data` command boundary, no local fallback productivo, provider ACK, Shopper store provider-only, Mis Visitas arrays/facets/ACK y firewall fail-closed.

No se regeneran usuarios ni se sustituyen identidades para facilitar las pruebas.

## 3. Arquitectura durable/no-code obligatoria

### 3.1 `CX.data` permanece estable

La interfaz pública de `CX.data` no cambia.

Lecturas:

`CX.data -> read adapter -> fuente operacional configurada + overlays protegidos`

Mutaciones:

`CX.data -> command adapter -> validación RBAC/scope -> provider write -> ACK -> refresh`

Con write gate cerrado: resultado `blocked`, cero mutación local, cero localStorage como verdad y cero toast de éxito.

### 3.2 Configuración por tenant/proyecto

Todo comando/lectura reusable recibe como mínimo tenantId, projectId, actor/role, country cuando aplique, sourceType/sourceRef, expectedVersion, idempotencyKey en writes y llave estable de entidad.

Configurables por proyecto: HR/origen/mapping, países, monedas, cuestionario/origen/link, certificación, documentos, agendamiento, reprogramación/cancelación, pagos/liquidaciones, evidencias e integraciones.

### 3.3 Proveedores por adapter

HR TyA/Google Sheets es una implementación, no la arquitectura. El mismo contrato debe admitir Sheets, API, archivo, CRM u otra fuente. Make, Gemini, Storage y otros proveedores permanecen detrás de adapters/gates.

### 3.4 Persistencia Shopper

`Admin -> command create/update Shopper -> validación exacta -> Auth -> claims -> membership -> profile/shopper -> crosswalk -> ACK -> refresh`

Nunca password/token en navegador. Nunca localStorage como persistencia productiva.

### 3.5 HR/plataforma

Llaves mínimas: `tenantId`, `projectId`, `visitId/hrRowId`, `shopperId`, `assignmentSource`, `assignmentSyncStatus`, `lastSyncedAt`. Conflictos a review; no overwrite silencioso; UI solo confirma tras ACK real.

## 4. Plan de ejecución — cinco iteraciones base

La ruta normal queda cerrada en 5 iteraciones. Una sexta no se abre por rutina, solo por P0 nuevo reproducible o gate externo comprobado.

### ITERACIÓN 1 — source-only root-cause consolidation — PASS 15/15

Cerrada. No reprocesar.

### ITERACIÓN 2 — canonical persistence + transversal regression — PASS 20/20

Cerrada. No reprocesar.

### ITERACIÓN 3 — DEV Auth/Firestore Shopper persistence — EN CURSO 0/25 hasta PASS completo

Debe cerrar:

- Shopper histórico exacto: Auth real + claims + membership + profile/shopper + crosswalk + historia;
- Admin create/update de un único Shopper nuevo por provider ACK;
- Auth/claims/membership/profile/crosswalk del nuevo Shopper;
- provider readback;
- login nuevo + reload/new-tab + segundo contexto;
- cero fuzzy matching, otras identidades, false-success o writes fuera de scope.

#### I3 — reglas durables ya source-locked

1. Un credential reset histórico autorizado se hace únicamente sobre el mismo UID exacto.
2. La evidencia sanitizada de Auth/identity/HR/history se congela inmediatamente después de ese subgate y antes de Admin/new Shopper.
3. Un fallo posterior no obliga a repetir un subgate histórico ya preservado.
4. Overlays diagnósticos DEV son no interactivos; no `force:true` para esconder defectos.
5. El gate legal/NDA es distinto del gate Auth/history. `CX.app.enter()` puede diferir `CX.router.mount()` mientras `CX.confidencialidad.pending(...)` esté activo.
6. El E2E histórico valida primero Auth exacto + identity + reviewQueue + HR authority + historia.
7. Si el NDA está pendiente, debe existir un diálogo legal visible y el workspace queda `legal-gate-pending`; las rutas se difieren sin declararlas PASS.
8. El harness jamás acepta, firma o guarda el consentimiento legal automáticamente.
9. Si no hay NDA pendiente, Academia y Certificación siguen siendo rutas E2E obligatorias.
10. Un gate legal pendiente no se presenta como PASS de Academia/Certificación; solo evita clasificarlo falsamente como fallo de Auth/history.
11. Un request `consumed=true` con `automaticRetryAllowed=false` nunca se rerun; cualquier nueva ejecución exige gate/request nuevo.
12. Un source-only preflight debe poder ejecutarse antes de instalar dependencias runtime y antes de acceder a credenciales provider.
13. Un source self-test de ausencia no puede incrustar como literal de búsqueda la misma firma cuya ausencia pretende demostrar; debe reconocer la estructura real del código.
14. Antes de un nuevo provider gate, el harness y la lineage se prueban independientemente con el workflow Phase A source-only.

Locks I3 actuales:

- `SOURCE-LOCK-ITERATION3-HARNESS-DURABILITY-PASS-20260814.md`;
- `SOURCE-LOCK-ITERATION3-HISTORICAL-LEGAL-GATE-AWARE-HARNESS-PASS-20260814.md`;
- `SOURCE-LOCK-ITERATION3-PREPROVIDER-SELFTEST-FAIL-CLOSED-20260814.md` — request04/histórico;
- **`SOURCE-LOCK-ITERATION3-PREPROVIDER-SELFTEST-SELFREFERENCE-FIX-PASS-20260815.md` — lock más reciente y prevalente.**

#### I3 — request `...-04`: fallo mecánico pre-provider histórico

Run `31852717413`, job `94931417141` pasó el gate de autorización/scope y falló en `Static I3 source preflight before provider credentials` con `ERR_MODULE_NOT_FOUND` porque el harness source-only importaba Playwright estáticamente antes de que el workflow lo instalara.

El fallo ocurrió antes de service account/provider. Reset 0, Auth 0, Firestore 0, otras identidades 0 y Admin/new Shopper no ejecutado. Request04 consumido; no rerun.

Corrección: Playwright pasó a import dinámico únicamente en `--execute-real` y se prearmó lineage `request04 + I3_PREPROVIDER_SOURCE_SELFTEST_PLAYWRIGHT_IMPORT_ORDER`.

#### I3 — request `...-05`: segundo fallo mecánico pre-provider, sin writes

Paula autorizó request05 con el mismo alcance funcional. Run `31902822527`, job `95056069906` volvió a pasar el gate de autorización/carril y se detuvo en el mismo source preflight, todavía antes de tooling, service account o provider credentials.

Causa exacta: el import estático real ya estaba eliminado, pero el propio `sourceSelfTest()` verificaba `!source.includes("from 'playwright'")`. Ese literal estaba contenido dentro de la expresión del test, por lo que el check `playwrightDeferredToRealExecution` siempre encontraba su propia cadena y se auto-invalidaba.

Efectos request05: reset 0, Auth 0, Firestore 0, otras identidades 0, Admin/new Shopper no ejecutado, providers prohibidos 0, deploy 0, merge=false, producción=false y consentimiento automatizado 0. Request05 quedó consumido por STOP_RETRY; no se rerun.

Corrección focal source-only posterior:

- harness v5 detecta únicamente una línea de import estático real y conserva `await import('playwright')` dentro de `--execute-real`;
- Phase A workflow existente prueba el harness sin Playwright/provider;
- current checkpoint verifier usa fuentes vivas compactas y no literales históricos obsoletos;
- source patcher y provider workflow prearman lineage `request05 + I3_PREPROVIDER_SOURCE_SELFTEST_SELF_REFERENTIAL_STATIC_IMPORT_CHECK`;
- el provider workflow imprime el JSON del preflight antes de cualquier provider credential;
- run source-only `31903321622` sobre HEAD `64f7aa28d3d3728d2f7a3749d62373cff746ffd2` terminó `SUCCESS` incluyendo I1, I2, harness, patcher/lineage y checkpoint verifier.

No existe autorización actual para request06.

### ITERACIÓN 4 — HR bidirectional + Phase A E2E + Finance — 25%

No iniciar hasta I3 PASS. Requiere gate HR/Make DEV cuando llegue el write real. Debe preservar lectura HR viva, activar writer real idempotente, probar sync sin duplicación/conflictos silenciosos, Finance v2 por runtime contract y E2E de Phase A.

### ITERACIÓN 5 — exact build + preproduction + go-live — 15%

No iniciar hasta I4 PASS. Requiere gates de deploy/producción. Congela SHA, manifest/build-lock, despliega exactamente ese SHA, verifica paridad remota y ejecuta E2E real del mismo build antes de cutover y smoke.

Cierre válido: `ACTIVE_BASELINE_PHASE_A_PRODUCTION`.

## 5. Circuit breakers contra el bucle

1. No volver a auditoría general.
2. Cada bloque termina en commit/HEAD documentado o blocker exacto.
3. Un gate fallido no reinicia el plan; produce corrección focal dentro de la misma iteración.
4. No repetir un gate PASS salvo drift reproducible.
5. No pedir a Paula visualizar una build cuyo SHA no coincide con la reparación.
6. No porcentaje productivo por contratos estáticos.
7. No nueva candidata.
8. No guards acumulativos como arquitectura.
9. No hardcodear Cinépolis en componentes reutilizables.
10. No éxito UI antes de ACK real.
11. No autoaceptar NDA/confidencialidad para hacer pasar E2E.
12. No rerun de requests consumidos.
13. No source-preflight que dependa de una instalación runtime posterior.
14. No source-self-test auto-referencial.
15. Antes de otro provider request, source harness + patcher + lineage deben tener PASS independiente.

## 6. Gate de durabilidad para futuros proyectos/tenants

Antes de congelar Phase A, los contratos nuevos deben probar:

- cambio de tenantId/projectId sin romper rutas/scopes;
- país/moneda desde configuración;
- HR intercambiable por adapter;
- cuestionario configurable;
- Auth/RBAC sin dependencia TyA/Cinépolis;
- command adapter sin localStorage;
- estados/facets canónicos;
- conflictos trazables/reviewable;
- providers gated;
- Academia/manuales/rutas por rol asociables a tenant/proyecto;
- gates legales configurables separados de Auth;
- cero secreto/PII sensible en repo/browser storage.

## 7. Phase A vs postproducción

Sale ahora la operación necesaria de TyA/Cinépolis: ingreso por roles, HR/histórico, shoppers, visitas, postulaciones/asignaciones, certificación, liquidaciones/Finanzas requeridas, Academia y sincronización necesaria para operar.

Módulos no indispensables, proveedores no activados, P1/P2, hardening adicional y expansión comercial quedan para postproducción/Phase B, reutilizando la misma arquitectura.

## 8. Documentación obligatoria por bloque

Actualizar `CAMBIOS-BACKEND.md`, checkpoint, `RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md`, tracker/source lock/build-lock según corresponda, más impacto Academia/manuales/cursos/rutas/notificaciones.

Clasificación: Reusable CXOrbia, Exclusivo cliente, Claude/prototipo, Academia y Sin impacto Claude.

## 9. Estado seguro y avance vigente

I1 e I2 permanecen PASS. I3 sigue abierta.

Último provider-request intentado: `cxorbia-i3-shopper-persistence-20260814-05`, run `31902822527`, job `95056069906`.

Ese request quedó consumido por STOP_RETRY **antes de tooling/service account/provider credentials**. Ejecutó 0 resets, 0 Auth writes, 0 Firestore writes y 0 cambios de identidad. Admin/new Shopper no se ejecutó y no existe checkpoint histórico nuevo.

El defecto mecánico auto-referencial quedó corregido source-only. El gate independiente `31903321622` fue SUCCESS en harness, patcher/lineage y checkpoint. Después solo hubo source/docs; cero provider writes, deploy, merge o producción.

**GO-LIVE: 35% completado / 65% pendiente.** I3 no suma hasta PASS completo.

**Siguiente acción exacta:** `PAULA_REVIEW_REQUIRED_FOR_I3_REQUEST06_AFTER_SELFREFERENTIAL_PREPROVIDER_MECHANISM_FAILURE`.

Si Paula autoriza request06, deberá continuar desde request05 con `priorStopRetryCode=I3_PREPROVIDER_SOURCE_SELFTEST_SELF_REFERENTIAL_STATIC_IMPORT_CHECK`, targetear el HEAD exacto vigente y cambiar únicamente el request JSON. Mantendrá un único reset del mismo UID histórico exacto, checkpoint legal-gate-aware antes de Administración, un solo Shopper nuevo y todas las prohibiciones previas.
