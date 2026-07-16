# AUDITORÍA DELTA — CANDIDATA EXTERNA V132 / INTERNA V145

Fecha: 2026-07-15

## Identidad

- Archivo recibido: `Prototype development request V132.zip`.
- SHA-256: `864609e3760b5979e3db0abeea167497324ca0fceb8bc1d76983bdcaeed2c063`.
- Identidad interna: V145.
- La diferencia de numeración no es bloqueante.
- Baseline protegida: V131 + hotfix R18D reconciliado.

## Validaciones ejecutadas

- Manifest V145: 194 archivos, aggregate `d631efd5d6b317f9bcd750d89fc760bc6d02b15dc6f2622f0f8c3d4e43275c13`, 0 diferencias.
- JavaScript: 66 archivos, 0 errores de sintaxis.
- Delta interno V132→V145: 15 archivos runtime modificados, más reportes/manifests.
- Auditoría semántica contra paquete R19 y reconciliaciones activas.

## Atendido

- Fuente única `visitBucketFns` y `visitFacets`.
- Semántica ortogonal de estados y `Pend. realizar`.
- Paridad KPI/detalle en Dashboard, Visitas y Mi Día.
- Postulaciones por periodo activo.
- KPI Shoppers por ventana de seis meses y referencias protegidas separadas.
- Dashboard Financiero sin edición de rubros ni series históricas sintéticas.
- Separación parcial proyecto/periodo en Shopper y Cliente.
- Frecuencia y periodo de medición parciales en wizard.
- Uso del prompt PWA cuando el usuario pulsa instalar.

## Bloqueadores críticos

1. No existe contrato canónico `measurementWindowId/measurementWindowLabel` ni columna `Periodo de medición` en detalles/listados/exportaciones.
2. El Gate de cambio MAY/JUN/JUL no fue ejecutado contra el runtime source-safe; la candidata no prueba que todos los módulos cambien en el mismo ciclo.
3. Configuración de proyecto/tenant/HR incompleta: faltan URL HR externa, mapping contract, modo de sincronización, configuración completa por país y ruta administrativa verificable.
4. PWA no abre el prompt en la primera interacción elegible; solo lo hace al pulsar el control de instalación.
5. Regresión protegida: `core/finanzas-core.js` vuelve a usar `data.period()` dentro de `porPais()`. La baseline exige `data.project()` y `period()` únicamente en el adapter local de `serieMensual()`.

## Decisión

`HOLD_CRITICAL_CORRECTIONS_REQUIRED_NO_EMPALME`

No se empalma esta candidata completa. No se reabre V131 ni se ejecuta una auditoría general adicional. Se emitió paquete Claude exclusivo con los cinco críticos restantes.

## Siguiente paso

Claude corrige exclusivamente los bloqueadores, entrega candidata completa derivada de V145 y se ejecuta:

`delta focalizado → gates semánticos → empalme reconciliado → Hosting DEV → validación visual Paula → FROZEN`.
