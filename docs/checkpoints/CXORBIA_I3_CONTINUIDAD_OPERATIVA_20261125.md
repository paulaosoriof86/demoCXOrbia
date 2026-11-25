# Continuidad operativa de I3 — 25 de noviembre de 2026

## Autoridad y estado vigente

**I3 / HOLD. Fase A todavía no tiene aceptación terminal. Producción: `DO_NOT_TOUCH`.**

El punto de reanudación es el HEAD vivo de `recovery/cxorbia-phase-a-20260831` en `paulaosoriof86/demoCXOrbia`. Leer el descriptor, `CXORBIA_RECOVERY_EXECUTION_CURRENT.json` y los blobs exactos de matriz y ledger que señalan. Este documento resume esos registros; no los sustituye. No retomar una instrucción histórica de un chat por encima del control vivo.

La última incorporación de Work preservada en este corte es `99464bf97e76800a1150a763ccc2a3ad18d11fa9`: transporte D08 vinculado a generaciones Google. Conserva el resultado financiero incorporado en `13c0d66a9cb7af17107567bd3973b66f2c045cd3` y el diagnóstico `8b2f0cd48c1f69a009c6affb6ea590557d20c409`. Work tiene la sesión Google y los alcances de Finanzas, Academia y publicación DEV pendientes. La reparación paralela de continuidad modifica solamente sus owners de control, sus pruebas y sus registros; no toma esa sesión ni inicia otra publicación.

## Fuente aprobada, DEV servido y última ejecución

| Elemento | Identidad comprobada |
|---|---|
| Candidata única pendiente de publicar | Source `235d6c28e72226f792514656fd5c47c8ba65cbee`; tree `77b4de2c621560019ad043f22d90e75a508d2f79` |
| Deltas incorporados en esa candidata | F3 de `8d70a09d1c58d31f5f4b0926f519bb7ac6695749` y reparación PDF VRM-378. El source `8d70` es un predecesor, no la instrucción vigente de publicación. |
| DEV servido en el último recibo | Source `1691a76a7bc095ad4bf444aa0db76df2f359a5f0`; tree `3725071a72014d6b891648ab5d2eeef9638276ac`; RUN2780 `45488581923`, intento 1 |
| Runtime de ese recibo | `cxorbia-live-hr-dev-00391-8mg`; digest `sha256:2d70255dc8d50ba4e9b4f6ed7729b14f296911cfd2a62042b42da36b3b59fa27` |
| Hosting de ese recibo | `sites/cxorbia-backend-dev/versions/511061474d07baca` |
| Readback independiente de Hosting | 25-11-2026, 10:34:08 Guatemala: 48/48 archivos públicos coinciden byte por byte con el recibo de `1691`. Sólo prueba estática; no acredita runtime, HR, roles ni publicación de `235d6`. |
| Último resultado Google de Finanzas incorporado | `CXORBIA_I3_GOOGLE_FINANCE_1795624487264686_TYPED_RESULT.json`; `FUNCTIONAL_DEFECT:C09_C10_PDF_CONTENT`; fuente servida `1691` |
| Último intento Actions no iniciado | RUN2787 `45564175381`, intento 1; fallo de cuenta antes de asignar ejecutor, sin pasos ni artefactos. Su journal ya está incorporado. |

El HEAD de control, la candidata aprobada, el artefacto servido, el productor QA y la última ejecución son identidades diferentes. `pendingDevSuccessor` conserva el predecesor servido hasta una materialización emparejada con readback exacto. No publicar HEAD completo, no publicar el F3 intermedio por separado y no llamar desplegada a una prueba local.

## Avance real de Work que no se repite

El tercer resultado Google de Finanzas superó el bloqueo de arranque de los dos intentos anteriores. La sesión Admin aplicó la HR protegida, seleccionó proyecto y periodo, leyó las tres filas en servidor, comprobó pantalla y los dos anticipos, y verificó las tres filas de la vista previa, XLSX y DOM de impresión. El PDF nativo separó las fechas de las tres filas. La evidencia PDF cifrada tiene objeto, generación y hash verificados.

Ese resultado es **parcial y HOLD**: no terminó el dashboard, la lectura final ni dos sesiones independientes. Conserva cero movimientos financieros nuevos, cero comandos del proveedor y cero escrituras directas Firestore. No volver a diagnosticar `SESSION_1_AUTH` como bloqueo vigente ni conceder un PASS a todo C09/C10 por la coincidencia del XLSX. La fuente `235d6` ya contiene la reparación probada de fechas y requiere comprobación operacional después de su publicación. El mismo recibo conserva además `ENVIRONMENT_FAILURE:C09_C10_UNEXPECTED_NETWORK_REQUEST`, con 13 solicitudes denegadas. Conservar su diagnóstico preciso y corregir sólo la causa demostrada si persiste; esos bloqueos no se atribuyen automáticamente al defecto PDF. Las comprobaciones finales de claims, lectura servidor y estabilidad financiera siguen sin acreditación completa.

Academia obtuvo `PASS_D08_CURRENT_PAIRED_DEV_REQUEST_PREFLIGHT` en `1691`, con cero escrituras y cero ciclos de rol nuevos. Su transporte publicado en `99464bf` permite vincular las generaciones Google al job D08 existente; publicar el transporte no acredita que el ciclo haya terminado. Debe recuperarse cualquier intento ya iniciado y su journal antes de iniciar otro. La aceptación previa del banco, D06/B4 y las limpiezas verificadas permanece válida.

El corte exacto está en `CXORBIA_I3_GOOGLE_HANDOFF_20261125.json` y en `currentFunctionalEvidenceIndex` del descriptor. Los dos primeros resultados Google de Finanzas se conservan como historia de esos intentos, no como órdenes vigentes.

## Mecanismo de publicación y trabajo paralelo

ChatGPT directo es escritor principal conforme al addendum prevalente. Work y Codex no son prerrequisitos técnicos. La inspección de Gravicentra confirmó una ejecución Google autenticada, con código fijado, identidad de servicio, artefactos nativos y readback; no convierte un UUID o un texto `SUCCESS` en certificación.

Paula ya autorizó las publicaciones DEV pendientes mediante Google. La sesión Chrome conectada se comprobó en esta reanudación. La pestaña DEV pertenece a la otra sesión Work y se dejó en su poder. No iniciar un segundo publicador ni retomar su terminal mientras ese intento sea suyo. La coordinación se hace por HEAD, solicitudes y recibos, preservando cambios concurrentes con parent esperado y compare-and-swap.

El bloqueo de facturación de Actions sigue documentado, pero no impide usar la vía Google autorizada. No iniciar otro intento Actions que no puede arrancar. La firma QA temporal que Work registró en `qaSignerWindow2` vence el 25-11-2026 a las 18:28:02 UTC, 12:28:02 Guatemala; su readback acredita el login utilizado. Una ejecución posterior debe comprobar su autoridad vigente; este corte no modifica IAM.

La extensión de continuidad se registra en `CXORBIA_I3_VRM374_EXTERNAL_EXECUTION_CONTINUITY_REPAIR_20261125.json`. Separa la identidad del ejecutor de la identidad HR `excel_online`, conserva el cursor numérico real de Actions y exige sucesión causal por recibo/predecesor/productor. Un resultado antiguo se archiva sin desplazar el vigente; un replay idéntico no duplica incorporaciones y un replay con bytes distintos se rechaza.

El soporte nativo Cloud Build es una entrada del consumidor existente. No crea otro workflow, publicador, candidata ni configuración de ejecución. Sólo admite una invocación Cloud Build cuando su productor ya contiene la configuración exacta, vinculada al job emparejado existente y a sus hashes. Sin esa configuración, esa entrada falla cerrada. El transporte Google Cloud Shell de Finanzas ya utilizado conserva su contrato propio; no demuestra por sí solo una materialización emparejada. La extensión queda probada localmente y pendiente de su primer recibo pareado nativo real. No declarar que el mecanismo entero está certificado de extremo a extremo.

## Evidencia acumulada que se conserva

Los seis dominios `MATCH`, B4/B5/B6/B7, D06/B4 y la evidencia histórica C3 conservan sus alcances exactos. Los contadores de dominios son inventario de owners, no 21 exámenes nuevos. Los bloques B4/B5/B6/B7 tampoco equivalen a las tareas B04/B05/B06/B07.

La HR original conserva la ventana anterior/actual/siguiente cuando existe, el histórico y la lectura explícita del periodo anterior. `CXORBIA_I3_MAKE_FOUR_SCOPE_READONLY_20261125.json` conserva cuatro pares de lecturas GT/HN, octubre/noviembre, con coincidencia y cero escrituras. No repetirse como si faltaran ni usarse para conceder ACK de escritura F3.

Los dos anticipos de Q7,300, total Q14,600, permanecen dos movimientos distintos. No crear un tercero, inferir un pago, una asignación de aplicación o una transferencia bancaria. C04/C05, sus replay y sus limpiezas siguen acreditados en su alcance. La aceptación parcial no se convierte en cierre financiero completo.

Los mapas existentes vinculan los contratos originales y sus residuos:

- `CXORBIA_I3_B_PROCESS_EVIDENCE_MAP_20261125.json` y `CXORBIA_I3_A_E_CUMULATIVE_CLAUSE_MAP_20261125.json`.
- `CXORBIA_I3_C_D_CUMULATIVE_EVIDENCE_MAP_20261125.json` y `CXORBIA_I3_FUNCTIONAL_EVIDENCE_BINDINGS_20261125.json`.
- `CXORBIA_I3_ACCEPTED_SCOPES_MINIMAL_READBACKS_20261125.json`.
- `CXORBIA_I3_E04_SCOPED_PROGRESS_RECONCILIATION_20261125.json` y `CXORBIA_I3_RUN2537_E05_NORMALIZED_ACCEPTED_SCOPES_20261125.json`.

Esos mapas evitan repetir evidencia aceptada. No convierten un vínculo ausente en una prueba fallida ni crean nuevos jobs. La reparación previa de E04/F09, E05/RUN2537, D01, A08 y el diagnóstico financiero ya se conserva en VRM-377; no rehacerla.

## Pendientes originales y siguiente acción exacta

1. **Work: recuperar primero cualquier resultado activo de Academia.** Incorporar start, resultado, identidad, journal y limpieza por sus referencias reales antes de otro write. Completar únicamente los roles, vistas y acciones de D08 todavía no cubiertos.
2. **Publicador único: materializar `235d6` por la secuencia emparejada actual.** Establecer el binding real del ejecutor utilizado y su admisión, comprobar que no hay resultado pendiente sin incorporar y preservar el recibo del predecesor. Exigir source/tree, digest/revisión runtime, versión Hosting, archivos servidos y HR del mismo alcance.
3. **Finanzas: comprobar la reparación sobre esa materialización.** PDF nativo, dashboard, lectura final y dos sesiones independientes; conservar el XLSX y las lecturas ya acreditadas. Resolver sólo las cláusulas originales pendientes de permisos, elegibilidad, soporte e identidades enumeradas.
4. **F3: usar el fixture aislado y los owners existentes.** ACK remoto, lectura independiente, replay con pérdida de respuesta, orden por campo, conflicto/eco, restauración y limpieza. No inferir respuesta remota ni limpiar mientras el resultado siga incierto. El conteo Make se obtiene de las ejecuciones del escenario existente, sin ejecutar otro escenario para fabricar el readback.
5. **Otros procesos originales:** A07 perfil/privacidad y ACK; las dos excepciones Auth A08 y denegaciones exactas aún no acreditadas; B09 cámara/archivo/GPS; B10 cuestionario válido; D07 ciclo PDF; E09 acciones Marketing; E10 fixture autorizado de importador sin reimportar datos reales; y los residuos de interfaz/contexto de la matriz viva. No lanzar una reauditoría general. La atribución histórica B01 requiere evidencia de su actor/fecha originales, no una lectura actual sustitutiva.
6. **E08 correo:** resolver configuración/proveedor autenticados y acreditar ACK externo dentro de la autorización existente. Una consulta de metadatos denegada no demuestra ausencia de una clave; ningún envío, recepción o respuesta se declara probado sin su recibo.
7. **Cierre:** vincular la evidencia por los procesos empresariales originales; completar C3/Gate20/Gate21 con el mismo artefacto cuando estén satisfechos contratos y P0. Con I3 en GO, presentar a Paula ese artefacto para autorización productiva I4. Desplegar exactamente sus bytes, sin rebuild, verificar y crear `PRODUCTION_LOCK`.

Finanzas, Academia y F3 no equivalen por sí solos a toda Fase A. Ninguna ampliación de la instrumentación concede un PASS empresarial. La próxima conversación empieza desde estos recibos y el HEAD vivo, conserva lo aceptado y actúa sólo sobre el siguiente pendiente demostrado.

## Verificación de este corte

El recibo de reparación enumera archivos permitidos, reproducciones antes/después, pruebas integradas, hashes y sus límites. El guard canónico verifica la candidata y continuidad; no certifica el producto. La comprobación pública 48/48 tampoco acredita sesiones ni HR actuales. Este trabajo paralelo no despliega DEV o producción ni escribe datos empresariales. Un commit de control `[skip ci]` conserva el avance durante el bloqueo de Actions y no sustituye el gate pendiente.
