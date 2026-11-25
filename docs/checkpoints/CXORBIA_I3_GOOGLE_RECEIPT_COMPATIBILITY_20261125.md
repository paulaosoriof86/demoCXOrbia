# Recibos Google: revisión focal antes de incorporar

Base examinada: CXOrbia, rama `recovery/cxorbia-phase-a-20260831`, control `bc0551d77652728e59ea92e3acca9ca404980f21`. Solo lectura de owners existentes y prueba local sintética; cero llamadas a Google/GitHub desde la prueba, cero cambios en el checkout y cero despliegues. Esto es una revisión de compatibilidad para el ejecutor que Work ya prepara; no define otro esquema, normalizador, workflow o candidata.

## Tres incompatibilidades reproducidas

1. **Materialización rechazada por UUID.** `tools/qa/cxorbia-i3-current-control-projection.mjs:152–158`, función `projectMaterialization`, compara `Number(r.runId)` con el run anterior. Un UUID Cloud Build produce `NaN` y falla con `SOURCE_FAILURE:OUT_OF_ORDER_MATERIALIZATION`, aunque source/tree sean los esperados.
2. **Se pueden ocultar resultados pendientes de Actions.** `tools/qa/cxorbia-i3-automatic-result-consumer.mjs:533–551`, función `pendingRuns`, calcula el piso desde `Number(postDeployRunSeal.runId)`. Si se coloca un UUID ahí, `r.id >= NaN` siempre resulta falso. La prueba con un run GitHub completado y sin journal devuelve **cero pendientes** con piso UUID y **uno** con el piso numérico legítimo. El preflight podría declarar cola vacía incorrectamente.
3. **Un evento viejo de GitHub puede reemplazar la automatización Google vigente.** `tools/qa/cxorbia-i3-automatic-result-consumer.mjs:519–525`, función `projectCurrentAutomationReceipt`, compara números para decidir cuál evento es nuevo. Con el UUID como recibo actual, ambas comparaciones de orden fallan y un evento GitHub anterior, todavía sin journal, reemplaza el actual. La prueba reprodujo `changed:true` y reemplazo de la identidad vigente.

La prueba `numeric_ordering_probe.mjs` llama las funciones actuales con datos sintéticos e inyecta una API local; `numeric_ordering_probe.json` contiene los tres resultados. Son defectos de una adaptación que escribiera UUID en aliases numéricos, **no fallos del despliegue GitHub histórico ni prueba de un deploy Google realizado**.

## Consecuencia mínima para Work

No basta adaptar `makeMaterializationReceipt` ni sustituir `GITHUB_RUN_ID` por `$BUILD_ID`. Antes de incorporar el primer resultado Google, conservar una identidad explícita de proveedor y el cursor legítimo de Actions, y resolver la sucesión por el recibo predecesor/HEAD esperado y la evidencia del intento. IDs de proveedores diferentes no comparten un orden numérico; tampoco basta ordenar por reloj.

El replay exacto debe ser NOOP. Un replay con distinto hash, un build de otra fuente/proyecto o un resultado contra otro predecesor debe detener la proyección. Un recibo tardío de GitHub conserva su evidencia histórica, sin retroceder la versión servida ni ocultar pendientes. El mismo cuidado aplica a `typedResultKey`/`pendingTypedRuns` (consumer:95–104), la cola y el índice funcional; `projectCurrentScopedClauses` también ordena por `Number(entry.runId)` y `Number(entry.jobId)` en `tools/qa/cxorbia-i3-scoped-clause-projection.mjs:60`.

`provider:'excel_online'` en `current-control-projection.mjs:162,165,178` identifica el proveedor **HR**. No debe sobrescribirse con `CLOUD_BUILD`, que identifica el ejecutor técnico.

## Owners y validadores que se conservan

- `tools/qa/cxorbia-i3-current-control-projection.mjs`: `makeMaterializationReceipt` (38–75) conserva las comprobaciones de fuente, runtime, Hosting, inventario completo y HR; su admisión inicial es solo Actions. `projectMaterialization`, `REGISTRY`, `validateProjectionRegistry` y `assertPreserved` deben seguir actualizando coherentemente descriptor/puntero/matriz/ledger, archivando aliases y preservando aprobaciones y HOLD funcional.
- `tools/qa/cxorbia-i3-automatic-result-consumer.mjs`: producer binding, preflight, descarga verificada, journals, cola, replay y commit con CAS. El descriptor del productor sigue siendo distinto del control vivo: Finanzas/Academia continúan ligadas al source1691 de su solicitud, mientras F3 aprobado al corte es8d70.
- `tools/qa/cxorbia-i3-f2-predeploy-proven-predecessor.mjs`: `validateBuiltArtifactResume` (10–30) y `validateResumedBuildRuntime` (44–52) ya verifican Cloud Build `SUCCESS`, proyecto, fuente almacenada, imagen/digest y runtime. Son referencias reutilizables; **no son un consumidor externo listo** porque conservan autoridad del run/artefacto GitHub original.
- `tools/qa/cxorbia-i3-hr-period-history-seed.mjs`: `validateHistorySeed` (11–25) puede conservarse. El transporte actual (34–36) depende de GH_TOKEN y del artefacto14934489092; entregar esos mismos bytes por un acceso autorizado no permite omitir digest/metadata/snapshot/readback ni reconstruir historia operacional.
- `tools/qa/cxorbia-i3-canonical-candidate-authority-guard.mjs:240–291`: las igualdades de sello, recibo, materialización, matriz y ledger deben seguir siendo exigibles después de la adaptación.

La referencia Gravicentra es `tools/gravicentra-i6-6-cloud-build-package.cjs` en commit `d45746b63850c208d6dff6e11518139783f5f56e`: `validateBuild`, `validateObject`, `validateWorkerProof`, `validateExecutionLog` y `verify`. Acredita procedencia nativa, generaciones, hashes y logs; sus IDs/proyecto/bucket/alcance son propios y no deben copiarse como autoridad CXOrbia.

## Datos que no pueden perderse

Identidad real del proveedor y ejecución; proyecto/región/cuenta de servicio; status y tiempos del intento/step; control y fuente del producto con tree; solicitud y recibo predecesor exactos; build y digest; versión/release Hosting; revisión/digest/tráfico Cloud Run; archivos servidos y SHA-256; HR con la misma revisión y ventana/historia; artefactos de evidencia con ubicación, generación, tamaño y hash; readback y CAS de incorporación. Distinguir imagen runtime, ZIP de evidencia DEV y TAR certificado I4.

El éxito Google no resuelve por inferencia la facturación de Actions. El bloqueo de Actions conserva su historial, mientras la siguiente acción puede usar el ejecutor Google acreditado. Gate21/I4 todavía tienen admisión GitHub explícita: `.github/workflows/cxorbia-recovery-i4-immutable-production-replacement.yml:83–138`. Adaptar procedencia allí cuando corresponda, conservando artefacto exacto, aprobación y ausencia de rebuild.
