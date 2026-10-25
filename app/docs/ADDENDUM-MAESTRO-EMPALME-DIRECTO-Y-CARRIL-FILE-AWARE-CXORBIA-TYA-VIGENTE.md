# ADDENDUM MAESTRO — AUDITORÍA, EMPALME DIRECTO Y RUNNERS CONTROLADOS CXORBIA TyA

**Fecha de emisión:** 2026-07-17  
**Última actualización:** 2026-07-23  
**Estado:** ACTIVO, DEFINITIVO, OBLIGATORIO Y PREVALENTE  
**Nombre canónico:** `ADDENDUM-MAESTRO-EMPALME-DIRECTO-Y-CARRIL-FILE-AWARE-CXORBIA-TYA-VIGENTE.md`

## 0. Objeto y prevalencia

Este documento es la única fuente maestra vigente para recepción, auditoría, empalme directo y ejecución de gates post-empalme de candidatas CXOrbia TyA.

Se mantiene bajo el mismo nombre. No se crean copias paralelas con fecha, `(1)`, `V2`, `final` ni metodologías alternas.

Ante contradicción con cualquier documento previo, conversación, agente o procedimiento, prevalece este addendum y la autorización expresa vigente de Paula.

## 1. Correcciones metodológicas acumuladas

Se mantienen cerradas cuatro causas raíz:

1. `FALSE_AUDIT_LANE_BLOCKED_BY_LOCAL_CHECKOUT`: una auditoría no se detiene por ausencia de checkout local cuando existen bytes reales, runtime local de auditoría y lectura autoritativa de la rama.
2. `PRE_GATE_NOT_RECONCILED_WITH_EXACT_HEAD_OVERLAY_COMPOSITE`: ningún PASS es válido si no identifica candidata, HEAD, overlay, gate y composite exactos.
3. `CODEX_DEPENDENCY_CAUSED_BY_MISSING_CONTROLLED_GITHUB_LANES`: Codex no debe ser requisito operativo para empalmes ni gates cuando los runners controlados estén disponibles.
4. `MUTABLE_OPERATIONAL_FIELDS_USED_AS_VISIT_IDENTITY`: ningún campo mutable como cinema, shopping, quincena, franja, shopper, fecha o monto puede formar parte de la identidad estable de una visita.

## 2. Destino fijo

- Repo: `paulaosoriof86/demoCXOrbia`
- Rama viva: `docs-tya-v6-v71-audit`
- PR vigente: `#7`, siempre draft/open/no merge hasta autorización distinta
- Base: `release/cxorbia-tya-rc-20260630`
- Destino prohibido: `main`
- Nueva rama: prohibida
- Nuevo PR: prohibido
- Force push: prohibido

Antes de cualquier escritura se verifican repo, rama, PR y HEAD. Si el HEAD esperado no coincide, se detiene sin escribir.

## 3. Lectura obligatoria

Antes de responder, auditar, modificar, documentar o cerrar un bloque se leen:

1. `00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`;
2. documento maestro de continuidad vigente;
3. este addendum;
4. addenda vigentes de Academia, patrones reutilizables y antidesvío;
5. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
6. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
7. source lock/manifest más reciente;
8. CAMBIOS, RESUMEN-PARA-CLAUDE y PENDIENTES vigentes;
9. PR #7 y HEAD remoto vivo.

No se piden datos ya entregados ni se reinician reglas, mapeos, adapters, contratos, histórico o Phase A.

## 4. Lock prevalente de empalme

Para toda candidata frontend auditada `GO` y sin `P0_PROVEN`, la operación funcional permitida continúa siendo:

`APPLY_DELTA_DIRECTLY`

sobre `docs-tya-v6-v71-audit`.

Se aplica únicamente el delta auditado. Una candidata completa no autoriza reemplazar `app/` a ciegas.

P1/P2 se documentan y no bloquean. Solo un `P0_PROVEN` reproducible y autorización expresa de Paula permite detener el empalme o cambiar el método.

## 5. Gate `AUDIT_LANE_READY`

La auditoría comienza cuando se registran:

```text
CANDIDATE_BYTES_AVAILABLE=true
CANDIDATE_EXTRACTABLE=true
LOCAL_AUDIT_RUNTIME_AVAILABLE=true
AUTHORITATIVE_BRANCH_READ_AVAILABLE=true
TARGET_REPOSITORY=paulaosoriof86/demoCXOrbia
TARGET_BRANCH=docs-tya-v6-v71-audit
HEAD_BEFORE=<sha>
CANDIDATE_SHA256=<sha>
```

`REPO_CHECKOUT_AVAILABLE` no es requisito para auditar. Una falla de DNS, `git clone`, `gh` o ausencia temporal de checkout no autoriza detener una auditoría posible.

## 6. Gate `APPLY_LANE_READY`

La aplicación solo comienza después de `AUDITED_GO` y exige:

```text
AUDITED_CANDIDATE_SHA256=<sha>
HEAD_BEFORE=<sha>
ATOMIC_DIRECT_APPLY_AVAILABLE=true
AUTHENTICATED_COMMIT_PUSH_AVAILABLE=true
TARGET_BRANCH=docs-tya-v6-v71-audit
```

Desde esta actualización, `ATOMIC_DIRECT_APPLY_AVAILABLE` puede satisfacerse exclusivamente mediante:

- checkout Git autenticado nativo; o
- `CXORBIA_ATOMIC_APPLY_RUNNER`.

No lo satisfacen:

- Contents API secuencial para archivos funcionales;
- mutación funcional directa mediante blobs/trees fuera del runner;
- workflow genérico o transportador;
- `incoming/`;
- plan JSON como sustituto del empalme;
- Drive/Base64 manual;
- PowerShell/CMD para Paula;
- copias manuales;
- nueva rama o PR.

Si hay GO pero no hay carril atómico, el estado es `AUDITED_GO_APPLY_LANE_PENDING`. No se reaudita ni se pide otra candidata.

## 7. Autorización exclusiva de runners controlados

Paula autorizó expresamente el 2026-07-22 únicamente estos dos runners:

1. `CXORBIA_ATOMIC_APPLY_RUNNER`
2. `CXORBIA_READONLY_POST_GATES_RUNNER`

Contrato canónico:

- `backend/contracts/cxorbia-controlled-runners-v1.json`

Gate estructural:

- `tools/qa/cxorbia-controlled-runners-contract-gate.mjs`

Ningún otro workflow queda autorizado por esta excepción.

## 8. `CXORBIA_ATOMIC_APPLY_RUNNER`

Archivos canónicos:

- workflow: `.github/workflows/cxorbia-atomic-apply-runner.yml`;
- ejecutor: `tools/release/cxorbia-atomic-apply-runner.mjs`;
- solicitud de control: `.github/cxorbia-apply-requests/request.json`.

### 8.1 Propósito

Aplicar un delta previamente auditado en un checkout completo de GitHub Actions y producir un único commit funcional verificable en la rama viva.

### 8.2 Requisitos de solicitud

La solicitud debe incluir como mínimo:

- `candidateSha256`;
- `packageSha256`;
- `expectedParentSha`;
- source lock vigente;
- lista exacta de archivos;
- operación `create`, `replace` o `delete`;
- SHA-256 actual esperado por archivo;
- SHA-256 final esperado;
- tamaño esperado;
- Git blob SHA que contiene exactamente los bytes auditados;
- mensaje de commit;
- todos los flags de deploy, merge, producción, proveedor y datos en `false`.

### 8.3 Atomicidad

El runner:

1. verifica que el commit de solicitud solo contiene el archivo de control;
2. confirma que `HEAD^` coincide con `expectedParentSha`;
3. descarga cada blob desde GitHub;
4. verifica tamaño, SHA-256, UTF-8/BOM, secretos y sintaxis;
5. verifica el SHA-256 del archivo existente antes de reemplazar o eliminar;
6. rechaza rutas fuera del alcance autorizado;
7. elimina la solicitud de control;
8. stagea exactamente delta + retiro de solicitud;
9. crea un solo commit funcional;
10. hace push no forzado a la rama viva;
11. publica evidencia sanitizada y comenta PR #7.

La solicitud es efímera y no permanece en el commit funcional.

### 8.4 Protección

Por defecto solo puede tocar rutas auditadas bajo `app/` y bloquea:

- `backend/`;
- `tools/`;
- `.github/`;
- Functions y otros proveedores;
- build-lock y overlays protegidos;
- datos HR source-safe protegidos.

Una ampliación de alcance exige modificar primero el contrato canónico, gate PASS y autorización expresa de Paula.

### 8.5 Regla de blobs

Los Git blobs solo son un contenedor interno de bytes exactos para el runner. No pueden usarse para reconstrucción manual, mutación directa del árbol funcional ni empalmes fuera del runner.

## 9. `CXORBIA_READONLY_POST_GATES_RUNNER`

Archivos canónicos:

- workflow: `.github/workflows/cxorbia-readonly-post-gates-runner.yml`;
- ejecutor: `tools/release/cxorbia-readonly-post-gates-runner.mjs`;
- solicitud: `.github/cxorbia-gate-requests/request.json`.

### 9.1 Propósito

Ejecutar en un entorno efímero reproducible perfiles de gates autorizados. Playwright, Chromium y servidor local se instalan o levantan solamente cuando el perfil los requiere.

### 9.2 Permisos y límites

- `contents: read`;
- comentario sanitizado en PR #7;
- artifacts sanitizados;
- cero commit/push;
- cero deploy/merge/producción;
- cero imports/pagos;
- cero Firestore/Auth/Storage/HR writes;
- cero Make/Gemini;
- lecturas públicas/source-safe permitidas solo para gates autorizados.

### 9.3 Identidad estable obligatoria

Versión:

`tya-stable-visit-id-r20-row-identity-v1`

Campos canónicos:

`tenantId + projectId + periodKey + country + sourceRow`.

Campos mutables excluidos:

- cinemaId;
- shopping;
- quincena;
- franja;
- shopper;
- fechas;
- montos.

La identidad estable se ejecuta y verifica en el filtro runtime del inventario, payload source-safe y perfiles V174/Corte 3. Un cambio de campo mutable no puede producir un nuevo `visitId`.

### 9.4 Perfil `V174_R20_M1_CORTE2A`

Ejecuta:

1. sintaxis y variantes del builder R20;
2. builder de inventario;
3. filtro runtime e identidad estable;
4. payload source-safe y aplicación idempotente;
5. HR in-place;
6. contexto/histórico/reportes;
7. proyecto/periodo/KPI con navegador;
8. Corte 2A canónico;
9. lock compuesto M1;
10. propuesta de source lock después del build;
11. verificación efímera del composite exacto contra la propuesta.

El source lock propuesto se usa dentro del checkout efímero y se restaura antes de terminar. No implica commit ni push.

### 9.5 Perfil `CORTE3_FINANCIAL_RECONCILIATION_R20`

Ejecuta sin navegador:

1. builder R20 e inventario vigente;
2. filtro runtime con identidad estable;
3. gate del payload source-safe;
4. conciliación del workbook financiero source-safe contra la HR vigente;
5. comparación por `sourceRecordId`, `hrRowId`, llaves estables e identidad de enlace;
6. verificación de 14 periodos, 616 visitas, 247 filas financieras y 34 GT/10 HN por periodo;
7. revisión contra `backend/contracts/tya-corte3-financial-r20-delta-review-v1.json`;
8. bloqueo de todo delta no revisado, identidad canónica alterada, duplicado, evidencia inventada o pago inferido.

El PASS revisado vigente conserva:

- 209 enlaces exactos;
- 38 filas en revisión;
- 79 entradas en review queue;
- 15 enlaces nuevos técnicamente revisados;
- dos enlaces retirados y mantenidos sin vínculo por monto/detalle;
- un cambio de estado mantenido sin vínculo por referencia de shopper;
- cero cambios de `hrRowId` canónico;
- cero pagos ejecutados.

Este perfil no importa, no paga, no escribe repositorio ni proveedores, no despliega y no toca producción.

No se declara PASS compuesto si algún gate queda HOLD.

## 10. Bootstrap único autorizado

La creación inicial de contratos, scripts, workflows y documentación de estos runners puede realizarse mediante commits de infraestructura controlados en la rama viva porque los runners todavía no existían.

Esta excepción:

- fue autorizada expresamente por Paula;
- no aplica una candidata ni modifica delta funcional;
- no autoriza futuros empalmes por Contents API;
- termina cuando ambos runners y su gate contractual quedan instalados.

Después del bootstrap, toda futura candidata GO debe usar checkout Git nativo o `CXORBIA_ATOMIC_APPLY_RUNNER`.

## 11. Continuidad de candidata y evidencia

Recepción, auditoría, aplicación y post-gates conservan identidad inmutable:

- candidate SHA;
- package SHA;
- inventario;
- HEAD_BEFORE;
- delta exacto;
- overlays/backend protegidos;
- source lock;
- SHA del gate;
- composite exacto;
- salida real del gate;
- HEAD_AFTER.

Cuando auditoría y aplicación ocurren en workspaces distintos, el source lock sustituye la repetición del análisis.

## 12. Estados válidos

- `AUDIT_LANE_NOT_READY`
- `AUDIT_LANE_READY`
- `AUDIT_INCOMPLETE`
- `P0_PROVEN`
- `AUDITED_GO`
- `AUDITED_GO_APPLY_LANE_PENDING`
- `APPLY_LANE_READY`
- `EMPALMED_PENDING_POST_GATES`
- `POST_GATES_HOLD`
- `TECHNICAL_PASS_PENDING_VISUAL`
- `ACTIVE_BASELINE`

Después de GO nunca se reinicia auditoría sin un insumo nuevo o movimiento incompatible de la rama.

## 13. Auditoría incremental obligatoria

Se compara candidata actual, candidata inmediata anterior disponible, baseline/source lock viva y recursos protegidos.

Se separa delta nuevo, acumulado heredado, ya empalmado, pendiente vivo, regresión, hallazgo nuevo, P0 y P1/P2.

Se verifican SHA, inventario, sintaxis, rutas, scripts, encoding, secretos, semántica, contratos, gates, impacto M1, Academia, roles, notificaciones y lock de build.

## 14. Criterio P0

Solo bloquea evidencia reproducible de:

- app que no inicia;
- sintaxis o ruta esencial rota;
- pérdida crítica;
- secreto o dato sensible;
- write/deploy/proveedor/pago/producción no autorizado;
- regresión que impida Phase A.

P1/P2 se documentan y no bloquean.

## 15. Operación después de GO

Con `AUDITED_GO + APPLY_LANE_READY`:

1. confirmar candidate SHA y HEAD;
2. aplicar únicamente delta auditado;
3. preservar backend, contratos, adapters, tools, overlays y docs vivos;
4. crear un único commit funcional;
5. verificar push y HEAD_AFTER;
6. regenerar manifest/build-lock/verificador;
7. ejecutar post-gates en runner read-only;
8. construir Hosting DEV solo con autorización separada;
9. validar visualmente;
10. corregir diferencias reproducibles;
11. congelar solo con evidencia y `APROBADO`.

## 16. Preservación obligatoria

Se conserva la interfaz exacta de `CX.data`, backend nuevo y limpio, contratos, adapters, tools, gates, overlays, multi-tenant, multi-proyecto, Cinépolis configurable, HR e histórico, shoppers, postulaciones, certificaciones, liquidaciones separadas de pagos, sincronización HR/plataforma, Academia, roles, notificaciones y UTF-8 sin BOM.

No se conecta ni copia la base vieja. No se parchea UI desde backend. No se suben secretos ni datos sensibles crudos.

## 17. Documentación obligatoria

Cada bloque actualiza índice, checkpoint, CAMBIOS-BACKEND, RESUMEN-PARA-CLAUDE, PENDIENTES-PROTOTIPO, Academia, tracker/source lock y PR #7.

Cada cambio se clasifica como Reusable CXOrbia, Exclusivo cliente, Claude/prototipo, Academia y Sin impacto Claude.

Si no está documentado, no se hizo.

## 18. Prohibiciones vigentes

Continúa prohibido:

- detener una auditoría lista por falta de checkout local;
- confundir auditoría con aplicación;
- usar Contents API secuencial para delta funcional;
- usar blobs/trees fuera del runner controlado;
- usar workflows distintos de los dos autorizados como transportadores;
- `incoming/`, Drive/Base64 manual, CMD/PowerShell para Paula o copias manuales;
- nueva rama/PR;
- `main`;
- force push;
- pedir otra candidata ya auditada GO;
- reauditar por falta temporal de carril;
- declarar éxito sin commit, push, HEAD y evidencia.

## 19. Circuit breaker antidemora

1. La primera respuesta operativa indica carril listo o faltante real.
2. Si la auditoría está lista, se ejecuta en la misma sesión.
3. No más de un bloque de diagnóstico sin evidencia o cambio de estado.
4. Tras GO se ejecuta o prepara el carril atómico; no se reinicia.
5. Los gates de navegador se ejecutan en el runner read-only; no se trasladan a Codex por defecto.
6. No se promete trabajo en segundo plano.
7. No se traslada trabajo manual a Paula.

## 20. Estado seguro

Este addendum no autoriza Hosting DEV, deploy, merge, producción, import real, Firestore/Auth/Storage/HR writes, Make/Gemini live, pagos ni proveedores con escritura.

Cada una de esas operaciones conserva su gate y autorización específica independiente.
