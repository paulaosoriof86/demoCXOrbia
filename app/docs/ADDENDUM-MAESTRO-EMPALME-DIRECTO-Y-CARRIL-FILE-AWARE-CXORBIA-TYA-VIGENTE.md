# ADDENDUM MAESTRO — EMPALME DIRECTO, COMPOSITE PREVIO Y CARRIL ATÓMICO CXORBIA TyA

**Fecha de emisión original:** 2026-07-17  
**Última actualización:** 2026-07-18, después de la validación visual NO APROBADA de V159  
**Estado:** ACTIVO, DEFINITIVO, OBLIGATORIO Y PREVALENTE  
**Nombre canónico permanente:** `ADDENDUM-MAESTRO-EMPALME-DIRECTO-Y-CARRIL-FILE-AWARE-CXORBIA-TYA-VIGENTE.md`

## 0. Decisión que corrige este documento

V159 demostró un defecto metodológico: una candidata podía pasar auditoría estructural, empalmarse y consumir varios días antes de que la revisión visual revelara inconsistencias semánticas entre HR, KPI, fases, listados, Shopper y Finanzas.

Por autorización expresa de Paula en la conversación del 2026-07-18, la secuencia futura queda reemplazada por:

```text
EXECUTION_LANE_READY
→ AUDITORÍA DEL DELTA
→ COMPOSITE TEMPORAL DEL MISMO HASH + BACKEND/OVERLAYS VIGENTES
→ GATES SEMÁNTICOS
→ VISUALIZACIÓN PRE-EMPALME
→ APROBADO / NO APROBADO
→ si APROBADO: APPLY_DELTA_DIRECTLY DEL MISMO HASH
→ COMMIT/PUSH ATÓMICO
→ POST-GATES
→ FREEZE
```

La rama viva no recibe la candidata hasta que el composite exacto haya sido aprobado visualmente. El composite no crea rama ni PR y no constituye empalme.

## 1. Prevalencia y mantenimiento

Este archivo es la única fuente maestra vigente para recepción, auditoría, previsualización y empalme de candidatas frontend CXOrbia TyA.

Cuando se actualice, se reemplaza el contenido bajo este mismo nombre. No se crean copias con fechas, `(1)`, `V2`, `final` ni documentos paralelos.

Ante cualquier contradicción metodológica de candidatas o empalmes, prevalece este archivo.

## 2. Objetivos

1. No auditar una candidata sin un carril capaz de construir el composite y aplicar el mismo hash si se aprueba.
2. No empalmar antes de comprobar semántica y visualización.
3. No volver a separar candidata, backend, overlays, gates y revisión visual en sesiones o herramientas incompatibles.
4. No trasladar tareas técnicas a Paula.
5. Evitar que un GO estructural sea confundido con aprobación funcional.

## 3. Lectura obligatoria

Antes de responder, planear, auditar, modificar, documentar o cerrar un bloque se lee:

1. `00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`;
2. documento maestro de continuidad vigente;
3. este addendum;
4. addenda vigentes de Academia, patrones reutilizables y antidesvío;
5. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
6. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
7. registry, build-lock y checkpoint contractual vigentes;
8. `CAMBIOS-BACKEND.md` y addendum vigente;
9. `RESUMEN-PARA-CLAUDE.md` y addendum vigente;
10. `PENDIENTES-PROTOTIPO.md` y addendum vigente;
11. PR #7 y HEAD de la rama viva.

No se piden datos ya entregados ni se reinician reglas, mapeos, adapters, validadores o Phase A.

## 4. Destino fijo

- Repositorio: `paulaosoriof86/demoCXOrbia`
- Rama viva: `docs-tya-v6-v71-audit`
- PR existente: `#7`
- Base: `release/cxorbia-tya-rc-20260630`
- Destino prohibido: `main`
- No nueva rama
- No nuevo PR
- No `force`

## 5. Gate `EXECUTION_LANE_READY`

Antes de auditar una candidata se registra:

```text
CANDIDATE_BYTES_AVAILABLE=true
CANDIDATE_EXTRACTABLE=true
TARGET_REPOSITORY=paulaosoriof86/demoCXOrbia
TARGET_BRANCH=docs-tya-v6-v71-audit
HEAD_BEFORE=<sha>
COMPOSITE_BUILD_AVAILABLE=true
SEMANTIC_GATES_AVAILABLE=true
SAME_HASH_DIRECT_APPLY_AVAILABLE=true
```

Además debe quedar listo uno de estos carriles:

```text
FILE_AWARE_CHECKOUT_LANE=true
```

O:

```text
ATOMIC_GIT_OBJECT_LANE=true
BASE_TREE_RESOLVED=true
FAST_FORWARD_REF_UPDATE_AVAILABLE=true
```

Si falta un valor crítico: `EXECUTION_LANE_NOT_READY`. No se inicia auditoría extensa, no se declara GO, no se pide otra candidata y no se traslada trabajo a Paula.

## 6. Carriles técnicos permitidos

### Carril A — checkout file-aware

La sesión tiene candidata extraída, checkout autenticado, rama viva, herramientas, overlays, capacidad de build, gates, commit y push.

### Carril B — Git nativo atómico autenticado

La sesión tiene los bytes exactos, árbol base, capacidad de construir un commit único y actualizar exclusivamente la rama viva por fast-forward.

Los objetos `blob`, `tree`, `commit` y `ref` son mecanismos internos permitidos únicamente dentro de un commit atómico. No pueden usarse como transporte fragmentado.

## 7. Estados válidos

- `EXECUTION_LANE_NOT_READY`
- `EXECUTION_LANE_READY`
- `AUDIT_INCOMPLETE`
- `P0_PROVEN`
- `AUDITED_READY_COMPOSITE`
- `COMPOSITE_GATES_HOLD`
- `COMPOSITE_GATES_PASS_PENDING_VISUAL`
- `VISUAL_NO_GO`
- `VISUAL_APPROVED_READY_DIRECT_APPLY`
- `EMPALMED_PENDING_POST_GATES`
- `ACTIVE_BASELINE`

Queda superado el uso de `AUDITED_GO_READY_DIRECT_APPLY` como autorización suficiente para empalmar sin visualización previa.

## 8. Auditoría incremental

Se compara contra:

1. candidata inmediata anterior;
2. baseline/source lock vigente;
3. backend, contratos, adapters, tools, overlays y documentos a preservar.

Se separa:

- delta nuevo;
- acumulado heredado;
- pendiente vivo;
- regresión;
- hallazgo nuevo;
- P0;
- P1/P2.

La auditoría estructural incluye sintaxis, `index.html`, scripts, rutas, módulos, seguridad, datos sensibles, promesas falsas, multi-tenant, multi-proyecto y Academia; no sustituye los gates semánticos ni la visualización.

## 9. Composite temporal obligatorio

Después de la auditoría, si la candidata es ejecutable, se construye un composite temporal con:

- exactamente el hash auditado;
- backend protegido vigente;
- contratos, adapters, tools y overlays vigentes;
- fuente source-safe vigente;
- documentos vivos preservados;
- sin commit sobre la rama;
- sin cambio de PR;
- sin producción;
- sin base vieja;
- sin writes.

El composite debe ser reversible y descartable. No se crea una candidata nueva ni se modifica silenciosamente el ZIP original.

Cada overlay aplicado al composite se registra con nombre, propósito, archivos afectados y hash o evidencia reproducible.

## 10. Gates semánticos pre-empalme

Antes de mostrar el composite se valida, sobre el mismo build:

- proyecto y periodo separados;
- todo el histórico HR detectado, no solo tres meses;
- al menos todo el año vigente si una fuente anterior no está disponible;
- asignación según shopper real en HR;
- agenda según fecha válida;
- realizada, cuestionario y submitido como dimensiones independientes;
- submitido no equivale a liquidado ni pagado;
- KPI, fases, listados, Visitas, Shopper y Finanzas usando la misma verdad;
- comparativos históricos desde periodos reales;
- visitas disponibles según elegibilidad real;
- configuración tenant, países, banderas, proyectos activos y roles visibles;
- scopes por rol;
- Academia/manuales por rol;
- cero PII o secretos;
- cero proveedor/write/pago no autorizado.

Un gate que solo comprueba conteos, sintaxis o que la ruta abre no es suficiente.

## 11. Visualización pre-empalme

Paula revisa el composite exacto antes de tocar la rama viva.

Respuestas válidas:

- `APROBADO`;
- `DIFERENCIA: rol / ruta / acción / esperado / observado`;
- `ERROR: acción / resultado`.

### Si la respuesta es NO APROBADO

Estado: `VISUAL_NO_GO`.

- la rama viva permanece sin la candidata;
- no se empalma;
- se conserva el mismo hash como evidencia;
- se corrige backend/overlay si la causa es de datos o contrato;
- se documenta para Claude únicamente el frontend localizado;
- se reconstruye el composite corregido;
- no se reinicia la auditoría completa sin un nuevo hash.

### Si la respuesta es APROBADO

Estado: `VISUAL_APPROVED_READY_DIRECT_APPLY`.

La única acción siguiente es `APPLY_DELTA_DIRECTLY` del mismo hash visualizado.

## 12. `APPLY_DELTA_DIRECTLY` después de aprobación

1. congelar `HEAD_BEFORE`;
2. confirmar que no cambió;
3. confirmar que el hash es el aprobado;
4. aplicar el delta auditado;
5. aplicar exactamente los overlays registrados y aprobados;
6. preservar backend, contratos, adapters, tools y documentos vivos;
7. generar manifest, build-lock y verificador;
8. crear un único commit;
9. actualizar la rama viva por fast-forward;
10. registrar `HEAD_AFTER`;
11. ejecutar post-gates sobre el commit;
12. comprobar que el commit reproduce el composite aprobado;
13. congelar baseline.

Si el hash, overlays o build difieren, se detiene. No se sustituye por otra candidata ni por una reconstrucción manual.

## 13. Criterio P0

P0 incluye evidencia reproducible de:

- aplicación que no inicia;
- sintaxis o ruta esencial rota;
- pérdida crítica;
- secreto o dato sensible;
- write, deploy, proveedor, pago o producción no autorizado;
- regresión que impide Phase A;
- semántica visual que contradice la fuente operacional y vuelve no confiables los módulos críticos.

P1/P2 se documentan y no bloquean cuando no alteran datos, operación, seguridad o Phase A.

## 14. Atomicidad

Solo existe empalme cuando hay conjuntamente:

- commit SHA;
- fast-forward comprobado;
- mismo hash aprobado;
- delta completo;
- overlays aprobados;
- cero archivos pendientes;
- backend protegido;
- documentos reconciliados;
- `HEAD_AFTER`;
- post-gates PASS.

Tener archivos copiados o commits parciales no constituye empalme.

## 15. Preservación obligatoria

Se conserva:

- interfaz de `CX.data`;
- backend nuevo y limpio;
- contratos, adapters, tools, gates y overlays;
- multi-tenant y multi-proyecto;
- Cinépolis como proyecto configurable;
- HR e histórico completo;
- shoppers, postulaciones y certificaciones;
- liquidaciones y pagos;
- sincronización HR/plataforma;
- configuración tenant/país/roles/proyectos;
- Academia, manuales, rutas y notificaciones;
- UTF-8 sin BOM;
- ausencia de secretos y datos sensibles.

No se conecta ni copia la base vieja.

## 16. Documentos vivos

Se reconcilian y actualizan:

- este addendum;
- `00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`;
- `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
- `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
- registry y checkpoint contractual;
- `CAMBIOS-BACKEND.md`;
- `RESUMEN-PARA-CLAUDE.md`;
- `PENDIENTES-PROTOTIPO.md`;
- Academia y tracker;
- manifest/build-lock/verificador.

No se reemplazan a ciegas ni se mantienen copias activas paralelas.

## 17. Prohibiciones

- empalmar antes de la aprobación visual;
- aplicar archivo por archivo mediante Contents API como transporte de candidata;
- Base64, Drive, `incoming/`, plan JSON, `.cmd` o PowerShell para Paula;
- workflow como transportador;
- nueva rama o PR;
- escribir en `main`;
- `force`;
- cambiar hash entre visualización y empalme;
- mostrar una build y empalmar otra;
- pedir nueva candidata por una limitación de herramienta;
- reauditar sin cambio de hash;
- declarar éxito sin evidencia.

## 18. Circuit breaker antidemora

1. Primera respuesta: carril READY/NOT READY.
2. Auditoría terminada: construir composite, no empalmar.
3. Gates PASS: visualizar, no abrir otra metodología.
4. NO APROBADO: corregir focalizadamente sin tocar rama viva.
5. APROBADO: aplicar el mismo hash inmediatamente.
6. Cualquier cambio de hash invalida la aprobación.
7. Nunca prometer trabajo en segundo plano.
8. Nunca trasladar tareas técnicas a Paula.

## 19. Documentación y cierre

Cada bloque registra:

- candidata/hash;
- HEAD antes y después si aplica;
- composite y overlays;
- gates;
- evidencia visual;
- decisión;
- Phase A;
- Reusable CXOrbia;
- Exclusivo cliente;
- Claude/prototipo;
- Academia;
- estado seguro;
- siguiente bloque exacto.

## 20. Estado seguro

Este addendum no autoriza merge, producción, importaciones reales, Firestore/Auth/Storage/HR writes, Make/Gemini live, pagos ni proveedores externos. Un Hosting DEV para visualizar el composite requiere su gate/autorización específica y nunca equivale a empalme o producción.
