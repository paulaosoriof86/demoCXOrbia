# ADDENDUM MAESTRO — EMPALME DIRECTO Y CARRIL ATÓMICO CXORBIA TyA

**Fecha de emisión:** 2026-07-17  
**Estado:** ACTIVO, DEFINITIVO, OBLIGATORIO Y PREVALENTE  
**Nombre canónico permanente:** `ADDENDUM-MAESTRO-EMPALME-DIRECTO-Y-CARRIL-FILE-AWARE-CXORBIA-TYA-VIGENTE.md`

## 0. Prevalencia y mantenimiento

Este archivo es la única fuente maestra vigente para recepción, auditoría y empalme de candidatas frontend CXOrbia TyA.

Cuando se actualice, se reemplaza el contenido de este mismo archivo. No se crean copias con fechas, sufijos `(1)`, `V2`, `final` ni documentos paralelos.

Este addendum sustituye cualquier regla anterior que prohíba de forma absoluta los objetos Git internos. Los objetos `blob`, `tree`, `commit` y `ref` son mecanismos nativos de Git y pueden utilizarse únicamente dentro del carril atómico definido aquí. Continúa prohibido usarlos como transporte manual, fragmentado o como metodología alternativa.

Ante cualquier contradicción de empalme, prevalece este archivo.

## 1. Propósito

Evitar dos errores:

1. auditar una candidata sin tener una ruta real para aplicarla;
2. bloquear el empalme directo por confundir los objetos internos de Git con transportes manuales o rutas paralelas.

La metodología aprobada conserva esta experiencia:

`Paula adjunta ZIP → auditoría delta → GO/P0 → APPLY_DELTA_DIRECTLY → commit verificable → gates → validación visual`

Paula no descomprime, no ejecuta comandos, no prepara ramas y no transporta archivos.

## 2. Lectura obligatoria

Antes de responder, planear, auditar, modificar, documentar o cerrar un bloque se lee, en este orden:

1. `00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`;
2. documento maestro de continuidad vigente;
3. este addendum;
4. addenda vigentes de Academia, patrones reutilizables y antidesvío;
5. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
6. source lock/checkpoint más reciente del repositorio;
7. `CAMBIOS-BACKEND.md` o addendum vigente;
8. `RESUMEN-PARA-CLAUDE.md` o addendum vigente;
9. `PENDIENTES-PROTOTIPO.md` o addendum vigente;
10. PR #7 y HEAD de la rama viva.

No se piden datos ya entregados ni se reinician metodología, reglas, mapeos o Phase A.

## 3. Destino fijo actual

- Repositorio: `paulaosoriof86/demoCXOrbia`
- Rama viva: `docs-tya-v6-v71-audit`
- PR existente: `#7`
- Base del PR: `release/cxorbia-tya-rc-20260630`
- Destino prohibido: `main`
- No nueva rama
- No nuevo PR

Antes de escribir y antes de mover el ref se comprueba nuevamente repositorio, rama y `HEAD_BEFORE`.

## 4. Dos carriles técnicos equivalentes

La metodología permite dos implementaciones técnicas equivalentes. Ambas deben producir un commit atómico sobre la rama viva.

### Carril A — checkout file-aware

Disponible cuando la sesión tiene simultáneamente:

- ZIP real y extraíble;
- checkout autenticado;
- rama viva;
- capacidad de commit y push;
- validadores y documentación acumulada.

### Carril B — Git nativo atómico autenticado

Disponible cuando la sesión tiene simultáneamente:

- bytes reales y extraíbles de la candidata;
- lectura verificable del `HEAD_BEFORE`;
- resolución verificable del árbol base;
- capacidad autenticada para crear objetos Git nativos;
- capacidad para crear un único commit con `HEAD_BEFORE` como padre;
- capacidad para actualizar por fast-forward exclusivamente `docs-tya-v6-v71-audit`;
- comprobación posterior del commit, diff y `HEAD_AFTER`.

En este carril se permite internamente:

- crear blobs desde los archivos auditados;
- crear un tree basado en el árbol vivo;
- crear un commit único;
- mover el ref de la rama por fast-forward.

Esto no constituye transporte alternativo. Es la representación nativa de un commit Git.

## 5. Gate `EXECUTION_LANE_READY`

Antes de auditar una nueva candidata se registra:

```text
CANDIDATE_BYTES_AVAILABLE=true
CANDIDATE_EXTRACTABLE=true
TARGET_REPOSITORY=paulaosoriof86/demoCXOrbia
TARGET_BRANCH=docs-tya-v6-v71-audit
HEAD_BEFORE=<sha>
```

Además debe quedar listo al menos uno:

```text
FILE_AWARE_CHECKOUT_LANE=true
```

o:

```text
ATOMIC_GIT_OBJECT_LANE=true
BASE_TREE_RESOLVED=true
FAST_FORWARD_REF_UPDATE_AVAILABLE=true
```

Si el carril aplicable está completo, el estado es `EXECUTION_LANE_READY`.

Si ninguno está completo, el estado es `EXECUTION_LANE_NOT_READY`.

En `EXECUTION_LANE_NOT_READY` no se inicia auditoría extensa, no se declara GO y no se pide otra candidata. Se identifica el bloqueo exacto sin trasladar trabajo técnico a Paula.

## 6. Regla de continuidad

La candidata, el hash, el inventario, la auditoría, la decisión y la aplicación pertenecen al mismo bloque operativo.

Si una candidata ya fue auditada GO y sus bytes vuelven a adjuntarse con contenido idéntico, no se reaudita. Se retoma directamente desde `APPLY_DELTA_DIRECTLY`.

## 7. Estados válidos

- `EXECUTION_LANE_NOT_READY`
- `EXECUTION_LANE_READY`
- `AUDIT_INCOMPLETE`
- `P0_PROVEN`
- `AUDITED_GO_READY_DIRECT_APPLY`
- `EMPALMED_PENDING_POST_GATES`
- `ACTIVE_BASELINE`

Una candidata GO no regresa a planificación, transporte, instalación, nueva candidata o reauditoría general.

## 8. Criterio P0

Solo detiene el empalme un `P0_PROVEN` con evidencia reproducible de:

- aplicación que no inicia;
- sintaxis crítica rota;
- ruta esencial rota;
- pérdida crítica o eliminación no autorizada;
- secreto o dato sensible expuesto;
- write, deploy, proveedor, pago o producción no autorizado;
- regresión que impida Phase A.

P1/P2 se documentan y no bloquean.

## 9. `APPLY_DELTA_DIRECTLY`

Cuando la candidata queda `AUDITED_GO_READY_DIRECT_APPLY`:

1. congelar `HEAD_BEFORE`;
2. confirmar que el HEAD no cambió;
3. aplicar solo el delta auditado;
4. preservar backend, contratos, adapters, tools, overlays TyA y documentos vivos;
5. reconciliar documentación, no sobrescribirla a ciegas;
6. generar manifest, build-lock y verificador;
7. crear un único commit de empalme;
8. actualizar la rama viva exclusivamente por fast-forward;
9. registrar commit y `HEAD_AFTER`;
10. ejecutar gates;
11. solicitar validación visual;
12. congelar baseline si los gates pasan.

## 10. Condiciones del carril Git atómico

El uso de blobs/trees internos solo está permitido si:

- los blobs provienen exactamente de la candidata auditada o de documentación reconciliada;
- el tree parte del árbol vivo verificado;
- no se crea rama temporal;
- no se crea PR nuevo;
- no se usa workflow;
- no se escribe en `main`;
- no se realizan commits parciales sobre la rama;
- el commit tiene como padre el `HEAD_BEFORE`;
- el ref se mueve sin `force`;
- el diff final se verifica antes de declarar éxito;
- ante cualquier fallo, el ref no se mueve.

Objetos Git no referenciados usados para verificación técnica no modifican la rama y no constituyen empalme.

## 11. Atomicidad

Una candidata solo pasa a `EMPALMED_PENDING_POST_GATES` cuando existen:

- commit SHA verificable;
- fast-forward comprobado;
- delta completo;
- cero archivos pendientes;
- backend protegido preservado;
- documentos vivos reconciliados;
- `HEAD_AFTER` registrado.

Tener algunos archivos copiados o varios commits parciales no constituye empalme.

## 12. Preservación obligatoria

Se conserva:

- backend nuevo y limpio;
- interfaz exacta de `CX.data`;
- contratos, adapters, tools, gates y validadores;
- overlays TyA source-safe;
- multi-tenant por `tenantId`;
- multi-proyecto por `projectId`;
- selección explícita de proyecto;
- Cinépolis como proyecto configurable, nunca lógica global;
- HR e histórico;
- shoppers y postulaciones;
- certificaciones presentadas;
- liquidaciones y pagos;
- sincronización HR/plataforma;
- Academia, manuales, rutas por rol y notificaciones;
- UTF-8 sin BOM;
- ausencia de secretos y datos sensibles.

No se conecta ni copia la base vieja. No se parchea UI desde backend.

## 13. Documentos vivos

No se reemplazan a ciegas:

- `CAMBIOS-BACKEND.md`;
- `RESUMEN-PARA-CLAUDE.md`;
- `PENDIENTES-PROTOTIPO.md`;
- Academia;
- checkpoint/source lock;
- manifest/build-lock/verificador;
- `AGENTS.md`;
- este addendum.

## 14. Prohibiciones absolutas

Queda prohibido:

- aplicar la candidata archivo por archivo mediante Contents API;
- usar `update_file` serial como transporte del ZIP;
- usar blobs/trees como transporte manual, fragmentado o fuera de un commit atómico;
- Base64, Drive, `incoming/`, plan JSON, `.cmd` o PowerShell para Paula;
- workflows o Actions como transportador;
- nueva rama o PR;
- escribir en `main`;
- mover el ref con `force`;
- pedir otra candidata cuando la actual está GO;
- reauditar por una limitación de herramienta;
- declarar éxito sin commit, diff y HEAD verificables.

## 15. Circuit breaker antidemora

1. La primera respuesta operativa registra el carril.
2. Después de GO, la siguiente operación es aplicar.
3. No se abre otra metodología.
4. Si el HEAD cambia antes del fast-forward, se detiene y se recalcula.
5. Nunca se promete trabajo en segundo plano.
6. Nunca se afirma empalme sin evidencia.
7. No puede transcurrir otro bloque explicativo sin cambio de estado o evidencia nueva.

## 16. Gates posteriores mínimos

- sintaxis JS/MJS;
- `index.html`, scripts y rutas;
- módulos únicos y no huérfanos;
- proyecto frente a periodo;
- histórico diferenciado;
- 14 periodos;
- 616 visitas;
- 44 visitas por periodo;
- junio ejecutado y liquidaciones/pagos pendientes;
- país y moneda;
- shoppers históricos;
- certificaciones presentadas;
- smoke Admin, Shopper y Cliente;
- Academia, manuales, rutas por rol y notificaciones;
- ausencia de secretos;
- ausencia de promesas falsas de integraciones.

Los gates se ejecutan después del empalme y no son excusa para retrasarlo.

## 17. Responsabilidad operativa

Paula únicamente adjunta la candidata más reciente.

Corresponde al asistente seleccionar el carril, extraer, auditar, aplicar, preservar, reconciliar, crear commit, mover la rama, validar y documentar.

No se trasladan tareas técnicas manuales a Paula.

## 18. Documentación y cierre

Cada bloque registra:

- qué se hizo;
- avance Phase A;
- qué se preservó;
- qué se documentó para Claude;
- qué se documentó para Academia;
- pendiente real;
- siguiente bloque exacto;
- estado seguro;
- bloqueo comprobado.

Clasificación:

- Reusable CXOrbia;
- Exclusivo cliente;
- Claude/prototipo;
- Academia;
- Sin impacto Claude.

## 19. Estado seguro

Este addendum no autoriza merge, deploy, producción, importaciones reales, Firestore/Auth/Storage/HR writes, Make/Gemini live, pagos ni proveedores externos.