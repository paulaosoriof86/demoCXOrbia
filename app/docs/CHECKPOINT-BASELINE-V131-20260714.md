# CHECKPOINT ACUMULADO — BASELINE V131

Fecha de actualización: 2026-07-15

## Baseline viva

- Versión: V131.
- Estado: aceptada, empalmada y con hotfix R18D reconciliado.
- Commit runtime original: `d5c04054d445723dd0bc9e48acbab75953a4b08b`.
- Commit hotfix runtime: `593cdb9cc815cfa14d257968026bf3de886efba1`.
- ZIP baseline SHA-256: `19424b2b709a4bff457454bbeff6abe47cd1c52c0f0388fd1a380008c8adc740`.
- ZIP hotfix SHA-256: `788a32a6d44e0686b0627a47e4e4e038fdbe7d3befd3dde2651ff542706918bb`.
- Manifest activo: `docs/MANIFEST-V131-R18D-HOTFIX-R1.json`.
- Aggregate derivado: `6e833331f5aa9ba9458ef0724756e72747352add3f8c6cc1fa327c96fadec348`.

## Bloques operativos cerrados

### Plan Firestore completo source-safe

Estado: **PASS**.

- 1,421 operaciones en 4 lotes.
- 14 periodos, 616 visitas, 216 shoppers y 572 liquidaciones candidatas.
- Cero writes, pagos inferidos o certificaciones inventadas.

### R18C — overlays existentes aplicados sin reproceso

Estado: **PASS_EXISTING_R11D_R14C_CERTIFICATION_OUTPUTS_APPLIED_TO_PLAN**.

- Plan `phasea_9f67df19a2b9cd2f`.
- SHA-256 `4701f7bf0cca578702f1e2415a2e9822daf8e6f06da1c4d53bd0d2d4c4865086`.
- 196 enlaces financieros exactos aplicados a visitas y liquidaciones.
- 92 revisiones financieras y 1 revisión shopper preservadas.
- 0 identidades inventadas.
- 0 pagos confirmados o inferidos.
- 0 certificaciones materializadas.
- R11D/R14C no fueron recalculados.
- Workflow PASS: `29424007188`.

### R18D — preview visible source-safe

Estado: **PASS_R18D_VISIBLE_OVERLAYS**.

Candidata recibida: `Prototype development request CXOrbia V131 fix.zip`, versión interna V132.

Auditoría focalizada:

- La candidata completa cambió únicamente `core/finanzas-core.js`, `core/build-lock.js` y agregó manifest/reporte V132 frente al paquete prototipo V131.
- El archivo funcional de la candidata incluía el fix requerido, pero también regresaba `porPais()` de `data.project()` a `data.period()` frente al runtime empalmado.
- Se promovió únicamente el cambio correcto: conservar `data.project()` en `porPais()` y agregar `period: () => p` al adapter local de `serieMensual()`.
- No se importó el `build-lock` ni el manifest V132 del paquete porque cubrían el árbol prototipo, no la unión runtime activa.
- Delta contra el checkpoint anterior: 1 archivo funcional y 1 ajuste CI para que R18D se ejecute ante cambios de Finanzas.

Validación automática R18D, workflow `29437465036`:

- 14 periodos únicos.
- 616 visitas y 44 en JUL 2026.
- 216 shoppers visibles.
- 196 controles financieros exactos como `pending_financial_review`.
- 92 casos financieros preservados en revisión.
- 1 revisión shopper y 1 revisión de certificaciones.
- 216 shoppers en HOLD de certificación.
- Financiero, Shoppers y Certificación renderizados.
- 0 errores de consola o página.
- 0 pagos, lotes o certificaciones confirmadas.
- 0 solicitudes automáticas repetidas de certificación.
- 0 writes, imports, deploy o producción.

## Estado de continuidad

- V110 queda como referencia histórica anterior, no como baseline activa.
- V131 sigue siendo la baseline única; el hotfix no abrió una baseline paralela.
- No se repite auditoría ni empalme de V131.
- No se reconstruyen HR, periodos, shoppers, importadores, R11D ni R14C.
- No se requiere otro paquete Claude para este P0.
- La candidata V132 de transporte no se copia como árbol completo; quedó reconciliada sobre la baseline empalmada.

## Siguiente bloque exacto

`R18E — FIREBASE HOSTING DEV CONTROLADO + VALIDACIÓN VISUAL HUMANA`.

Secuencia:

1. Obtener autorización explícita separada para deploy únicamente a Firebase Hosting DEV.
2. Construir la copia V131 source-safe con R18A/R18B/R18D.
3. Ejecutar predeploy y smoke automático del build exacto.
4. Desplegar solo Hosting DEV, sin Firestore/Auth/Storage writes, imports, HR writes ni producción.
5. Entregar a Paula URL exacta, build, perfil, módulos y valores esperados.
6. Registrar hallazgos visuales sin reabrir los bloques ya cerrados.

## Bloqueos externos vigentes

- Proyecto Firebase DEV nuevo y vacío: creación bloqueada por permisos/política del proveedor; no se reutiliza una base preexistente.
- Pagos: falta evidencia por ítem de fecha, lote y actor antes de `paid`.
- Certificaciones: fuente de carryover materializable todavía vacía.

## Restricciones

Sin deploy, producción, imports reales, Firestore/HR writes, Make/Gemini live ni pagos reales sin autorización específica.
