# CXOrbia TyA — Corte 3 Hosting DEV remote smoke HOLD y causa raíz

**Fecha:** 2026-07-24  
**Estado:** `HOSTING_DEPLOYED_REMOTE_SMOKE_HOLD_RESOLVED_PENDING_SMOKE_ONLY`  
**Run:** `30098823043`  
**Job:** `89499452079`  
**Artifact:** `8598747476`  
**Digest:** `sha256:88d201f834ce1237384de5c916f8cce65442e4255a710e58a9ade64e3707b016`

## 1. Resultado real del segundo intento

El carril completó exitosamente:

- autorización y source head exactos;
- gate de preservación V174 R24;
- endpoint HR live previo: 14 periodos y 616 visitas;
- overlay live HR R22;
- overlay financiero canónico R24;
- **deploy de Hosting DEV exitoso**;
- propagación del HTML remoto;
- coincidencia del build-lock remoto;
- endpoint HR remoto listo con 14 periodos y 616 visitas;
- carga remota de snapshot y adapter financiero canónico;
- readiness de UI y finanzas sin errores de página, consola o requests.

El build de Corte 3 sí quedó publicado en Hosting DEV. El HOLD ocurrió únicamente en el gate posterior al deploy.

## 2. Evidencia funcional remota antes del HOLD

La evidencia remota confirmó:

- `visibleReady=true`;
- `financeReady=true`;
- 209 liquidaciones exactas globales;
- 79 revisiones de vínculo;
- 0 pagos y 0 lotes;
- mayo 2026: 44 visitas HR;
- 42 filas financieras exactas;
- 2 filas operativas pendientes de conciliación;
- 0 diferencias de montos;
- 32 filas exactas GT y 10 HN;
- dashboard y exportación visibles;
- reporte con 2 filas, 8 columnas y 2 puntos de gráfica;
- Beneficios con honorarios, reembolsos, por cobrar y pagado;
- shopper controlado con 3 liquidaciones y 0 pagadas.

## 3. Causa raíz reproducible

El gate técnico R23 fue diseñado y aprobado sobre el snapshot congelado de `index-backend-dev.html`. En ese entorno, `CX.liq.forProject()` devolvía únicamente las 42 filas financieras exactas del periodo.

En el runtime HR live, las dos visitas sin vínculo exacto sí contienen estado operacional suficiente. El adapter financiero las expone deliberadamente como:

- `financialSourceStatus=pending_or_review`;
- `liquidationState=pending_financial_source`;
- `paymentState=pending_source_confirmation`;
- `paymentConfirmed=false`;
- `reviewRequired=true`.

Por ello, la colección remota contiene 44 filas: 42 exactas + 2 revisiones fail-closed. El gate R23 conservaba una expectativa específica del snapshot congelado:

`liquidationCount === periodSnapshotCount`

La ejecución remota produjo `44/42` y el gate se detuvo, aunque todas las guardas financieras y de pago estaban correctas.

Causa raíz:

`FROZEN_SNAPSHOT_GATE_CONFLATED_EXACT_CANONICAL_ROWS_WITH_LIVE_FAIL_CLOSED_REVIEW_ROWS`

No se trata de un P0 del runtime. Las dos filas adicionales no son canónicas, no están pagadas, no pueden entrar a lote y permanecen identificadas para revisión.

## 4. Corrección focalizada

Se creó el gate específico de runtime live:

- `tools/qa/tya-corte3-remote-live-finance-smoke-r25-gate.mjs`.

Este exige:

- 44 visitas HR;
- 42 filas financieras exactas;
- exactamente 2 filas no exactas visibles solo como revisión fail-closed;
- 0 pagos;
- 0 diferencias de montos;
- 32 GT / 10 HN exactas;
- dashboard, export spec y Beneficios conectados;
- shopper sin pagos fabricados.

El workflow existente recibió modo `remote_smoke_only`. Como Hosting ya fue desplegado correctamente, la siguiente ejecución no vuelve a desplegar: verifica los mismos bytes remotos, build-lock, endpoint HR y gate R25.

## 5. Método de continuación

No se reejecuta el deploy ni el run fallido. Se emite una solicitud aislada con:

- `executionMode=remote_smoke_only`;
- nuevo `requestId`;
- source head exacto;
- misma autorización vigente;
- cero deploy adicional, Cloud Run, producción, merge, imports, pagos o writes.

## 6. Clasificación

- **Reusable CXOrbia:** gates diferenciados para snapshot congelado y runtime live con revisiones fail-closed.
- **Exclusivo cliente:** conteos TyA/Cinépolis.
- **Claude/prototipo:** sin cambio de módulos; el comportamiento de revisión es correcto y no requiere parche visual.
- **Academia:** diferenciar fila financiera exacta de fila operacional pendiente de conciliación.
- **Sin impacto Claude:** gate R25, modo smoke-only y evidencia.

## 7. Estado seguro

Hosting DEV actualizado; sin producción, merge, Cloud Run deploy, imports, pagos, Firestore/Auth/Storage/HR writes, Make ni Gemini. Corte 3 sigue pendiente de smoke remoto PASS y validación visual de Paula.
