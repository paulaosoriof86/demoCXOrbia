# Cambios - Empalme controlado V91 Batch 3 P0 copy guard

Fecha: 2026-07-08  
Bloque: ampliar production-copy-guard para residuos V91  
Estado: completado parcial, seguro y documentado.

## Archivo actualizado

1. `app/core/production-copy-guard.js`
   - Se amplio la matriz de reemplazos visibles para residuos P0 detectados en V91.
   - No hace llamadas de red.
   - No escribe backend.
   - No activa proveedores.
   - No corrige fuente de modulos; solo protege copy visible.

## Decisiones

- Se mantiene el guard porque ya era una proteccion viva del PR.
- Se amplia para acelerar Phase A sin reemplazar modulos grandes a ciegas.
- Se documenta claramente que esto no cierra limpieza fuente modulo por modulo.

## Pendientes derivados

- Limpieza permanente en modulos fuente cuando se aborde batch especifico.
- Smoke visual de toasts/modales/innerHTML.
- Revisar Finanzas/Pagos y Academia porque aun pueden necesitar ajustes estructurales, no solo copy.

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
