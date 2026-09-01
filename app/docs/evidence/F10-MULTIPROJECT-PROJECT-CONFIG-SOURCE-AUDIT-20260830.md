# F10 — Auditoría transversal de configuración de proyectos y fuente operacional

Fecha: 2026-08-30
Estado: `AUDITED_SOURCE_REPAIR_IN_PROGRESS__NO_DEPLOY`

## Criterio rector confirmado

La arquitectura no es Cinépolis-específica. Cada tenant puede tener múltiples proyectos y cada proyecto decide su propia fuente de Hoja de Ruta / fuente operacional:

- `internal`: creada y mantenida dentro de CXOrbia;
- `external`: Google Sheets, Excel importado, API/plataforma externa o adapter específico;
- el cuestionario es una decisión independiente de la fuente de Hoja de Ruta y puede ser interno, link general, link por visita o plataforma externa.

Para cualquier proyecto con fuente externa, la fuente elegida es autoridad de periodos, visitas y hitos operacionales observados; CXOrbia sigue siendo autoridad de postulaciones, decisiones, usuarios, perfiles, certificaciones, crosswalks y auditoría. Si el proyecto utiliza fuente interna, CXOrbia es también autoridad de periodos/visitas.

## Hallazgos de implementación

### P0/P1-A — alta de proyecto no usa todavía el command boundary durable

`app/modules/proyecto-wizard.js` llama sincrónicamente `data.addProject(cfg)`. `app/core/data.js::addProject()` agrega primero el proyecto a memoria y `_saveCustomProjects()` lo persiste en `localStorage`.

En runtime backend, `app/core/backend-firebase.js::wrapDataMethods()` envuelve `addProject()` y después llama directamente a `writeProject()` mediante `safePersist()`. Ese camino no espera provider ACK en la UI y no usa el command boundary de proyecto. Para la operación futura esto es inaceptable: el usuario podría ver un proyecto creado aunque el provider haya fallado y la verdad local puede divergir de Firestore.

Clasificación: bloqueante para **crear un proyecto nuevo en producción**, aunque no modifica el release vivo actual mientras no se invoque esa acción.

### P0/P1-A2 — edición de proyecto también es local-first

`app/modules/proyectos.js` modifica el objeto `pr` directamente, llama `data._saveCustomProjects()` y muestra `guardado localmente · vista previa pendiente de activación`. No existe ACK durable, expectedVersion ni readback. La configuración de fuente, países, periodicidad, revisión, submitido y contactos podría divergir del backend.

La misma pantalla afirma que cada proyecto reconfigura la plataforma “sin tocar código”; esa promesa no puede considerarse productiva hasta reemplazar la edición local-first por `project.update` durable.

### P1-B — selección de fuente demasiado superficial

El wizard ofrece actualmente tres etiquetas: `Hoja creada en plataforma`, `Google Sheets (online)` y `Excel importado`, pero persiste solo:

- `hrMap.fuente` como etiqueta;
- `hrFuente.origen` como `nativa`/`externa`;
- `hrFuente.etiqueta`.

No persiste aún el contrato operativo requerido: `mode`, `providerType`, `providerBindingId`, `mappingRef`, `readPolicy`, `writePolicy`, `periodDiscovery` y capacidades del provider. Dos fuentes externas distintas quedan colapsadas bajo `origen=externa`.

### P1-C — bridge live actual está acoplado a TyA/Cinépolis

`app/adapters/tya-protected-auth-hr-authority-bridge-v2.js` usa endpoint por defecto `/api/tya/cinepolis/hr-live`, exige `tenantId==='tya'` y autorización del proyecto `cinepolis`, y escribe metadata con esos valores. Es correcto como adapter TyA específico, pero no puede actuar como arquitectura global de nuevos proyectos.

`backend/runtime/hr-live-service/server.mjs` expone únicamente endpoints del proyecto Cinépolis. Un nuevo proyecto externo no debe requerir copiar/editar este servicio; debe registrar su provider binding y mapping en el resolver reutilizable.

### P1-D — valores residuales hardcodeados en proyecto nuevo

El wizard todavía crea:

- `ronda:'JUN 26'`;
- `quincenas:['Quincena 1','Quincena 2']`;
- `hrMap.cols:['Sucursal','Ciudad','País','Escenario']`.

Esto contradice la configuración ya visible en el propio wizard (`frecuencia`, `periodoMedicion`, `ventanas`) y puede contaminar un proyecto que no sea mensual/quincenal o cuya HR use otro mapping. `ronda` debe ser presentación derivada de periodos reales; `ventanas` y columnas deben venir de configuración/mapping, no de un default operativo fijo.

### P1-D2 — la edición también contiene una regla 50/50 falsa

La configuración existente muestra el texto: ronda mensual + cumplimiento quincenal = “cada quincena debe cubrirse la mitad de las visitas del mes”. Esto contradice el criterio ya establecido en el wizard: la Hoja de Ruta determina la ventana y nunca se asume 50/50 automático. Debe corregirse como copy/regla de presentación, sin introducir una distribución implícita.

### P1-F — acciones “IA” todavía simuladas

El wizard `Importar instructivo / HR (IA)` no procesa realmente el archivo: al hacer clic rellena escenarios/restricción/base de conocimiento genéricos y muestra `IA extrajo ... (demo)`. En la edición de proyecto, `Sugerir (heurística local)` añade escenarios genéricos y solo reconoce Gemini si `CX.ai.ready()`.

Esto no puede quedar disponible como promesa de producción. Hasta que llegue el bloque real Gemini con gate/revisión humana, estas acciones deben mostrarse honestamente como no activas o ser sustituidas por el flujo real; nunca deben generar configuración canónica fingiendo extracción del documento.

### P1-G — “Hoja de Ruta interna” existe como opción visual, pero no como autoridad durable completa

Elegir `Hoja creada en plataforma` solo produce `hrFuente.origen='nativa'` y un proyecto local con `nVisitas:0`. No existe todavía un flujo durable para crear/editar periodos/visitas de la Hoja de Ruta interna detrás del mismo command boundary y fuente canónica. El contrato reusable debe soportar `internal_firestore` sin proveedor externo.

### P1-E — documentación canónica estaba desincronizada

Después del authority repair, `00-INDICE-FUENTES-VIGENTES`, `CHECKPOINT`, `EXECUTION-STATE` y `SOURCE-LOCK` seguían en epoch 14 y afirmaban que solo faltaba aceptación visual. Ese estado es obsoleto porque ahora existe un defecto transversal de autoridad/persistencia y un hold de onboarding multiproyecto. Deben actualizarse al nuevo epoch antes de cerrar este bloque.

## Solución source preparada

1. `backend/contracts/cxorbia-project-source-contract-v1.json`: contrato reusable de fuente por proyecto, con fuente interna/externa, provider binding indirecto, mapping, políticas read/write, autoridad y gates.
2. `app/adapters/cxorbia-project-operational-source-v1.js`: resolver reusable y backward-compatible para convertir configuración legacy y validar fuentes sin writes.
3. `backend/runtime/cxorbia-project-command-provider-v1.mjs`: provider source-only para `project.create`/`project.update` con Auth/RBAC, idempotencia, versión, validación de fuente, ID canónico determinístico y prohibición de secretos crudos.
4. `app/adapters/tya-phase-a-operational-sync-v1.js`: mantiene la separación HR/plataforma y ACK-before-success para operación.

Ninguno de estos archivos habilita por sí solo writes, provider externo, Make/Gemini, pagos, deploy o producción.

## Gates antes de permitir un segundo proyecto

1. `PROJECT_CONFIG_SCHEMA_PASS` — sin valores operativos hardcodeados y con fuente canónica completa.
2. `PROJECT_SOURCE_RESOLVER_PASS` — interno y externo resuelven por proyecto sin Cinépolis global.
3. `PROJECT_CREATE_DURABLE_ACK_PASS` — creación solo se muestra exitosa después de Firestore ACK/readback; localStorage deja de ser verdad.
4. `PROJECT_UPDATE_DURABLE_ACK_PASS` — edición usa expectedVersion/ACK/readback y no muta primero el objeto UI.
5. `PROJECT_ISOLATION_PASS` — crear proyecto B no altera visitas, periodos, fuente, cuestionario, finanzas ni usuarios del proyecto A.
6. `PROJECT_PROVIDER_BINDING_PASS` — cada proyecto externo usa su propio binding/mapping indirectos.
7. `PROJECT_INTERNAL_SOURCE_PASS` — proyecto con Hoja de Ruta interna funciona sin proveedor externo.
8. `PROJECT_EXTERNAL_SOURCE_PASS` — un proyecto externo puede descubrir periodos/visitas según su provider sin cambiar código global.
9. `PROJECT_MONTH_FUTURE_PASS` — meses/periodos nuevos se descubren desde la fuente configurada, no por lista hardcodeada.
10. `PROJECT_COMMAND_CONFLICT_PASS` — idempotencia y expectedVersion evitan duplicados/escritura perdida.
11. `PROJECT_AI_NO_FALSE_SUCCESS_PASS` — ninguna extracción/sugerencia simulada se presenta como IA real ni escribe configuración canónica.
12. `PROJECT_DOCUMENTATION_SYNC_PASS` — índice/checkpoint/execution/source-lock/mirrors tienen el mismo epoch y NEXT.

## Claude/prototipo — cambios que no debe ejecutar todavía

Cuando los gates backend estén listos, Claude Code recibirá un patch focal para `app/modules/proyecto-wizard.js`, `app/modules/proyectos.js` y, si es necesario, el punto mínimo autorizado en `app/core/data.js`/backend bridge. Debe:

- sustituir `data.addProject(cfg)` por creación durable ACK-aware;
- sustituir edición directa de `pr` + `_saveCustomProjects()` por `project.update` durable;
- modelar la fuente de Hoja de Ruta mediante el contrato reusable;
- eliminar `JUN 26`, quincenas y columnas fijas como verdad operativa;
- eliminar la regla 50/50 implícita;
- mostrar campos de binding/mapping solo según provider y sin secretos;
- no presentar extracción IA simulada como real;
- preservar exactamente el diseño aprobado salvo los controles necesarios para elegir/configurar fuente y estados honestos.

No crear nueva candidata ni reescribir módulos.

## Academia

Actualizar manual de configuración de proyecto con: elección de fuente interna/externa, provider/mapping, autoridad, estado de sincronización, conflicto, diferencia entre Hoja de Ruta y cuestionario, creación/edición con ACK y uso de IA solo cuando esté realmente activada.
