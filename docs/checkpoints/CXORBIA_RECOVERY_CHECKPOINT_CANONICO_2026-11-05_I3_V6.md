# CXOrbia Recovery — checkpoint canónico I3 V6

**Corte:** 05-11-2026, Guatemala. **Estado:** `HOLD`; **iteración:** I3 — cierre funcional. **Producción:** `DO_NOT_TOUCH`; **I4:** no autorizada.

## Autoridades que no deben retroceder

- Repo único: `paulaosoriof86/demoCXOrbia`, rama `recovery/cxorbia-phase-a-20260831`.
- Fuente exacta de producto `09eed4f012f9ad04e49d53569aabd86bd4c832a9`, árbol `e6f941c511272dfb0d258e935d7c1526c83b31cb`. DEV Hosting `sites/cxorbia-backend-dev/versions/3b675f7bcc8b07e6`, runtime `cxorbia-live-hr-dev-00347-jmn` y digest preexistentes; ninguna publicación nueva de producto ni producción.
- Matriz única `RECOVERY-I3-MODULE-TRUTH-MATRIX-20261105-V245.json` (blob Git `3d68b87ea0a487930e695cdef63b3795288be861`): 21 dominios, 5 `MATCH`, 3 `TRUE_FUNCTIONAL_DEFECT`, 1 `COMPOSED_NOT_DEPLOYED`, 12 con QA/E2E pendiente. No convertir pruebas focales en certificación integral.
- Fusión de los **83/83 grupos exactos previamente aprobados**: `RUN42080118914` PASS, con 14 últimas fusiones y conservación verificada de 70 visitas, 33 liquidaciones, 17 conciliaciones y 4 certificados en ese lote. Continúa siendo una cohorte aprobada, no implica que no existan grupos de identidades transversales fuera del grafo inicial.
- Corrección HR de nombres: 15 celdas Jhennypher Murga GT + una Rocío Vilca HN, 16/16 ACK y readback; ninguna otra celda de esas filas cambiada. Revisión HR nueva, probada por un readback independiente de DEV `RUN42101372355`: `63ddfdf36e347db63b36e26e24a010d20a99c63f6e36c6542d25497bc2f6f9ba`. No usar la revisión histórica `cdc40258...` como si fuese posterior a las correcciones.
- Control anti-desincronización corregido en commit `6515302460a42fbcbabc98083bef19b8022802a6`; descriptor, puntero y matriz V245 muestran hash idéntico. Control en CI y 12/12 pruebas de guard PASS; no reabrir PASS históricos sin drift probado.

## Identidades/expedientes P0 — evidencia nueva

- `RUN42101372355` Admin/HR/Auth read-only PASS, artifact `13448638306`: **Jhennypher Murga GT** = 11 perfiles en censo del adaptador (versus nueve identificados por un inventario que inspecciona otros campos), 1 identidad fuente HR, 11/11 perfiles cuyo ID no coincide directamente con el ID HR, 3 cuentas Auth activas, candidata keeper `jennypher.murga`, **46** referencias (12 conciliaciones, 7 certificaciones, 9 liquidaciones, 18 visitas). La única cuenta definitiva debe mostrar **Jhennypher Murga** respetando nombre HR, mientras conserva aliases, teléfonos y datos históricos.
- **Rocío Vilca HN** = 5 perfiles, 2 identidades HR, 3 cuentas Auth, 15 referencias; keeper con login final deseado `rocio.vilca`; otra cuenta tiene sesión reciente, por lo que está protegido su acceso y no se desactiva sin plan de transferencia.
- Intentos Murga `RUN42100585614` y `RUN42101033456`: `MAPPING_FAILURE:EXACT_MURGA_GRAPH_COUNT_DRIFT` **antes de cualquier comando de fusión**, `providerAck=false`, sin modificaciones Auth, HR, Firestore, visitas ni pagos. No reintentar con el literal cambiado a 11: falta demostrar el puente fuente HR → perfil canónico/crosswalk; evitar una fusión errónea por nombre.
- Stiven (Admin diez visitas vs Shopper cero) y la cola de expedientes/casos de identidad necesitan cierre por el mismo criterio transversal, no corrección por persona o período.

## Certificación de módulos — prueba positiva nueva

- `RUN42102176594` / artifact `13449967793`: ciclo **D05 QA positivo** PASS contra la fuente exacta vigente, sin supuesto de cuatro bancos fijos ni dependencia de octubre. Publicar, configurar y retirar el banco QA obtuvieron HTTP 200, ACK proveedor y recibos remotos para cada una de las tres operaciones; el banco aislado terminó como `deleted_withdrawn_tombstone`, versión 4; ningún banco real fue alterado, ninguna exposición Shopper, ningún write HR o producción.
- D05 **no es MATCH integral**: faltan UI Admin y experiencia Shopper en el mismo artefacto. Cuatro trabajos antes omitidos corrieron PASS bajo sus marcadores específicos; otros nueve trabajos de RUN42084843656 terminaron `SKIPPED` intencionalmente y no equivalen a certificación.
- Requisitos funcionales aún abiertos: adaptadores canónicos HR, certificados y finanzas como 3 `TRUE_FUNCTIONAL_DEFECT`; frontera ACK compuesta pendiente de despliegue, y 12 módulos de integración/experiencia sin E2E integral. Gates 20/21 `HOLD`.

## Siguiente acción exacta por propietario, sin repetir diagnóstico general

1. **P0 MAPPING_FAILURE** del adaptador `shopperId` HR → perfil/crosswalk: reproducir los once perfiles Murga con IDs opacos y fuentes; diseñar un upsert idempotente transversal GT/HN que preserve el UID/keeper y no genere duplicados. Unit + provider regressions, sin tocar fuente vigente hasta demostrar delta P0 y owner exacto.
2. Consolidar **Murga** y después **Rocío** con la autorización de Dirección ya registrada, pero solo con preflight de revisiones actuales, estabilidad de sesión, ACK, dos replays de cero writes, lectura posterior de todos los dominios y acceso ordinario Shopper. No forzar credenciales o desactivar sesión reciente.
3. Certificación por **21 dominios** con QA Admin/Shopper/cliente GT/HN, Visitas, Mi Perfil/Mis Visitas, cuestionarios D05, postulaciones/asignaciones, expedientes, historial, G03 HR/finanzas, reportes, KPIs y pagos. Ejecutar explícitamente los jobs antes `SKIPPED` con fuente 09eed, clasificar por hechos; D05 positivo queda PASS focal preservado.
4. Repetir Gates 20/21 sobre el mismo artefacto único, checklist de paridad HR en vivo y sin duplicados. Solo después `I3 GO` y solicitud explícita I4 para reemplazo productivo certificado.

**Método:** 5 iteraciones I0–I4, una candidata, un manifest, no reimport, no legacy DB, no overlays; historial PASS preservado y avances únicamente con ACK/readback.
