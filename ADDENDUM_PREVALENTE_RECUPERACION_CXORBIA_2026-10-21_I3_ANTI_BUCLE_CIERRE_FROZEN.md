# CXOrbia Recovery — addendum operativo I3 anti-bucle y cierre verificable (CONGELADO)

**Fecha:** 2026-10-21. **ID:** CXORBIA-I3-EXIT-DISCIPLINE-20261021. **Estado:** FROZEN_COMPLEMENTARY_I3. **Iteración:** I3 HOLD. **Producción:** DO_NOT_TOUCH.  
**Autoridad:** complemento operativo de `00_LEER_PRIMERO_PLAN_CONGELADO.md` (V1.1, 16-10-2026), Addendum de Recovery y Plan Rector. **No es otro plan, etapa, auditoría general, rama, candidata o método de composición.**

## 1. Decisión de Paula y cambio BEFORE / AFTER

**Problema demostrado:** tras RUN1812 PASS, `CXORBIA_RECOVERY_EXECUTION_CURRENT.json` retenía RUN1809 y `CXORBIA_I3_CANONICAL_CANDIDATE_DESCRIPTOR_2026-09-24.json` retenía RUN1796. La matriz V159 y el ledger V487 de RUN1812 estaban preparados como objetos Git pero ausentes de la rama canónica. Asimismo, el banco de octubre publicado no se mostraba al Shopper por un evento de HR no atendido; source RUN1811 PASS y DEV RUN1812 PASS aún no prueban E2E real. Las tres visitas A09/B11 siguen con revisión persistida anterior, y Work no encontró recibos HR en `tenants/tya/commandReceipts`.

**BEFORE:** coexistían source, RUN desplegado, descriptor, puntero y matrices con diferentes tiempos de actualización; el PASS del runner podía confundirse con cierre humano de funcionalidades; repetición de diagnóstico sin ejecutar siempre el último paso de persistencia y verificación.

**AFTER (obligatorio):** un único registro de materialización exacta y sellada informa simultáneamente descriptor, puntero, ledger, matriz y recibo de RUN; la guardia canónica existente rechaza su divergencia cuando se anuncia DEV materializado. Cada módulo progresa únicamente por evidencia del siguiente estado real, no por número de commits ni cantidad de pruebas. Cada defecto permanece dentro de I3 y su owner, con readback completo. RUN1812 queda como DEV servido hasta evidencia de un cambio posterior.

**Autoridad de ejecución:** ChatGPT directo es el escritor técnico primario según addendum 10-09, un solo escritor por intento. Codex, si Paula lo solicita o surge impedimento probado, sustituye al escritor en ese intento; Work es **QA autenticada read-only**, no modifica repositorio ni datos. La revisión humana es incremental por bloque E2E probado; Gate20/Gate21 finales e I4 siguen exigidos.

## 2. Invariantes congelados y guardias

1. **Un source / un DEV / un puntero.** `HEAD` de control NO equivale a source certificada. Tras un deploy DEV PASS, antes de declarar la candidata revisable, source SHA/tree, TAR SHA-256, Hosting version/release, runtime revision/digest, ruleset, HR revision y RUN ID deben estar vinculados en el mismo recibo, descriptor y puntero, y citados por matriz/ledger vigentes. Si falta lectura: `HOLD`, `RELEASE_COMPOSITION_FAILURE` o `ENVIRONMENT_FAILURE` según owner probado, no PASS.
2. **Gates son distintos.** `SOURCE_PROVEN` → `DEV_MATERIALIZED` → `LIVE_E2E_PASS` → `HUMAN_PASS` → Gate20/Gate21 → I3 GO. Un job `SUCCESS` que ejecutó sólo source-guard + deploy NO convierte los demás gates `skipped` en PASS.
3. **Cierre funcional transaccional.** Ante persistencia: request → provider ACK → receipt/intent/effect → readback fuente y destino → recarga y otro rol → no duplicados. Un `GET` HR, source fix, preview correcto o evento UI no prueba un write reconciliador.
4. **La misma revisión externa.** Los campos HR-managed, disponibilidad, visitas, asignación e indicadores deben contrastarse contra revisión viva independiente igual; no se reimporta la HR, no se copia legacy, no se borra historia ni se crea un segundo estado local autoritativo.
5. **No reabrir PASS** sin drift reproducible del owner o dependencia exactos. Mantener 82 tareas, 21 dominios, 275 VRM conocidos al congelamiento y todas las observaciones históricas; una nueva incidencia se agrega de modo monotónico a su contrato actual.
6. **Circuit breaker por FAIL.** Una vez demostrado `SOURCE_FAILURE`, `MAPPING_FAILURE`, `PROVIDER_FAILURE`, `PERSISTENCE_FAILURE`, `AUTH_FAILURE`, `FUNCTIONAL_DEFECT`, `VISUAL_DEFECT`, `RELEASE_COMPOSITION_FAILURE` o `ENVIRONMENT_FAILURE`, se acota owner/archivo/versión/registro y se corrige en la misma iteración; se repite solo el gate afectado. Si no hay precondiciones o ACK, STOP/HOLD con bloqueo específico, **no** otra auditoría, overlay, workflow, rama, candidato, Firebase, rebuild rutinario ni reimport.
7. **Límite WIP y agilidad.** Un solo paquete de escritura activo; después de source PASS y DEV PASS, terminar su QA/Work y recibir hallazgos antes de volver a materializar por rutina. Paralelizar únicamente lecturas/QA independientes ya autorizadas sobre el mismo DEV; no abrir otro dueño de cambios. Evidencia ya probada se reutiliza. Cada respuesta informa qué contrato pasó en la vida real, qué falta y la siguiente acción exacta.
8. **Revisión de rendimiento.** En cada Work de bloque medir con marcas temporales observables: carga inicial, login, selección proyecto/período, actualización/sincronización, módulo al render y cambio entre roles. Reportar muestras y condiciones; no declarar `rápido` ni `lento corregido` sin mediciones comparables. Investigar solo owner asociado si hay defecto reproducible.
9. **Verificación mecánica obligatoria.** El guard actual de candidata comprueba integridad del sello post-deploy; si el puntero/documentos divergen falla el gate, no activa un camino paralelo. El sello se actualiza solamente con materialización certificada y readback; un nuevo source en desarrollo conserva el último DEV conocido marcado explícitamente como predecesor, sin simular que está servido.
10. **Work con preview exacto.** Cada entrega de QA debe incluir URL, `tenantId/projectId/periodId`, RUN, source SHA, Hosting version, rol, casos expected/observed, persistencia, notificaciones, identidad, capturas/tiempos y límites. Work no crea/edita/paga/reconcilia en datos reales; operaciones sintéticas destructivas solo en datos descartables y con autorización exacta.

## 3. Cola única inmediata, sin cambiar la estructura del Plan V1.1

**Bloque A — Convergencia control:** sellar RUN1812 en descriptor, pointer, matrix V159, ledger V487 y recibo, verificar guard; no deploy nuevo.

**Bloque D04 / VRM-275 — QA de la candidata ya publicada:** Work en DEV RUN1812, Shopper autenticado, Cinépolis octubre. Ver banco publicado de 8 preguntas, no mostrar banco septiembre pendiente; contrastar Admin y reload. Si falla, entregar ruta, condición y owner exactos; NO regenerar/publicar bancos por suposición.

**Bloque A09/B11 — Persistencia:** readback focal de ausencia de recibos `hr-*` en `tenants/tya/commandReceipts` versus código `hr.snapshot.reconcile`. Separar lectura de la HR de write explícito. En la conversación técnica, antes de cualquier reconciliación DEV con datos existentes, probar identidad admin autorizada, expectedVersion/revisión vigente, scope `tya/cinepolis`, idempotency, ausencia de lock/conflicto, efectos previos, plan de no duplicados y readback. Work NO la ejecuta.

**Cola restante sin rehacer auditorías:** B05–B09/B13 (asignación, postulación, reservas, GPS/Storage, notificaciones), C02–C10 (finanzas y pagos), B10 (cuestionario proveedor), asistente multiproyecto, identidad GT/HN y superficies Admin/Shopper, E visual, Gate20, Gate21; cada uno con ruta/rol/ACK según contrato aprobado. No reclasificar un `SOURCE_PROVEN` como `LIVE_E2E_PASS`.

**Salida permitida:** I3 GO únicamente con módulos PASS funcional/humano y fingerprint del mismo artefacto. I4 solo con autorización expresa de Paula. Producción `https://tya-plataforma.web.app/` permanece LEGACY_ORACLE/DO_NOT_TOUCH.

## 4. Precedencia y supersesión

Este anexo solo refuerza cierre operativo y control de estado. Preserva íntegro el plan I0–I4, los cierres históricos, el source de RUN1812 y la matriz de tareas 82. Si se modifica, se necesita evidencia nueva reproducible, autorización aplicable, BEFORE/AFTER y otro addendum monotónico; **nunca editar retroactivamente este congelado**.
