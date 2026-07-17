# ADDENDUM MAESTRO — EMPALME DIRECTO Y CARRIL FILE-AWARE CXORBIA TyA

**Fecha de emisión:** 2026-07-17  
**Estado:** ACTIVO, DEFINITIVO, OBLIGATORIO Y PREVALENTE  
**Nombre canónico permanente:** `ADDENDUM-MAESTRO-EMPALME-DIRECTO-Y-CARRIL-FILE-AWARE-CXORBIA-TYA-VIGENTE.md`

## 0. Regla de actualización y prevalencia

Este archivo es la única fuente maestra vigente para recepción, auditoría y empalme de candidatas frontend CXOrbia TyA.

En futuras actualizaciones se reemplaza el contenido de este mismo archivo. No se crean copias con fechas, sufijos `(1)`, versiones paralelas ni documentos alternativos.

Este addendum incorpora, sustituye y deja como históricos los documentos anteriores relacionados con empalmes directos y carril de ejecución. Ante cualquier contradicción prevalece este archivo.

Ninguna conversación, agente, limitación temporal de herramienta, demora, tamaño del ZIP o documento anterior puede cambiar el método aquí definido.

## 1. Problema que corrige

El error metodológico repetido fue separar dos capacidades:

1. la candidata estaba disponible como ZIP y podía auditarse;
2. el repositorio estaba disponible solo mediante llamadas aisladas.

Se auditaba primero y después se intentaba reconstruir el empalme con otro carril. Esto provocó demoras, aplicaciones parciales, reauditorías, rutas alternativas y riesgo de escribir en un destino incorrecto.

La solución definitiva es inseparable:

`MISMA SESIÓN + CANDIDATA DESCOMPRIMIDA + CHECKOUT AUTENTICADO + RAMA VIVA + AUDITORÍA + EMPALME`

No se audita una candidata completa si la misma sesión no puede empalmarla inmediatamente cuando resulte GO.

## 2. Lectura obligatoria antes de actuar

Antes de responder, planear, auditar, modificar, documentar, pedir información o cerrar un bloque se debe leer, en este orden:

1. `00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`.
2. El documento maestro de continuidad vigente indicado por el índice.
3. Este addendum.
4. Los addenda vigentes de Academia, patrones reutilizables y antidesvío.
5. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`.
6. El checkpoint/source lock más reciente del repositorio.
7. `CAMBIOS-BACKEND.md` o addendum vigente.
8. `RESUMEN-PARA-CLAUDE.md` o addendum vigente.
9. `PENDIENTES-PROTOTIPO.md` o addendum vigente.
10. El estado actual de PR #7 y el HEAD de la rama viva.

No se piden datos ya entregados ni se reinician metodología, lógicas, acuerdos, mapeos o plan de Phase A.

## 3. Destino fijo actual

Para CXOrbia TyA:

- repositorio: `paulaosoriof86/demoCXOrbia`;
- rama viva: `docs-tya-v6-v71-audit`;
- PR: `#7`;
- base del PR: `release/cxorbia-tya-rc-20260630`;
- destino prohibido: `main`;
- no se crea otra rama;
- no se crea otro PR.

Antes de modificar, antes de commit y antes de push se vuelve a comprobar repositorio, rama y HEAD. Si cualquiera no coincide, se detiene sin escribir.

## 4. Gate obligatorio del carril antes de auditar

La primera operación al recibir una candidata es comprobar y registrar:

```text
CANDIDATE_BYTES_AVAILABLE=true
CANDIDATE_EXTRACTABLE=true
REPO_CHECKOUT_AVAILABLE=true
TARGET_REPOSITORY=paulaosoriof86/demoCXOrbia
TARGET_BRANCH=docs-tya-v6-v71-audit
AUTHENTICATED_COMMIT_PUSH_AVAILABLE=true
HEAD_BEFORE=<sha>
WORKTREE_STATE=<clean|documented>
```

Solo si todos los valores críticos son verdaderos se declara:

`EXECUTION_LANE_READY`

Si alguno es falso se declara inmediatamente:

`EXECUTION_LANE_NOT_READY`

En `EXECUTION_LANE_NOT_READY`:

- no se inicia auditoría extensa;
- no se declara GO;
- no se genera paquete Claude;
- no se pide otra candidata;
- no se intenta reconstruir el ZIP con otro mecanismo;
- no se traslada trabajo manual a Paula;
- se cambia al workspace file-aware correcto.

El conector GitHub aislado puede consultar PR, HEAD, documentación y archivos. No es el carril primario para empalmar una candidata completa cuando no dispone simultáneamente del checkout y de los archivos extraídos.

## 5. Regla de sesión única

La recepción, el hash, el inventario, la auditoría delta, la decisión GO/P0, la aplicación, el commit y el push deben ocurrir:

- sobre la misma candidata;
- en el mismo workspace;
- con el mismo checkout;
- sobre la misma rama;
- sin trasladar el empalme a otra conversación o herramienta que no tenga la candidata.

No se permite auditar en una sesión y reconstruir después el resultado archivo por archivo desde otra.

## 6. Estados permitidos

Los únicos estados válidos son:

- `EXECUTION_LANE_NOT_READY`
- `EXECUTION_LANE_READY`
- `AUDIT_INCOMPLETE`
- `P0_PROVEN`
- `AUDITED_GO_READY_DIRECT_APPLY`
- `EMPALMED_PENDING_POST_GATES`
- `ACTIVE_BASELINE`

Reglas:

- No se puede declarar `AUDITED_GO_READY_DIRECT_APPLY` si el carril no está listo.
- Una candidata GO no regresa a planificación, transporte, instalación, nueva metodología ni reauditoría general.
- Una candidata solo llega a `EMPALMED_PENDING_POST_GATES` con commit y push verificables.
- Los gates se ejecutan después del empalme, no se convierten en excusa para retrasarlo.

## 7. Auditoría incremental obligatoria

La auditoría se hace únicamente contra:

1. la candidata inmediata anterior;
2. la baseline/source lock viva;
3. el backend, overlays y documentación que deben preservarse.

Se separa expresamente:

- delta nuevo;
- acumulado heredado;
- pendiente vivo;
- regresión real;
- hallazgo nuevo;
- P0;
- P1/P2.

No se repite una auditoría completa ya cerrada sin insumo nuevo.

## 8. Criterio P0

Solo detiene el empalme un `P0_PROVEN` con evidencia reproducible de:

- aplicación que no inicia;
- error sintáctico crítico;
- ruta esencial rota;
- pérdida crítica o eliminación no autorizada;
- secreto o dato sensible expuesto;
- write, deploy, proveedor, pago o producción no autorizado;
- regresión que impida Phase A.

P1 y P2 se documentan y no bloquean.

## 9. Operación única cuando hay GO

Cuando la candidata alcanza `AUDITED_GO_READY_DIRECT_APPLY`, la única operación permitida es:

`APPLY_DELTA_DIRECTLY`

Secuencia:

1. congelar `HEAD_BEFORE`;
2. aplicar el delta auditado directamente al checkout de la rama viva;
3. preservar backend, contratos, adapters, tools, overlays TyA y documentación acumulada;
4. reconciliar solo archivos clasificados como documentos vivos;
5. confirmar que no quedan archivos del delta pendientes;
6. ejecutar verificaciones estructurales mínimas;
7. crear un único commit de empalme;
8. hacer push a la rama viva;
9. registrar `HEAD_AFTER`;
10. generar manifest, `build-lock.js`, verificador y baseline;
11. ejecutar gates post-empalme;
12. solicitar validación visual;
13. congelar baseline si los gates pasan.

## 10. Atomicidad

Una candidata solo se considera empalmada cuando existen conjuntamente:

- commit SHA verificable;
- push comprobado;
- delta completo aplicado;
- cero archivos pendientes del delta;
- backend protegido preservado;
- documentos vivos reconciliados;
- HEAD posterior registrado.

Tener uno o varios archivos copiados no constituye empalme.

Ante fallo durante la aplicación:

1. se detiene inmediatamente;
2. no se continúa con otro archivo;
3. se restaura el estado previo;
4. se documenta el fallo exacto;
5. no se declara unión parcial ni GO aplicado.

## 11. Preservación obligatoria

El empalme debe conservar:

- backend nuevo y limpio;
- interfaz exacta de `CX.data`;
- contratos y adapters;
- tools, gates y validadores útiles;
- overlays TyA source-safe;
- multi-tenant por `tenantId`;
- multi-proyecto por `projectId`;
- selección explícita de proyecto;
- Cinépolis como proyecto configurable, nunca lógica global;
- HR y lectura histórica;
- shoppers históricos;
- postulaciones;
- certificaciones presentadas;
- liquidaciones y pagos;
- sincronización HR/plataforma;
- separación frontend/backend/proveedores;
- UTF-8 sin BOM;
- ausencia de secretos y datos sensibles.

No se conecta ni copia la base vieja. No se parchea UI desde backend.

## 12. Documentos vivos

No se reemplazan a ciegas:

- `CAMBIOS-BACKEND.md`;
- `RESUMEN-PARA-CLAUDE.md`;
- `PENDIENTES-PROTOTIPO.md`;
- documentación de Academia;
- source lock/checkpoint;
- manifest/build-lock/verificador.

Se reconcilian preservando:

- avances backend;
- reglas Phase A;
- ajustes frontend por archivo/módulo;
- impacto en Academia;
- pendientes vivos;
- clasificaciones obligatorias;
- estado seguro.

## 13. Prohibiciones absolutas

Queda prohibido como sustituto del carril file-aware:

- aplicar una candidata completa archivo por archivo mediante el conector;
- usar `update_file` serial como transporte del ZIP;
- crear blobs o trees;
- usar Base64, Drive o carpetas `incoming/`;
- crear workflows o Actions para transportar la candidata;
- usar plan JSON, `.cmd` o PowerShell como requisito;
- pedir a Paula descomprimir, copiar, hacer checkout o ejecutar comandos;
- crear rama o PR nuevos;
- escribir accidentalmente en `main`;
- solicitar otra candidata cuando la actual está GO;
- reauditar por falta de carril;
- convertir una limitación de herramienta en nueva metodología;
- declarar éxito sin commit, push y HEAD verificables.

## 14. Circuit breaker antidemora

Para impedir nuevos ciclos de horas o días:

1. La primera respuesta operativa después de recibir una candidata debe indicar `EXECUTION_LANE_READY` o `EXECUTION_LANE_NOT_READY`.
2. No puede existir más de un bloque de diagnóstico sin cambio de estado o evidencia nueva.
3. Después de GO, la siguiente acción debe ser aplicación directa; no otra explicación metodológica.
4. Si transcurre una respuesta adicional después de GO sin commit, se detiene y se informa el bloqueo exacto.
5. Nunca se promete continuar en segundo plano.
6. Nunca se afirma empalme sin evidencia.
7. Una limitación del carril se informa antes de auditar, no después.

## 15. Responsabilidad operativa

Paula únicamente entrega la candidata completa más reciente.

Corresponde al asistente:

- seleccionar el carril correcto;
- abrir checkout;
- verificar rama;
- extraer candidata;
- calcular hash;
- auditar delta;
- aplicar;
- reconciliar;
- validar;
- hacer commit y push;
- documentar;
- ejecutar gates.

No se trasladan tareas técnicas manuales a Paula.

## 16. Gates posteriores mínimos

Después del empalme y antes de DEV/producción:

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
- ausencia de promesas falsas de integraciones;
- backend y overlays preservados.

## 17. Documentación y cierre

Cada bloque debe registrar:

- qué se hizo;
- avance Phase A;
- qué se preservó;
- qué se documentó para Claude;
- qué se documentó para Academia;
- pendiente real;
- siguiente bloque exacto;
- estado seguro;
- bloqueo comprobado.

Clasificación obligatoria:

- Reusable CXOrbia;
- Exclusivo cliente;
- Claude/prototipo;
- Academia;
- Sin impacto Claude.

Si no está documentado, no se hizo.

## 18. Gobierno de fuentes

Las fuentes del proyecto deben tener nombres canónicos estables. Cuando una fuente maestra se actualiza, se reemplaza; no se agrega una copia.

Prohibido mantener simultáneamente como fuentes activas:

- dos documentos maestros de continuidad;
- dos addenda de empalme;
- duplicados con `(1)`;
- versiones históricas que contradigan la vigente;
- varios checkpoints activos.

Los históricos permanecen en el repositorio, no en Fuentes activas.

El archivo `00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md` define qué se lee y qué está superado.

## 19. Estado seguro

Este addendum no autoriza:

- merge;
- deploy;
- producción;
- importaciones reales;
- Firestore/Auth/Storage/HR writes;
- Make/Gemini live;
- pagos;
- proveedores externos.

Las autorizaciones correspondientes siguen requiriendo su gate y aprobación expresa.
