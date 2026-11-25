# I3 — reparación local de admisión y continuidad Google

## Estado y alcance

I3, SOURCE_ONLY, HOLD. Se repara el tratamiento técnico de la identidad del ejecutor y se prepara una entrada opcional de admisión Cloud Build dentro del consumidor existente. No se ejecutó ni se certificó una materialización nueva; no se llamó a Google/GitHub en modo escritura, no se desplegó, no se creó un workflow, runner o candidata, y no se cambió producto. El producto pendiente sigue siendo `235d6c28e72226f792514656fd5c47c8ba65cbee`; el DEV observado por root sigue sirviendo `1691a76a7bc095ad4bf444aa0db76df2f359a5f0`.

La vía ya existente de Finanzas `GOOGLE_CLOUD_SHELL` con objetos `start/result` de GCS conserva su protocolo. El avance concurrente de Work `99464bf97e76800a1150a763ccc2a3ad18d11fa9` añade transporte D08; sus cambios de `google-qa-execution.mjs` se fusionaron conservando sus funciones y pins exactos, y sus pruebas Google/D08 se incorporaron a la regresión. Un resultado de esa QA no prueba la materialización runtime+Hosting. `pairedCloudBuild` es un contrato opcional requerido únicamente cuando alguien invoca la admisión Cloud Build; no es prerrequisito de la secuencia Actions existente ni de Finanzas. No existe configuración pareada real conocida y este trabajo no crea una.

## Owners existentes y evidencia de este corte

Los siete owners de consumidor, proyección, lectura Google y guards, sus pruebas, hashes y reproducciones están enumerados en `CXORBIA_I3_VRM374_EXTERNAL_EXECUTION_CONTINUITY_REPAIR_20261125.json`. El cambio se incorpora una sola vez sobre el HEAD vivo preservando Work. El log integrado es `CXORBIA_I3_VRM374_INTEGRATED_CONTROL_TESTS_20261125.tap`: 682/682 pruebas PASS, cero fallos, con los cambios concurrentes D08 de Work. Son pruebas locales del mecanismo y regresión, no sesiones empresariales.

## Fallo reproducido y reparación

El proyector original de `36353caf9101ca2996dee8cb471cb415114fa909` rechaza un UUID Google con `SOURCE_FAILURE:OUT_OF_ORDER_MATERIALIZATION` al convertirlo a número. El resultado anterior quedó en la sección `reproducedBefore.uuidProjection` del recibo de reparación.

El proyector identifica `executionProvider` explícitamente. Los recibos históricos sin etiqueta siguen siendo Actions. `provider: excel_online` conserva su significado HR. Dos etiquetas técnicas contradictorias fallan. Actions mantiene IDs decimales seguros, Google mantiene el UUID nativo, `runNumber: null`, `runAttempt: 1` y ninguna identidad Actions inventada. El cursor `actionsScanCursor` se conserva separadamente e idéntico en descriptor, pointer, ledger y matrix; Google no lo reemplaza ni lo convierte a NaN.

Toda transición entre proveedores exige el predecesor exacto, su ruta/blob/identidad, el request del descriptor productor, el control SHA productor y el HEAD esperado de CAS. El reloj valida ventanas del proveedor, pero no establece por sí solo precedencia. Replay con los mismos bytes es NOOP; otro contenido para la misma ejecución falla. El retorno Google→Actions exige la misma relación causal y sólo entonces avanza el cursor Actions.

## Entrada existente del consumidor

`consumeGoogleMaterialization` es una función exportada del owner existente `cxorbia-i3-automatic-result-consumer.mjs`. No se añadió otro CLI ni ejecutor. Se suministran el adaptador GitHub `api`, `buildId` nativo, `location` y `expected`. `dryRun: true` valida y devuelve el mapa exacto de archivos para revisión sin escritura. La persistencia posterior usa el escritor CAS y readback ya existentes.

`expected` debe contener:

| Grupo | Campos y autoridad |
| --- | --- |
| Producto y control | `controlSha`, `sourceSha`, `sourceTree`; coinciden con descriptor productor y árbol Git |
| Request | `request.path` igual al descriptor canónico, `field: pendingDevSuccessor`, `gitBlob` y `sha256` de sus bytes exactos |
| Predecesor | `predecessorReceiptPath`, `predecessorReceiptBlob`, `predecessorExecution: {provider, runId, runAttempt}` |
| Ejecución autorizada | `serviceAccount`, `stepId`, `step`, `workflow`; proceden de `pendingDevSuccessor.pairedCloudBuild` versionado en el descriptor productor |
| Workflow | Ruta exacta `.github/workflows/cxorbia-recovery-i3-dev-certification.yml`, job `vrm154-156-dev-materialization`, `gitBlob` y `sha256` verificados en el control SHA productor |
| Fuente nativa | `sourceObject: {bucket, name, generation, size, sha256}`; coincide con la configuración productora y con `resolvedStorageSource` nativo |
| Evidencia | `evidenceObject: {bucket, name, generation, size, sha256}`; se verifica contra objeto inmutable y manifiesto nativo del build |

El consumidor valida `pendingDevSuccessor` en descriptor y pointer del productor: estado `P0_PROVEN_PENDING_DEV_MATERIALIZATION`, scope `RUNTIME_AND_HOSTING`, producto exacto, `production: false`, `devPublished: false`, sello y materialización predecesores exactos. También comprueba el parentesco del productor con el HEAD actual y consume primero cualquier trabajo Actions pendiente. No acepta un documento arbitrario sólo porque tenga hash.

La configuración `pairedCloudBuild` sólo admite ubicación, cuenta, paso y fuente previamente fijados por el control productor, vinculados al workflow existente. Un caller no puede escoger otro paso o archivo fuente. Su ausencia causa `SOURCE_FAILURE:GOOGLE_PAIRED_CONFIGURATION_UNPROVEN` sólo en esta entrada opcional. Crear/revisar una configuración concreta y ejecutar sus comandos queda fuera de este paquete; Work conserva su operación actual.

## Readback nativo y salida

`readGooglePairedArchive` sólo usa `gcloud builds describe`, `gcloud builds log`, `gcloud storage objects describe` y `gcloud storage cat`. Si el nombre del recurso usa número de proyecto, verifica la correspondencia mediante `gcloud projects describe cxorbia-backend-dev`. No crea builds ni hace deploy.

Exige build y único paso relevantes en SUCCESS, ventana temporal válida, cuenta exacta, paso ejecutable igual al fijado, sin bypass de fallos, pasos adicionales ni overrides globales. Las sustituciones ligan scope, control SHA, producto/árbol, request blob y predecesor blob. Sólo se admite la forma de fuente `resolvedStorageSource` implementada; una fuente distinta falla, sin inferir equivalencia.

Los objetos GCS conservan bucket/nombre/generación/tamaño/SHA256 exactos. El ZIP debe figurar en el manifiesto de artefactos de ese mismo build, con la misma generación y MD5 nativo. Se valida la generación del propio manifiesto cuando Google la proporciona, su tamaño y bytes. Se aceptan las variantes reales verificadas de `file_hash`/`fileHash` anidado y MD5 hexadecimal/base64. Duplicados, hashes ambiguos y contenido divergente fallan. El ZIP se extrae localmente con controles de traversal, symlinks, duplicados y tamaño.

El binding nativo conserva proyecto, ubicación, nombre de recurso, UUID, cuenta, paso, hash canónico del paso, workflow, metadatos/logs SHA256, objetos fuente/evidencia y manifiesto inmutables. Cuando se usa número de proyecto añade `projectNumber` y `projectMetadataSha256`. Sólo un binding verificado por lectura nativa y protegido contra mutación puede producir un recibo en memoria.

La admisión exige después todas las pruebas pareadas existentes: inventario completo de assets fuente/servidos, Hosting exacto, runtime/digest/tráfico, HR misma revisión y cero escrituras no permitidas; la ventana HR se exige cuando el request productor la exige. SUCCESS del build por sí solo no concede materialización ni aprobación funcional.

La salida usa el esquema de recibo actual y la ruta `docs/checkpoints/CXORBIA_I3_GOOGLE_BUILD_<UUID>_AUTOMATIC_DEV_RECEIPT.json`. `executionProvider` y `executionBinding` se proyectan consistentemente en los cuatro controles y aliases activos; se conserva el historial. El consumidor añade el journal técnico en `docs/checkpoints/CXORBIA_I3_GOOGLE_<UUID>_EXECUTION_JOURNAL.json`, el archivo de migración de aliases y las nuevas versiones de ledger/matrix. En dry-run devuelve un `Map` con todos los bytes; la entrada de escritura se mantiene CAS y readback.

## Garantías y pruebas

Las pruebas usan archivos reales de los cuatro controles y APIs simuladas; no constituyen un readback operacional Google. Cubren admisión y replay, formas nativas observadas, cuentas/proyecto/step/source/request/generaciones/hashes incorrectos, assets/Hosting/runtime/HR incompletos, sucesión causal y retorno Actions, cursor preservado, proveedores contradictorios y binding falso o mutable. Las suites Actions y Google/Finance previas también se ejecutan para comprobar compatibilidad.

La verificación integrada cubre trece suites existentes y focales, incluido el transporte Google/D08 de Work, Finanzas, fallos sin ejecución, proyección de cláusulas y guards. El recibo conserva 682 pruebas PASS, cero FAIL y sus bytes/hash. Los 13 casos iniciales del consumidor fallaban antes; su log completo está en `CXORBIA_I3_VRM374_PROVIDER_REPRODUCTION_BEFORE_20261125.log`. Los fixtures aislados se completaron con identidad de intento y contexto sintético coherente; no se aflojó la validación de producción.

Los MATCH existentes, C3 histórico, aprobaciones B4/B5/B6/B7, límites funcionales y producción DO_NOT_TOUCH se preservan. Ningún recibo de esta vía cambia `phaseAComplete`, `terminalCertified`, dominios MATCH o autorización I4. Gate21 e I4 siguen fuera del alcance.

## Fuentes revisadas para el esquema nativo

- Referencia real autorizada: https://github.com/paulaosoriof86/orbit360-core/blob/d45746b63850c208d6dff6e11518139783f5f56e/tools/gravicentra-i6-6-cloud-build-package.cjs — `validateBuild`, `nativeArtifactMd5` y `verify`: nombre con ID/número de proyecto, manifiesto con/sin generación, estructura nativa anidada y envoltura base64 del MD5. No se copió su ejecutor ni su scope de producto.
- Referencia API oficial: https://docs.cloud.google.com/build/docs/api/reference/rest/v1/projects.builds — `Build.name`, `id`, `projectId`, `steps`, `sourceProvenance`, `results.artifactManifest`, tiempos y cuenta de servicio.
- Artefactos oficiales: https://docs.cloud.google.com/build/docs/building/store-artifacts-in-cloud-storage — ubicación `artifacts-$BUILD_ID.json`, `location` con generación y hash MD5 nativo.

## Límite pendiente

No existe todavía recibo Google pareado real de `235d6c28...` ni configuración productora pareada publicada que pueda admitirse. El paquete está preparado y probado en fuente, con persistencia única en la rama canónica. La materialización real y la certificación funcional requieren evidencia posterior de la operación del publicador único autorizado; no se sustituyen por estos tests.
