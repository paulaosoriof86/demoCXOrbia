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

- Se conservó `data.project()` en `porPais()` y se agregó `period: () => p` únicamente al adapter local de `serieMensual()`.
- No se importó el build-lock/manifest V132 del paquete aislado.
- Finanzas, Shoppers y Certificación renderizan sin errores.
- 14 periodos, 616 visitas, 44 visitas en JUL 2026 y 216 shoppers.
- 196 controles financieros exactos y 92 casos en revisión.
- 216 shoppers en HOLD de certificación.
- 0 pagos, lotes o certificaciones confirmadas.
- Workflow PASS: `29437465036`.

### R18E — Firebase Hosting DEV controlado

Estado: **PASS_HOSTING_DEV_V131_R18D_REMOTE_VERIFIED**.

- Proyecto Firebase: `cxorbia-backend-dev`.
- Target Hosting: `cxorbia-dev`.
- URL: `https://cxorbia-backend-dev.web.app/index.html?cxTyaPhaseA=1&r18d=visible`.
- Build: `v131-r18d-source-safe-20260715-r18e`.
- Commit exacto desplegado: `fe9a498863dd8454c174971781e8dbbb606a3131`.
- Firebase Hosting version: `projects/87461567267/sites/cxorbia-backend-dev/versions/32e865ce08af0d99`.
- Workflow PASS: `29442279729`.
- Proof remoto coincide con V131 y aggregate `6e833331f5aa9ba9458ef0724756e72747352add3f8c6cc1fa327c96fadec348`.
- Smoke remoto: 14 periodos, 616 visitas, 44 visitas activas, 216 shoppers, 196 controles financieros y 92 revisiones.
- Finanzas, Shoppers y Certificación renderizados remotamente.
- 0 errores de consola/página, blockers o warnings.
- 0 producción, Firestore/Auth/Storage/HR writes, imports, Make, Gemini o pagos.
- Credencial temporal eliminada del runner.
- Workflow y autorización de uso único retirados; no queda deploy automático activo.

## Estado de continuidad

- V110 queda como referencia histórica anterior, no como baseline activa.
- V131 sigue siendo la baseline única.
- No se repite auditoría ni empalme de V131.
- No se reconstruyen HR, periodos, shoppers, importadores, R11D ni R14C.
- No se requiere otra candidata ni paquete Claude por R18D/R18E.
- La validación visual es el único paso abierto de este bloque.

## Siguiente bloque exacto

`R18E-VISUAL — VALIDACIÓN HUMANA DE HOSTING DEV`.

Validar únicamente:

1. Proyecto/periodo visible: Cinépolis, JUL 2026, 14 periodos y 44 visitas del periodo activo.
2. Shoppers: 216 referencias protegidas; registrar como P1 cualquier KPI que infiera activo/completo sin fuente.
3. Finanzas: módulo renderiza; 196 controles y 92 revisiones no deben presentarse como pagos confirmados.
4. Certificación: HOLD/pendiente de fuente; no pedir nuevamente ni mostrar aprobaciones inventadas.
5. Login, tenant, banderas, selector de periodo y textos visibles que Paula ya había reportado.

Después de la validación visual, el siguiente carril operativo será una autorización separada para materialización controlada en Firebase DEV; no se ejecuta automáticamente.

## Bloqueos externos vigentes

- Pagos: falta evidencia por ítem de fecha, lote y actor antes de `paid`.
- Certificaciones: fuente de carryover materializable todavía vacía.
- Firestore/Auth/Storage continúan sin writes hasta autorización separada.

## Restricciones

Sin producción, imports reales, Firestore/Auth/Storage/HR writes, Make/Gemini live ni pagos reales sin autorización específica.
