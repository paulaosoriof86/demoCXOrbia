# Prompt de ejecución para Claude — Corte 2A

Trabaja exclusivamente sobre la candidata incremental de CXOrbia TyA para `CORTE 2A — CICLO SHOPPER Y OPERACIÓN CANÓNICA`.

Lee primero, en este orden:

1. `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`.
2. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`.
3. `app/docs/VALIDACION-VISUAL-Y-LOCK-ANTI-REGRESION-CORTE1-M1-20260722.md`.
4. `backend/contracts/phase-a-corte2a-shopper-operation-canonical-v1.json`.
5. `app/docs/PAQUETE-CLAUDE-CORTE2A-CICLO-SHOPPER-OPERACION-CANONICA-20260722.md`.
6. `app/docs/RESUMEN-PARA-CLAUDE-ADDENDUM-INICIO-CORTE2A-20260722.md`.
7. `app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-INICIO-CORTE2A-20260722.md`.

Baseline funcional congelado que debes preservar: `67c0943260f076f5686284ac509458ed5fd34dbd`.

No reconstruyas M1, no reinterpretas la HR, no crees otra arquitectura, rama o PR, no hardcodees periodos/conteos y no actives writes reales.

Modifica de forma localizada:

## 1. `app/modules/visitas.js`

- Usa facets canónicas para estado visible, filtros, detalle, drilldowns y exportación.
- No uses `v.estado` crudo como única verdad.
- Mantén separados asignación, agenda, ejecución, cuestionario, submitido, liquidación y pago.
- Muestra `Pendiente de fuente` o `—` cuando el honorario/importe no exista; muestra cero solo si la fuente confirma cero.
- Incluye `sourceRevision` en exportaciones y usa exactamente la misma proyección visible.

## 2. `app/modules/postulaciones.js`

- En Reasignar, muestra shopper, fecha y franja actuales.
- Exige una opción explícita: `Conservar fecha`, `Cambiar fecha` o `Pendiente de agendamiento`.
- Nunca borres, inventes o cambies fecha/franja silenciosamente.
- Implementa Exportar para el alcance filtrado visible y periodo activo, incluyendo revisión de fuente.
- Nunca muestres `undefined`, `null` ni literales técnicos.
- Sustituye `HR sincronizada` por copy honesto de modo read-only; no ejecutes writes reales.

## 3. `app/core/tya-phase-a-source-safe-preview.js`

Solo si es indispensable para el falso cero:

- preserva ausencia como `null` en `honorario`, `boleto` y `comboAmt`;
- no alteres IDs, periodos, facets, shoppers, sourceRevision ni contratos.

Antes de entregar, ejecuta y reporta:

- `node tools/qa/tya-corte1-m1-regression-lock.mjs`
- `node tools/qa/tya-corte2a-shopper-operation-canonical-gate.mjs`
- todos los gates R20/contexto/reportes/proyecto-periodo ya obligatorios;
- verificador/manifest/build-lock de la candidata.

La candidata solo puede declararse lista si:

- todos los gates de M1 siguen PASS;
- el gate Corte 2A queda PASS;
- no existe `location.reload()` nuevo;
- no hay conteos ni periodos hardcodeados;
- no hay writes reales ni promesas falsas de sincronización;
- el delta está localizado y documentado por archivo.

Entrega una única candidata incremental con:

- inventario de archivos tocados;
- justificación exacta por archivo;
- resultados de gates;
- manifest/build-lock/verificador;
- pendientes P1/P2 separados;
- confirmación de cero cambios fuera de alcance salvo dependencia demostrada.

No solicites otra candidata ni replantees metodología. La recepción posterior será `EXECUTION_LANE_READY → auditoría incremental → GO/P0_PROVEN → APPLY_DELTA_DIRECTLY` sobre la rama viva existente.
