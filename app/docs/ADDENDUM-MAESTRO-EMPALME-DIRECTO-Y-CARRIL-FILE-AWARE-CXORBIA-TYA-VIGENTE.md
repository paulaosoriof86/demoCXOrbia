# ADDENDUM MAESTRO — AUDITORÍA Y EMPALME DIRECTO FILE-AWARE CXORBIA TyA

**Fecha de emisión:** 2026-07-17  
**Última actualización:** 2026-07-22  
**Estado:** ACTIVO, DEFINITIVO, OBLIGATORIO Y PREVALENTE  
**Nombre canónico:** `ADDENDUM-MAESTRO-EMPALME-DIRECTO-Y-CARRIL-FILE-AWARE-CXORBIA-TYA-VIGENTE.md`

## 0. Corrección metodológica prevalente

Se corrige una causa raíz demostrada de demora: la versión anterior trataba el checkout local autenticado como requisito previo para **auditar**, aunque la sesión ya tuviera simultáneamente los bytes extraídos de la candidata, herramientas locales de análisis y lectura autoritativa de la rama mediante el conector GitHub.

Ese criterio producía un falso `EXECUTION_LANE_NOT_READY` y detenía auditorías que sí podían ejecutarse.

Desde esta versión se separan obligatoriamente dos capacidades distintas:

1. `AUDIT_LANE_READY`: capacidad de auditar la candidata de forma completa y compararla con la rama viva.
2. `APPLY_LANE_READY`: capacidad de aplicar atómicamente el delta GO y producir commit/push verificables.

La ausencia temporal de checkout local puede afectar la **aplicación atómica**, pero no puede volver a bloquear una auditoría cuando el carril de auditoría está listo.

## 1. Lock prevalente de empalme

Para toda candidata frontend auditada `GO` y sin `P0_PROVEN`, la única operación permitida continúa siendo:

`APPLY_DELTA_DIRECTLY`

sobre la rama viva `docs-tya-v6-v71-audit`.

Ningún documento, conversación, limitación temporal de herramienta, tamaño del ZIP o demora puede sustituir este método por `incoming/`, plan JSON, CMD/PowerShell, workflow transportador, nueva rama/PR, copias manuales, otra candidata o reconstrucción paralela.

Solo un `P0_PROVEN` con evidencia reproducible y autorización expresa de Paula en la conversación actual permite detener el empalme o proponer un cambio de método.

P1/P2 se documentan y no bloquean.

## 2. Mantenimiento y prevalencia

Este archivo es la única fuente maestra vigente para recepción, auditoría y empalme de candidatas CXOrbia TyA.

Se reemplaza bajo el mismo nombre. No se crean copias con fecha, `(1)`, `V2`, `final` ni documentos alternativos.

Ante contradicción con otro documento, prevalece este lock.

## 3. Lectura obligatoria

Antes de responder, auditar, modificar, documentar o cerrar un bloque:

1. `00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`;
2. documento maestro de continuidad vigente;
3. este addendum;
4. addenda vigentes de Academia, patrones reutilizables y antidesvío;
5. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
6. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
7. source lock/checkpoint contractual más reciente;
8. CAMBIOS, RESUMEN-PARA-CLAUDE y PENDIENTES vigentes;
9. PR #7 y HEAD de la rama viva.

No se piden datos ya entregados ni se reinician reglas, mapeos, adapters, contratos o Phase A.

## 4. Destino fijo

- Repo: `paulaosoriof86/demoCXOrbia`
- Rama viva: `docs-tya-v6-v71-audit`
- PR existente: `#7`
- Base: `release/cxorbia-tya-rc-20260630`
- Destino prohibido: `main`
- No nueva rama
- No nuevo PR
- No `force`

Antes de cualquier escritura se verifica repo, rama y HEAD. Si no coinciden, se detiene sin escribir.

## 5. Gate `AUDIT_LANE_READY`

Antes de auditar una candidata se registra:

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

### 5.1 Qué satisface cada requisito

- `CANDIDATE_BYTES_AVAILABLE`: el ZIP está montado en la sesión.
- `CANDIDATE_EXTRACTABLE`: se extrajo y se verificó su inventario.
- `LOCAL_AUDIT_RUNTIME_AVAILABLE`: existen herramientas para hashes, sintaxis, rutas, encoding, búsquedas, gates y comparación semántica.
- `AUTHORITATIVE_BRANCH_READ_AVAILABLE`: se pueden leer PR, HEAD y archivos vigentes desde GitHub mediante checkout o conector autoritativo.

`REPO_CHECKOUT_AVAILABLE` **no es requisito para declarar `AUDIT_LANE_READY`**.

Si los cuatro requisitos críticos anteriores son verdaderos, la auditoría debe comenzar inmediatamente. Una falla de DNS de `git clone`, ausencia de `gh` o falta de checkout local no autoriza detenerla.

### 5.2 Cuándo sí se declara `AUDIT_LANE_NOT_READY`

Solo cuando falta alguno de estos elementos:

- bytes reales de la candidata;
- capacidad de extraerlos;
- runtime local de auditoría;
- lectura autoritativa de la rama/HEAD.

En ese caso se declara el faltante exacto. No se inventa un bloqueo de checkout si la auditoría puede ejecutarse por otros medios autoritativos.

## 6. Gate `APPLY_LANE_READY`

La aplicación solo comienza después de `AUDITED_GO`.

Se registra:

```text
AUDITED_CANDIDATE_SHA256=<sha>
HEAD_BEFORE=<sha>
ATOMIC_DIRECT_APPLY_AVAILABLE=true
AUTHENTICATED_COMMIT_PUSH_AVAILABLE=true
TARGET_BRANCH=docs-tya-v6-v71-audit
```

`ATOMIC_DIRECT_APPLY_AVAILABLE` exige un mecanismo que produzca una sola mutación coherente de la rama con commit y push/ref verificables, preservando backend, contratos, adapters, tools, overlays y documentación viva.

No satisfacen este gate:

- escrituras secuenciales archivo por archivo mediante Contents API;
- blobs/trees usados como transporte fragmentado o reconstrucción manual;
- workflow transportador;
- PowerShell para Paula;
- nueva rama o PR;
- copias manuales.

Si la auditoría termina GO pero el carril de aplicación atómica aún no está listo, el estado correcto es:

`AUDITED_GO_APPLY_LANE_PENDING`

No se invalida la auditoría, no se pide otra candidata y no se repite el análisis salvo que cambie el SHA de la candidata o la rama se mueva de forma incompatible.

## 7. Continuidad de candidata y evidencia

Recepción, auditoría y aplicación deben conservar una identidad inmutable:

- mismo `CANDIDATE_SHA256`;
- mismo inventario auditado;
- reporte de auditoría persistente;
- `HEAD_BEFORE` registrado;
- delta nuevo separado de acumulado heredado;
- lista de overlays/backend protegidos.

Cuando auditoría y aplicación no puedan ocurrir en el mismo workspace físico, el source lock anterior sustituye la repetición del análisis. No se reaudita por rutina.

## 8. Estados válidos

- `AUDIT_LANE_NOT_READY`
- `AUDIT_LANE_READY`
- `AUDIT_INCOMPLETE`
- `P0_PROVEN`
- `AUDITED_GO`
- `AUDITED_GO_APPLY_LANE_PENDING`
- `APPLY_LANE_READY`
- `EMPALMED_PENDING_POST_GATES`
- `TECHNICAL_PASS_PENDING_VISUAL`
- `ACTIVE_BASELINE`

Después de `AUDITED_GO`, la siguiente operación es preparar o ejecutar la aplicación atómica; nunca volver a empezar la auditoría sin insumo nuevo.

## 9. Auditoría incremental obligatoria

La auditoría compara:

1. candidata actual;
2. candidata inmediata anterior cuando esté disponible;
3. baseline/source lock viva;
4. backend, contratos, adapters, tools, overlays y documentos que deben preservarse.

Se separa explícitamente:

- delta nuevo;
- acumulado heredado;
- ya empalmado;
- pendiente vivo;
- regresión;
- hallazgo nuevo;
- P0;
- P1/P2.

Se verifica como mínimo:

- SHA e inventario;
- sintaxis;
- `index.html`, scripts, rutas y módulos huérfanos;
- encoding UTF-8 sin BOM;
- secretos y datos sensibles;
- semántica de los módulos tocados;
- contratos/gates del corte;
- impacto en M1 congelado;
- Academia, manuales, roles y notificaciones;
- manifest/build-lock/verificador de entrega.

No se repite una auditoría cerrada sin insumo nuevo.

## 10. Criterio P0

Solo bloquea evidencia reproducible de:

- app que no inicia;
- sintaxis o ruta esencial rota;
- pérdida crítica;
- secreto o dato sensible expuesto;
- write, deploy, proveedor, pago o producción no autorizado;
- regresión que impida Phase A.

P1/P2 se documentan y no bloquean el empalme.

## 11. Operación cuando hay GO

Al alcanzar `AUDITED_GO` y `APPLY_LANE_READY`:

1. confirmar el mismo SHA auditado;
2. congelar `HEAD_BEFORE`;
3. aplicar únicamente el delta auditado directamente a la rama viva;
4. preservar backend, contratos, adapters, tools, overlays y documentos vivos;
5. confirmar cero archivos del delta pendientes;
6. ejecutar verificaciones estructurales mínimas;
7. crear un único commit de empalme;
8. hacer push/ref update verificable;
9. registrar `HEAD_AFTER`;
10. generar manifest, build-lock y verificador nuevos;
11. ejecutar gates post-empalme;
12. ejecutar validación visual;
13. corregir focalizadamente diferencias reproducibles;
14. congelar baseline solo con evidencia y `APROBADO`.

Una candidata completa entregada por Claude no autoriza reemplazar `app/` a ciegas. Se aplica el delta auditado y se preservan los overlays vivos de la rama.

## 12. Atomicidad

Una candidata solo está empalmada cuando existen conjuntamente:

- commit SHA verificable;
- push/ref update comprobado;
- delta completo;
- cero archivos pendientes;
- backend y overlays protegidos;
- documentos vivos reconciliados;
- `HEAD_AFTER` registrado.

Ante fallo durante la aplicación:

1. detener;
2. no continuar con otro archivo;
3. restaurar el estado previo cuando corresponda;
4. documentar el fallo exacto;
5. no declarar unión parcial.

## 13. Preservación obligatoria

Se conserva:

- interfaz exacta de `CX.data`;
- backend nuevo y limpio;
- contratos, adapters, tools, gates y overlays;
- multi-tenant por `tenantId`;
- multi-proyecto por `projectId`;
- Cinépolis como proyecto configurable;
- HR e histórico completo;
- shoppers, postulaciones y certificaciones;
- liquidaciones y pagos;
- sincronización HR/plataforma;
- Academia, manuales, rutas por rol y notificaciones;
- UTF-8 sin BOM;
- ausencia de secretos y datos sensibles.

No se conecta ni copia la base vieja. No se parchea UI desde backend.

## 14. Documentos vivos

Se reconcilian, no se reemplazan a ciegas:

- `CAMBIOS-BACKEND.md` y addendum vigente;
- `RESUMEN-PARA-CLAUDE.md` y addendum vigente;
- `PENDIENTES-PROTOTIPO.md` y addendum vigente;
- documentación de Academia;
- tracker, source lock y checkpoint;
- manifest/build-lock/verificador;
- PR #7.

## 15. Prohibiciones

Queda prohibido:

- detener una auditoría lista únicamente porque no existe checkout local;
- confundir `AUDIT_LANE_READY` con `APPLY_LANE_READY`;
- aplicar una candidata completa archivo por archivo mediante Contents API;
- usar Base64, Drive, `incoming/`, plan JSON, `.cmd` o PowerShell para Paula;
- workflow como transportador;
- nueva rama o PR;
- escribir en `main`;
- solicitar otra candidata cuando la actual ya fue auditada GO;
- reauditar por falta temporal del carril de aplicación;
- declarar éxito sin commit, push y HEAD verificables.

## 16. Circuit breaker antidemora

1. La primera respuesta operativa indica `AUDIT_LANE_READY` o el faltante real.
2. Si está READY, se audita en esa misma sesión sin esperar checkout local.
3. No más de un bloque de diagnóstico sin evidencia o cambio de estado.
4. Después de GO, se informa `APPLY_LANE_READY` o `AUDITED_GO_APPLY_LANE_PENDING`.
5. La falta de carril de aplicación no borra ni reinicia la auditoría.
6. No se promete trabajo en segundo plano.
7. No se traslada trabajo manual a Paula.

## 17. Estado seguro

Este addendum no autoriza merge, deploy, producción, import real, Firestore/Auth/Storage/HR writes, Make/Gemini live, pagos ni proveedores externos.
