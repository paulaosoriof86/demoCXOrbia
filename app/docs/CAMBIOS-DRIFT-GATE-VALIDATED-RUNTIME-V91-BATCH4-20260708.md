# Cambios - Drift gate validated runtime V91 Batch 4

Fecha: 2026-07-08  
Bloque: actualizar SHA runtime validado del drift gate despues de empalme V91 Batch 4  
Estado: documentado y seguro.

## Archivo actualizado

1. `.github/workflows/cxorbia-rc-phase-a-drift-gate.yml`
   - Antes validaba contra `009c5958fed878a739b129916d1958ef22d4267b`.
   - Ahora valida contra `4e8088e9f57a9d0f7bb7c67a0549490f61b0f75a`.

## Archivos creados

1. `app/docs/DRIFT-GATE-VALIDATED-RUNTIME-V91-BATCH4-20260708.md`
   - Documento funcional del cambio.

2. `app/docs/CAMBIOS-DRIFT-GATE-VALIDATED-RUNTIME-V91-BATCH4-20260708.md`
   - Bitacora puntual.

## Causa raiz

El drift gate fallo porque seguia comparando contra un runtime validado anterior a V91. El head V91 Batch 4 ya habia pasado RC Smoke, Visual Smoke y Predeploy, por lo que correspondia actualizar el punto de comparacion del drift gate.

## Decision

No se desactivo el drift gate. No se amplio un allowlist generico para aceptar cualquier runtime. Se actualizo el SHA validado despues de gates exitosos.

## Estado seguro

- Sin deploy.
- Sin produccion.
- Sin merge.
- Sin import real.
- Sin pagos reales.
- Sin provider real.
- Sin Firestore/Auth/Storage real.
- Sin HR writes.
- Sin Make/Gemini real.
- Sin datos sensibles.
