# AUDITORÍA FORENSE INTEGRAL PREPRODUCCIÓN — CXOrbia TyA

Fecha: 2026-08-14
Estado: `FORENSIC_ROOT_CAUSE_LOCKED__PRODUCTION_BLOCKED__NO_GENERAL_REDIAGNOSIS`
Repo: `paulaosoriof86/demoCXOrbia`
Rama: `docs-tya-v6-v71-audit`
PR: `#7 draft/open/no merge`
HEAD auditado al inicio: `0b23ce26f8f50b5417e55e8162b987a1b7ab2650`

## 1. Decisión ejecutiva

La plataforma NO debe declararse lista para producción en el estado actual.

El problema no es un único password ni un único shopper. La auditoría encuentra varias causas raíz compartidas que explican por qué una candidata puede pasar gates estáticos/locales y aun fallar cuando Paula intenta usarla como usuario real.

No se autoriza una nueva auditoría general después de este documento salvo drift nuevo reproducible. El siguiente trabajo es corrección focalizada de estas causas raíz, luego deploy exacto y E2E real por rol/módulo.

## 2. Evidencia canónica actual

- El checkpoint vivo del 13-ago declara P0 Shopper, reparación source-only PASS, E2E real pendiente y reparación no desplegada.
- El entrypoint canónico humano carga Firebase Auth, source HR live, read model acumulativo v2, bridge Auth+HR, finanzas, módulos y guards C6.
- El runtime está configurado como read-only: `writeMode=disabled`, `enableDataWrites=false`, `enableOperationalWrites=false`.
- `app/core/shoppers-store.js` conserva alta/edición de shoppers en `localStorage`.
- `app/modules/shoppers.js` llama directamente `data.addShopper()` y `data.updateShopper()`.
- `app/modules/misvisitas.js` llama directamente `data.setVisitState()` para acciones operativas.
- `app/core/data.js::setVisitState()` muta la visita y llama `CX.hr.writeBack()`.
- `app/core/hr.js::writeBack()` trabaja contra una HR externa simulada en memoria y solo prepara automatización; no es escritura real a la hoja viva.
- `app/core/backend-cxdata-readonly-corte4.js` restaura métodos originales de CX.data mientras bloquea solamente escrituras directas del backend/operationalActions, lo que permite que módulos legacy sigan mutando estado local aunque el entorno se anuncie read-only.
- `app/adapters/tya-canonical-finance-read-model-v2.js` se activa por hostname `cxorbia-backend-dev.web.app` o query `cxTyaPhaseA=1`; el entrypoint canónico no agrega ese query automáticamente. Debe eliminarse la dependencia accidental del hostname y activarse por contrato/runtime canónico.

## 3. Causas raíz confirmadas

### RC-01 — Skew entre source-lock reparado y build desplegado

Se corrigió la cadena source del Shopper en rama, pero el checkpoint registra que la reparación no está desplegada. Repetir visualización sobre un build anterior reproduce el mismo fallo aunque el source actual ya haya cambiado.

Clasificación: `P0_RELEASE_INTEGRITY`.

Solución: un único contrato SHA→build-lock→deploy→verificación remota; prohibir aprobar un test si el build remoto no prueba el mismo SHA/source-lock.

### RC-02 — Demasiados propietarios/interceptores del login real

El frontend base conserva `pickShopperDev()` y un acceso DEV directo. Encima existen `backend-browser-auth.js`, `tya-c6-unified-human-runtime-v1.js` y `tya-c6-shopper-auth-click-guard-v1.js` para interceptar carreras/bypasses y completar transiciones. Esta superposición ya produjo bypass/race y requiere guards correctivos.

Clasificación: `P0_AUTH_CONTROL_PLANE_FRAGMENTATION`.

Solución: un solo dueño canónico del login visible y de la transición post-Auth; el selector DEV nunca puede participar en la ruta canónica protegida. Los guards correctivos deben retirarse una vez la ruta única quede demostrada.

### RC-03 — Auth válido no garantiza principal/perfil/Shopper canónico válido

El bridge exige claims `role`, tenant, projectIds y shopperId; el portal Shopper exige además un join técnico exacto contra el read model. Una cuenta puede autenticar y aun quedar sin workspace si principal/claims/membership/shopperId/crosswalk no forman una única identidad consistente.

Clasificación: `P0_IDENTITY_CONTROL_PLANE`.

Solución: reconciliación atómica e idempotente Auth principal + claims + membership + profile/shopper + crosswalk exacto. Sin matching por nombre/email parecido. Toda discrepancia va a review.

### RC-04 — Lectura real y escritura real están partidas

La lectura operativa canónica ya apunta a HR live y compone histórico + overlay protegido. Sin embargo las mutaciones de visitas siguen entrando por métodos legacy de `CX.data` y `CX.hr.writeBack()` termina en una HR simulada/in-memory. Make/HR write real sigue apagado.

Clasificación: `P0_PERSISTENCE_SPLIT_BRAIN`.

Impacto: agendar, marcar realizada, editar/crear, aprobar/reprogramar y acciones similares pueden parecer exitosas en pantalla sin persistencia canónica real.

Solución: todas las mutaciones de CX.data deben delegar a un único adapter/backend write transaccional y devolver ACK real. La UI no puede emitir toast de éxito antes del ACK. HR write real se hace detrás de gate/idempotencia con visitId/hrRowId, nunca contra el mock `CX.hr._ext`.

### RC-05 — Alta/edición manual de Shopper es localStorage, no persistencia productiva

`shoppers-store.js` define `cx_shoppers` y `cx_shopper_patches` en localStorage. `modules/shoppers.js` usa esas APIs directamente. Además el store conserva campos `user/pass` de la lógica demo, aunque la UI ahora rotule la credencial como protegida.

Clasificación: `P0_ADMIN_SHOPPER_PERSISTENCE_AND_CREDENTIAL_MODEL`.

Impacto: un shopper creado manualmente no queda automáticamente como principal Firebase + perfil Firestore canónico; otro dispositivo/sesión puede no verlo y la cuenta puede no autenticar.

Solución: `createShopper` seguro de servidor: validar duplicados exactos → crear/rehabilitar Auth → claims → Firestore shopper/profile/membership/crosswalk → commit idempotente → credencial inicial/reseteo fuera de almacenamiento del navegador. Si cualquier paso falla, rollback/estado review; nunca guardar password en localStorage.

### RC-06 — El guard read-only no bloquea todas las mutaciones legacy

`backend-cxdata-readonly-corte4.js` captura los métodos de CX.data y luego los restaura; bloquea `CX.backend.*` y `backendOperationalActions`, pero deja disponibles los originales `addShopper`, `updateShopper`, `setVisitState`, etc. Los módulos legacy los invocan directamente.

Clasificación: `P0_FALSE_SUCCESS_IN_READONLY_RUNTIME`.

Solución: en runtime protegido, CX.data conserva la MISMA interfaz pero cada mutación debe apuntar al adapter canónico; si el write gate está cerrado, debe devolver `blocked` y NO modificar memoria/localStorage. Ninguna vista debe simular éxito.

### RC-07 — Mis Visitas no consume el historial/estado canónico de forma completa

`misvisitas.js` usa estados literales (`asignada`, `agendada`, `realizada`, `liquidada`, etc.) en lugar de `visitFacets()` de forma transversal; además usa `find()` para asignada/agendada/realizada, por lo que muestra como máximo una visita por estado aunque existan varias. El histórico filtra principalmente `liquidada/cancelada` y no representa por sí solo todo el histórico canónico.

Clasificación: `P0/P1_SHOPPER_WORKSPACE_DATA_CONSUMPTION`.

Solución: resolver la identidad una vez y derivar arrays completos desde el read model canónico/facets; historial, activas, cuestionario, submitido, liquidación y pago deben usar las mismas facets que Admin/Finanzas.

### RC-08 — Activación de finanzas canónicas depende de un hostname accidental

`tya-canonical-finance-read-model-v2.js` condiciona su activación al hostname `cxorbia-backend-dev.web.app` o a `cxTyaPhaseA=1`. El contrato de activación debe venir del runtime canónico, no de un hostname histórico.

Clasificación: `P0/P1_FINANCE_RUNTIME_ACTIVATION`.

Impacto: en un host distinto se puede cargar `finanzas.js` sin que el read model canónico v2 que garantiza realizadas/submitidas y fuente financiera exacta esté activo.

Solución: activar por `CX_DEV_ENTRY_CANONICAL`/backend config y fallar cerrado si falta el finance model; nunca usar hostname como llave funcional.

### RC-09 — HR live read sí existe; HR write/sync bidireccional no está cerrado

`tya-protected-auth-hr-authority-bridge-v2.js` exige HR live source-safe, periodos/visitas no vacíos y llaves únicas; compone HR como autoridad operacional y Firestore como overlay exacto. El mismo runtime declara `runtimeSyncActive=false`. `core/hr.js` sigue siendo simulación para writeBack.

Clasificación: `P1_HR_READ_OK_WRITE_PENDING`.

Solución: conservar el read path; reemplazar exclusivamente el write path por adapter real gated + Make/Sheets writer con idempotencia y revisión de conflictos.

### RC-10 — La métrica de avance técnico fue confundida con readiness productivo

El CAMBIOS previo certificó 93% tras un Runtime PASS de Admin, pero el checkpoint posterior reabrió un P0 Shopper y dejó E2E real pendiente. El porcentaje medía milestones técnicos, no que cada rol/módulo y cada persistencia estuvieran aprobados en el build exacto.

Clasificación: `PROCESS_ROOT_CAUSE`.

Solución: el único 100% productivo válido debe requerir matriz E2E exacta por rol + persistencia + reload/new-tab + HR/finance + no false-success + build SHA remoto.

## 4. Matriz módulo por módulo — estado actual de salida

| Área | Lectura/visual | Mutación/persistencia | Estado preproducción |
|---|---|---|---|
| Login Admin/Ops | Auth bridge existe; Admin tuvo PASS previo | principal/claims deben corresponder al build exacto | BLOQUEADO hasta E2E exacto del nuevo source-lock |
| Login Shopper | source repair existe | principal/crosswalk E2E pendiente | P0 |
| Mi Perfil Shopper | portal v2 usa identidad exacta + histórico | edición real no cerrada | P0/P1 |
| Mis Visitas | módulo existe | muta CX.data legacy; además limita vistas con `find()` | P0 |
| Visitas disponibles/Postulaciones | derivables desde HR canónica | aprobación/asignación real debe pasar adapter write | P0 para operación real |
| HR/Historic/Dashboard | read HR live canónico preparado | HR write real apagado | LECTURA preparada / ESCRITURA pendiente |
| Shoppers Admin | lista/perfiles visibles | alta/edición localStorage | P0 |
| Finanzas/Liquidaciones | fuentes/read model existen | finance model v2 tiene gate de activación frágil; pagos reales bloqueados | P0/P1 |
| Certificación | contenido/overlay existen | E2E real Shopper fue omitido en último gate | P1 bloqueante para release funcional |
| Academia | módulo existe por rol | E2E real Shopper/Academia pendiente | P1 bloqueante para release funcional |
| Cliente | auth tiene bridge correctivo por transición | no certificado sobre build reparado exacto | P1 |
| Configuración/administrabilidad | UI existe | toda write productiva debe pasar adapter canónico, no local store | P0 para cambios persistentes |
| Automatizaciones/Make | contratos/previews existen | proveedor real no activo | P1 según flujo requerido |
| Evidencias/Storage | UI/contratos parciales | Storage real no activo | pendiente según alcance de salida |

## 5. Solución única, no parches

### Bloque S1 — Canonicalizar runtime sin cambiar diseño

1. Un solo controlador de Auth visible.
2. Un solo `shopperId`/identity crosswalk exacto.
3. Un solo composer HR live + protected overlay.
4. Un solo contract de states/facets consumido por Admin, Shopper y Finanzas.
5. Un solo activation contract, sin hostname histórico.
6. Retirar/neutralizar bypasses DEV de la ruta humana protegida y guards redundantes cuando pase el gate.

### Bloque S2 — Persistencia real detrás de CX.data

Mantener exactamente la interfaz pública CX.data pero sustituir implementación de mutaciones:

- `addShopper/updateShopper`
- `setVisitState`
- `assignVisit`
- `addProject`
- `payVisits`
- postulaciones/aprobaciones/reprogramaciones/cancelaciones

por comandos backend transaccionales con idempotency key, tenantId, projectId, actor, expectedVersion y audit.

Con write gate cerrado: `blocked`, cero mutación local y cero toast de éxito.

### Bloque S3 — Shopper/Auth administrativo

Implementar flujo controlado de alta manual y reparación histórica:

`Admin create/update → backend validation → Auth principal → claims → membership → shopper/profile → crosswalk → ACK → UI refresh`.

No guardar password/token/UID sensible en browser storage. Restablecimiento de credencial como operación protegida separada.

### Bloque S4 — HR bidireccional real

- HR→plataforma: lectura actual con llaves exactas.
- Plataforma→HR: writer gated (Make/Sheets) con visitId/hrRowId, assignmentSource, assignmentSyncStatus, lastSyncedAt.
- conflicto: review, nunca overwrite silencioso.

### Bloque S5 — Finanzas

Activar finance v2 por runtime contract. Verificar mayo/junio/julio y todos los periodos disponibles. Liquidación ≠ pago. Pago solo con fuente exacta. No lote si `reviewRequired`.

### Bloque S6 — E2E real obligatorio del MISMO build

Matriz mínima antes de producción:

- Admin: login, dashboard, HR/histórico, visitas, shoppers, alta/edición persistente, postulaciones, finanzas, config, Academia.
- Operaciones/Coordinación: scopes y acciones permitidas.
- Shopper histórico: login, perfil, todas sus visitas, disponibles, postulación, agenda/reprogramación/cancelación, cuestionario, certificación, beneficios/liquidación, reload/new-tab.
- Shopper creado manualmente: creación + login + persistencia + visibilidad en segundo contexto.
- Cliente: login + scope + reportes.
- Persistencia: cada write debe sobrevivir reload/new-tab y leerse desde provider/HR según autoridad.
- Rechazos: rol/tenant/project incorrectos fail-closed.
- Build: SHA/source-lock remoto exacto.

## 6. Gate de producción resultante

Producción queda `BLOCKED` mientras exista cualquiera de estos puntos:

1. source-lock reparado no desplegado;
2. Auth principal/profile/crosswalk sin E2E real;
3. mutaciones CX.data locales o simuladas;
4. alta/edición Shopper en localStorage;
5. HR writeBack simulada para acciones reales;
6. Finance canonical model no garantizado en el host/runtime real;
7. Mis Visitas sin listas completas/facets canónicas;
8. cualquier toast de éxito sin ACK real;
9. matriz E2E de Admin + Shopper + persistencia incompleta.

## 7. Qué NO se vuelve a hacer

- no nueva candidata;
- no nueva auditoría general;
- no fixes cosméticos sobre el síntoma;
- no probar repetidamente el build viejo;
- no cambiar passwords para esconder un mismatch de identidad;
- no localStorage como persistencia productiva;
- no usar el mock `CX.hr._ext` como sincronización real;
- no declarar 100% por gates source/static sin E2E del mismo deploy.

## 8. Estado seguro de esta auditoría

Este bloque fue read-only sobre runtime/provider y source; solo agrega este documento a la rama viva. No ejecutó deploy, producción, merge, Auth/Firestore/HR/Storage/Make/Gemini/pagos writes ni cambios de credenciales.
