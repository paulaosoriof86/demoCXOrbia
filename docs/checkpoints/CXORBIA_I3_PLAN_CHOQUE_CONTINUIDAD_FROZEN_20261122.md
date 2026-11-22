# CXOrbia Recovery — Lock de continuidad, sincronización y cierre I3

**Fecha de decisión:** 2026-11-22, Guatemala. **Estado:** `FROZEN_COMPLEMENTARY_I3`. **Alcance:** control documental y ejecución focal en la única rama `recovery/cxorbia-phase-a-20260831` de `paulaosoriof86/demoCXOrbia`. **I4:** no autorizada. **Producción:** `DO_NOT_TOUCH`.

## 1. Autoridad y límites
Este lock complementa, sin sobrescribir, el Addendum Recovery, sus addenda posteriores, el Plan Rector, el plan trazable I3/I4 V1.1 (82 tareas) y el ledger/matriz vivos seleccionados por `CXORBIA_I3_CANONICAL_CANDIDATE_DESCRIPTOR_2026-09-24.json`. No crea I5, otro proyecto/repo/Firebase, candidato, overlay, workflow, mecanismo de transporte, fuente de verdad ni segundo escritor. **Este documento no es un puntero de source/producto:** cualquier SHA aquí señalado representa una observación histórica de partida y jamás reemplaza la resolución dinámica en GitHub antes de escribir.

## 2. Evidencia de partida (observada, no ejecutada por este lock)
- HEAD/control observado antes de congelar: `6b0df94374a0af8e0494eea741da581cd8db0e37`; árbol `6c7b2618fae065a0c25f4f62890aaa3cfdaa6589`.
- Candidata en descriptor/puntero/matriz V373: `ea0def43f653b014a271d7404df5604f2a9e2805`; tree `062e702b1409fcf7bf7f6befa01742f469884227`.
- Auditoría C3 anterior conserva 6 de 21 dominios MATCH; 21/21 `sourceReady` **no es** aceptación integral. B4/B5/B6/B7 conservan aceptaciones ya documentadas. Gate20/Gate21: HOLD. No reabrir PASS sin drift reproducible.
- CI run 44826913298 bloqueó con `RELEASE_COMPOSITION_FAILURE:UNDECLARED_PRODUCT_DRIFT_AFTER_CANONICAL_CANDIDATE:app/core/router.js`; parche router HEAD aún no promueve source ni prueba 3/3 DEV. Pruebas focales de fuente 10/10 PASS no equivalen a live.
- Lecturas Make B14 Graph del 20/11: GT/HN doble HTTP 200, 140/140 filas y hashes iguales; la prueba original y DEV coteja 44/44 identidades, pero GT filas originales 29/37 difieren en estado de realización.
- Parser HR `tools/hr-source/tya-build-live-hr-source-safe-r20.mjs::parseTab`: filas 48,49,50,52 de conciliación pueden contaminar la interpretación de visitas. No hardcodear rangos/números de fila como regla global.
- B14 operativo sigue `external_read_only`, `hrWritesEnabled=false`, `liveMakeBindingPresent=false`; pruebas aisladas en Make no certifican el comando operativo ni justifican escribir HR real.
- Make asignaciones GT/HN legacy ya **activas**, programadas para 2026-11-23T16:00:00Z (10:00 Guatemala); B14 Graph es **activo on-demand**, no pendiente de encendido mañana. No adelantar escenarios legados con comunicaciones y writes reales; coordinar corte sin duplicidad.

## 3. Única regla de sincronización preventiva (no reparación repetitiva)
La única autoridad de la candidata es el descriptor canónico y su matriz/ledger seleccionados **como una misma transacción de control**; cualquier bloque promocionado debe aportar `expectedParentSha/tree`, allowlist owner, test SHA/receipts, source SHA/tree real, source-owner blob hashes, y registro BEFORE/AFTER con diff. Antes de escribir releer HEAD: si cambió, clasificar `SOURCE_FAILURE`, detener intento, resolver owner focal; no sobreescribir. No hacer product commit intermedio publicado a la rama y luego una reparación manual de 3 punteros: preparar producto + control como una sucesión de commits fuera del ref y actualizar una sola vez el ref remoto por `expected_sha` (CAS/fast-forward) cuando el paquete esté probado; no hay otra rama ni candidata.

El workflow canónico existente debe **fallar cerrado** ante: drift de producto fuera de source; descriptor/ledger/pointer/matrix discrepantes; owner blob vs source; release source diferente del servido; HR read revision distinta; prueba parcial presentada como aceptación completa; identidad/roles inconsistentes; Gate20 y Gate21 sin el mismo artifact/manifest; Make remote write sin ACK. Un FAIL nunca se repara editando punteros por conveniencia. La corrección siempre es en el owner probado y el recibo posterior; el guard permanece activo y no se deshabilita.

Históricos, capturas Work y pruebas pasadas sólo pueden acreditar su `scope` exacto y su propio source/DEV/provider revision. Los campos antiguos y los C3 preterminales son evidencia histórica inmutable; no equivalen a estado vivo. Cada nueva iteración reporta `GO|HOLD|NO_GO`, HEAD + product source + Hosting/runtime exactos, tareas completadas y porcentaje explícitamente etiquetado, 21 dominios con acreditación vigente, P0 exactos, cambios/NO cambios, pruebas realmente ejecutadas, siguiente acción y necesidad o no de autorización.

## 4. Trabajo focal, orden de dependencia y criterios de cierre

**F1 COMPOSICIÓN+NAVEGACIÓN** — P0 `RELEASE_COMPOSITION_FAILURE` owner control descriptor/ledger/pointer/matrix y `app/core/router.js`. Reconocer el cambio funcional focal ya testado 10/10; recuperar/promover exactamente un source sucesor aprobado y sus hashes sin falsear DEV. Ejecución de guard canónico PASS; publicación DEV controlada con comprobación de 3 casos GT11,GT12,HN06 que preserven vista+período+owner después de reload. El estado histórico C3 permanece histórico. Sin nuevo MATCH automático por tests locales.

**F2 HR/MAPPING** — P0 `MAPPING_FAILURE` owner `tools/hr-source/tya-build-live-hr-source-safe-r20.mjs::parseTab`; excluir sólo firmas verificadas de filas de cierre financiero, no visitas auténticas. Corregir/parificar estados reales GT filas 29/37 con misma revisión externa exacta y comparar 34 GT +10 HN. Verificar elegibles, disponibles y KPIs contra fuente independiente; 0 reimportaciones.

**F3 B14 PROVIDER ACK** — P0 `MAPPING_FAILURE` prerequisitos en `backend/contracts/hr-bidirectional-assignment-sync-v1.json`, provider Make y owners existentes. Mantener lectura Graph on-demand y las dos sondas aisladas como evidencia; localizar fixture **aislada, no operativa** y binding remoto autorizado por scope. Ensayar un comando asignación con ACK, readback independiente, pérdida de respuesta/replay, conflicto y eco, limpieza e idempotencia, 0 duplicados. No escribir libros productivos ni cambiar flags operativos antes de evidence PASS.

**F4 21 DOMINIOS** — reusar las evidencias focales válidas de Work y CI; certificar obligación por obligación, sin reabrir las 6 MATCH; cada dominio adicional requiere pruebas E2E/visual del mismo source/DEV/provider/contexto, readback y pase a MATCH. En paralelo, revisión DOM/visual de tablas, contrastes, responsive y tiempo de carga inicial; no aceptar CSS-only como visual PASS.

**F5 I3/I4** — Gate20 funcional, semántico y visual; Gate21 consume únicamente manifest y hashes del mismo TAR; emitir I3 GO sólo con 21 MATCH, cero P0, fingerprint íntegro y mismo artefacto certificado. I4 sólo con autorización específica para artefacto exacto; backup/rollback, deploy sin rebuild, smoke y `PRODUCTION_LOCK`.

**F6 ROLA** — no crear otro producto. Preparar proyecto multipaís dentro del mismo tenant/router: GT/HN/SV/NI, HR multioja por país, cuestionario TyAOnline externo por proyecto, 200–400 visitas/mes como parámetro variable, permisos por país y aislamiento Cinépolis. Vincular sólo documentos identificados con IDs/revisiones verificadas; sin reimportar y sin hardcode global. La habilitación operacional de ROLA exige P0 multiproyecto y B14 cerrados.

**F7 POSTPRODUCCIÓN** — primera operación, 24/72 horas, primer corte/período y 7 días; preservar Phase B existente; P0 de Fase A no se difiere.

## 5. Indicadores obligatorios, sin falsa equivalencia
- `certificacionesIntegrales`: **6/21 = 28.57%**, corte histórico comprobado V373; no cambia sin un nuevo receipt de dominio completo.
- `preparaciónSource`: 21/21 = 100% **en el corte V373**, no es GO ni significa frontend DEV actual.
- `P0sFocales`: 0/4 cerrados al crear el lock; 4 frentes concretos composición/navegación, parser/estados, B14, flujo transversal (se actualiza con pruebas).
- `tareasPlanV1_1`: no informar 0–82 como hecho completado sin leer sus receipts. Avance de gestión se informa separadamente de dominios y estado.
- `MakeB14Read`: GT/HN doble lectura PASS del 20/11; `MakeB14OperationalWrite`: HOLD, no atribuir PASS operacional.

## 6. Política documental de readback y autoría
No mutar este archivo congelado. Toda modificación posterior constituye una nueva adenda datada con causa/BEFORE/AFTER y SHA. Todo commit debe ser leído de regreso con parent, tree, changed paths, CI/receipts y estado de branch; un error en la escritura o pérdida de readback deja HOLD y no se atribuye éxito. Este lock documenta intención y compromisos, **no** declara ejecutadas reparaciones ni certificaciones.