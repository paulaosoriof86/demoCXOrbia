# RESUMEN PARA CLAUDE — addendum Corte 5 post-compare P0

Fecha: 2026-07-30

## Decisión
`P0_PROVEN_C5_CXDATA_PERIOD_MODEL_MISMATCH`.

Este P0 NO requiere nueva candidata frontend.

## Qué está bien y no se debe reabrir
- Corte 3 V182 FROZEN.
- R17N DEV materializado 1,406/1,406 y readback 1,406/1,406.
- Provider compare 1,406/1,406 rutas presentes.
- Backend canónico tiene proyecto padre `cinepolis`, 14 periodos, 616 visitas, 572 controles y 77 certificaciones.
- Identidad: 208 refs → 194 perfiles canónicos únicos esperados; 616 visitas con nombre real; placeholders demo 0.

## P0 localizado fuera de módulos UI
Archivo: `app/core/backend-firebase.js`.

El adapter sigue leyendo documentos de `tenants/tya/projects` como si cada uno fuera un periodo. No lee `tenants/tya/projects/cinepolis/periods`.

Resultado del smoke:
- source Firestore / no fallback / 616 visitas: PASS;
- periodos CX.data: 30 vs 14 canónicos;
- currentPeriodId: `cinepolis`, inválido como periodo.

## Claude no debe hacer
- no crear V183/R33 ni nueva candidata;
- no tocar selector o módulos para ocultar/corregir el backend;
- no duplicar periodos en UI;
- no cambiar datos Firestore;
- no volver a modelo mes=proyecto;
- no deduplicar shoppers por nombre.

## Qué se hará backend
Solo con autorización expresa de Paula: patch focal del adapter, re-smoke read-only, validación operativa y freeze Corte 5.

## Academia
Proyecto padre y periodo deben explicarse como objetos distintos. La prueba también debe enseñar que readback de DB no sustituye el smoke del consumidor runtime.
