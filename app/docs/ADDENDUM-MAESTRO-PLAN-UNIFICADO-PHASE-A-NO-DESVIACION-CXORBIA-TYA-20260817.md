# ADDENDUM MAESTRO — PLAN UNIFICADO PHASE A · NO DESVIACIÓN · CXORBIA TyA

**Fecha:** 2026-08-17 13:12 -06:00  
**Estado:** `ACTIVO__PREVALENTE_PARA_SECUENCIA_Y_CONTINUIDAD__MISMA_CANDIDATA__NO_REPROCESO__I1_PASS__I2_PASS__I3_EN_CURSO__I4_I5_PENDIENTES`  
**Repo:** `paulaosoriof86/demoCXOrbia`  
**Rama única:** `docs-tya-v6-v71-audit`  
**PR:** `#7` draft/open/no merge  
**Base:** `release/cxorbia-tya-rc-20260630`

## 0. Decisión

Este documento **NO crea un plan nuevo**. Unifica y hace explícita la secuencia entre:

1. el Plan Phase A por Cortes 0B→8;
2. la auditoría forense del 14-ago con bloques S1→S6;
3. el plan durable de cinco iteraciones I1→I5;
4. el source lock de regresión de autoridad/composición del 17-ago;
5. los pendientes operativos Phase A ya documentados desde julio.

Cuando haya conflicto de **secuencia, porcentaje, “siguiente acción” o estado actual** entre documentos históricos, prevalece este addendum junto con el source lock técnico más reciente. Las reglas de negocio, seguridad, no-reproceso, multi-tenant, multi-proyecto, Academia y gates de proveedor siguen vigentes y no se reducen.

No nueva candidata, rama, PR, reconstrucción general ni reauditoría general. Una corrección focal no reinicia el plan ni un subgate ya PASS.

## 1. Por qué era necesaria la unificación

Existían tres formas válidas pero distintas de describir el mismo camino:

- **Cortes 0B→8:** orientados a producto/visualización.
- **S1→S6:** causas raíz y controles forenses preproducción.
- **I1→I5:** ponderación formal de go-live y durabilidad.

Eso podía hacer parecer que aparecía un plan nuevo, que faltaban pasos o que un bloque intermedio obligaba a “volver atrás”. Desde ahora, son **capas del mismo plan**:

- I1→I5 = eje de avance formal;
- Cortes 0B→8 = cobertura funcional histórica que no puede perderse;
- S1→S6 = controles intermedios obligatorios que se ejecutan dentro de las iteraciones, no como plan paralelo;
- subgates I3/I4/I5 = secuencia exacta actual, sin huecos implícitos.

## 2. Crosswalk obligatorio — Cortes históricos → cinco iteraciones

| Plan histórico | Cobertura | Ubicación actual | Regla |
|---|---|---|---|
| Corte 0B | motor canónico histórico + tenant/login + visual | I1/I2 cerrados + validación exact-build en I3/I5 | no reabrir histórico; solo regresión reproducible |
| Corte 1 | contexto, proyecto/periodos, HR e histórico | I1/I2 + I3 runtime de regresión actual | HR no se reimporta |
| Corte 2 | ciclo Shopper completo | I3 identidad/persistencia + I4 operación E2E | Shopper histórico no se reprocesa |
| Corte 3 | Finanzas/liquidaciones/pagos | I4 | preservar Finance V2 + source-safe/histórico |
| Corte 4 | `CX.data` backend read-only / interfaz estable | I1/I2 PASS | no reconstruir `CX.data` |
| Corte 5 | materialización DEV, idempotencia, trazabilidad | I2/I3; writes operativos restantes en I4 bajo gate | no repetir materializaciones PASS |
| Corte 6 | Auth/RBAC por persona/rol/scope | I3 | Admin e histórico PASS congelados; Shopper nuevo pendiente |
| Corte 7 | HR bidireccional, evidencias y conflictos | I4 | writer real gated; no duplicar |
| Corte 8 | preproducción, rollback, producción | I5 | solo después de I4 PASS |

Ningún Corte desaparece. Si una función del plan de Cortes no aparece en un resumen corto de I1→I5, se considera igualmente incluida por este crosswalk.

## 3. Los seis bloques forenses S1→S6 NO son un plan paralelo

Los seis bloques de la auditoría del 14-ago quedan congelados como **controles intermedios dentro de I1→I5**:

| Bloque forense | Significado | Iteración que lo contiene | Estado/continuidad |
|---|---|---|---|
| S1 | canonicalizar runtime: Auth único, identidad exacta, HR+overlay, facets, activación canónica | I1/I2 + verificación regresión en I3 | arquitectura cerrada; runtime del delta 17-ago pendiente |
| S2 | persistencia real detrás de interfaz `CX.data`, ACK/fail-closed, cero local truth | I2 + validación operacional I4 | I2 PASS; no reabrir arquitectura, solo probar comandos reales por flujo |
| S3 | Shopper/Auth administrativo | I3 | histórico PASS; Admin PASS; creación/update/login de un Shopper nuevo pendiente |
| S4 | HR bidireccional real | I4 | pendiente, requiere gate HR/Make DEV |
| S5 | Finanzas | I4 | fuente histórica preservada; validar antes de incorporar fuente nueva |
| S6 | E2E real obligatorio del MISMO build | cierre I4 + I5 | pendiente; nunca sustituir por static/source PASS |

**Regla anti-desvío:** un S1→S6 pendiente no crea “otra iteración”. Se ejecuta dentro de la iteración asignada y se continúa desde el último checkpoint PASS.

## 4. Avance formal — no cambiar por subgates parciales

- I1 — `15/15 PASS`.
- I2 — `20/20 PASS`.
- I3 — `0/25 EN CURSO` hasta cierre integral.
- I4 — `0/25 NO INICIAR COMO WRITE OPERATIVO` hasta I3 PASS; validaciones read-only preparatorias pueden hacerse si no alteran gates.
- I5 — `0/15 NO INICIAR` hasta I4 PASS.

**GO-LIVE formal: 35% completado / 65% pendiente.**

Los subgates PASS de I3 no aumentan el porcentaje formal, pero quedan congelados y no se repiten.

## 5. Trabajo congelado — NO REPROCESAR

1. I1/I2 PASS.
2. Historical Shopper run `31906391682` PASS; reset único consumido; toda continuación `passwordResets=0`; no credential access/reconcile/recovery histórico.
3. request08 consumido/no rerun.
4. TARGET_B Admin real Firebase sign-in PASS run `32049054855`; Paula ingresó; no crear/rotar/reemplazar Admin.
5. HR viva ya verificada: 15 periodos / 660 visitas hasta AGO 2026; no reimportar.
6. Adapters canónicos V2: cumulative read model, Shopper portal, protected HR authority, state semantics, Finance V2 y source-safe/historical payments.
7. Mayo/junio histórico financiero ya construido no se reconstruye.
8. Exact identity contract: nunca matching por nombre/email/teléfono/WhatsApp/username/similitud.
9. Materialización legal V0.4 y deploy legal DEV previos no se rerun.
10. Consentimiento legal nunca se automatiza.

## 6. I3 — secuencia completa actual, sin pasos implícitos

La I3 no puede cerrarse omitiendo ninguno de estos subgates. El orden puede agruparse en una misma ejecución cuando sea seguro, pero el resultado de cada subgate debe quedar explícito.

### I3.1 — source fix autoridad/composición

**PASS source-only.**

- scope membership root-project/program compatible con filas de periodo;
- assignment HR separado de postulación persistida;
- commits base `8a0fa581...` y `6594ef961...`;
- source lock 17-ago vigente.

### I3.2 — exact-head runtime validation + DEV deploy bajo gate

Pendiente:

- validar source/runtime del mismo HEAD;
- desplegar exactamente ese HEAD a DEV solo con gate explícito;
- comprobar SHA/build remoto; no visualizar build viejo.

### I3.3 — Proyecto/Periodos/HR/Historico

Debe demostrar en el build exacto:

- Proyecto Cinépolis visible como proyecto raíz configurable;
- 15 periodos visibles;
- AGO 2026 activo;
- 660 visitas preservadas;
- navegación entre periodos sin pérdida de scope;
- histórico por país/periodo.

### I3.4 — autoridad Postulación vs Asignación HR

Debe demostrar:

- `_posts`/Postulaciones = solo postulaciones persistidas reales;
- assignments HR = proyección/estado operacional distinto;
- cero `hr-post-*` presentados como aprobaciones de plataforma;
- Visitas/Reservas conservan asignación HR real.

### I3.5 — crosswalk exacto del periodo nuevo

Debe inspeccionar `identityReviewQueue`, aliases y llaves exactas de agosto:

- reutilizar perfiles/crosswalk existentes;
- no tocar histórico PASS;
- no resetear credenciales;
- no deduplicar por similitud;
- conflictos permanecen en review.

### I3.6 — Mi Perfil + Histórico Shopper

Debe validar una identidad exacta en el mismo build:

- sesión → shopperId/crosswalk → perfil canónico;
- histórico completo;
- certificación presentada/aprobada preservada;
- datos faltantes no inventados;
- reload/new-tab sin pérdida de identidad.

### I3.7 — Legal V0.4 durable receipt/readback

Paula ya realizó la interacción humana. Falta cerrar técnicamente:

- provider ACK/readback del receipt exact identity + legalVersion + digest;
- reload/new-tab sin volver a pedir aceptación si el receipt válido ya existe;
- doble presentación actual permanece P1 salvo que impida sesión/rutas;
- cero aceptación automatizada.

### I3.8 — Admin crea/actualiza UN Shopper nuevo por provider

Este punto del plan original sigue pendiente y **no puede desaparecer** por haber corregido la regresión actual.

Cadena obligatoria:

`Admin create/update → validación exacta → Auth → claims → membership → profile/shopper → crosswalk → provider ACK → refresh/readback`.

Presupuestos:

- histórico `passwordResets=0`;
- cero writes sobre otras identidades;
- no localStorage como verdad;
- no password/token/UID sensible en browser storage;
- idempotencia y rollback/review si falla.

### I3.9 — Shopper nuevo E2E

Debe probar:

- login real;
- claims/membership/profile/crosswalk exactos;
- workspace correcto;
- reload;
- new-tab;
- segundo contexto/dispositivo lógico;
- persistencia provider-backed.

### I3.10 — KPI derivados/regresión de state semantics

Ya comprobados estructurales de AGO: `44 total`, `32 asignadas`, `12 sin asignar`, `25 agendadas`, `7 sin agendar`, `18 realizadas`, `26 pendientes de realizar`.

Pendiente validar contra HR + state semantics V2, sin reescribir Dashboard:

- cuestionario pendiente/completo;
- sin submitir/submitidas;
- fuera de rango actionable vs evidencia histórica;
- liquidación/pago cuando corresponda.

### I3.11 — cierre integral I3

I3 pasa a `25/25` únicamente si el mismo build demuestra conjuntamente:

- Admin canónico existente;
- Shopper histórico congelado;
- Shopper nuevo provider-backed + login/persistencia;
- legal receipt durable;
- proyecto/periodos/HR sin regresión;
- identidad exacta y no fuzzy;
- no false-success/local truth.

## 7. I4 — Phase A operacional completa

I4 integra los Cortes 2, 3 y 7 y los bloques S2/S4/S5/S6. No se limita a “HR + Finance”. Debe cerrar la operación real completa.

### I4.1 — documentos/instructivos y certificación

- Shopper ve documentos/instructivos del proyecto;
- certificación configurable por proyecto;
- certificación ya presentada/aprobada se conserva y no se repite;
- banco de preguntas y estados de certificación con revisión humana.

### I4.2 — disponibles y postulaciones

- visitas disponibles reales desde HR;
- Shopper se postula;
- Admin gestiona postulaciones;
- postulación y asignación son autoridades distintas;
- no duplicación por refresco/sync.

### I4.3 — asignación + agenda + reprogramación + cancelación

- Admin/flujo asigna;
- Shopper agenda;
- reprograma;
- cancela cuando la regla lo permite;
- cada comando usa adapter canónico + ACK;
- cero éxito local antes de ACK.

### I4.4 — ejecución + cuestionario + submit/revisión

- Shopper marca realizada según regla;
- origen cuestionario configurable: CXOrbia / TyAOnline / externo / link general / link por visita;
- Shopper completa/marca cuestionario;
- Admin continúa revisión/submitido;
- states/facets son los mismos para Admin/Shopper/Finanzas.

### I4.5 — HR bidireccional / Make

- Plataforma→HR: assignmentSource, sync status, writer gated, visita sale de disponibles;
- HR→Plataforma: detecta asignación y no duplica si ya venía de plataforma;
- llaves mínimas `tenantId`, `projectId`, `visitId/hrRowId`, `shopperId`, `assignmentSource`, `assignmentSyncStatus`, `lastSyncedAt`;
- conflicto → review, nunca overwrite silencioso;
- Make/Sheets write real solo con gate DEV correspondiente.

### I4.6 — Finanzas/liquidaciones/pagos

Preservar y validar fuente existente antes de cualquier nueva reconciliación:

- mayo 2026 histórico pagado según fuente vigente;
- junio 2026 usa el estado exacto actualmente documentado por source-safe/historical payment truth, sin regresar a supuestos antiguos;
- honorario, boleto, combo/reembolso, total y moneda separados;
- liquidación ≠ pago;
- pago solo con fuente exacta;
- `reviewRequired` no entra a lote;
- agosto sin fuente exacta queda fail-closed hasta fuente real, sin reconstruir mayo/junio.

### I4.7 — multi-proyecto y configuración por proyecto

Validar que Cinépolis sea proyecto normal configurable, no hardcode global:

- cliente/país/moneda;
- HR/origen/mapping;
- cuestionario/origen/link;
- documentos;
- certificación;
- agendamiento/reprogramación/cancelación;
- pagos/liquidaciones;
- evidencias;
- integraciones.

### I4.8 — roles y scopes

E2E de:

- Admin;
- Operaciones/Coordinación;
- Shopper histórico;
- Shopper nuevo;
- Cliente.

Cada rol debe probar rutas visibles, acciones permitidas y rechazos fail-closed por tenant/project/country/role.

### I4.9 — evidencias / Storage según flujo real

Si una visita Phase A requiere evidencia:

- carga/lectura protegida;
- ownership y scope;
- Storage detrás de gate;
- no datos sensibles crudos en repo/browser;
- fallo sin false-success.

### I4.10 — Academia, manuales, rutas y notificaciones

Debe verificarse por cada flujo cambiado:

- manual del módulo;
- curso/lección;
- checklist;
- errores frecuentes;
- glosario;
- ruta por rol;
- notificación/cambio cuando aplique;
- Admin/Shopper/Cliente ven contenido pertinente;
- no declarar Academia/Certificación PASS si un gate legal aún bloquea realmente la ruta.

### I4.11 — Gemini según necesidad operativa

Gemini permanece provider-gated y con revisión humana. El workflow de certificación debe funcionar con banco configurado. Gemini live solo se activa antes del go-live si el proyecto actual necesita generación asistida en runtime para operar; de lo contrario queda preparado sin false promises y su activación posterior no bloquea el flujo base ya funcional.

### I4.12 — S6 E2E integral del MISMO build

Matriz obligatoria:

- Dashboard/HR/Histórico;
- Shoppers;
- Visitas;
- Postulaciones;
- agenda/reprogramación/cancelación;
- realizada/cuestionario/submit;
- certificación/documentos;
- liquidaciones/Finanzas;
- Configuración necesaria;
- Cliente/reportes;
- Academia;
- persistencia tras reload/new-tab;
- negative scopes;
- no local mutation/false-success;
- exact remote SHA.

I4 pasa a `25/25` solo con esta matriz PASS y los writes reales que Phase A necesita bajo sus gates.

## 8. I5 — exact build, preproducción y go-live

### I5.1 — freeze funcional

- cero P0 abierto;
- P1/P2 documentados y explícitamente no bloqueantes;
- source lock funcional final.

### I5.2 — exact build

- congelar SHA;
- manifest;
- build-lock;
- verificador;
- inventario de archivos/charset/secrets.

### I5.3 — preproducción remota exacta

- desplegar exactamente el SHA congelado con gate;
- verificar paridad remota;
- no build viejo ni artefacto distinto.

### I5.4 — rollback

- rollback verificable;
- no improvisar restauración después del cutover.

### I5.5 — E2E final same-build

Repetir la matriz crítica S6 sobre el artefacto remoto exacto, no sobre source local distinto.

### I5.6 — autorización producción

Gate explícito de Paula para merge/deploy/producción según el mecanismo vigente. Nada de producción antes.

### I5.7 — deploy/cutover/smoke

- producción del SHA exacto;
- smoke por rol/rutas críticas;
- persistencia/HR/Finance/autorización verificadas;
- no proveedores no autorizados.

### I5.8 — freeze final

Estado válido: `ACTIVE_BASELINE_PHASE_A_PRODUCTION`.

Actualizar source lock, checkpoint, tracker, CAMBIOS, Claude, PENDIENTES, Academia y PR con el SHA productivo y pendientes post-go-live.

## 9. Circuit breakers permanentes

1. No volver a auditoría general sin drift/P0 nuevo reproducible.
2. No repetir PASS congelado.
3. No nueva candidata/rama/PR.
4. Un fallo dentro de I3/I4/I5 genera corrección focal y retoma el mismo subgate; no reinicia el plan.
5. No visualizar build viejo.
6. No porcentaje formal por subgate parcial.
7. No localStorage como verdad productiva.
8. No toast/éxito antes de ACK.
9. No fuzzy identity.
10. No reimportar HR para corregir composición.
11. No reconstruir Finanzas para incorporar un periodo nuevo.
12. No autoaceptar legal/NDA.
13. No Make/Gemini/Storage/HR writes/pagos/deploy/producción sin su gate.
14. No tratar asignación HR como postulación.
15. No hardcodear Cinépolis como arquitectura global.
16. No omitir Academia/manuales/rutas/notificaciones al cerrar un flujo.
17. Todo subgate debe cerrar con evidencia, HEAD y documentación; si no está documentado, no está cerrado.

## 10. Documentos que deben permanecer sincronizados

Después de cada bloque que cambie estado/secuencia, actualizar como mínimo:

1. `00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`;
2. este addendum maestro unificado;
3. source lock técnico más reciente;
4. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
5. `GO-LIVE-PROGRESS-TRACKER-ROOT-CAUSE-20260814.md`;
6. `CAMBIOS-BACKEND.md` o addendum de cambios;
7. `RESUMEN-PARA-CLAUDE.md`;
8. `PENDIENTES-PROTOTIPO.md`;
9. Academia/addendum aplicable;
10. PR #7 body;
11. manifest/build-lock/verificador cuando haya build/deploy.

**Regla de sincronización:** ningún documento puede anunciar como “siguiente acción” un subgate ya cerrado o una autorización consumida. El índice define cuál source lock y cuál plan de secuencia prevalecen.

## 11. Siguiente acción exacta

`I3.2_PHASE_A_AUTHORITY_COMPAT_RUNTIME_VALIDATION_AND_EXACT_DEV_DEPLOY_NO_REPROCESS`.

Primero validar source/runtime del mismo HEAD. Luego, bajo gate DEV explícito, desplegar exactamente ese HEAD y continuar I3.3→I3.11 sin regresar a Admin histórico, Shopper histórico, HR import o Finanzas reconstruidas.

## 12. Clasificación

- **Reusable CXOrbia:** crosswalk de planes, control S1→S6, gates por provider, same-build E2E, no-reproceso.
- **Exclusivo cliente:** TyA/Cinépolis, evidencias 15/660/44, mayo/junio/agosto.
- **Claude/prototipo:** no reconstruir módulos; cualquier P0 UI futuro solo focal y por archivo.
- **Academia:** I4.10 obligatorio; cada cambio funcional exige revisión de manuales/cursos/rutas/notificaciones.
- **Sin impacto Claude:** secuencia, gates, source locks y documentación backend interna.