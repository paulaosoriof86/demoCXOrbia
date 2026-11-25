# CXOrbia Recovery — autoridad operativa raíz

Este archivo aplica a todo el repositorio salvo que un `AGENTS.md` más profundo restrinja todavía más el alcance. Su función es resolver autoridad y continuidad; no sustituye manifests, checkpoints ni evidencia de una candidata.

## 1. Autoridad prevalente

Para cualquier trabajo de Recovery, leer y aplicar en este orden las fuentes del Project CXOrbia Recovery:

1. `00_START_HERE_CXORBIA_RECOVERY.md`;
2. `ADDENDUM_PREVALENTE_RECUPERACION_CXORBIA.md`;
3. `PLAN_RECTOR_RECUPERACION_CXORBIA.md`;
4. `CONTRATOS_FUNCIONALES_CXORBIA_RECOVERY.md`;
5. `CHECKPOINT_INICIAL_RECUPERACION_CXORBIA.md`;
6. cualquier addendum Recovery posterior expresamente aprobado, en orden cronológico; actualmente el addendum de 2026-09-03 complementa y prevalece sobre reglas anteriores cuando existe conflicto;
7. después, resolver dinámicamente en GitHub la rama Recovery viva, sus locks/checkpoints, manifest F9 aplicable, HEAD, tree, checks y evidencia vinculada al intento exacto.

Las fuentes del Project pueden estar montadas fuera del árbol Git. No crear copias divergentes para sustituirlas. Si una ejecución técnica no puede leer la autoridad Recovery necesaria, debe detener el write funcional en vez de inferir reglas desde documentación histórica.

## 2. Rama operativa y precedencia histórica

- Repositorio único: `paulaosoriof86/demoCXOrbia`.
- Carril operativo Recovery: `recovery/cxorbia-phase-a-20260831`.
- `docs-tya-v6-v71-audit`, PR #7, índices/checkpoints/direct-runner contracts históricos y demás carriles previos son evidencia o autoridad histórica solamente cuando no contradicen Recovery.
- No crear otra rama principal, PR paralelo, candidata paralela, overlay, materializador, workflow transportador ni metodología adicional para resolver un FAIL.
- El HEAD de trabajo nunca equivale por sí solo a release aprobada ni a artefacto certificado.

## 3. Resolución dinámica del estado vivo

Nunca hardcodear un SHA como autoridad permanente.

Antes de cada write técnico:

1. leer la rama Recovery remota;
2. capturar `expectedParentSha` y tree del intento;
3. comprobar que coinciden con el paquete/issue/checkpoint que autoriza el cambio;
4. limitar el write a owners y archivos allowlisted;
5. si HEAD/tree cambiaron antes del write, clasificar `SOURCE_FAILURE`, no escribir y re-resolver el intento sobre el nuevo estado vivo;
6. después del write, hacer readback del commit, parent, tree, diff y HEAD remoto;
7. ejecutar únicamente los gates DEV focales previstos para ese paquete.

Un manifest o checkpoint histórico es evidencia inmutable. No se reescribe para convertirlo en puntero vivo. Cada candidata certificable debe producir su propio manifest/receipt ligado al source y artefacto exactos.

## 4. Escritor único por intento — decisión prevalente ratificada 2026-09-10

La decisión operativa posterior de Paula sustituye, para Recovery, la restricción histórica que exigía Codex como escritor ordinario.

- Escritor técnico primario: la sesión de ChatGPT que opera directamente sobre GitHub en el carril Recovery, con `expectedParentSha`/tree, allowlist focal, readback y gates reproducibles.
- Codex no es prerrequisito de I2, I3 ni I4. Queda como excepción opcional únicamente si Paula lo solicita expresamente o una limitación técnica demostrable impide ejecutar el paquete de forma segura desde el carril directo.
- Solo puede existir un escritor activo por intento. No alternar ChatGPT/Codex/agentes sobre el mismo paquete ni crear carriles paralelos.
- I0 e I1 conservan sus restricciones de modificación definidas por el Plan Rector y sus gates.
- I2 permite el paquete técnico autosuficiente previsto por el Plan, ejecutado por el escritor primario vigente.
- I3 permite únicamente correcciones P0 `PROVEN`, con owner/archivo exactos, alcance mínimo y tests focales. No autoriza “arreglar todo CXOrbia”.
- I4 no permite cambios de código salvo un P0 de código nuevamente demostrado; el deploy sigue siendo por el carril único del artefacto ya certificado y requiere autorización productiva explícita.

Control de cambio de gobernanza:

- BEFORE: el router raíz heredaba la política inicial “Codex-only” para I2/I3.
- AFTER: ChatGPT directo es el escritor primario de Recovery; Codex es opcional/excepcional.
- Gates impactados: solo mecanismo de ejecución/continuidad; no altera por sí mismo ningún PASS funcional ni autoriza producción.
- Criterio de aceptación: todo write directo debe cumplir sección 3, limitarse al owner probado, producir readback y no crear una segunda candidata.
- Owner: autoridad Recovery ratificada por Paula; este `AGENTS.md` actúa como router operativo, no como sustituto de los documentos fuente.

## 5. Reglas anti-bucle

Todo FAIL se clasifica únicamente como:

`SOURCE_FAILURE`, `MAPPING_FAILURE`, `PROVIDER_FAILURE`, `PERSISTENCE_FAILURE`, `AUTH_FAILURE`, `FUNCTIONAL_DEFECT`, `VISUAL_DEFECT`, `RELEASE_COMPOSITION_FAILURE` o `ENVIRONMENT_FAILURE`.

Un FAIL no autoriza reauditoría general, reimport, nueva candidata, rama paralela, overlay, materializador o workflow nuevo. Se corrige dentro de la iteración vigente por el owner probado y se repite el gate afectado.

No reabrir un gate PASS sin drift reproducible del producto, contrato, provider, persistencia, auth, release composition o ambiente que afecte ese gate.

## 6. Invariantes de producto P0

- Plataforma multi-tenant por `tenantId` y multi-proyecto por `projectId`.
- `projectId`, `periodId` y execution cut son conceptos distintos.
- Proyecto, periodo, país, moneda, fuentes HR/roadmap/cuestionario, Sheet IDs, columnas y mappings son configuración scoped; no defaults globales hardcodeados.
- `routeSource` y fuentes equivalentes deben poder operar como `internal|external/provider` según contrato.
- HR externa manda sobre campos HR-managed y la misma `sourceRevision` debe respaldar disponibilidad, asignaciones, histórico y KPIs.
- Visitas disponibles = elegibles y no asignadas.
- Asignar retira disponibilidad y crea/actualiza la vista shopper sin duplicados.
- Shopper HR inexistente se upserta de forma automática e idempotente y debe poder autenticarse.
- Administradores autorizados deben ver identidad, histórico y KPIs.
- Postulación válida persiste, aparece en Gestión de Postulaciones y no reaparece después de eliminación válida.
- Todo write bidireccional requiere ACK remoto, idempotencia y readback.
- Un guardado únicamente local/preview no certifica persistencia.
- Artifact desplegado debe ser exactamente el artifact certificado; no rebuild entre certificación y deploy.

## 7. Producción

`https://tya-plataforma.web.app/` permanece `LEGACY_ORACLE` y `DO_NOT_TOUCH` hasta I4 y autorización productiva explícita.

No desplegar, mutar datos reales, Firestore/Auth/Storage/HR productivos ni reemplazar Hosting por rutina. No reimportar datos reales ni conectar/copiar la base legacy.

## 8. Evidencia y cierre de cada bloque

No afirmar PASS, commit, push, deploy ni producción sin readback/evidencia reproducible.

Cada cierre debe registrar como mínimo:

- iteración vigente;
- evidencia nueva;
- estado `GO`, `HOLD` o `NO_GO`;
- HEAD/tree anterior y nuevo cuando exista write;
- archivos realmente modificados;
- P0 y clasificación, si existe;
- tests/gates ejecutados y resultado;
- `sourceRevision`/artifact/digest cuando aplique;
- qué no cambió, incluida producción;
- siguiente acción exacta y si requiere autorización.

La continuidad se deriva de estas reglas + fuentes Recovery prevalentes + readback vivo. No depende de memoria conversacional ni de un SHA congelado fuera de su intento.

## 9. Plan congelado V1.1 y avances por bloque — 2026-10-16

Después de las autoridades anteriores, leer obligatoriamente:
1. `CXORBIA_RECOVERY_PLAN_FROZEN_2026-10-16_V1_1.json` — identidad persistente, hashes y cobertura del paquete íntegro aprobado por Paula.
2. `CXORBIA_RECOVERY_EXECUTION_CURRENT.json` — último avance comprobado y siguiente acción, sin convertir tareas pendientes en PASS.
3. `CXORBIA_RECOVERY_BLOCK_APPROVAL_CONTRACT_2026-10-16.md` — previews y aprobaciones incrementales acumulativas por bloque.

El lock referencia los archivos completos en Biblioteca por ID estable y SHA-256, no por texto del chat. Recuperarlos y verificar su hash antes de trabajar; no inferir el alcance desde un resumen. El paquete conserva 82 tareas, 16 hallazgos forenses, 56 rutas/roles, 42 funciones críticas, 21 gates, 274 VRM y las observaciones/capturas históricas. No sustituye ni sobrescribe el ledger del descriptor.

Ratificar la sección 4 / CR-20260910-02: el plan no reintroduce Codex como bloqueo obligatorio. Preservar también el addendum legal no bloqueante del 18-09. La petición actual de Paula sustituye la espera a un único checkpoint visual al final: entregar cada bloque sólo después de su prueba y readback de bytes, conservar su aprobación por hashes/dependencias y no esperar módulos independientes. La aprobación visual no autoriza I4.

Las decisiones del 16-10 permiten normalización y fusión nominal corroborada con conservación de UID/alias/histórico; los casos realmente ambiguos requieren decisión. Para campos bidireccionales autorizados manda el último evento válido de HR o plataforma, con bitácora y ACK; no reinterpretar una lectura o eco de sincronización como nueva edición. El resto de los invariantes permanece.

## 10. Continuidad incremental y fuente DEV F2 confirmada — 2026-11-23

**Esta sección no crea otra metodología ni sustituye el plan I0–I4.** Cuando los alias `status`, `pendingDevSuccessor`, `currentMaterialization` o `nextExactAction` de un JSON de control grande continúen describiendo una etapa ya superada, nunca repetir su acción sin comparar su fecha/source/árbol con **recibos posteriores en GitHub y su readback real**. Un checkpoint posterior de un mismo source con run SUCCESS y revision/digest exactos prevalece para la obligación precisa que prueba; no convierte por inferencia todo un dominio en PASS. Mantener versiones anteriores como evidencia histórica.

**Recibo F2 vigente y acotado:** `docs/checkpoints/CXORBIA_I3_F2_ORIGINAL_EXCEL_OPERATIONAL_DEV_PASS_20261123.json`, commit inicial de control `e9e975eac9973410ce847eb919c6dad24c03ccce`, sobre product source `9d51a76d0bcc76e778669ac20393209e42bacb74` / tree `0cccf405900acfdb8f60961c822c560ba2798db3`. Run `45245908604` acredita publicación de Cloud Run `cxorbia-live-hr-dev-00384-dmj` y Hosting `bf538792596bce30`; run `45247697281` acredita con ACK remoto que Cinépolis DEV pasó del lector Google Sheets obsoleto a `excel_online` con **38/38 lecturas país-período** y sin escrituras sobre Excel original, espejo Google, visitas o Auth. No repetir F2 ni reparar por rutina la composición ya publicada.

**Estado que NO debe falsearse:** I3=`HOLD`, 6/21 `MATCH` integrales conservados, 15 dominios pendientes, cuatro bloques funcionales B4/B5/B6/B7 aceptados históricamente. F3 bidireccional con ACK/readback/replay/conflictos/eco sigue sin probarse sobre el proveedor real y fixture aislado autorizado. Gate20/Gate21 no están cerrados; I4 sin autorización; producción `DO_NOT_TOUCH`.

**Siguiente owner, no nuevo diagnóstico general:** F3 sobre contrato y fixture aislado Graph/Make por país/proyecto/período/visita; confirmar ACK remoto e idempotencia y recién después ejecutar las cláusulas Admin/Shopper E2E no cubiertas para acreditar módulos de la matriz de 21. No exigir a Paula que repita decisiones. Si un checkpoint posterior trae evidencia válida de un source distinto, resolver nuevamente la autoridad viva y conservar la monotonicidad de módulos.

**Control contra escritores simultáneos:** antes de todo write usar HEAD/tree remotos y `expected_sha` (CAS/lease); si cambia, abortar ese write sin un segundo candidato. Esta regla aplica también al control documental. Los problemas de longitud/interrupción de una conversación ChatGPT no deben alterar el estado persistente ni justificar reauditar todo.


## 11. Incorporación automática de ejecuciones — corrección VRM-374, 2026-11-24

El finalizador `continuity-result-consumer` del workflow Recovery existente es el único escritor de resultados de Actions. No crea otro producto, workflow, rama ni candidata. Opera después de todos los productores, con compare-and-swap y readback. No construir, desplegar, leer HR ni ejecutar comandos desde ese consumidor. La sesión técnica espera su término antes de un nuevo write sobre la rama.

Al retomar, leer HEAD, descriptor y `CXORBIA_RECOVERY_EXECUTION_CURRENT.json`, resolver sus blobs actuales de matriz y ledger, y comprobar `currentAutomationReceipt`, `currentControlProjection`, `postDeployRunSeal` y `lastHrObservation`. Distinguir último despliegue, última ejecución, última observación HR y último C3 histórico. No confundir SUCCESS del workflow con MATCH funcional.

Antes de repetir una publicación, revisar los runs/attempts posteriores al sello incorporado y sus journals. El preflight del carril existente bloquea un despliegue repetido si hay resultados no incorporados; su finalizador recupera esos resultados con el mismo consumidor. Un intento previo no puede sustituir a uno posterior. Un artefacto no tipado, parcial o fallido se registra con su resultado y queda pendiente de la cláusula exacta; nunca se transforma en PASS por inferencia.

Los campos activos enumerados en `tools/qa/cxorbia-i3-current-control-projection.mjs` se derivan del recibo verificado. Los valores retirados se conservan en `ACTIVE_ALIAS_HISTORY`; no son instrucciones de ejecución. Toda nueva compatibilidad activa debe añadirse al registry, al projector y a su prueba negativa en el mismo cambio. No añadir aliases manuales que vuelvan a multiplicar autoridades.

La corrección conserva la lectura histórica de HR ya confirmada. La regla operativa solicitada por Paula el 24/11 es leer rutinariamente el mes anterior, el actual y el próximo cuando exista; los demás se consultan sólo por solicitud explícita. Esta decisión de alcance no certifica por sí misma su implementación ni autoriza producción.

## 12. Recuperación del trabajo interrumpido y aceptación automatizada — 2026-11-24

Aplicar el addendum `docs/checkpoints/ADDENDUM_PREVALENTE_CXORBIA_I3_CHROME_E2E_REEMPLAZA_CHECKPOINT_HUMANO_20261119.md`: Chrome/Chromium autenticado en el carril existente sustituye la revisión manual rutinaria. No exigir un nuevo `HUMAN_PASS` manual cuando exista evidencia automatizada equivalente; conservar el alcance exacto y los contratos P0.

El corte del 24/11 demostró otro punto de interrupción: source `1691a76a7bc095ad4bf444aa0db76df2f359a5f0` ya existía como objeto Git, pero no era alcanzable desde la rama canónica. El paquete completo VRM-375, sus 725 pruebas y sus controles se recuperaron por hashes; no se reconstruyeron. La existencia de un commit o de archivos locales no permite decir que el cambio quedó incorporado. Completar la escritura de control, mover la única rama con lease y verificar el HEAD remoto antes de informar incorporación o iniciar otro paquete. Persistir el alcance y la siguiente acción de cada paquete pendiente en el mismo carril.

El registro automático incluye también ejecuciones que solo alcanzaron `canonical-candidate-authority`, sean exitosas, fallidas, canceladas o agotadas, si su finalizador quedó interrumpido. La recuperación conserva el orden run/attempt y no promueve dominios. Los aliases retirados, las fechas antiguas y los requisitos F3 históricos se conservan en recibos históricos; la acción vigente se deriva de las cláusulas residuales y del recibo de la fuente exacta. Una ventana HR publicada no acredita por sí misma el ciclo F3 completo.

## 13. Cierre por procesos y continuidad del intento sin inicio — 2026-11-25

Aplicar la decisión posterior de Paula y `docs/checkpoints/ADDENDUM_CXORBIA_I3_CIERRE_POR_PROCESOS_20261125.md`. El criterio de cierre se basa en los procesos y contratos del plan congelado, con evidencia acumulada por alcance. Los 21 dominios se conservan como inventario de owners; su contador no impone una acreditación adicional cuando el contrato está demostrado. No convertir ese cambio en nuevos PASS ni reducir contratos P0, capacidades publicadas, Gate20/Gate21, identidad del artefacto o autorización I4.

Consultar `docs/checkpoints/CXORBIA_I3_CONTINUIDAD_OPERATIVA_20261125.md` y después resolver los punteros dinámicos actuales. RUN2787 no inició ningún paso por bloqueo de cuenta de GitHub: su journal registra el fallo de entorno y no crea evidencia funcional. No dejarlo en una cola que espere resultados imposibles, ni repetir automáticamente ejecuciones mientras persista el bloqueo. La cuenta debe permitir iniciar un job antes de retirar ese impedimento.

La fuente F3 aprobada pendiente de servir y el source que DEV sirve deben permanecer separados en `pendingDevSuccessor` y el recibo del predecesor hasta el readback del despliegue. La vinculación técnica de pruebas históricas a los contratos originales no exige rehacer módulos ni pedir a Paula de nuevo sus aprobaciones. Repetir solo el alcance afectado por drift reproducible o todavía no demostrado. Conservar la aceptación D06/B4 y las demás aprobaciones exactas, y mantener abiertos los residuos reales de Finanzas, D07/D08, identidad, F3 y E08.

Ante la consulta posterior de Paula sobre publicar mientras regulariza GitHub, consultar `docs/checkpoints/CXORBIA_I3_CONTINGENCIA_EJECUCION_GOOGLE_20261125.md`. Es una revisión de viabilidad, no un despliegue ni un nuevo PASS. La posible ejecución en Google Cloud Shell debe reutilizar la misma fuente y carril lógico, comprobar permisos y registrar procedencia externa real antes de actualizar los controles. No simular IDs/resultados de Actions ni cambiar el criterio productivo. Primero verificar acceso Google; evitar desarrollar otro ejecutor sin ese acceso comprobado.

**Autorización posterior, 25-11-2026:** Paula autoriza ahora proceder directamente con las publicaciones DEV pendientes mediante Google Cloud y gestionar las pestañas desde su Chrome conectado. Aplicar `docs/checkpoints/CXORBIA_I3_WORK_GOOGLE_CONTINUATION_20261125.md`. La alternativa dejó de ser solo una propuesta, pero su acceso y procedencia todavía deben comprobarse; la llamada de esta sesión falló antes de abrir pestañas. No exigir resolver primero la facturación de Actions si Google permite ejecutar e incorporar evidencia equivalente. Conservar el bloqueo histórico de Actions y la separación entre fuente aprobada y fuente servida hasta readback. El prompt Work es continuidad del mismo escritor/carril, no otro producto o metodología. I4 conserva autorización explícita del artefacto certificado.

El recibo de acceso Google y lectura DEV de este corte es `docs/checkpoints/CXORBIA_I3_GOOGLE_DEV_PREFLIGHT_20261125.json`. Chrome y Cloud Shell respondieron. La firma QA quedó verificada con una concesión temporal cuyo vencimiento figura en el recibo. Comprobar su vigencia al retomar. La lectura de la versión servida, la firma y las pruebas locales tienen alcance propio. Para Finanzas y Academia usar el control productor de sus solicitudes y la versión servida; incorporar cualquier ejecución Google con su procedencia real antes de escribir datos o publicar la fuente pendiente.

Finanzas C09/C10 en Google consumió la solicitud del productor 12f9ea2 con DEV en 1691a76. La primera ejecución verificó la sesión Firebase Admin, el proyecto y el recibo de los anticipos. La aplicación no llegó a aplicar la HR en la primera sesión y no alcanzó las exportaciones. El resultado tipado está en `docs/checkpoints/CXORBIA_I3_GOOGLE_FINANCE_1795604796669348_TYPED_RESULT.json` y en el índice vigente del descriptor y del puntero. El SHA-256 de ese resultado es `42416b424494f0f250e81511b61e944fa6c5e716c404a27a4a718ecb9ba26bf2`. La ejecución utilizó Node 26.13.0. Para reproducir el entorno del workflow usar Node 24 verificando la versión efectiva, el transporte exacto de esta solicitud y el Chromium oficial 141.0.7390.37 de Playwright 1.56.1. Capturar el motivo de la autoridad HR desde su propietario v2 en la misma sesión y mantener bloqueadas las mutaciones. Se preservan el HOLD, las evidencias aceptadas, las dos entregas por Q7,300 y las limpiezas históricas.

La repetición con Node 24.22.3 quedó incorporada en `docs/checkpoints/CXORBIA_I3_GOOGLE_FINANCE_1795605397678784_TYPED_RESULT.json`. Firebase autenticó al Admin y el navegador recibió HTTP 200 de HR. La fuente de la aplicación seguía bloqueada, el objeto de autoridad aún no existía y la sesión no alcanzó las exportaciones. Investigar la lectura protegida anterior a `backendReady()` sin quitar los controles de red. El defecto de salto de línea en fechas ISO del PDF tiene matriz de verdad y comparación sintética antes y después en `docs/checkpoints/CXORBIA_I3_GOOGLE_FINANCE_PRINT_DATE_OWNER_20261125.json`. Distinguir esa corrección de las dos sesiones y del PDF operacional todavía pendientes.

**Trabajo paralelo autorizado, 25-11-2026:** Paula informó que remitió el traspaso a Work y pidió continuar los pendientes en paralelo. Consultar `docs/checkpoints/CXORBIA_I3_PARALLEL_CLOSURE_DELTA_20261125.json` y el punto de continuidad actualizado. Los cambios de control reconocen D01 por su documento aprobado, conservan los diagnósticos PDF al incorporarlos y permiten usar Google sin afirmar que se arregló la facturación de Actions. No cambian la fuente de producto ni la versión servida. El publicador debe resolver HEAD vivo y conservar estos deltas antes de escribir controles. La publicación Google queda en la sesión que acredite acceso; Work no es un requisito general de la tecnología. Leer `docs/checkpoints/CXORBIA_I3_GOOGLE_RECEIPT_COMPATIBILITY_20261125.md`: colocar un UUID Cloud Build en aliases numéricos de Actions puede rechazar materialización, ocultar pendientes o retroceder el último recibo. Adaptar procedencia, sucesión y cursor antes de incorporar, sin inventar IDs ni duplicar escritores. D06/B4 conserva su aprobación; la comparación exacta de dependencias está en `CXORBIA_I3_D06_B4_EXACT_CARRY_INSPECTION_20261125.json` dentro de checkpoints y no autoriza repetir bancos.

El delta paralelo conserva además el recibo E05 RUN2537 por codec histórico exacto, sin promover el task entero. F3 prueba pérdida de respuesta aplicación→cliente en su comando ya previsto y conserva el readback remoto Make pendiente como desconocido, no cero. El nuevo transporte Google de Finanzas de `5b1efc041` debe conservarse al incorporar los hunks de diagnóstico; no reanudar desde un checkout anterior ni duplicar un intento ya activo.

Fuente sucesora para el próximo despliegue emparejado de DEV: `235d6c28e72226f792514656fd5c47c8ba65cbee`, árbol `77b4de2c621560019ad043f22d90e75a508d2f79`. Conserva la reparación F3 de 8d70 y añade en el propietario probado la impresión de fechas ISO en una línea. La matriz V406 y el ledger V733 registran VRM-378. La fuente y el corte de control son distintos. DEV continuaba sirviendo 1691 en el último readback. La prueba sintética de impresión, las sesiones de Firebase y el HOLD operativo de Finanzas tienen alcances distintos. La prueba focal reproducible es `tools/qa/cxorbia-i3-finance-print-date-proof.cjs`; el transportador de Finanzas usa Node 24 y los datos de su solicitud original. No publicar 8d70 por separado.

Consulta el corte de ejecución y la siguiente acción en `docs/checkpoints/CXORBIA_I3_GOOGLE_HANDOFF_20261125.json`.

El control incorpora la rama tal como quedó en d45f9b80. Sus mapas D01/E05, la precisión de A08, el diagnóstico de Finanzas y los controles F3 conservan su procedencia. El ledger asigna VRM-377 al hallazgo previo de ese corte y VRM-378 a la corrección PDF. Los cuatro GET rechazados en el primer intento fueron imágenes de marca y banderas. Las mutaciones siguieron bloqueadas. Investigar el arranque Firestore protegido antes de repetir sesiones.

**Reanudación I3, 25-11-2026.** El recibo Google de Finanzas `1795624487264686` acreditó la sesión Admin en la HR protegida y la lectura de las tres filas en servidor, pantalla y XLSX. La fecha se parte en las tres filas del PDF de la versión servida. El sucesor `235d6c28` conserva la reparación VRM-378 y F3. La solicitud actual de Academia pasó su control previo sobre `1691a76`. Continuar desde `docs/checkpoints/CXORBIA_I3_GOOGLE_HANDOFF_20261125.json` y el índice del descriptor.

**Continuidad técnica paralela, 25-11-2026.** Resolver siempre HEAD y los cuatro controles vivos antes de escribir. La reparación `docs/checkpoints/CXORBIA_I3_VRM374_EXTERNAL_EXECUTION_CONTINUITY_REPAIR_20261125.json` preserva los cambios concurrentes de Work, separa IDs Google del cursor Actions y exige sucesión causal, replay exacto y CAS. Pruebas locales del mecanismo no son materialización ni PASS funcional. `consumeGoogleMaterialization` es entrada opcional del consumidor existente; sólo requiere `pendingDevSuccessor.pairedCloudBuild` si se utiliza esa entrada, con productor/configuración real y workflow original verificados. No crear otro ejecutor por rutina. El sucesor sigue siendo `235d6c28`, que incluye F3 y VRM-378; la última evidencia servida sigue en `1691`. Work conserva su sesión Google y el intento D08: recuperar su recibo antes de repetir o iniciar otra operación. La lectura pública independiente 48/48 y el tercer resultado Finanzas se conservan en el punto de continuidad actualizado; no son cierre de Fase A. Producción `DO_NOT_TOUCH`.

**Academia I3, 25-11-2026.** El ZIP Google verificado de la generación 1795625702166502 acredita el curso Admin, edición y replay en sesión nueva. El Shopper temporal carecía de los dos hashes de membresía. El ejecutor corregido conserva el guard de producto. Se retiraron 25 documentos y cuatro cuentas de la prueba. El seguimiento vigente está en el descriptor y en CXORBIA_I3_GOOGLE_HANDOFF_20261125.json.

Readback de la reparación paralela: `docs/checkpoints/CXORBIA_I3_VRM374_PUBLISHED_READBACK_20261125.json`. Sus 25 blobs en `8e0541eb` coinciden con el árbol probado. Work lo preservó como padre de `69aa6aaa`; su D08 parcial y corrección de fixture ya están en V409/V736. El segundo registro se detuvo ante ese avance concurrente y se rebasó; no sobrescribirlo. Guard canónico posterior PASS, I3 HOLD, fuente235d6 pendiente de publicación, producción `DO_NOT_TOUCH`.

**Corte posterior al pareado Google, 25-11-2026.** Work publicó `235d6c28` en runtime `00392-788` y Hosting `8c9523cb34a7e529`; recibo nativo `CXORBIA_I3_GOOGLE_BUILD_18d8d2fd-0e77-4692-a910-904c1bc66238_AUTOMATIC_DEV_RECEIPT.json`, blob `09b9dab404e4dd5c76ed64e8c8a930e15c0f68bf`, incorporado en `266f764a`. `30d19a63` incorpora el resultado Finance posterior: HR HTTP200 y cuatro lecturas Firestore TIMEOUT; Work tiene el diagnóstico de transporte activo. No volver a publicar235d por rutina ni repetir D08 sobre1691. El mapa C/D conserva siete alcances Admin/edición/limpieza ya observados; Shopper/Cliente y negativas no acreditadas siguen pendientes. `CXORBIA_I3_POST_GOOGLE_CONTINUITY_REPAIR_20261125.json` fija la precedencia por recibo/productor/solicitud y conserva la pareja vigente. Leer HEAD y controles vivos antes de escribir; mantener cada intento bajo su escritor. I3 HOLD; E10 puede avanzar con fixture sintética y corrección del owner probado, sin reimportar datos reales.
