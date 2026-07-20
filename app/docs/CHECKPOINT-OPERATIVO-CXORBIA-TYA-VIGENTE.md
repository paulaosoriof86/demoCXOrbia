# CHECKPOINT OPERATIVO CXORBIA TyA - VIGENTE

Fecha: 2026-07-20
Estado: `CORTE_1_VISUAL_FAIL_LIVE_HR_RUNTIME_REQUIRED`

## Estado comprobado

- Rama: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Baseline activa: V161C/R21.
- V164 continúa integrada como candidata técnica de Corte 1, pero NO se congela.
- La validación visual de Paula detectó inconsistencias reproducibles entre KPI, detalle, reportes y cambio de periodo.
- Corte 2 continúa bloqueado.

## Causa raíz demostrada

El build V164 no usa la HR como verdad runtime viva:

1. `tools/release/tya-r21-build-and-gates.sh` descarga por defecto una copia ya publicada desde `FROZEN_SOURCE_URL` y la reutiliza como payload del build.
2. Ese mismo gate valida conteos operativos fijos del snapshot aprobado, por lo que un PASS técnico no demuestra actualidad de la HR.
3. El adapter generado declara expresamente `runtimeSyncActive:false`, `CX_TYA_HR_VIVA_SOURCE_SAFE=false` y `CX_TYA_HR_SNAPSHOT_SOURCE_SAFE=true`.

Por ello, los conteos documentados son evidencia histórica de una lectura, no valores que puedan fijarse para operación continua.

## Bloque en ejecución

`CORTE 1A — LECTURA HR VIVA SOURCE-SAFE EN RUNTIME + VERDAD CANÓNICA ÚNICA`

Creado:

- `backend/contracts/phase-a-live-hr-runtime-read-v1.json`.
- `tools/qa/tya-live-hr-read-probe-gate.mjs`.
- `.github/workflows/cxorbia-phase-a-live-hr-read-probe.yml`.

El probe:

- lee la HR actual;
- no usa conteos operativos fijos;
- valida frescura, llaves, privacidad y coherencia cuestionario/submitido;
- genera evidencia source-safe;
- no escribe HR, Firestore ni Storage;
- no importa, no despliega, no paga y no toca producción.

## Condición de salida

Corte 1 solo puede volver a validación visual cuando:

1. el probe read-only confirme la fuente actual;
2. exista endpoint server-side source-safe de lectura runtime;
3. `CX.data` cargue una única revisión viva al iniciar;
4. KPI, detalle, histórico y reportes consuman esa misma revisión y las mismas facets;
5. haya refresco por foco y sondeo controlado;
6. una fuente vencida se muestre como vencida, sin fallback silencioso a snapshot;
7. el build DEV exacto pase smoke y revisión visual de Paula.

## Siguiente paso exacto

`PROBE HR ACTUAL → ENDPOINT DEV READ-ONLY → ADAPTER ÚNICO CX.data LIVE → GATES DINÁMICOS → HOSTING DEV AUTORIZADO → VALIDACIÓN VISUAL`

## Estado seguro

Sin merge, producción, importación real, escrituras Firestore/Auth/Storage/HR, Make/Gemini live ni pagos. El endpoint y el redeploy DEV requieren gate y autorización separada antes de ejecutarse.
