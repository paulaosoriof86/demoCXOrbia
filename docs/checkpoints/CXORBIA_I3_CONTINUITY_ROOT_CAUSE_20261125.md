# Continuidad y causa raíz — CXOrbia I3, 25 de noviembre de 2026

## Alcance y estado

I3 / HOLD. Este diagnóstico conserva el producto, la rama `recovery/cxorbia-phase-a-20260831`, el carril paired DEV y los contratos originales. No concede PASS integral, no modifica producción y no demuestra una causa interna de las interrupciones de ChatGPT.

Base inspeccionada: `5446e5bace129b63d361de9e238342426a3715c0`. En ese corte, DEV acredita source `235d6c28e72226f792514656fd5c47c8ba65cbee`, runtime `cxorbia-live-hr-dev-00392-788` y Hosting `sites/cxorbia-backend-dev/versions/8c9523cb34a7e529`. El sucesor E10 es `d727f3be67a4430f08216dbb37cccba790f934f5`, tree `e8bf021e54e84cb52a925824ffc02527f5073164`. La imagen existe y está verificada; no confundirla con publicación emparejada ni artefacto certificado I4.

Resolver nuevamente HEAD y ejecutar el guard con `--current` al retomar. Estas identidades son evidencia del corte, no punteros permanentes.

## Actualización acumulativa — 25/11, 17:59 Guatemala

Base de esta corrección: `6e09467827ab4b39782ea22b32759340acaa62c9`. El corte inicial anterior permanece histórico. La publicación pendiente ya terminó: Cloud Build `5670f782-19af-47aa-bdda-47cf94c689f2`, source `d727f3be67a4430f08216dbb37cccba790f934f5`, runtime `cxorbia-live-hr-dev-00393-p54`, digest `sha256:5fa6ff90745230ca31b33f529be385570182cd527684745d3dfb86cc1834b2d8` y Hosting `607182bc22875d48`. El recibo `CXORBIA_I3_GOOGLE_BUILD_5670f782-19af-47aa-bdda-47cf94c689f2_AUTOMATIC_DEV_RECEIPT.json` quedó incorporado en `3937d974`; 50 assets coinciden, HR conserva 88 visitas e IDs únicos y el importador servido supera 17 casos sintéticos. La previsualización CSV/TSV distingue Nuevo, Conflicto, Dup y Descartado. El recibo E10 limita expresamente su alcance: no certifica importación autenticada ni replay durable y registra cero importaciones reales.

### Prevención automática, además de corregir el texto

Se reprodujo en memoria un fallo adicional del mismo owner de continuidad: cuatro referencias iguales al mapa C/D histórico pasaban el guard aunque el índice contuviera el Finance PASS posterior. También se identificó que `consumeRun` podía capturar un fallo de proyección y continuar al commit después de retirar una entrada de la cola. Clasificación: **MAPPING_FAILURE**; no es prueba de una regresión del producto.

La corrección permanece en el consumidor, proyector y guard existentes:

- El lector de alcances incluye `FINANCE_UI_READONLY` y verifica hashes de todos los recibos antes de discriminar su tipo.
- El proyector aplica los alcances exactos de dos sesiones y exportaciones al mapa existente, conserva el resto de las aceptaciones y es idempotente. No promueve C09/C10 completos ni dominios.
- El guard comprueba que el mapa corresponda a los recibos aceptados; cuatro referencias igualmente viejas ya no satisfacen la comprobación.
- El consumidor propaga un fallo de proyección antes de publicar. La validación final comprueba recibos, mapa, inventario original, evidencia preservada, seis MATCH, B4/B5/B6/B7 y aliases antes de cualquier escritura Git.
- Las entradas incorporadas no pueden desaparecer ni cambiar bajo la misma clave. Se mantienen únicamente las transformaciones ya autorizadas de normalización A08 y adición D08 de un binding verificado por su owner; no se permite cambiar un binding existente.

Validación focal: **414 pruebas, 414 PASS, 0 FAIL**, incluyendo mapa antiguo con hashes válidos, recibo cambiado a otro tipo, reemplazo bajo la misma clave, eliminación del mapa, pérdida del alcance C04, PDF fallido, segunda sesión ausente, mutación financiera, rechazo antes del CAS, replay sin cambios y consumo nativo Google. Resultado completo: `CXORBIA_I3_CONTINUITY_ATOMICITY_20261125.tap`. La candidata de producto y la identidad servida permanecen intactas.

### Escritura F3: siguiente trabajo operativo obligatorio

La corrección del adaptador Make (VRM-376) está servida. El config F3 ya está vinculado a la pareja `5670f782`. El impedimento de ejecución pendiente es exacto: el runner F3 todavía exige identidad Actions, mientras el helper/transporte Google existentes solo admiten Finance y Academia. Completar ese soporte dentro de los owners existentes y preparar la incorporación del resultado antes de lanzar. No crear otro workflow, runner independiente ni candidata; no convertir una generación Google en un ID de Actions.

Ejecutar el fixture aislado autorizado y acreditar comando de aplicación, ACK remoto, lectura independiente, journal, pérdida real de respuesta al cliente, replay, base obsoleta, ausencia de rollback, restauración y limpieza. La pérdida de respuesta al cliente sí está implementada; falta su prueba ejecutada y la cuenta física de escrituras en Make. El mapa B anterior no debe usarse para afirmar que ese caso no existe en el runner. La lectura durable debe probarse expresamente; `fresh=1` por sí solo no solicita `readModel=1`.

La consulta de Make de este corte observó el lector `10200465` activo y sus ejecuciones recientes correctas; el escritor QA `10199316` activo no tiene todavía una nueva escritura de aplicación acreditada. Los escenarios legacy y sus colas no certifican F3. Los datos operativos conservan `external_read_only` / `hrWritesEnabled:false` hasta completar los contratos aplicables. La actualización externa servida es periódica de cinco minutos con pestaña visible y refresco explícito; no se presenta como push instantáneo.

Estado: **I3 / HOLD**. La autorización I3 permanece vigente. Producción y certificación terminal no se deducen de esta publicación DEV ni de las pruebas del método. La solicitud urgente de Paula de publicar en producción se conserva como intención; el objeto exacto de I4 todavía debe existir y cumplir los contratos P0 antes de reemplazar el sitio productivo.

## Hechos recuperados y preservados

| Hecho | Evidencia existente | Alcance y límite |
|---|---|---|
| DEV235d publicado y leído de vuelta | `CXORBIA_I3_GOOGLE_BUILD_18d8d2fd-0e77-4692-a910-904c1bc66238_AUTOMATIC_DEV_RECEIPT.json` | Runtime/Hosting emparejados, 49 assets, HR88. Incluye correcciones F3 y PDF; no I4. |
| Finanzas: dos sesiones Admin y exportaciones PASS | `CXORBIA_I3_GOOGLE_FINANCE_1795638868819016_TYPED_RESULT.json` | Movimientos y Dashboard, XLSX/PDF con contenido; dos anticipos estables; cero mutaciones. No cierra pagos, lotes, soporte, otros roles ni KPI HR independiente. |
| Academia235d: recorrido Admin y recurso observados, intento incompleto | `CXORBIA_I3_GOOGLE_D08_1795639660815985_TYPED_RESULT.json` | Archivo Google verificado; limpieza de 25 documentos y 4 cuentas Auth, cero residuos. Shopper/Cliente y límites no observados siguen pendientes. |
| E10 fuente corregida | `CXORBIA_I3_VRM379_E10_SOURCE_20261125.json` | Owner `app/core/importador.js`; Honorario/Ref, 17 pruebas PASS. Cero reimportaciones reales. |
| E10 imagen construida | `CXORBIA_I3_GOOGLE_IMAGE_BUILD_748EBF68_20261125.json` | Build 748ebf68, digest `sha256:5fa6ff90745230ca31b33f529be385570182cd527684745d3dfb86cc1834b2d8`; reutilizar sin rebuild. |

Las rutas de la tabla son relativas a `docs/checkpoints/`. B4/B5/B6/B7 y los seis dominios MATCH permanecen conservados. Las 52 tareas funcionales son A01–A09, B01–B14, C01–C10, D01–D08 y E01–E11 del plan original, cuyo SHA256 es `83e8f2c0a6b190bab1d9dea32bf99158116f3164f419ae72e051fd791fd8576c`. No se añadieron 52 pruebas ni se reabrieron 21 dominios.

## Causas demostradas del reproceso

1. **Proyección documental atrasada.** El mapa C/D todavía afirmaba PDF pendiente en C09 y dos sesiones no aprobadas en C10 después de incorporar el recibo financiero PASS. Se corrigen únicamente esas frases, se enlazan sus bytes por hash y se conserva `PARTIAL_PROVEN` de las tareas completas. El proyector existente vincula la referencia a los cuatro controles; no se agregan pruebas funcionales.

2. **Lectura operativa dispersa entre controles históricos extensos.** En 17fa, descriptor/puntero/matriz/ledger ocupaban 1.80/1.46/3.48/2.94 MB. Parte del crecimiento proviene de historia preservada y de copiar `executionBinding` a 21 módulos y 170 filas. No se modifica ese contrato durante la publicación. El modo `--current` del guard existente produce una vista derivada pequeña, con referencias y siguiente acción, después de ejecutar las mismas validaciones.

3. **Historial Git incompleto presentado como fallo de composición.** Un checkout superficial carecía del commit C3 y después de parte de su ascendencia. Recuperar los objetos restableció el PASS sin cambiar producto. El guard ahora distingue `ENVIRONMENT_FAILURE:CHECKOUT_MISSING_C3_SOURCE`, `CHECKOUT_MISSING_C3_CONTROL` y `CHECKOUT_INCOMPLETE_C3_ANCESTRY`. Continúa bloqueando la lectura válida hasta resolver el entorno.

4. **Clasificación insuficiente del timeout de Academia.** El runner clasifica errores sin prefijo como `FUNCTIONAL_DEFECT`; el archivo actual no demuestra todavía un defecto de curso. La tercera sesión `admin-edit-new-session` no alcanzó el bootstrap protegido: gate blocked, authorityError vacío, ownerAcademia ausente. Los abortos de Firestore no tienen timestamps de navegación y pueden incluir el reload del propio runner. No se modifica producto ni se aumenta el timeout por inferencia.

5. **Dependencia de la conexión de ejecución.** Después de leer Google y recuperar resultados, el conector de Chrome dejó de responder y luego informó que no había navegador conectado. Esto limita nuevas observaciones/acciones desde esa sesión. No invalida recibos durables ni prueba que el producto o la cuenta Google estén defectuosos. No se atribuye a Paula la desconexión y no se afirma reparar internamente ChatGPT.

## Validación de la corrección de continuidad

- Guard normal modificado: PASS; JSON completo idéntico al guard previo sobre la misma base.
- Guard `--current`: PASS; distingue d727 aprobado de 235d servido; muestra el PASS Finance, el D08 incompleto, la cola y las referencias vigentes; terminalReleaseEligible=false.
- Negativa de alias roto, inyectada sólo en memoria: rechaza con `MAPPING_FAILURE:CURRENT_AUTHORITY_ALIASES`, exit1 y cero resumen.
- Negativa de objeto C3 ausente, inyectada sólo en memoria: rechaza con `ENVIRONMENT_FAILURE:CHECKOUT_MISSING_C3_SOURCE`, exit1 y cero resumen.
- Los cuatro controles quedaron intactos durante esas pruebas. El mapa posterior conserva clasificaciones, B4/B5/B6/B7, recibos, fuente servida, fuente sucesora y política productiva.

## Siguiente acción exacta

1. Leer HEAD vivo con el modo `--current` y revisar Google por una ejecución E10 ya activa o terminada; no duplicarla. Si existe, incorporar su resultado real antes de otro write. Si no existe, usar `pendingDevSuccessor.pairedCloudBuild` y el job existente con la imagen 748ebf68, source d727 y los 50 assets, incluyendo `core/importador.js`. No reconstruir imagen ni desplegar HEAD completo.
2. Incorporar el recibo emparejado de source/runtime/digest/Hosting/HR antes de nuevas pruebas funcionales. Si un build quedó fijado a un productor anterior, conservar su resultado real y aplicar la validación de sucesión existente; no falsificar su identidad.
3. Ligar los residuales F3, E10, Academia y los demás contratos abiertos al nuevo recibo. Conservar el PASS Finance y los alcances Admin; ejecutar únicamente lo no demostrado.
4. Para el próximo fallo de bootstrap de Academia, capturar antes de reload/close `authorized`, `protectedBackendReady`, `runtimeDependenciesReady`, `exhausted`, principal exacto y código sanitizado de `CX_BACKEND_LAST_STATE`. Reutilizar el diagnóstico ya existente de Finanzas: consultas servidor limit 1 bajo el mismo actor/tenant/proyecto y REST de contraste sólo si todas terminan en TIMEOUT. Clasificar según evidencia: transporte SDK, Auth, dependencia/artefacto, backend o bridge. No volver a tratar un timeout genérico como owner de producto demostrado.
5. Mantener HOLD hasta completar los contratos residuales de negocio y C3/Gate20/Gate21 sobre el mismo artefacto. Presentar ese artefacto y hash a Paula para autorización I4; no sustituir producción antes.

La revisión no ofrece un porcentaje de avance ni una fecha de cierre sin evidencia. Los recibos aceptados permiten continuar desde los pendientes, sin reiniciar el producto ni volver a los alcances ya probados.
